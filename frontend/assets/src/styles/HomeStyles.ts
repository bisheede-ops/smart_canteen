import { StyleSheet } from "react-native";

const ORANGE = "#FF9800";

export const HomeStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFF7ED",
  },
  content: {
    padding: 20,
    paddingBottom: 90,
  },
  header: {
    marginBottom: 25,
  },
  welcome: {
    fontSize: 16,
    color: "#888",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: ORANGE,
  },
  role: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  actions: {
    
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
    rowGap: 16,        
    columnGap: 16,
    marginBottom: 30,
    
    
  },
  actionCard: {
    width: "47%",
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 14,
    alignItems: "center",
    elevation: 3,
    
   
  },
  actionText: {
    marginTop: 10,
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  foodCard: {
    backgroundColor: "#FFFFFF",
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    elevation: 2,
  },
  foodName: {
    fontSize: 15,
  },
  foodPrice: {
    fontSize: 15,
    fontWeight: "bold",
    color: ORANGE,
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

