/* eslint-env browser */
/* global fetch, confirm, URL, URLSearchParams */

// Convex is loaded via `browser.bundle.js`, which defines a global `convex` object.
// This file intentionally uses NO ES module imports to maximize compatibility.

const ConvexHttpClient = window.convex?.ConvexHttpClient;

function bootFail(message) {
  const statusBar = document.getElementById("statusBar");
  if (statusBar) {
    statusBar.textContent = message;
    statusBar.className = "status-bar show error";
  }
  // Also log for debugging.
  console.error(message);
}

if (!ConvexHttpClient) {
  bootFail("❌ Failed to load Convex client library. Ensure convex browser.bundle.js loaded.");
  throw new Error("ConvexHttpClient not available");
}

// Config
// Default to this project's Convex deployment.
// (Users can still override via the input field, localStorage, or ?convexUrl=...)
const DEFAULT_CONVEX_URL = "https://graceful-mouse-550.convex.cloud";

function normalizeConvexCloudUrl(rawUrl) {
  const trimmed = String(rawUrl || "").trim();
  if (!trimmed) return trimmed;
  // Queries/mutations must go to *.convex.cloud. HTTP actions live on *.convex.site.
  let u = trimmed.replace(/\.convex\.site\b/, ".convex.cloud");
  // Remove trailing slash
  u = u.replace(/\/+$/, "");
  return u;
}

function safeStorageGet(key) {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function safeStorageSet(key, value) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch {
    return false;
  }
}

function setConvexUrlQueryParam(nextUrl) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set("convexUrl", nextUrl);
    window.history.replaceState({}, "", url.toString());
  } catch {
    // ignore
  }
}

function getConvexUrlFromQueryParam() {
  try {
    const params = new URLSearchParams(window.location.search);
    const v = params.get("convexUrl");
    return v && v.startsWith("http") ? v : null;
  } catch {
    return null;
  }
}

function getConvexUrl() {
  return normalizeConvexCloudUrl(
    getConvexUrlFromQueryParam() || safeStorageGet("CONVEX_URL") || DEFAULT_CONVEX_URL
  );
}

let CONVEX_URL = getConvexUrl();
let client = new ConvexHttpClient(CONVEX_URL);

// State
let messages = [];
let requests = [];
let djMessages = [];
let nowPlaying = null;
let activeListeners = [];
let recentlyPlayed = [];
let refreshInterval = null;

// DOM Elements
const elements = {
  totalMessages: document.getElementById("totalMessages"),
  totalRequests: document.getElementById("totalRequests"),
  activeUsers: document.getElementById("activeUsers"),
  recentlyPlayedCount: document.getElementById("recentlyPlayedCount"),
  messageCount: document.getElementById("messageCount"),
  requestCount: document.getElementById("requestCount"),
  djMessageCount: document.getElementById("djMessageCount"),
  listenerCount: document.getElementById("listenerCount"),

  chatMessages: document.getElementById("chatMessages"),
  songRequests: document.getElementById("songRequests"),
  djMessages: document.getElementById("djMessages"),
  nowPlaying: document.getElementById("nowPlaying"),
  activeListeners: document.getElementById("activeListeners"),

  clearChatBtn: document.getElementById("clearChatBtn"),
  clearRequestsBtn: document.getElementById("clearRequestsBtn"),
  clearDJMessagesBtn: document.getElementById("clearDJMessagesBtn"),
  clearNowPlayingBtn: document.getElementById("clearNowPlayingBtn"),
  clearRecentlyPlayedBtn: document.getElementById("clearRecentlyPlayedBtn"),
  clearListenersBtn: document.getElementById("clearListenersBtn"),
  refreshBtn: document.getElementById("refreshBtn"),

  notificationTitle: document.getElementById("notificationTitle"),
  notificationBody: document.getElementById("notificationBody"),
  sendToAllBtn: document.getElementById("sendToAllBtn"),
  pushTokenStats: document.getElementById("pushTokenStats"),

  convexUrlInput: document.getElementById("convexUrlInput"),
  saveConvexUrlBtn: document.getElementById("saveConvexUrlBtn"),
  convexUrlDisplay: document.getElementById("convexUrlDisplay"),

  statusBar: document.getElementById("statusBar"),
};

function showStatus(message, type = "info") {
  if (!elements.statusBar) return;
  elements.statusBar.textContent = message;
  elements.statusBar.className = `status-bar show ${type}`;
  setTimeout(() => elements.statusBar && elements.statusBar.classList.remove("show"), 3000);
}

// Avoid spamming the status bar every 5s when a query is failing.
let lastStatusKey = "";
let lastStatusAt = 0;
function showStatusThrottled(message, type = "info", throttleMs = 8000) {
  const key = `${type}:${message}`;
  const now = Date.now();
  if (key === lastStatusKey && now - lastStatusAt < throttleMs) return;
  lastStatusKey = key;
  lastStatusAt = now;
  showStatus(message, type);
}

let consecutiveFailures = 0;
let lastFetchHadError = false;

function setConvexUrl(nextUrl) {
  CONVEX_URL = normalizeConvexCloudUrl(nextUrl);

  const stored = safeStorageSet("CONVEX_URL", CONVEX_URL);
  setConvexUrlQueryParam(CONVEX_URL);

  client = new ConvexHttpClient(CONVEX_URL);
  consecutiveFailures = 0;

  if (!stored) {
    showStatusThrottled("ℹ️ Browser storage blocked; saved Convex URL in page URL instead", "info");
  }

  if (elements.convexUrlDisplay) {
    elements.convexUrlDisplay.textContent = `Connected: ${CONVEX_URL}`;
  }
}

window.addEventListener("error", (e) => {
  const msg = e?.message || "Unknown error";
  console.error("Window error:", e);
  showStatusThrottled(`❌ ${msg}`, "error");
});

window.addEventListener("unhandledrejection", (e) => {
  const reason = e?.reason;
  const msg = reason?.message || String(reason || "Unknown error");
  console.error("Unhandled rejection:", e);
  showStatusThrottled(`❌ ${msg}`, "error");
});

function formatTime(timestamp) {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = String(text ?? "");
  return div.innerHTML;
}

async function safeQuery(name, args, fallback) {
  try {
    const result = await client.query(name, args);
    consecutiveFailures = 0;
    return result;
  } catch (err) {
    console.error(`Query failed: ${name}`, err);
    lastFetchHadError = true;
    consecutiveFailures += 1;
    showStatusThrottled(`❌ Query failed: ${name} (check Convex URL)`, "error");
    if (consecutiveFailures >= 3) {
      stopAutoRefresh();
      showStatusThrottled(
        "❌ Paused auto-refresh due to repeated failures. Verify the Convex URL and click Refresh.",
        "error",
        15000
      );
    }
    return fallback;
  }
}

async function safeMutation(name, args, fallback) {
  try {
    const result = await client.mutation(name, args);
    consecutiveFailures = 0;
    return result;
  } catch (err) {
    console.error(`Mutation failed: ${name}`, err);
    showStatusThrottled(`❌ Mutation failed: ${name} (check Convex URL)`, "error");
    return fallback;
  }
}

function renderNowPlaying() {
  if (!elements.nowPlaying) return;
  if (!nowPlaying) {
    elements.nowPlaying.innerHTML = '<p class="empty">Nothing playing right now</p>';
    return;
  }

  elements.nowPlaying.innerHTML = `
    <div class="now-playing-card">
      <img src="${escapeHtml(nowPlaying.albumArt)}" alt="Album Art" class="album-art" />
      <div class="song-details">
        <div class="song-title">${escapeHtml(nowPlaying.title)}</div>
        <div class="song-artist">${escapeHtml(nowPlaying.artist)}</div>
        ${nowPlaying.album ? `<div class="song-album">${escapeHtml(nowPlaying.album)}</div>` : ""}
      </div>
    </div>
  `;
}

function renderActiveListeners() {
  if (!elements.activeListeners) return;
  if (activeListeners.length === 0) {
    elements.activeListeners.innerHTML = '<p class="empty">No active listeners</p>';
    return;
  }

  elements.activeListeners.innerHTML = activeListeners
    .map(
      (l) => `
      <div class="listener-item">
        <span class="listener-name">👤 ${escapeHtml(l.firstName)}</span>
        <span class="listener-username">@${escapeHtml(l.username)}</span>
      </div>
    `
    )
    .join("");
}

function renderMessages() {
  if (!elements.chatMessages) return;
  if (messages.length === 0) {
    elements.chatMessages.innerHTML = '<p class="empty">No messages yet</p>';
    return;
  }

  elements.chatMessages.innerHTML = [...messages]
    .sort((a, b) => b._creationTime - a._creationTime)
    .map(
      (m) => `
      <div class="message-item">
        <div class="message-header">
          <span class="author">${escapeHtml(m.author)}</span>
          <span class="timestamp">${formatTime(m._creationTime)}</span>
        </div>
        <div class="message-text">${escapeHtml(m.text)}</div>
        <button class="btn-delete-small" onclick="deleteMessage('${m._id}')">🗑️</button>
      </div>
    `
    )
    .join("");
}

function renderRequests() {
  if (!elements.songRequests) return;
  if (requests.length === 0) {
    elements.songRequests.innerHTML = '<p class="empty">No song requests yet</p>';
    return;
  }

  elements.songRequests.innerHTML = [...requests]
    .sort((a, b) => b._creationTime - a._creationTime)
    .map(
      (r) => `
      <div class="request-item">
        <div class="request-header">
          <span class="requester">${escapeHtml(r.username ?? "Unknown")}</span>
          <span class="status-badge status-${escapeHtml(r.status)}">${escapeHtml(r.status)}</span>
          <span class="timestamp">${formatTime(r._creationTime)}</span>
        </div>
        <div class="song-info">
          <div class="song-title">🎵 ${escapeHtml(r.title ?? "")}</div>
          <div class="song-artist">by ${escapeHtml(r.artist ?? "")}</div>
        </div>
        <button class="btn-delete-small" onclick="deleteRequest('${r._id}')">🗑️</button>
      </div>
    `
    )
    .join("");
}

function renderDJMessages() {
  if (!elements.djMessages) return;
  if (djMessages.length === 0) {
    elements.djMessages.innerHTML = '<p class="empty">No requests yet</p>';
    return;
  }

  elements.djMessages.innerHTML = [...djMessages]
    .sort((a, b) => b._creationTime - a._creationTime)
    .map(
      (m) => `
      <div class="message-item ${m.read ? "" : "unread"}">
        <div class="message-header">
          <span class="author">@${escapeHtml(m.username)}</span>
          <span class="timestamp">${formatTime(m._creationTime)}</span>
          ${!m.read ? '<span class="unread-badge">NEW</span>' : ''}
        </div>
        <div class="message-text">${escapeHtml(m.text)}</div>
        <div class="message-actions">
          ${!m.read ? `<button class="btn-small btn-primary" onclick="markAsRead('${m._id}')">✓ Mark as Read</button>` : ""}
          <button class="btn-delete-small" onclick="deleteDJMessage('${m._id}')">🗑️</button>
        </div>
      </div>
    `
    )
    .join("");
}

function updateStats() {
  if (elements.totalMessages) elements.totalMessages.textContent = String(messages.length);
  if (elements.totalRequests) elements.totalRequests.textContent = String(djMessages.length);
  if (elements.activeUsers) elements.activeUsers.textContent = String(activeListeners.length);
  if (elements.recentlyPlayedCount) elements.recentlyPlayedCount.textContent = String(recentlyPlayed.length);
  if (elements.messageCount) elements.messageCount.textContent = String(messages.length);
  if (elements.requestCount) elements.requestCount.textContent = String(requests.length);
  if (elements.djMessageCount) elements.djMessageCount.textContent = String(djMessages.length);
  if (elements.listenerCount) elements.listenerCount.textContent = String(activeListeners.length);
}

async function fetchData() {
  lastFetchHadError = false;
  const [
    messagesData,
    requestsData,
    djMessagesData,
    nowPlayingData,
    listenersData,
    recentlyPlayedData,
  ] = await Promise.all([
    safeQuery("messages:getMessages", {}, []),
    safeQuery("requests:getAllRequests", {}, []),
    safeQuery("djMessages:getAllDJMessages", {}, []),
    safeQuery("radio:getCurrentSong", {}, null),
    safeQuery("radio:getActiveListeners", {}, []),
    safeQuery("radio:getRecentlyPlayed", {}, []),
  ]);

  const pushTokenStats = await fetchPushTokenStats();

  messages = messagesData;
  requests = requestsData;
  djMessages = djMessagesData;
  nowPlaying = nowPlayingData;
  activeListeners = listenersData;
  recentlyPlayed = recentlyPlayedData;

  if (elements.pushTokenStats) {
    elements.pushTokenStats.textContent = pushTokenStats
      ? `Registered devices: ${pushTokenStats.usersWithTokens} (users: ${pushTokenStats.usersTotal})`
      : "Registered devices: — (unable to load; check Convex URL / deploy)";
  }

  renderMessages();
  renderRequests();
  renderDJMessages();
  renderNowPlaying();
  renderActiveListeners();
  updateStats();

  if (elements.convexUrlDisplay) {
    elements.convexUrlDisplay.textContent = lastFetchHadError
      ? `Connected: ${CONVEX_URL} (errors — check URL)`
      : `Connected: ${CONVEX_URL}`;
  }
}

async function refresh() {
  if (elements.refreshBtn) {
    elements.refreshBtn.disabled = true;
    elements.refreshBtn.textContent = "Refreshing...";
  }

  await fetchData();
  // If we were paused due to failures, a successful manual refresh should resume auto refresh.
  if (!lastFetchHadError && !refreshInterval) startAutoRefresh();
  showStatusThrottled("✅ Data refreshed", "success", 2000);

  setTimeout(() => {
    if (elements.refreshBtn) {
      elements.refreshBtn.disabled = false;
      elements.refreshBtn.textContent = "🔄 Refresh Data";
    }
  }, 500);
}

async function clearAllMessages() {
  if (!confirm("⚠️ Clear ALL chat messages? This cannot be undone.")) return;
  if (elements.clearChatBtn) {
    elements.clearChatBtn.disabled = true;
    elements.clearChatBtn.textContent = "Clearing...";
  }

  await safeMutation("messages:clearAllMessages", {}, null);
  await fetchData();
  showStatus("✅ Cleared chat", "success");

  if (elements.clearChatBtn) {
    elements.clearChatBtn.disabled = false;
    elements.clearChatBtn.textContent = "🗑️ Clear All Chat";
  }
}

async function clearAllRequests() {
  if (!confirm("⚠️ Clear ALL requests (song requests + listener/DJ messages)? This cannot be undone.")) return;
  if (elements.clearRequestsBtn) {
    elements.clearRequestsBtn.disabled = true;
    elements.clearRequestsBtn.textContent = "Clearing...";
  }

  const [songRes, listenerRes] = await Promise.all([
    safeMutation("radio:clearAllRequests", {}, { count: 0 }),
    safeMutation("djMessages:clearAllDJMessages", {}, { count: 0 }),
  ]);
  await fetchData();
  showStatus(
    `✅ Cleared requests: ${songRes?.count ?? 0} song, ${listenerRes?.count ?? 0} listener`,
    "success"
  );

  if (elements.clearRequestsBtn) {
    elements.clearRequestsBtn.disabled = false;
    elements.clearRequestsBtn.textContent = "🗑️ Clear All Requests (Song + Listener)";
  }
}

async function clearAllDJMessages() {
  if (!confirm("⚠️ Clear ALL listener requests? This cannot be undone.")) return;
  if (elements.clearDJMessagesBtn) {
    elements.clearDJMessagesBtn.disabled = true;
    elements.clearDJMessagesBtn.textContent = "Clearing...";
  }

  await safeMutation("djMessages:clearAllDJMessages", {}, null);
  await fetchData();
  showStatus("✅ Cleared listener requests", "success");

  if (elements.clearDJMessagesBtn) {
    elements.clearDJMessagesBtn.disabled = false;
    elements.clearDJMessagesBtn.textContent = "🗑️ Clear All Requests";
  }
}

async function clearNowPlaying() {
  await safeMutation("radio:clearNowPlaying", {}, null);
  await fetchData();
  showStatus("✅ Cleared now playing", "success");
}

async function clearRecentlyPlayed() {
  if (!confirm("⚠️ Clear recently played history?")) return;
  await safeMutation("radio:clearRecentlyPlayed", {}, null);
  await fetchData();
  showStatus("✅ Cleared recently played", "success");
}

async function clearActiveListeners() {
  await safeMutation("radio:clearActiveListeners", {}, null);
  await fetchData();
  showStatus("✅ Cleared active listeners", "success");
}

window.deleteMessage = async (messageId) => {
  if (!confirm("Delete this message?")) return;
  await safeMutation("messages:deleteMessage", { messageId }, null);
  await fetchData();
};

window.deleteRequest = async (requestId) => {
  if (!confirm("Delete this request?")) return;
  await safeMutation("requests:deleteRequest", { requestId }, null);
  await fetchData();
};

window.deleteDJMessage = async (messageId) => {
  if (!confirm("Delete this request?")) return;
  await safeMutation("djMessages:deleteDJMessage", { messageId }, null);
  await fetchData();
};

window.markAsRead = async (messageId) => {
  await safeMutation("djMessages:markMessageAsRead", { messageId }, null);
  await fetchData();
};

async function sendNotificationToAll() {
  const title = elements.notificationTitle?.value.trim();
  const body = elements.notificationBody?.value.trim();

  if (!title || !body) {
    showStatusThrottled("❌ Please enter both title and message", "error");
    return;
  }

  if (!confirm(`📢 Send push notification to ALL listeners?\n\nTitle: ${title}\nMessage: ${body}`)) {
    return;
  }

  if (elements.sendToAllBtn) {
    elements.sendToAllBtn.disabled = true;
    elements.sendToAllBtn.textContent = "Sending...";
  }

  let result = { sent: 0, failed: 0, usersTotal: 0, usersWithTokens: 0 };
  let sendOk = false;
  try {
    const resp = await fetch(`${getConvexSiteBase()}/push/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, body }),
    });
    const json = await resp.json().catch(() => ({}));
    result = {
      sent: Number(json?.sent ?? 0),
      failed: Number(json?.failed ?? 0),
      usersTotal: Number(json?.usersTotal ?? 0),
      usersWithTokens: Number(json?.usersWithTokens ?? 0),
    };
    sendOk = resp.ok;
  } catch {
    // handled below
  }

  if (elements.notificationTitle) elements.notificationTitle.value = "";
  if (elements.notificationBody) elements.notificationBody.value = "";

  if (!sendOk) {
    showStatusThrottled(
      "❌ Failed to send push (check Deploy + Convex URL; endpoint is convex.site)",
      "error"
    );
    const stats = await fetchPushTokenStats();
    if (elements.pushTokenStats) {
      elements.pushTokenStats.textContent = stats
        ? `Registered devices: ${stats.usersWithTokens} (users: ${stats.usersTotal})`
        : "Registered devices: — (unable to load; check Convex URL / deploy)";
    }
    if (elements.sendToAllBtn) {
      elements.sendToAllBtn.disabled = false;
      elements.sendToAllBtn.textContent = "📢 Send to All Listeners";
    }
    return;
  }

  const total = result.sent + result.failed;
  if (total === 0) {
    showStatusThrottled(
      `ℹ️ No registered devices yet (users with tokens: ${result.usersWithTokens}/${result.usersTotal}). Check phone permissions + Convex URL.`,
      "info"
    );
  } else if (result.failed === 0) {
    showStatusThrottled(`✅ Sent ${result.sent} notification${result.sent !== 1 ? "s" : ""}`, "success");
  } else {
    showStatusThrottled(
      `⚠️ Sent ${result.sent}, failed ${result.failed}`,
      "error"
    );
  }

  // Update stats after sending
  const stats = await fetchPushTokenStats();
  if (elements.pushTokenStats) {
    elements.pushTokenStats.textContent = stats
      ? `Registered devices: ${stats.usersWithTokens} (users: ${stats.usersTotal})`
      : "Registered devices: — (unable to load; check Convex URL / deploy)";
  }

  if (elements.sendToAllBtn) {
    elements.sendToAllBtn.disabled = false;
    elements.sendToAllBtn.textContent = "📢 Send to All Listeners";
  }
}

function startAutoRefresh() {
  refreshInterval = setInterval(fetchData, 5000);
}

function stopAutoRefresh() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

function getConvexSiteBase() {
  // HTTP actions are hosted on *.convex.site
  return normalizeConvexCloudUrl(CONVEX_URL).replace(".convex.cloud", ".convex.site");
}

async function fetchPushTokenStats() {
  try {
    const resp = await fetch(`${getConvexSiteBase()}/push/stats`, { method: "GET" });
    if (!resp.ok) return null;
    const json = await resp.json();
    return {
      usersTotal: Number(json?.usersTotal ?? 0),
      usersWithTokens: Number(json?.usersWithTokens ?? 0),
    };
  } catch {
    return null;
  }
}

async function init() {
  try {
    // Ensure URL bar uses the correct *.convex.cloud base for queries/mutations.
    setConvexUrlQueryParam(CONVEX_URL);
    if (elements.convexUrlInput) elements.convexUrlInput.value = CONVEX_URL;
    if (elements.convexUrlDisplay) elements.convexUrlDisplay.textContent = `Connected: ${CONVEX_URL}`;

    if (elements.saveConvexUrlBtn && elements.convexUrlInput) {
      elements.saveConvexUrlBtn.addEventListener("click", async () => {
        const nextUrl = elements.convexUrlInput.value.trim();
        if (!nextUrl.startsWith("http")) {
          showStatusThrottled("❌ Invalid Convex URL", "error");
          return;
        }
        setConvexUrl(nextUrl);
        showStatusThrottled("✅ Updated Convex URL", "success", 2000);
        await fetchData();
        if (!lastFetchHadError && !refreshInterval) startAutoRefresh();
      });
    }

    if (elements.clearChatBtn) elements.clearChatBtn.addEventListener("click", clearAllMessages);
    if (elements.clearRequestsBtn) elements.clearRequestsBtn.addEventListener("click", clearAllRequests);
    if (elements.clearDJMessagesBtn) elements.clearDJMessagesBtn.addEventListener("click", clearAllDJMessages);
    if (elements.clearNowPlayingBtn) elements.clearNowPlayingBtn.addEventListener("click", clearNowPlaying);
    if (elements.clearRecentlyPlayedBtn) elements.clearRecentlyPlayedBtn.addEventListener("click", clearRecentlyPlayed);
    if (elements.clearListenersBtn) elements.clearListenersBtn.addEventListener("click", clearActiveListeners);
    if (elements.refreshBtn) elements.refreshBtn.addEventListener("click", refresh);
    if (elements.sendToAllBtn) elements.sendToAllBtn.addEventListener("click", sendNotificationToAll);

    showStatusThrottled("Loading data...", "info", 2000);
    await fetchData();
    startAutoRefresh();
    showStatusThrottled("✅ Connected", "success", 2000);
  } catch (err) {
    console.error("Admin init failed:", err);
    showStatusThrottled(`❌ Admin init failed: ${err?.message ?? String(err)}`, "error");
  }
}

document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopAutoRefresh();
  } else {
    startAutoRefresh();
    fetchData();
  }
});

init();