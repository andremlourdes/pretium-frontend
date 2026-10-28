import { useState } from 'react';
import { AddAlertOutlined, TrendingDownOutlined, TrendingUpOutlined } from '@mui/icons-material';
import { Alert as MuiAlert, Button, Card, CardContent, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { ProductSelect } from '../components/ProductSelect';
import { getApiErrorMessage } from '../services/api';
import { getProducts } from '../services/productService';
import { createAlert, deleteAlert, getAlerts, getForecast, getPriceAnalytics, getPriceHistory } from '../services/featureServices';
import { formatCurrency, formatDate } from '../utils/format';

export function InsightsPage() {
  const client = useQueryClient();
  const products = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const [productId, setProductId] = useState<number | ''>('');
  const [range] = useState({ start: `${new Date().getFullYear()}-01-01T00:00:00`, end: new Date().toISOString().slice(0, 19) });
  const analytics = useQuery({ queryKey: ['priceAnalytics', productId], queryFn: () => getPriceAnalytics(productId as number), enabled: Boolean(productId) });
  const history = useQuery({ queryKey: ['priceHistory', productId], queryFn: () => getPriceHistory(productId as number, range.start, range.end), enabled: Boolean(productId) });
  const forecast = useQuery({ queryKey: ['forecast', productId], queryFn: () => getForecast(productId as number), enabled: Boolean(productId) });
  const alerts = useQuery({ queryKey: ['alerts'], queryFn: getAlerts });
  const [targetPrice, setTargetPrice] = useState('');
  const [conditionType, setConditionType] = useState('BELOW');
  const [feedback, setFeedback] = useState<string>();
  const saveAlert = useMutation({ mutationFn: () => createAlert({ productId: productId as number, targetPrice: Number(targetPrice), conditionType }), onSuccess: () => { client.invalidateQueries({ queryKey: ['alerts'] }); setTargetPrice(''); setFeedback('Alerta criada.'); }, onError: (e) => setFeedback(getApiErrorMessage(e, 'Não foi possível criar o alerta.')) });
  const removeAlert = useMutation({ mutationFn: (id: number) => deleteAlert(id), onSuccess: () => client.invalidateQueries({ queryKey: ['alerts'] }) });
  const chartData = (history.data || []).map((item) => ({ date: item.recordedDate ? new Date(item.recordedDate).toLocaleDateString('pt-BR') : '', price: Number(item.discountedPrice ?? item.price ?? 0), store: item.storeName }));
  const trendIcon = forecast.data?.trend === 'UP' ? <TrendingUpOutlined /> : <TrendingDownOutlined />;
  return <Stack spacing={3}><PageHeader title="Preços e alertas" description="Compare preços, acompanhe tendências e configure notificações." /><ProductSelect products={products.data || []} value={productId} onChange={setProductId} />
    {feedback && <MuiAlert onClose={() => setFeedback(undefined)} severity={feedback.includes('não') ? 'error' : 'success'}>{feedback}</MuiAlert>}
    {productId && <><Grid container spacing={2}>{[['Mínimo', analytics.data?.minPrice], ['Médio', analytics.data?.averagePrice], ['Máximo', analytics.data?.maxPrice], ['Previsão', forecast.data?.predictedPrice]].map(([label, value]) => <Grid item xs={6} md={3} key={String(label)}><Card><CardContent><Typography color="text.secondary">{label}</Typography><Typography variant="h5">{value == null ? '—' : formatCurrency(Number(value))}</Typography></CardContent></Card></Grid>)}</Grid>
      <Card><CardContent><Typography variant="h6" gutterBottom>Histórico de preços</Typography>{history.isLoading ? <Typography>Carregando...</Typography> : chartData.length ? <ResponsiveContainer width="100%" height={300}><LineChart data={chartData}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="date" /><YAxis tickFormatter={(value) => `R$ ${value}`} /><Tooltip formatter={(value) => formatCurrency(Number(value))} /><Line type="monotone" dataKey="price" stroke="#1565c0" strokeWidth={3} dot /></LineChart></ResponsiveContainer> : <MuiAlert severity="info">Não há histórico no período consultado.</MuiAlert>}</CardContent></Card>
      <Grid container spacing={2}><Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Previsão</Typography>{forecast.data ? <Stack direction="row" spacing={1} alignItems="center" mt={2}><Chip icon={trendIcon} label={forecast.data.trend || 'STABLE'} color={forecast.data.trend === 'DOWN' ? 'success' : forecast.data.trend === 'UP' ? 'warning' : 'default'} /><Typography>Preço atual: {formatCurrency(forecast.data.currentPrice)}</Typography><Typography>Registros usados: {forecast.data.recordsUsed ?? 0}</Typography></Stack> : <Typography color="text.secondary">Sem dados suficientes para previsão.</Typography>}</CardContent></Card></Grid>
        <Grid item xs={12} md={6}><Card><CardContent><Typography variant="h6">Novo alerta</Typography><Stack spacing={2} mt={2}><TextField label="Preço alvo" type="number" value={targetPrice} onChange={(e) => setTargetPrice(e.target.value)} fullWidth /><TextField select label="Condição" value={conditionType} onChange={(e) => setConditionType(e.target.value)} fullWidth><MenuItem value="BELOW">Abaixo de</MenuItem><MenuItem value="ABOVE">Acima de</MenuItem><MenuItem value="EQUAL">Igual a</MenuItem></TextField><Button variant="contained" startIcon={<AddAlertOutlined />} onClick={() => saveAlert.mutate()} disabled={saveAlert.isPending || !targetPrice}>Criar alerta</Button></Stack></CardContent></Card></Grid></Grid>
    </>}
    <Card><CardContent><Typography variant="h6" gutterBottom>Alertas ativos</Typography><Stack spacing={1}>{(alerts.data || []).map((item) => <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center"><Typography>{item.productName || `Produto #${item.productId}`} — {item.conditionType} {formatCurrency(item.targetPrice)}</Typography><Button size="small" color="error" onClick={() => item.id && removeAlert.mutate(item.id)}>Desativar</Button></Stack>)}{!alerts.data?.length && <Typography color="text.secondary">Nenhum alerta cadastrado.</Typography>}</Stack></CardContent></Card>
  </Stack>;
}

