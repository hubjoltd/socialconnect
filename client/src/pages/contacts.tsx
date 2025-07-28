import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { notifications } from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import ModernSidebar from "@/components/ModernSidebar";
import { 
  Users,
  Search,
  Plus,
  Mail,
  Phone,
  Video,
  MessageSquare,
  UserPlus,
  Filter,
  Download,
  Upload,
  MoreVertical,
  Edit,
  Trash2,
  Star,
  Calendar,
  Globe,
  Building,
  MapPin,
  Clock
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  title?: string;
  avatar?: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  tags: string[];
  notes?: string;
  lastContact: string;
  location?: string;
  website?: string;
  createdAt: string;
  isFavorite?: boolean;
}

export default function Contacts() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  
  const [newContact, setNewContact] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    title: "",
    notes: "",
    website: "",
    location: "",
    sendInvite: false,
    inviteMessage: ""
  });

  const [showInviteDialog, setShowInviteDialog] = useState(false);
  const [inviteData, setInviteData] = useState({
    email: "",
    message: "",
    contactType: "colleague"
  });

  const { data: contacts = [], isLoading } = useQuery<Contact[]>({
    queryKey: ["/api/contacts"],
    enabled: isAuthenticated,
  });

  const addContactMutation = useMutation({
    mutationFn: async (data: typeof newContact) => {
      const response = await apiRequest("POST", "/api/contacts", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      setShowAddDialog(false);
      setNewContact({
        name: "",
        email: "",
        phone: "",
        company: "",
        title: "",
        notes: "",
        website: "",
        location: "",
        sendInvite: false,
        inviteMessage: ""
      });
      notifications.notify('success', 'Contact Added', 'Contact has been successfully added to your network');
      toast({
        title: "Success",
        description: "Contact added successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add contact",
        variant: "destructive",
      });
    },
  });

  const updateContactMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Contact> }) => {
      const response = await apiRequest("PATCH", `/api/contacts/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact updated successfully",
      });
    },
  });

  const inviteContactMutation = useMutation({
    mutationFn: async (data: typeof inviteData) => {
      const response = await apiRequest("POST", "/api/contacts/invite", data);
      return response.json();
    },
    onSuccess: () => {
      setShowInviteDialog(false);
      setInviteData({
        email: "",
        message: "",
        contactType: "colleague"
      });
      notifications.notify('invitation', 'Invitation Sent', 'Contact invitation has been sent successfully');
      toast({
        title: "Success",
        description: "Contact invitation sent successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send contact invitation",
        variant: "destructive",
      });
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/contacts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
      toast({
        title: "Success",
        description: "Contact deleted successfully",
      });
    },
  });

  const filteredContacts = contacts.filter(contact => {
    const matchesSearch = contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contact.company?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = selectedStatus === "all" || contact.status === selectedStatus;
    
    return matchesSearch && matchesStatus;
  });

  const handleAddContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContact.name || !newContact.email) {
      toast({
        title: "Error",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    addContactMutation.mutate(newContact);
  };

  const handleFavoriteToggle = (contactId: string, isFavorite: boolean) => {
    updateContactMutation.mutate({
      id: contactId,
      data: { isFavorite: !isFavorite }
    });
  };

  const getStatusColor = (status: Contact['status']) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = (status: Contact['status']) => {
    switch (status) {
      case 'online': return 'Online';
      case 'away': return 'Away';
      case 'busy': return 'Busy';
      default: return 'Offline';
    }
  };

  const startVideoCall = (contact: Contact) => {
    toast({
      title: "Video Call Started",
      description: `Starting video call with ${contact.name}`,
    });
  };

  const startAudioCall = (contact: Contact) => {
    toast({
      title: "Audio Call Started",
      description: `Starting audio call with ${contact.name}`,
    });
  };

  const sendMessage = (contact: Contact) => {
    toast({
      title: "Message",
      description: `Opening chat with ${contact.name}`,
    });
  };

  const scheduleCall = (contact: Contact) => {
    toast({
      title: "Schedule Call",
      description: `Opening calendar to schedule call with ${contact.name}`,
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const favoriteContacts = filteredContacts.filter(c => c.isFavorite);
  const recentContacts = filteredContacts.sort((a, b) => 
    new Date(b.lastContact).getTime() - new Date(a.lastContact).getTime()
  ).slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <ModernSidebar />
      
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="contacts-title">
                  Contacts
                </h1>
                <p className="text-gray-600">Manage your professional network and team connections</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Button variant="outline" data-testid="import-contacts">
                  <Upload className="h-4 w-4 mr-2" />
                  Import
                </Button>
                <Button variant="outline" data-testid="export-contacts">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
                
                <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="bg-green-50 border-green-500 text-green-700 hover:bg-green-100">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Send Invitation
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Invite New Contact</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      inviteContactMutation.mutate(inviteData);
                    }} className="space-y-4">
                      <div>
                        <Label htmlFor="inviteEmail">Email Address *</Label>
                        <Input
                          id="inviteEmail"
                          type="email"
                          value={inviteData.email}
                          onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                          placeholder="colleague@company.com"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="contactType">Contact Type</Label>
                        <Select value={inviteData.contactType} onValueChange={(value) => setInviteData({ ...inviteData, contactType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select contact type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="colleague">Colleague</SelectItem>
                            <SelectItem value="client">Client</SelectItem>
                            <SelectItem value="partner">Partner</SelectItem>
                            <SelectItem value="vendor">Vendor</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label htmlFor="invitePersonalMessage">Personal Message</Label>
                        <Textarea
                          id="invitePersonalMessage"
                          value={inviteData.message}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInviteData({ ...inviteData, message: e.target.value })}
                          placeholder="Hi! I'd like to connect with you on our platform. You'll be able to join meetings, chat, and collaborate with our team..."
                          rows={3}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          They'll receive an email with a secure link to accept your invitation.
                        </p>
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowInviteDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={inviteContactMutation.isPending} className="bg-green-600 hover:bg-green-700">
                          {inviteContactMutation.isPending ? "Sending..." : "Send Invitation"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>

                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700" data-testid="add-contact-button">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Contact
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Contact</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddContact} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name">Name *</Label>
                          <Input
                            id="name"
                            value={newContact.name}
                            onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={newContact.email}
                            onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                            placeholder="john@example.com"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="phone">Phone</Label>
                          <Input
                            id="phone"
                            value={newContact.phone}
                            onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company">Company</Label>
                          <Input
                            id="company"
                            value={newContact.company}
                            onChange={(e) => setNewContact({ ...newContact, company: e.target.value })}
                            placeholder="Acme Corp"
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="title">Job Title</Label>
                          <Input
                            id="title"
                            value={newContact.title}
                            onChange={(e) => setNewContact({ ...newContact, title: e.target.value })}
                            placeholder="Software Engineer"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location">Location</Label>
                          <Input
                            id="location"
                            value={newContact.location}
                            onChange={(e) => setNewContact({ ...newContact, location: e.target.value })}
                            placeholder="San Francisco, CA"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input
                          id="website"
                          value={newContact.website}
                          onChange={(e) => setNewContact({ ...newContact, website: e.target.value })}
                          placeholder="https://example.com"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="notes">Notes</Label>
                        <Input
                          id="notes"
                          value={newContact.notes}
                          onChange={(e) => setNewContact({ ...newContact, notes: e.target.value })}
                          placeholder="Additional notes..."
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="sendInvite"
                            checked={newContact.sendInvite}
                            onCheckedChange={(checked: boolean) => 
                              setNewContact({ ...newContact, sendInvite: checked === true })
                            }
                          />
                          <Label htmlFor="sendInvite" className="text-sm font-medium">
                            Send Zoom-like invitation email
                          </Label>
                        </div>
                        
                        {newContact.sendInvite && (
                          <div>
                            <Label htmlFor="inviteMessage">Personal Invitation Message</Label>
                            <Textarea
                              id="inviteMessage"
                              value={newContact.inviteMessage || ''}
                              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewContact({ ...newContact, inviteMessage: e.target.value })}
                              placeholder="Hi! I'd like to connect with you on our communication platform. You'll be able to join meetings, chat with our team, and collaborate seamlessly..."
                              rows={3}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              They'll receive an email with a secure link to accept your invitation and join the platform.
                            </p>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex justify-end space-x-3 pt-4">
                        <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={addContactMutation.isPending}>
                          {addContactMutation.isPending ? "Adding..." : "Add Contact"}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search contacts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="search-contacts"
                />
              </div>
              
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="online">Online</SelectItem>
                  <SelectItem value="away">Away</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="offline">Offline</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{filteredContacts.length} contacts</span>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Contacts</p>
                    <p className="text-2xl font-bold text-gray-900">{contacts.length}</p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Favorites</p>
                    <p className="text-2xl font-bold text-gray-900">{favoriteContacts.length}</p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Online Now</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {contacts.filter(c => c.status === 'online').length}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <div className="h-6 w-6 bg-green-500 rounded-full"></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">This Month</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {contacts.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 rounded-full">
                    <Plus className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contacts Grid */}
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3 max-w-md">
              <TabsTrigger value="all">All Contacts</TabsTrigger>
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-lg transition-shadow" data-testid={`contact-${contact.id}`}>
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center space-x-3">
                            <div className="relative">
                              <Avatar className="h-12 w-12">
                                <AvatarImage src={contact.avatar} />
                                <AvatarFallback className="bg-blue-100 text-blue-600">
                                  {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className={`absolute -bottom-1 -right-1 h-4 w-4 rounded-full border-2 border-white ${getStatusColor(contact.status)}`}></div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-lg font-semibold text-gray-900 truncate">{contact.name}</h3>
                              <p className="text-sm text-gray-500">{getStatusText(contact.status)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleFavoriteToggle(contact.id, contact.isFavorite || false)}
                              className={contact.isFavorite ? 'text-yellow-500' : 'text-gray-400'}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="ghost">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="h-4 w-4 mr-2" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                          
                          {contact.phone && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Phone className="h-4 w-4 mr-2" />
                              <span>{contact.phone}</span>
                            </div>
                          )}
                          
                          {contact.company && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Building className="h-4 w-4 mr-2" />
                              <span className="truncate">{contact.company}</span>
                              {contact.title && <span className="text-gray-400 ml-1">• {contact.title}</span>}
                            </div>
                          )}
                          
                          {contact.location && (
                            <div className="flex items-center text-sm text-gray-600">
                              <MapPin className="h-4 w-4 mr-2" />
                              <span className="truncate">{contact.location}</span>
                            </div>
                          )}
                        </div>

                        {contact.tags && contact.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-4">
                            {contact.tags.slice(0, 3).map((tag, index) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                            {contact.tags.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{contact.tags.length - 3}
                              </Badge>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                          <div className="flex items-center space-x-1">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startVideoCall(contact)}
                              data-testid={`video-call-${contact.id}`}
                            >
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => startAudioCall(contact)}
                              data-testid={`audio-call-${contact.id}`}
                            >
                              <Phone className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => sendMessage(contact)}
                              data-testid={`message-${contact.id}`}
                            >
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                          </div>
                          
                          <Button
                            size="sm"
                            onClick={() => scheduleCall(contact)}
                            data-testid={`schedule-${contact.id}`}
                          >
                            <Calendar className="h-4 w-4 mr-1" />
                            Schedule
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="favorites" className="space-y-4 mt-6">
              {favoriteContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favoriteContacts.map((contact) => (
                    <Card key={contact.id} className="hover:shadow-lg transition-shadow border-yellow-200">
                      <CardContent className="p-6">
                        <div className="flex items-center space-x-3 mb-4">
                          <Avatar className="h-12 w-12">
                            <AvatarImage src={contact.avatar} />
                            <AvatarFallback className="bg-yellow-100 text-yellow-600">
                              {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                            <p className="text-sm text-gray-500">{contact.company}</p>
                          </div>
                          <Star className="h-5 w-5 text-yellow-500" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline">{getStatusText(contact.status)}</Badge>
                          <div className="flex items-center space-x-1">
                            <Button size="sm" variant="outline">
                              <Video className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline">
                              <Phone className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No favorite contacts</h3>
                    <p className="text-gray-500">Star contacts to add them to your favorites</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recent" className="space-y-4 mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentContacts.map((contact) => (
                  <Card key={contact.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-3 mb-4">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback className="bg-green-100 text-green-600">
                            {contact.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900">{contact.name}</h3>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{new Date(contact.lastContact).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{contact.company}</Badge>
                        <div className="flex items-center space-x-1">
                          <Button size="sm" variant="outline">
                            <MessageSquare className="h-4 w-4" />
                          </Button>
                          <Button size="sm">
                            <Calendar className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}