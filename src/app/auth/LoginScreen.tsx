import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import Ionicons from "@expo/vector-icons/Ionicons";

import { login } from "../services/auth.service";

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

type LoginScreenProps = {
  onLogin: (user: UserType) => void;
  onRegister: () => void;
};

export default function LoginScreen({ onLogin, onRegister }: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      Alert.alert(
        "Data belum lengkap",
        "Masukkan email dan password terlebih dahulu."
      );
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (!response.user) {
        Alert.alert("Login tidak berhasil", "Data akun tidak ditemukan.");
        return;
      }

      onLogin({
        id: response.user.id,
        email: response.user.email,
        nama_lengkap: response.user.nama_lengkap,
        nik: response.user.nik || "",
        no_telp: response.user.no_telp || "",
        role: response.user.role,
        status: response.user.status,
        created_at: response.user.created_at,
      });
    } catch (error: any) {
      Alert.alert(
        "Login tidak berhasil",
        error?.response?.data?.message ||
          "Email atau password yang kamu masukkan salah."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboard}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>LK</Text>
          </View>

          <Text style={styles.appName}>LAPORAN KUH</Text>
          <Text style={styles.title}>Masuk ke Akun</Text>
          <Text style={styles.subtitle}>
            Kelola laporan pengaduan masyarakat dengan mudah, cepat, dan
            terpantau langsung dari aplikasi.
          </Text>
        </View>

        <View style={styles.card}>
          <View style={styles.formHeader}>
            <Text style={styles.formTitle}>Login LAPORAN KUH</Text>
            <Text style={styles.formSubtitle}>
              Gunakan akun yang sudah terdaftar untuk masuk.
            </Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>

            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="nama@example.com"
              placeholderTextColor="#64748b"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>

            <View style={styles.passwordWrapper}>
              <TextInput
                value={password}
                onChangeText={setPassword}
                placeholder="Masukkan password"
                placeholderTextColor="#64748b"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.passwordInput}
              />

              <TouchableOpacity
                activeOpacity={0.75}
                onPress={() => setShowPassword((prev) => !prev)}
                style={styles.eyeButton}
              >
                <Ionicons
                  name={showPassword ? "eye-outline" : "eye-off-outline"}
                  size={22}
                  color="#38bdf8"
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={handleLogin}
            disabled={loading}
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          >
            {loading ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <Text style={styles.loginButtonText}>Masuk Sekarang</Text>
            )}
          </TouchableOpacity>

          <View style={styles.registerRow}>
            <Text style={styles.registerText}>Belum punya akun?</Text>

            <TouchableOpacity activeOpacity={0.8} onPress={onRegister}>
              <Text style={styles.registerLink}> Daftar</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.bottomText}>
          LAPORAN KUH Mobile • Pengaduan Masyarakat
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboard: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  container: {
    flexGrow: 1,
    backgroundColor: "#0f172a",
    paddingHorizontal: 22,
    paddingTop: 76,
    paddingBottom: 34,
  },
  header: {
    marginBottom: 32,
  },
  logoBox: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#1e293b",
    borderWidth: 1,
    borderColor: "#334155",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  logoText: {
    fontSize: 22,
    fontWeight: "900",
    color: "#38bdf8",
    letterSpacing: 0.5,
  },
  appName: {
    color: "#38bdf8",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: "#f8fafc",
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14,
    color: "#94a3b8",
    lineHeight: 22,
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
    marginTop: 6,
    color: "#94a3b8",
    fontSize: 13,
    lineHeight: 19,
    fontWeight: "600",
  },
  inputGroup: {
    marginBottom: 18,
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
    color: "#f8fafc",
    fontSize: 14,
    height: "100%",
  },
  eyeButton: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },
  loginButton: {
    height: 54,
    borderRadius: 14,
    backgroundColor: "#2563eb",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "900",
  },
  registerRow: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "700",
  },
  registerLink: {
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