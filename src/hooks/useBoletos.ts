import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Boleto, PaginatedResponse, ScanBoletoResponse } from '@/types';
import { toast } from 'react-hot-toast';

interface BoletoFilters {
  status?: string;
  page?: number;
  size?: number;
}

export const useBoletos = (filters: BoletoFilters = {}) => {
  return useQuery({
    queryKey: ['boletos', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      params.append('page', String(filters.page || 0));
      params.append('size', String(filters.size || 10));

      const { data } = await api.get<PaginatedResponse<Boleto>>(`/boletos?${params}`);
      return data;
    },
  });
};

export const useScanBoleto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);

      const { data } = await api.post<ScanBoletoResponse>('/boletos/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      toast.success('Boleto escaneado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao escanear boleto');
    },
  });
};

export const useMarkPaid = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, file }: { id: number; file?: File }) => {
      const formData = new FormData();
      if (file) {
        formData.append('comprovante', file);
      }

      const { data } = await api.put<Boleto>(`/boletos/${id}/pagar`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      toast.success('Boleto marcado como pago!');
    },
    onError: () => {
      toast.error('Erro ao marcar boleto como pago');
    },
  });
};
