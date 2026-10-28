import { useState } from 'react';
import { AddOutlined } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Grid, Stack, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '../components/PageHeader';
import { ErrorState } from '../components/ErrorState';
import { getApiErrorMessage } from '../services/api';
import { createLocation, createStore, getLocations, getStores } from '../services/featureServices';

export function StoresPage() {
  const client = useQueryClient();
  const locations = useQuery({ queryKey: ['locations'], queryFn: getLocations });
  const stores = useQuery({ queryKey: ['stores'], queryFn: getStores });
  const [location, setLocation] = useState({ country: 'Brasil', state: '', city: '', zipCode: '' });
  const [store, setStore] = useState({ name: '', description: '', phone: '', website: '' });
  const [selectedLocation, setSelectedLocation] = useState<number>();
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string }>();
  const saveLocation = useMutation({ mutationFn: () => createLocation(location), onSuccess: (value) => { client.invalidateQueries({ queryKey: ['locations'] }); setSelectedLocation(value.id); setMessage({ type: 'success', text: 'Localização criada.' }); }, onError: (e) => setMessage({ type: 'error', text: getApiErrorMessage(e) }) });
  const saveStore = useMutation({ mutationFn: () => createStore(selectedLocation!, store), onSuccess: () => { client.invalidateQueries({ queryKey: ['stores'] }); setStore({ name: '', description: '', phone: '', website: '' }); setMessage({ type: 'success', text: 'Loja criada.' }); }, onError: (e) => setMessage({ type: 'error', text: getApiErrorMessage(e) }) });
  const updateLocation = (field: keyof typeof location, value: string) => setLocation((current) => ({ ...current, [field]: value }));
  const updateStore = (field: keyof typeof store, value: string) => setStore((current) => ({ ...current, [field]: value }));
  return <Stack spacing={3}><PageHeader title="Lojas" description="Cadastre supermercados e suas localizações." action={<Button variant="outlined" startIcon={<AddOutlined />} onClick={() => document.getElementById('store-form')?.scrollIntoView({ behavior: 'smooth' })}>Nova loja</Button>} />
    {message && <Alert severity={message.type} onClose={() => setMessage(undefined)}>{message.text}</Alert>}
    {(locations.isError || stores.isError) && <ErrorState message="Não foi possível carregar as lojas." onRetry={() => { locations.refetch(); stores.refetch(); }} />}
    <Card id="store-form"><CardContent><Stack spacing={2}><h3>Nova localização</h3><Grid container spacing={2}><Grid item xs={12} sm={3}><TextField label="País" value={location.country} onChange={(e) => updateLocation('country', e.target.value)} fullWidth /></Grid><Grid item xs={12} sm={3}><TextField label="Estado" value={location.state} onChange={(e) => updateLocation('state', e.target.value)} fullWidth /></Grid><Grid item xs={12} sm={3}><TextField label="Cidade" value={location.city} onChange={(e) => updateLocation('city', e.target.value)} fullWidth /></Grid><Grid item xs={12} sm={3}><TextField label="CEP" value={location.zipCode} onChange={(e) => updateLocation('zipCode', e.target.value)} fullWidth /></Grid></Grid><Button variant="outlined" onClick={() => saveLocation.mutate()} disabled={saveLocation.isPending || !location.state || !location.city}>Salvar localização</Button><h3>Nova loja</h3><Grid container spacing={2}><Grid item xs={12} sm={6}><TextField label="Nome" value={store.name} onChange={(e) => updateStore('name', e.target.value)} fullWidth /></Grid><Grid item xs={12} sm={6}><TextField label="Telefone" value={store.phone} onChange={(e) => updateStore('phone', e.target.value)} fullWidth /></Grid><Grid item xs={12} sm={6}><TextField label="Website" value={store.website} onChange={(e) => updateStore('website', e.target.value)} fullWidth /></Grid><Grid item xs={12} sm={6}><TextField label="Descrição" value={store.description} onChange={(e) => updateStore('description', e.target.value)} fullWidth /></Grid></Grid><TextField select label="Localização" value={selectedLocation || ''} onChange={(e) => setSelectedLocation(Number(e.target.value))} fullWidth SelectProps={{ native: true }}><option value="">Selecione uma localização</option>{(locations.data || []).map((item) => <option key={item.id} value={item.id}>{item.city} - {item.state}</option>)}</TextField><Button variant="contained" onClick={() => saveStore.mutate()} disabled={saveStore.isPending || !selectedLocation || !store.name}>Salvar loja</Button></Stack></CardContent></Card>
    <Table><TableHead><TableRow><TableCell>Nome</TableCell><TableCell>Localização</TableCell><TableCell>Status</TableCell></TableRow></TableHead><TableBody>{(stores.data || []).map((item) => <TableRow key={item.id}><TableCell>{item.name}</TableCell><TableCell>{item.location?.city} - {item.location?.state}</TableCell><TableCell>{item.status || 'ACTIVE'}</TableCell></TableRow>)}{!stores.isLoading && !(stores.data || []).length && <TableRow><TableCell colSpan={3}>Nenhuma loja cadastrada.</TableCell></TableRow>}</TableBody></Table>
  </Stack>;
}

