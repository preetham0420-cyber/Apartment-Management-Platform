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
  const [mode, setMode] = useState<"LOGIN" | "REGISTER">("LOGIN");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Registration form state
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regRole, setRegRole] = useState<"RESIDENT_TENANT" | "RESIDENT_OWNER">("RESIDENT_TENANT");
  const [regUnitId, setRegUnitId] = useState("u1111111-2222-3333-4444-555555555551");

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
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

  const handleRegister = async () => {
    if (!regFullName.trim() || !regEmail.trim() || !regPassword.trim()) {
      setErrorMessage("Please fill in your full name, email, and password.");
      return;
    }

    setErrorMessage(null);
    setSuccessMessage(null);
    setIsLoading(true);

    try {
      await mobileApiClient.register({
        fullName: regFullName.trim(),
        email: regEmail.trim(),
        password: regPassword,
        phoneNumber: regPhone.trim() || undefined,
        role: regRole,
        unitId: regUnitId
      });

      setSuccessMessage(
        "Application submitted successfully! Your account is pending Super Admin review. You will be activated upon society verification."
      );
      setMode("LOGIN");
      setEmail(regEmail.trim());
      setPassword("");
    } catch (error) {
      const err = error as Error;
      setErrorMessage(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemoTenant = () => {
    setEmail("tenant@community.local");
    setPassword("Tenant@12345");
    setErrorMessage(null);
  };

  const handleFillDemoOwner = () => {
    setEmail("owner@community.local");
    setPassword("Owner@12345");
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
              {mode === "LOGIN"
                ? "Sign in to access your unit, visitors, and society services"
                : "Register a pending resident account for society approval"}
            </Text>
          </View>

          {/* Mode Switch Tabs */}
          <View style={styles.modeTabs}>
            <TouchableOpacity
              style={[styles.modeTab, mode === "LOGIN" && styles.modeTabActive]}
              onPress={() => {
                setMode("LOGIN");
                setErrorMessage(null);
              }}
            >
              <Text style={[styles.modeTabText, mode === "LOGIN" && styles.modeTabTextActive]}>
                Sign In
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.modeTab, mode === "REGISTER" && styles.modeTabActive]}
              onPress={() => {
                setMode("REGISTER");
                setErrorMessage(null);
              }}
            >
              <Text style={[styles.modeTabText, mode === "REGISTER" && styles.modeTabTextActive]}>
                New Resident
              </Text>
            </TouchableOpacity>
          </View>

          {/* Success Banner */}
          {successMessage && (
            <View style={styles.successBanner}>
              <Text style={styles.successIcon}>✅</Text>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {mode === "LOGIN" ? (
            /* Login Form Card */
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
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter your account password"
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

              {/* Quick-fill Demo Accounts */}
              <View style={styles.demoSection}>
                <View style={styles.dividerRow}>
                  <View style={styles.dividerLine} />
                  <Text style={styles.dividerText}>QUICK DEMO ACCESS</Text>
                  <View style={styles.dividerLine} />
                </View>

                <TouchableOpacity
                  style={styles.demoButton}
                  onPress={handleFillDemoTenant}
                  disabled={isLoading}
                >
                  <Text style={styles.demoButtonText}>
                    👉 Tenant: tenant@community.local (Flat 402)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoButton, { marginTop: 6 }]}
                  onPress={handleFillDemoOwner}
                  disabled={isLoading}
                >
                  <Text style={styles.demoButtonText}>
                    👉 Owner: owner@community.local (Flat 205)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Registration Form Card */
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. Rahul Sharma"
                  placeholderTextColor={colors.textMuted}
                  value={regFullName}
                  onChangeText={setRegFullName}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. rahul@example.com"
                  placeholderTextColor={colors.textMuted}
                  value={regEmail}
                  onChangeText={setRegEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Password *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="At least 6 characters"
                  placeholderTextColor={colors.textMuted}
                  value={regPassword}
                  onChangeText={setRegPassword}
                  secureTextEntry
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Phone Number</Text>
                <TextInput
                  style={styles.input}
                  placeholder="+91 98765 43210"
                  placeholderTextColor={colors.textMuted}
                  value={regPhone}
                  onChangeText={setRegPhone}
                  keyboardType="phone-pad"
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Resident Role</Text>
                <View style={{ flexDirection: "row", gap: 10, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[styles.roleSelectBtn, regRole === "RESIDENT_TENANT" && styles.roleSelectBtnActive]}
                    onPress={() => setRegRole("RESIDENT_TENANT")}
                  >
                    <Text style={[styles.roleSelectText, regRole === "RESIDENT_TENANT" && styles.roleSelectTextActive]}>
                      Tenant
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.roleSelectBtn, regRole === "RESIDENT_OWNER" && styles.roleSelectBtnActive]}
                    onPress={() => setRegRole("RESIDENT_OWNER")}
                  >
                    <Text style={[styles.roleSelectText, regRole === "RESIDENT_OWNER" && styles.roleSelectTextActive]}>
                      Owner
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleRegister}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.submitButtonText}>Submit Onboarding Request</Text>
                )}
              </TouchableOpacity>
            </View>
          )}

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
    marginBottom: spacing.md
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: colors.bgSurface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs
  },
  logoText: {
    fontSize: 28
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
    maxWidth: 290
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: colors.bgSurface,
    borderRadius: 12,
    padding: 4,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border
  },
  modeTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 8
  },
  modeTabActive: {
    backgroundColor: colors.primary
  },
  modeTabText: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.textMuted
  },
  modeTabTextActive: {
    color: "#ffffff"
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#10b98120",
    borderWidth: 1,
    borderColor: "#10b98160",
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  successIcon: {
    fontSize: 18,
    marginRight: spacing.sm
  },
  successText: {
    flex: 1,
    fontSize: typography.sizes.caption,
    color: "#059669",
    fontWeight: typography.weights.medium
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ef444420",
    borderWidth: 1,
    borderColor: "#ef444460",
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md
  },
  errorIcon: {
    fontSize: 18,
    marginRight: spacing.sm
  },
  errorText: {
    flex: 1,
    fontSize: typography.sizes.caption,
    color: colors.danger,
    fontWeight: typography.weights.medium
  },
  formCard: {
    backgroundColor: colors.bgSurface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    elevation: 3
  },
  inputGroup: {
    marginBottom: spacing.md
  },
  inputLabel: {
    fontSize: typography.sizes.caption,
    fontWeight: typography.weights.semibold,
    color: colors.textMuted,
    marginBottom: spacing.xs,
    textTransform: "uppercase"
  },
  input: {
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    fontSize: typography.sizes.body,
    color: colors.textMain
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: colors.bgPage
  },
  roleSelectBtnActive: {
    borderColor: colors.primary,
    backgroundColor: "#3b82f615"
  },
  roleSelectText: {
    fontSize: 13,
    color: colors.textMuted,
    fontWeight: "600"
  },
  roleSelectTextActive: {
    color: colors.primary
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: spacing.sm
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: typography.sizes.body,
    fontWeight: typography.weights.bold
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
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginHorizontal: spacing.sm
  },
  demoButton: {
    backgroundColor: colors.bgPage,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: spacing.md,
    alignItems: "center"
  },
  demoButtonText: {
    fontSize: typography.sizes.caption,
    color: colors.primary,
    fontWeight: typography.weights.semibold
  },
  securityNote: {
    marginTop: spacing.lg,
    alignItems: "center"
  },
  securityText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: "center"
  }
});
