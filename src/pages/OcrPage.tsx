import { useState } from 'react';
import { CloudUploadOutlined } from '@mui/icons-material';
import { Alert, Button, Card, CardContent, Stack, TextField, Typography } from '@mui/material';
import { useMutation } from '@tanstack/react-query';
import { PageHeader } from '../components/PageHeader';
import { getApiErrorMessage } from '../services/api';
import { uploadReceiptOcr } from '../services/featureServices';

export function OcrPage() {
  const [file, setFile] = useState<File>();
  const [text, setText] = useState('');
  const mutation = useMutation({ mutationFn: (selected: File) => uploadReceiptOcr(selected), onSuccess: (result) => setText(result.text), onError: () => setText('') });
  return <Stack spacing={3}><PageHeader title="Leitura de cupom" description="Envie uma imagem e revise o texto reconhecido antes de cadastrar a compra." /><Card><CardContent><Stack spacing={2}><Button component="label" variant="outlined" startIcon={<CloudUploadOutlined />}>Selecionar imagem<input hidden type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0])} /></Button>{file && <Typography variant="body2">Arquivo: {file.name}</Typography>}{mutation.isError && <Alert severity="error">{getApiErrorMessage(mutation.error, 'Não foi possível processar a imagem. Verifique o Tesseract no backend.')}</Alert>}<Button variant="contained" onClick={() => file && mutation.mutate(file)} disabled={!file || mutation.isPending}>{mutation.isPending ? 'Processando...' : 'Processar OCR'}</Button>{text && <><Alert severity="info">Revise o texto extraído. O backend atual fornece texto bruto; o cadastro estruturado do cupom deve ser confirmado manualmente.</Alert><TextField label="Texto extraído (editável)" value={text} onChange={(e) => setText(e.target.value)} multiline minRows={12} fullWidth /></>}</Stack></CardContent></Card></Stack>;
}

