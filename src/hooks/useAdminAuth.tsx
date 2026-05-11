import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AdminAuthState {
  isAdmin: boolean;
  isLoading: boolean;
  error: string | null;
}

export const useAdminAuth = (): AdminAuthState => {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const checkAdminRole = async () => {
      if (authLoading) return;

      if (!user) {
        if (!cancelled) {
          setIsAdmin(false);
          setIsLoading(false);
          setError(null);
        }
        return;
      }

      setIsLoading(true);
      setError(null);

      // Petite tentative de retry pour éviter les races juste après login
      // (le token JWT peut mettre quelques ms à être propagé au client)
      const attemptQuery = async () => {
        return await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .maybeSingle();
      };

      try {
        let { data, error: queryError } = await attemptQuery();
        if (queryError) {
          await new Promise((r) => setTimeout(r, 400));
          ({ data, error: queryError } = await attemptQuery());
        }

        if (cancelled) return;

        if (queryError) {
          console.error('Error checking admin role:', queryError);
          setError('Erreur lors de la vérification des permissions');
          setIsAdmin(false);
        } else {
          setIsAdmin(!!data);
        }
      } catch (err) {
        if (cancelled) return;
        console.error('Unexpected error checking admin role:', err);
        setError('Erreur inattendue');
        setIsAdmin(false);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    checkAdminRole();
    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  return { isAdmin, isLoading, error };
};
