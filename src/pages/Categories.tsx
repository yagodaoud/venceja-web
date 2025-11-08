import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AlertCircle, Plus, Edit, Trash2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { useCategorias } from '@/hooks/useCategorias';
import { Categoria } from '@/types';
import { Layout } from '@/components/Layout';
import { CategoryTable } from '@/components/CategoryTable';
import { CategoryModal } from '@/components/CategoryModal';
import { DeleteCategoryModal } from '@/components/DeleteCategoryModal';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Categories = () => {
  const { t } = useTranslation();
  const [page, setPage] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCategoria, setSelectedCategoria] = useState<Categoria | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useCategorias({
    page,
    size: 10,
  });

  const handleOpenModal = (categoria?: Categoria) => {
    setSelectedCategoria(categoria || null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedCategoria(null);
  };

  const handleEdit = (categoria: Categoria) => {
    handleOpenModal(categoria);
  };

  const handleDelete = (categoria: Categoria) => {
    setSelectedCategoria(categoria);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedCategoria(null);
  };

  const handleSuccess = (categoria: Categoria) => {
    // Ensure categoria has all required fields
    if (!categoria || !categoria.id) {
      // If the categoria is invalid, just invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: ['categorias'] });
      return;
    }

    // Manually update the cache for instant update
    queryClient.setQueryData(['categorias', { page, size: 10 }], (oldData: any) => {
      if (!oldData || !oldData.data) return oldData;

      const existingIndex = oldData.data.findIndex((c: Categoria) => c.id === categoria.id);

      if (existingIndex >= 0) {
        // Update existing categoria
        const newData = [...oldData.data];
        newData[existingIndex] = {
          ...categoria,
          createdAt: categoria.createdAt || newData[existingIndex].createdAt,
          updatedAt: categoria.updatedAt || new Date().toISOString(),
        };
        return {
          ...oldData,
          data: newData,
        };
      } else {
        // Add new categoria
        return {
          ...oldData,
          data: [
            {
              ...categoria,
              createdAt: categoria.createdAt || new Date().toISOString(),
              updatedAt: categoria.updatedAt || new Date().toISOString(),
            },
            ...oldData.data,
          ],
          meta: {
            ...oldData.meta,
            total: oldData.meta.total + 1,
          },
        };
      }
    });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('categorias')}</h1>
            <p className="text-muted-foreground">
              {t('gerenciarCategorias')}
            </p>
          </div>
          <Button onClick={() => handleOpenModal()} className="gap-2">
            <Plus className="h-4 w-4" />
            {t('criarCategoria')}
          </Button>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        ) : error ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erro</AlertTitle>
            <AlertDescription>
              {t('erroCarregarCategorias')}
            </AlertDescription>
          </Alert>
        ) : !data?.data.length ? (
          <div className="rounded-lg border border-dashed p-12 text-center">
            <p className="text-muted-foreground">{t('nenhumaCategoria')}</p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <CategoryTable
              categorias={data.data}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />

            {/* Mobile Cards */}
            <div className="grid gap-4 md:hidden">
              {data.data.map((categoria) => (
                <Card key={categoria.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-md shadow-sm ring-1 ring-black/5"
                        style={{ backgroundColor: categoria.cor }}
                      />
                      {categoria.nome}
                    </CardTitle>
                    <CardDescription>
                      {categoria.createdAt
                        ? format(new Date(categoria.createdAt), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">{t('cor')}:</span>
                        <span className="text-sm font-mono">{categoria.cor}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(categoria)}
                          className="flex-1 gap-2"
                        >
                          <Edit className="h-4 w-4" />
                          {t('editar')}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(categoria)}
                          className="flex-1 gap-2 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                          {t('excluir')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {data.meta.totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                >
                  {t('anterior')}
                </Button>
                <span className="flex items-center px-4 text-sm text-muted-foreground">
                  {t('pagina')} {page + 1} {t('de')} {data.meta.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= data.meta.totalPages - 1}
                >
                  {t('proxima')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Category Modal */}
      <CategoryModal
        categoria={selectedCategoria}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
      />

      {/* Delete Confirmation Modal */}
      <DeleteCategoryModal
        categoria={selectedCategoria}
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
      />
    </Layout>
  );
};

export default Categories;

