import { StyleSheet } from "react-native";
const ORANGE = "#FF9800";

export const homestyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
    padding: 20,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    backgroundColor: ORANGE,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  infoBox: {
    marginTop: 20,
    alignItems: "center",
  },
  welcome: {
    fontSize: 14,
    color: "#777",
  },
  name: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333",
    marginTop: 4,
  },
  username: {
    fontSize: 13,
    color: "#888",
    marginTop: 2,
  },
  statsBox: {
    backgroundColor: "#fff",
    marginTop: 25,
    borderRadius: 12,
    padding: 16,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderBottomWidth: 0.5,
    borderColor: "#eee",
  },
  statLabel: {
    fontSize: 15,
    color: "#555",
  },
  statValue: {
    fontSize: 16,
    fontWeight: "700",
    color: ORANGE,
  },
  actions: {
    marginTop: 30,
  },
  actionBtn: {
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
  },
  actionText: {
    marginLeft: 14,
    fontSize: 15,
    fontWeight: "600",
    color: "#333",
  },
  logoutBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 14,
    borderRadius: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: "auto",
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
});
