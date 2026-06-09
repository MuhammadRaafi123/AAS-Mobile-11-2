import api from "./api";

export type CreateLaporanPayload = FormData;

export type UpdateStatusPayload = {
  status:
    | "menunggu_verifikasi"
    | "diverifikasi"
    | "diproses"
    | "selesai"
    | "ditolak";
  note?: string;
};

export type CreateCommentPayload = {
  comment: string;
};

export const getLaporan = async () => {
  const response = await api.get("/complaints");
  return response.data;
};

export const getDetailLaporan = async (id: number) => {
  const response = await api.get(`/complaints/${id}`);
  return response.data;
};

export const createLaporan = async (payload: CreateLaporanPayload) => {
  const response = await api.post("/complaints", payload, {
    headers: {
      Accept: "application/json",
    },
  });

  return response.data;
};

export const deleteLaporan = async (id: number) => {
  const response = await api.delete(`/complaints/${id}`);
  return response.data;
};

export const updateStatusLaporan = async (
  id: number,
  payload: UpdateStatusPayload
) => {
  const response = await api.put(`/complaints/${id}/status`, payload);
  return response.data;
};

export const getKomentarLaporan = async (id: number) => {
  const response = await api.get(`/complaints/${id}/comments`);
  return response.data;
};

export const addKomentarLaporan = async (
  id: number,
  payload: CreateCommentPayload
) => {
  const response = await api.post(`/complaints/${id}/comments`, payload);
  return response.data;
};