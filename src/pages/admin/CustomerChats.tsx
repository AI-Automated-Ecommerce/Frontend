import { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MessageCircle, Search, Loader2, Send, Phone, Clock, ShoppingCart, Eye, User } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCustomerChats, fetchChatHistory, sendMessage } from '@/store/slices/chatSlice';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Order {
  id: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  itemCount?: number;
  paymentMethod?: string;
}

interface Conversation {
  phoneNumber: string;
  customerName: string;
  customerEmail: string;
  lastMessage: string;
  lastMessageTime: string;
  lastMessageRole: 'user' | 'assistant';
  messageCount: number;
  ongoingOrders: Order[];
  hasUnread: boolean;
}

interface ChatHistory {
  phoneNumber: string;
  customerName: string;
  customerEmail: string;
  customerAddress: string;
  joinedDate: string;
  messages: Message[];
  orders: Order[];
}

const CustomerChats = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const dispatch = useAppDispatch();

  const { conversations = [], status } = useAppSelector((state) => state.chats);
  const chatHistory = useAppSelector((state) => state.chats.activeChatHistory);
  const historyStatus = status;
  
  const isLoading = status === 'loading';
  const isLoadingHistory = historyStatus === 'loading';

  // Fetch conversations on mount and periodically
  useEffect(() => {
    dispatch(fetchCustomerChats());
    const interval = setInterval(() => {
      dispatch(fetchCustomerChats());
    }, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, [dispatch]);

  // Fetch chat history when a chat is selected
  useEffect(() => {
    if (selectedChat) {
      dispatch(fetchChatHistory(selectedChat));
    }
  }, [selectedChat, dispatch]);

  const handleSendMessage = async () => {
    if (!messageText.trim() || !selectedChat) return;
    
    setIsSending(true);
    try {
      await dispatch(sendMessage({ phoneNumber: selectedChat, message: messageText.trim() })).unwrap();
      setMessageText('');
      toast.success('Message sent successfully!');
      // Refresh chat history and conversations
      dispatch(fetchChatHistory(selectedChat));
      dispatch(fetchCustomerChats());
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error(`Failed to send message: ${errorMessage}`);
    } finally {
      setIsSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv: Conversation) =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.phoneNumber.includes(searchQuery) ||
    conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatTime = (dateString: string) => {
    if (!dateString) return 'No messages';
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const formatMessageTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-700',
      'PAYMENT_REVIEW_REQUESTED': 'bg-blue-100 text-blue-700',
      'PAID': 'bg-green-100 text-green-700',
      'SHIPPED': 'bg-purple-100 text-purple-700',
      'COMPLETED': 'bg-green-100 text-green-700',
      'CANCELLED': 'bg-red-100 text-red-700',
    };
    return statusColors[status] || 'bg-gray-100 text-gray-700';
  };



  const totalConversations = conversations.length;
  const unreadCount = conversations.filter((conv: Conversation) => conv.hasUnread).length;
  const activeOrdersCount = conversations.reduce((acc: number, conv: Conversation) => 
    acc + conv.ongoingOrders.length, 0
  );

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Customer Chats</h1>
        <p className="text-muted-foreground">
          View and manage conversations with your customers
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Total Conversations</h3>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{totalConversations}</div>
          <p className="text-xs text-muted-foreground">
            Active customer conversations
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Unread Messages</h3>
            <Badge variant="destructive" className="h-5 px-1.5 text-xs">
              {unreadCount}
            </Badge>
          </div>
          <div className="text-2xl font-bold">{unreadCount}</div>
          <p className="text-xs text-muted-foreground">
            Messages requiring response
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
          <div className="flex items-center justify-between space-y-0 pb-2">
            <h3 className="text-sm font-medium">Active Orders</h3>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="text-2xl font-bold">{activeOrdersCount}</div>
          <p className="text-xs text-muted-foreground">
            Customers with ongoing orders
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center space-x-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers, phone numbers, or messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {/* Conversations Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Last Message</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Messages</TableHead>
              <TableHead>Ongoing Orders</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredConversations.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  {searchQuery ? 'No conversations match your search.' : 'No customer conversations yet.'}
                </TableCell>
              </TableRow>
            ) : (
              filteredConversations.map((conv: Conversation) => (
                <TableRow key={conv.phoneNumber}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{conv.customerName}</div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Phone className="h-3 w-3 mr-1" />
                          {conv.phoneNumber}
                        </div>
                      </div>
                      {conv.hasUnread && (
                        <Badge variant="destructive" className="h-4 w-4 rounded-full p-0">
                          <span className="sr-only">New message</span>
                        </Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate">
                      {conv.lastMessageRole === 'user' ? '👤 ' : '🤖 '}
                      {conv.lastMessage}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatTime(conv.lastMessageTime)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{conv.messageCount}</Badge>
                  </TableCell>
                  <TableCell>
                    {conv.ongoingOrders.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {conv.ongoingOrders.slice(0, 2).map((order) => (
                          <Badge key={order.id} className={getStatusColor(order.status)}>
                            #{order.id}
                          </Badge>
                        ))}
                        {conv.ongoingOrders.length > 2 && (
                          <Badge variant="outline">+{conv.ongoingOrders.length - 2}</Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedChat(conv.phoneNumber)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Chat
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Chat Dialog */}
      <Dialog open={!!selectedChat} onOpenChange={() => setSelectedChat(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              Chat with {chatHistory?.customerName}
            </DialogTitle>
            <DialogDescription>
              Phone: {chatHistory?.phoneNumber} | Email: {chatHistory?.customerEmail}
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingHistory ? (
            <div className="flex h-96 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : chatHistory ? (
            <div className="space-y-4">
              {/* Customer Orders */}
              {chatHistory.orders.length > 0 && (
                <div className="rounded-lg border p-4">
                  <h4 className="font-medium mb-2">Customer Orders</h4>
                  <div className="flex flex-wrap gap-2">
                    {chatHistory.orders.slice(0, 5).map((order) => (
                      <Badge key={order.id} className={getStatusColor(order.status)}>
                        #{order.id} - ${order.totalAmount.toFixed(2)} ({order.status.toLowerCase()})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="max-h-96 overflow-y-auto space-y-3 border rounded-lg p-4">
                {chatHistory.messages.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No messages in this conversation yet.
                  </p>
                ) : (
                  chatHistory.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                          message.role === 'user'
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <div className="text-sm">{message.content}</div>
                        <div
                          className={`text-xs mt-1 ${
                            message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
                          }`}
                        >
                          {formatMessageTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Send Message */}
              <div className="flex space-x-2">
                <Textarea
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  className="flex-1"
                  rows={3}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  size="sm"
                >
                  {isSending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedChat(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CustomerChats;