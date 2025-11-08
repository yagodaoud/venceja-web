import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useCreateBoleto, useUpdateBoleto } from '@/hooks/useBoletos';
import { useCategorias } from '@/hooks/useCategorias';
import { Boleto } from '@/types';
import { parseDate, formatDateToBrazilian } from '@/lib/utils';
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
  const [vencimento, setVencimento] = useState('');
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
        setValor(boleto.valor.toString());
        // Format date for input (YYYY-MM-DD)
        const vencimentoDate = parseDate(boleto.vencimento);
        const year = vencimentoDate.getFullYear();
        const month = String(vencimentoDate.getMonth() + 1).padStart(2, '0');
        const day = String(vencimentoDate.getDate()).padStart(2, '0');
        setVencimento(`${year}-${month}-${day}`);
        setCodigoBarras(boleto.codigoBarras || '');
        setCategoriaId(boleto.categoria?.id.toString() || 'none');
      } else {
        setFornecedor('');
        setValor('');
        setVencimento('');
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

    if (!valor || isNaN(parseFloat(valor)) || parseFloat(valor) <= 0) {
      toast.error('Por favor, insira um valor válido');
      return;
    }

    if (!vencimento) {
      toast.error('A data de vencimento é obrigatória');
      return;
    }

    try {
      let result: Boleto;

      const boletoData = {
        fornecedor: fornecedor.trim(),
        valor: parseFloat(valor),
        vencimento: formatDateToBrazilian(vencimento),
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
      setVencimento('');
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
    setVencimento('');
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
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="vencimento">{t('vencimento')}</Label>
            <Input
              id="vencimento"
              type="date"
              value={vencimento}
              onChange={(e) => setVencimento(e.target.value)}
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

