import { Box, Typography } from '@mui/material';

export function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}><Box><Typography variant="h4">{title}</Typography><Typography color="text.secondary">{description}</Typography></Box>{action}</Box>;
}

