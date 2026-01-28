import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAppSelector } from '@/store/hooks';
import {
  getOrCreateAdminConversation,
  getConversationMessages,
  sendMessage,
  pollMessages,
  Message,
  Conversation,
} from '@/services/chat.api';
import Toast from 'react-native-toast-message';
import { colors, spacing } from '@/theme';

const RED_PRIMARY = '#D32F2F';
const GRAY_LIGHT = '#F8F9FA';
const GRAY_BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#1A1A1A';
const TEXT_SECONDARY = '#6B7280';

export default function ChatScreen() {
  const router = useRouter();
  const { token, user } = useAppSelector((state) => state.auth);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [adminAvailable, setAdminAvailable] = useState(true);
  const flatListRef = useRef<FlatList>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initChat();
    return () => {
      // Cleanup polling on unmount
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const initChat = async () => {
    try {
      setLoading(true);

      // Get or create admin conversation
      const response = await getOrCreateAdminConversation(token!);
      console.log('Admin conversation response:', response);
      
      if (response && response.success && response.data) {
        setConversation(response.data);
        setAdminAvailable(response.adminAvailable !== false);
        
        // Show info if admin not available
        if (response.adminAvailable === false) {
          Toast.show({
            type: 'info',
            text1: 'Admin Offline',
            text2: 'No admin is currently available. Your messages will be saved.',
            visibilityTime: 4000,
          });
        }
        
        // Load messages
        await loadMessages(response.data._id);
        
        // Start polling for new messages every 3 seconds
        startPolling(response.data._id);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Connection Failed',
          text2: response?.message || 'Unable to connect with admin',
        });
        // Go back if connection fails
        setTimeout(() => router.back(), 2000);
      }
    } catch (error: any) {
      console.error('Error initializing chat:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to initialize chat',
      });
      // Go back if error occurs
      setTimeout(() => router.back(), 2000);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await getConversationMessages(conversationId, token!);
      if (response.success) {
        setMessages(response.data.messages.reverse());
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startPolling = (conversationId: string) => {
    // Poll for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const lastMessage = messages[0];
        const response = await pollMessages(
          conversationId,
          token!,
          lastMessage?._id
        );
        
        if (response.success && response.data.messages.length > 0) {
          // Add new messages to the beginning
          setMessages((prev) => [...response.data.messages.reverse(), ...prev]);
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversation || sending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    try {
      const response = await sendMessage(conversation._id, textToSend, token!);
      if (response.success) {
        // Add message to list immediately
        setMessages((prev) => [response.data, ...prev]);
        flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Failed to send',
          text2: response.message,
        });
        setMessageText(textToSend);
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to send message',
      });
      setMessageText(textToSend);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isMyMessage = item.senderId === user?._id;
    
    return (
      <View
        style={[
          styles.messageContainer,
          isMyMessage ? styles.myMessageContainer : styles.theirMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isMyMessage ? styles.myMessageBubble : styles.theirMessageBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              isMyMessage ? styles.myMessageText : styles.theirMessageText,
            ]}
          >
            {item.content}
          </Text>
          <Text
            style={[
              styles.messageTime,
              isMyMessage ? styles.myMessageTime : styles.theirMessageTime,
            ]}
          >
            {new Date(item.createdAt).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={RED_PRIMARY} />
        <Text style={styles.loadingText}>Connecting to support...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor={RED_PRIMARY} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>Admin Support</Text>
          <Text style={styles.headerSubtitle}>
            {adminAvailable ? "We're here to help" : "Leave a message"}
          </Text>
        </View>
        <View style={styles.headerRight}>
          <View style={[
            styles.onlineIndicator,
            !adminAvailable && styles.offlineIndicator
          ]} />
        </View>
      </View>

      {/* Messages List */}
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        inverted
        contentContainerStyle={styles.messagesList}
        showsVerticalScrollIndicator={false}
      />

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Type your message..."
              placeholderTextColor={TEXT_SECONDARY}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
              editable={!sending}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!messageText.trim() || sending) && styles.sendButtonDisabled,
              ]}
              onPress={handleSendMessage}
              disabled={!messageText.trim() || sending}
            >
              {sending ? (
                <ActivityIndicator size="small" color={colors.white} />
              ) : (
                <Ionicons name="send" size={20} color={colors.white} />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 16,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: RED_PRIMARY,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: spacing.sm,
    marginRight: spacing.sm,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  headerRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
    borderWidth: 2,
    borderColor: colors.white,
  },
  offlineIndicator: {
    backgroundColor: '#9E9E9E',
  },
  messagesList: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  messageContainer: {
    marginBottom: spacing.md,
    maxWidth: '80%',
  },
  myMessageContainer: {
    alignSelf: 'flex-end',
  },
  theirMessageContainer: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  myMessageBubble: {
    backgroundColor: RED_PRIMARY,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: GRAY_LIGHT,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  myMessageText: {
    color: colors.white,
  },
  theirMessageText: {
    color: TEXT_PRIMARY,
  },
  messageTime: {
    fontSize: 11,
    marginTop: 4,
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'right',
  },
  theirMessageTime: {
    color: TEXT_SECONDARY,
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: GRAY_LIGHT,
    borderRadius: 24,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.sm,
    fontSize: 15,
    color: TEXT_PRIMARY,
    maxHeight: 100,
    marginRight: spacing.sm,
  },
  sendButton: {
    backgroundColor: RED_PRIMARY,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
