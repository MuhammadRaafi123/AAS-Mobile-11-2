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
                placeholderTextColor="#64748b"
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                value={form.email}
                onChangeText={(value) => handleChange("email", value)}
                placeholder="Masukkan email"
                placeholderTextColor="#64748b"
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
                placeholderTextColor="#64748b"
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
                placeholderTextColor="#64748b"
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
    backgroundColor: "#0b1120",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 120,
  },
  profileCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 24,
    padding: 22,
    alignItems: "center",
    marginBottom: 24,
    shadowColor: "#000000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    elevation: 5,
  },
  avatar: {
    width: 82,
    height: 82,
    borderRadius: 28,
    backgroundColor: "#1d4ed8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  avatarText: {
    color: "#ffffff",
    fontSize: 32,
    fontWeight: "900",
  },
  name: {
    color: "#f9fafb",
    fontSize: 22,
    fontWeight: "900",
    maxWidth: "100%",
  },
  email: {
    color: "#9ca3af",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 6,
    maxWidth: "100%",
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 16,
  },
  roleBadge: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#172554",
    borderWidth: 1,
    borderColor: "#1e40af",
  },
  roleBadgeText: {
    color: "#bfdbfe",
    fontSize: 12,
    fontWeight: "900",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#052e16",
    borderWidth: 1,
    borderColor: "#166534",
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#22c55e",
    marginRight: 7,
  },
  statusBadgeText: {
    color: "#bbf7d0",
    fontSize: 12,
    fontWeight: "900",
  },
  editButton: {
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    borderWidth: 1,
    borderColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18,
  },
  editButtonText: {
    color: "#eff6ff",
    fontSize: 13,
    fontWeight: "900",
  },
  section: {
    marginBottom: 22,
  },
  sectionTitle: {
    color: "#f9fafb",
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  infoItem: {
    paddingVertical: 15,
  },
  infoLabel: {
    color: "#6b7280",
    fontSize: 12,
    fontWeight: "800",
    marginBottom: 5,
  },
  infoValue: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "800",
  },
  divider: {
    height: 1,
    backgroundColor: "#1f2937",
  },
  statusCard: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  statusDotLarge: {
    width: 11,
    height: 11,
    borderRadius: 6,
    backgroundColor: "#22c55e",
    marginRight: 12,
  },
  statusTextBox: {
    flex: 1,
  },
  statusTitle: {
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "900",
  },
  statusText: {
    color: "#9ca3af",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 4,
  },
  logoutButton: {
    height: 52,
    borderRadius: 16,
    backgroundColor: "#7f1d1d",
    borderWidth: 1,
    borderColor: "#991b1b",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  logoutText: {
    color: "#fecaca",
    fontSize: 14,
    fontWeight: "900",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(2, 6, 23, 0.82)",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#1f2937",
    borderRadius: 24,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.3,
    shadowRadius: 18,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  modalTitle: {
    color: "#f9fafb",
    fontSize: 20,
    fontWeight: "900",
  },
  modalSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 5,
  },
  closeButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: "#1f2937",
    alignItems: "center",
    justifyContent: "center",
  },
  closeButtonText: {
    color: "#f9fafb",
    fontSize: 24,
    fontWeight: "700",
    marginTop: -2,
  },
  formGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    color: "#cbd5e1",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 15,
    backgroundColor: "#020617",
    borderWidth: 1,
    borderColor: "#1f2937",
    paddingHorizontal: 14,
    color: "#f9fafb",
    fontSize: 14,
    fontWeight: "700",
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 8,
  },
  cancelButton: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelButtonText: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "900",
  },
  saveButton: {
    flex: 1,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#2563eb",
    borderWidth: 1,
    borderColor: "#3b82f6",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: "#eff6ff",
    fontSize: 13,
    fontWeight: "900",
  },
});