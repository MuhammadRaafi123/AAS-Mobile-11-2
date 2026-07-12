import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";

import SplashScreen from "../auth/SplashScreen";
import LoginScreen from "../auth/LoginScreen";
import RegisterScreen from "../auth/RegisterScreen";
import DashboardScreen from "../dashboard/DashboardScreen";
import ListLaporanScreen from "../laporan/ListLaporanScreen";
import AddLaporanScreen from "../laporan/AddLaporanScreen";
import DetailLaporanScreen from "../laporan/DetailLaporanScreen";
import ProfileScreen from "../profile/ProfileScreen";
import { updateProfile, UpdateProfilePayload } from "../services/profile.service";
import { clearStorage } from "../utils/storage";

type UserRole = "masyarakat" | "admin" | "super_admin";

export type UserType = {
  id: number;
  email: string;
  nama_lengkap: string;
  nik?: string | null;
  no_telp?: string | null;
  role: UserRole;
  status?: string;
  created_at?: string;
};

type ScreenName = "home" | "list" | "add" | "detail" | "profile";
type AuthScreenName = "login" | "register";

export default function AppNavigator() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [authScreen, setAuthScreen] = useState<AuthScreenName>("login");
  const [activeScreen, setActiveScreen] = useState<ScreenName>("home");
  const [selectedLaporanId, setSelectedLaporanId] = useState<number | null>(
    null
  );

  const [dashboardRefreshKey, setDashboardRefreshKey] = useState(0);
  const [listRefreshKey, setListRefreshKey] = useState(0);

  const refreshLaporanData = () => {
    setDashboardRefreshKey((prev) => prev + 1);
    setListRefreshKey((prev) => prev + 1);
  };

  const handleLogin = (loggedUser: UserType) => {
    setUser({
      id: loggedUser.id,
      email: loggedUser.email,
      nama_lengkap: loggedUser.nama_lengkap,
      nik: loggedUser.nik || "",
      no_telp: loggedUser.no_telp || "",
      role: loggedUser.role,
      status: loggedUser.status,
      created_at: loggedUser.created_at,
    });

    setAuthScreen("login");
    setActiveScreen("home");
    setSelectedLaporanId(null);
    refreshLaporanData();
  };

  const handleLogout = async () => {
    try {
      await clearStorage();
    } catch (error) {
      console.log("Gagal membersihkan storage:", error);
    } finally {
      setUser(null);
      setAuthScreen("login");
      setActiveScreen("home");
      setSelectedLaporanId(null);
      setDashboardRefreshKey(0);
      setListRefreshKey(0);
    }
  };

  const handleUpdateProfile = async (payload: UpdateProfilePayload) => {
    const updatedUser = await updateProfile(payload);

    setUser((prev) => {
      if (!prev) return updatedUser;

      return {
        ...prev,
        ...updatedUser,
      };
    });

    return updatedUser;
  };

  const goToLogin = () => {
    setAuthScreen("login");
  };

  const goToRegister = () => {
    setAuthScreen("register");
  };

  const goToHome = () => {
    setSelectedLaporanId(null);
    setActiveScreen("home");
  };

  const goToList = () => {
    setSelectedLaporanId(null);
    setActiveScreen("list");
  };

  const goToAdd = () => {
    if (user?.role !== "masyarakat") return;

    setSelectedLaporanId(null);
    setActiveScreen("add");
  };

  const goToDetail = (id: number) => {
    setSelectedLaporanId(id);
    setActiveScreen("detail");
  };

  const goToProfile = () => {
    setSelectedLaporanId(null);
    setActiveScreen("profile");
  };

  const handleLaporanCreated = () => {
    refreshLaporanData();
    setSelectedLaporanId(null);
    setActiveScreen("home");
  };

  const handleBackFromDetail = () => {
    refreshLaporanData();
    goToList();
  };

  const goBack = () => {
    if (activeScreen === "detail") {
      handleBackFromDetail();
      return;
    }

    if (activeScreen === "add") {
      goToHome();
      return;
    }

    goToHome();
  };

  const getScreenTitle = () => {
    if (activeScreen === "list") return "Laporan";
    if (activeScreen === "add") return "Tambah Laporan";
    if (activeScreen === "detail") return "Detail Laporan";
    if (activeScreen === "profile") return "Profil";
    return "Beranda";
  };

  const getScreenSubtitle = () => {
    if (activeScreen === "list") return "Pantau semua laporan kamu";
    if (activeScreen === "add") return "Buat pengaduan baru";
    if (activeScreen === "detail") return "Informasi lengkap laporan";
    if (activeScreen === "profile") return "Kelola akun kamu";
    return "Selamat datang kembali";
  };

  const getInitialName = () => {
    return user?.nama_lengkap?.charAt(0)?.toUpperCase() || "U";
  };

  const getRoleLabel = () => {
    if (user?.role === "super_admin") return "Super Admin";
    if (user?.role === "admin") return "Admin";
    return "Masyarakat";
  };

  const showBackButton = activeScreen === "add" || activeScreen === "detail";

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (!user) {
    if (authScreen === "register") {
      return (
        <RegisterScreen
          onLogin={goToLogin}
          onRegisterSuccess={() => {
            goToLogin();
          }}
        />
      );
    }

    return <LoginScreen onLogin={handleLogin} onRegister={goToRegister} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.topbar}>
        <View style={styles.topbarInner}>
          <View style={styles.topbarLeft}>
            {showBackButton ? (
              <TouchableOpacity
                activeOpacity={0.78}
                onPress={goBack}
                style={styles.backButton}
              >
                <Text style={styles.backIcon}>‹</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.logoBox}>
                <Text style={styles.logoText}>LK</Text>
              </View>
            )}
          </View>

          <View style={styles.topbarContent}>
            <View style={styles.titleRow}>
              <Text numberOfLines={1} style={styles.screenTitle}>
                {getScreenTitle()}
              </Text>

              <View style={styles.roleBadge}>
                <Text numberOfLines={1} style={styles.roleText}>
                  {getRoleLabel()}
                </Text>
              </View>
            </View>

            <Text numberOfLines={1} style={styles.screenSubtitle}>
              {getScreenSubtitle()}
            </Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.78}
            onPress={goToProfile}
            style={[
              styles.avatarButton,
              activeScreen === "profile" && styles.avatarButtonActive,
            ]}
          >
            <Text style={styles.avatarText}>{getInitialName()}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {activeScreen === "home" && (
          <DashboardScreen
            user={user}
            onAdd={goToAdd}
            onList={goToList}
            onDetail={goToDetail}
            refreshKey={dashboardRefreshKey}
          />
        )}

        {activeScreen === "list" && (
          <ListLaporanScreen
            user={user}
            onAdd={goToAdd}
            onDetail={goToDetail}
            refreshKey={listRefreshKey}
          />
        )}

        {activeScreen === "add" && user.role === "masyarakat" && (
          <AddLaporanScreen
            user={user}
            onBack={goToHome}
            onSuccess={handleLaporanCreated}
          />
        )}

        {activeScreen === "detail" && selectedLaporanId !== null && (
          <DetailLaporanScreen
            user={user}
            laporanId={selectedLaporanId}
            onBack={handleBackFromDetail}
          />
        )}

        {activeScreen === "profile" && (
          <ProfileScreen
            user={user}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
          />
        )}
      </View>

      <View style={styles.bottomNavWrapper}>
        <View style={styles.bottomNav}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goToHome}
            style={[
              styles.navItem,
              activeScreen === "home" && styles.navItemActive,
            ]}
          >
            <Text
              style={[
                styles.navIcon,
                activeScreen === "home" && styles.navIconActive,
              ]}
            >
              ●
            </Text>

            <Text
              style={[
                styles.navText,
                activeScreen === "home" && styles.navTextActive,
              ]}
            >
              Beranda
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goToList}
            style={[
              styles.navItem,
              activeScreen === "list" && styles.navItemActive,
            ]}
          >
            <Text
              style={[
                styles.navIcon,
                activeScreen === "list" && styles.navIconActive,
              ]}
            >
              ●
            </Text>

            <Text
              style={[
                styles.navText,
                activeScreen === "list" && styles.navTextActive,
              ]}
            >
              Laporan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goToAdd}
            disabled={user.role !== "masyarakat"}
            style={[
              styles.navItem,
              activeScreen === "add" && styles.navItemActive,
              user.role !== "masyarakat" && styles.navItemDisabled,
            ]}
          >
            <Text
              style={[
                styles.navIconPlus,
                activeScreen === "add" && styles.navIconPlusActive,
                user.role !== "masyarakat" && styles.navTextDisabled,
              ]}
            >
              +
            </Text>

            <Text
              style={[
                styles.navText,
                activeScreen === "add" && styles.navTextActive,
                user.role !== "masyarakat" && styles.navTextDisabled,
              ]}
            >
              Tambah
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={goToProfile}
            style={[
              styles.navItem,
              activeScreen === "profile" && styles.navItemActive,
            ]}
          >
            <Text
              style={[
                styles.navIcon,
                activeScreen === "profile" && styles.navIconActive,
              ]}
            >
              ●
            </Text>

            <Text
              style={[
                styles.navText,
                activeScreen === "profile" && styles.navTextActive,
              ]}
            >
              Profil
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  topbar: {
    backgroundColor: "#FFFFFF",
    paddingTop: 42,
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    shadowColor: "#94A3B8",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  topbarInner: {
    minHeight: 58,
    flexDirection: "row",
    alignItems: "center",
  },
  topbarLeft: {
    width: 44,
    alignItems: "flex-start",
    justifyContent: "center",
  },
  logoBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  logoText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#F1F5F9",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#0F172A",
    fontSize: 30,
    lineHeight: 30,
    fontWeight: "700",
    marginTop: -2,
  },
  topbarContent: {
    flex: 1,
    paddingLeft: 10,
    paddingRight: 12,
    justifyContent: "center",
  },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  screenTitle: {
    flex: 1,
    color: "#0F172A",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.1,
  },
  screenSubtitle: {
    color: "#64748B",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 4,
  },
  roleBadge: {
    maxWidth: 96,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    marginLeft: 8,
  },
  roleText: {
    color: "#0284C7",
    fontSize: 10,
    fontWeight: "800",
  },
  avatarButton: {
    width: 39,
    height: 39,
    borderRadius: 13,
    backgroundColor: "#E0F2FE",
    borderWidth: 1,
    borderColor: "#BAE6FD",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarButtonActive: {
    backgroundColor: "#0EA5E9",
    borderColor: "#0284C7",
  },
  avatarText: {
    color: "#0284C7",
    fontSize: 14,
    fontWeight: "900",
  },

  content: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },

  bottomNavWrapper: {
    backgroundColor: "#F8FAFC",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 18,
  },
  bottomNav: {
    minHeight: 66,
    padding: 6,
    borderRadius: 22,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#94A3B8",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -2 },
    elevation: 5,
  },
  navItem: {
    flex: 1,
    height: 54,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  navItemActive: {
    backgroundColor: "#E0F2FE",
  },
  navItemDisabled: {
    opacity: 0.45,
  },
  navIcon: {
    color: "#94A3B8",
    fontSize: 10,
    lineHeight: 12,
  },
  navIconActive: {
    color: "#0EA5E9",
  },
  navIconPlus: {
    color: "#94A3B8",
    fontSize: 22,
    lineHeight: 24,
    fontWeight: "900",
  },
  navIconPlusActive: {
    color: "#0EA5E9",
  },
  navText: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "800",
  },
  navTextActive: {
    color: "#0284C7",
  },
  navTextDisabled: {
    color: "#CBD5E1",
  },
});