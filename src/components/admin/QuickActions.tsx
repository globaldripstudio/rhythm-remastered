import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Calendar, Users, Mail, FileText, 
  Phone, Clock, ExternalLink, Zap
} from 'lucide-react';

interface QuickActionsProps {
  onAddClient: () => void;
  onAddEvent: () => void;
}

const QuickActions = ({ onAddClient, onAddEvent }: QuickActionsProps) => {
  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Actions Rapides
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={onAddClient}
            className="h-auto py-4 flex flex-col items-center gap-2 bg-secondary/10 hover:bg-secondary/20 text-foreground border border-secondary/30"
            variant="ghost"
          >
            <Users className="w-6 h-6 text-secondary" />
            <span className="text-sm font-medium">Nouveau Client</span>
          </Button>
          
          <Button 
            onClick={onAddEvent}
            className="h-auto py-4 flex flex-col items-center gap-2 bg-primary/10 hover:bg-primary/20 text-foreground border border-primary/30"
            variant="ghost"
          >
            <Calendar className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium">Nouveau RDV</span>
          </Button>
          
          <a href="mailto:globaldripstudio@gmail.com" className="contents">
            <Button 
              className="h-auto py-4 flex flex-col items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-foreground border border-blue-500/30"
              variant="ghost"
            >
              <Mail className="w-6 h-6 text-blue-500" />
              <span className="text-sm font-medium">Voir Emails</span>
            </Button>
          </a>
          
          <a href="tel:+33659797342" className="contents">
            <Button 
              className="h-auto py-4 flex flex-col items-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-foreground border border-green-500/30"
              variant="ghost"
            >
              <Phone className="w-6 h-6 text-green-500" />
              <span className="text-sm font-medium">Appeler</span>
            </Button>
          </a>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
