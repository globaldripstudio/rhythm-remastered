import { useAuth, AuthProvider } from '@/hooks/useAuth';
import LoginForm from '@/components/admin/LoginForm';
import Dashboard from '@/components/admin/Dashboard';
import { Loader2 } from 'lucide-react';

const AdminContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  return <Dashboard />;
};

const Admin = () => {
  return (
    <AuthProvider>
      <AdminContent />
    </AuthProvider>
  );
};

export default Admin;
