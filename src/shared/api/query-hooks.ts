import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "./axios";

interface QueryParams {
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  [key: string]: unknown;
}

export function useGetList<T>(
  key: string,
  endpoint: string,
  params?: QueryParams,
  enabled = true
) {
  return useQuery<T[]>({
    queryKey: [key, params],
    queryFn: async () => {
      const { data } = await api.get(endpoint, { params });
      if (Array.isArray(data)) return data;
      if (data?.data && Array.isArray(data.data)) return data.data;
      return data?.items || data?.results || [];
    },
    enabled,
  });
}

export function useGetById<T>(key: string, endpoint: string, id?: string | number) {
  return useQuery<T>({
    queryKey: [key, id],
    queryFn: async () => {
      const { data } = await api.get(`${endpoint}/${id}`);
      return data?.data || data;
    },
    enabled: !!id,
  });
}

export function useCreate<T>(key: string, endpoint: string) {
  const qc = useQueryClient();
  return useMutation<T, Error, FormData | Record<string, unknown>>({
    mutationFn: async (body) => {
      const isFormData = body instanceof FormData;
      const { data } = await api.post(endpoint, body, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
    },
  });
}

export function useUpdate<T>(key: string, endpoint: string) {
  const qc = useQueryClient();
  return useMutation<T, Error, { id: string | number; body: FormData | Record<string, unknown> }>({
    mutationFn: async ({ id, body }) => {
      const isFormData = body instanceof FormData;
      const { data } = await api.patch(`${endpoint}/${id}`, body, {
        headers: isFormData ? { "Content-Type": "multipart/form-data" } : {},
      });
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
    },
  });
}

export function useDelete(key: string, endpoint: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, string | number>({
    mutationFn: async (id) => {
      await api.delete(`${endpoint}/${id}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
    },
  });
}

export function useBulkDelete(key: string, endpoint: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, (string | number)[]>({
    mutationFn: async (ids) => {
      await Promise.all(ids.map((id) => api.delete(`${endpoint}/${id}`)));
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
    },
  });
}

export function usePatchStatus(key: string, endpoint: string) {
  const qc = useQueryClient();
  return useMutation<void, Error, { id: string | number; status: string }>({
    mutationFn: async ({ id, status }) => {
      await api.patch(`${endpoint}/${id}/status`, { status });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [key] });
    },
  });
}

export function useFileUpload() {
  return useMutation<string, Error, File>({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await api.post("/upload/image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return data?.url || data?.data?.url || data;
    },
  });
}
