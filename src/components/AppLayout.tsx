import {
  DashboardOutlined,
  Inventory2Outlined,
  Menu as MenuIcon,
  PriceCheckOutlined,
  ReceiptLongOutlined,
  StorefrontOutlined,
  AnalyticsOutlined,
  DocumentScannerOutlined,
} from '@mui/icons-material';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';

const drawerWidth = 240;
const navigation = [
  { label: 'Dashboard', path: '/', icon: <DashboardOutlined /> },
  { label: 'Produtos', path: '/produtos', icon: <Inventory2Outlined /> },
  { label: 'Lojas', path: '/lojas', icon: <StorefrontOutlined /> },
  { label: 'Cupons', path: '/cupons', icon: <ReceiptLongOutlined /> },
  { label: 'Preços e alertas', path: '/insights', icon: <AnalyticsOutlined /> },
  { label: 'OCR de cupons', path: '/ocr', icon: <DocumentScannerOutlined /> },
];

export function AppLayout() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Toolbar>
        <PriceCheckOutlined color="primary" sx={{ mr: 1 }} />
        <Typography variant="h6" fontWeight={700} color="primary">
          Pretium
        </Typography>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {navigation.map((item) => (
          <ListItemButton
            key={item.path}
            selected={location.pathname === item.path}
            onClick={() => {
              navigate(item.path);
              setMobileOpen(false);
            }}
            sx={{ borderRadius: 2, mb: 0.5 }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ mt: 'auto', p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          Controle inteligente de preços
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          display: { md: 'none' },
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Toolbar>
          <IconButton edge="start" onClick={() => setMobileOpen(true)} aria-label="Abrir menu">
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" fontWeight={700}>Pretium</Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{ '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' } }}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, sm: 3, md: 4 }, pt: { xs: 10, md: 4 } }}>
        <Outlet />
      </Box>
    </Box>
  );
}

