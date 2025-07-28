import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ModernSidebar from "@/components/ModernSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ExternalLink,
  Share2,
  Globe,
  CheckCircle,
  AlertCircle,
  ArrowLeft
} from "lucide-react";
import { Link } from "wouter";

export default function SocialMedia() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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
    
    // Auto-redirect to external social media platform when authenticated
    if (isAuthenticated && user) {
      toast({
        title: "Redirecting",
        description: "Auto-logging into social media platform...",
      });
      
      // Auto-login to external site with user credentials
      setTimeout(() => {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://meeting.essentiatechs.com/socialmedia/';
        form.target = '_self'; // Replace current page
        
        const userDataInput = document.createElement('input');
        userDataInput.type = 'hidden';
        userDataInput.name = 'autoLogin';
        userDataInput.value = 'true';
        
        const userIdInput = document.createElement('input');
        userIdInput.type = 'hidden';
        userIdInput.name = 'userId';
        userIdInput.value = (user as any)?.id || '';
        
        const emailInput = document.createElement('input');
        emailInput.type = 'hidden';
        emailInput.name = 'email';
        emailInput.value = (user as any)?.email || '';
        
        const nameInput = document.createElement('input');
        nameInput.type = 'hidden';
        nameInput.name = 'name';
        nameInput.value = `${(user as any)?.firstName || ''} ${(user as any)?.lastName || ''}`.trim();
        
        form.appendChild(userDataInput);
        form.appendChild(userIdInput);
        form.appendChild(emailInput);
        form.appendChild(nameInput);
        
        document.body.appendChild(form);
        form.submit();
      }, 1000);
    }
  }, [isAuthenticated, isLoading, toast, user]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ModernSidebar />
      
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Connecting to Social Media Platform</h2>
          <p className="text-gray-600 mb-4">Auto-logging you into EssentiaTechs social media portal...</p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span>Credentials verified</span>
          </div>
          <div className="mt-6">
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Cancel and go back
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}