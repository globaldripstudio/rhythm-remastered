import { useState, useEffect, useRef, useCallback } from 'react';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isSameDay, addHours, setHours, setMinutes, differenceInMinutes } from 'date-fns';
import { fr } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Trash2, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface Event {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string | null;
  color: string;
}

interface SelectionState {
  day: Date;
  startHour: number;
  endHour: number;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 8); // 8h to 21h
const COLORS = [
  '#4ecdc4', '#45b7d1', '#96ceb4', '#ff6b35', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'
];
const HOUR_HEIGHT = 60; // pixels per hour

const WeeklyAgenda = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ day: Date; hour: number } | null>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    color: '#4ecdc4'
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: weekStart, end: weekEnd });

  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user, currentDate]);

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('start_time', weekStart.toISOString())
      .lte('start_time', weekEnd.toISOString())
      .order('start_time');

    if (error) {
      console.error('Error fetching events:', error);
    } else {
      setEvents(data || []);
    }
  };

  const getHourFromY = (y: number, rect: DOMRect): number => {
    const relativeY = y - rect.top;
    const hourIndex = Math.floor(relativeY / HOUR_HEIGHT);
    const minuteFraction = (relativeY % HOUR_HEIGHT) / HOUR_HEIGHT;
    const minutes = Math.round(minuteFraction * 4) * 15; // Round to 15 min
    return HOURS[Math.max(0, Math.min(hourIndex, HOURS.length - 1))] + minutes / 60;
  };

  const getDayFromX = (x: number, rect: DOMRect): Date | null => {
    const relativeX = x - rect.left - 50; // 50px for hour labels
    const dayWidth = (rect.width - 50) / 7;
    const dayIndex = Math.floor(relativeX / dayWidth);
    if (dayIndex >= 0 && dayIndex < 7) {
      return days[dayIndex];
    }
    return null;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!gridRef.current) return;
    const rect = gridRef.current.getBoundingClientRect();
    const day = getDayFromX(e.clientX, rect);
    const hour = getHourFromY(e.clientY, rect);
    
    if (day && hour) {
      setIsDragging(true);
      setDragStart({ day, hour });
      setSelection({ day, startHour: hour, endHour: hour + 1 });
    }
  };

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart || !gridRef.current) return;
    
    const rect = gridRef.current.getBoundingClientRect();
    const currentHour = getHourFromY(e.clientY, rect);
    
    const startHour = Math.min(dragStart.hour, currentHour);
    const endHour = Math.max(dragStart.hour, currentHour);
    
    setSelection({
      day: dragStart.day,
      startHour: Math.floor(startHour),
      endHour: Math.ceil(endHour)
    });
  }, [isDragging, dragStart]);

  const handleMouseUp = () => {
    if (isDragging && selection) {
      openDialogForSelection();
    }
    setIsDragging(false);
    setDragStart(null);
  };

  const openDialogForSelection = () => {
    if (!selection) return;
    
    const startDate = setMinutes(setHours(selection.day, Math.floor(selection.startHour)), (selection.startHour % 1) * 60);
    const endDate = setMinutes(setHours(selection.day, Math.floor(selection.endHour)), (selection.endHour % 1) * 60);
    
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      start_time: format(startDate, "yyyy-MM-dd'T'HH:mm"),
      end_time: format(endDate, "yyyy-MM-dd'T'HH:mm"),
      color: '#4ecdc4'
    });
    setIsDialogOpen(true);
  };

  const handleEventClick = (event: Event, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelection(null);
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start_time: format(new Date(event.start_time), "yyyy-MM-dd'T'HH:mm"),
      end_time: event.end_time ? format(new Date(event.end_time), "yyyy-MM-dd'T'HH:mm") : '',
      color: event.color
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const eventData = {
      user_id: user.id,
      title: formData.title,
      description: formData.description || null,
      start_time: new Date(formData.start_time).toISOString(),
      end_time: formData.end_time ? new Date(formData.end_time).toISOString() : null,
      color: formData.color
    };

    if (editingEvent) {
      const { error } = await supabase
        .from('events')
        .update(eventData)
        .eq('id', editingEvent.id);

      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Événement modifié" });
        fetchEvents();
      }
    } else {
      const { error } = await supabase
        .from('events')
        .insert(eventData);

      if (error) {
        toast({ title: "Erreur", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Événement créé" });
        fetchEvents();
      }
    }

    setIsDialogOpen(false);
    setSelection(null);
  };

  const handleDelete = async (eventId: string) => {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId);

    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Événement supprimé" });
      fetchEvents();
    }
  };

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(new Date(event.start_time), day));
  };

  const getEventPosition = (event: Event) => {
    const start = new Date(event.start_time);
    const end = event.end_time ? new Date(event.end_time) : addHours(start, 1);
    
    const startHour = start.getHours() + start.getMinutes() / 60;
    const endHour = end.getHours() + end.getMinutes() / 60;
    
    const top = (startHour - HOURS[0]) * HOUR_HEIGHT;
    const height = (endHour - startHour) * HOUR_HEIGHT;
    
    return { top, height: Math.max(height, 20) };
  };

  const isToday = (day: Date) => isSameDay(day, new Date());

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Agenda
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
              Aujourd'hui
            </Button>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(subWeeks(currentDate, 1))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[200px] text-center">
              {format(weekStart, 'd MMM', { locale: fr })} - {format(weekEnd, 'd MMM yyyy', { locale: fr })}
            </span>
            <Button variant="outline" size="icon" onClick={() => setCurrentDate(addWeeks(currentDate, 1))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Header - Days */}
        <div className="grid grid-cols-[50px_repeat(7,1fr)] border-b border-border">
          <div className="p-2" />
          {days.map(day => (
            <div 
              key={day.toISOString()} 
              className={cn(
                "p-2 text-center border-l border-border",
                isToday(day) && "bg-primary/10"
              )}
            >
              <div className="text-xs text-muted-foreground capitalize">
                {format(day, 'EEE', { locale: fr })}
              </div>
              <div className={cn(
                "text-lg font-semibold",
                isToday(day) && "text-primary"
              )}>
                {format(day, 'd')}
              </div>
            </div>
          ))}
        </div>

        {/* Time Grid */}
        <div 
          ref={gridRef}
          className="relative select-none overflow-auto max-h-[600px]"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          <div className="grid grid-cols-[50px_repeat(7,1fr)]" style={{ height: HOURS.length * HOUR_HEIGHT }}>
            {/* Hour Labels */}
            <div className="relative">
              {HOURS.map((hour, idx) => (
                <div 
                  key={hour}
                  className="absolute w-full text-xs text-muted-foreground text-right pr-2 -translate-y-1/2"
                  style={{ top: idx * HOUR_HEIGHT }}
                >
                  {hour}h
                </div>
              ))}
            </div>

            {/* Day Columns */}
            {days.map((day, dayIdx) => {
              const dayEvents = getEventsForDay(day);
              
              return (
                <div 
                  key={day.toISOString()} 
                  className={cn(
                    "relative border-l border-border",
                    isToday(day) && "bg-primary/5"
                  )}
                >
                  {/* Hour lines */}
                  {HOURS.map((hour, idx) => (
                    <div
                      key={hour}
                      className="absolute w-full border-t border-border/50"
                      style={{ top: idx * HOUR_HEIGHT }}
                    />
                  ))}

                  {/* Selection overlay */}
                  {selection && isSameDay(selection.day, day) && (
                    <div
                      className="absolute left-1 right-1 bg-primary/30 border-2 border-primary border-dashed rounded-md z-10"
                      style={{
                        top: (selection.startHour - HOURS[0]) * HOUR_HEIGHT,
                        height: (selection.endHour - selection.startHour) * HOUR_HEIGHT
                      }}
                    />
                  )}

                  {/* Events */}
                  {dayEvents.map(event => {
                    const pos = getEventPosition(event);
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => handleEventClick(event, e)}
                        className="absolute left-1 right-1 rounded-md p-2 cursor-pointer overflow-hidden hover:opacity-90 transition-opacity z-20"
                        style={{
                          top: pos.top,
                          height: pos.height,
                          backgroundColor: event.color + '40',
                          borderLeft: `3px solid ${event.color}`,
                          backgroundImage: `repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 5px,
                            ${event.color}15 5px,
                            ${event.color}15 10px
                          )`
                        }}
                      >
                        <div className="text-xs font-medium truncate">{event.title}</div>
                        {pos.height > 40 && event.description && (
                          <div className="text-xs text-muted-foreground truncate mt-0.5">
                            {event.description}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) setSelection(null);
        }}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingEvent ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Titre</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Session mixage"
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description (optionnel)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notes sur le rendez-vous..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="start_time">Début</Label>
                  <Input
                    id="start_time"
                    type="datetime-local"
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_time">Fin</Label>
                  <Input
                    id="end_time"
                    type="datetime-local"
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Couleur</Label>
                <div className="flex gap-2 mt-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={cn(
                        "w-8 h-8 rounded-full border-2 transition-transform hover:scale-110",
                        formData.color === color ? "scale-110 border-foreground" : "border-transparent"
                      )}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                {editingEvent && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={() => { handleDelete(editingEvent.id); setIsDialogOpen(false); }}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                )}
                <div className="flex gap-2 ml-auto">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="studio-button">
                    {editingEvent ? 'Modifier' : 'Créer'}
                  </Button>
                </div>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default WeeklyAgenda;
