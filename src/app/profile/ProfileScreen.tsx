import { useEffect, useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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

export type EditableProfilePayload = {
  nama_lengkap: string;
  email: string;
  no_telp: string;
  nik: string;
};

type ProfileScreenProps = {
  user: UserType;
  onLogout: () => void;
  onUpdateProfile?: (payload: EditableProfilePayload) => Promise<UserType | void>;
};

export default function ProfileScreen({
  user,
  onLogout,
  onUpdateProfile,
}: ProfileScreenProps) {
  const [profileData, setProfileData] = useState<UserType>(user);
  const [editVisible, setEditVisible] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState<EditableProfilePayload>({
    nama_lengkap: user.nama_lengkap || "",
    email: user.email || "",
    no_telp: user.no_telp || "",
    nik: user.nik || "",
  });

  useEffect(() => {
    setProfileData(user);
    setForm({
      nama_lengkap: user.nama_lengkap || "",
      email: user.email || "",
      no_telp: user.no_telp || "",
      nik: user.nik || "",
    });
  }, [user]);

  const getRoleLabel = () => {
    if (profileData.role === "super_admin") return "Super Admin";
    if (profileData.role === "admin") return "Admin";
    return "Masyarakat";
  };

  const getInitialName = () => {
    return profileData.nama_lengkap?.charAt(0)?.toUpperCase() || "U";
  };

  const getStatusLabel = () => {
    if (profileData.status === "aktif") return "Aktif";
    if (profileData.status === "nonaktif") return "Nonaktif";
    return "Aktif";
  };

  const openEditModal = () => {
    setForm({
      nama_lengkap: profileData.nama_lengkap || "",
      email: profileData.email || "",
      no_telp: profileData.no_telp || "",
      nik: profileData.nik || "",
    });

    setEditVisible(true);
  };

  const closeEditModal = () => {
    if (saving) return;
    setEditVisible(false);
  };

  const handleChange = (key: keyof EditableProfilePayload, value: string) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleSaveProfile = async () => {
    const cleanName = form.nama_lengkap.trim();
    const cleanEmail = form.email.trim();
    const cleanPhone = form.no_telp.trim();
    const cleanNik = form.nik.trim();

    if (!cleanName) {
      Alert.alert("Nama wajib diisi", "Nama lengkap tidak boleh kosong.");
      return;
    }

    if (!cleanEmail) {
      Alert.alert("Email wajib diisi", "Email tidak boleh kosong.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      Alert.alert("Email tidak valid", "Masukkan email yang benar.");
      return;
    }

    try {
      setSaving(true);

      const payload: EditableProfilePayload = {
        nama_lengkap: cleanName,
        email: cleanEmail,
        no_telp: cleanPhone,
        nik: cleanNik,
      };

      const updatedUser = onUpdateProfile
        ? await onUpdateProfile(payload)
        : null;

      if (updatedUser) {
        setProfileData(updatedUser);
      } else {
        setProfileData((prev) => ({
          ...prev,
          nama_lengkap: payload.nama_lengkap,
          email: payload.email,
          no_telp: payload.no_telp || null,
          nik: payload.nik || null,
        }));
      }

      setEditVisible(false);
      Alert.alert("Berhasil", "Profile berhasil diperbarui.");
    } catch (error) {
      Alert.alert(
        "Gagal",
        "Profile belum bisa diperbarui. Coba cek koneksi atau backend kamu."
      );
    } finally {
      setSaving(false);
    }
  };

  const nomorTelepon = profileData.no_telp || "Belum tersedia";
  const nikPengguna = profileData.nik || "Belum tersedia";

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitialName()}</Text>
          </View>

          <Text numberOfLines={1} style={styles.name}>
            {profileData.nama_lengkap}
          </Text>

          <Text numberOfLines={1} style={styles.email}>
            {profileData.email}
          </Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Text style={styles.roleBadgeText}>{getRoleLabel()}</Text>
            </View>

            <View style={styles.statusBadge}>
              <View style={styles.statusDot} />
              <Text style={styles.statusBadgeText}>{getStatusLabel()}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={openEditModal}
            style={styles.editButton}
          >
            <Text style={styles.editButtonText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informasi Akun</Text>

          <View style={styles.infoCard}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nama Lengkap</Text>
              <Text numberOfLines={1} style={styles.infoValue}>
                {profileData.nama_lengkap}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text numberOfLines={1} style={styles.infoValue}>
                {profileData.email}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Nomor Telepon</Text>
              <Text numberOfLines={1} style={styles.infoValue}>
                {nomorTelepon}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>NIK</Text>
              <Text numberOfLines={1} style={styles.infoValue}>
                {nikPengguna}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Role</Text>
              <Text style={styles.infoValue}>{getRoleLabel()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Status Akun</Text>
              <Text style={styles.infoValue}>{getStatusLabel()}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>ID Pengguna</Text>
              <Text style={styles.infoValue}>#{profileData.id}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Status Aplikasi</Text>

          <View style={styles.statusCard}>
            <View style={styles.statusDotLarge} />

            <View style={styles.statusTextBox}>
              <Text style={styles.statusTitle}>Akun {getStatusLabel()}</Text>
              <Text style={styles.statusText}>
                Kamu sedang masuk ke aplikasi LAPORAN KUH Mobile.
              </Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          onPress={onLogout}
          style={styles.logoutButton}
        >
          <Text style={styles.logoutText}>Keluar dari Akun</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={editVisible}
        transparent
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Profile</Text>
                <Text style={styles.modalSubtitle}>
                  Perbarui data akun kamu.
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.8}
                onPress={closeEditModal}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nama Lengkap</Text>
              <TextInput
                value={form.nama_lengkap}
                onChangeText={(value) => handleChange("nama_lengkap", value)}
                placeholder="Masukkan nama lengkap"
                placeholderTextColor="#94A3B8"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(value) => handleChange("email", value)}
                placeholder="Masukkan email"
                placeholderTextColor="#94A3B8"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Nomor Telepon</Text>
              <TextInput
                value={form.no_telp}
                onChangeText={(value) => handleChange("no_telp", value)}
                placeholder="Masukkan nomor telepon"
                placeholderTextColor="#94A3B8"
                keyboardType="phone-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>NIK</Text>
              <TextInput
                value={form.nik}
                onChangeText={(value) => handleChange("nik", value)}
                placeholder="Masukkan NIK"
                placeholderTextColor="#94A3B8"
                keyboardType="number-pad"
                style={styles.input}
              />
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={closeEditModal}
                disabled={saving}
                style={styles.cancelButton}
              >
                <Text style={styles.cancelButtonText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.85}
                onPress={handleSaveProfile}
                disabled={saving}
                style={[
                  styles.saveButton,
                  saving ? styles.saveButtonDisabled : null,
                ]}
              >
                <Text style={styles.saveButtonText}>
                  {saving ? "Menyimpan..." : "Simpan"}
                </Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 24,
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 28,
    alignItems: "center",
    marginBottom: 28,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 5,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 28,
    backgroundColor: "#E0F2FE",
    borderWidth: 2,
    borderColor: "#BAE6FD",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  avatarText: {
    color: "#0284C7",
    fontSize: 34,
    fontWeight: "900",
  },
  name: {
    color: "#0F172A",
    fontSize: 24,
    fontWeight: "900",
    maxWidth: "100%",
    letterSpacing: -0.5,
  },
  email: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
    maxWidth: "100%",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 18,
  },
  roleBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
  },
  roleBadgeText: {
    color: "#0284C7",
    fontSize: 13,
    fontWeight: "800",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#22C55E",
    marginRight: 8,
  },
  statusBadgeText: {
    color: "#166534",
    fontSize: 13,
    fontWeight: "800",
  },
  editButton: {
    height: 48,
    paddingHorizontal: 28,
    borderRadius: 16,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 22,
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  editButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#0F172A",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 14,
  },
  infoCard: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 6,
    shadowColor: "#94A3B8",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  infoItem: {
    paddingVertical: 16,
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
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
  },
  statusCard: {
    backgroundColor: "#F0FDF4",
    borderWidth: 1,
    borderColor: "#BBF7D0",
    borderRadius: 20,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  statusDotLarge: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#22C55E",
    marginRight: 14,
  },
  statusTextBox: {
    flex: 1,
  },
  statusTitle: {
    color: "#166534",
    fontSize: 15,
    fontWeight: "800",
  },
  statusText: {
    color: "#15803D",
    fontSize: 13,
    lineHeight: 20,
    marginTop: 4,
  },
  logoutButton: {
    height: 54,
    borderRadius: 16,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  logoutText: {
    color: "#EF4444",
    fontSize: 15,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.25,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  modalTitle: {
    color: "#0F172A",
    fontSize: 22,
    fontWeight: "900",
  },
  modalSubtitle: {
    color: "#64748B",
    fontSize: 14,
    fontWeight: "600",
    marginTop: 6,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F1F5F9",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#475569",
    fontSize: 24,
    fontWeight: "700",
    marginTop: -2,
  },
  formGroup: {
    marginBottom: 18,
  },
  inputLabel: {
    color: "#334155",
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    paddingHorizontal: 16,
    color: "#0F172A",
    fontSize: 15,
    fontWeight: "600",
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 12,
  },
  cancelButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#475569",
    fontSize: 14,
    fontWeight: "800",
  },
  saveButton: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  saveButtonDisabled: {
    opacity: 0.65,
    shadowOpacity: 0,
    elevation: 0,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
});