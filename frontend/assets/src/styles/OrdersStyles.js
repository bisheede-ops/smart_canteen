import { StyleSheet } from "react-native";
const ORANGE_LIGHT = "#FFF0E0";
const DARK = "#1A1A2E";
const CARD_BG = "#FFFFFF";
const ORANGE = "#FF7A00";

export const OrdersStyles = StyleSheet.create({
 
   container: { flex: 1, backgroundColor: "#F8F9FB" },
 
   header: {
     flexDirection: "row", justifyContent: "space-between",
     alignItems: "center", paddingHorizontal: 16, paddingVertical: 14,
   },
   title: { fontSize: 20, fontWeight: "700", color: "#1a1a1a" },
 
   // Tabs
   tabs: { flexDirection: "row", paddingHorizontal: 12, marginBottom: 8, gap: 6 },
   tab: {
     flex: 1, paddingVertical: 7, borderRadius: 20,
     backgroundColor: "#fff", alignItems: "center",
     borderWidth: 1, borderColor: "#E2E8F0",
   },
   tabActive:     { backgroundColor: ORANGE, borderColor: ORANGE },
   tabText:       { fontSize: 11, fontWeight: "600", color: "#64748B" },
   tabTextActive: { color: "#fff" },
 
   // Card
   card: {
     backgroundColor: "#fff", borderRadius: 14, padding: 14,
     marginBottom: 12, elevation: 2,
     shadowColor: "#000", shadowOpacity: 0.05,
     shadowRadius: 6, shadowOffset: { width: 0, height: 2 },
   },
   cardHeader: {
     flexDirection: "row", justifyContent: "space-between",
     alignItems: "center", marginBottom: 10,
   },
   orderNum:   { fontSize: 14, fontWeight: "700", color: "#1a1a1a" },
   statusPill: { flexDirection: "row", alignItems: "center", gap: 4 },
   statusText: { fontSize: 12, fontWeight: "600" },
   divider:    { height: 1, backgroundColor: "#f1f5f9", marginBottom: 10 },
 
   // Rows
   row:      { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 7 },
   rowLabel: { flex: 1, fontSize: 13, color: "#94A3B8" },
   rowValue: { fontSize: 13, fontWeight: "600", color: "#1a1a1a", maxWidth: "55%", textAlign: "right" },
 
   // Buttons
   btnRow: { flexDirection: "row", gap: 8, marginTop: 10 },
   btnOutline: {
     flex: 1, flexDirection: "row", alignItems: "center",
     justifyContent: "center", gap: 5,
     borderWidth: 1.5, borderColor: ORANGE,
     paddingVertical: 9, borderRadius: 10,
   },
   btnOutlineText: { fontSize: 13, fontWeight: "600", color: ORANGE },
   btnFill: {
     flex: 1, flexDirection: "row", alignItems: "center",
     justifyContent: "center", gap: 5,
     backgroundColor: ORANGE, paddingVertical: 9, borderRadius: 10,
   },
   btnFillText: { fontSize: 13, fontWeight: "600", color: "#fff" },
 
   // Modal sheet
   backdrop: { flex: 1, backgroundColor: "rgba(0,0,0,0.35)", justifyContent: "flex-end" },
   sheet: {
     backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
     paddingHorizontal: 20, paddingTop: 12, paddingBottom: 30,
   },
   handle: {
     width: 36, height: 4, borderRadius: 2,
     backgroundColor: "#E2E8F0", alignSelf: "center", marginBottom: 16,
   },
   sheetTitle:      { fontSize: 16, fontWeight: "700", color: "#1a1a1a", marginBottom: 14 },
   sheetItem: {
     flexDirection: "row", alignItems: "center", gap: 12,
     paddingVertical: 12, borderRadius: 10, paddingHorizontal: 8,
   },
   sheetItemActive: { backgroundColor: "#FFF0E0" },
   sheetItemText:   { flex: 1, fontSize: 14, color: "#334155" },
   sheetCancel: {
     marginTop: 6, paddingVertical: 12, alignItems: "center",
     backgroundColor: "#F8F9FB", borderRadius: 10,
   },
   sheetCancelText: { fontSize: 14, color: "#94A3B8", fontWeight: "600" },
 
   centered: { flex: 1, alignItems: "center", justifyContent: "center" },
   hint:     { color: "#aaa", marginTop: 10, fontSize: 13 },
 });