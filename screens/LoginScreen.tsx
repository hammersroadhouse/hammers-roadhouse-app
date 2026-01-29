import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useConvex, useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { theme } from "../lib/theme";

const { COLORS, SPACING, TYPOGRAPHY, RADIUS } = theme;

interface LoginScreenProps {
  onLogin: (userId: string, firstName: string, username: string, email: string) => void;
  onSwitchToRegister: () => void;
}

export function LoginScreen({ onLogin, onSwitchToRegister }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [loading, setLoading] = useState(false);

  const convex = useConvex();
  const verifyEmail = useMutation(api.auth.verifyEmail);
  const resendCode = useMutation(api.auth.resendVerificationCode);

  const handleCheckEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      Alert.alert("Error", "Please enter your email");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const loginResult = await convex.query(api.auth.login, { email: normalizedEmail });

      if (!loginResult) {
        Alert.alert("Not Found", "No account found with this email. Please register first.");
        return;
      }

      if (loginResult.emailVerified) {
        onLogin(loginResult.userId, loginResult.firstName, loginResult.username, loginResult.email);
        return;
      }

      // User exists but needs verification
      const resend = await resendCode({ email: normalizedEmail });
      if (!resend.ok) {
        Alert.alert("Error", resend.message);
        return;
      }

      setEmail(normalizedEmail);
      Alert.alert(
        "Verification Required",
        `Your code is: ${resend.verificationCode}\n\n(In production, this would be sent to your email)`
      );
      setStep("verify");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedCode = verificationCode.replace(/\D/g, "").trim();

    if (!normalizedCode) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const result = await verifyEmail({ email: normalizedEmail, code: normalizedCode });
      if (!result.ok) {
        Alert.alert("Verification Failed", result.message);
        return;
      }
      Alert.alert("Success!", "Welcome back! 🎸");
      onLogin(result.userId, result.firstName, result.username, result.email);
    } catch (error: any) {
      Alert.alert("Verification Failed", error.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    const normalizedEmail = email.trim().toLowerCase();

    setLoading(true);
    try {
      const resend = await resendCode({ email: normalizedEmail });
      if (!resend.ok) {
        Alert.alert("Error", resend.message);
        return;
      }
      setEmail(normalizedEmail);
      Alert.alert(
        "Code Resent",
        `Your new code is: ${resend.verificationCode}\n\n(In production, this would be sent to your email)`
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to resend code");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inner}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Hammers Road House</Text>
          <Text style={styles.subtitle}>Welcome back!</Text>

          {step === "email" ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email"
                  placeholderTextColor={COLORS.outline}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleCheckEmail}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.onPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Continue</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={onSwitchToRegister} disabled={loading}>
                <Text style={styles.linkText}>Don't have an account? Register</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.verifyText}>
                We sent a verification code to{"\n"}
                <Text style={styles.emailText}>{email}</Text>
              </Text>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Verification Code</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter 6-digit code"
                  placeholderTextColor={COLORS.outline}
                  value={verificationCode}
                  onChangeText={setVerificationCode}
                  keyboardType="number-pad"
                  maxLength={6}
                  editable={!loading}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerify}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.onPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Verify & Login</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResendCode} disabled={loading}>
                <Text style={styles.linkText}>Didn't receive code? Resend</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep("email")} disabled={loading}>
                <Text style={styles.linkText}>Change email address</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: SPACING.xl,
  },
  title: {
    ...TYPOGRAPHY.heading1,
    color: COLORS.primary,
    textAlign: "center",
    marginBottom: SPACING.xs,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginBottom: SPACING.xxl,
  },
  inputContainer: {
    marginBottom: SPACING.lg,
  },
  label: {
    ...TYPOGRAPHY.labelSmall,
    color: COLORS.onBackground,
    marginBottom: SPACING.xs,
    fontWeight: "600",
  },
  input: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    color: COLORS.onBackground,
    fontSize: 16,
    borderWidth: 1,
    borderColor: COLORS.outline,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: RADIUS.md,
    padding: SPACING.md,
    alignItems: "center",
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.onPrimary,
    fontWeight: "700",
  },
  linkText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.primary,
    textAlign: "center",
    marginTop: SPACING.md,
  },
  verifyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.onSurfaceVariant,
    textAlign: "center",
    marginBottom: SPACING.xl,
  },
  emailText: {
    color: COLORS.primary,
    fontWeight: "600",
  },
});