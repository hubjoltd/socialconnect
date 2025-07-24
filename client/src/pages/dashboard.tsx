import { useEffect, useState } from "react";
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
  Menu
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
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    { id: "dashboard", label: "Dashboard", icon: Shield, color: "text-blue-600" },
    { id: "create-meeting", label: "Create a meeting", icon: Plus, color: "text-green-600" },
    { id: "meetings", label: "Meetings", icon: Video, color: "text-purple-600" },
    { id: "calendar", label: "Calendar", icon: Calendar, color: "text-orange-600" },
    { id: "docs", label: "Doc's", icon: FileText, color: "text-blue-500" },
    { id: "whiteboard", label: "Whiteboard", icon: Presentation, color: "text-pink-600" },
    { id: "contacts", label: "Contacts", icon: Users, color: "text-indigo-600" },
    { id: "team-chat", label: "Team chat", icon: MessageSquare, color: "text-cyan-600" }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Calendar</h1>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Calendar view coming soon...</p>
              </CardContent>
            </Card>
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
          <main className="p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-6">Contacts</h1>
            <Card>
              <CardContent className="p-6">
                <p className="text-gray-500">Contact management coming soon...</p>
              </CardContent>
            </Card>
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
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === item.id
                      ? 'bg-brand-blue text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`text-lg ${activeSection === item.id ? 'text-white' : item.color}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
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
          {renderSectionContent()}
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