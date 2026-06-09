import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import CardLaporan from "../components/CardLaporan";
import { getLaporan } from "../services/laporan.service";
import { createKomentar, getKomentar } from "../services/komentar.service";

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
  description?: string;
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

type DashboardScreenProps = {
  user: UserType;
  onAdd: () => void;
  onList: () => void;
  onDetail: (id: number) => void;
  refreshKey?: number;
};

type GalleryItem = {
  id: number;
  title: string;
  description: string;
  status: string;
  imageUrl: string;
};

type CommentItem = {
  id: number;
  user_id?: number;
  comment: string;
  created_at?: string;
  user_name?: string;
};

const IMAGE_BASE_URL = "http://10.2.8.106:5000";

const reportSteps = [
  {
    icon: "▣",
    title: "Buat Laporan",
    description: "Sampaikan aspirasi atau keluhan melalui formulir digital.",
  },
  {
    icon: "◎",
    title: "Verifikasi",
    description: "Laporan akan ditinjau dan diteruskan ke pihak terkait.",
  },
  {
    icon: "✓",
    title: "Pantau Hasil",
    description: "Ikuti perkembangan laporan sampai selesai ditindaklanjuti.",
  },
];

export default function DashboardScreen({
  user,
  onAdd,
  onList,
  onDetail,
  refreshKey = 0,
}: DashboardScreenProps) {
  const [laporan, setLaporan] = useState<LaporanType[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedGallery, setSelectedGallery] = useState<GalleryItem | null>(
    null
  );

  const [comment, setComment] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(false);

  const fetchDashboard = async () => {
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
      console.log("Gagal mengambil data dashboard:", error);
      setLaporan([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchComments = async (laporanId: number) => {
    try {
      setCommentsLoading(true);

      const response = await getKomentar(laporanId);

      if (Array.isArray(response)) {
        setComments(response);
        return;
      }

      if (Array.isArray(response?.data)) {
        setComments(response.data);
        return;
      }

      setComments([]);
    } catch (error) {
      console.log("Gagal mengambil komentar:", error);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDashboard();
  }, [refreshKey]);

  const stats = useMemo(() => {
    const total = laporan.length;

    const pending = laporan.filter(
      (item) =>
        item.status === "menunggu_verifikasi" ||
        item.status === "diverifikasi"
    ).length;

    const proses = laporan.filter((item) => item.status === "diproses").length;
    const selesai = laporan.filter((item) => item.status === "selesai").length;
    const ditolak = laporan.filter((item) => item.status === "ditolak").length;

    return {
      total,
      pending,
      proses,
      selesai,
      ditolak,
    };
  }, [laporan]);

  const latestLaporan = laporan.slice(0, 3);

  const normalizeImageUrl = (path?: string | null) => {
    if (!path) return "";

    const cleanPath = String(path).replaceAll("\\", "/");

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

  const getStatusLabel = (status?: string) => {
    if (status === "menunggu_verifikasi") return "Menunggu Verifikasi";
    if (status === "diverifikasi") return "Diverifikasi";
    if (status === "diproses") return "Diproses";
    if (status === "selesai") return "Selesai";
    if (status === "ditolak") return "Ditolak";
    return "Menunggu Verifikasi";
  };

  const galleryItems = useMemo(() => {
    return laporan
      .map((item) => {
        const rawImage = item.image_url || item.file_path || "";
        const imageUrl = normalizeImageUrl(rawImage);

        if (!imageUrl) return null;

        return {
          id: item.id,
          title: item.title || "Laporan Masyarakat",
          description: item.description || "Belum ada deskripsi laporan.",
          status: item.status || "menunggu_verifikasi",
          imageUrl,
        };
      })
      .filter(Boolean) as GalleryItem[];
  }, [laporan]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  const getRoleLabel = () => {
    if (user.role === "super_admin") return "Super Admin";
    if (user.role === "admin") return "Admin";
    return "Masyarakat";
  };

  const openGalleryDetail = (item: GalleryItem) => {
    setSelectedGallery(item);
    setComment("");
    setComments([]);
    fetchComments(item.id);
  };

  const closeGalleryDetail = () => {
    if (commentLoading) return;

    setSelectedGallery(null);
    setComment("");
    setComments([]);
  };

  const handleSubmitComment = async () => {
    if (!selectedGallery || commentLoading) return;

    const cleanComment = comment.trim();

    if (!cleanComment) {
      Alert.alert("Komentar kosong", "Tulis komentar terlebih dahulu.");
      return;
    }

    try {
      setCommentLoading(true);

      const newComment = await createKomentar(selectedGallery.id, cleanComment);

      Alert.alert("Berhasil", "Komentar berhasil ditambahkan.");
      setComment("");

      if (newComment?.comment) {
        setComments((prev) => [...prev, newComment]);
      } else if (newComment?.data?.comment) {
        setComments((prev) => [...prev, newComment.data]);
      } else {
        await fetchComments(selectedGallery.id);
      }
    } catch (error: any) {
      console.log("Gagal mengirim komentar:", error?.response?.data || error);

      Alert.alert(
        "Gagal mengirim komentar",
        error?.response?.data?.message ||
          "Terjadi kesalahan saat mengirim komentar."
      );
    } finally {
      setCommentLoading(false);
    }
  };

  return (
    <>
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
        <View style={styles.headerCard}>
          <View style={styles.headerTop}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>Halo,</Text>

              <Text numberOfLines={1} style={styles.name}>
                {user.nama_lengkap}
              </Text>

              <Text style={styles.roleText}>{getRoleLabel()}</Text>
            </View>

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.nama_lengkap?.charAt(0)?.toUpperCase() || "U"}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <Text style={styles.headerTitle}>Ringkasan Pengaduan</Text>

          <Text style={styles.headerSubtitle}>
            Lihat perkembangan laporan dan aktivitas terbaru dari akun kamu.
          </Text>

          <View style={styles.actionRow}>
            {user.role === "masyarakat" && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={onAdd}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Buat Laporan</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={onList}
              style={styles.secondaryButton}
            >
              <Text style={styles.secondaryButtonText}>Lihat Laporan</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoDot} />

          <View style={styles.infoContent}>
            <Text style={styles.infoTitle}>Layanan aktif</Text>
            <Text style={styles.infoText}>
              Data laporan akan diperbarui saat halaman ditarik ke bawah.
            </Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Statistik</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statMainColumn}>
            <View style={styles.statCardTotalSmall}>
              <Text style={styles.statLabel}>Total Laporan</Text>
              <Text style={styles.statValueTotalSmall}>{stats.total}</Text>
              <Text style={styles.statHint}>Semua laporan</Text>
            </View>

            <View style={styles.statCardRejectedSmall}>
              <Text style={styles.statValueRejected}>{stats.ditolak}</Text>
              <Text style={styles.statLabelSmall}>Ditolak</Text>
            </View>
          </View>

          <View style={styles.statSide}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.pending}</Text>
              <Text style={styles.statLabelSmall}>Menunggu</Text>
            </View>

            <View style={styles.statCard}>
              <Text style={styles.statValue}>{stats.proses}</Text>
              <Text style={styles.statLabelSmall}>Diproses</Text>
            </View>
          </View>
        </View>

        <View style={styles.statFullRow}>
          <View style={styles.statCardFull}>
            <View>
              <Text style={styles.statLabelSmall}>Selesai</Text>
              <Text style={styles.statHint}>Laporan yang sudah ditangani</Text>
            </View>

            <Text style={styles.statValueDone}>{stats.selesai}</Text>
          </View>
        </View>

        <View style={styles.stepsSection}>
          <Text style={styles.stepsTitle}>
            Langkah Mudah <Text style={styles.stepsTitleBlue}>Melapor</Text>
          </Text>

          <Text style={styles.stepsSubtitle}>
            Proses pelaporan yang cepat, transparan, dan mudah dipahami.
          </Text>

          <View style={styles.stepsList}>
            {reportSteps.map((step) => (
              <View key={step.title} style={styles.stepCard}>
                <View style={styles.stepIconBox}>
                  <Text style={styles.stepIcon}>{step.icon}</Text>
                </View>

                <Text style={styles.stepTitle}>{step.title}</Text>
                <Text style={styles.stepDescription}>{step.description}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.gallerySection}>
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Galeri Laporan</Text>
              <Text style={styles.gallerySubtitle}>
                Dokumentasi gambar dari laporan yang masuk.
              </Text>
            </View>

            <TouchableOpacity activeOpacity={0.8} onPress={onList}>
              <Text style={styles.seeAllText}>Semua</Text>
            </TouchableOpacity>
          </View>

          {galleryItems.length === 0 ? (
            <View style={styles.galleryEmpty}>
              <Text style={styles.galleryEmptyTitle}>Belum ada gambar</Text>
              <Text style={styles.galleryEmptyText}>
                Gambar laporan akan tampil di sini setelah laporan memiliki
                lampiran foto.
              </Text>
            </View>
          ) : (
            <View style={styles.galleryGrid}>
              {galleryItems.slice(0, 4).map((item) => (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.85}
                  onPress={() => openGalleryDetail(item)}
                  style={styles.galleryCard}
                >
                  <Image
                    source={{ uri: item.imageUrl }}
                    style={styles.galleryImage}
                    resizeMode="cover"
                  />

                  <View style={styles.galleryOverlay}>
                    <Text numberOfLines={1} style={styles.galleryTitle}>
                      {item.title}
                    </Text>

                    <Text style={styles.galleryStatus}>
                      {getStatusLabel(item.status)}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Laporan Terbaru</Text>

          <TouchableOpacity activeOpacity={0.8} onPress={onList}>
            <Text style={styles.seeAllText}>Lihat semua</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator color="#2563eb" />
            <Text style={styles.loadingText}>Memuat data laporan...</Text>
          </View>
        ) : latestLaporan.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>Belum ada laporan</Text>
            <Text style={styles.emptyText}>
              Laporan terbaru akan muncul di sini setelah ada data yang masuk.
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
          <View style={styles.latestList}>
            {latestLaporan.map((item) => (
              <CardLaporan
                key={item.id}
                item={item}
                onPress={() => onDetail(item.id)}
              />
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={selectedGallery !== null}
        transparent
        animationType="fade"
        onRequestClose={closeGalleryDetail}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Detail Laporan</Text>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeGalleryDetail}
                disabled={commentLoading}
                style={styles.closeButton}
              >
                <Text style={styles.closeText}>×</Text>
              </TouchableOpacity>
            </View>

            {selectedGallery && (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.modalScrollContent}
              >
                <Image
                  source={{ uri: selectedGallery.imageUrl }}
                  style={styles.modalImage}
                  resizeMode="cover"
                />

                <View style={styles.modalInfo}>
                  <View style={styles.modalTitleRow}>
                    <Text numberOfLines={2} style={styles.modalReportTitle}>
                      {selectedGallery.title}
                    </Text>

                    <View style={styles.modalStatusBadge}>
                      <Text style={styles.modalStatusText}>
                        {getStatusLabel(selectedGallery.status)}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.modalDescription}>
                    {selectedGallery.description}
                  </Text>
                </View>

                <View style={styles.commentListBox}>
                  <View style={styles.commentListHeader}>
                    <Text style={styles.commentListTitle}>Komentar Masuk</Text>

                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => fetchComments(selectedGallery.id)}
                      disabled={commentsLoading}
                    >
                      <Text style={styles.refreshCommentText}>Refresh</Text>
                    </TouchableOpacity>
                  </View>

                  {commentsLoading ? (
                    <View style={styles.commentLoadingBox}>
                      <ActivityIndicator color="#2563eb" />
                      <Text style={styles.commentLoadingText}>
                        Memuat komentar...
                      </Text>
                    </View>
                  ) : comments.length === 0 ? (
                    <Text style={styles.commentEmptyText}>
                      Belum ada komentar untuk laporan ini.
                    </Text>
                  ) : (
                    <View style={styles.commentList}>
                      {comments.map((item) => (
                        <View key={item.id} style={styles.commentItem}>
                          <Text style={styles.commentUser}>
                            {item.user_name || "Pengguna"}
                          </Text>

                          <Text style={styles.commentText}>{item.comment}</Text>

                          {item.created_at && (
                            <Text style={styles.commentDate}>
                              {item.created_at}
                            </Text>
                          )}
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                <View style={styles.commentBox}>
                  <Text style={styles.commentLabel}>Tulis Komentar</Text>

                  <TextInput
                    value={comment}
                    onChangeText={setComment}
                    editable={!commentLoading}
                    placeholder="Tulis komentar untuk laporan ini..."
                    placeholderTextColor="#64748b"
                    multiline
                    textAlignVertical="top"
                    style={styles.commentInput}
                  />

                  <TouchableOpacity
                    activeOpacity={0.85}
                    onPress={handleSubmitComment}
                    disabled={commentLoading}
                    style={[
                      styles.commentButton,
                      commentLoading && styles.commentButtonDisabled,
                    ]}
                  >
                    {commentLoading ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <Text style={styles.commentButtonText}>
                        Kirim Komentar
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </>
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
  headerCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  userInfo: {
    flex: 1,
    paddingRight: 14,
  },
  greeting: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "700",
  },
  name: {
    color: "#f9fafb",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 4,
  },
  roleText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 6,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#1e3a8a",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 20,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    backgroundColor: "#1f2937",
    marginVertical: 18,
  },
  headerTitle: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#9ca3af",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 20,
  },
  primaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
  secondaryButton: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "900",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 18,
    padding: 14,
    marginBottom: 22,
  },
  infoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22c55e",
    marginRight: 12,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: "#f9fafb",
    fontSize: 13,
    fontWeight: "900",
  },
  infoText: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 3,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 12,
    gap: 12,
  },
  sectionTitle: {
    color: "#f9fafb",
    fontSize: 18,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  statMainColumn: {
    flex: 1.15,
    gap: 10,
  },
  statCardTotalSmall: {
    flex: 1,
    minHeight: 70,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 20,
    padding: 14,
    justifyContent: "center",
  },
  statCardRejectedSmall: {
    flex: 1,
    minHeight: 70,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#7f1d1d",
    borderRadius: 20,
    padding: 14,
    justifyContent: "center",
  },
  statSide: {
    flex: 1,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
  },
  statFullRow: {
    marginBottom: 26,
  },
  statCardFull: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  statLabel: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "800",
  },
  statValueTotalSmall: {
    color: "#f9fafb",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 4,
  },
  statValue: {
    color: "#f9fafb",
    fontSize: 28,
    fontWeight: "900",
  },
  statValueDone: {
    color: "#22c55e",
    fontSize: 30,
    fontWeight: "900",
  },
  statValueRejected: {
    color: "#ef4444",
    fontSize: 28,
    fontWeight: "900",
  },
  statLabelSmall: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
  },
  statHint: {
    color: "#6b7280",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  stepsSection: {
    marginBottom: 26,
  },
  stepsTitle: {
    color: "#f9fafb",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  stepsTitleBlue: {
    color: "#60a5fa",
  },
  stepsSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 7,
    marginBottom: 14,
  },
  stepsList: {
    gap: 12,
  },
  stepCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 22,
    padding: 18,
  },
  stepIconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#172554",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  stepIcon: {
    color: "#60a5fa",
    fontSize: 22,
    fontWeight: "900",
  },
  stepTitle: {
    color: "#f9fafb",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 10,
  },
  stepDescription: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 22,
  },
  gallerySection: {
    marginBottom: 26,
  },
  gallerySubtitle: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  galleryGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  rowGap: 12,
},

galleryCard: {
  width: "48%",
  height: 165,
  borderRadius: 18,
  overflow: "hidden",
  backgroundColor: "#111827",
  borderWidth: 1,
  borderColor: "#1f2937",
},

galleryImage: {
  width: "100%",
  height: "100%",
},

galleryOverlay: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  padding: 10,
  backgroundColor: "rgba(2, 6, 23, 0.78)",
},

galleryTitle: {
  color: "#f9fafb",
  fontSize: 12,
  fontWeight: "900",
},

galleryStatus: {
  color: "#93c5fd",
  fontSize: 11,
  fontWeight: "800",
  marginTop: 3,
}, 
  galleryEmpty: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 20,
    padding: 18,
  },
  galleryEmptyTitle: {
    color: "#f9fafb",
    fontSize: 15,
    fontWeight: "900",
  },
  galleryEmptyText: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
  },
  seeAllText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4,
  },
  latestList: {
    gap: 10,
  },
  loadingBox: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 22,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  loadingText: {
    color: "#9ca3af",
    marginTop: 10,
    fontSize: 13,
  },
  emptyBox: {
    backgroundColor: "#111827",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  emptyTitle: {
    color: "#f9fafb",
    fontSize: 16,
    fontWeight: "900",
  },
  emptyText: {
    color: "#9ca3af",
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.82)",
    paddingHorizontal: 18,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 24,
    padding: 16,
    maxHeight: "88%",
  },
  modalScrollContent: {
    paddingBottom: 4,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  modalTitle: {
    color: "#f9fafb",
    fontSize: 17,
    fontWeight: "900",
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#f9fafb",
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "700",
  },
  modalImage: {
    width: "100%",
    height: 210,
    borderRadius: 18,
    backgroundColor: "#0f172a",
  },
  modalInfo: {
    marginTop: 14,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  modalReportTitle: {
    flex: 1,
    color: "#f9fafb",
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 23,
  },
  modalStatusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#1d4ed8",
  },
  modalStatusText: {
    color: "#bfdbfe",
    fontSize: 11,
    fontWeight: "900",
  },
  modalDescription: {
    color: "#cbd5e1",
    fontSize: 13,
    lineHeight: 21,
    marginTop: 10,
  },
  commentListBox: {
    marginTop: 18,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    borderRadius: 18,
    padding: 14,
  },
  commentListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  commentListTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "900",
  },
  refreshCommentText: {
    color: "#60a5fa",
    fontSize: 12,
    fontWeight: "900",
  },
  commentLoadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  commentLoadingText: {
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: "700",
  },
  commentEmptyText: {
    color: "#94a3b8",
    fontSize: 12,
    lineHeight: 18,
  },
  commentList: {
    gap: 10,
  },
  commentItem: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 14,
    padding: 12,
  },
  commentUser: {
    color: "#93c5fd",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 5,
  },
  commentText: {
    color: "#e5e7eb",
    fontSize: 13,
    lineHeight: 19,
  },
  commentDate: {
    color: "#64748b",
    fontSize: 10,
    fontWeight: "700",
    marginTop: 7,
  },
  commentBox: {
    marginTop: 18,
  },
  commentLabel: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "900",
    marginBottom: 9,
  },
  commentInput: {
    minHeight: 96,
    borderRadius: 16,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#f9fafb",
    fontSize: 13,
    lineHeight: 19,
  },
  commentButton: {
    height: 46,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
  },
  commentButtonDisabled: {
    opacity: 0.65,
  },
  commentButtonText: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },
});