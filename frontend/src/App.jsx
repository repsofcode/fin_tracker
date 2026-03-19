// src/App.jsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';

import Login          from './pages/Login';
import Register       from './pages/Register';
import Dashboard      from './pages/Dashboard';
import Expenses       from './pages/Expenses';
import AddExpense     from './pages/AddExpense';
import EditExpense    from './pages/EditExpense';
import BudgetSettings from './pages/BudgetSettings';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>

          {/* Public routes — no login required */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes — redirects to /login if not authenticated */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/expenses" element={
            <PrivateRoute><Expenses /></PrivateRoute>
          } />
          <Route path="/expenses/add" element={
            <PrivateRoute><AddExpense /></PrivateRoute>
          } />
          <Route path="/expenses/edit/:id" element={
            <PrivateRoute><EditExpense /></PrivateRoute>
          } />
          <Route path="/budget" element={
            <PrivateRoute><BudgetSettings /></PrivateRoute>
          } />

          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
