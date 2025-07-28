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
  AlertCircle
} from "lucide-react";

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
  }, [isAuthenticated, isLoading, toast]);

  const handleSocialConnect = () => {
    // Auto-login to the external site with current user credentials
    const externalUrl = "https://meeting.essentiatechs.com/socialmedia/";
    
    // Create a form to post user data for auto-login
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = externalUrl;
    form.target = '_blank';
    
    // Add user data as hidden inputs
    const userDataInput = document.createElement('input');
    userDataInput.type = 'hidden';
    userDataInput.name = 'userData';
    userDataInput.value = JSON.stringify({
      id: (user as any)?.id,
      email: (user as any)?.email,
      firstName: (user as any)?.firstName,
      lastName: (user as any)?.lastName,
      profileImageUrl: (user as any)?.profileImageUrl
    });
    
    form.appendChild(userDataInput);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
    
    toast({
      title: "Redirecting",
      description: "Opening social media portal with your credentials...",
    });
  };

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
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="social-media-title">
              Social Media Connections
            </h1>
            <p className="text-gray-600">Connect and manage your social media accounts for seamless integration.</p>
          </div>

          {/* Main Social Media Portal Card */}
          <Card className="mb-8" data-testid="social-portal-card">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Share2 className="h-6 w-6 text-blue-600 mr-3" />
                Social Media Portal
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white rounded-full shadow-sm">
                    <Globe className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Essentia Technologies Social Portal</h3>
                    <p className="text-sm text-gray-600 mt-1">Access your social media management dashboard</p>
                    <div className="flex items-center mt-2">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                      <span className="text-sm text-green-600 font-medium">Auto-login enabled</span>
                    </div>
                  </div>
                </div>
                <Button 
                  onClick={handleSocialConnect}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="connect-social-portal"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Connect Now
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Connection Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card data-testid="connection-status">
              <CardHeader>
                <CardTitle className="text-lg">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Portal Access</span>
                    </div>
                    <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <span className="text-sm font-medium">Auto-Login</span>
                    </div>
                    <Badge variant="default" className="bg-blue-100 text-blue-800">Enabled</Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm font-medium">Session Sync</span>
                    </div>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card data-testid="user-info">
              <CardHeader>
                <CardTitle className="text-lg">Connected Account</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-lg font-semibold text-blue-600">
                      {(user as any)?.firstName?.[0]}{(user as any)?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      {(user as any)?.firstName} {(user as any)?.lastName}
                    </p>
                    <p className="text-sm text-gray-600">{(user as any)?.email}</p>
                  </div>
                </div>
                
                <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                    <p className="text-sm text-green-800">Your account is ready for social media portal access</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Instructions */}
          <Card data-testid="instructions">
            <CardHeader>
              <CardTitle className="text-lg">How to Use</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">1</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Click "Connect Now"</p>
                    <p className="text-sm text-gray-600">This will open the social media portal in a new tab</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">2</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Auto-login Process</p>
                    <p className="text-sm text-gray-600">Your current session credentials will be automatically passed for seamless login</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium text-blue-600">3</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Manage Social Accounts</p>
                    <p className="text-sm text-gray-600">Use the portal to connect and manage all your social media accounts</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}