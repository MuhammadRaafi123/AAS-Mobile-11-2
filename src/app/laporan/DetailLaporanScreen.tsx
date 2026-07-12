import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { deleteLaporan, getDetailLaporan } from "../services/laporan.service";

type UserType = {
  id: number;
  email: string;
  nama_lengkap: string;
  role: "masyarakat" | "admin" | "super_admin";
};

type LaporanDetailType = {
  id: number;
  ticket_number?: string;
  user_id?: number;
  category_id?: number;

  judul?: string;
  title?: string;
  deskripsi?: string;
  description?: string;

  status?: string;
  created_at?: string;

  nama_lengkap?: string;
  reporter?: string;

  location_address?: string | null;
  latitude?: string | number | null;
  longitude?: string | number | null;

  file_path?: string | null;
  file_name?: string | null;
  image_url?: string | null;
  attachment?: string | null;
  attachment_url?: string | null;
  file?: string | null;
  gambar?: string | null;
};

type DetailLaporanScreenProps = {
  user: UserType;
  laporanId: number;
  onBack: () => void;
};

const IMAGE_BASE_URL = "http://192.168.1.3:5000";

export default function DetailLaporanScreen({
  user,
  
  laporanId,
  onBack,
}: DetailLaporanScreenProps) {
  const [laporan, setLaporan] = useState<LaporanDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fetchDetail = async () => {
    try {
      setLoading(true);
      setImageError(false);

      const response = await getDetailLaporan(laporanId);

      console.log("DETAIL LAPORAN RESPONSE:", response);

      if (response?.data) {
        setLaporan(response.data);
        return;
      }

      setLaporan(response);
    } catch (error: any) {
      console.log(
        "Gagal mengambil detail laporan:",
        error?.response?.data || error
      );
      setLaporan(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [laporanId]);

  const normalizeImageUrl = (path?: string | null) => {
    if (!path) return "";

    const cleanPath = String(path).trim();

    if (!cleanPath) return "";

    if (cleanPath.startsWith("http://") || cleanPath.startsWith("https://")) {
      return cleanPath;
    }

    if (cleanPath.startsWith("/uploads/")) {
      return `${IMAGE_BASE_URL}${cleanPath}`;
    }

    if (cleanPath.startsWith("uploads/")) {
      return `${IMAGE_BASE_URL}/${cleanPath}`;
    }

    return `${IMAGE_BASE_URL}/uploads/${cleanPath}`;
  };

  const getImageSource = () => {
    if (!laporan) return "";

    return normalizeImageUrl(
      laporan.image_url ||
        laporan.attachment_url ||
        laporan.file_path ||
        laporan.attachment ||
        laporan.file ||
        laporan.gambar ||
        null
    );
  };

  const getStatusLabel = (status?: string) => {
    if (status === "menunggu_verifikasi") return "Menunggu Verifikasi";
    if (status === "diverifikasi") return "Diverifikasi";
    if (status === "diproses") return "Diproses";
    if (status === "selesai") return "Selesai";
    if (status === "ditolak") return "Ditolak";
    if (status === "pending") return "Pending";
    if (status === "proses") return "Diproses";
    return "Menunggu Verifikasi";
  };

  const getStatusStyle = (status?: string) => {
    if (status === "selesai") return styles.statusDone;

    if (status === "diproses" || status === "proses") {
      return styles.statusProcess;
    }

    if (status === "ditolak") return styles.statusRejected;

    return styles.statusPending;
  };

  const canDelete = () => {
    if (!laporan) return false;

    const isAdmin = user.role === "admin" || user.role === "super_admin";
    const isOwner = Number(laporan.user_id) === Number(user.id);

    return isAdmin || isOwner;
  };

  const handleDelete = () => {
    if (!laporan || deleting) return;

    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        "Hapus laporan? Laporan yang dihapus tidak bisa dikembalikan."
      );

      if (confirmed) {
        confirmDelete();
      }

      return;
    }

    Alert.alert(
      "Hapus laporan?",
      "Laporan yang dihapus tidak bisa dikembalikan.",
      [
        {
          text: "Batal",
          style: "cancel",
        },
        {
          text: "Hapus",
          style: "destructive",
          onPress: confirmDelete,
        },
      ]
    );
  };

  const confirmDelete = async () => {
    if (deleting) return;

    try {
      setDeleting(true);

      console.log("DELETE LAPORAN ID:", laporanId);

      const response = await deleteLaporan(laporanId);

      console.log("DELETE LAPORAN RESPONSE:", response);

      if (Platform.OS === "web") {
        window.alert("Laporan berhasil dihapus.");
      } else {
        Alert.alert("Berhasil", "Laporan berhasil dihapus.");
      }

      onBack();
    } catch (error: any) {
      console.log(
        "Gagal menghapus laporan:",
        error?.response?.data || error?.message || error
      );

      const message =
        error?.response?.data?.message ||
        "Terjadi kesalahan saat menghapus laporan.";

      if (Platform.OS === "web") {
        window.alert(message);
      } else {
        Alert.alert("Gagal menghapus", message);
      }
    } finally {
      setDeleting(false);
    }
  };

  const title = laporan?.judul || laporan?.title || "Detail Laporan";
  const description =
    laporan?.deskripsi || laporan?.description || "Tidak ada deskripsi.";
  const status = laporan?.status || "menunggu_verifikasi";
  const reporter =
    laporan?.reporter || laporan?.nama_lengkap || user.nama_lengkap;
  const imageUrl = getImageSource();

  console.log("DETAIL IMAGE URL:", imageUrl);

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onBack}
        style={styles.backButton}
      >
        <Text style={styles.backText}>Kembali</Text>
      </TouchableOpacity>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color="#0EA5E9" />
          <Text style={styles.loadingText}>Memuat detail...</Text>
        </View>
      ) : !laporan ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>Laporan tidak ditemukan</Text>
          <Text style={styles.emptyText}>
            Data laporan ini tidak tersedia atau sudah dihapus.
          </Text>
        </View>
      ) : (
        <View style={styles.card}>
          <View style={styles.row}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Detail Laporan</Text>
            </View>

            <View style={[styles.statusBadge, getStatusStyle(status)]}>
              <Text style={styles.statusText}>{getStatusLabel(status)}</Text>
            </View>
          </View>

          {imageUrl && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              resizeMode="cover"
              onError={(error) => {
                console.log("IMAGE LOAD ERROR:", error.nativeEvent);
                setImageError(true);
              }}
            />
          ) : (
            <View style={styles.noImageBox}>
              <Text style={styles.noImageTitle}>Tidak ada gambar</Text>
              <Text style={styles.noImageText}>
                Laporan ini belum memiliki lampiran foto atau URL gambar tidak
                bisa diakses.
              </Text>
            </View>
          )}

          <Text style={styles.title}>{title}</Text>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Nomor Tiket</Text>
            <Text style={styles.infoValue}>
              {laporan.ticket_number || "Belum tersedia"}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Pelapor</Text>
            <Text style={styles.infoValue}>{reporter}</Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Tanggal</Text>
            <Text style={styles.infoValue}>
              {laporan.created_at || "Belum tersedia"}
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoLabel}>Lokasi</Text>
            <Text style={styles.infoValue}>
              {laporan.location_address || "Belum tersedia"}
            </Text>
          </View>

          <View style={styles.descBox}>
            <Text style={styles.infoLabel}>Deskripsi</Text>
            <Text style={styles.desc}>{description}</Text>
          </View>

          {imageUrl ? (
            <View style={styles.infoBox}>
              <Text style={styles.infoLabel}>URL Gambar</Text>
              <Text style={styles.imageUrlText}>{imageUrl}</Text>
            </View>
          ) : null}

          {canDelete() && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleDelete}
              disabled={deleting}
              style={[
                styles.deleteButton,
                deleting && styles.deleteButtonDisabled,
              ]}
            >
              {deleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.deleteButtonText}>Hapus Laporan</Text>
              )}
            </TouchableOpacity>
          )}
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
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 20,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  backText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "800",
  },
  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 28,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#94A3B8",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    marginTop: 10,
    lineHeight: 22,
    fontSize: 14,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 28,
    padding: 24,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  badge: {
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
  },
  badgeText: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "800",
  },
  statusBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: "#FFF7ED",
    borderColor: "#FDBA74",
  },
  statusProcess: {
    backgroundColor: "#F0F9FF",
    borderColor: "#7DD3FC",
  },
  statusDone: {
    backgroundColor: "#F0FDF4",
    borderColor: "#86EFAC",
  },
  statusRejected: {
    backgroundColor: "#FEF2F2",
    borderColor: "#FECACA",
  },
  statusText: {
    color: "#334155",
    fontSize: 12,
    fontWeight: "800",
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 22,
    marginTop: 20,
    backgroundColor: "#F1F5F9",
  },
  noImageBox: {
    width: "100%",
    minHeight: 140,
    borderRadius: 22,
    marginTop: 20,
    backgroundColor: "#F8FAFC",
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  noImageTitle: {
    color: "#475569",
    fontSize: 15,
    fontWeight: "800",
  },
  noImageText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },
  title: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 32,
    marginTop: 24,
    marginBottom: 20,
    letterSpacing: -0.5,
  },
  infoBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  descBox: {
    backgroundColor: "#F8FAFC",
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  infoLabel: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "700",
  },
  desc: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 24,
  },
  imageUrlText: {
    color: "#0EA5E9",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "600",
  },
  deleteButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 24,
    shadowColor: "#EF4444",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  deleteButtonDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
  },
  deleteButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },
});