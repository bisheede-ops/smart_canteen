// DeliveryStyles.js
import { StyleSheet, Dimensions } from "react-native";

const ORANGE = "#FF9800";

export const DeliveryStyles = StyleSheet.create({
  /* ================= STYLES ================= */
  screen: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },

  /* HEADER */
  header: {
    backgroundColor: "#FF7A00",
    paddingVertical: 50,
    paddingHorizontal: 25,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    color: "#fff",
    marginTop: 10,
  },

  headerSubtitle: {
    fontSize: 14,
    color: "#FFE6CC",
    marginTop: 6,
    textAlign: "center",
  },

  /* CARD */
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 20,
    marginTop: -30,
    borderRadius: 20,
    padding: 25,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },

  label: {
    fontSize: 12,
    fontWeight: "700",
    color: "#444",
    marginBottom: 6,
    marginLeft: 6,
  },

  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F2F6",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 50,
    marginBottom: 18,
  },

  input: {
    flex: 1,
    fontSize: 15,
    marginLeft: 10,
    color: "#000",
  },

  button: {
    flexDirection: "row",
    height: 50,
    borderRadius: 14,
    backgroundColor: "#FF7A00",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
    marginLeft: 8,
    letterSpacing: 0.6,
  },


  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 65,
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#FFE0B2",
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
