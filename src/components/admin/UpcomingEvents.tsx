import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { CalendarCheck, Clock } from 'lucide-react';
import { format, isAfter, isBefore, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

interface EventItem {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  description: string | null;
  color: string | null;
}

const UpcomingEvents = () => {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) fetchEvents();
  }, [user]);

  const fetchEvents = async () => {
    setIsLoading(true);
    const now = new Date().toISOString();
    
    // Fetch events that haven't ended yet (or started but no end_time)
    const { data } = await supabase
      .from('events')
      .select('id, title, start_time, end_time, description, color')
      .or(`end_time.gte.${now},and(end_time.is.null,start_time.gte.${new Date(Date.now() - 3600000).toISOString()})`)
      .order('start_time', { ascending: true })
      .limit(15);

    setEvents(data || []);
    setIsLoading(false);
  };

  const isEventInProgress = (event: EventItem) => {
    const now = new Date();
    const start = new Date(event.start_time);
    if (event.end_time) {
      return isWithinInterval(now, { start, end: new Date(event.end_time) });
    }
    // If no end_time, consider in progress if started within last hour
    return isAfter(now, start) && isBefore(now, new Date(start.getTime() + 3600000));
  };

  if (isLoading) {
    return (
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <CalendarCheck className="w-5 h-5" />
            RDV à venir
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
          <CalendarCheck className="w-5 h-5 text-primary" />
          RDV à venir
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[250px]">
          <div className="px-6 pb-4 space-y-2">
            {events.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                Aucun RDV à venir
              </div>
            ) : (
              events.map((event) => {
                const inProgress = isEventInProgress(event);
                return (
                  <div
                    key={event.id}
                    className={`flex items-start gap-3 p-3 rounded-lg transition-colors border-l-2 ${
                      inProgress 
                        ? 'border-l-red-500 bg-red-500/5' 
                        : 'border-transparent hover:border-primary/50 hover:bg-muted/30'
                    }`}
                  >
                    <div className="mt-0.5">
                      <Clock className={`w-4 h-4 ${inProgress ? 'text-red-500' : 'text-primary'}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm truncate">{event.title}</span>
                        {inProgress && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0 animate-pulse">
                            en cours
                          </Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.start_time), 'EEEE dd MMM à HH:mm', { locale: fr })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default UpcomingEvents;
