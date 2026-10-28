import { useMemo, useState } from 'react';
import {
  AddOutlined,
  DeleteOutline,
  EditOutlined,
  SearchOutlined,
} from '@mui/icons-material';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  InputAdornment,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ErrorState } from '../components/ErrorState';
import { ProductDialog } from '../components/ProductDialog';
import { getApiErrorMessage } from '../services/api';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../services/productService';
import type { Product, ProductFormValues } from '../types/api';

export function ProductsPage() {
  const queryClient = useQueryClient();
  const productsQuery = useQuery({ queryKey: ['products'], queryFn: getProducts });
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>();
  const [deletingProduct, setDeletingProduct] = useState<Product | undefined>();
  const [feedback, setFeedback] = useState<{ severity: 'success' | 'error'; message: string }>();

  const saveMutation = useMutation({
    mutationFn: ({ id, values }: { id?: number; values: ProductFormValues }) => id ? updateProduct(id, values) : createProduct(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setDialogOpen(false);
      setEditingProduct(undefined);
      setFeedback({ severity: 'success', message: 'Produto salvo com sucesso.' });
    },
    onError: (error) => setFeedback({ severity: 'error', message: getApiErrorMessage(error, 'Não foi possível salvar o produto.') }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['dashboardSummary'] });
      setDeletingProduct(undefined);
      setFeedback({ severity: 'success', message: 'Produto excluído com sucesso.' });
    },
    onError: (error) => setFeedback({ severity: 'error', message: getApiErrorMessage(error, 'Não foi possível excluir o produto.') }),
  });

  const filteredProducts = useMemo(() => {
    const normalized = search.trim().toLocaleLowerCase();
    return (productsQuery.data || []).filter((product) =>
      !normalized || [product.name, product.barcode, product.category, product.brand].some((value) => value?.toLocaleLowerCase().includes(normalized)),
    );
  }, [productsQuery.data, search]);

  const openCreate = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  return (
    <Stack spacing={3}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
        <Box>
          <Typography variant="h4">Produtos</Typography>
          <Typography color="text.secondary">Cadastre e acompanhe os produtos monitorados.</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddOutlined />} onClick={openCreate}>Novo produto</Button>
      </Box>

      {feedback && <Alert severity={feedback.severity} onClose={() => setFeedback(undefined)}>{feedback.message}</Alert>}
      {productsQuery.isError && <ErrorState message={getApiErrorMessage(productsQuery.error, 'Não foi possível carregar os produtos.')} onRetry={() => productsQuery.refetch()} />}

      <Paper>
        <Box sx={{ p: 2 }}>
          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nome, marca, categoria ou código..."
            fullWidth
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchOutlined /></InputAdornment> }}
          />
        </Box>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Produto</TableCell>
                <TableCell>Categoria</TableCell>
                <TableCell>Unidade</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {productsQuery.isLoading && <TableRow><TableCell colSpan={5}>Carregando produtos...</TableCell></TableRow>}
              {!productsQuery.isLoading && filteredProducts.length === 0 && <TableRow><TableCell colSpan={5}>Nenhum produto encontrado.</TableCell></TableRow>}
              {filteredProducts.map((product) => (
                <TableRow key={product.id} hover>
                  <TableCell>
                    <Typography fontWeight={600}>{product.name}</Typography>
                    <Typography variant="caption" color="text.secondary">{product.brand || 'Sem marca'} {product.barcode ? `• ${product.barcode}` : ''}</Typography>
                  </TableCell>
                  <TableCell>{product.category || '—'}</TableCell>
                  <TableCell>{product.unit || '—'}</TableCell>
                  <TableCell><Chip size="small" label={product.status || 'ACTIVE'} color={product.status === 'INACTIVE' ? 'default' : 'success'} /></TableCell>
                  <TableCell align="right">
                    <Button size="small" startIcon={<EditOutlined />} onClick={() => openEdit(product)}>Editar</Button>
                    <Button size="small" color="error" startIcon={<DeleteOutline />} onClick={() => setDeletingProduct(product)}>Excluir</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <ProductDialog
        open={dialogOpen}
        product={editingProduct}
        loading={saveMutation.isPending}
        onClose={() => { setDialogOpen(false); setEditingProduct(undefined); }}
        onSubmit={(values) => saveMutation.mutate({ id: editingProduct?.id, values })}
      />

      <Dialog open={Boolean(deletingProduct)} onClose={() => setDeletingProduct(undefined)}>
        <DialogTitle>Excluir produto?</DialogTitle>
        <DialogContent>O produto <strong>{deletingProduct?.name}</strong> será removido permanentemente.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingProduct(undefined)} disabled={deleteMutation.isPending}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={() => deletingProduct?.id && deleteMutation.mutate(deletingProduct.id)} disabled={deleteMutation.isPending}>
            {deleteMutation.isPending ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}

