import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';
import { useCreateBoleto, useUpdateBoleto } from '@/hooks/useBoletos';
import { useCategorias } from '@/hooks/useCategorias';
import { Boleto } from '@/types';
import { parseDate, formatCurrencyForInput, parseCurrencyFromBrazilian } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from './ui/input';
import { SingleDatePicker } from '@/components/DateRangePicker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface BoletoModalProps {
  boleto?: Boleto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (boleto: Boleto) => void;
}

export const BoletoModal = ({ boleto, isOpen, onClose, onSuccess }: BoletoModalProps) => {
  const { t } = useTranslation();
  const [fornecedor, setFornecedor] = useState('');
  const [valor, setValor] = useState('');
  const [vencimento, setVencimento] = useState<Date | undefined>(undefined);
  const [codigoBarras, setCodigoBarras] = useState('');
  const [categoriaId, setCategoriaId] = useState<string>('none');
  const createBoletoMutation = useCreateBoleto();
  const updateBoletoMutation = useUpdateBoleto();

  // Fetch all categories (using a large page size to get all)
  const { data: categoriasData } = useCategorias({ page: 0, size: 1000 });

  const isEditMode = !!boleto;

  // Reset form when modal opens/closes or boleto changes
  useEffect(() => {
    if (isOpen) {
      if (boleto) {
        setFornecedor(boleto.fornecedor);
        setValor(formatCurrencyForInput(boleto.valor));
        // Parse date string to Date object
        const parsedDate = parseDate(boleto.vencimento);
        setVencimento(isNaN(parsedDate.getTime()) ? undefined : parsedDate);
        setCodigoBarras(boleto.codigoBarras || '');
        setCategoriaId(boleto.categoria?.id.toString() || 'none');
      } else {
        setFornecedor('');
        setValor('');
        setVencimento(undefined);
        setCodigoBarras('');
        setCategoriaId('none');
      }
    }
  }, [isOpen, boleto]);

  const handleSubmit = async () => {
    if (!fornecedor.trim()) {
      toast.error('O fornecedor é obrigatório');
      return;
    }

    // Parse currency from Brazilian format
    const valorNumber = parseCurrencyFromBrazilian(valor);
    if (isNaN(valorNumber) || valorNumber <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    if (!vencimento) {
      toast.error('A data de vencimento é obrigatória');
      return;
    }

    try {
      let result: Boleto;

      // Format date to DD/MM/YYYY
      const vencimentoFormatted = format(vencimento, 'dd/MM/yyyy');

      const boletoData = {
        fornecedor: fornecedor.trim(),
        valor: valorNumber,
        vencimento: vencimentoFormatted,
        codigoBarras: codigoBarras.trim() || undefined,
        categoriaId: categoriaId && categoriaId !== 'none' ? parseInt(categoriaId) : null,
      };

      if (isEditMode && boleto) {
        result = await updateBoletoMutation.mutateAsync({
          id: boleto.id,
          boleto: boletoData,
        });
      } else {
        result = await createBoletoMutation.mutateAsync(boletoData);
      }

      // Reset form
      setFornecedor('');
      setValor('');
      setVencimento(undefined);
      setCodigoBarras('');
      setCategoriaId('none');

      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess(result);
      }

      onClose();
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  const handleClose = () => {
    setFornecedor('');
    setValor('');
    setVencimento(undefined);
    setCodigoBarras('');
    setCategoriaId('none');
    onClose();
  };

  const isLoading = createBoletoMutation.isPending || updateBoletoMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('editarBoleto') : t('criarBoleto')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editarBoletoDescricao') : t('criarBoletoDescricao')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fornecedor">{t('fornecedor')}</Label>
            <Input
              id="fornecedor"
              placeholder={t('fornecedorPlaceholder')}
              value={fornecedor}
              onChange={(e) => setFornecedor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="valor">{t('valor')}</Label>
            <Input
              id="valor"
              type="text"
              placeholder="0,00"
              value={valor}
              onChange={(e) => {
                let input = e.target.value;
                // Remove all non-digit characters except comma
                input = input.replace(/[^\d,]/g, '');
                // Only allow one comma
                const parts = input.split(',');
                if (parts.length > 2) {
                  input = parts[0] + ',' + parts.slice(1).join('');
                }
                // Limit decimal places to 2
                if (parts.length === 2 && parts[1].length > 2) {
                  input = parts[0] + ',' + parts[1].substring(0, 2);
                }
                setValor(input);
              }}
              onBlur={(e) => {
                // Format on blur with thousands separators if valid
                const parsed = parseCurrencyFromBrazilian(e.target.value);
                if (!isNaN(parsed) && parsed >= 0) {
                  setValor(formatCurrencyForInput(parsed));
                } else if (e.target.value.trim() === '') {
                  setValor('');
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vencimento">{t('vencimento')}</Label>
            <SingleDatePicker
              date={vencimento}
              onDateChange={setVencimento}
              placeholder="DD/MM/AAAA"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="codigoBarras">{t('codigoBarras')} (opcional)</Label>
            <Input
              id="codigoBarras"
              placeholder={t('codigoBarrasPlaceholder')}
              value={codigoBarras}
              onChange={(e) => setCodigoBarras(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="categoria">{t('categoria')} (opcional)</Label>
            <Select value={categoriaId} onValueChange={setCategoriaId}>
              <SelectTrigger id="categoria">
                <SelectValue placeholder={t('selecionarCategoria')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{t('nenhumaCategoria')}</SelectItem>
                {categoriasData?.data.map((categoria) => (
                  <SelectItem key={categoria.id} value={categoria.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-3 w-3 rounded-full"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      {categoria.nome}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            {t('cancelar')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !fornecedor.trim() || !valor || !vencimento}
          >
            {isLoading ? t('salvando') : t('salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

