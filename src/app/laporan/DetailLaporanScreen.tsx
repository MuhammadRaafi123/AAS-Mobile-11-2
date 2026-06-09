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

const IMAGE_BASE_URL = "http://10.2.8.106:5000";

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
          <ActivityIndicator color="#2563eb" />
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
    backgroundColor: "#0b1120",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 120,
  },
  backButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    marginBottom: 16,
  },
  backText: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "900",
  },
  loadingBox: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  loadingText: {
    color: "#94a3b8",
    marginTop: 10,
  },
  emptyBox: {
    backgroundColor: "#111827",
    borderRadius: 22,
    padding: 24,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  emptyTitle: {
    color: "#f8fafc",
    fontSize: 17,
    fontWeight: "900",
  },
  emptyText: {
    color: "#94a3b8",
    marginTop: 8,
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 28,
    padding: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  badge: {
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#1d4ed8",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
  },
  badgeText: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "900",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPending: {
    backgroundColor: "#431407",
    borderColor: "#f97316",
  },
  statusProcess: {
    backgroundColor: "#172554",
    borderColor: "#2563eb",
  },
  statusDone: {
    backgroundColor: "#052e16",
    borderColor: "#22c55e",
  },
  statusRejected: {
    backgroundColor: "#450a0a",
    borderColor: "#ef4444",
  },
  statusText: {
    color: "#ffffff",
    fontSize: 11,
    fontWeight: "900",
  },
  image: {
    width: "100%",
    height: 220,
    borderRadius: 22,
    marginTop: 18,
    backgroundColor: "#0f172a",
  },
  noImageBox: {
    width: "100%",
    minHeight: 130,
    borderRadius: 22,
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  noImageTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "900",
  },
  noImageText: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
    marginTop: 6,
  },
  title: {
    color: "#f8fafc",
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 32,
    marginTop: 22,
    marginBottom: 18,
  },
  infoBox: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  descBox: {
    backgroundColor: "#0f172a",
    borderRadius: 18,
    padding: 16,
    marginTop: 4,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1e293b",
  },
  infoLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 6,
  },
  infoValue: {
    color: "#e2e8f0",
    fontSize: 14,
    fontWeight: "800",
  },
  desc: {
    color: "#cbd5e1",
    fontSize: 14,
    lineHeight: 22,
  },
  imageUrlText: {
    color: "#93c5fd",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "700",
  },
  deleteButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#dc2626",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
  },
  deleteButtonDisabled: {
    opacity: 0.65,
  },
  deleteButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },
});