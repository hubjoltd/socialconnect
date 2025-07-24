import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Lock, Smartphone } from "lucide-react";

export default function Landing() {
  const { isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-brand-blue"></div>
      </div>
    );
  }

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleGetStarted = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="w-full px-4 py-6">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Shield className="text-brand-blue text-2xl" />
            <span className="text-xl font-bold text-gray-900">SecureAuth</span>
          </div>
          <div className="hidden md:flex space-x-6">
            <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Features</a>
            <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Security</a>
            <a href="#" className="text-gray-600 hover:text-brand-blue transition-colors">Support</a>
          </div>
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={handleLogin}
              className="border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white"
            >
              Sign In
            </Button>
            <Button
              onClick={handleGetStarted}
              className="bg-brand-blue text-white hover:bg-brand-blue-dark"
            >
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Secure Authentication
            <span className="text-brand-blue block">Made Simple</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Professional-grade authentication platform with social login, multi-factor authentication, and enterprise security features.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={handleGetStarted}
              size="lg"
              className="px-8 py-4 bg-brand-blue text-white text-lg font-semibold hover:bg-brand-blue-dark shadow-lg"
            >
              Start Free Trial
            </Button>
            <Button
              onClick={handleLogin}
              variant="outline"
              size="lg"
              className="px-8 py-4 border-2 border-brand-blue text-brand-blue text-lg font-semibold hover:bg-brand-blue hover:text-white"
            >
              Sign In
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-brand-blue bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <Users className="text-brand-blue text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Social Login</h3>
              <p className="text-gray-600">Seamless authentication with Google, GitHub, and other popular platforms.</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-brand-blue bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <Lock className="text-brand-blue text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise Security</h3>
              <p className="text-gray-600">Bank-level security with encryption, MFA, and compliance standards.</p>
            </CardContent>
          </Card>
          
          <Card className="hover:shadow-xl transition-shadow">
            <CardContent className="p-8">
              <div className="w-12 h-12 bg-brand-blue bg-opacity-10 rounded-xl flex items-center justify-center mb-6">
                <Smartphone className="text-brand-blue text-xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Mobile Optimized</h3>
              <p className="text-gray-600">Perfect experience across all devices with responsive design.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
