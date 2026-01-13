import { StyleSheet } from "react-native";
const ORANGE = "#FF9800";
const INACTIVE = "#888";

export const DeliveryAssignStyles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFF7ED" },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginHorizontal: 20,
    marginTop: 15,
  },
  emptyText: {
    marginHorizontal: 20,
    color: "#888",
    marginBottom: 10,
  },
  orderCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 20,
  },
  orderText: { fontSize: 14, marginBottom: 4 },
  bold: { fontWeight: "bold" },
  assigned: { fontWeight: "bold", marginTop: 5, color: "green" },
  assignTitle: { marginTop: 5, fontWeight: "bold" },
  agentsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 5 },
  agentButton: {
    backgroundColor: ORANGE,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 5,
  },
  agentText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#FFE0B2",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },
  navItem: { alignItems: "center" },
  navText: { fontSize: 11, color: "#888", marginTop: 2 },
  active: { color: ORANGE, fontWeight: "bold" },
});
