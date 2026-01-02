import { StyleSheet } from "react-native";

const ORANGE = "#FF9800";
const NAVBAR_HEIGHT = 65;

export const MenuStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF4EB",
  },

  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: ORANGE,
    textAlign: "center",
    marginTop: 16,
    marginBottom: 20,
  },

  divider: {
    height: 4,
    width: "100%",
    backgroundColor: ORANGE,
    marginVertical: 12,
    borderRadius: 2,
  },

  title: {
    fontWeight: "600",
    fontSize: 26,
    textAlign: "center",
    color: ORANGE,
    marginBottom: 40,
  },

  grid: {
    paddingHorizontal: 12,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    elevation: 3,
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: ORANGE,
  },

  tokenBtn: {
    backgroundColor: ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },

  tokenText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },

  emptySpace: {
    height: 60,
  },

  /* ---------- NAVBAR ---------- */
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#FFD2A6",
    position: "absolute",
    bottom: 0,
    width: "100%",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },

  navText: {
    fontSize: 11,
    color: "#888",
    marginTop: 2,
  },

});