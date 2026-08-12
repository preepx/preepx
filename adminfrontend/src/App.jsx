import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';

// Lazy loading pages for faster initial load
const Login = lazy(() => import('./pages/Login'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Users = lazy(() => import('./pages/Users'));
const UserDetails = lazy(() => import('./pages/UserDetails'));
const Transactions = lazy(() => import('./pages/Transactions'));
const Purchases = lazy(() => import('./pages/Purchases'));
const BtecNotes = lazy(() => import('./pages/BtecNotes'));
const BtecNoteForm = lazy(() => import('./pages/BtecNoteForm'));
const BtecQuestions = lazy(() => import('./pages/BtecQuestions'));
const BtecPdfNotes = lazy(() => import('./pages/BtecPdfNotes'));
const Recruiters = lazy(() => import('./pages/Recruiters'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#fff' }}>Loading Admin Panel...</div>}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="recruiters" element={<Recruiters />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="purchases" element={<Purchases />} />
            <Route path="btec-notes" element={<BtecNotes />} />
            <Route path="btec-notes/new" element={<BtecNoteForm />} />
            <Route path="btec-notes/:id/edit" element={<BtecNoteForm />} />
            <Route path="btec-questions" element={<BtecQuestions />} />
            <Route path="btec-pdf-notes" element={<BtecPdfNotes />} />
            <Route path="btec-pdf-notes/new" element={<BtecNoteForm />} />
            <Route path="btec-pdf-notes/:id/edit" element={<BtecNoteForm />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
