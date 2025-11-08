import { useTranslation } from 'react-i18next';
import { useDeleteCategoria } from '@/hooks/useCategorias';
import { Categoria } from '@/types';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface DeleteCategoryModalProps {
  categoria: Categoria | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteCategoryModal = ({ categoria, isOpen, onClose }: DeleteCategoryModalProps) => {
  const { t } = useTranslation();
  const deleteCategoriaMutation = useDeleteCategoria();

  const handleDelete = async () => {
    if (!categoria) return;

    try {
      await deleteCategoriaMutation.mutateAsync(categoria.id);
      onClose();
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  if (!categoria) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmarExclusao')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('confirmarExclusaoDescricaoCategoria')} A categoria <strong>"{categoria.nome}"</strong> será excluída permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancelar')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteCategoriaMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteCategoriaMutation.isPending ? t('excluindo') : t('excluir')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

