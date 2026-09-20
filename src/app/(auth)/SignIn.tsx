import { useAuth, useSignIn } from "@clerk/expo";
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
  "We couldn't sign you in. Try again.";

export default function SignIn() {
  const router = useRouter();
  const { isLoaded } = useAuth();
  const { signIn } = useSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async () => {
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
      const result = await signIn.password({
        emailAddress: email.trim().toLowerCase(),
        password,
      });

      if (result.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        router.replace("/(tabs)");
        return;
      }

      if (signIn.status === "needs_second_factor") {
        setIsVerifying(true);
        return;
      }
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
      const result = await signIn.emailCode.verifyCode({
        code,
      });

      if (result.error) {
        setError(getErrorMessage(result.error));
        return;
      }

      if (signIn.status === "complete") {
        await signIn.finalize();
        router.replace("/(tabs)");
      }
    } catch (err) {
      setError(getErrorMessage(err));
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
              {isVerifying ? "Check your inbox" : "Welcome back"}
            </Text>
            <Text className="auth-subtitle">
              {isVerifying
                ? `Enter the code sent to ${email.trim()}.`
                : "Sign in to continue managing your subscriptions."}
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
                    <Text className="auth-label">Email</Text>
                    <TextInput
                      className={`auth-input ${error && !/^\S+@\S+\.\S+$/.test(email.trim()) ? "auth-input-error" : ""}`}
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
                    <Text className="auth-label">Password</Text>
                    <TextInput
                      className={`auth-input ${error && password.length < 8 ? "auth-input-error" : ""}`}
                      value={password}
                      onChangeText={(value) => {
                        setPassword(value);
                        setError("");
                      }}
                      placeholder="Enter your password"
                      placeholderTextColor="rgba(0, 0, 0, 0.4)"
                      secureTextEntry
                      textContentType="password"
                    />
                  </View>
                </>
              )}

              {!!error && <Text className="auth-error">{error}</Text>}
              <Pressable
                className={`auth-button ${isSubmitting ? "auth-button-disabled" : ""}`}
                onPress={isVerifying ? handleVerify : handleSignIn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#081126" />
                ) : (
                  <Text className="auth-button-text">
                    {isVerifying ? "Verify email" : "Sign in"}
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
              <Text className="auth-link-copy">New to Recurrly?</Text>
              <Pressable
                onPress={() => router.push("/(auth)/SignUp")}
                hitSlop={8}
              >
                <Text className="auth-link">Create an account</Text>
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
