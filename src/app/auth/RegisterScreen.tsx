import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { register } from "../services/auth.service";

type UserRole = "masyarakat" | "admin" | "super_admin";

type UserType = {
  id: number;
  email: string;
  nama_lengkap: string;
  nik?: string | null;
  no_telp?: string | null;
  role: UserRole;
  status?: string;
  created_at?: string;
};

type RegisterScreenProps = {
  onRegisterSuccess?: (user?: UserType) => void;
  onLogin: () => void;
};

export default function RegisterScreen({
  onRegisterSuccess,
  onLogin,
}: RegisterScreenProps) {
  const [namaLengkap, setNamaLengkap] = useState("");
  const [email, setEmail] = useState("");
  const [noTelp, setNoTelp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const cleanNama = namaLengkap.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanNoTelp = noTelp.trim();
    const cleanPassword = password.trim();
    const cleanConfirmPassword = confirmPassword.trim();

    if (
      !cleanNama ||
      !cleanEmail ||
      !cleanNoTelp ||
      !cleanPassword ||
      !cleanConfirmPassword
    ) {
      Alert.alert("Data belum lengkap", "Semua field wajib diisi.");
      return;
    }

    if (!cleanEmail.includes("@")) {
      Alert.alert("Email tidak valid", "Masukkan email yang benar.");
      return;
    }

    if (cleanPassword.length < 6) {
      Alert.alert(
        "Password terlalu pendek",
        "Password minimal harus 6 karakter."
      );
      return;
    }

    if (cleanPassword !== cleanConfirmPassword) {
      Alert.alert(
        "Password tidak sama",
        "Konfirmasi password harus sama dengan password."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await register({
        nama_lengkap: cleanNama,
        email: cleanEmail,
        no_telp: cleanNoTelp,
        password: cleanPassword,
      });

      Alert.alert("Berhasil", "Akun berhasil dibuat. Silakan login.");

      setNamaLengkap("");
      setEmail("");
      setNoTelp("");
      setPassword("");
      setConfirmPassword("");

      onRegisterSuccess?.(response?.user);
      onLogin();
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Register gagal. Periksa koneksi atau data akun kamu.";

      Alert.alert("Register gagal", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topSection}>
          <View style={styles.brandRow}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>LK</Text>
            </View>

            <View>
              <Text style={styles.brandName}>LAPORAN KUH</Text>
              <Text style={styles.brandCaption}>Pengaduan Masyarakat</Text>
            </View>
          </View>

          <Text style={styles.title}>Buat akun baru</Text>
          <Text style={styles.subtitle}>
            Daftar akun untuk membuat laporan, memantau proses, dan melihat
            perkembangan pengaduan kamu.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Daftar LAPORAN KUH</Text>
            <Text style={styles.formSubtitle}>
              Lengkapi data akun kamu dengan benar.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nama Lengkap</Text>
            <TextInput
              style={styles.input}
              placeholder="Contoh: Wahid Ahmad"
              placeholderTextColor="#64748b"
              value={namaLengkap}
              onChangeText={setNamaLengkap}
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@gmail.com"
              placeholderTextColor="#64748b"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nomor Telepon</Text>
            <TextInput
              style={styles.input}
              placeholder="08xxxxxxxxxx"
              placeholderTextColor="#64748b"
              value={noTelp}
              onChangeText={setNoTelp}
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Minimal 6 karakter"
                placeholderTextColor="#64748b"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                activeOpacity={0.75}
                onPress={() => setShowPassword((prev) => !prev)}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={21}
                  color="#38bdf8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Konfirmasi Password</Text>

            <View style={styles.passwordWrapper}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Ulangi password"
                placeholderTextColor="#64748b"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />

              <TouchableOpacity
                style={styles.eyeButton}
                activeOpacity={0.75}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
              >
                <Ionicons
                  name={
                    showConfirmPassword ? "eye-outline" : "eye-off-outline"
                  }
                  size={21}
                  color="#38bdf8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.disabledButton]}
            activeOpacity={0.85}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.registerButtonText}>Buat Akun</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Sudah punya akun?</Text>

            <TouchableOpacity activeOpacity={0.8} onPress={onLogin}>
              <Text style={styles.loginLink}> Masuk</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.bottomText}>
          LAPORAN KUH Mobile • Aman dan terpantau
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 22,
    paddingTop: 58,
    paddingBottom: 34,
  },
  topSection: {
    marginBottom: 24,
  },
  brandRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
  },
  logoBox: {
    width: 50,
    height: 50,
    borderRadius: 16,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  logoText: {
    color: "#38bdf8",
    fontSize: 17,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  brandName: {
    color: "#f8fafc",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  brandCaption: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  title: {
    color: "#f8fafc",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.6,
  },
  subtitle: {
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 22,
    marginTop: 10,
    maxWidth: 340,
  },
  card: {
    backgroundColor: "#111827",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#1f2937",
    shadowColor: "#000000",
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 5,
  },
  formHeader: {
    marginBottom: 22,
  },
  formTitle: {
    color: "#f8fafc",
    fontSize: 18,
    fontWeight: "900",
  },
  formSubtitle: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5,
    lineHeight: 19,
  },
  inputGroup: {
    marginBottom: 17,
  },
  label: {
    color: "#e5e7eb",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 9,
  },
  input: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    paddingHorizontal: 15,
    color: "#f8fafc",
    fontSize: 14,
  },
  passwordWrapper: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#334155",
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 15,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    height: "100%",
    color: "#f8fafc",
    fontSize: 14,
  },
  eyeButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  registerButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  disabledButton: {
    opacity: 0.7,
  },
  registerButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  loginRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  loginText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },
  loginLink: {
    color: "#38bdf8",
    fontSize: 13,
    fontWeight: "900",
  },
  bottomText: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 26,
  },
});