import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { format } from "date-fns";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ModernSidebar from "@/components/ModernSidebar";
import { 
  Video,
  Calendar,
  Users,
  Search,
  Copy,
  ExternalLink,
  Plus,
  Clock,
  Shield,
  Mic,
  Play,
  History,
  Eye,
  Edit3,
  Trash2
} from "lucide-react";

interface Meeting {
  id: string;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  timezone: string;
  joinLink: string;
  maxParticipants: number;
  waitingRoom: boolean;
  recordMeeting: boolean;
  muteOnEntry: boolean;
  hostVideo: boolean;
  participantVideo: boolean;
  createdAt: string;
}

export default function Meetings() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("upcoming");

  const { data: meetings = [], isLoading } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
    enabled: isAuthenticated,
  });

  const now = new Date();
  const upcomingMeetings = meetings.filter(meeting => new Date(meeting.startTime) > now);
  const pastMeetings = meetings.filter(meeting => new Date(meeting.startTime) <= now);

  const filteredMeetings = (meetingList: Meeting[]) => {
    return meetingList.filter(meeting =>
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Meeting link copied to clipboard",
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const MeetingCard = ({ meeting, isUpcoming }: { meeting: Meeting; isUpcoming: boolean }) => (
    <Card key={meeting.id} className="hover:shadow-md transition-shadow" data-testid={`meeting-${meeting.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{meeting.title}</CardTitle>
            {meeting.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{meeting.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {isUpcoming && (
              <Badge variant="default" className="bg-blue-100 text-blue-800">
                Upcoming
              </Badge>
            )}
            {!isUpcoming && (
              <Badge variant="secondary">
                Completed
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Meeting Time */}
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>
            {format(new Date(meeting.startTime), "PPP 'at' p")} - 
            {format(new Date(meeting.endTime), "p")}
          </span>
          <Badge variant="outline" className="ml-2">
            {meeting.timezone}
          </Badge>
        </div>

        {/* Meeting Features */}
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-1" />
            <span>Max {meeting.maxParticipants}</span>
          </div>
          
          {meeting.waitingRoom && (
            <div className="flex items-center">
              <Shield className="w-4 h-4 mr-1" />
              <span>Waiting Room</span>
            </div>
          )}
          
          {meeting.recordMeeting && (
            <div className="flex items-center">
              <Video className="w-4 h-4 mr-1" />
              <span>Recording</span>
            </div>
          )}
          
          {meeting.muteOnEntry && (
            <div className="flex items-center">
              <Mic className="w-4 h-4 mr-1" />
              <span>Auto Mute</span>
            </div>
          )}
        </div>

        {/* Meeting Link */}
        <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
          <div className="flex-1 text-sm font-mono text-gray-700 truncate">
            {meeting.joinLink}
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => copyToClipboard(meeting.joinLink)}
          >
            <Copy className="w-4 h-4" />
          </Button>
          {isUpcoming && (
            <Button size="sm" asChild>
              <a href={meeting.joinLink} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-1" />
                Join
              </a>
            </Button>
          )}
          {!isUpcoming && (
            <Button size="sm" variant="outline" data-testid={`view-meeting-${meeting.id}`}>
              <Eye className="w-4 h-4 mr-1" />
              View
            </Button>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Created: {format(new Date(meeting.createdAt), "MMM d, yyyy")}
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" data-testid={`edit-meeting-${meeting.id}`}>
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700" data-testid={`delete-meeting-${meeting.id}`}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>  
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ModernSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="meetings-title">
                  Meetings
                </h1>
                <p className="text-gray-600">Manage your upcoming and past meetings</p>
              </div>
              <Link href="/create-meeting">
                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-meeting-button">
                  <Plus className="w-4 h-4 mr-2" />
                  New Meeting
                </Button>
              </Link>
            </div>
          </div>

          {/* Search and Stats */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search meetings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-meetings"
                />
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  <span>{upcomingMeetings.length} Upcoming</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
                  <span>{pastMeetings.length} Past</span>
                </div>
              </div>
            </div>
          </div>

          {/* Meetings Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming" className="flex items-center" data-testid="upcoming-tab">
                <Calendar className="w-4 h-4 mr-2" />
                Upcoming ({upcomingMeetings.length})
              </TabsTrigger>
              <TabsTrigger value="past" className="flex items-center" data-testid="past-tab">
                <History className="w-4 h-4 mr-2" />
                Meeting History ({pastMeetings.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming" className="space-y-4 mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredMeetings(upcomingMeetings).length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredMeetings(upcomingMeetings).map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} isUpcoming={true} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Video className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No upcoming meetings</h3>
                    <p className="text-gray-600 mb-4">You don't have any scheduled meetings yet.</p>
                    <Link href="/create-meeting">
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Schedule Your First Meeting
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="past" className="space-y-4 mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 gap-4">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : filteredMeetings(pastMeetings).length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {filteredMeetings(pastMeetings).map((meeting) => (
                    <MeetingCard key={meeting.id} meeting={meeting} isUpcoming={false} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No meeting history</h3>
                    <p className="text-gray-600">Your completed meetings will appear here.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}