import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useScanBoleto } from '@/hooks/useBoletos';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const boletoSchema = z.object({
  fornecedor: z.string().min(1, 'Fornecedor é obrigatório').max(255),
  valor: z.number().positive('Valor deve ser positivo'),
  vencimento: z.string().min(1, 'Vencimento é obrigatório'),
  codigoBarras: z.string().optional(),
  categoria: z.string().optional(),
});

type BoletoForm = z.infer<typeof boletoSchema>;

const Scan = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [scannedData, setScannedData] = useState<any>(null);
  const scanMutation = useScanBoleto();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BoletoForm>({
    resolver: zodResolver(boletoSchema),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleScan = async () => {
    if (!file) return;

    try {
      const data = await scanMutation.mutateAsync(file);
      setScannedData(data);
      
      // Populate form with scanned data
      setValue('fornecedor', data.fornecedor);
      setValue('valor', data.valor);
      setValue('vencimento', data.vencimento);
      if (data.codigoBarras) setValue('codigoBarras', data.codigoBarras);
    } catch (error) {
      console.error('Scan error:', error);
    }
  };

  const onSubmit = (data: BoletoForm) => {
    // In a real app, this would save the edited data
    console.log('Saving boleto:', data);
    navigate('/dashboard');
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('scan')}</h1>
          <p className="text-muted-foreground">
            Escaneie ou faça upload de um boleto
          </p>
        </div>

        {/* Upload Card */}
        {!scannedData && (
          <Card>
            <CardHeader>
              <CardTitle>{t('uploadBoleto')}</CardTitle>
              <CardDescription>
                Faça upload de uma imagem ou PDF do boleto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!preview ? (
                <div>
                  <input
                    id="file-upload"
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex h-48 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-muted"
                  >
                    <Upload className="h-12 w-12 text-muted-foreground" />
                    <p className="mt-4 text-sm font-medium text-foreground">
                      {t('dragDrop')}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      PNG, JPG ou PDF até 10MB
                    </p>
                  </label>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border bg-muted p-4">
                    {file?.type.startsWith('image/') ? (
                      <img
                        src={preview}
                        alt="Preview"
                        className="h-64 w-full rounded object-contain"
                      />
                    ) : (
                      <div className="flex h-64 items-center justify-center">
                        <FileText className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setFile(null);
                        setPreview(null);
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button
                      className="flex-1"
                      onClick={handleScan}
                      disabled={scanMutation.isPending}
                    >
                      {scanMutation.isPending ? 'Escaneando...' : 'Escanear Boleto'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Scanned Data Form */}
        {scannedData && (
          <Card>
            <CardHeader>
              <CardTitle>{t('editData')}</CardTitle>
              <CardDescription>
                Revise e edite os dados extraídos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fornecedor">{t('fornecedor')}</Label>
                  <Input
                    id="fornecedor"
                    {...register('fornecedor')}
                    className={errors.fornecedor ? 'border-destructive' : ''}
                  />
                  {errors.fornecedor && (
                    <p className="text-sm text-destructive">{errors.fornecedor.message}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="valor">{t('valor')}</Label>
                    <Input
                      id="valor"
                      type="number"
                      step="0.01"
                      {...register('valor', { valueAsNumber: true })}
                      className={errors.valor ? 'border-destructive' : ''}
                    />
                    {errors.valor && (
                      <p className="text-sm text-destructive">{errors.valor.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="vencimento">{t('vencimento')}</Label>
                    <Input
                      id="vencimento"
                      type="date"
                      {...register('vencimento')}
                      className={errors.vencimento ? 'border-destructive' : ''}
                    />
                    {errors.vencimento && (
                      <p className="text-sm text-destructive">{errors.vencimento.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="codigoBarras">{t('codigoBarras')} (opcional)</Label>
                  <Input id="codigoBarras" {...register('codigoBarras')} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="categoria">{t('categoria')} (opcional)</Label>
                  <Input id="categoria" {...register('categoria')} />
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setScannedData(null);
                      setFile(null);
                      setPreview(null);
                    }}
                  >
                    Voltar
                  </Button>
                  <Button type="submit" className="flex-1">
                    {t('salvar')}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default Scan;
