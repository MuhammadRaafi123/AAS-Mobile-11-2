import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
} from "react-native";

type ButtonProps = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export default function Button({
  title,
  onPress,
  loading = false,
  disabled = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      disabled={loading || disabled}
      style={[styles.button, (loading || disabled) && styles.disabled]}
    >
      {loading ? (
        <ActivityIndicator color="#020617" />
      ) : (
        <Text style={styles.text}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    height: 54,
    borderRadius: 18,
    backgroundColor: "#22d3ee",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#22d3ee",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  disabled: {
    opacity: 0.65,
  },
  text: {
    color: "#020617",
    fontSize: 15,
    fontWeight: "900",
  },
});