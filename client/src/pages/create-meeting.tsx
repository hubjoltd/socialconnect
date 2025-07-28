import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar,
  Clock,
  Video,
  Users,
  Shield,
  Mic,
  MicOff,
  VideoOff,
  Settings,
  Plus,
  X,
  Copy,
  ArrowLeft
} from "lucide-react";

const meetingSchema = z.object({
  title: z.string().min(1, "Meeting title is required"),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  timezone: z.string().default("UTC"),
  maxParticipants: z.string().default("100"),
  waitingRoom: z.boolean().default(true),
  requirePassword: z.boolean().default(false),
  password: z.string().optional(),
  recordMeeting: z.boolean().default(false),
  muteOnEntry: z.boolean().default(true),
  hostVideo: z.boolean().default(true),
  participantVideo: z.boolean().default(false),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

export default function CreateMeeting() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [participants, setParticipants] = useState<string[]>([]);
  const [participantEmail, setParticipantEmail] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: "",
      description: "",
      timezone: "UTC",
      maxParticipants: "100",
      waitingRoom: true,
      requirePassword: false,
      recordMeeting: false,
      muteOnEntry: true,
      hostVideo: true,
      participantVideo: false,
    },
  });

  const createMeetingMutation = useMutation({
    mutationFn: async (data: MeetingFormData & { participants: string[] }) => {
      return await apiRequest(`/api/meetings`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Meeting created successfully! Invitations have been sent to participants.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      form.reset();
      setParticipants([]);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create meeting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addParticipant = () => {
    if (participantEmail && !participants.includes(participantEmail)) {
      setParticipants([...participants, participantEmail]);
      setParticipantEmail("");
    }
  };

  const removeParticipant = (email: string) => {
    setParticipants(participants.filter(p => p !== email));
  };

  const onSubmit = (data: MeetingFormData) => {
    createMeetingMutation.mutate({
      ...data,
      participants,
    });
  };

  const generateRandomPassword = () => {
    const password = Math.random().toString(36).slice(-8);
    form.setValue("password", password);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule a Meeting</h1>
          <p className="text-gray-600">Set up your meeting details and invite participants</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Video className="w-5 h-5 mr-2" />
                Meeting Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Meeting Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter meeting title"
                  {...form.register("title")}
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Add agenda or meeting description"
                  rows={3}
                  {...form.register("description")}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="startTime">Start Time *</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    {...form.register("startTime")}
                  />
                  {form.formState.errors.startTime && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.startTime.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="endTime">End Time *</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    {...form.register("endTime")}
                  />
                  {form.formState.errors.endTime && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.endTime.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select onValueChange={(value) => form.setValue("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="America/New_York">Eastern Time</SelectItem>
                      <SelectItem value="America/Chicago">Central Time</SelectItem>
                      <SelectItem value="America/Denver">Mountain Time</SelectItem>
                      <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                      <SelectItem value="Europe/London">London</SelectItem>
                      <SelectItem value="Europe/Paris">Paris</SelectItem>
                      <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maxParticipants">Max Participants</Label>
                  <Select onValueChange={(value) => form.setValue("maxParticipants", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select limit" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 participants</SelectItem>
                      <SelectItem value="25">25 participants</SelectItem>
                      <SelectItem value="50">50 participants</SelectItem>
                      <SelectItem value="100">100 participants</SelectItem>
                      <SelectItem value="500">500 participants</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Participants */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Participants
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter participant email"
                  value={participantEmail}
                  onChange={(e) => setParticipantEmail(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addParticipant())}
                />
                <Button 
                  type="button" 
                  onClick={addParticipant}
                  disabled={!participantEmail}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {participants.length > 0 && (
                <div className="space-y-2">
                  <Label>Invited Participants ({participants.length})</Label>
                  <div className="flex flex-wrap gap-2">
                    {participants.map((email) => (
                      <Badge key={email} variant="secondary" className="flex items-center gap-2">
                        {email}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-4 w-4 p-0"
                          onClick={() => removeParticipant(email)}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Security & Options */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Security & Meeting Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label>Waiting Room</Label>
                    <p className="text-sm text-gray-500">Control who joins the meeting</p>
                  </div>
                  <Switch
                    checked={form.watch("waitingRoom")}
                    onCheckedChange={(checked) => form.setValue("waitingRoom", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Host Video</Label>
                    <p className="text-sm text-gray-500">Turn on video when joining</p>
                  </div>
                  <Switch
                    checked={form.watch("hostVideo")}
                    onCheckedChange={(checked) => form.setValue("hostVideo", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Participant Video</Label>
                    <p className="text-sm text-gray-500">Turn on participant video by default</p>
                  </div>
                  <Switch
                    checked={form.watch("participantVideo")}
                    onCheckedChange={(checked) => form.setValue("participantVideo", checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label>Mute on Entry</Label>
                    <p className="text-sm text-gray-500">Automatically mute participants</p>
                  </div>
                  <Switch
                    checked={form.watch("muteOnEntry")}
                    onCheckedChange={(checked) => form.setValue("muteOnEntry", checked)}
                  />
                </div>
              </div>

              <Separator />

              {/* Advanced Options */}
              <div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="mb-4"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  {showAdvanced ? "Hide" : "Show"} Advanced Options
                </Button>

                {showAdvanced && (
                  <div className="space-y-4 border-t pt-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Require Password</Label>
                        <p className="text-sm text-gray-500">Add extra security to your meeting</p>
                      </div>
                      <Switch
                        checked={form.watch("requirePassword")}
                        onCheckedChange={(checked) => form.setValue("requirePassword", checked)}
                      />
                    </div>

                    {form.watch("requirePassword") && (
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Label htmlFor="password">Meeting Password</Label>
                          <Input
                            id="password"
                            type="text"
                            placeholder="Enter password"
                            {...form.register("password")}
                          />
                        </div>
                        <div className="flex items-end">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={generateRandomPassword}
                          >
                            Generate
                          </Button>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div>
                        <Label>Record Meeting</Label>
                        <p className="text-sm text-gray-500">Automatically record the meeting</p>
                      </div>
                      <Switch
                        checked={form.watch("recordMeeting")}
                        onCheckedChange={(checked) => form.setValue("recordMeeting", checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="flex justify-end gap-4">
            <Link href="/">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button 
              type="submit" 
              disabled={createMeetingMutation.isPending}
              className="min-w-[120px]"
            >
              {createMeetingMutation.isPending ? "Creating..." : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}