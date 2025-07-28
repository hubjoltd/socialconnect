import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  Plus, 
  Video, 
  Calendar, 
  FileText, 
  Presentation, 
  Users, 
  MessageSquare, 
  Share2, 
  LogOut 
} from "lucide-react";

interface SidebarItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  href: string;
  badge?: string;
}

export default function ModernSidebar() {
  const { user } = useAuth() as { user: any };
  const [location] = useLocation();

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
    <div className="w-20 bg-white shadow-xl flex flex-col h-screen border-r border-gray-200">
      {/* Header with User Avatar */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-center">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 space-y-4 overflow-y-auto">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          
          return (
            <Link key={item.id} href={item.href}>
              <div
                className={`group relative flex flex-col items-center px-2 py-3 mx-2 rounded-xl transition-all duration-200 cursor-pointer ${
                  active
                    ? 'bg-blue-50 border border-blue-200 shadow-sm'
                    : 'hover:bg-gray-50 hover:shadow-sm border border-transparent'
                }`}
                data-testid={`sidebar-${item.id}`}
              >
                <div className={`${active ? item.color : 'text-gray-600'} transition-colors mb-1`}>
                  <IconComponent className="h-6 w-6" />
                </div>
                
                <p className={`text-xs font-medium text-center leading-tight transition-colors ${
                  active ? 'text-blue-900' : 'text-gray-700 group-hover:text-gray-900'
                }`}>
                  {item.label}
                </p>
                
                {item.badge && (
                  <div className="absolute -top-1 -right-1">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-red-500 rounded-full">
                      {item.badge}
                    </span>
                  </div>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100">
        <Button 
          variant="ghost" 
          onClick={handleLogout}
          className="w-full flex flex-col items-center p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          data-testid="logout-button"
        >
          <LogOut className="h-5 w-5 mb-1" />
          <span className="text-xs">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}