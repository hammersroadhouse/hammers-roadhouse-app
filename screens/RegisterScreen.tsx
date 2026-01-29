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
import { useMutation } from "convex/react";
import { api } from "../convex/_generated/api";
import { theme } from "../lib/theme";

const { COLORS, SPACING, TYPOGRAPHY, RADIUS } = theme;

interface RegisterScreenProps {
  onRegister: (userId: string, firstName: string, username: string, email: string) => void;
  onSwitchToLogin: () => void;
}

export function RegisterScreen({ onRegister, onSwitchToLogin }: RegisterScreenProps) {
  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState<"register" | "verify">("register");
  const [sentCode, setSentCode] = useState("");
  const [loading, setLoading] = useState(false);

  const register = useMutation(api.auth.register);
  const verifyEmail = useMutation(api.auth.verifyEmail);
  const resendCode = useMutation(api.auth.resendVerificationCode);

  const handleRegister = async () => {
    if (!firstName.trim() || !username.trim() || !email.trim()) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }

    // Username validation
    if (username.trim().length < 3) {
      Alert.alert("Error", "Username must be at least 3 characters");
      return;
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      Alert.alert("Error", "Username can only contain letters, numbers, and underscores");
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedUsername = username.trim();

      const result = await register({ firstName: firstName.trim(), username: normalizedUsername, email: normalizedEmail });

      if (!result.ok) {
        Alert.alert("Registration Failed", result.message);
        return;
      }

      setEmail(normalizedEmail);
      setSentCode(result.verificationCode);
      setStep("verify");
      // Don't show alert - code will be displayed on screen
    } catch (error: any) {
      Alert.alert("Registration Failed", error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!verificationCode.trim()) {
      Alert.alert("Error", "Please enter the verification code");
      return;
    }

    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      const normalizedCode = verificationCode.replace(/\D/g, "").trim();

      const result = await verifyEmail({ email: normalizedEmail, code: normalizedCode });

      if (!result.ok) {
        Alert.alert("Verification Failed", result.message);
        return;
      }

      Alert.alert("Success!", "Your email has been verified. Welcome to Hammers Road House! 🎸");
      onRegister(result.userId, result.firstName, result.username, result.email);
    } catch (error: any) {
      Alert.alert("Verification Failed", error.message || "Invalid code");
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      setEmail(normalizedEmail);

      const resend = await resendCode({ email: normalizedEmail });

      if (!resend.ok) {
        Alert.alert("Error", resend.message);
        return;
      }

      setSentCode(resend.verificationCode);
      // Don't show alert - code will be displayed on screen  
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
          <Text style={styles.subtitle}>Create your account</Text>

          {step === "register" ? (
            <>
              <View style={styles.inputContainer}>
                <Text style={styles.label}>First Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your first name"
                  placeholderTextColor={COLORS.outline}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                  editable={!loading}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.label}>Username</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your username"
                  placeholderTextColor={COLORS.outline}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  editable={!loading}
                />
              </View>

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
                onPress={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.onPrimary} />
                ) : (
                  <Text style={styles.buttonText}>Create Account</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={onSwitchToLogin} disabled={loading}>
                <Text style={styles.linkText}>Already have an account? Log in</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.verifyText}>
                Enter the verification code below
              </Text>
              
              <Text style={styles.emailText}>{email}</Text>
              
              {/* Demo mode - show code directly */}
              <View style={styles.demoCodeContainer}>
                <Text style={styles.demoLabel}>🧪 DEMO MODE - Your code is:</Text>
                <Text style={styles.demoCode}>{sentCode}</Text>
                <Text style={styles.demoNote}>
                  (Real emails not yet configured. In production, this code would be sent to your email.)
                </Text>
              </View>

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
                  <Text style={styles.buttonText}>Verify Email</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity onPress={handleResendCode} disabled={loading}>
                <Text style={styles.linkText}>Didn't receive code? Resend</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep("register")} disabled={loading}>
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
    marginBottom: SPACING.md,
  },
  emailText: {
    color: COLORS.primary,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: SPACING.lg,
  },
  demoCodeContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    padding: SPACING.lg,
    marginBottom: SPACING.lg,
    alignItems: "center",
  },
  demoLabel: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariant,
    marginBottom: SPACING.xs,
    textAlign: "center",
  },
  demoCode: {
    fontSize: 32,
    fontWeight: "bold",
    color: COLORS.primary,
    letterSpacing: 4,
    marginVertical: SPACING.sm,
  },
  demoNote: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.onSurfaceVariant,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: SPACING.xs,
  },
});

export default RegisterScreen;