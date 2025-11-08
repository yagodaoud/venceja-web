import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { useBoletos } from '@/hooks/useBoletos';
import { Boleto } from '@/types';
import { Layout } from '@/components/Layout';
import { BoletoTable } from '@/components/BoletoTable';
import { BoletoCard } from '@/components/BoletoCard';
import { PaymentModal } from '@/components/PaymentModal';
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, error } = useBoletos({
    status: status === 'all' ? undefined : status,
    page,
    size: 10,
  });

  const handleMarkPaid = (boleto: Boleto) => {
    setSelectedBoleto(boleto);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBoleto(null);
  };

  // Check for boletos expiring in 3 days
  const today = new Date();
  const threeDaysFromNow = new Date(today);
  threeDaysFromNow.setDate(today.getDate() + 3);

  const expiringBoletos = data?.data.filter((boleto) => {
    const vencimento = new Date(boleto.vencimento);
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
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('dashboard')}</h1>
          <p className="text-muted-foreground">
            Gerencie seus boletos de forma eficiente
          </p>
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
            <BoletoTable boletos={data.data} onMarkPaid={handleMarkPaid} />

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {data.data.map((boleto) => (
                <BoletoCard
                  key={boleto.id}
                  boleto={boleto}
                  onMarkPaid={handleMarkPaid}
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
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </Layout>
  );
};

export default Dashboard;
