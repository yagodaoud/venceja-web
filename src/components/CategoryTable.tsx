import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Edit, Trash2 } from 'lucide-react';
import { Categoria } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';

interface CategoryTableProps {
  categorias: Categoria[];
  onEdit: (categoria: Categoria) => void;
  onDelete: (categoria: Categoria) => void;
}

export const CategoryTable = ({ categorias, onEdit, onDelete }: CategoryTableProps) => {
  const { t } = useTranslation();

  return (
    <div className="hidden md:block rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('nome')}</TableHead>
            <TableHead>{t('cor')}</TableHead>
            <TableHead>{t('criadoEm')}</TableHead>
            <TableHead className="text-right">{t('acoes')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categorias.map((categoria) => (
            <TableRow key={categoria.id}>
              <TableCell className="font-medium">{categoria.nome}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <div
                    className="h-6 w-6 rounded-md shadow-sm ring-1 ring-black/5"
                    style={{ backgroundColor: categoria.cor }}
                  />
                  <span className="text-sm font-mono text-muted-foreground">{categoria.cor}</span>
                </div>
              </TableCell>
              <TableCell>
                {categoria.createdAt
                  ? format(new Date(categoria.createdAt), 'dd/MM/yyyy', { locale: ptBR })
                  : '-'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(categoria)}
                    className="gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    {t('editar')}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(categoria)}
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('excluir')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

