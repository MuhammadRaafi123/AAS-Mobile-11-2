import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CardLaporan from "../components/CardLaporan";
import { getLaporan } from "../services/laporan.service";

type UserType = {
  id: number;
  email: string;
  nama_lengkap: string;
  role: "masyarakat" | "admin" | "super_admin";
};

type ComplaintStatus =
  | "menunggu_verifikasi"
  | "diverifikasi"
  | "diproses"
  | "selesai"
  | "ditolak";

type LaporanType = {
  id: number;
  ticket_number?: string;
  user_id?: number;
  category_id?: number;
  title?: string;
  judul?: string;
  description?: string;
  deskripsi?: string;
  location_address?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;
  status?: ComplaintStatus | string;
  created_at?: string;

  reporter?: string;
  rating?: number | null;
  komentar?: string | null;

  file_path?: string | null;
  file_name?: string | null;
  image_url?: string | null;
};

type ListLaporanScreenProps = {
  user: UserType;
  onAdd: () => void;
  onDetail: (id: number) => void;
  refreshKey?: number;
};

export default function ListLaporanScreen({
  user,
  onAdd,
  onDetail,
  refreshKey = 0,
}: ListLaporanScreenProps) {
  const [laporan, setLaporan] = useState<LaporanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLaporan = async () => {
    try {
      const response = await getLaporan();

      if (Array.isArray(response)) {
        setLaporan(response);
        return;
      }

      if (Array.isArray(response?.data)) {
        setLaporan(response.data);
        return;
      }

      setLaporan([]);
    } catch (error) {
      console.log("Gagal mengambil laporan:", error);
      setLaporan([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchLaporan();
  }, [refreshKey]);

  const stats = useMemo(() => {
    const total = laporan.length;

    const pending = laporan.filter(
      (item) =>
        item.status === "menunggu_verifikasi" ||
        item.status === "diverifikasi"
    ).length;

    const diproses = laporan.filter(
      (item) => item.status === "diproses"
    ).length;

    const selesai = laporan.filter((item) => item.status === "selesai").length;

    return {
      total,
      pending,
      diproses,
      selesai,
    };
  }, [laporan]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchLaporan();
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor="#e5e7eb"
          colors={["#2563eb"]}
        />
      }
    >
      <View style={styles.heroCard}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Dashboard Laporan</Text>
        </View>

        <Text style={styles.title}>Pantau Pengaduan Masyarakat</Text>

        <Text style={styles.subtitle}>
          Kelola laporan, lihat status, dan pantau perkembangan pengaduan secara
          real-time.
        </Text>

        {user.role === "masyarakat" && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onAdd}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>Buat Laporan</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Menunggu</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.diproses}</Text>
          <Text style={styles.statLabel}>Diproses</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statValueDone}>{stats.selesai}</Text>
          <Text style={styles.statLabel}>Selesai</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Daftar Laporan</Text>
        <Text style={styles.sectionCount}>{laporan.length} data</Text>
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#2563eb" />
          <Text style={styles.loadingText}>Memuat laporan...</Text>
        </View>
      ) : laporan.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Belum ada laporan</Text>
          <Text style={styles.emptyText}>
            Data laporan akan muncul di sini setelah tersedia.
          </Text>

          {user.role === "masyarakat" && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onAdd}
              style={styles.emptyButton}
            >
              <Text style={styles.emptyButtonText}>Buat laporan pertama</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View style={styles.listWrapper}>
          {laporan.map((item) => (
            <CardLaporan
              key={item.id}
              item={item}
              onPress={() => onDetail(item.id)}
            />
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0b1120",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 26,
    padding: 22,
    marginBottom: 18,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#1d4ed8",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "900",
  },
  title: {
    color: "#f8fafc",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 32,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  addButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 22,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 22,
    padding: 16,
  },
  statValue: {
    color: "#f8fafc",
    fontSize: 25,
    fontWeight: "900",
  },
  statValueDone: {
    color: "#22c55e",
    fontSize: 25,
    fontWeight: "900",
  },
  statLabel: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  sectionTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  sectionCount: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "800",
  },
  loadingBox: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 10,
    fontSize: 13,
  },
  emptyBox: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  emptyButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  listWrapper: {
    gap: 10,
  },
});