import { useState } from 'react';
import { CloudUploadOutlined, DeleteOutline } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Grid, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { getProducts } from '../services/productService';
import { addReceiptItem, createReceipt, getStores, uploadReceiptOcr } from '../services/featureServices';
import { ProductSelect } from '../components/ProductSelect';
import type { OcrDraft, OcrDraftItem } from '../utils/ocrParser';
import { parseReceiptText } from '../utils/ocrParser';

export function OcrPage() {
  const client = useQueryClient();
  const [file, setFile] = useState<File>();
  const [text, setText] = useState('');
  const [draft, setDraft] = useState<OcrDraft>();
  const [storeId, setStoreId] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string }>();
  const stores = useQuery({ queryKey: ['stores'], queryFn: getStores });
  const products = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const mutation = useMutation({
    mutationFn: (selected: File) => uploadReceiptOcr(selected),
    onSuccess: (result) => {
      setText(result.text);
      setDraft(parseReceiptText(result.text, products.data || []));
      setMessage(undefined);
    },
    onError: () => {
      setText('');
      setDraft(undefined);
    },
  });
  const saveDraft = useMutation({
    mutationFn: async () => {
      if (!draft || !storeId) throw new Error('Selecione a loja.');
      const receipt = await createReceipt({
        storeId: Number(storeId),
        receiptNumber: draft.receiptNumber || `OCR-${Date.now()}`,
        purchaseDate: `${draft.purchaseDate}:00`,
        totalAmount: Number(draft.totalAmount),
      });
      for (const item of draft.items) {
        if (!item.productId) throw new Error(`Associe o item "${item.description}" a um produto.`);
        await addReceiptItem(receipt.id!, { productId: Number(item.productId), quantity: item.quantity, unitPrice: Number(item.unitPrice) });
      }
    },
    onSuccess: () => {
      client.invalidateQueries({ queryKey: ['receipts'] });
      setMessage({ type: 'success', text: 'Cupom e itens salvos após confirmação.' });
    },
    onError: (error) => setMessage({ type: 'error', text: getApiErrorMessage(error, 'Não foi possível salvar o cupom.') }),
  });
  const updateItem = (id: string, update: Partial<OcrDraftItem>) => setDraft((current) => current && ({ ...current, items: current.items.map((item) => item.id === id ? { ...item, ...update } : item) }));
  const removeItem = (id: string) => setDraft((current) => current && ({ ...current, items: current.items.filter((item) => item.id !== id) }));
  const canSave = Boolean(draft && storeId && draft.receiptNumber && draft.purchaseDate && draft.totalAmount && draft.items.length && draft.items.every((item) => item.productId && item.quantity > 0 && Number(item.unitPrice) >= 0));

  return <Stack spacing={3}>
    <PageHeader title="Leitura de cupom" description="Envie uma imagem, revise os dados identificados e confirme antes de cadastrar a compra." />
    <Card><CardContent><Stack spacing={2}>
      <Button sx={{ width: { xs: '100%', sm: 'auto' } }} component="label" variant="outlined" startIcon={<CloudUploadOutlined />}>Selecionar imagem<input hidden type="file" accept="image/*" capture="environment" onChange={(e) => setFile(e.target.files?.[0])} /></Button>
      {file && <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>Arquivo: {file.name}</Typography>}
      {mutation.isError && <Alert severity="error">{getApiErrorMessage(mutation.error, 'Não foi possível processar a imagem. Verifique o Tesseract no backend.')}</Alert>}
      <Button sx={{ width: { xs: '100%', sm: 'auto' } }} variant="contained" onClick={() => file && mutation.mutate(file)} disabled={!file || mutation.isPending}>{mutation.isPending ? 'Processando...' : 'Processar OCR'}</Button>
      {text && <TextField label="Texto extraído (editável)" value={text} onChange={(e) => setText(e.target.value)} multiline minRows={8} fullWidth />}
    </Stack></CardContent></Card>
    {draft && <Card><CardContent><Stack spacing={2}>
      <Alert severity="info">Confira os dados identificados. Nada será salvo até você clicar em “Confirmar e salvar”.</Alert>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={3}><TextField select SelectProps={{ native: true }} label="Loja" value={storeId} onChange={(e) => setStoreId(e.target.value)} fullWidth><option value="">Selecione</option>{(stores.data || []).map((store) => <option key={store.id} value={store.id}>{store.name}</option>)}</TextField></Grid>
        <Grid item xs={12} sm={3}><TextField label="Número do cupom" value={draft.receiptNumber} onChange={(e) => setDraft({ ...draft, receiptNumber: e.target.value })} fullWidth /></Grid>
        <Grid item xs={12} sm={3}><TextField label="Data da compra" type="datetime-local" value={draft.purchaseDate} onChange={(e) => setDraft({ ...draft, purchaseDate: e.target.value })} fullWidth InputLabelProps={{ shrink: true }} /></Grid>
        <Grid item xs={12} sm={3}><TextField label="Total" type="number" value={draft.totalAmount} onChange={(e) => setDraft({ ...draft, totalAmount: e.target.value })} fullWidth /></Grid>
      </Grid>
      <Typography variant="h6">Itens identificados</Typography>
      {!draft.items.length && <Alert severity="warning">Nenhum item foi identificado automaticamente. Adicione os itens manualmente em Cupons.</Alert>}
      {draft.items.map((item) => <Grid container spacing={1} alignItems="center" key={item.id}>
        <Grid item xs={12} sm={4}><TextField label="Descrição reconhecida" value={item.description} onChange={(e) => updateItem(item.id, { description: e.target.value })} fullWidth /></Grid>
        <Grid item xs={12} sm={3}><ProductSelect products={products.data || []} value={item.productId} onChange={(value) => updateItem(item.id, { productId: value })} /></Grid>
        <Grid item xs={5} sm={2}><TextField label="Quantidade" type="number" value={item.quantity} onChange={(e) => updateItem(item.id, { quantity: Number(e.target.value) })} fullWidth /></Grid>
        <Grid item xs={5} sm={2}><TextField label="Preço unitário" type="number" value={item.unitPrice} onChange={(e) => updateItem(item.id, { unitPrice: e.target.value })} fullWidth /></Grid>
        <Grid item xs={2} sm={1}><IconButton aria-label={`Remover ${item.description}`} onClick={() => removeItem(item.id)}><DeleteOutline /></IconButton></Grid>
      </Grid>)}
      {message && <Alert severity={message.type}>{message.text}</Alert>}
      <Button variant="contained" onClick={() => saveDraft.mutate()} disabled={!canSave || saveDraft.isPending}>{saveDraft.isPending ? 'Salvando...' : 'Confirmar e salvar'}</Button>
    </Stack></CardContent></Card>}
  </Stack>;
}
