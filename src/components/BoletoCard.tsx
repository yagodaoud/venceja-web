import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CheckCircle, Calendar, DollarSign } from 'lucide-react';
import { Boleto } from '@/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';

interface BoletoCardProps {
  boleto: Boleto;
  onMarkPaid: (boleto: Boleto) => void;
}

export const BoletoCard = ({ boleto, onMarkPaid }: BoletoCardProps) => {
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
          <p className="text-sm text-muted-foreground">{boleto.categoria}</p>
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
          <span>{format(new Date(boleto.vencimento), 'dd/MM/yyyy', { locale: ptBR })}</span>
        </div>
      </CardContent>

      {boleto.status !== 'PAGO' && (
        <CardFooter>
          <Button
            className="w-full gap-2 h-12"
            onClick={() => onMarkPaid(boleto)}
          >
            <CheckCircle className="h-4 w-4" />
            {t('marcarPago')}
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};
