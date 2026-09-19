import { useAuth } from "@clerk/expo";
import { Redirect } from "expo-router";

const index = () => {
  const { isSignedIn, isLoaded } = useAuth();

  console.log("isSignedIn:", isSignedIn);
  if (!isLoaded) return null;

  if (!isSignedIn) {
    return <Redirect href="/(auth)/SignUp" />;
  }

  return <Redirect href="/(tabs)" />;
};

export default index;
