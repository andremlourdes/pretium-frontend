import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ProductsPage } from './pages/ProductsPage';
import { StoresPage } from './pages/StoresPage';
import { ReceiptsPage } from './pages/ReceiptsPage';
import { InsightsPage } from './pages/InsightsPage';
import { OcrPage } from './pages/OcrPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/produtos" element={<ProductsPage />} />
        <Route path="/lojas" element={<StoresPage />} />
        <Route path="/cupons" element={<ReceiptsPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/ocr" element={<OcrPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

