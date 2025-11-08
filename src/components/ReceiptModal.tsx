import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  comprovanteUrl: string;
  fornecedor?: string;
}

type FileType = 'pdf' | 'image' | 'unknown';

export const ReceiptModal = ({
  isOpen,
  onClose,
  comprovanteUrl,
  fornecedor,
}: ReceiptModalProps) => {
  const { t } = useTranslation();
  const [fileType, setFileType] = useState<FileType>('unknown');

  useEffect(() => {
    if (!comprovanteUrl) return;

    // Try to detect file type from URL
    const urlLower = comprovanteUrl.toLowerCase();
    const hasPdfExtension = urlLower.includes('.pdf') || urlLower.match(/\.pdf(\?|$|#)/);
    const hasImageExtension = urlLower.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)(\?|$|#)/i);
    
    // Check content type hints in URL (Firebase Storage URLs often have this)
    const hasImageHint = urlLower.includes('image') || urlLower.includes('img');
    const hasPdfHint = urlLower.includes('pdf') || urlLower.includes('application/pdf');

    if (hasPdfExtension || hasPdfHint) {
      setFileType('pdf');
    } else if (hasImageExtension || hasImageHint) {
      setFileType('image');
    } else {
      // Default to image for Firebase Storage URLs that don't have extension
      // Most comprovantes are images
      setFileType('image');
    }
  }, [comprovanteUrl]);

  const handleImageError = () => {
    // If image fails, try as PDF
    if (fileType === 'image') {
      setFileType('pdf');
    } else {
      setFileType('unknown');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>{t('visualizarComprovante')}</DialogTitle>
          <DialogDescription>
            {fornecedor ? `Comprovante de ${fornecedor}` : 'Visualização do comprovante'}
          </DialogDescription>
        </DialogHeader>

        <div className="relative w-full h-[70vh] flex items-center justify-center bg-muted rounded-lg overflow-hidden">
          {fileType === 'pdf' ? (
            <div className="w-full h-full flex flex-col">
              <div className="flex-1 w-full">
                <iframe
                  src={comprovanteUrl}
                  className="w-full h-full border-0"
                  title="Comprovante PDF"
                />
              </div>
              <div className="p-4 border-t bg-background flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Documento PDF</span>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <a href={comprovanteUrl} target="_blank" rel="noopener noreferrer">
                    {t('abrirNovaAba')}
                  </a>
                </Button>
              </div>
            </div>
          ) : fileType === 'image' ? (
            <div className="w-full h-full flex items-center justify-center p-4">
              <img
                src={comprovanteUrl}
                alt="Comprovante"
                className="max-w-full max-h-full object-contain rounded"
                onError={handleImageError}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground p-4">
              <FileText className="h-12 w-12" />
              <p className="text-sm text-center">
                Não foi possível determinar o tipo de arquivo.
                <br />
                Clique no botão abaixo para abrir em uma nova aba.
              </p>
              <Button variant="outline" size="sm" asChild>
                <a href={comprovanteUrl} target="_blank" rel="noopener noreferrer">
                  {t('abrirNovaAba')}
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

