import {
  AttachMoneyOutlined,
  Inventory2Outlined,
  ReceiptLongOutlined,
  StorefrontOutlined,
  RefreshOutlined,
} from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Grid, Stack, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { getDashboardSummary } from '../services/dashboardService';
import { getApiErrorMessage } from '../services/api';
import { formatCurrency, formatDate } from '../utils/format';
import { MetricCard } from '../components/MetricCard';
import { ErrorState } from '../components/ErrorState';

export function DashboardPage() {
  const summaryQuery = useQuery({ queryKey: ['dashboardSummary'], queryFn: getDashboardSummary });
  const data = summaryQuery.data;

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4">Dashboard</Typography>
          <Typography color="text.secondary">Acompanhe seus produtos, compras e economia.</Typography>
        </Box>
        <Button startIcon={<RefreshOutlined />} variant="outlined" onClick={() => summaryQuery.refetch()} disabled={summaryQuery.isFetching}>
          Atualizar
        </Button>
      </Box>

      {summaryQuery.isError && <ErrorState message={getApiErrorMessage(summaryQuery.error, 'Não foi possível carregar o dashboard.')} onRetry={() => summaryQuery.refetch()} />}

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} lg={3}><MetricCard label="Produtos" value={data?.totalProducts ?? 0} icon={Inventory2Outlined} color="#1565c0" loading={summaryQuery.isLoading} /></Grid>
        <Grid item xs={12} sm={6} lg={3}><MetricCard label="Lojas" value={data?.totalStores ?? 0} icon={StorefrontOutlined} color="#00897b" loading={summaryQuery.isLoading} /></Grid>
        <Grid item xs={12} sm={6} lg={3}><MetricCard label="Cupons" value={data?.totalReceipts ?? 0} icon={ReceiptLongOutlined} color="#ef6c00" loading={summaryQuery.isLoading} /></Grid>
        <Grid item xs={12} sm={6} lg={3}><MetricCard label="Total gasto" value={formatCurrency(data?.totalSpent)} icon={AttachMoneyOutlined} color="#6a1b9a" loading={summaryQuery.isLoading} /></Grid>
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Próximos indicadores</Typography>
          <Alert severity="info">
            Gráficos de evolução de preços, alertas ativos e compras recentes serão adicionados nesta área.
          </Alert>
          {data?.generatedAt && <Typography variant="caption" color="text.secondary" display="block" mt={2}>Última atualização: {formatDate(data.generatedAt)}</Typography>}
        </CardContent>
      </Card>
    </Stack>
  );
}

