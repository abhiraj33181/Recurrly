import { useClerk } from "@clerk/expo";
import { useRouter } from "expo-router";
import { styled } from "nativewind";
import { Text, TouchableOpacity } from "react-native";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      console.log("Signing out...");
      await signOut();
      router.replace("/(auth)/SignIn");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-5">
      <Text className="text-2xl italic">Settings</Text>
      <TouchableOpacity
        onPress={handleSignOut}
        className="bg-red-500 p-3 rounded-md mt-5"
      >
        <Text className="text-white text-center">Sign Out</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default Settings;
