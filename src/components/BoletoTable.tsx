import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle } from 'lucide-react';
import { Boleto } from '@/types';
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

interface BoletoTableProps {
  boletos: Boleto[];
  onMarkPaid: (boleto: Boleto) => void;
}

export const BoletoTable = ({ boletos, onMarkPaid }: BoletoTableProps) => {
  const { t } = useTranslation();

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'PAGO':
        return 'default';
      case 'VENCIDO':
        return 'destructive';
      case 'PENDENTE':
        return 'secondary';
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

  return (
    <div className="hidden md:block rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('fornecedor')}</TableHead>
            <TableHead>{t('valor')}</TableHead>
            <TableHead>{t('vencimento')}</TableHead>
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
                {format(new Date(boleto.vencimento), 'dd/MM/yyyy', { locale: ptBR })}
              </TableCell>
              <TableCell>{boleto.categoria || '-'}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(boleto.status)}>
                  {t(boleto.status)}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
