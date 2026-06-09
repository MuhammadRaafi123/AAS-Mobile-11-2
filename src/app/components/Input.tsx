import { Text, TextInput, StyleSheet, View } from "react-native";

type InputProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
};

export default function Input({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  secureTextEntry = false,
}: InputProps) {
  return (
    <View style={styles.group}>
      <Text style={styles.label}>{label}</Text>

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#64748b"
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        style={[styles.input, multiline && styles.textarea]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  group: {
    marginBottom: 16,
  },
  label: {
    color: "#e2e8f0",
    fontSize: 13,
    fontWeight: "800",
    marginBottom: 8,
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: "rgba(2, 6, 23, 0.75)",
    borderWidth: 1,
    borderColor: "rgba(148, 163, 184, 0.18)",
    paddingHorizontal: 16,
    color: "#f8fafc",
    fontSize: 14,
  },
  textarea: {
    minHeight: 130,
    paddingTop: 14,
    textAlignVertical: "top",
  },
});