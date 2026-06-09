import api from "./api";
import { saveUser } from "../utils/storage";

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

export type UpdateProfilePayload = {
  nama_lengkap: string;
  email: string;
  no_telp: string;
  nik: string;
};

type UpdateProfileResponse = {
  message?: string;
  user: UserType;
};

export const updateProfile = async (
  payload: UpdateProfilePayload
): Promise<UserType> => {
  const response = await api.put<UpdateProfileResponse>("/users/profile", {
    nama_lengkap: payload.nama_lengkap,
    email: payload.email,
    no_telp: payload.no_telp,
    nik: payload.nik,
  });

  await saveUser(response.data.user);

  return response.data.user;
};