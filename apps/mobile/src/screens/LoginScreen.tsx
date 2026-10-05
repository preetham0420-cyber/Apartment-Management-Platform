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
import {
  BuildingIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  LockIcon,
  ChevronRightIcon
} from "../components/MobileIcons";

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
      setErrorMessage(err.message || "Failed to log in. Please check credentials.");
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
        "Application submitted! Your account is pending estate manager review. You will be activated upon society verification."
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
    setEmail("preetham@community.local");
    setPassword("Tenant1@12345");
    setErrorMessage(null);
  };

  const handleFillDemoOwner = () => {
    setEmail("vikramaditya@community.local");
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
              <BuildingIcon size={28} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.brandTag}>RESIDENTIAL PORTAL</Text>
            <Text style={styles.brandTitle}>Apartment OS</Text>
            <Text style={styles.brandSubtitle}>
              {mode === "LOGIN"
                ? "Sign in to manage your unit, gate entries, and society dues"
                : "Submit onboarding request for Greenfield Heights society verification"}
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
                New Resident Onboarding
              </Text>
            </TouchableOpacity>
          </View>

          {/* Success Banner */}
          {successMessage && (
            <View style={styles.successBanner}>
              <CheckCircleIcon size={18} color={colors.primary} />
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <View style={styles.errorBanner}>
              <AlertCircleIcon size={18} color={colors.danger} />
              <Text style={styles.errorText}>{errorMessage}</Text>
            </View>
          )}

          {mode === "LOGIN" ? (
            /* Login Form Card */
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL ADDRESS</Text>
                <TextInput
                  style={styles.input}
                  placeholder="e.g. preetham@community.local"
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
                <Text style={styles.inputLabel}>PASSWORD</Text>
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
                  <View>
                    <Text style={styles.demoButtonTitle}>Preetham (Tenant • Flat 402)</Text>
                    <Text style={styles.demoButtonEmail}>preetham@community.local</Text>
                  </View>
                  <ChevronRightIcon size={16} color={colors.primary} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.demoButton, { marginTop: 8 }]}
                  onPress={handleFillDemoOwner}
                  disabled={isLoading}
                >
                  <View>
                    <Text style={styles.demoButtonTitle}>Vikramaditya (Owner • Flat 205)</Text>
                    <Text style={styles.demoButtonEmail}>vikramaditya@community.local</Text>
                  </View>
                  <ChevronRightIcon size={16} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            /* Registration Form Card */
            <View style={styles.formCard}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>FULL NAME *</Text>
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
                <Text style={styles.inputLabel}>EMAIL ADDRESS *</Text>
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
                <Text style={styles.inputLabel}>PASSWORD *</Text>
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
                <Text style={styles.inputLabel}>CONTACT NUMBER</Text>
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
                <Text style={styles.inputLabel}>RESIDENCY TYPE</Text>
                <View style={{ flexDirection: "row", gap: 8, marginTop: 4 }}>
                  <TouchableOpacity
                    style={[
                      styles.roleSelectBtn,
                      regRole === "RESIDENT_TENANT" && styles.roleSelectBtnActive
                    ]}
                    onPress={() => setRegRole("RESIDENT_TENANT")}
                  >
                    <Text
                      style={[
                        styles.roleSelectText,
                        regRole === "RESIDENT_TENANT" && styles.roleSelectTextActive
                      ]}
                    >
                      Verified Tenant
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.roleSelectBtn,
                      regRole === "RESIDENT_OWNER" && styles.roleSelectBtnActive
                    ]}
                    onPress={() => setRegRole("RESIDENT_OWNER")}
                  >
                    <Text
                      style={[
                        styles.roleSelectText,
                        regRole === "RESIDENT_OWNER" && styles.roleSelectTextActive
                      ]}
                    >
                      Property Owner
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
            <LockIcon size={14} color={colors.primary} />
            <Text style={styles.securityText}>
              Encrypted JWT session storage • Super Admin RBAC Protected
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
    paddingHorizontal: 20,
    paddingVertical: 30
  },
  brandContainer: {
    alignItems: "center",
    marginBottom: 20
  },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 18,
    backgroundColor: "#E8F4EF",
    borderWidth: 1,
    borderColor: "rgba(21, 154, 114, 0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10
  },
  brandTag: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.primary,
    letterSpacing: 0.8,
    marginBottom: 2
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: typography.weights.heavy,
    color: colors.textMain,
    letterSpacing: -0.4,
    marginBottom: 4
  },
  brandSubtitle: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: "center",
    maxWidth: 300,
    lineHeight: 16
  },
  modeTabs: {
    flexDirection: "row",
    backgroundColor: "#E5E8E5",
    borderRadius: 12,
    padding: 3,
    marginBottom: 16
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: "center",
    borderRadius: 9
  },
  modeTabActive: {
    backgroundColor: "#FFFFFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2
  },
  modeTabText: {
    fontSize: 12,
    fontWeight: typography.weights.medium,
    color: colors.textMuted
  },
  modeTabTextActive: {
    color: colors.textMain,
    fontWeight: typography.weights.bold
  },
  successBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F4EF",
    borderWidth: 1,
    borderColor: "rgba(21, 154, 114, 0.3)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8
  },
  successText: {
    flex: 1,
    fontSize: 12,
    color: colors.primary,
    fontWeight: typography.weights.medium
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEE2E2",
    borderWidth: 1,
    borderColor: "#FCA5A5",
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
    gap: 8
  },
  errorText: {
    flex: 1,
    fontSize: 12,
    color: colors.danger,
    fontWeight: typography.weights.medium
  },
  formCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8
  },
  inputGroup: {
    marginBottom: 14
  },
  inputLabel: {
    fontSize: 10,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginBottom: 4,
    letterSpacing: 0.5
  },
  input: {
    backgroundColor: "#F7F8F6",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 14,
    color: colors.textMain
  },
  roleSelectBtn: {
    flex: 1,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#F7F8F6"
  },
  roleSelectBtnActive: {
    borderColor: colors.primary,
    backgroundColor: "#E8F4EF"
  },
  roleSelectText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: "600"
  },
  roleSelectTextActive: {
    color: colors.primary,
    fontWeight: "700"
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 6
  },
  submitButtonDisabled: {
    opacity: 0.6
  },
  submitButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: typography.weights.bold
  },
  demoSection: {
    marginTop: 20
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    fontSize: 9,
    fontWeight: typography.weights.bold,
    color: colors.textMuted,
    marginHorizontal: 10,
    letterSpacing: 0.6
  },
  demoButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F7F8F6",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14
  },
  demoButtonTitle: {
    fontSize: 12,
    fontWeight: typography.weights.bold,
    color: colors.textMain
  },
  demoButtonEmail: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 1
  },
  securityNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    gap: 6
  },
  securityText: {
    fontSize: 11,
    color: colors.textMuted
  }
});
