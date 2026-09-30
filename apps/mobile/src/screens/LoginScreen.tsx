import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView
} from "react-native";
import { colors } from "../theme/colors";
import { typography } from "../theme/typography";
import { spacing } from "../theme/spacing";
import { mobileApiClient } from "../services/api-client";
import { AuthUser, UnitSummary } from "@apartment/shared";

interface LoginScreenProps {
  onLoginSuccess: (user: AuthUser, unit?: UnitSummary) => void;
}

export function LoginScreen({ onLoginSuccess }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await mobileApiClient.login({
        email: email.trim(),
        password
      });

      onLoginSuccess(result.user, result.unit);
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Failed to log in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail("tenant@community.local");
    setPassword("Tenant@12345");
    setErrorMessage(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Brand Header */}
          <View style={styles.brandContainer}>
            <View style={styles.logoBadge}>
              <Text style={styles.logoText}>🏢</Text>
            </View>
            <Text style={styles.brandTitle}>Apartment Resident</Text>
            <Text style={styles.brandSubtitle}>
              Sign in to access your unit, visitors, and society services
            </Text>
          </View>

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {/* Login Form Card */}
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email Address</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. tenant@community.local"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                placeholderTextColor={colors.textMuted}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (errorMessage) setErrorMessage(null);
                }}
                secureTextEntry
                autoCapitalize="none"
                editable={!isLoading}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleLogin}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color="#ffffff" size="small" />
              ) : (
                <Text style={styles.submitButtonText}>Sign In to My Unit</Text>
              )}
            </TouchableOpacity>

            {/* Quick-fill Demo Account */}
            <View style={styles.demoSection}>
              <View style={styles.dividerRow}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>DEVELOPMENT TESTING</Text>
                <View style={styles.dividerLine} />
              </View>

              <TouchableOpacity
                style={styles.demoButton}
                onPress={handleFillDemo}
                disabled={isLoading}
              >
                <Text style={styles.demoButtonText}>
                  👉 Quick-Fill Demo Resident: tenant@community.local
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.securityNote}>
            <Text style={styles.securityText}>
              🔒 Protected by server-side JWT authentication & encrypted storage
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bgPage
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xl
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: spacing.xl
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.md
  },
  logoText: {
    fontSize: 32
  },
  brandTitle: {
    fontSize: typography.sizes.title,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    marginBottom: spacing.xs
  },
  brandSubtitle: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 280
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef444420",
    borderWidth: 1,
    borderColor: "#ef444460",
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md
  },
  errorIcon: {
    marginRight: spacing.sm,
    fontSize: 16
  },
  errorText: {
    fontSize: typography.sizes.caption,
    color: "#f87171",
    flex: 1
  },
  formCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: spacing.radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg
  },
  inputGroup: {
    marginBottom: spacing.md
  },
  inputLabel: {
    fontSize: typography.sizes.caption,
    color: colors.textMuted,
    fontWeight: "600",
    marginBottom: spacing.xs
  },
  input: {
    height: 48,
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.radius.sm,
    paddingHorizontal: spacing.md,
    color: colors.textMain,
    fontSize: 15
  },
  submitButton: {
    height: 48,
    backgroundColor: colors.primary,
    borderRadius: spacing.radius.sm,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.sm
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: "#ffffff",
    fontWeight: "700",
    fontSize: 15
  },
  demoSection: {
    marginTop: spacing.lg
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.sm
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    fontSize: 10,
    fontWeight: "700",
    color: colors.textMuted,
    marginHorizontal: spacing.sm,
    letterSpacing: 0.5
  },
  demoButton: {
    backgroundColor: "#3b82f615",
    borderWidth: 1,
    borderColor: "#3b82f640",
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: spacing.radius.sm,
    alignItems: "center"
  },
  demoButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#3b82f6"
  },
  securityNote: {
    alignItems: "center",
    marginTop: spacing.xl
  },
  securityText: {
    fontSize: 11,
    color: colors.textMuted
  }
});
