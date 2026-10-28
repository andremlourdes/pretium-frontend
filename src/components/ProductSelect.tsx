import { MenuItem, TextField } from '@mui/material';
import type { Product } from '../types/api';

export function ProductSelect({ products, value, onChange, label = 'Produto' }: { products: Product[]; value: number | ''; onChange: (value: number | '') => void; label?: string }) {
  return <TextField select label={label} value={value} onChange={(e) => onChange(e.target.value ? Number(e.target.value) : '')} fullWidth><MenuItem value="">Selecione</MenuItem>{products.map((p) => <MenuItem key={p.id} value={p.id}>{p.name}</MenuItem>)}</TextField>;
}

