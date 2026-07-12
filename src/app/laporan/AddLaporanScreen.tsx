import { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import Button from "../components/Button";
import Input from "../components/Input";
import { createLaporan } from "../services/laporan.service";
import { getProfile } from "../services/auth.service";

type UserType = {
  id: number;
  email: string;
  nama_lengkap: string;
  nik?: string | null;
  no_telp?: string | null;
  role: "masyarakat" | "admin" | "super_admin";
  status?: string;
  created_at?: string;
};

type AddLaporanScreenProps = {
  user: UserType;
  onBack: () => void;
  onSuccess: () => void;
};

type CategoryType = {
  id: string;
  name: string;
};

type BuktiType = {
  uri: string;
  name: string;
  type: string;
};

const categories: CategoryType[] = [
  { id: "1", name: "Infrastruktur" },
  { id: "2", name: "Kebersihan" },
  { id: "3", name: "Keamanan" },
  { id: "4", name: "Pelayanan Publik" },
  { id: "5", name: "Lingkungan" },
  { id: "6", name: "Lainnya" },
];

export default function AddLaporanScreen({
  user,
  onBack,
  onSuccess,
}: AddLaporanScreenProps) {
  const [profileUser, setProfileUser] = useState<UserType>(user);

  const namaLengkap = profileUser.nama_lengkap || user.nama_lengkap || "-";
  const nomorTelpon = profileUser.no_telp || user.no_telp || "Belum tersedia";

  const [categoryId, setCategoryId] = useState("");
  const [lokasiKejadian, setLokasiKejadian] = useState("");
  const [judul, setJudul] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [bukti, setBukti] = useState<BuktiType | null>(null);
  const [loading, setLoading] = useState(false);

  const selectedCategory = categories.find((item) => item.id === categoryId);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await getProfile();

        setProfileUser({
          ...user,
          ...profile,
          no_telp: profile?.no_telp || user.no_telp || "",
          nik: profile?.nik || user.nik || "",
        });
      } catch (error: any) {
        console.log(
          "GET PROFILE ADD LAPORAN ERROR:",
          error?.response?.data || error
        );

        setProfileUser(user);
      }
    };

    loadProfile();
  }, [user]);

  const getFileExtension = (uri: string) => {
    const cleanUri = uri.split("?")[0];
    const extension = cleanUri.split(".").pop();

    if (!extension || extension.length > 5 || extension.includes("/")) {
      return "jpg";
    }

    return extension.toLowerCase();
  };

  const getMimeType = (extension: string) => {
    if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
    if (extension === "png") return "image/png";
    if (extension === "webp") return "image/webp";
    return "image/jpeg";
  };

  const handlePickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        "Izin Dibutuhkan",
        "Aplikasi membutuhkan izin galeri untuk memilih bukti laporan."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    if (!asset?.uri) {
      Alert.alert("Gagal", "Gambar tidak valid. Silakan pilih gambar lain.");
      return;
    }

    const extension = getFileExtension(asset.uri);
    const fileName =
      asset.fileName || `bukti-laporan-${Date.now()}.${extension}`;
    const fileType = asset.mimeType || getMimeType(extension);

    setBukti({
      uri: asset.uri,
      name: fileName,
      type: fileType,
    });
  };

  const appendImageToFormData = async (formData: FormData, image: BuktiType) => {
    if (Platform.OS === "web") {
      const response = await fetch(image.uri);
      const blob = await response.blob();

      const file = new File([blob], image.name, {
        type: image.type,
      });

      formData.append("attachment", file);
      return;
    }

    formData.append("attachment", {
      uri: image.uri,
      name: image.name,
      type: image.type,
    } as any);
  };

  const handleSubmit = async () => {
    const cleanCategoryId = categoryId.trim();
    const cleanLokasi = lokasiKejadian.trim();
    const cleanJudul = judul.trim();
    const cleanDeskripsi = deskripsi.trim();

    if (!cleanCategoryId || !cleanLokasi || !cleanJudul || !cleanDeskripsi) {
      Alert.alert(
        "Gagal",
        "Kategori, lokasi kejadian, judul, dan deskripsi wajib diisi."
      );
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      formData.append("category_id", cleanCategoryId);
      formData.append("title", cleanJudul);
      formData.append("description", cleanDeskripsi);
      formData.append("location_address", cleanLokasi);
      formData.append("nama_pelapor", namaLengkap);
      formData.append(
        "no_telp",
        nomorTelpon === "Belum tersedia" ? "" : nomorTelpon
      );
      formData.append("latitude", "");
      formData.append("longitude", "");

      if (bukti) {
        await appendImageToFormData(formData, bukti);
      }

      console.log("CREATE LAPORAN FORM DATA:", {
        category_id: cleanCategoryId,
        title: cleanJudul,
        description: cleanDeskripsi,
        location_address: cleanLokasi,
        nama_pelapor: namaLengkap,
        no_telp: nomorTelpon,
        attachment: bukti,
        platform: Platform.OS,
      });

      await createLaporan(formData);

      Alert.alert("Berhasil", "Laporan berhasil dibuat.");

      setCategoryId("");
      setLokasiKejadian("");
      setJudul("");
      setDeskripsi("");
      setBukti(null);

      onSuccess();
    } catch (error: any) {
      console.log(
        "CREATE LAPORAN MOBILE ERROR:",
        error?.response?.data || error?.message || error
      );

      Alert.alert(
        "Gagal",
        error?.response?.data?.message || "Laporan gagal dibuat."
      );
    } finally {
      setLoading(false);
    }
  };

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

      <View style={styles.card}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Form Pengaduan</Text>
        </View>

        <Text style={styles.title}>Buat Laporan Baru</Text>

        <Text style={styles.subtitle}>
          Lengkapi data laporan dengan jelas agar admin dapat memproses
          pengaduan kamu dengan cepat.
        </Text>

        <View style={styles.identityCard}>
          <View style={styles.identityAvatar}>
            <Text style={styles.identityAvatarText}>
              {namaLengkap.charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={styles.identityContent}>
            <Text style={styles.identityLabel}>Data Pelapor</Text>
            <Text style={styles.identityName}>{namaLengkap}</Text>
            <Text style={styles.identityPhone}>{nomorTelpon}</Text>
          </View>
        </View>

        <View style={styles.form}>
          <Input
            label="Nama Lengkap"
            value={namaLengkap}
            onChangeText={() => {}}
            placeholder="Nama lengkap"
          />

          <Input
            label="Nomor Telepon"
            value={nomorTelpon}
            onChangeText={() => {}}
            placeholder="Nomor telepon"
          />

          <Text style={styles.label}>Kategori</Text>

          <View style={styles.categoryWrapper}>
            {categories.map((item) => {
              const active = categoryId === item.id;

              return (
                <TouchableOpacity
                  key={item.id}
                  activeOpacity={0.8}
                  onPress={() => setCategoryId(item.id)}
                  style={[
                    styles.categoryButton,
                    active && styles.categoryButtonActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      active && styles.categoryTextActive,
                    ]}
                  >
                    {item.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {selectedCategory && (
            <Text style={styles.selectedCategoryText}>
              Kategori dipilih: {selectedCategory.name}
            </Text>
          )}

          <Input
            label="Lokasi Kejadian"
            value={lokasiKejadian}
            onChangeText={setLokasiKejadian}
            placeholder="Contoh: Jl. Merdeka dekat sekolah"
          />

          <Input
            label="Judul Laporan"
            value={judul}
            onChangeText={setJudul}
            placeholder="Contoh: Jalan rusak di dekat sekolah"
          />

          <Input
            label="Deskripsi"
            value={deskripsi}
            onChangeText={setDeskripsi}
            placeholder="Jelaskan detail pengaduan kamu"
            multiline
          />

          <Text style={styles.label}>Bukti Laporan</Text>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handlePickImage}
            style={styles.uploadBox}
          >
            {bukti ? (
              <View style={styles.previewWrapper}>
                <Image source={{ uri: bukti.uri }} style={styles.previewImage} />

                <View style={styles.previewContent}>
                  <Text style={styles.previewTitle}>Bukti berhasil dipilih</Text>
                  <Text style={styles.previewText} numberOfLines={1}>
                    {bukti.name}
                  </Text>
                  <Text style={styles.previewHint}>
                    Tekan kotak ini untuk mengganti gambar.
                  </Text>
                </View>
              </View>
            ) : (
              <View>
                <Text style={styles.uploadTitle}>Pilih Bukti Laporan</Text>
                <Text style={styles.uploadText}>
                  Upload gambar sebagai bukti pendukung laporan.
                </Text>
              </View>
            )}
          </TouchableOpacity>

          {bukti && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBukti(null)}
              style={styles.removeButton}
            >
              <Text style={styles.removeText}>Hapus Bukti</Text>
            </TouchableOpacity>
          )}

          <View style={styles.submitWrapper}>
            <Button
              title="Kirim Laporan"
              onPress={handleSubmit}
              loading={loading}
            />
          </View>
        </View>
      </View>

      <Text style={styles.userInfo}>Mengirim sebagai {namaLengkap}</Text>
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
    letterSpacing: -0.5,
  },
  subtitle: {
    color: "#64748B",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 22,
    padding: 16,
    marginTop: 24,
  },
  identityAvatar: {
    width: 52,
    height: 52,
    borderRadius: 18,
    backgroundColor: "#F0F9FF",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    alignItems: "center",
    justifyContent: "center",
  },
  identityAvatarText: {
    color: "#0EA5E9",
    fontSize: 20,
    fontWeight: "900",
  },
  identityContent: {
    flex: 1,
  },
  identityLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  identityName: {
    color: "#0F172A",
    fontSize: 16,
    fontWeight: "900",
    marginTop: 4,
  },
  identityPhone: {
    color: "#64748B",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4,
  },
  form: {
    marginTop: 24,
  },
  label: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "800",
    marginBottom: 12,
    marginTop: 16,
    marginLeft: 4,
  },
  categoryWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 10,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  categoryButtonActive: {
    backgroundColor: "#F0F9FF",
    borderColor: "#7DD3FC",
  },
  categoryText: {
    color: "#475569",
    fontSize: 13,
    fontWeight: "700",
  },
  categoryTextActive: {
    color: "#0284C7",
    fontWeight: "800",
  },
  selectedCategoryText: {
    color: "#0EA5E9",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4,
    marginBottom: 12,
    marginLeft: 4,
  },
  uploadBox: {
    minHeight: 120,
    borderRadius: 22,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#BAE6FD",
    backgroundColor: "#F8FAFC",
    padding: 20,
    justifyContent: "center",
  },
  uploadTitle: {
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "800",
    textAlign: "center",
  },
  uploadText: {
    color: "#64748B",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 8,
    textAlign: "center",
  },
  previewWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  previewImage: {
    width: 76,
    height: 76,
    borderRadius: 18,
    backgroundColor: "#E2E8F0",
  },
  previewContent: {
    flex: 1,
  },
  previewTitle: {
    color: "#0F172A",
    fontSize: 14,
    fontWeight: "900",
  },
  previewText: {
    color: "#475569",
    fontSize: 13,
    marginTop: 6,
  },
  previewHint: {
    color: "#94A3B8",
    fontSize: 12,
    marginTop: 6,
  },
  removeButton: {
    alignSelf: "flex-start",
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  removeText: {
    color: "#EF4444",
    fontSize: 13,
    fontWeight: "800",
  },
  submitWrapper: {
    marginTop: 32,
  },
  userInfo: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 24,
  },
});