import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle, Plus } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useBoletos } from '@/hooks/useBoletos';
import { Boleto } from '@/types';
import { parseDate } from '@/lib/utils';
import { Layout } from '@/components/Layout';
import { BoletoTable } from '@/components/BoletoTable';
import { BoletoCard } from '@/components/BoletoCard';
import { PaymentModal } from '@/components/PaymentModal';
import { BoletoModal } from '@/components/BoletoModal';
import { DeleteBoletoModal } from '@/components/DeleteBoletoModal';
import { ReceiptModal } from '@/components/ReceiptModal';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

const Dashboard = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedBoleto, setSelectedBoleto] = useState<Boleto | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isBoletoModalOpen, setIsBoletoModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [editingBoleto, setEditingBoleto] = useState<Boleto | null>(null);
  const [receiptBoleto, setReceiptBoleto] = useState<Boleto | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useBoletos({
    status: status === 'all' ? undefined : status,
    page,
    size: 10,
  });

  const handleMarkPaid = (boleto: Boleto) => {
    setSelectedBoleto(boleto);
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedBoleto(null);
  };

  const handleOpenBoletoModal = (boleto?: Boleto) => {
    setEditingBoleto(boleto || null);
    setIsBoletoModalOpen(true);
  };

  const handleCloseBoletoModal = () => {
    setIsBoletoModalOpen(false);
    setEditingBoleto(null);
  };

  const handleEdit = (boleto: Boleto) => {
    handleOpenBoletoModal(boleto);
  };

  const handleDelete = (boleto: Boleto) => {
    setEditingBoleto(boleto);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setEditingBoleto(null);
  };

  const handleViewReceipt = (boleto: Boleto) => {
    setReceiptBoleto(boleto);
    setIsReceiptModalOpen(true);
  };

  const handleCloseReceiptModal = () => {
    setIsReceiptModalOpen(false);
    setReceiptBoleto(null);
  };

  const handleBoletoSuccess = (boleto: Boleto) => {
    // Manually update the cache for instant update
    queryClient.setQueryData(['boletos', { status: status === 'all' ? undefined : status, page, size: 10 }], (oldData: any) => {
      if (!oldData || !oldData.data) return oldData;

      const existingIndex = oldData.data.findIndex((b: Boleto) => b.id === boleto.id);

      if (existingIndex >= 0) {
        // Update existing boleto
        const newData = [...oldData.data];
        newData[existingIndex] = {
          ...boleto,
          createdAt: boleto.createdAt || newData[existingIndex].createdAt,
          updatedAt: boleto.updatedAt || new Date().toISOString(),
        };
        return {
          ...oldData,
          data: newData,
        };
      } else {
        // Add new boleto
        return {
          ...oldData,
          data: [
            {
              ...boleto,
              createdAt: boleto.createdAt || new Date().toISOString(),
              updatedAt: boleto.updatedAt || new Date().toISOString(),
            },
            ...oldData.data,
          ],
          meta: {
            ...oldData.meta,
            total: oldData.meta.total + 1,
          },
        };
      }
    });
  };

  // Check for boletos expiring in 3 days
  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  const expiringBoletos = data?.data.filter((boleto) => {
    const vencimento = parseDate(boleto.vencimento);
    return (
      boleto.status === 'PENDENTE' &&
      vencimento >= today &&
      vencimento <= threeDaysFromNow
    );
  }) || [];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
            <p className="text-muted-foreground">
              Gerencie seus boletos de forma eficiente
            </p>
          </div>
          <Button onClick={() => handleOpenBoletoModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('criarBoleto')}
          </Button>
        </div>

        {/* Alert for expiring boletos */}
        {expiringBoletos.length > 0 && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{t('vencendoEm3Dias')}</AlertTitle>
            <AlertDescription>
              Você tem {expiringBoletos.length} boleto(s) vencendo nos próximos 3 dias.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{t('filtrar')}:</span>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos os status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="PENDENTE">{t('PENDENTE')}</SelectItem>
                <SelectItem value="VENCIDO">{t('VENCIDO')}</SelectItem>
                <SelectItem value="PAGO">{t('PAGO')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              Não foi possível carregar os boletos. Tente novamente.
            </AlertDescription>
          </Alert>
        ) : !data?.data.length ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">Nenhum boleto encontrado</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <BoletoTable 
              boletos={data.data} 
              onMarkPaid={handleMarkPaid}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewReceipt={handleViewReceipt}
            />

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {data.data.map((boleto) => (
                <BoletoCard
                  key={boleto.id}
                  boleto={boleto}
                  onMarkPaid={handleMarkPaid}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                  onViewReceipt={handleViewReceipt}
                />
              ))}
            </div>

            {/* Pagination */}
            {data.meta.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  Anterior
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  Página {page + 1} de {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.meta.totalPages - 1}
                >
                  Próxima
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Payment Modal */}
      <PaymentModal
        boleto={selectedBoleto}
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
      />

      {/* Boleto Modal */}
      <BoletoModal
        boleto={editingBoleto}
        isOpen={isBoletoModalOpen}
        onClose={handleCloseBoletoModal}
        onSuccess={handleBoletoSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteBoletoModal
        boleto={editingBoleto}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
      />

      {/* Receipt Modal */}
      {receiptBoleto && receiptBoleto.comprovanteUrl && (
        <ReceiptModal
          isOpen={isReceiptModalOpen}
          onClose={handleCloseReceiptModal}
          comprovanteUrl={receiptBoleto.comprovanteUrl}
          fornecedor={receiptBoleto.fornecedor}
        />
      )}
    </Layout>
  );
};

export default Dashboard;
