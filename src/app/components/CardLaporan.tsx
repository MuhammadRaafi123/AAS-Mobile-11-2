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
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.card}>
      <View style={styles.row}>
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>

        <View style={[styles.badge, getBadgeStyle(status)]}>
          <Text style={styles.badgeText}>{status}</Text>
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
  if (status === "selesai") return { backgroundColor: "rgba(34,197,94,0.18)" };
  if (status === "proses") return { backgroundColor: "rgba(234,179,8,0.18)" };
  return { backgroundColor: "rgba(59,130,246,0.18)" };
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(15, 23, 42, 0.96)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.15)",
    borderRadius: 22,
    padding: 16,
    marginBottom: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  title: {
    flex: 1,
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
  },
  desc: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 10,
  },
  date: {
    color: "#64748b",
    fontSize: 12,
    marginTop: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  badgeText: {
    color: "#e2e8f0",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "capitalize",
  },
});