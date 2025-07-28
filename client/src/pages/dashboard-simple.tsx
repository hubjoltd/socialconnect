import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Bell, 
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
  const [location] = useLocation();

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
        return <Check className="text-green-600 text-sm" />;
      case "blue":
        return <User className="text-blue-600 text-sm" />;
      case "purple":
        return <Shield className="text-purple-600 text-sm" />;
      default:
        return <Check className="text-green-600 text-sm" />;
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white shadow-lg">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-2">
              <Shield className="text-blue-600 text-xl" />
              <span className="text-xl font-bold text-gray-900">SecureAuth</span>
            </div>
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
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
              <div className="flex items-center space-x-4">
                <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-gray-600 relative">
                  <Bell className="text-lg" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
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
                    <p className="text-sm font-medium text-gray-600">Active Sessions</p>
                    <p className="text-2xl font-bold text-gray-900">{stats?.sessions || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Shield className="text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Security Score</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-2xl font-bold text-gray-900">{stats?.securityScore || 0}%</p>
                      <ArrowUp className="text-green-500 text-sm" />
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Check className="text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Last Login</p>
                    <p className="text-sm font-medium text-gray-900">
                      {stats?.lastLogin ? new Date(stats.lastLogin).toLocaleDateString() : "Today"}
                    </p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <User className="text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
              <div className="space-y-4">
                {stats?.activities && stats.activities.length > 0 ? (
                  stats.activities.map((activity) => (
                    <div key={activity.id} className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getBackgroundColor(activity.iconColor)}`}>
                        {getIconComponent(activity.iconColor)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(activity.timestamp).toLocaleDateString()} • {activity.device || "Unknown device"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No recent activities</p>
                )}
              </div>
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
        </main>
      </div>
    </div>
  );
}