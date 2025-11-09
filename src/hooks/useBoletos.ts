import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Boleto, PaginatedResponse, ScanBoletoResponse, CreateBoletoRequest, UpdateBoletoRequest } from '@/types';
import { toast } from 'react-hot-toast';

interface BoletoFilters {
  status?: string;
  page?: number;
  size?: number;
  dataInicio?: string; // DD/MM/YYYY format
  dataFim?: string; // DD/MM/YYYY format
  sortBy?: string;
  direction?: 'asc' | 'desc';
}

export const useBoletos = (filters: BoletoFilters = {}) => {
  return useQuery({
    queryKey: ['boletos', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.dataInicio) params.append('dataInicio', filters.dataInicio);
      if (filters.dataFim) params.append('dataFim', filters.dataFim);
      params.append('page', String(filters.page || 0));
      params.append('size', String(filters.size || 10));
      params.append('sortBy', filters.sortBy || 'id');
      params.append('direction', filters.direction || 'desc');

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

      const response = await api.post<any>('/boletos/scan', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      // Handle both response formats: { data: Boleto } or Boleto directly
      const boletoData = response.data?.data || response.data;

      // Ensure we have a valid Boleto object
      if (!boletoData || typeof boletoData !== 'object') {
        throw new Error('Resposta inválida da API');
      }

      return boletoData as Boleto;
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

export const useCreateBoleto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (boleto: CreateBoletoRequest) => {
      const response = await api.post<any>('/boletos', boleto);
      // Handle both response formats: { data: Boleto } or Boleto directly
      const boletoData = response.data?.data || response.data;

      // Ensure we have a valid Boleto object
      if (!boletoData || typeof boletoData !== 'object') {
        throw new Error('Resposta inválida da API');
      }

      return boletoData as Boleto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      toast.success('Boleto criado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar boleto');
    },
  });
};

export const useUpdateBoleto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, boleto }: { id: number; boleto: UpdateBoletoRequest }) => {
      const response = await api.put<any>(`/boletos/${id}`, boleto);
      // Handle both response formats: { data: Boleto } or Boleto directly
      const boletoData = response.data?.data || response.data;

      // Ensure we have a valid Boleto object
      if (!boletoData || typeof boletoData !== 'object') {
        throw new Error('Resposta inválida da API');
      }

      return boletoData as Boleto;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      toast.success('Boleto atualizado com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar boleto');
    },
  });
};

export const useDeleteBoleto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/boletos/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['boletos'] });
      toast.success('Boleto excluído com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir boleto');
    },
  });
};
