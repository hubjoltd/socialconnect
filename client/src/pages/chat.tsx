import { useState, useEffect, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { notifications } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import ModernSidebar from "@/components/ModernSidebar";
import { 
  MessageSquare,
  Send,
  Hash,
  Users,
  Settings,
  Search,
  Plus,
  MoreVertical,
  Phone,
  Video,
  Mic,
  MicOff,
  VideoOff,
  UserPlus,
  Bell,
  BellOff,
  Pin,
  Smile,
  Paperclip,
  Calendar,
  Star,
  PhoneCall,
  Monitor,
  Volume2,
  PhoneOff,
  MoreHorizontal,
  X
} from "lucide-react";

interface Channel {
  id: string;
  name: string;
  description?: string;
  type: 'public' | 'private' | 'direct';
  memberCount: number;
  unreadCount: number;
  lastActivity: string;
  createdBy: string;
}

interface Message {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  channelId: string;
  timestamp: string;
  edited?: boolean;
  reactions?: Array<{
    emoji: string;
    count: number;
    users: string[];
  }>;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  title?: string;
}

export default function Chat() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isCallActive, setIsCallActive] = useState(false);
  const [callType, setCallType] = useState<'audio' | 'video' | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);



  // Emoji support
  const commonEmojis = ['😀', '😂', '🙂', '😍', '🤔', '👍', '👎', '❤️', '🎉', '💯', '🔥', '👋', '✅', '❌', '⭐'];
  
  const addEmoji = (emoji: string) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const { data: channels = [], isLoading: channelsLoading } = useQuery<Channel[]>({
    queryKey: ["/api/chat/channels"],
    enabled: isAuthenticated,
    refetchInterval: 10000, // Refresh channels every 10 seconds
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ["/api/chat/messages", selectedChannel],
    enabled: isAuthenticated && !!selectedChannel,
    refetchInterval: 2000, // Real-time message updates every 2 seconds
  });

  const { data: teamMembers = [], isLoading: membersLoading } = useQuery<User[]>({
    queryKey: ["/api/contacts"],
    enabled: isAuthenticated,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; channelId: string }) => {
      const response = await apiRequest("POST", "/api/chat/messages", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/messages", selectedChannel] });
      setNewMessage("");
      // Play notification sound
      notifications.playMessageNotification();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });



  const createChannelMutation = useMutation({
    mutationFn: async (data: { name: string; description?: string; type: 'public' | 'private'; participants?: string[] }) => {
      const response = await apiRequest("POST", "/api/chat/channels", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/chat/channels"] });
      setShowCreateChannel(false);
      setNewChannelName('');
      setNewChannelDescription('');
      setChannelParticipants([]);
      toast({
        title: "Success",
        description: "Channel created successfully and invitations sent",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create channel",
        variant: "destructive",
      });
    }
  });

  const handleCreateChannel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChannelName.trim()) return;
    
    createChannelMutation.mutate({
      name: newChannelName,
      description: newChannelDescription,
      type: 'public',
      participants: channelParticipants
    });
  };

  const addParticipant = () => {
    if (newParticipant.trim() && !channelParticipants.includes(newParticipant.trim())) {
      setChannelParticipants([...channelParticipants, newParticipant.trim()]);
      setNewParticipant('');
    }
  };

  const removeParticipant = (email: string) => {
    setChannelParticipants(channelParticipants.filter(p => p !== email));
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChannel) return;
    
    sendMessageMutation.mutate({
      content: newMessage,
      channelId: selectedChannel,
    });
  };

  const startCall = (type: 'audio' | 'video') => {
    setCallType(type);
    setIsCallActive(true);
    toast({
      title: `${type === 'audio' ? 'Audio' : 'Video'} Call Started`,
      description: `${type === 'audio' ? 'Audio' : 'Video'} call is now active in this channel`,
    });
  };

  const endCall = () => {
    setIsCallActive(false);
    setCallType(null);
    toast({
      title: "Call Ended",
      description: "The call has been ended",
    });
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (channels.length > 0 && !selectedChannel) {
      setSelectedChannel(channels[0].id);
    }
  }, [channels, selectedChannel]);

  // Channel creation states
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [channelParticipants, setChannelParticipants] = useState<string[]>([]);
  const [newParticipant, setNewParticipant] = useState('');

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const selectedChannelData = channels.find(c => c.id === selectedChannel);
  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ModernSidebar />
      
      <div className="flex-1 flex">
        {/* Channels Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900" data-testid="chat-title">Team Chat</h2>
              <Button size="sm" variant="ghost" data-testid="chat-settings">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search channels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="search-channels"
              />
            </div>
          </div>

          {/* Channels List */}
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Channels</h3>
                <Dialog open={showCreateChannel} onOpenChange={setShowCreateChannel}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" data-testid="add-channel">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Create New Channel</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateChannel} className="space-y-4">
                      <div>
                        <Label htmlFor="channelName">Channel Name *</Label>
                        <Input
                          id="channelName"
                          value={newChannelName}
                          onChange={(e) => setNewChannelName(e.target.value)}
                          placeholder="general, development, announcements..."
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="channelDescription">Description</Label>
                        <Textarea
                          id="channelDescription"
                          value={newChannelDescription}
                          onChange={(e) => setNewChannelDescription(e.target.value)}
                          placeholder="What's this channel about?"
                          rows={3}
                        />
                      </div>
                      
                      <div>
                        <Label>Invite Participants</Label>
                        <div className="flex space-x-2 mt-1">
                          <Input
                            value={newParticipant}
                            onChange={(e) => setNewParticipant(e.target.value)}
                            placeholder="email@example.com"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addParticipant();
                              }
                            }}
                          />
                          <Button type="button" onClick={addParticipant} size="sm">
                            Add
                          </Button>
                        </div>
                        
                        {channelParticipants.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-sm text-gray-600">Participants to invite:</p>
                            {channelParticipants.map((email) => (
                              <div key={email} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded">
                                <span className="text-sm">{email}</span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeParticipant(email)}
                                  className="h-6 w-6 p-0"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowCreateChannel(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createChannelMutation.isPending}>
                          {createChannelMutation.isPending ? "Creating..." : "Create Channel"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
              
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedChannel === channel.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                  data-testid={`channel-${channel.id}`}
                >
                  <div className="flex-shrink-0">
                    {channel.type === 'direct' ? (
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                          {channel.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    ) : (
                      <div className="h-8 w-8 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Hash className="h-4 w-4 text-gray-600" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {channel.name}
                      </p>
                      {channel.unreadCount > 0 && (
                        <Badge variant="default" className="bg-red-500 text-white text-xs h-5 w-5 p-0 flex items-center justify-center">
                          {channel.unreadCount}
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      {channel.type === 'direct' ? 'Direct message' : `${channel.memberCount} members`}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-4" />

            {/* Team Members */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Team Members</h3>
                <Button size="sm" variant="ghost" className="h-6 w-6 p-0" data-testid="add-member">
                  <UserPlus className="h-4 w-4" />
                </Button>
              </div>
              
              {teamMembers.slice(0, 8).map((member) => (
                <div
                  key={member.id}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                  data-testid={`member-${member.id}`}
                >
                  <div className="relative">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.avatar} />
                      <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                        {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white ${getStatusColor(member.status)}`}></div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                    <p className="text-xs text-gray-500 truncate">{member.title || member.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannelData ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Hash className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{selectedChannelData.displayName || selectedChannelData.name}</h3>
                      <p className="text-sm text-gray-500">{selectedChannelData.memberCount} members</p>
                    </div>
                  </div>
                  
                  {/* Call Controls */}
                  <div className="flex items-center space-x-2">
                    {isCallActive && (
                      <div className="flex items-center space-x-2 mr-4">
                        <div className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full">
                          {callType === 'video' ? <Video className="h-4 w-4" /> : <Phone className="h-4 w-4" />}
                          <span className="text-xs font-medium">Call Active</span>
                        </div>
                        <Button size="sm" variant="outline" onClick={endCall} data-testid="end-call">
                          End Call
                        </Button>
                      </div>
                    )}
                    
                    {!isCallActive && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startCall('audio')}
                          data-testid="start-audio-call"
                          className="flex items-center space-x-2"
                        >
                          <Phone className="h-4 w-4" />
                          <span>Call</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startCall('video')}
                          data-testid="start-video-call"
                          className="flex items-center space-x-2"
                        >
                          <Video className="h-4 w-4" />
                          <span>Video</span>
                        </Button>
                      </>
                    )}
                    
                    <Button size="sm" variant="ghost" data-testid="channel-info">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((message) => (
                      <div key={message.id} className="flex items-start space-x-3" data-testid={`message-${message.id}`}>
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={message.authorAvatar} />
                          <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                            {message.authorName.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2 mb-1">
                            <p className="text-sm font-medium text-gray-900">{message.authorName}</p>
                            <p className="text-xs text-gray-500">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </p>
                            {message.edited && (
                              <span className="text-xs text-gray-400">(edited)</span>
                            )}
                          </div>
                          
                          <div className="bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-900">{message.content}</p>
                          </div>
                          
                          {message.reactions && message.reactions.length > 0 && (
                            <div className="flex items-center space-x-1 mt-2">
                              {message.reactions.map((reaction, index) => (
                                <button
                                  key={index}
                                  className="flex items-center space-x-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 rounded-full text-xs"
                                >
                                  <span>{reaction.emoji}</span>
                                  <span className="text-blue-600">{reaction.count}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-gray-500">Start the conversation by sending a message!</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                  <div className="flex items-center space-x-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-gray-500 hover:text-gray-700"
                      data-testid="attach-file"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                    <div className="relative">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-gray-500 hover:text-gray-700"
                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                        data-testid="add-emoji"
                      >
                        <Smile className="h-4 w-4" />
                      </Button>
                      {showEmojiPicker && (
                        <div className="absolute bottom-full left-0 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg grid grid-cols-5 gap-2 z-10">
                          {commonEmojis.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => addEmoji(emoji)}
                              className="text-lg hover:bg-gray-100 p-1 rounded"
                            >
                              {emoji}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <div className="relative">
                      <Textarea
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder={`Message ${selectedChannelData?.name || 'channel'}...`}
                        className="resize-none pr-20"
                        rows={1}
                        data-testid="message-input"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                      />
                      
                      <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                        <div className="relative">
                          <Button 
                            type="button" 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                          >
                            <Smile className="h-4 w-4" />
                          </Button>
                          {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-2 p-2 bg-white border border-gray-200 rounded-lg shadow-lg grid grid-cols-5 gap-2 z-10">
                              {commonEmojis.map((emoji) => (
                                <button
                                  key={emoji}
                                  type="button"
                                  onClick={() => addEmoji(emoji)}
                                  className="text-lg hover:bg-gray-100 p-1 rounded"
                                >
                                  {emoji}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <Button type="button" size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <Paperclip className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    type="submit"
                    disabled={!newMessage.trim() || sendMessageMutation.isPending}
                    data-testid="send-message"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to Team Chat</h3>
                <p className="text-gray-500">Select a channel to start messaging with your team</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}