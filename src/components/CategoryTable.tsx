import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Categoria } from '@/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { TableActionButtons } from '@/components/TableActionButtons';

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
                <TableActionButtons
                  onEdit={() => onEdit(categoria)}
                  onDelete={() => onDelete(categoria)}
                  variant="outline"
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

