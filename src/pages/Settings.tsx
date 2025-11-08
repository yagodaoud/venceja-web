import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from 'react-hot-toast';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const cnpjSchema = z.object({
  cnpj: z.string().regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/, 'CNPJ inválido'),
});

type PasswordForm = z.infer<typeof passwordSchema>;
type CnpjForm = z.infer<typeof cnpjSchema>;

const Settings = () => {
  const { t } = useTranslation();

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const cnpjForm = useForm<CnpjForm>({
    resolver: zodResolver(cnpjSchema),
  });

  const onPasswordSubmit = async (data: PasswordForm) => {
    // In a real app, this would call the API
    console.log('Changing password:', data);
    toast.success('Senha alterada com sucesso!');
    passwordForm.reset();
  };

  const onCnpjSubmit = async (data: CnpjForm) => {
    // In a real app, this would call the API
    console.log('Saving CNPJ:', data);
    toast.success('CNPJ salvo com sucesso!');
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{t('settings')}</h1>
          <p className="text-muted-foreground">
            Gerencie suas configurações de conta
          </p>
        </div>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle>{t('changePassword')}</CardTitle>
            <CardDescription>
              Altere sua senha de acesso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Senha Atual</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  {...passwordForm.register('currentPassword')}
                  className={passwordForm.formState.errors.currentPassword ? 'border-destructive' : ''}
                />
                {passwordForm.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.currentPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nova Senha</Label>
                <Input
                  id="newPassword"
                  type="password"
                  {...passwordForm.register('newPassword')}
                  className={passwordForm.formState.errors.newPassword ? 'border-destructive' : ''}
                />
                {passwordForm.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.newPassword.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  {...passwordForm.register('confirmPassword')}
                  className={passwordForm.formState.errors.confirmPassword ? 'border-destructive' : ''}
                />
                {passwordForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">
                    {passwordForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? 'Salvando...' : 'Alterar Senha'}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Separator />

        {/* CNPJ */}
        <Card>
          <CardHeader>
            <CardTitle>{t('cnpj')}</CardTitle>
            <CardDescription>
              Adicione ou atualize seu CNPJ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={cnpjForm.handleSubmit(onCnpjSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="cnpj">CNPJ</Label>
                <Input
                  id="cnpj"
                  placeholder="00.000.000/0000-00"
                  {...cnpjForm.register('cnpj')}
                  className={cnpjForm.formState.errors.cnpj ? 'border-destructive' : ''}
                />
                {cnpjForm.formState.errors.cnpj && (
                  <p className="text-sm text-destructive">
                    {cnpjForm.formState.errors.cnpj.message}
                  </p>
                )}
              </div>

              <Button type="submit" disabled={cnpjForm.formState.isSubmitting}>
                {cnpjForm.formState.isSubmitting ? 'Salvando...' : 'Salvar CNPJ'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;
