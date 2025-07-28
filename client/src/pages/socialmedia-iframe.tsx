import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import ModernSidebar from "@/components/ModernSidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Share2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function SocialMediaIframe() {
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
  }, [isAuthenticated, isLoading, toast]);

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
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <Link href="/">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Social Media Platform</h1>
            <p className="text-gray-600">EssentiaTechs social media platform auto-loaded within your app</p>
          </div>

          {/* Auto-loaded Social Media Frame */}
          <Card className="h-[calc(100vh-200px)]">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-6 w-6 text-blue-600 mr-3" />
                EssentiaTechs Social Media Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[calc(100%-80px)] p-0">
              <iframe
                src="https://meeting.essentiatechs.com/socialmedia/"
                className="w-full h-full border-0 rounded-lg"
                title="EssentiaTechs Social Media Platform"
                allow="camera; microphone; fullscreen; autoplay; clipboard-read; clipboard-write"
                sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-top-navigation allow-downloads"
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}