import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { useCreateCategoria, useUpdateCategoria } from '@/hooks/useCategorias';
import { Categoria } from '@/types';
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
import { ColorPicker } from '@/components/ColorPicker';
import { Input } from './ui/input';

interface CategoryModalProps {
  categoria?: Categoria | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (categoria: Categoria) => void;
}

export const CategoryModal = ({ categoria, isOpen, onClose, onSuccess }: CategoryModalProps) => {
  const { t } = useTranslation();
  const [nome, setNome] = useState('');
  const [cor, setCor] = useState('#3b82f6'); // Default blue color
  const createCategoriaMutation = useCreateCategoria();
  const updateCategoriaMutation = useUpdateCategoria();

  const isEditMode = !!categoria;

  // Reset form when modal opens/closes or categoria changes
  useEffect(() => {
    if (isOpen) {
      if (categoria) {
        setNome(categoria.nome);
        setCor(categoria.cor);
      } else {
        setNome('');
        setCor('#3b82f6');
      }
    }
  }, [isOpen, categoria]);

  const handleSubmit = async () => {
    if (!nome.trim()) {
      toast.error('O nome da categoria é obrigatório');
      return;
    }

    if (!cor || !cor.match(/^#[0-9A-Fa-f]{6}$/)) {
      toast.error('Por favor, selecione uma cor válida');
      return;
    }

    try {
      let result: Categoria;

      if (isEditMode && categoria) {
        result = await updateCategoriaMutation.mutateAsync({
          id: categoria.id,
          categoria: {
            nome: nome.trim(),
            cor,
          },
        });
      } else {
        result = await createCategoriaMutation.mutateAsync({
          nome: nome.trim(),
          cor,
        });
      }

      // Reset form
      setNome('');
      setCor('#3b82f6');

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
    setNome('');
    setCor('#3b82f6');
    onClose();
  };

  const isLoading = createCategoriaMutation.isPending || updateCategoriaMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? t('editarCategoria') : t('criarCategoria')}</DialogTitle>
          <DialogDescription>
            {isEditMode ? t('editarCategoriaDescricao') : t('criarCategoriaDescricao')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">{t('nome')}</Label>
            <Input
              id="nome"
              placeholder={t('nomeCategoriaPlaceholder')}
              value={nome}
              onChange={(e) => setNome(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('cor')}</Label>
            <ColorPicker value={cor} onChange={setCor} />
            <p className="text-xs text-muted-foreground">
              {t('corDescricao')}
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            {t('cancelar')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isLoading || !nome.trim()}
          >
            {isLoading ? t('salvando') : t('salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

