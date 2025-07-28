import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Shield, 
  Bell, 
  ChevronDown, 
  LogIn, 
  TrendingUp, 
  Clock, 
  User, 
  Settings, 
  LogOut,
  Check,
  ArrowUp,
  Video,
  Calendar,
  FileText,
  Presentation,
  Users,
  MessageSquare,
  Plus,
  Menu,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  ExternalLink,
  RefreshCw
} from "lucide-react";

interface UserStats {
  sessions: number;
  securityScore: number;
  lastLogin: string;
  activities: Array<{
    id: number;
    type: string;
    description: string;
    timestamp: string;
    device: string | null;
    icon: string;
    iconColor: string;
  }>;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day">("month");
  const [connectedCalendars, setConnectedCalendars] = useState({
    google: false,
    microsoft: false
  });

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ["/api/user/stats"],
    enabled: isAuthenticated,
    retry: false,
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const sidebarItems = [
    { id: "dashboard", label: "Dashboard", icon: Shield, color: "text-blue-600", href: "/" },
    { id: "create-meeting", label: "Create a meeting", icon: Plus, color: "text-green-600", href: "/create-meeting" },
    { id: "meetings", label: "Meetings", icon: Video, color: "text-purple-600", href: "/meetings" },
    { id: "calendar", label: "Calendar", icon: Calendar, color: "text-orange-600", href: "/calendar" },
    { id: "docs", label: "Doc's", icon: FileText, color: "text-blue-500", href: "#" },
    { id: "whiteboard", label: "Whiteboard", icon: Presentation, color: "text-pink-600", href: "#" },
    { id: "contacts", label: "Contacts", icon: Users, color: "text-indigo-600", href: "/contacts" },
    { id: "team-chat", label: "Team chat", icon: MessageSquare, color: "text-cyan-600", href: "/chat" }
  ];

  const getIconComponent = (iconColor: string) => {
    switch (iconColor) {
      case "green":
        return <LogIn className="text-green-600 text-sm" />;
      case "blue":
        return <User className="text-blue-600 text-sm" />;
      case "purple":
        return <Shield className="text-purple-600 text-sm" />;
      default:
        return <LogIn className="text-green-600 text-sm" />;
    }
  };

  const getBackgroundColor = (iconColor: string) => {
    switch (iconColor) {
      case "green":
        return "bg-green-100";
      case "blue":
        return "bg-blue-100";
      case "purple":
        return "bg-purple-100";
      default:
        return "bg-green-100";
    }
  };

  const renderDashboardContent = () => (
    <main className="p-6">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {(user as any)?.firstName || "User"}!
        </h1>
        <p className="text-gray-600 mt-2">Here's what's happening with your account today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Login Sessions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.sessions || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <LogIn className="text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 flex items-center">
                <ArrowUp className="text-xs mr-1" />
                +12%
              </span>
              <span className="text-gray-500 ml-2">from last month</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Security Score</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : `${stats?.securityScore || 0}%`}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <Shield className="text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-blue-600 flex items-center">
                <Check className="text-xs mr-1" />
                Excellent
              </span>
              <span className="text-gray-500 ml-2">security level</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Last Login</p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? "..." : stats?.lastLogin || "Unknown"}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Clock className="text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500">San Francisco, CA</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Quick Actions */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Recent Activity</h3>
            <div className="space-y-4">
              {statsLoading ? (
                <div className="animate-pulse space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                stats?.activities?.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-10 h-10 ${getBackgroundColor(activity.iconColor)} rounded-full flex items-center justify-center`}>
                      {getIconComponent(activity.iconColor)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500">
                        {activity.timestamp}{activity.device && ` • ${activity.device}`}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="link" className="mt-6 text-brand-blue hover:text-brand-blue-dark text-sm font-medium p-0">
              View all activity →
            </Button>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h3>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" className="p-4 h-auto text-left flex flex-col items-start space-y-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <User className="text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Edit Profile</h4>
                  <p className="text-xs text-gray-500 mt-1">Update your information</p>
                </div>
              </Button>
              
              <Button variant="outline" className="p-4 h-auto text-left flex flex-col items-start space-y-3">
                <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                  <Shield className="text-green-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Security</h4>
                  <p className="text-xs text-gray-500 mt-1">Manage 2FA & passwords</p>
                </div>
              </Button>
              
              <Button variant="outline" className="p-4 h-auto text-left flex flex-col items-start space-y-3">
                <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Settings className="text-purple-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Settings</h4>
                  <p className="text-xs text-gray-500 mt-1">Preferences & privacy</p>
                </div>
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleLogout}
                className="p-4 h-auto text-left flex flex-col items-start space-y-3"
              >
                <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                  <LogOut className="text-red-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 text-sm">Sign Out</h4>
                  <p className="text-xs text-gray-500 mt-1">End your session</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Connected Accounts */}
      <Card className="mt-8">
        <CardContent className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Connected Accounts</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">Google</p>
                  <p className="text-sm text-gray-500">{(user as any)?.email || "Not connected"}</p>
                </div>
              </div>
              <Badge className="bg-green-100 text-green-800">Connected</Badge>
            </div>
            
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-900">GitHub</p>
                  <p className="text-sm text-gray-500">Not connected</p>
                </div>
              </div>
              <Button variant="outline" size="sm">Connect</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </main>
  );

  const renderCreateMeeting = () => (
    <main className="p-6">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Create a Meeting</h1>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meeting Title</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Enter meeting title"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Participants</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue"
                  placeholder="Enter email addresses separated by commas"
                />
              </div>
              <div className="flex gap-4">
                <Button className="bg-brand-blue text-white hover:bg-brand-blue-dark">
                  <Video className="mr-2 text-sm" />
                  Start Meeting Now
                </Button>
                <Button variant="outline">
                  Schedule Meeting
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );



  const renderMeetings = () => (
    <main className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Meetings</h1>
      <div className="space-y-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <Video className="text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Team Standup</h3>
                  <p className="text-sm text-gray-500">Today at 9:00 AM</p>
                </div>
              </div>
              <Button size="sm" className="bg-green-600 hover:bg-green-700">Join</Button>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Video className="text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Project Review</h3>
                  <p className="text-sm text-gray-500">Tomorrow at 2:00 PM</p>
                </div>
              </div>
              <Button variant="outline" size="sm">View Details</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );

  const renderSectionContent = () => {
    switch (activeSection) {
      case "create-meeting":
        return renderCreateMeeting();
      case "meetings":
        return renderMeetings();
      case "calendar":
        return (
          <main className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
              <Button
                onClick={() => setActiveSection('create-meeting')}
                className="bg-brand-blue text-white hover:bg-brand-blue-dark"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Meeting
              </Button>
            </div>

            <div className="grid lg:grid-cols-12 gap-6">
              {/* Left Sidebar - Compact Calendar */}
              <div className="lg:col-span-4 space-y-6">
                {/* Calendar Integration Panel */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Connect Calendars</h3>
                    <div className="space-y-3">
                      {/* Google Calendar */}
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-red-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">Google</p>
                            <p className="text-xs text-gray-500">
                              {connectedCalendars.google ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {connectedCalendars.google ? (
                            <>
                              <Button
                                onClick={() => {
                                  toast({
                                    title: "Calendar Synced",
                                    description: "Successfully synced with Google Calendar",
                                  });
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setConnectedCalendars(prev => ({ ...prev, google: false }));
                                  toast({
                                    title: "Calendar Disconnected",
                                    description: "Disconnected Google Calendar",
                                  });
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-xs px-2 h-8"
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => {
                                // Real Google Calendar OAuth would go here
                                window.open(
                                  `https://accounts.google.com/oauth/authorize?client_id=YOUR_CLIENT_ID&redirect_uri=${window.location.origin}/api/auth/google/callback&scope=https://www.googleapis.com/auth/calendar.readonly&response_type=code&access_type=offline`,
                                  '_blank',
                                  'width=500,height=600'
                                );
                                // For demo, auto-connect after a delay
                                setTimeout(() => {
                                  setConnectedCalendars(prev => ({ ...prev, google: true }));
                                  toast({
                                    title: "Google Calendar Connected",
                                    description: "Successfully connected to Google Calendar",
                                  });
                                }, 2000);
                              }}
                              className="bg-red-600 hover:bg-red-700 text-white text-xs px-3 h-8"
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Microsoft Calendar */}
                      <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M0 0v11.408h11.408V0H0zm12.594 0v11.408H24V0H12.594zM0 12.594V24h11.408V12.594H0zm12.594 0V24H24V12.594H12.594z"/>
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 text-sm">Outlook</p>
                            <p className="text-xs text-gray-500">
                              {connectedCalendars.microsoft ? "Connected" : "Not connected"}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {connectedCalendars.microsoft ? (
                            <>
                              <Button
                                onClick={() => {
                                  toast({
                                    title: "Calendar Synced",
                                    description: "Successfully synced with Microsoft Outlook",
                                  });
                                }}
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <RefreshCw className="w-3 h-3" />
                              </Button>
                              <Button
                                onClick={() => {
                                  setConnectedCalendars(prev => ({ ...prev, microsoft: false }));
                                  toast({
                                    title: "Calendar Disconnected",
                                    description: "Disconnected Microsoft Outlook",
                                  });
                                }}
                                variant="ghost"
                                size="sm"
                                className="text-xs px-2 h-8"
                              >
                                Disconnect
                              </Button>
                            </>
                          ) : (
                            <Button
                              onClick={() => {
                                // Real Microsoft Graph OAuth would go here
                                window.open(
                                  `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=YOUR_CLIENT_ID&response_type=code&redirect_uri=${window.location.origin}/api/auth/microsoft/callback&scope=https://graph.microsoft.com/calendars.read&response_mode=query`,
                                  '_blank',
                                  'width=500,height=600'
                                );
                                // For demo, auto-connect after a delay
                                setTimeout(() => {
                                  setConnectedCalendars(prev => ({ ...prev, microsoft: true }));
                                  toast({
                                    title: "Microsoft Outlook Connected",
                                    description: "Successfully connected to Microsoft Outlook",
                                  });
                                }, 2000);
                              }}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 h-8"
                            >
                              Connect
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Compact Calendar */}
                <Card>
                  <CardContent className="p-4">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {new Date(currentDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </h3>
                      <div className="flex items-center space-x-1">
                        <Button
                          onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(currentDate.getMonth() - 1);
                            setCurrentDate(newDate);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => {
                            const newDate = new Date(currentDate);
                            newDate.setMonth(currentDate.getMonth() + 1);
                            setCurrentDate(newDate);
                          }}
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Days of Week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {["S", "M", "T", "W", "T", "F", "S"].map((day) => (
                        <div key={day} className="text-center">
                          <span className="text-xs font-medium text-gray-500">{day}</span>
                        </div>
                      ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-1">
                      {Array.from({ length: 35 }, (_, i) => {
                        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), i - 6);
                        const day = date.getDate();
                        const isCurrentMonth = date.getMonth() === currentDate.getMonth();
                        const isToday = new Date().toDateString() === date.toDateString();
                        const isSelected = selectedDate.toDateString() === date.toDateString();
                        
                        // Check if this date has events
                        const dateString = date.toISOString().split('T')[0];
                        const mockEvents = [
                          { id: 1, title: "Team Standup", time: "9:00 AM - 9:30 AM", date: "2025-01-24", type: "meeting", attendees: ["John Doe", "Jane Smith"], source: "google" },
                          { id: 2, title: "Client Review", time: "2:00 PM - 3:00 PM", date: "2025-01-24", type: "meeting", attendees: ["Alice Johnson", "Bob Wilson"], source: "microsoft" },
                          { id: 3, title: "Project Planning", time: "10:30 AM - 11:30 AM", date: "2025-01-25", type: "meeting", attendees: ["Team Lead", "Product Manager"], source: "google" },
                          { id: 4, title: "Design Review", time: "3:00 PM - 4:00 PM", date: "2025-01-25", type: "meeting", attendees: ["UI Designer", "Developer"], source: "microsoft" },
                          { id: 5, title: "Weekly Sync", time: "11:00 AM - 12:00 PM", date: "2025-01-26", type: "meeting", attendees: ["Dev Team"], source: "google" },
                          { id: 6, title: "Product Demo", time: "2:30 PM - 3:30 PM", date: "2025-01-27", type: "meeting", attendees: ["Stakeholders"], source: "microsoft" },
                          { id: 7, title: "1:1 Meeting", time: "4:00 PM - 4:30 PM", date: "2025-01-28", type: "meeting", attendees: ["Manager"], source: "google" }
                        ];
                        const hasEvents = mockEvents.some(event => event.date === dateString);
                        
                        return (
                          <div
                            key={i}
                            onClick={() => {
                              if (isCurrentMonth) {
                                setSelectedDate(date);
                              }
                            }}
                            className={`aspect-square flex items-center justify-center text-sm cursor-pointer rounded relative ${
                              isCurrentMonth
                                ? isSelected
                                  ? 'bg-brand-blue text-white font-medium'
                                  : isToday
                                  ? 'bg-blue-100 text-brand-blue font-medium'
                                  : 'text-gray-700 hover:bg-gray-100'
                                : 'text-gray-300'
                            }`}
                          >
                            {day}
                            {hasEvents && isCurrentMonth && !isSelected && (
                              <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-brand-blue rounded-full"></div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Side - Events List */}
              <div className="lg:col-span-8 space-y-6">
                {(() => {
                  // Define all events
                  const allEvents = [
                    { id: 1, title: "Team Standup", time: "9:00 AM - 9:30 AM", date: "2025-01-24", type: "meeting", attendees: ["John Doe", "Jane Smith"], source: "google" },
                    { id: 2, title: "Client Review", time: "2:00 PM - 3:00 PM", date: "2025-01-24", type: "meeting", attendees: ["Alice Johnson", "Bob Wilson"], source: "microsoft" },
                    { id: 3, title: "Project Planning", time: "10:30 AM - 11:30 AM", date: "2025-01-25", type: "meeting", attendees: ["Team Lead", "Product Manager"], source: "google" },
                    { id: 4, title: "Design Review", time: "3:00 PM - 4:00 PM", date: "2025-01-25", type: "meeting", attendees: ["UI Designer", "Developer"], source: "microsoft" },
                    { id: 5, title: "Weekly Sync", time: "11:00 AM - 12:00 PM", date: "2025-01-26", type: "meeting", attendees: ["Dev Team"], source: "google" },
                    { id: 6, title: "Product Demo", time: "2:30 PM - 3:30 PM", date: "2025-01-27", type: "meeting", attendees: ["Stakeholders"], source: "microsoft" },
                    { id: 7, title: "1:1 Meeting", time: "4:00 PM - 4:30 PM", date: "2025-01-28", type: "meeting", attendees: ["Manager"], source: "google" },
                    { id: 8, title: "Code Review", time: "1:00 PM - 2:00 PM", date: "2025-01-29", type: "meeting", attendees: ["Senior Dev", "Junior Dev"], source: "microsoft" },
                    { id: 9, title: "Sprint Planning", time: "9:30 AM - 11:00 AM", date: "2025-01-30", type: "meeting", attendees: ["Scrum Team"], source: "google" }
                  ];

                  // Get events for selected date
                  const selectedDateString = selectedDate.toISOString().split('T')[0];
                  const selectedDateEvents = allEvents.filter(event => event.date === selectedDateString);
                  
                  // Get upcoming events (future dates from selected date)
                  const upcomingEvents = allEvents.filter(event => event.date > selectedDateString).slice(0, 5);
                  
                  const isToday = selectedDate.toDateString() === new Date().toDateString();
                  
                  return (
                    <>
                      {/* Selected Date Events */}
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {isToday ? "Today's Events" : "Events"}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {selectedDate.toLocaleDateString('en-US', { 
                                weekday: 'long', 
                                year: 'numeric', 
                                month: 'long', 
                                day: 'numeric' 
                              })}
                            </span>
                          </div>
                          
                          <div className="space-y-3">
                            {selectedDateEvents.length === 0 ? (
                              <div className="text-center py-8 text-gray-500">
                                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                                <p>No events scheduled for this date</p>
                                <Button
                                  onClick={() => setActiveSection('create-meeting')}
                                  variant="outline"
                                  size="sm"
                                  className="mt-3"
                                >
                                  <Plus className="w-4 h-4 mr-2" />
                                  Schedule Meeting
                                </Button>
                              </div>
                            ) : (
                              selectedDateEvents.map((event) => (
                                <div key={event.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                  <div className={`w-3 h-12 rounded-full ${event.source === 'google' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                          {event.source === 'google' ? 'Google' : 'Outlook'}
                                        </Badge>
                                        {isToday && (
                                          <Button variant="ghost" size="sm" className="h-8">
                                            <Video className="w-4 h-4 mr-1" />
                                            Join
                                          </Button>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{event.time}</p>
                                    <div className="flex items-center mt-2">
                                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                                      <span className="text-xs text-gray-500">
                                        {event.attendees.join(', ')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Upcoming Events */}
                      {!isToday && upcomingEvents.length > 0 && (
                        <Card>
                          <CardContent className="p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
                            
                            <div className="space-y-3">
                              {upcomingEvents.map((event) => (
                                <div key={event.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                                  <div className={`w-3 h-12 rounded-full ${event.source === 'google' ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <h4 className="font-medium text-gray-900">{event.title}</h4>
                                      <div className="flex items-center space-x-2">
                                        <Badge variant="outline" className="text-xs">
                                          {event.source === 'google' ? 'Google' : 'Outlook'}
                                        </Badge>
                                        <span className="text-xs text-gray-500">
                                          {new Date(event.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </span>
                                      </div>
                                    </div>
                                    <p className="text-sm text-gray-600 mt-1">{event.time}</p>
                                    <div className="flex items-center mt-2">
                                      <Users className="w-4 h-4 text-gray-400 mr-1" />
                                      <span className="text-xs text-gray-500">
                                        {event.attendees.join(', ')}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </main>
        );
      case "docs":
        return (
          <main className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Documents</h1>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Document management coming soon...</p>
              </CardContent>
            </Card>
          </main>
        );
      case "whiteboard":
        return (
          <main className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Whiteboard</h1>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Whiteboard feature coming soon...</p>
              </CardContent>
            </Card>
          </main>
        );
      case "contacts":
        return (
          <main className="h-full bg-white">
            <div className="flex h-full">
              {/* Left Sidebar - Contact Categories */}
              <div className="w-80 border-r border-gray-200 flex flex-col">
                {/* Contacts Header with Tabs */}
                <div className="p-4 border-b border-gray-200">
                  <div className="flex space-x-4">
                    <button className="text-blue-600 font-medium border-b-2 border-blue-600 pb-2">
                      Contacts
                    </button>
                    <button className="text-gray-500 font-medium pb-2">
                      Channels
                    </button>
                    <Button variant="ghost" size="sm" className="ml-auto p-1">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Contact Categories */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-2">
                    <h3 className="text-sm font-medium text-gray-900 px-3 py-2">My Contacts</h3>
                    
                    {/* Contact Category List */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
                          </svg>
                          <span>Starred</span>
                        </div>
                        <span className="text-xs text-gray-500">1</span>
                      </div>

                      <div className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM4.332 8.027a6.012 6.012 0 011.912-2.706C6.512 5.73 6.974 6 7.5 6A1.5 1.5 0 019 7.5V8a2 2 0 004 0 2 2 0 011.523-1.943A5.977 5.977 0 0116 10c0 .34-.028.675-.083 1H15a2 2 0 00-2 2v2.197A5.973 5.973 0 0110 16v-2a2 2 0 00-2-2 2 2 0 01-2-2 2 2 0 00-1.668-1.973z" clipRule="evenodd"/>
                          </svg>
                          <span>External</span>
                        </div>
                        <span className="text-xs text-gray-500">2</span>
                      </div>

                      <div className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z"/>
                          </svg>
                          <span>Apps</span>
                        </div>
                        <span className="text-xs text-gray-500">0</span>
                      </div>

                      {/* Cloud Contacts - Expandable */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                          <div className="flex items-center space-x-2">
                            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                            </svg>
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z"/>
                            </svg>
                            <span>Cloud Contacts</span>
                          </div>
                          <span className="text-xs text-gray-500">308</span>
                        </div>

                        {/* Expanded Contacts List */}
                        <div className="ml-6 space-y-1">
                          <div className="flex items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                            <div className="flex items-center space-x-2">
                              <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
                              </svg>
                              <span>Contacts</span>
                            </div>
                            <span className="text-xs text-gray-500">308</span>
                          </div>

                          {/* Individual Contacts */}
                          <div className="ml-4 space-y-1">
                            <div className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                A
                              </div>
                              <span className="text-gray-700">Aaron Smith</span>
                            </div>

                            <div className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                A
                              </div>
                              <span className="text-gray-700">Anna Williams</span>
                            </div>

                            <div className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                              <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                AB
                              </div>
                              <span className="text-gray-700">Aaron</span>
                            </div>

                            <div className="flex items-center space-x-3 px-3 py-2 text-sm hover:bg-gray-100 rounded cursor-pointer">
                              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                AR
                              </div>
                              <span className="text-gray-700">Adrien</span>
                            </div>

                            {/* Alan - Selected Contact */}
                            <div className="flex items-center space-x-3 px-3 py-2 text-sm bg-blue-600 rounded cursor-pointer">
                              <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-medium">
                                AW
                              </div>
                              <span className="text-white font-medium">Alan</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Contact Details Area */}
              <div className="flex-1 flex flex-col">
                {/* Contact Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center text-white text-xl font-bold">
                      AW
                    </div>
                    <div>
                      <h1 className="text-2xl font-semibold text-gray-900">Alan</h1>
                      <p className="text-sm text-gray-500">Added from Google Contacts</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="flex-1 p-6">
                  <div className="max-w-2xl">
                    <div className="space-y-6">
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Home
                          </label>
                          <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                            ***-***-1234
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mobile
                          </label>
                          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded border">
                            Not provided
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                          alan.wilson@company.com
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Department
                        </label>
                        <div className="text-sm text-gray-900 bg-gray-50 p-3 rounded border">
                          Engineering
                        </div>
                      </div>

                      <div className="pt-4 border-t border-gray-200">
                        <div className="flex space-x-3">
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                            <Video className="w-4 h-4 mr-2" />
                            Start Meeting
                          </Button>
                          <Button variant="outline">
                            <MessageSquare className="w-4 h-4 mr-2" />
                            Send Message
                          </Button>
                          <Button variant="outline">
                            <Button className="w-4 h-4 mr-2" />
                            Call
                          </Button>
                          <Button variant="outline">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                              <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                            </svg>
                            Email
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        );
      case "team-chat":
        return (
          <main className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Team Chat</h1>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Team chat feature coming soon...</p>
              </CardContent>
            </Card>
          </main>
        );
      default:
        return renderDashboardContent();
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="text-brand-blue text-xl" />
              <span className="text-xl font-bold text-gray-900">SecureAuth</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              ×
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;
              
              if (item.href === "#") {
                return (
                  <button
                    key={item.id}
                    disabled
                    className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-gray-400 cursor-not-allowed"
                  >
                    <Icon className="text-lg text-gray-400" />
                    <span className="font-medium">{item.label}</span>
                    <Badge variant="outline" className="ml-auto text-xs">Soon</Badge>
                  </button>
                );
              }
              
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    isActive
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`text-lg ${isActive ? 'text-white' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center space-x-3 mb-4">
              <Avatar className="w-10 h-10">
                <AvatarImage 
                  src={(user as any)?.profileImageUrl || undefined} 
                  alt="Profile" 
                  className="object-cover"
                />
                <AvatarFallback>
                  {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {(user as any)?.firstName} {(user as any)?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {(user as any)?.email}
                </p>
              </div>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="w-full flex items-center space-x-2"
            >
              <LogOut className="text-sm" />
              <span>Sign Out</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Mobile Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 lg:hidden">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden"
              >
                <Menu className="text-lg" />
              </Button>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <Bell className="text-lg" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1">
          {renderDashboardContent()}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}