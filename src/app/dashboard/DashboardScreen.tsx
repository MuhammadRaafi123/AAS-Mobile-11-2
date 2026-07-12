import { useEffect, useMemo, useState } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
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

const IMAGE_BASE_URL = "http://192.168.1.3:5000";

const reportSteps = [
  {
    num: "01",
    icon: "create-outline" as const,
    title: "Buat Laporan",
    description: "Sampaikan aspirasi atau keluhan melalui formulir digital.",
    color: "#0EA5E9",
    bgColor: "#F0F9FF",
  },
  {
    num: "02",
    icon: "shield-checkmark-outline" as const,
    title: "Verifikasi",
    description: "Laporan akan ditinjau dan diteruskan ke pihak terkait.",
    color: "#8B5CF6",
    bgColor: "#F5F3FF",
  },
  {
    num: "03",
    icon: "analytics-outline" as const,
    title: "Pantau Hasil",
    description: "Ikuti perkembangan laporan sampai selesai ditindaklanjuti.",
    color: "#10B981",
    bgColor: "#F0FDF4",
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
            tintColor="#0EA5E9"
            colors={["#0EA5E9"]}
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
          <View style={styles.stepsSectionHeader}>
            <Text style={styles.stepsTitle}>
              Langkah Mudah <Text style={styles.stepsTitleBlue}>Melapor</Text>
            </Text>

            <Text style={styles.stepsSubtitle}>
              Proses pelaporan yang cepat, transparan, dan mudah dipahami.
            </Text>
          </View>

          <View style={styles.stepsList}>
            {reportSteps.map((step, index) => (
              <View key={step.title} style={styles.stepRow}>
                {/* Left side: number + connector line */}
                <View style={styles.stepLeftCol}>
                  <View style={[styles.stepNumCircle, { backgroundColor: step.color }]}>
                    <Text style={styles.stepNumText}>{step.num}</Text>
                  </View>
                  {index < reportSteps.length - 1 && (
                    <View style={[styles.stepConnector, { backgroundColor: step.color + "30" }]} />
                  )}
                </View>

                {/* Right side: card content */}
                <View style={[styles.stepCard, { backgroundColor: step.bgColor }]}>
                  <View style={[styles.stepIconBox, { backgroundColor: step.color + "18" }]}>
                    <Ionicons name={step.icon} size={22} color={step.color} />
                  </View>

                  <View style={styles.stepTextBox}>
                    <Text style={styles.stepTitle}>{step.title}</Text>
                    <Text style={styles.stepDescription}>{step.description}</Text>
                  </View>
                </View>
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
            <ActivityIndicator color="#0EA5E9" size="large" />
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
                      <ActivityIndicator color="#0EA5E9" />
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
    backgroundColor: "#F8FAFC",
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 120,
  },
  headerCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    marginBottom: 20,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
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
    color: "#64748B",
    fontSize: 14,
    fontWeight: "700",
  },
  name: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "900",
    marginTop: 4,
    letterSpacing: -0.5,
  },
  roleText: {
    color: "#0EA5E9",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 6,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: "#E0F2FE",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  avatarText: {
    color: "#0284C7",
    fontSize: 22,
    fontWeight: "900",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginVertical: 20,
  },
  headerTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },
  headerSubtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
  },
  primaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    flex: 1,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "800",
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 18,
    padding: 16,
    marginBottom: 26,
  },
  infoDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#22C55E",
    marginRight: 14,
  },
  infoContent: {
    flex: 1,
  },
  infoTitle: {
    color: "#166534",
    fontSize: 14,
    fontWeight: "800",
  },
  infoText: {
    color: "#15803D",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
  },
  statsGrid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 12,
  },
  statMainColumn: {
    flex: 1.15,
    gap: 12,
  },
  statCardTotalSmall: {
    flex: 1,
    minHeight: 80,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    shadowColor: "#94A3B8",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statCardRejectedSmall: {
    flex: 1,
    minHeight: 80,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
  },
  statSide: {
    flex: 1,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
    justifyContent: "center",
    shadowColor: "#94A3B8",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statFullRow: {
    marginBottom: 30,
  },
  statCardFull: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#94A3B8",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  statLabel: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "800",
  },
  statValueTotalSmall: {
    color: "#0F172A",
    fontSize: 32,
    fontWeight: "900",
    marginTop: 4,
  },
  statValue: {
    color: "#0F172A",
    fontSize: 28,
    fontWeight: "900",
  },
  statValueDone: {
    color: "#10B981",
    fontSize: 36,
    fontWeight: "900",
  },
  statValueRejected: {
    color: "#EF4444",
    fontSize: 28,
    fontWeight: "900",
  },
  statLabelSmall: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 6,
  },
  statHint: {
    color: "#94A3B8",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  stepsSection: {
    marginBottom: 30,
  },
  stepsSectionHeader: {
    backgroundColor: "#FFFFFF",
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 18,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  stepsTitle: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.2,
  },
  stepsTitleBlue: {
    color: "#0EA5E9",
  },
  stepsSubtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 8,
  },
  stepsList: {
    gap: 0,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  stepLeftCol: {
    width: 40,
    alignItems: "center",
  },
  stepNumCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
  },
  stepNumText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900",
  },
  stepConnector: {
    width: 3,
    flex: 1,
    marginVertical: 4,
    borderRadius: 2,
  },
  stepCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginLeft: 12,
    marginBottom: 10,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  stepIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  stepTextBox: {
    flex: 1,
  },
  stepTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
    marginBottom: 3,
  },
  stepDescription: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 19,
  },
  gallerySection: {
    marginBottom: 30,
  },
  gallerySubtitle: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4,
  },
  galleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 14,
  },
  galleryCard: {
    width: "48%",
    height: 180,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#94A3B8",
    shadowOpacity: 0.15,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
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
    padding: 12,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
  },
  galleryTitle: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  galleryStatus: {
    color: "#BAE6FD",
    fontSize: 11,
    fontWeight: "800",
    marginTop: 4,
  },
  galleryEmpty: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 20,
  },
  galleryEmptyTitle: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "800",
  },
  galleryEmptyText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 6,
  },
  seeAllText: {
    color: "#0EA5E9",
    fontSize: 14,
    fontWeight: "800",
    marginTop: 4,
  },
  latestList: {
    gap: 14,
  },
  loadingBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
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
    borderRadius: 20,
    padding: 24,
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
    marginTop: 8,
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    paddingHorizontal: 20,
    justifyContent: "center",
  },
  modalCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    maxHeight: "88%",
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalScrollContent: {
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeText: {
    color: "#475569",
    fontSize: 24,
    lineHeight: 26,
    fontWeight: "700",
  },
  modalImage: {
    width: "100%",
    height: 220,
    borderRadius: 20,
    backgroundColor: "#F1F5F9",
  },
  modalInfo: {
    marginTop: 16,
  },
  modalTitleRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  modalReportTitle: {
    flex: 1,
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 24,
  },
  modalStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  modalStatusText: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "800",
  },
  modalDescription: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 12,
  },
  commentListBox: {
    marginTop: 24,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    padding: 16,
  },
  commentListHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },
  commentListTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "900",
  },
  refreshCommentText: {
    color: "#0EA5E9",
    fontSize: 13,
    fontWeight: "800",
  },
  commentLoadingBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  commentLoadingText: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "700",
  },
  commentEmptyText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
  },
  commentList: {
    gap: 12,
  },
  commentItem: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  commentUser: {
    color: "#0EA5E9",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 6,
  },
  commentText: {
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
  },
  commentDate: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 8,
  },
  commentBox: {
    marginTop: 24,
  },
  commentLabel: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "900",
    marginBottom: 10,
  },
  commentInput: {
    minHeight: 100,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: "#0F172A",
    fontSize: 14,
    lineHeight: 20,
  },
  commentButton: {
    height: 50,
    borderRadius: 16,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 14,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  commentButtonDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
  },
  commentButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});