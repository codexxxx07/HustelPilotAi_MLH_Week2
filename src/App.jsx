import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Proposals from './pages/Proposals';
import Estimator from './pages/Estimator';
import Invoices from './pages/Invoices';
import Communications from './pages/Communications';
import Documents from './pages/Documents';
import Settings from './pages/Settings';
import About from './pages/About';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/proposals" element={<Proposals />} />
          <Route path="/estimator" element={<Estimator />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/communications" element={<Communications />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/about" element={<About />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
