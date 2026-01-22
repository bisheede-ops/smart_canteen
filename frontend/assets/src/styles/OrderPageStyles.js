import { StyleSheet } from "react-native";

const ORANGE = "#FF7A00";
const INACTIVE = "#888";

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  content: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 13, color: "#555", marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: "#fff",
  },
  userBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  usernameText: { marginLeft: 8, fontWeight: "bold" },
  toggleRow: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  toggleText: { marginLeft: 8 },
  button: {
    backgroundColor: ORANGE,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 15,
    borderRadius: 10,
    marginTop: 15,
  },
  buttonText: { color: "#fff", fontWeight: "bold", marginLeft: 8 },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 11, color: INACTIVE, marginTop: 2 },
});