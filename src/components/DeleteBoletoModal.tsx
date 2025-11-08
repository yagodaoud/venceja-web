import { useTranslation } from 'react-i18next';
import { useDeleteBoleto } from '@/hooks/useBoletos';
import { Boleto } from '@/types';
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

interface DeleteBoletoModalProps {
  boleto: Boleto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeleteBoletoModal = ({ boleto, isOpen, onClose }: DeleteBoletoModalProps) => {
  const { t } = useTranslation();
  const deleteBoletoMutation = useDeleteBoleto();

  const handleDelete = async () => {
    if (!boleto) return;

    try {
      await deleteBoletoMutation.mutateAsync(boleto.id);
      onClose();
    } catch (error) {
      // Error is already handled by the mutation
    }
  };

  if (!boleto) return null;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('confirmarExclusao')}</AlertDialogTitle>
          <AlertDialogDescription>
            {t('confirmarExclusaoDescricao')} O boleto <strong>"{boleto.fornecedor}"</strong> será excluído permanentemente.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{t('cancelar')}</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleteBoletoMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {deleteBoletoMutation.isPending ? t('excluindo') : t('excluir')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

