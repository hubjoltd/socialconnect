import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Plus,
  Video,
  Calendar,
  FileText,
  Presentation,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  User,
  Share2,
  Menu,
  X
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: any;
  color: string;
  href: string;
  badge?: string;
}

export default function ModernSidebar() {
  const { user } = useAuth() as { user: any };
  const [location] = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Shield, color: "text-blue-600", href: "/" },
    { id: "create-meeting", label: "Create Meeting", icon: Plus, color: "text-green-600", href: "/create-meeting" },
    { id: "meetings", label: "Meetings", icon: Video, color: "text-purple-600", href: "/meetings" },
    { id: "calendar", label: "Calendar", icon: Calendar, color: "text-orange-600", href: "/calendar" },
    { id: "docs", label: "Documents", icon: FileText, color: "text-blue-500", href: "#" },
    { id: "whiteboard", label: "Whiteboard", icon: Presentation, color: "text-pink-600", href: "#" },
    { id: "contacts", label: "Contacts", icon: Users, color: "text-indigo-600", href: "/contacts" },
    { id: "team-chat", label: "Team Chat", icon: MessageSquare, color: "text-cyan-600", href: "/chat", badge: "3" },
    { id: "social-media", label: "Social Media", icon: Share2, color: "text-red-600", href: "/socialmedia" }
  ];

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const isActive = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  return (
    <div className={`${isCollapsed ? 'w-20' : 'w-72'} bg-white shadow-xl transition-all duration-300 flex flex-col h-screen border-r border-gray-200`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <div className="flex items-center space-x-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={user?.profileImageUrl} />
                <AvatarFallback className="bg-blue-100 text-blue-600">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="h-8 w-8 p-0"
            data-testid="sidebar-toggle"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`group relative flex items-center px-3 py-4 rounded-xl transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50 hover:shadow-sm'
                } ${isCollapsed ? 'justify-center' : ''}`}
                data-testid={`sidebar-${item.id}`}
              >
                <div className={`flex items-center ${isCollapsed ? 'flex-col space-y-1' : 'space-x-4'}`}>
                  <div className={`flex-shrink-0 p-2 rounded-lg ${
                    active 
                      ? 'bg-white shadow-sm border border-blue-100' 
                      : 'bg-gray-100 group-hover:bg-white group-hover:shadow-sm'
                  }`}>
                    <IconComponent className={`h-5 w-5 ${active ? item.color : 'text-gray-600'}`} />
                  </div>
                  
                  {!isCollapsed && (
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${
                          active ? 'text-gray-900' : 'text-gray-700'
                        }`}>
                          {item.label}
                        </p>
                        {item.badge && (
                          <Badge 
                            variant="secondary" 
                            className="ml-2 h-5 w-5 flex items-center justify-center p-0 text-xs bg-red-100 text-red-600 hover:bg-red-100"
                          >
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {isCollapsed && (
                    <p className="text-xs font-medium text-gray-600 text-center leading-none">
                      {item.label.split(' ')[0]}
                    </p>
                  )}
                </div>

                {/* Active indicator */}
                {active && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full" />
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <Separator className="mx-4" />

      {/* Footer */}
      <div className="p-4 space-y-2">
        <Link href="/profile">
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? 'p-2' : 'justify-start'}`}
            data-testid="sidebar-profile"
          >
            <User className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Profile</span>}
          </Button>
        </Link>
        
        <Link href="/settings">
          <Button
            variant="ghost"
            className={`w-full ${isCollapsed ? 'p-2' : 'justify-start'}`}
            data-testid="sidebar-settings"
          >
            <Settings className="h-4 w-4" />
            {!isCollapsed && <span className="ml-2">Settings</span>}
          </Button>
        </Link>
        
        <Button
          variant="ghost"
          onClick={handleLogout}
          className={`w-full text-red-600 hover:text-red-700 hover:bg-red-50 ${isCollapsed ? 'p-2' : 'justify-start'}`}
          data-testid="sidebar-logout"
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
}