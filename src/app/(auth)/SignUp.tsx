import { useAuth, useSignUp } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { useState } from "react";
import {
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

const getErrorMessage = (error: any) =>
  error?.errors?.[0]?.message ??
  error?.message ??
  "We couldn't create your account. Try again.";

export default function SignUp() {
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();
  const { signUp } = useSignUp();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError("Enter your first and last name.");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError("Enter a valid email address.");
      return;
    }

    if (password.length < 8) {
      setError("Your password must be at least 8 characters.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const result = await signUp.create({
        emailAddress: email.trim().toLowerCase(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
      });

      if (result.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      const verification = await signUp.verifications.sendEmailCode();

      if (verification.error) {
        setError(getErrorMessage(verification.error));
        return;
      }
      setIsVerifying(true);
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async () => {
    if (!/^\d{6}$/.test(code)) {
      setError("Enter the 6-digit verification code.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      const result = await signUp.verifications.verifyEmailCode({ code });
      if (result.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      await signUp.finalize();
      router.replace("/(tabs)");
    } catch (error) {
      setError(getErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoaded) return null;

  return (
    <SafeAreaView className="auth-safe-area">
      <KeyboardAvoidingView
        className="auth-screen"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="auth-scroll"
          contentContainerClassName="auth-content"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View className="auth-brand-block">
            <View className="auth-logo-wrap">
              <View className="auth-logo-mark">
                <Text className="auth-logo-mark-text">R</Text>
              </View>
              <View>
                <Text className="auth-wordmark">Recurrly</Text>
                <Text className="auth-wordmark-sub">Smart billing</Text>
              </View>
            </View>
            <Text className="auth-title">
              {isVerifying ? "Check your inbox" : "Create your account"}
            </Text>
            <Text className="auth-subtitle">
              {isVerifying
                ? `Enter the code sent to ${email.trim()}.`
                : "Bring every subscription into one clear view."}
            </Text>
          </View>

          <View className="auth-card">
            <View className="auth-form">
              {isVerifying ? (
                <View className="auth-field">
                  <Text className="auth-label">Verification code</Text>
                  <TextInput
                    className={`auth-input ${error ? "auth-input-error" : ""}`}
                    value={code}
                    onChangeText={(value) => {
                      setCode(value.replace(/\D/g, "").slice(0, 6));
                      setError("");
                    }}
                    placeholder="Enter your 6-digit code"
                    placeholderTextColor="rgba(0, 0, 0, 0.4)"
                    keyboardType="number-pad"
                    maxLength={6}
                    autoFocus
                  />
                </View>
              ) : (
                <>
                  <View className="auth-field">
                    <Text className="auth-label">First name</Text>
                    <TextInput
                      className="auth-input"
                      value={firstName}
                      onChangeText={(value) => {
                        setFirstName(value);
                        setError("");
                      }}
                      placeholder="Enter your first name"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      autoCapitalize="words"
                      textContentType="givenName"
                    />
                  </View>
                  <View className="auth-field">
                    <Text className="auth-label">Last name</Text>
                    <TextInput
                      className="auth-input"
                      value={lastName}
                      onChangeText={(value) => {
                        setLastName(value);
                        setError("");
                      }}
                      placeholder="Enter your last name"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      autoCapitalize="words"
                      textContentType="familyName"
                    />
                  </View>
                  <View className="auth-field">
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className="auth-input"
                      value={email}
                      onChangeText={(value) => {
                        setEmail(value);
                        setError("");
                      }}
                      placeholder="Enter your email"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={false}
                      textContentType="emailAddress"
                    />
                  </View>
                  <View className="auth-field">
                    <View className="flex-row items-center justify-between">
                      <Text className="auth-label">Password</Text>
                      <Text className="auth-helper">8+ characters</Text>
                    </View>
                    <TextInput
                      className="auth-input"
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setError("");
                      }}
                      placeholder="Create a password"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      secureTextEntry
                      textContentType="newPassword"
                    />
                  </View>
                </>
              )}

              {!!error && <Text className="auth-error">{error}</Text>}
              <Pressable
                className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
                onPress={isVerifying ? handleVerify : handleSignUp}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">
                    {isVerifying ? "Verify email" : "Create account"}
                  </Text>
                )}
              </Pressable>

              {isVerifying && (
                <Pressable
                  className="auth-secondary-button"
                  onPress={() => setIsVerifying(false)}
                >
                  <Text className="auth-secondary-button-text">
                    Use a different account
                  </Text>
                </Pressable>
              )}
            </View>
          </View>

          {!isVerifying && (
            <View className="auth-link-row">
              <Text className="auth-link-copy">Already have an account?</Text>
              <Pressable
                onPress={() => router.push("/(auth)/SignIn")}
                hitSlop={8}
              >
                <Text className="auth-link">Sign in</Text>
              </Pressable>
            </View>
          )}

          <Text className="mt-8 text-center text-xs font-sans-medium text-muted-foreground">
            Your subscription data stays private and secure.
          </Text>
          <View nativeID="clerk-captcha" />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
