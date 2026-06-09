import api from "./api";

export const getKomentar = async (laporanId: number) => {
  const response = await api.get(`/complaints/${laporanId}/comments`);
  return response.data;
};

export const createKomentar = async (laporanId: number, komentar: string) => {
  const response = await api.post(`/complaints/${laporanId}/comments`, {
    comment: komentar,
  });

  return response.data;
};

export const deleteKomentar = async (
  laporanId: number,
  komentarId: number
) => {
  const response = await api.delete(
    `/complaints/${laporanId}/comments/${komentarId}`
  );

  return response.data;
};