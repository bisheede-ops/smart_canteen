import { StyleSheet } from "react-native";
const ORANGE = "#FF7A00";

export const OrdersStyles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#FFF7ED",
  },

  title: {
    fontSize: 30,        
    fontWeight: "bold",
    marginBottom: 10,
  },

  emptyText: {
    textAlign: "center",
    marginTop: 40,
    fontSize: 17,  
    color: "#777",
  },

  sectionTitle: {
    fontSize: 26,
    fontWeight: "bold",
    marginHorizontal: 0,
    marginTop: 15,
  },
  card: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    elevation: 2,
  },

  bold: {
    fontSize: 17,        
    fontWeight: "bold",
  },

  status: {
    marginTop: 6,
    fontStyle: "italic",
    fontSize: 20,          
  },

  delivered: {
    marginTop: 10,
    fontWeight: "bold",
    fontSize: 16,         
    color: "green",
  },

  btncontainer: {
    flexDirection: "row",
    marginTop: 10,
    gap: 8,
  },

  button: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: ORANGE,
    borderRadius: 8,
    gap: 6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,      
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
  },

  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },

  modalText: {
    fontSize: 17,
  },

  cancelBtn: {
    marginTop: 12,
    alignItems: "center",
  },

row: {
  flexDirection: "row",
  marginBottom: 4,
  flexWrap: "wrap",
},

label: {
  fontSize: 22,
  fontWeight: "bold",
  marginRight: 6,
  color: "#444",
},

value: {
  fontSize: 22,
  color: "#222",
},

});
