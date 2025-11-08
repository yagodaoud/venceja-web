import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Calendar, DollarSign, Edit, Trash2 } from 'lucide-react';
import { Boleto } from '@/types';
import { parseDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface BoletoCardProps {
  boleto: Boleto;
  onMarkPaid: (boleto: Boleto) => void;
  onEdit: (boleto: Boleto) => void;
  onDelete: (boleto: Boleto) => void;
}

export const BoletoCard = ({ boleto, onMarkPaid, onEdit, onDelete }: BoletoCardProps) => {
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
    <Card className="shadow-md">
      <CardHeader className="space-y-2">
        <div className="flex items-start justify-between">
          <h3 className="font-semibold text-lg">{boleto.fornecedor}</h3>
          <Badge variant={getStatusVariant(boleto.status)}>
            {t(boleto.status)}
          </Badge>
        </div>
        {boleto.categoria && (
          <div className="flex items-center gap-2">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: boleto.categoria.cor }}
            />
            <p className="text-sm text-muted-foreground">{boleto.categoria.nome}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <DollarSign className="h-4 w-4" />
          <span className="text-lg font-bold text-foreground">
            {formatCurrency(boleto.valor)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>{format(parseDate(boleto.vencimento), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
      </CardContent>

      <CardFooter>
        <div className="flex w-full flex-col gap-2">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(boleto)}
              className="flex-1 gap-2"
            >
              <Edit className="h-4 w-4" />
              {t('editar')}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(boleto)}
              className="flex-1 gap-2 text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
              {t('excluir')}
            </Button>
          </div>
          {boleto.status !== 'PAGO' && (
            <Button
              className="w-full gap-2 h-12"
              onClick={() => onMarkPaid(boleto)}
            >
              <CheckCircle className="h-4 w-4" />
              {t('marcarPago')}
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};
