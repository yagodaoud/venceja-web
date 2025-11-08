import { useTranslation } from 'react-i18next';
import { Download } from 'lucide-react';
import { useBoletos } from '@/hooks/useBoletos';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import Papa from 'papaparse';
import { formatCurrencyToBrazilian, formatDateForInput } from '@/lib/utils';

const Reports = () => {
  const { t } = useTranslation();
  const { data } = useBoletos({ size: 100 });

  const boletos = data?.data || [];

  // Calculate totals
  const totalPago = boletos
    .filter((b) => b.status === 'PAGO')
    .reduce((sum, b) => sum + b.valor, 0);

  const totalPendente = boletos
    .filter((b) => b.status === 'PENDENTE')
    .reduce((sum, b) => sum + b.valor, 0);

  // Group by category
  const categoryData = boletos.reduce((acc: any, boleto) => {
    const category = boleto.categoria?.nome || 'Sem categoria';
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += boleto.valor;
    return acc;
  }, {});

  const chartData = Object.entries(categoryData).map(([name, value]) => ({
    name,
    value,
  }));

  const COLORS = ['#4CAF50', '#2196F3', '#FFC107', '#FF5722', '#9C27B0', '#00BCD4'];

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const handleExportCSV = () => {
    const csv = Papa.unparse(
      boletos.map((b) => ({
        Fornecedor: b.fornecedor,
        Valor: formatCurrencyToBrazilian(b.valor),
        Vencimento: formatDateForInput(b.vencimento),
        Status: b.status,
        Categoria: b.categoria?.nome || '',
      }))
    );

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `boletos_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{t('reports')}</h1>
            <p className="text-muted-foreground">
              Visualize estatísticas e exporte dados
            </p>
          </div>
          <Button onClick={handleExportCSV} className="gap-2">
            <Download className="h-4 w-4" />
            {t('exportarCSV')}
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('totalPago')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-success">
                {formatCurrency(totalPago)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t('totalPendente')}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-warning">
                {formatCurrency(totalPendente)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>{t('gastoPorCategoria')}</CardTitle>
            <CardDescription>
              Distribuição de gastos por categoria
            </CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[400px] items-center justify-center text-muted-foreground">
                Nenhum dado disponível
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Reports;
