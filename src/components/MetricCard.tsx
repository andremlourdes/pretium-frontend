import { Card, CardContent, Skeleton, Typography } from '@mui/material';
import type { SvgIconComponent } from '@mui/icons-material';

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: SvgIconComponent;
  color: string;
  loading?: boolean;
}

export function MetricCard({ label, value, icon: Icon, color, loading }: MetricCardProps) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Icon sx={{ color, fontSize: 36 }} />
        <div>
          <Typography variant="body2" color="text.secondary">{label}</Typography>
          {loading ? <Skeleton width={90} height={38} /> : <Typography variant="h5">{value}</Typography>}
        </div>
      </CardContent>
    </Card>
  );
}

