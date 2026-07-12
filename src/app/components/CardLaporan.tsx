import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

type LaporanType = {
  id: number;
  judul?: string;
  title?: string;
  deskripsi?: string;
  description?: string;
  status?: "pending" | "proses" | "selesai" | string;
  created_at?: string;
};

type CardLaporanProps = {
  item: LaporanType;
  onPress: () => void;
};

export default function CardLaporan({ item, onPress }: CardLaporanProps) {
  const title = item.judul || item.title || "Tanpa Judul";
  const desc = item.deskripsi || item.description || "Tidak ada deskripsi";
  const status = item.status || "pending";

  return (
    <TouchableOpacity activeOpacity={0.8} onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>

        <View style={[styles.badge, getBadgeStyle(status)]}>
          <Text style={[styles.badgeText, getBadgeTextStyle(status)]}>{status}</Text>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.desc}>
        {desc}
      </Text>

      <Text style={styles.date}>{item.created_at || "Baru saja"}</Text>
    </TouchableOpacity>
  );
}

const getBadgeStyle = (status: string) => {
  if (status === "selesai") return { backgroundColor: "#F0FDF4", borderColor: "#86EFAC" };
  if (status === "diproses" || status === "proses") return { backgroundColor: "#FFF7ED", borderColor: "#FDBA74" };
  if (status === "ditolak") return { backgroundColor: "#FEF2F2", borderColor: "#FECACA" };
  return { backgroundColor: "#F0F9FF", borderColor: "#BAE6FD" };
};

const getBadgeTextStyle = (status: string) => {
  if (status === "selesai") return { color: "#166534" };
  if (status === "diproses" || status === "proses") return { color: "#9A3412" };
  if (status === "ditolak") return { color: "#991B1B" };
  return { color: "#0284C7" };
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
  desc: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  date: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 14,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "capitalize",
  },
});