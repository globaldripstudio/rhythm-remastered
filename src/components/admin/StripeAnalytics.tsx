import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  CreditCard, Users, TrendingUp, DollarSign, 
  RefreshCw, ExternalLink, ShoppingCart, Receipt
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StripeCustomer {
  id: string;
  email: string | null;
  name: string | null;
  created: number;
}

interface StripePayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  created: number;
  customer?: string;
}

interface StripeProduct {
  id: string;
  name: string;
  active: boolean;
}

const StripeAnalytics = () => {
  const [customers, setCustomers] = useState<StripeCustomer[]>([]);
  const [payments, setPayments] = useState<StripePayment[]>([]);
  const [products, setProducts] = useState<StripeProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchStripeData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch data through edge function
      const { data, error: fnError } = await supabase.functions.invoke('get-stripe-data');
      
      if (fnError) {
        throw new Error(fnError.message);
      }

      if (data) {
        setCustomers(data.customers || []);
        setPayments(data.payments || []);
        setProducts(data.products || []);
      }
    } catch (err) {
      console.error('Error fetching Stripe data:', err);
      setError('Impossible de charger les données Stripe. Vérifiez que la fonction edge est déployée.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStripeData();
  }, []);

  // Calculate stats
  const totalRevenue = payments
    .filter(p => p.status === 'succeeded')
    .reduce((sum, p) => sum + p.amount, 0) / 100;
  
  const totalCustomers = customers.length;
  const totalProducts = products.filter(p => p.active).length;
  const successfulPayments = payments.filter(p => p.status === 'succeeded').length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'succeeded':
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/30">Réussi</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">En attente</Badge>;
      case 'failed':
        return <Badge className="bg-red-500/20 text-red-500 border-red-500/30">Échoué</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (error && !customers.length && !payments.length) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Stripe CRM
          </CardTitle>
          <CardDescription>Suivi des paiements et clients Stripe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              Pour activer cette fonctionnalité, une fonction Edge "get-stripe-data" doit être créée.
            </p>
            <Button onClick={fetchStripeData} variant="outline">
              <RefreshCw className="w-4 h-4 mr-2" />
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Stripe CRM
          </h2>
          <p className="text-sm text-muted-foreground">Suivi des paiements et clients</p>
        </div>
        <Button onClick={fetchStripeData} variant="outline" size="sm" disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          Actualiser
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Revenu total</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
              <DollarSign className="w-8 h-8 text-green-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Clients Stripe</p>
                <p className="text-2xl font-bold">{totalCustomers}</p>
              </div>
              <Users className="w-8 h-8 text-blue-500/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Paiements réussis</p>
                <p className="text-2xl font-bold">{successfulPayments}</p>
              </div>
              <Receipt className="w-8 h-8 text-primary/50" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Produits actifs</p>
                <p className="text-2xl font-bold">{totalProducts}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-purple-500/50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Derniers paiements
          </CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun paiement enregistré</p>
          ) : (
            <div className="space-y-3">
              {payments.slice(0, 5).map(payment => (
                <div 
                  key={payment.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {getStatusBadge(payment.status)}
                    <div>
                      <p className="font-medium">{formatCurrency(payment.amount / 100)}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(payment.created * 1000), 'dd MMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground font-mono">
                    {payment.id.slice(0, 20)}...
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Customers */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5" />
            Derniers clients Stripe
          </CardTitle>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun client Stripe enregistré</p>
          ) : (
            <div className="space-y-3">
              {customers.slice(0, 5).map(customer => (
                <div 
                  key={customer.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50 hover:bg-muted/30 transition-colors"
                >
                  <div>
                    <p className="font-medium">{customer.name || 'Sans nom'}</p>
                    <p className="text-sm text-muted-foreground">
                      {customer.email || 'Pas d\'email'}
                    </p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(customer.created * 1000), 'dd MMM yyyy', { locale: fr })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Products */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Produits
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Aucun produit configuré</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {products.map(product => (
                <div 
                  key={product.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border/50"
                >
                  <span className="font-medium">{product.name}</span>
                  <Badge variant={product.active ? "default" : "secondary"}>
                    {product.active ? 'Actif' : 'Inactif'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Helper for cn
const cn = (...classes: (string | boolean | undefined)[]) => classes.filter(Boolean).join(' ');

export default StripeAnalytics;
