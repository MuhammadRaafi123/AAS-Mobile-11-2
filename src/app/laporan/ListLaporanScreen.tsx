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
          tintColor="#0EA5E9"
          colors={["#0EA5E9"]}
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
          <ActivityIndicator color="#0EA5E9" />
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
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  heroCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 26,
    padding: 24,
    marginBottom: 22,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    marginBottom: 16,
  },
  badgeText: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "800",
  },
  title: {
    color: "#0F172A",
    fontSize: 26,
    fontWeight: "900",
    lineHeight: 34,
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  addButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  addButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 26,
  },
  statCard: {
    width: "48%",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    padding: 18,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statValue: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "900",
  },
  statValueDone: {
    color: "#10B981",
    fontSize: 28,
    fontWeight: "900",
  },
  statLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
  },
  sectionCount: {
    color: "#0EA5E9",
    fontSize: 14,
    fontWeight: "800",
  },
  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  loadingText: {
    color: "#64748B",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "600",
  },
  emptyBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 28,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
  },
  emptyTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },
  emptyText: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    textAlign: "center",
  },
  emptyButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    paddingHorizontal: 24,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  emptyButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  listWrapper: {
    gap: 14,
  },
});