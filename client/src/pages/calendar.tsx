import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths } from "date-fns";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { notifications } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Users,
  ExternalLink,
  ArrowLeft,
  Video,
  Phone,
  MessageSquare
} from "lucide-react";

interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  location?: string;
  eventType: "meeting" | "reminder" | "task";
  googleEventId?: string;
  outlookEventId?: string;
  attendees?: string[];
  createdAt: string;
  updatedAt: string;
}

export default function Calendar() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");

  // Get date range for current view
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Fetch calendar events
  const { data: events = [], isLoading } = useQuery<CalendarEvent[]>({
    queryKey: ["/api/calendar/events", format(monthStart, 'yyyy-MM-dd'), format(monthEnd, 'yyyy-MM-dd')],
    queryFn: () => apiRequest(`/api/calendar/events?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`),
  });

  // Group events by date
  const eventsByDate = events.reduce((acc, event) => {
    const date = format(new Date(event.startTime), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(event);
    return acc;
  }, {} as Record<string, CalendarEvent[]>);

  const selectedDateEvents = selectedDate ? 
    eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || [] : [];

  const createEventMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest(`/api/calendar/events`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Event created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
      setIsCreateDialogOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create event. Please try again.",
        variant: "destructive",
      });
    },
  });

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' ? subMonths(currentDate, 1) : addMonths(currentDate, 1));
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-500 text-white";
      case "reminder":
        return "bg-yellow-500 text-white";
      case "task":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const formatTime = (dateString: string) => {
    return format(new Date(dateString), 'h:mm a');
  };



  // Check for upcoming events and send notifications
  useEffect(() => {
    const checkUpcomingEvents = () => {
      const now = new Date();
      const in15Minutes = new Date(now.getTime() + 15 * 60 * 1000);
      
      events.forEach(event => {
        const eventStart = new Date(event.startTime);
        if (eventStart > now && eventStart <= in15Minutes) {
          notifications.notify('event', 'Upcoming Event', `${event.title} starts in 15 minutes`);
          toast({
            title: "Upcoming Event", 
            description: `${event.title} starts in 15 minutes`,
          });
        }
      });
    };

    const interval = setInterval(checkUpcomingEvents, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [events, toast]);

  // Real-time calendar integration
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isConnectingOutlook, setIsConnectingOutlook] = useState(false);

  const connectGoogleCalendar = async () => {
    setIsConnectingGoogle(true);
    try {
      // Request notification permission
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      // Simulate OAuth flow - in real app this would redirect to Google OAuth
      window.open('https://accounts.google.com/oauth/authorize?client_id=your-client&redirect_uri=your-redirect&scope=https://www.googleapis.com/auth/calendar', '_blank');
      
      toast({
        title: "Google Calendar",
        description: "Connecting to Google Calendar... Please complete authorization in the new window.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect to Google Calendar",
        variant: "destructive",
      });
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const connectOutlookCalendar = async () => {
    setIsConnectingOutlook(true);
    try {
      // Request notification permission
      if (Notification.permission === 'default') {
        await Notification.requestPermission();
      }
      
      // Simulate OAuth flow - in real app this would redirect to Microsoft OAuth
      window.open('https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=your-client&redirect_uri=your-redirect&scope=https://graph.microsoft.com/calendars.readwrite', '_blank');
      
      toast({
        title: "Outlook Calendar",
        description: "Connecting to Outlook Calendar... Please complete authorization in the new window.",
      });
    } catch (error) {
      toast({
        title: "Error", 
        description: "Failed to connect to Outlook Calendar",
        variant: "destructive",
      });
    } finally {
      setIsConnectingOutlook(false);
    }
  };

  const syncCalendars = async () => {
    try {
      const response = await apiRequest('/api/calendar/sync', {
        method: 'POST'
      });
      
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ["/api/calendar/events"] });
        notifications.playSuccessNotification();
        toast({
          title: "Success",
          description: "Calendar sync completed successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync calendars",
        variant: "destructive",
      });
    }
  };



  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-7 gap-4 mb-4">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-6 bg-gray-200 rounded"></div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-4">
              {Array.from({ length: 35 }).map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Left Sidebar - Mini Calendar & Events */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-lg font-semibold">Calendar</h1>
          </div>

          {/* Integration Buttons */}
          <div className="p-4 border-b border-gray-200">
            <div className="space-y-2">
              <Button 
                onClick={connectGoogleCalendar}
                disabled={isConnectingGoogle}
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-blue-50 border-blue-200 hover:bg-blue-100"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {isConnectingGoogle ? "Connecting..." : "Connect Google Calendar"}
              </Button>
              <Button 
                onClick={connectOutlookCalendar}
                disabled={isConnectingOutlook}
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-orange-50 border-orange-200 hover:bg-orange-100"
              >
                <CalendarIcon className="w-4 h-4 mr-2" />
                {isConnectingOutlook ? "Connecting..." : "Connect Outlook"}
              </Button>
              <Button 
                onClick={syncCalendars}
                variant="outline" 
                size="sm" 
                className="w-full justify-start bg-green-50 border-green-200 hover:bg-green-100"
              >
                <div className="w-4 h-4 mr-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </div>
                Sync All Calendars
              </Button>
            </div>
          </div>

          {/* Mini Calendar */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">{format(currentDate, 'MMMM yyyy')}</h3>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-7 gap-1 text-xs">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                <div key={day} className="text-center p-2 font-medium text-gray-500">
                  {day}
                </div>
              ))}
              
              {calendarDays.map((day) => {
                const dayEvents = eventsByDate[format(day, 'yyyy-MM-dd')] || [];
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const isToday = isSameDay(day, new Date());
                
                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    className={`
                      p-2 text-center rounded hover:bg-gray-100 transition-colors relative
                      ${!isSameMonth(day, currentDate) ? 'text-gray-300' : 'text-gray-900'}
                      ${isSelected ? 'bg-blue-100 text-blue-700' : ''}
                      ${isToday ? 'bg-blue-500 text-white' : ''}
                    `}
                  >
                    {format(day, 'd')}
                    {dayEvents.length > 0 && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Selected Date Events */}
          <div className="flex-1 overflow-hidden">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">
                  {selectedDate ? format(selectedDate, 'MMM d, yyyy') : 'Select a date'}
                </h3>
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create Event</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      createEventMutation.mutate({
                        title: formData.get('title'),
                        description: formData.get('description'),
                        startTime: formData.get('startTime'),
                        endTime: formData.get('endTime'),
                        eventType: formData.get('eventType'),
                        location: formData.get('location'),
                      });
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" name="title" required />
                      </div>
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input id="startTime" name="startTime" type="datetime-local" required />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input id="endTime" name="endTime" type="datetime-local" required />
                      </div>
                      <div>
                        <Label htmlFor="eventType">Type</Label>
                        <Select name="eventType" defaultValue="meeting">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="meeting">Meeting</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="task">Task</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input id="location" name="location" />
                      </div>
                      <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createEventMutation.isPending}>
                          Create
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {selectedDateEvents.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-8">
                    No events scheduled
                  </p>
                ) : (
                  selectedDateEvents.map((event) => (
                    <Card key={event.id} className="p-3">
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <h4 className="font-medium text-sm">{event.title}</h4>
                          <Badge variant="outline" className={getEventTypeColor(event.eventType)}>
                            {event.eventType}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center text-xs text-gray-600">
                          <Clock className="w-3 h-3 mr-1" />
                          {formatTime(event.startTime)} - {formatTime(event.endTime)}
                        </div>
                        
                        {event.location && (
                          <div className="flex items-center text-xs text-gray-600">
                            <MapPin className="w-3 h-3 mr-1" />
                            {event.location}
                          </div>
                        )}
                        
                        {event.description && (
                          <p className="text-xs text-gray-600 line-clamp-2">
                            {event.description}
                          </p>
                        )}
                        
                        {event.eventType === 'meeting' && (
                          <div className="flex gap-1 pt-2">
                            <Button size="sm" variant="outline" className="h-6 px-2">
                              <Video className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2">
                              <Phone className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-6 px-2">
                              <MessageSquare className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Calendar View */}
        <div className="flex-1 p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold">{format(currentDate, 'MMMM yyyy')}</h2>
              <div className="flex gap-1">
                <Button variant="outline" size="sm" onClick={() => navigateMonth('prev')}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={() => setCurrentDate(new Date())}>
                  Today
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigateMonth('next')}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex bg-gray-100 rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'month' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('month')}
                >
                  Month
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'week' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('week')}
                >
                  Week
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'day' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('day')}
                >
                  Day
                </Button>
              </div>

              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                New Event
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Week Days Header */}
            <div className="grid grid-cols-7 border-b border-gray-200">
              {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <div key={day} className="p-4 text-center font-medium text-gray-700 border-r border-gray-200 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 min-h-[600px]">
              {calendarDays.map((day) => {
                const dayEvents = eventsByDate[format(day, 'yyyy-MM-dd')] || [];
                const isToday = isSameDay(day, new Date());
                const isCurrentMonth = isSameMonth(day, currentDate);
                
                return (
                  <div
                    key={day.toISOString()}
                    className={`
                      border-r border-b border-gray-200 last:border-r-0 p-2 min-h-[120px]
                      ${!isCurrentMonth ? 'bg-gray-50' : 'bg-white'}
                      hover:bg-gray-50 transition-colors cursor-pointer
                    `}
                    onClick={() => setSelectedDate(day)}
                  >
                    <div className={`
                      text-sm font-medium mb-2
                      ${!isCurrentMonth ? 'text-gray-400' : isToday ? 'text-blue-600' : 'text-gray-900'}
                    `}>
                      {format(day, 'd')}
                      {isToday && (
                        <div className="w-2 h-2 bg-blue-600 rounded-full ml-1 inline-block"></div>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div
                          key={event.id}
                          className={`
                            text-xs p-1 rounded truncate cursor-pointer
                            ${getEventTypeColor(event.eventType)}
                          `}
                          title={`${event.title} (${formatTime(event.startTime)} - ${formatTime(event.endTime)})`}
                        >
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{dayEvents.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}