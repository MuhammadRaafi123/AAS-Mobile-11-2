import { useEffect } from "react";
import { View, Text, StyleSheet, ActivityIndicator } from "react-native";

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.logoWrapper}>
          <Text style={styles.logoText}>LK</Text>
        </View>

        <Text style={styles.appName}>LAPORAN KUH</Text>

        <Text style={styles.tagline}>
          Laporkan, pantau, dan kelola pengaduan dengan lebih mudah.
        </Text>
      </View>

      <View style={styles.bottomArea}>
        <ActivityIndicator size="small" color="#38bdf8" />
        <Text style={styles.loadingText}>Memuat aplikasi...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#020617",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  centerContent: {
    alignItems: "center",
    width: "100%",
  },
  logoWrapper: {
    width: 92,
    height: 92,
    borderRadius: 28,
    backgroundColor: "#0f172a",
    borderWidth: 1,
    borderColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
    shadowColor: "#38bdf8",
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    elevation: 8,
  },
  logoText: {
    color: "#e0f2fe",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  appName: {
    color: "#f8fafc",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0.3,
  },
  tagline: {
    marginTop: 10,
    color: "#94a3b8",
    fontSize: 14,
    lineHeight: 21,
    textAlign: "center",
    maxWidth: 285,
    fontWeight: "500",
  },
  bottomArea: {
    position: "absolute",
    bottom: 58,
    alignItems: "center",
    gap: 10,
  },
  loadingText: {
    color: "#94a3b8",
    fontSize: 13,
    fontWeight: "600",
  },
});