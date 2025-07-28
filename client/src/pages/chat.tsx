import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  MessageSquare,
  Send,
  Video,
  Phone,
  Plus,
  Hash,
  Users,
  Search,
  MoreVertical,
  Paperclip,
  Smile,
  ArrowLeft,
  Settings
} from "lucide-react";
import { Link } from "wouter";

interface ChatChannel {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  type: "public" | "private" | "direct";
  createdBy: string;
  isArchived: boolean;
  memberCount?: number;
}

interface ChatMessage {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  messageType: "text" | "file" | "image" | "video" | "call";
  fileUrl?: string;
  fileName?: string;
  fileSize?: string;
  replyToMessageId?: string;
  isEdited: boolean;
  isDeleted: boolean;
  createdAt: string;
  user?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export default function Chat() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedChannel, setSelectedChannel] = useState<ChatChannel | null>(null);
  const [messageText, setMessageText] = useState("");
  const [ws, setWs] = useState<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch channels
  const { data: channels = [] } = useQuery<ChatChannel[]>({
    queryKey: ["/api/chat/channels"],
  });

  // Fetch messages for selected channel
  const { data: messages = [] } = useQuery<ChatMessage[]>({
    queryKey: ["/api/chat/channels", selectedChannel?.id, "messages"],
    enabled: !!selectedChannel?.id,
  });

  // WebSocket connection
  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const websocket = new WebSocket(wsUrl);

    websocket.onopen = () => {
      console.log('WebSocket connected');
      if (user) {
        websocket.send(JSON.stringify({
          type: 'join_channel',
          userId: user.id,
          channelId: selectedChannel?.id
        }));
      }
    };

    websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      if (data.type === 'new_message') {
        // Refresh messages when new message received
        queryClient.invalidateQueries({ 
          queryKey: ["/api/chat/channels", selectedChannel?.id, "messages"] 
        });
      } else if (data.type === 'call_started') {
        toast({
          title: "Call Started",
          description: `${data.callType} call initiated in this channel`,
        });
      }
    };

    websocket.onclose = () => {
      console.log('WebSocket disconnected');
    };

    setWs(websocket);

    return () => {
      websocket.close();
    };
  }, [user, selectedChannel?.id, queryClient, toast]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!selectedChannel || !user) return;
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'send_message',
          channelId: selectedChannel.id,
          userId: user.id,
          content,
          messageType: 'text'
        }));
      }
    },
    onSuccess: () => {
      setMessageText("");
    },
  });

  const startCallMutation = useMutation({
    mutationFn: async (callType: 'video' | 'audio') => {
      if (!selectedChannel || !user) return;
      
      const callId = `call_${Date.now()}`;
      
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          type: 'start_call',
          callId,
          callType,
          userId: user.id,
          channelId: selectedChannel.id
        }));
      }
      
      toast({
        title: `${callType === 'video' ? 'Video' : 'Audio'} Call Started`,
        description: "Call invitation sent to channel members",
      });
    },
  });

  const sendMessage = () => {
    if (messageText.trim() && selectedChannel) {
      sendMessageMutation.mutate(messageText.trim());
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getUserDisplayName = (message: ChatMessage) => {
    if (message.user) {
      return `${message.user.firstName || ''} ${message.user.lastName || ''}`.trim() || 
             message.user.email.split('@')[0];
    }
    return 'Unknown User';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center mb-4">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
              </Link>
            </div>
            <div className="flex items-center justify-between">
              <h1 className="text-lg font-semibold">Team Chat</h1>
              <Button size="sm" variant="outline">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="p-4">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input placeholder="Search channels..." className="pl-10" />
            </div>
          </div>

          {/* Channels List */}
          <ScrollArea className="flex-1">
            <div className="px-2">
              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Channels
                </h3>
                <div className="space-y-1">
                  {channels.filter(c => c.type === 'public').map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                        selectedChannel?.id === channel.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <Hash className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="font-medium">{channel.displayName}</span>
                        {channel.memberCount && (
                          <Badge variant="secondary" className="ml-auto text-xs">
                            {channel.memberCount}
                          </Badge>
                        )}
                      </div>
                      {channel.description && (
                        <p className="text-xs text-gray-500 mt-1 pl-6 truncate">
                          {channel.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
                  Direct Messages
                </h3>
                <div className="space-y-1">
                  {channels.filter(c => c.type === 'direct').map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full text-left px-3 py-2 rounded-md hover:bg-gray-100 transition-colors ${
                        selectedChannel?.id === channel.id ? 'bg-blue-100 text-blue-700' : 'text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <span className="font-medium">{channel.displayName}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col">
          {selectedChannel ? (
            <>
              {/* Chat Header */}
              <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center mr-4">
                      {selectedChannel.type === 'public' ? (
                        <Hash className="w-5 h-5 mr-2 text-gray-400" />
                      ) : (
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      )}
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selectedChannel.displayName}
                      </h2>
                      {selectedChannel.memberCount && (
                        <Badge variant="secondary" className="ml-2">
                          <Users className="w-3 h-3 mr-1" />
                          {selectedChannel.memberCount}
                        </Badge>
                      )}
                    </div>
                    {selectedChannel.description && (
                      <span className="text-sm text-gray-500 border-l border-gray-300 pl-4">
                        {selectedChannel.description}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startCallMutation.mutate('audio')}
                      disabled={startCallMutation.isPending}
                    >
                      <Phone className="w-4 h-4 mr-1" />
                      Call
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => startCallMutation.mutate('video')}
                      disabled={startCallMutation.isPending}
                    >
                      <Video className="w-4 h-4 mr-1" />
                      Video
                    </Button>
                    <Button size="sm" variant="ghost">
                      <Settings className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message, index) => {
                    const showAvatar = index === 0 || 
                      messages[index - 1].userId !== message.userId ||
                      new Date(message.createdAt).getTime() - new Date(messages[index - 1].createdAt).getTime() > 300000; // 5 minutes

                    return (
                      <div key={message.id} className={`flex items-start gap-3 ${showAvatar ? 'mt-4' : 'mt-1'}`}>
                        <div className="w-8">
                          {showAvatar && (
                            <Avatar className="w-8 h-8">
                              <AvatarFallback className="bg-blue-100 text-blue-800 text-xs">
                                {getInitials(getUserDisplayName(message))}
                              </AvatarFallback>
                            </Avatar>
                          )}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          {showAvatar && (
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-medium text-gray-900 text-sm">
                                {getUserDisplayName(message)}
                              </span>
                              <span className="text-xs text-gray-500">
                                {formatTime(message.createdAt)}
                              </span>
                            </div>
                          )}
                          
                          <div className="text-sm text-gray-700 break-words">
                            {message.messageType === 'call' ? (
                              <div className="flex items-center gap-2 text-blue-600 bg-blue-50 p-2 rounded">
                                <Video className="w-4 h-4" />
                                <span>{message.content}</span>
                              </div>
                            ) : (
                              <p>{message.content}</p>
                            )}
                          </div>
                          
                          {message.isEdited && (
                            <span className="text-xs text-gray-400 ml-1">(edited)</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <div className="bg-white border-t border-gray-200 p-4">
                <div className="flex items-end gap-3">
                  <Button size="sm" variant="ghost">
                    <Paperclip className="w-4 h-4" />
                  </Button>
                  
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Message #${selectedChannel.displayName}`}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      rows={1}
                      className="resize-none min-h-[40px] max-h-32"
                    />
                  </div>

                  <Button size="sm" variant="ghost">
                    <Smile className="w-4 h-4" />
                  </Button>
                  
                  <Button
                    size="sm"
                    onClick={sendMessage}
                    disabled={!messageText.trim() || sendMessageMutation.isPending}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            // No channel selected
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Welcome to Team Chat
                </h3>
                <p className="text-gray-500">
                  Select a channel to start messaging with your team
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}