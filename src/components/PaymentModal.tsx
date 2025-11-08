import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Upload, X } from 'lucide-react';
import { Boleto } from '@/types';
import { useMarkPaid } from '@/hooks/useBoletos';
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

interface PaymentModalProps {
  boleto: Boleto | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PaymentModal = ({ boleto, isOpen, onClose }: PaymentModalProps) => {
  const { t } = useTranslation();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const markPaidMutation = useMarkPaid();

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

  const handleSubmit = async () => {
    if (!boleto) return;
    
    await markPaidMutation.mutateAsync({
      id: boleto.id,
      file: file || undefined,
    });
    
    handleClose();
  };

  const handleClose = () => {
    setFile(null);
    setPreview(null);
    onClose();
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  if (!boleto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('marcarPago')}</DialogTitle>
          <DialogDescription>
            Marcar <strong>{boleto.fornecedor}</strong> como pago
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="comprovante">{t('anexarComprovante')} (opcional)</Label>
            
            {!preview ? (
              <div className="relative">
                <input
                  id="comprovante"
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="comprovante"
                  className="flex h-32 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/50 transition-colors hover:border-primary hover:bg-muted"
                >
                  <Upload className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Clique para selecionar
                  </p>
                </label>
              </div>
            ) : (
              <div className="relative rounded-lg border bg-muted p-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={removeFile}
                >
                  <X className="h-4 w-4" />
                </Button>
                {file?.type.startsWith('image/') ? (
                  <img
                    src={preview}
                    alt="Preview"
                    className="h-32 w-full rounded object-cover"
                  />
                ) : (
                  <div className="flex h-32 items-center justify-center">
                    <p className="text-sm text-muted-foreground">{file?.name}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            {t('cancelar')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={markPaidMutation.isPending}
          >
            {markPaidMutation.isPending ? 'Salvando...' : t('salvar')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
