import { useEffect } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withRepeat,
  Easing,
  withSpring,
  interpolate,
  Extrapolation,
  withSequence,
} from "react-native-reanimated";
import Ionicons from "@expo/vector-icons/Ionicons";

const { width } = Dimensions.get("window");

type SplashScreenProps = {
  onFinish: () => void;
};

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useSharedValue(0.3);
  const logoOpacity = useSharedValue(0);
  const logoRotate = useSharedValue(-10);
  const textOpacity = useSharedValue(0);
  const textTranslateY = useSharedValue(30);
  const badgeOpacity = useSharedValue(0);
  const badgeScale = useSharedValue(0.8);
  const taglineOpacity = useSharedValue(0);
  const taglineTranslateY = useSharedValue(15);
  const bottomOpacity = useSharedValue(0);
  const pulse = useSharedValue(0);
  const shimmer = useSharedValue(0);
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  useEffect(() => {
    // Logo entrance
    logoScale.value = withSpring(1, { damping: 12, stiffness: 90 });
    logoOpacity.value = withTiming(1, { duration: 700 });
    logoRotate.value = withSpring(0, { damping: 12, stiffness: 80 });

    // App name
    textOpacity.value = withDelay(350, withTiming(1, { duration: 700 }));
    textTranslateY.value = withDelay(
      350,
      withSpring(0, { damping: 14, stiffness: 100 })
    );

    // Badge
    badgeOpacity.value = withDelay(550, withTiming(1, { duration: 600 }));
    badgeScale.value = withDelay(
      550,
      withSpring(1, { damping: 14, stiffness: 100 })
    );

    // Tagline
    taglineOpacity.value = withDelay(700, withTiming(1, { duration: 600 }));
    taglineTranslateY.value = withDelay(
      700,
      withSpring(0, { damping: 14, stiffness: 100 })
    );

    // Bottom area
    bottomOpacity.value = withDelay(900, withTiming(1, { duration: 600 }));

    // Continuous pulse ring
    pulse.value = withRepeat(
      withTiming(1, { duration: 2200, easing: Easing.out(Easing.ease) }),
      -1,
      false
    );

    // Shimmer effect
    shimmer.value = withRepeat(
      withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );

    // Loading dots animation
    dot1.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
      ),
      -1,
      false
    );

    dot2.value = withDelay(
      200,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      )
    );

    dot3.value = withDelay(
      400,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) }),
          withTiming(0, { duration: 400, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      )
    );

    const timer = setTimeout(() => {
      onFinish();
    }, 2800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value },
      { rotate: `${logoRotate.value}deg` },
    ],
  }));

  const textAnimatedStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [{ translateY: textTranslateY.value }],
  }));

  const badgeAnimatedStyle = useAnimatedStyle(() => ({
    opacity: badgeOpacity.value,
    transform: [{ scale: badgeScale.value }],
  }));

  const taglineAnimatedStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineTranslateY.value }],
  }));

  const bottomAnimatedStyle = useAnimatedStyle(() => ({
    opacity: bottomOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      pulse.value,
      [0, 1],
      [1, 2],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      pulse.value,
      [0, 0.7, 1],
      [0.35, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const pulseAnimatedStyle2 = useAnimatedStyle(() => {
    const scale = interpolate(
      pulse.value,
      [0, 1],
      [1, 1.6],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      pulse.value,
      [0, 0.5, 1],
      [0.2, 0, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          dot1.value,
          [0, 1],
          [0, -4],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          dot2.value,
          [0, 1],
          [0, -4],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1], Extrapolation.CLAMP),
    transform: [
      {
        translateY: interpolate(
          dot3.value,
          [0, 1],
          [0, -4],
          Extrapolation.CLAMP
        ),
      },
    ],
  }));

  return (
    <View style={styles.container}>
      {/* Decorative background blobs - matching login screen style */}
      <View style={styles.bgBlob1} />
      <View style={styles.bgBlob2} />
      <View style={styles.bgBlob3} />

      <View style={styles.centerContent}>
        {/* Pulse rings */}
        <Animated.View style={[styles.pulseRing, pulseAnimatedStyle]} />
        <Animated.View style={[styles.pulseRing2, pulseAnimatedStyle2]} />

        {/* Logo - matching login screen logoBox */}
        <Animated.View style={[styles.logoWrapper, logoAnimatedStyle]}>
          <View style={styles.logoInner}>
            <Ionicons name="shield-checkmark" size={44} color="#ffffff" />
          </View>
        </Animated.View>

        {/* App name */}
        <Animated.View style={[styles.textContainer, textAnimatedStyle]}>
          <Text style={styles.appName}>LAPORAN KUH</Text>
        </Animated.View>

        {/* Badge - matching login screen badge */}
        <Animated.View style={[styles.badge, badgeAnimatedStyle]}>
          <Text style={styles.badgeText}>Pusat Pengaduan Masyarakat</Text>
        </Animated.View>

        {/* Tagline */}
        <Animated.View style={[styles.taglineWrapper, taglineAnimatedStyle]}>
          <Text style={styles.tagline}>
            Suara Anda sangat berarti. Laporkan, pantau, dan kelola pengaduan
            dengan transparansi penuh.
          </Text>
        </Animated.View>
      </View>

      {/* Bottom loading area */}
      <Animated.View style={[styles.bottomArea, bottomAnimatedStyle]}>
        <View style={styles.loadingDots}>
          <Animated.View style={[styles.dot, dot1Style]} />
          <Animated.View style={[styles.dot, dot2Style]} />
          <Animated.View style={[styles.dot, dot3Style]} />
        </View>
        <Text style={styles.loadingText}>Menyiapkan aplikasi</Text>
        <Text style={styles.versionText}>LAPORAN KUH Mobile v1.0</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    overflow: "hidden",
  },

  // Background blobs - matching login screen style
  bgBlob1: {
    position: "absolute",
    top: -180,
    right: -120,
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    backgroundColor: "rgba(14, 165, 233, 0.07)",
  },
  bgBlob2: {
    position: "absolute",
    bottom: -200,
    left: -150,
    width: width * 1.2,
    height: width * 1.2,
    borderRadius: width * 0.6,
    backgroundColor: "rgba(14, 165, 233, 0.04)",
  },
  bgBlob3: {
    position: "absolute",
    top: "40%",
    left: -80,
    width: width * 0.6,
    height: width * 0.6,
    borderRadius: width * 0.3,
    backgroundColor: "rgba(56, 189, 248, 0.03)",
  },

  centerContent: {
    alignItems: "center",
    width: "100%",
    zIndex: 10,
  },

  // Pulse rings - using app's sky blue color
  pulseRing: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: "rgba(14, 165, 233, 0.12)",
    top: -10,
  },
  pulseRing2: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 36,
    backgroundColor: "rgba(14, 165, 233, 0.08)",
    top: -10,
  },

  // Logo - matching login screen's logoBox style
  logoWrapper: {
    marginBottom: 32,
  },
  logoInner: {
    width: 100,
    height: 100,
    borderRadius: 28,
    backgroundColor: "#0EA5E9",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#0EA5E9",
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  textContainer: {
    alignItems: "center",
    marginBottom: 14,
  },
  appName: {
    color: "#0F172A",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: -0.5,
  },

  // Badge - matching login screen badge style
  badge: {
    backgroundColor: "#E0F2FE",
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 14,
    marginBottom: 20,
  },
  badgeText: {
    color: "#0284C7",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },

  taglineWrapper: {
    alignItems: "center",
  },
  tagline: {
    color: "#64748B",
    fontSize: 15,
    lineHeight: 24,
    textAlign: "center",
    fontWeight: "400",
    maxWidth: 300,
  },

  // Bottom area
  bottomArea: {
    position: "absolute",
    bottom: 50,
    alignItems: "center",
    gap: 12,
  },
  loadingDots: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#0EA5E9",
  },
  loadingText: {
    color: "#94A3B8",
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  versionText: {
    color: "#CBD5E1",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
  },
});