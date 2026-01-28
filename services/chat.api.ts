import { api } from './api';

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  senderRole: 'user' | 'agent' | 'partner' | 'admin';
  messageType: 'text' | 'image' | 'file' | 'system';
  content: string;
  fileUrl?: string;
  fileName?: string;
  readBy: Array<{ userId: string; readAt: Date }>;
  createdAt: Date;
  updatedAt: Date;
}

export interface Conversation {
  _id: string;
  participants: Array<{
    userId: string;
    role: 'user' | 'agent' | 'partner' | 'admin';
    joinedAt: Date;
    isActive: boolean;
  }>;
  conversationType: 'direct' | 'support' | 'group';
  title?: string;
  description?: string;
  lastMessage?: {
    content: string;
    senderId: string;
    timestamp: Date;
  };
  unreadCount: Record<string, number>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Create or get conversation with admin
export const getOrCreateAdminConversation = async (token: string) => {
  try {
    console.log('Calling admin conversation API...');
    const response = await api.post('/chat/admin/conversation');
    console.log('Admin conversation API response:', response.data);
    
    // Handle both response formats
    if (response.data) {
      return response.data;
    }
    
    return {
      success: false,
      message: 'Invalid response from server',
    };
  } catch (error: any) {
    console.error('Error creating admin conversation:', error);
    console.error('Error details:', error.response?.data);
    
    if (error.response?.data) {
      return {
        success: false,
        message: error.response.data.message || 'Failed to connect with admin',
      };
    }
    
    throw {
      success: false,
      message: error.message || 'Failed to connect with admin',
    };
  }
};

// Get all conversations for user
export const getUserConversations = async (token: string) => {
  try {
    const response = await api.get('/conversations');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    throw error.response?.data || { error: 'Failed to fetch conversations' };
  }
};

// Get messages for a conversation
export const getConversationMessages = async (
  conversationId: string,
  token: string,
  page: number = 1,
  limit: number = 50
) => {
  try {
    const response = await api.get(
      `/conversations/${conversationId}/messages`,
      {
        params: { page, limit },
      }
    );
    return response.data || { success: true, data: { messages: [] } };
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return { success: false, data: { messages: [] }, message: 'Failed to fetch messages' };
  }
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  content: string,
  token: string,
  messageType: 'text' | 'image' | 'file' = 'text'
) => {
  try {
    const response = await api.post('/messages', {
      conversationId,
      content,
      messageType,
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to send message',
    };
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, token: string) => {
  try {
    const response = await api.post(`/conversations/${conversationId}/read`);
    return response.data;
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    throw error.response?.data || { error: 'Failed to mark messages as read' };
  }
};

// Poll for new messages (alternative to Socket.IO)
export const pollMessages = async (
  conversationId: string,
  token: string,
  lastMessageId?: string
) => {
  try {
    const response = await api.get(
      `/conversations/${conversationId}/messages`,
      {
        params: {
          after: lastMessageId,
          limit: 20,
        },
      }
    );
    return response.data;
  } catch (error: any) {
    console.error('Error polling messages:', error);
    return { success: false, data: { messages: [] } };
  }
};
