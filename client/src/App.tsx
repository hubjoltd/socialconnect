import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard-simple";
import CreateMeeting from "@/pages/create-meeting";
import Meetings from "@/pages/meetings";
import Contacts from "@/pages/contacts";
import Chat from "@/pages/chat";
import Calendar from "@/pages/calendar";
import SocialMedia from "@/pages/socialmedia";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/create-meeting" component={CreateMeeting} />
          <Route path="/meetings" component={Meetings} />
          <Route path="/contacts" component={Contacts} />
          <Route path="/chat" component={Chat} />
          <Route path="/calendar" component={Calendar} />
          <Route path="/socialmedia" component={SocialMedia} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
