import { useTranslation } from 'react-i18next';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface TableActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  variant?: 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const TableActionButtons = ({
  onEdit,
  onDelete,
  variant = 'outline',
  size = 'sm',
}: TableActionButtonsProps) => {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-end gap-2">
      <Button variant={variant} size={size} onClick={onEdit} className="gap-2">
        <Edit className="h-4 w-4" />
        {t('editar')}
      </Button>
      <Button
        variant={variant}
        size={size}
        onClick={onDelete}
        className={cn(
          'gap-2 text-red-600 hover:text-red-500 dark:text-red-400 dark:hover:text-red-300',
          variant === 'outline' && 'hover:bg-red-50 dark:hover:bg-red-950/20',
          variant === 'ghost' && 'hover:bg-red-50 dark:hover:bg-red-950/20'
        )}
      >
        <Trash2 className="h-4 w-4" />
        {t('excluir')}
      </Button>
    </div>
  );
};

