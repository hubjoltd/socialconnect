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
    { id: "docs", label: "Documents", icon: FileText, color: "text-blue-500", href: "#", badge: "Coming Soon" },
    { id: "whiteboard", label: "Whiteboard", icon: Presentation, color: "text-pink-600", href: "#", badge: "Coming Soon" },
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
    <div className="w-72 bg-white shadow-xl flex flex-col h-screen border-r border-gray-200">
      {/* Header with User Avatar */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user?.profileImageUrl} />
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-semibold text-gray-900 truncate">
              {user?.firstName} {user?.lastName}
            </h2>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 space-y-2 overflow-y-auto px-4">
        {sidebarItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.href);
          const isComingSoon = item.badge === "Coming Soon";
          
          return (
            <div key={item.id} className="relative">
              {isComingSoon ? (
                <div className={`
                  w-full h-12 flex items-center px-4 rounded-lg text-sm transition-colors cursor-not-allowed
                  text-gray-400 bg-gray-50
                `}>
                  <IconComponent className="h-5 w-5 mr-3 text-gray-400" />
                  <span className="flex-1">{item.label}</span>
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                    Coming Soon
                  </span>
                </div>
              ) : (
                <Link href={item.href}>
                  <Button
                    variant="ghost"
                    className={`
                      w-full h-12 flex items-center justify-start px-4 text-sm transition-colors
                      ${active 
                        ? "bg-blue-600 text-white hover:bg-blue-700" 
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                      }
                    `}
                    data-testid={`nav-${item.id}`}
                  >
                    <IconComponent className={`h-5 w-5 mr-3 ${active ? "text-white" : item.color}`} />
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.badge && item.badge !== "Coming Soon" && (
                      <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Button>
                </Link>
              )}
            </div>
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