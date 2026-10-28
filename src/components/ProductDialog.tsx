import { useEffect, useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, TextField } from '@mui/material';
import type { Product, ProductFormValues } from '../types/api';

const emptyProduct: ProductFormValues = {
  name: '', barcode: '', category: '', brand: '', unit: '', weight: undefined, description: '',
};

interface ProductDialogProps {
  open: boolean;
  product?: Product;
  loading?: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

export function ProductDialog({ open, product, loading, onClose, onSubmit }: ProductDialogProps) {
  const [form, setForm] = useState<ProductFormValues>(emptyProduct);
  const [nameError, setNameError] = useState(false);

  useEffect(() => {
    setForm(product ? {
      name: product.name || '', barcode: product.barcode || '', category: product.category || '',
      brand: product.brand || '', unit: product.unit || '', weight: product.weight, description: product.description || '',
    } : emptyProduct);
    setNameError(false);
  }, [product, open]);

  const update = (field: keyof ProductFormValues, value: string | number | undefined) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const submit = () => {
    if (!form.name.trim()) {
      setNameError(true);
      return;
    }
    onSubmit({ ...form, name: form.name.trim() });
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>{product ? 'Editar produto' : 'Novo produto'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ pt: 1 }}>
          <Grid item xs={12}><TextField label="Nome" value={form.name} onChange={(e) => update('name', e.target.value)} error={nameError} helperText={nameError ? 'Informe o nome do produto.' : ''} required fullWidth autoFocus /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Código de barras" value={form.barcode} onChange={(e) => update('barcode', e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Categoria" value={form.category} onChange={(e) => update('category', e.target.value)} fullWidth /></Grid>
          <Grid item xs={12} sm={6}><TextField label="Marca" value={form.brand} onChange={(e) => update('brand', e.target.value)} fullWidth /></Grid>
          <Grid item xs={6} sm={3}><TextField label="Unidade" value={form.unit} onChange={(e) => update('unit', e.target.value)} fullWidth /></Grid>
          <Grid item xs={6} sm={3}><TextField label="Peso" type="number" value={form.weight ?? ''} onChange={(e) => update('weight', e.target.value === '' ? undefined : Number(e.target.value))} inputProps={{ min: 0, step: 0.01 }} fullWidth /></Grid>
          <Grid item xs={12}><TextField label="Descrição" value={form.description} onChange={(e) => update('description', e.target.value)} multiline minRows={3} fullWidth /></Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>Cancelar</Button>
        <Button variant="contained" onClick={submit} disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</Button>
      </DialogActions>
    </Dialog>
  );
}

