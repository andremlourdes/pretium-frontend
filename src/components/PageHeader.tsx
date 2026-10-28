import { Box, Typography } from '@mui/material';

export function PageHeader({ title, description, action }: { title: string; description: string; action?: React.ReactNode }) {
  return <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'stretch', sm: 'center' }, gap: 2 }}>
    <Box sx={{ minWidth: 0 }}><Typography variant="h4">{title}</Typography><Typography color="text.secondary">{description}</Typography></Box>
    {action && <Box sx={{ flexShrink: 0, '& > button': { width: { xs: '100%', sm: 'auto' } } }}>{action}</Box>}
  </Box>;
}
