import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Sun, Moon, Calendar, Clock, Users, 
  TrendingUp, CheckCircle, AlertCircle
} from 'lucide-react';
import { format, isToday, isSameDay, startOfDay, endOfDay, addHours } from 'date-fns';
import { fr } from 'date-fns/locale';

interface Event {
  id: string;
  title: string;
  start_time: string;
  end_time: string | null;
  color: string;
}

const TodayOverview = () => {
  const [todayEvents, setTodayEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchTodayEvents();
    }
  }, [user]);

  const fetchTodayEvents = async () => {
    const today = new Date();
    const dayStart = startOfDay(today);
    const dayEnd = endOfDay(today);

    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', dayStart.toISOString())
      .lte('start_time', dayEnd.toISOString())
      .order('start_time');

    if (!error) {
      setTodayEvents(data || []);
    }
    setIsLoading(false);
  };

  const now = new Date();
  const currentHour = now.getHours();
  const greeting = currentHour < 12 ? 'Bonjour' : currentHour < 18 ? 'Bon après-midi' : 'Bonsoir';
  const icon = currentHour < 18 ? <Sun className="w-6 h-6 text-yellow-500" /> : <Moon className="w-6 h-6 text-blue-400" />;

  // Calculate day progress (8h to 20h working hours)
  const workStart = 8;
  const workEnd = 20;
  const workDuration = workEnd - workStart;
  const currentProgress = Math.max(0, Math.min(100, ((currentHour - workStart) / workDuration) * 100));

  // Upcoming event
  const upcomingEvent = todayEvents.find(e => new Date(e.start_time) > now);
  const pastEventsCount = todayEvents.filter(e => new Date(e.start_time) <= now).length;

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden relative">
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-primary/10 to-transparent rounded-bl-full" />
      
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {icon}
            <div>
              <CardTitle className="text-xl">{greeting} !</CardTitle>
              <p className="text-sm text-muted-foreground">
                {format(now, 'EEEE d MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
          <Badge variant="outline" className="text-lg font-bold px-3 py-1">
            {format(now, 'HH:mm')}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Day progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progression journée</span>
            <span className="font-medium">{Math.round(currentProgress)}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{workStart}h</span>
            <span>{workEnd}h</span>
          </div>
        </div>

        {/* Today's stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">RDV aujourd'hui</span>
            </div>
            <p className="text-2xl font-bold">{todayEvents.length}</p>
          </div>
          <div className="bg-muted/30 rounded-lg p-3 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Terminés</span>
            </div>
            <p className="text-2xl font-bold">{pastEventsCount}</p>
          </div>
        </div>

        {/* Next event */}
        {upcomingEvent ? (
          <div className="bg-primary/10 rounded-lg p-4 border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">Prochain RDV</span>
            </div>
            <p className="font-semibold">{upcomingEvent.title}</p>
            <p className="text-sm text-muted-foreground">
              {format(new Date(upcomingEvent.start_time), 'HH:mm', { locale: fr })}
              {upcomingEvent.end_time && ` - ${format(new Date(upcomingEvent.end_time), 'HH:mm', { locale: fr })}`}
            </p>
          </div>
        ) : todayEvents.length > 0 ? (
          <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="font-medium text-green-600">Tous les RDV sont terminés !</span>
            </div>
          </div>
        ) : (
          <div className="bg-muted/30 rounded-lg p-4 border border-border/50 text-center">
            <p className="text-muted-foreground">Aucun RDV prévu aujourd'hui</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TodayOverview;
