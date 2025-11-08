export type BoletoStatus = 'PENDENTE' | 'VENCIDO' | 'PAGO';

export interface Boleto {
  id: number;
  userId: number;
  fornecedor: string;
  valor: number;
  vencimento: string; // ISO date string
  codigoBarras?: string;
  imagemUrl?: string;
  status: BoletoStatus;
  categoria?: string;
  comprovanteUrl?: string;
  semComprovante: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: number;
  email: string;
  cnpj?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  data: {
    token: string;
    user: User;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    size: number;
    total: number;
    totalPages: number;
  };
}

export interface ScanBoletoResponse {
  id: number;
  fornecedor: string;
  valor: number;
  vencimento: string;
  status: BoletoStatus;
  imagemUrl: string;
  codigoBarras?: string;
}

export interface Categoria {
  id: number;
  userId: number;
  nome: string;
  cor: string; // hex color
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoriaRequest {
  nome: string;
  cor: string;
}

export interface UpdateCategoriaRequest {
  nome: string;
  cor: string;
}