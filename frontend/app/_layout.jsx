import { Stack } from "expo-router";
import { StripeProvider } from "@stripe/stripe-react-native";
import Toast from "react-native-toast-message";

export default function Layout() {
  return (
    <StripeProvider publishableKey="pk_test_51T3v4lA6zn2oV8tknyllGLkTh77STNJqR6rI2rOxxVEQwIpJScr3FZa9kEMEwnYnzIkqtEdoBlUXXl0CXzj87iOf00PCe2ydz6">
      <Stack screenOptions={{ headerShown: false }} />
      <Toast />
    </StripeProvider>
  );
}