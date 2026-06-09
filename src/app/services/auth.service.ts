import api from "./api";
import { saveToken, saveUser } from "../utils/storage";

export type UserRole = "masyarakat" | "admin" | "super_admin";

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

type LoginPayload = {
  email: string;
  password: string;
};

type RegisterPayload = {
  nama_lengkap: string;
  email: string;
  password: string;
  nik?: string;
  no_telp?: string;
};

type LoginResponse = {
  token: string;
  user: UserType;
};

type RegisterResponse = {
  message?: string;
  userId?: number;
  token?: string;
  user?: UserType;
};

export const login = async (payload: LoginPayload): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>("/auth/login", payload);

  await saveToken(response.data.token);

  try {
    const profile = await getProfile();

    const userData: UserType = {
      ...response.data.user,
      ...profile,
      no_telp: profile.no_telp || response.data.user.no_telp || "",
      nik: profile.nik || response.data.user.nik || "",
    };

    await saveUser(userData);

    return {
      token: response.data.token,
      user: userData,
    };
  } catch (error) {
    await saveUser(response.data.user);
    return response.data;
  }
};

export const register = async (
  payload: RegisterPayload
): Promise<RegisterResponse> => {
  const response = await api.post<RegisterResponse>("/auth/register", payload);

  return response.data;
};

export const getProfile = async (): Promise<UserType> => {
  const response = await api.get<UserType>("/auth/profile");

  return {
    id: response.data.id,
    email: response.data.email,
    nama_lengkap: response.data.nama_lengkap,
    nik: response.data.nik || "",
    no_telp: response.data.no_telp || "",
    role: response.data.role,
    status: response.data.status,
    created_at: response.data.created_at,
  };
};