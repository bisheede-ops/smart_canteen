import { StyleSheet } from "react-native";

export const SignupStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "orange" },
  header: { paddingTop: 60, paddingHorizontal: 30, paddingBottom: 20 },
  title: { fontSize: 30, fontWeight: "bold", color: "black" },
  subtitle: { fontSize: 16, color: "black", marginTop: 5 },
  form: { backgroundColor: "white", borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 30, flex: 1 },
  inputContainer: { flexDirection: "row", alignItems: "center", backgroundColor: "#F3F4F6", borderRadius: 12, paddingHorizontal: 15, paddingVertical: 12, marginBottom: 15 },
  input: { flex: 1, marginLeft: 10, fontSize: 16 },
  button: { backgroundColor: "orange", paddingVertical: 15, borderRadius: 12, alignItems: "center", marginTop: 10 },
  buttonText: { color: "black", fontSize: 18, fontWeight: "bold" },
  error: { color: "red", marginBottom: 10, fontSize: 14 },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 20 },
  footerText: { color: "black" },
  login: { color: "orange", fontWeight: "bold" },
});

