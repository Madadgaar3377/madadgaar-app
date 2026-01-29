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
  Animated,
  Linking,
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
  const [inputFocused, setInputFocused] = useState(false);
  const flatListRef = useRef<FlatList>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const sendButtonScale = useRef(new Animated.Value(1)).current;

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
      console.log('Messages response:', response);
      
      if (response.success) {
        // Backend returns data as array directly, not data.messages
        const messagesArray = Array.isArray(response.data) 
          ? response.data 
          : (response.data?.messages || []);
        
        // For inverted FlatList, we need newest messages first (reverse chronological)
        // Backend returns chronological order, so reverse it
        const sortedMessages = [...messagesArray].reverse();
        setMessages(sortedMessages);
        
        // Scroll to bottom (which is top in inverted list) after loading
        setTimeout(() => {
          flatListRef.current?.scrollToOffset({ offset: 0, animated: false });
        }, 100);
      } else {
        console.warn('Failed to load messages:', response.message);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
      setMessages([]);
    }
  };

  const startPolling = (conversationId: string) => {
    // Poll for new messages every 3 seconds
    pollingIntervalRef.current = setInterval(async () => {
      try {
        const lastMessage = messages[0]; // Newest message is at index 0 in inverted list
        const response = await pollMessages(
          conversationId,
          token!,
          lastMessage?._id
        );
        
        if (response.success) {
          // Backend returns data as array directly
          const newMessages = Array.isArray(response.data) 
            ? response.data 
            : (response.data?.messages || []);
          
          if (newMessages.length > 0) {
            // Reverse to get newest first for inverted FlatList
            const sortedNewMessages = [...newMessages].reverse();
            // Add new messages to the beginning (they're newest)
            setMessages((prev) => {
              // Avoid duplicates
              const existingIds = new Set(prev.map(m => m._id));
              const uniqueNew = sortedNewMessages.filter(m => !existingIds.has(m._id));
              return uniqueNew.length > 0 ? [...uniqueNew, ...prev] : prev;
            });
          }
        }
      } catch (error) {
        console.error('Error polling messages:', error);
      }
    }, 3000);
  };

  const handleCall = () => {
    const phoneNumber = '+923071113330';
    Linking.openURL(`tel:${phoneNumber}`).catch((err) => {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Unable to make phone call',
        position: 'top',
        visibilityTime: 2500,
      });
    });
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !conversation || sending) return;

    const textToSend = messageText.trim();
    setMessageText('');
    setSending(true);

    // Animate send button
    Animated.sequence([
      Animated.timing(sendButtonScale, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(sendButtonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

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
    // Handle both ObjectId string and populated senderId object
    const senderId = typeof item.senderId === 'object' ? item.senderId._id : item.senderId;
    const isMyMessage = senderId === user?._id || senderId === user?.id;
    const isSystemMessage = item.senderRole === 'system' || item.messageType === 'system';
    
    // Format date
    const messageDate = new Date(item.createdAt);
    const now = new Date();
    const isToday = messageDate.toDateString() === now.toDateString();
    const timeString = isToday
      ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' }) + ' ' +
        messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    if (isSystemMessage) {
      return (
        <View style={styles.systemMessageContainer}>
          <Text style={styles.systemMessageText}>{item.content}</Text>
        </View>
      );
    }
    
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
            {timeString}
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
          <TouchableOpacity
            style={styles.callButton}
            onPress={handleCall}
            activeOpacity={0.7}
          >
            <Ionicons name="call" size={20} color={colors.white} />
          </TouchableOpacity>
          <View style={[
            styles.onlineIndicator,
            !adminAvailable && styles.offlineIndicator
          ]} />
        </View>
      </View>

      {/* Messages List */}
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color={TEXT_SECONDARY} />
          <Text style={styles.emptyText}>No messages yet</Text>
          <Text style={styles.emptySubtext}>Start the conversation by sending a message</Text>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item._id}
          inverted
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            // Auto-scroll to bottom (top in inverted list) when content changes
            if (messages.length > 0) {
              flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
            }
          }}
        />
      )}

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <View style={styles.inputContainerInner}>
              <TextInput
                style={[
                  styles.input,
                  inputFocused && styles.inputFocused,
                ]}
                placeholder="Type your message..."
                placeholderTextColor={TEXT_SECONDARY}
                value={messageText}
                onChangeText={setMessageText}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                multiline
                maxLength={1000}
                editable={!sending}
                returnKeyType="send"
                blurOnSubmit={false}
                onSubmitEditing={handleSendMessage}
              />
              {messageText.length > 0 && messageText.length > 800 && (
                <View style={styles.charCountContainer}>
                  <Text style={[
                    styles.charCount,
                    messageText.length > 950 && styles.charCountWarning
                  ]}>
                    {messageText.length}/1000
                  </Text>
                </View>
              )}
            </View>
            <Animated.View style={{ transform: [{ scale: sendButtonScale }] }}>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!messageText.trim() || sending) && styles.sendButtonDisabled,
                ]}
                onPress={handleSendMessage}
                disabled={!messageText.trim() || sending}
                activeOpacity={0.8}
              >
                {sending ? (
                  <ActivityIndicator size="small" color={colors.white} />
                ) : messageText.trim() ? (
                  <Ionicons name="send" size={20} color={colors.white} />
                ) : (
                  <Ionicons name="add-circle-outline" size={20} color={TEXT_SECONDARY} />
                )}
              </TouchableOpacity>
            </Animated.View>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  callButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
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
    flexGrow: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: TEXT_PRIMARY,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptySubtext: {
    fontSize: 14,
    color: TEXT_SECONDARY,
    textAlign: 'center',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  systemMessageText: {
    fontSize: 12,
    color: TEXT_SECONDARY,
    fontStyle: 'italic',
    backgroundColor: GRAY_LIGHT,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    textAlign: 'center',
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
    paddingVertical: spacing.sm + 2,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    minWidth: 60,
  },
  myMessageBubble: {
    backgroundColor: RED_PRIMARY,
    borderBottomRightRadius: 4,
  },
  theirMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: GRAY_BORDER,
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '400',
  },
  myMessageText: {
    color: colors.white,
  },
  theirMessageText: {
    color: TEXT_PRIMARY,
  },
  messageTime: {
    fontSize: 10,
    marginTop: 6,
    fontWeight: '400',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.75)',
    textAlign: 'right',
  },
  theirMessageTime: {
    color: TEXT_SECONDARY,
    textAlign: 'left',
  },
  inputContainer: {
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: GRAY_BORDER,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: Platform.OS === 'ios' ? spacing.md : spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: spacing.sm,
  },
  inputContainerInner: {
    flex: 1,
    position: 'relative',
  },
  input: {
    backgroundColor: GRAY_LIGHT,
    borderRadius: 24,
    paddingHorizontal: spacing.md + 4,
    paddingVertical: spacing.sm + 2,
    paddingTop: spacing.sm + 4,
    paddingBottom: spacing.sm + 4,
    fontSize: 15,
    color: TEXT_PRIMARY,
    maxHeight: 120,
    minHeight: 44,
    textAlignVertical: 'center',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: RED_PRIMARY + '40',
    backgroundColor: colors.white,
    shadowColor: RED_PRIMARY,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  charCountContainer: {
    position: 'absolute',
    bottom: 6,
    right: spacing.sm + 2,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: GRAY_BORDER,
  },
  charCount: {
    fontSize: 10,
    color: TEXT_SECONDARY,
    fontWeight: '500',
  },
  charCountWarning: {
    color: RED_PRIMARY,
    fontWeight: '600',
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
    elevation: 4,
  },
  sendButtonDisabled: {
    backgroundColor: GRAY_LIGHT,
    shadowOpacity: 0,
    elevation: 0,
  },
});
