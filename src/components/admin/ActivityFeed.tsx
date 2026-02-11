import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, Calendar, Users, Clock, 
  CheckCircle2, PlusCircle, Edit3
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'client' | 'event';
  action: 'created' | 'updated';
  name: string;
  timestamp: string;
  eventDate?: string;
}

const ActivityFeed = () => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    setIsLoading(true);

    // Fetch recent clients
    const { data: clients } = await supabase
      .from('clients')
      .select('id, name, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);

    // Fetch recent events
    const { data: events } = await supabase
      .from('events')
      .select('id, title, start_time, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(10);

    const allActivities: ActivityItem[] = [];

    clients?.forEach(client => {
      const isUpdated = client.updated_at !== client.created_at;
      allActivities.push({
        id: client.id,
        type: 'client',
        action: isUpdated ? 'updated' : 'created',
        name: client.name,
        timestamp: isUpdated ? client.updated_at : client.created_at
      });
    });

    events?.forEach(event => {
      const isUpdated = event.updated_at !== event.created_at;
      allActivities.push({
        id: event.id,
        type: 'event',
        action: isUpdated ? 'updated' : 'created',
        name: event.title,
        timestamp: isUpdated ? event.updated_at : event.created_at,
        eventDate: event.start_time
      });
    });

    // Sort by timestamp
    allActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    setActivities(allActivities.slice(0, 8));
    setIsLoading(false);
  };

  const getIcon = (type: string, action: string) => {
    if (type === 'client') {
      return action === 'created' ? (
        <PlusCircle className="w-4 h-4 text-green-500" />
      ) : (
        <Edit3 className="w-4 h-4 text-blue-500" />
      );
    }
    return action === 'created' ? (
      <Calendar className="w-4 h-4 text-primary" />
    ) : (
      <Clock className="w-4 h-4 text-secondary" />
    );
  };

  const getActionText = (type: string, action: string) => {
    if (type === 'client') {
      return action === 'created' ? 'Nouveau client' : 'Client modifié';
    }
    return action === 'created' ? 'Nouveau RDV' : 'RDV modifié';
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Activité Récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">Chargement...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="w-5 h-5 text-primary" />
          Activité Récente
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[300px]">
          <div className="px-6 pb-4 space-y-2">
            {activities.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Aucune activité récente
              </div>
            ) : (
              activities.map((activity, index) => (
                <div 
                  key={`${activity.type}-${activity.id}-${index}`}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/30 transition-colors border-l-2 border-transparent hover:border-primary/50"
                >
                  <div className="mt-0.5">{getIcon(activity.type, activity.action)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm truncate">{activity.name}</span>
                      <Badge variant="outline" className="text-xs shrink-0">
                        {activity.type === 'client' ? 'Client' : 'RDV'}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-muted-foreground">
                        {getActionText(activity.type, activity.action)}
                      </span>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-xs text-muted-foreground">
                        {activity.eventDate 
                          ? format(new Date(activity.eventDate), 'dd MMM yyyy à HH:mm', { locale: fr })
                          : format(new Date(activity.timestamp), 'dd MMM yyyy', { locale: fr })
                        }
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ActivityFeed;
