import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import UserDetails from './pages/UserDetails';
import Transactions from './pages/Transactions';
import BtecNotes from './pages/BtecNotes';
import BtecNoteForm from './pages/BtecNoteForm';
import BtecQuestions from './pages/BtecQuestions';
import BtecPdfNotes from './pages/BtecPdfNotes';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="users" element={<Users />} />
          <Route path="users/:id" element={<UserDetails />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="btec-notes" element={<BtecNotes />} />
          <Route path="btec-notes/new" element={<BtecNoteForm />} />
          <Route path="btec-notes/:id/edit" element={<BtecNoteForm />} />
          <Route path="btec-questions" element={<BtecQuestions />} />
          <Route path="btec-pdf-notes" element={<BtecPdfNotes />} />
          <Route path="btec-pdf-notes/new" element={<BtecNoteForm />} />
          <Route path="btec-pdf-notes/:id/edit" element={<BtecNoteForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
