import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Categoria, PaginatedResponse, CreateCategoriaRequest, UpdateCategoriaRequest } from '@/types';
import { toast } from 'react-hot-toast';

interface CategoriaFilters {
  page?: number;
  size?: number;
}

export const useCategorias = (filters: CategoriaFilters = {}) => {
  return useQuery({
    queryKey: ['categorias', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append('page', String(filters.page || 0));
      params.append('size', String(filters.size || 10));

      const { data } = await api.get<PaginatedResponse<Categoria>>(`/categorias?${params}`);
      return data;
    },
  });
};

export const useCreateCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (categoria: CreateCategoriaRequest) => {
      const response = await api.post<any>('/categorias', categoria);
      // Handle both response formats: { data: Categoria } or Categoria directly
      const categoriaData = response.data?.data || response.data;
      
      // Ensure we have a valid Categoria object
      if (!categoriaData || typeof categoriaData !== 'object') {
        throw new Error('Resposta inválida da API');
      }
      
      return categoriaData as Categoria;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoria criada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao criar categoria');
    },
  });
};

export const useUpdateCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, categoria }: { id: number; categoria: UpdateCategoriaRequest }) => {
      const response = await api.put<any>(`/categorias/${id}`, categoria);
      // Handle both response formats: { data: Categoria } or Categoria directly
      const categoriaData = response.data?.data || response.data;
      
      // Ensure we have a valid Categoria object
      if (!categoriaData || typeof categoriaData !== 'object') {
        throw new Error('Resposta inválida da API');
      }
      
      return categoriaData as Categoria;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoria atualizada com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao atualizar categoria');
    },
  });
};

export const useDeleteCategoria = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/categorias/${id}`);
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      toast.success('Categoria excluída com sucesso!');
    },
    onError: () => {
      toast.error('Erro ao excluir categoria');
    },
  });
};

