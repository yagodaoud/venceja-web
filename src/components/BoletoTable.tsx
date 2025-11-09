import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, FileText, Copy, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Boleto } from '@/types';
import { parseDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableActionButtons } from '@/components/TableActionButtons';

export type SortField = 'id' | 'fornecedor' | 'valor' | 'vencimento';
export type SortDirection = 'asc' | 'desc' | 'none';

interface BoletoTableProps {
  boletos: Boleto[];
  onMarkPaid: (boleto: Boleto) => void;
  onEdit: (boleto: Boleto) => void;
  onDelete: (boleto: Boleto) => void;
  onViewReceipt: (boleto: Boleto) => void;
  sortBy?: SortField;
  direction?: SortDirection;
  onSort?: (field: SortField) => void;
}

export const BoletoTable = ({
  boletos,
  onMarkPaid,
  onEdit,
  onDelete,
  onViewReceipt,
  sortBy,
  direction = 'none',
  onSort,
}: BoletoTableProps) => {
  const { t } = useTranslation();

  const handleSort = (field: SortField) => {
    if (onSort) {
      onSort(field);
    }
  };

  const getSortIcon = (field: SortField) => {
    if (sortBy !== field || direction === 'none') {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />;
    }
    return direction === 'asc' ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'default';
      case 'VENCIDO':
        return 'destructive';
      case 'PENDENTE':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleCopyBarcode = async (codigoBarras: string) => {
    try {
      await navigator.clipboard.writeText(codigoBarras);
      toast.success('Código de barras copiado para a área de transferência!');
    } catch (error) {
      toast.error('Erro ao copiar código de barras');
    }
  };

  return (
    <div className="hidden md:block rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {onSort ? (
                <button
                  onClick={() => handleSort('fornecedor')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  {t('fornecedor')}
                  {getSortIcon('fornecedor')}
                </button>
              ) : (
                t('fornecedor')
              )}
            </TableHead>
            <TableHead>
              {onSort ? (
                <button
                  onClick={() => handleSort('valor')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  {t('valor')}
                  {getSortIcon('valor')}
                </button>
              ) : (
                t('valor')
              )}
            </TableHead>
            <TableHead>
              {onSort ? (
                <button
                  onClick={() => handleSort('vencimento')}
                  className="flex items-center hover:text-foreground transition-colors"
                >
                  {t('vencimento')}
                  {getSortIcon('vencimento')}
                </button>
              ) : (
                t('vencimento')
              )}
            </TableHead>
            <TableHead>{t('categoria')}</TableHead>
            <TableHead>{t('status')}</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {boletos.map((boleto) => (
            <TableRow key={boleto.id}>
              <TableCell className="font-medium">{boleto.fornecedor}</TableCell>
              <TableCell>{formatCurrency(boleto.valor)}</TableCell>
              <TableCell>
                {format(parseDate(boleto.vencimento), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>
                {boleto.categoria ? (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: boleto.categoria.cor }}
                    />
                    <span>{boleto.categoria.nome}</span>
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(boleto.status)}>
                  {t(boleto.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {boleto.codigoBarras && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyBarcode(boleto.codigoBarras!)}
                      className="gap-2"
                      title={t('codigoBarras')}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                  <TableActionButtons
                    onEdit={() => onEdit(boleto)}
                    onDelete={() => onDelete(boleto)}
                    variant="outline"
                  />
                  {boleto.status === 'PAGO' && !boleto.semComprovante && boleto.comprovanteUrl && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onViewReceipt(boleto)}
                      className="gap-2"
                    >
                      <FileText className="h-4 w-4" />
                      {t('visualizarComprovante')}
                    </Button>
                  )}
                  {boleto.status !== 'PAGO' && (
                    <Button
                      size="sm"
                      onClick={() => onMarkPaid(boleto)}
                      className="gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      {t('marcarPago')}
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
