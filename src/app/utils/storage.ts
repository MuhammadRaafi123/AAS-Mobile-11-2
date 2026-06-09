import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "laporin_token";
const USER_KEY = "laporin_user";

export const saveToken = async (token: string) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error("Gagal menyimpan token:", error);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error("Gagal mengambil token:", error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error("Gagal menghapus token:", error);
  }
};

export const saveUser = async (user: any) => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (error) {
    console.error("Gagal menyimpan user:", error);
  }
};

export const getUser = async () => {
  try {
    const data = await AsyncStorage.getItem(USER_KEY);

    if (!data) return null;

    return JSON.parse(data);
  } catch (error) {
    console.error("Gagal mengambil user:", error);
    return null;
  }
};

export const removeUser = async () => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (error) {
    console.error("Gagal menghapus user:", error);
  }
};

export const clearStorage = async () => {
  try {
    await AsyncStorage.multiRemove([
      TOKEN_KEY,
      USER_KEY,
    ]);
  } catch (error) {
    console.error("Gagal membersihkan storage:", error);
  }
};