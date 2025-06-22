import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
  Dimensions,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedKeyboard,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
  isLoading?: boolean;
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

type Theme = 'dark' | 'wellness';

// Number of fake messages to exclude from API calls
const FAKE_MESSAGES_COUNT = 10000;

// Generate fake messages for performance testing
const generateFakeMessages = (): Message[] => {
  const fakeMessages: Message[] = [];
  const userMessages = [
    "How can I improve my fitness?",
    "What should I eat for breakfast?",
    "I'm feeling stressed today",
    "Can you help me with a workout plan?",
    "How many calories should I eat?",
    "I had trouble sleeping last night",
    "What's a good stretching routine?",
    "I want to lose weight",
    "How often should I exercise?",
    "I need motivation to work out",
    "What are some healthy snacks?",
    "How do I stay consistent with my goals?",
    "I'm having trouble with my diet",
    "Can you recommend some yoga poses?",
    "How much water should I drink daily?",
    "I feel overwhelmed with my health goals",
    "What's the best time to work out?",
    "How do I track my progress?",
    "I need help with meal planning",
    "What supplements should I take?"
  ];
  
  const aiMessages = [
    "Great question! Let me help you with that.",
    "I'd recommend starting with small, manageable changes to build sustainable habits.",
    "That's completely normal, and I'm here to support you through this journey.",
    "Here's a personalized approach based on your current fitness level and goals.",
    "The key is finding what works for your lifestyle and preferences.",
    "Let's break this down into actionable steps you can implement today.",
    "I understand that can be challenging. Here's what I suggest...",
    "Consistency is more important than perfection. Let's focus on progress, not perfection.",
    "That's a wonderful goal! Here's how we can work towards it together.",
    "Remember, every small step counts towards your bigger health objectives.",
    "I'm glad you're taking this step towards better health.",
    "Let's create a plan that feels sustainable and enjoyable for you.",
    "Your wellness journey is unique, and I'm here to guide you every step of the way.",
    "That's a common concern, and there are several strategies we can explore.",
    "Building healthy habits takes time, so be patient and kind to yourself.",
    "I appreciate you sharing that with me. Let's work on a solution together.",
    "Your health and wellbeing are worth investing in, and you're making great choices.",
    "Let's focus on creating positive changes that will support your long-term success.",
    "I'm here to help you navigate these challenges with evidence-based guidance.",
    "Remember, progress isn't always linear, and that's perfectly okay."
  ];

  fakeMessages.push({ id: 1, text: "Hello! I'm your AI wellness companion. How can I help you today?", isUser: false });
  
  for (let i = 2; i <= 10000; i++) {
    const isUser = i % 2 === 0;
    const messageArray = isUser ? userMessages : aiMessages;
    const randomMessage = messageArray[Math.floor(Math.random() * messageArray.length)];
    
    fakeMessages.push({
      id: i,
      text: randomMessage,
      isUser: isUser
    });
  }
  
  return fakeMessages;
};

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>(generateFakeMessages());
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const [windowDimensions, setWindowDimensions] = useState(Dimensions.get('window'));
  const flashListRef = useRef<FlashList<Message>>(null);
  const inputRef = useRef<TextInput>(null);
  const typingOpacity = useSharedValue(0.3);
  const menuTranslateX = useSharedValue(300); // Start off-screen to the right
  const menuOpacity = useSharedValue(0);
  const keyboard = useAnimatedKeyboard();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    // Animate typing indicator with Reanimated
    if (isLoading) {
      typingOpacity.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(0.3, { duration: 500 })
        ),
        -1,
        false
      );
    } else {
      typingOpacity.value = withTiming(0.3, { duration: 200 });
    }
  }, [isLoading]);

  useEffect(() => {
    // Animate menu slide from right
    if (isMenuOpen) {
      setIsMenuVisible(true); // Show Modal first
      menuOpacity.value = withTiming(1, { duration: 300 });
      menuTranslateX.value = withTiming(0, { duration: 300 });
    } else {
      // Animate out, then hide Modal
      menuOpacity.value = withTiming(0, { duration: 300 });
      menuTranslateX.value = withTiming(300, { duration: 300 });
      
      // Hide Modal after animation completes
      setTimeout(() => {
        setIsMenuVisible(false);
      }, 300);
    }
  }, [isMenuOpen]);

  useEffect(() => {
    // Listen for window dimension changes
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setWindowDimensions(window);
    });

    return () => subscription?.remove();
  }, []);

  const callChatAPI = async (conversationHistory: Message[]): Promise<string> => {
    try {
      // Convert messages to API format, excluding fake messages
      const apiMessages: ApiMessage[] = conversationHistory
        .slice(FAKE_MESSAGES_COUNT) // Skip all fake messages, only send real conversation
        .map(msg => ({
          role: msg.isUser ? 'user' : 'assistant',
          content: msg.text
        }));

      const response = await fetch('https://mjagent-490766333568.us-central1.run.app/chat/completion', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer invalid-token',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: apiMessages
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.content || 'Sorry, I encountered an error processing your request.';
    } catch (error) {
      console.error('API call failed:', error);
      return 'Sorry, I\'m having trouble connecting right now. Please try again later.';
    }
  };

  const handleSubmit = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      isUser: true
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    
    // Handle iOS autocorrect race condition without losing keyboard focus
    setInputValue('');
    setTimeout(() => {
      setInputValue(''); // Second clear to catch late autocorrect
    }, 100);
    
    // Add loading indicator as a message to avoid FlashList data recreation
    const loadingMessage: Message = {
      id: updatedMessages.length + 1,
      text: '',
      isUser: false,
      isLoading: true
    };
    setMessages([...updatedMessages, loadingMessage]);

    // Scroll to position user's message at top of window
    setTimeout(() => {
      const userMessageIndex = updatedMessages.length - 1;
      flashListRef.current?.scrollToIndex({ 
        index: userMessageIndex, 
        animated: true,
        viewPosition: 0 // Position at top of view
      });
    }, 100);

    try {
      const aiResponse = await callChatAPI(updatedMessages);
      
      // Remove loading message and add AI response
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        const aiMessage: Message = {
          id: withoutLoading.length + 1,
          text: aiResponse,
          isUser: false
        };
        return [...withoutLoading, aiMessage];
      });
    } catch (error) {
      console.error('Failed to get AI response:', error);
      // Remove loading message and add error message
      setMessages(prev => {
        const withoutLoading = prev.filter(msg => !msg.isLoading);
        const errorMessage: Message = {
          id: withoutLoading.length + 1,
          text: 'Sorry, I encountered an error. Please try again.',
          isUser: false
        };
        return [...withoutLoading, errorMessage];
      });
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'wellness' : 'dark');
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  // Calculate bottom padding to prevent over-scrolling  
  const topBarHeight = 60;
  const inputAreaHeight = 80;
  const scrollViewHeight = windowDimensions.height - topBarHeight - inputAreaHeight - insets.top - insets.bottom;
  const bottomPadding = scrollViewHeight - 24; // 100% of scroll view height minus 24px
  
  const styles = createStyles(theme, bottomPadding);

  // Animated styles for keyboard
  const messagesAnimatedStyle = useAnimatedStyle(() => {
    return {
      marginBottom: keyboard.height.value,
    };
  });

  const inputAnimatedStyle = useAnimatedStyle(() => {
    // Calculate smooth progress: 0 when keyboard down, 1 when fully up
    const keyboardProgress = keyboard.height.value > 0 ? Math.min(keyboard.height.value / 300, 1) : 0;
    
    return {
      // Move with keyboard + additional offset for tighter positioning
      transform: [{ translateY: -keyboard.height.value + (keyboardProgress * 12) }],
      // Reduce padding smoothly when keyboard appears
      paddingBottom: Math.max(insets.bottom, 8) * (1 - keyboardProgress),
      // Add negative margin to push closer to keyboard (discovered during testing)
      marginBottom: keyboardProgress * -12,
    };
  });

  const typingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: typingOpacity.value,
    };
  });

  const menuAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: menuTranslateX.value }],
      opacity: menuOpacity.value,
    };
  });

  const backdropAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: menuOpacity.value,
    };
  });

  const TypingIndicator = () => (
    <View style={styles.typingContainer}>
      <Animated.View style={[styles.typingDot, typingAnimatedStyle]} />
      <Animated.View style={[styles.typingDot, typingAnimatedStyle]} />
      <Animated.View style={[styles.typingDot, typingAnimatedStyle]} />
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar 
        barStyle={theme === 'dark' ? 'light-content' : 'dark-content'} 
        backgroundColor={theme === 'dark' ? '#1a1a1a' : '#FDFBF0'}
      />
      
      {/* Top Bar */}
      <View style={styles.topBar}>
        <Text style={styles.logo}>fit by evo</Text>
        <TouchableOpacity onPress={toggleMenu} style={styles.menuButton}>
          <Text style={styles.menuButtonText}>☰</Text>
        </TouchableOpacity>
      </View>

      {/* Menu Modal */}
      <Modal
        visible={isMenuVisible}
        transparent={true}
        animationType="none"
        onRequestClose={() => setIsMenuOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalBackdrop, backdropAnimatedStyle]}>
            <TouchableOpacity 
              style={{ flex: 1 }} 
              onPress={() => setIsMenuOpen(false)}
            />
          </Animated.View>
          <Animated.View style={[styles.menuContainer, menuAnimatedStyle]}>
            <TouchableOpacity style={styles.menuItem} onPress={() => { toggleTheme(); setIsMenuOpen(false); }}>
              <Text style={styles.menuItemText}>
                {theme === 'dark' ? '🌞 Light Mode' : '🌙 Dark Mode'}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </Modal>

            <View style={styles.chatContent}>
        {/* Messages */}
        <Animated.View 
          style={[
            {
              flex: 1,
              marginBottom: 0,
            },
            messagesAnimatedStyle
          ]}
        >
          <FlashList
            key={theme} // Force re-render when theme changes
            ref={flashListRef}
            data={messages}
            renderItem={({ item }) => {
              if (item.isLoading) {
                return (
                  <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
                    <TypingIndicator />
                  </View>
                );
              }
              
              return (
                <View
                  style={[
                    styles.messageBubble,
                    item.isUser ? styles.userBubble : styles.aiBubble
                  ]}
                >
                  <Text style={styles.messageText}>{item.text}</Text>
                </View>
              );
            }}
            estimatedItemSize={60}
            initialScrollIndex={messages.length - 1}
            showsVerticalScrollIndicator={true}
            contentContainerStyle={styles.messagesContent}
            style={styles.messagesContainer}
          />
        </Animated.View>

        {/* Input Container with smooth keyboard animation */}
        <Animated.View 
          style={[
            styles.inputContainer,
            inputAnimatedStyle,
            { marginTop: 0 }
          ]}
        >
                      <TouchableOpacity 
              style={styles.inputWrapper}
              onPress={() => inputRef.current?.focus()}
              activeOpacity={1}
            >
              <TextInput
                ref={inputRef}
                style={styles.textInput}
                value={inputValue}
                onChangeText={setInputValue}
                placeholder="Ask"
                placeholderTextColor={theme === 'dark' ? '#888' : '#999'}
                multiline
                editable={!isLoading}
                returnKeyType="default"
                keyboardAppearance={theme === 'dark' ? 'dark' : 'light'}
              />
              <View style={styles.sendButtonContainer}>
                {inputValue.trim() && (
                  <TouchableOpacity 
                    onPress={handleSubmit} 
                    style={styles.sendButton}
                    disabled={isLoading}
                  >
                    <Text style={styles.sendButtonText}>↑</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const createStyles = (theme: Theme, bottomPadding: number = 0) => {
  const isDark = theme === 'dark';
  
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#1a1a1a' : '#FDFBF0',
    },
    topBar: {
      height: 60,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 16,
      backgroundColor: isDark ? '#1a1a1a' : '#FDFBF0',
    },
    logo: {
      fontSize: 20,
      fontWeight: '300',
      letterSpacing: 1,
      color: isDark ? '#ffffff' : '#2c3e50',
      fontFamily: 'RobotoMono_300Light',
    },
    menuButton: {
      position: 'absolute',
      right: 16,
      padding: 8,
    },
    menuButtonText: {
      fontSize: 24,
      color: isDark ? '#ffffff' : '#2c3e50',
      opacity: 0.9,
    },
    modalOverlay: {
      flex: 1,
      position: 'relative',
    },
    modalBackdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    menuContainer: {
      position: 'absolute',
      top: 0,
      right: 0,
      bottom: 0,
      width: 250,
      backgroundColor: isDark ? '#1a1a1a' : '#FDFBF0',
      paddingTop: 60,
      paddingHorizontal: 32,
      ...Platform.select({
        web: {
          boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.1)',
        },
        default: {
          shadowColor: '#000',
          shadowOffset: { width: -2, height: 0 },
          shadowOpacity: 0.1,
          shadowRadius: 10,
          elevation: 5,
        },
      }),
    },
    menuItem: {
      paddingVertical: 16,
    },
    menuItemText: {
      fontSize: 18,
      color: isDark ? '#ffffff' : '#2c3e50',
      opacity: 0.9,
    },
    chatContent: {
      flex: 1,
      maxWidth: 800,
      alignSelf: 'center',
      width: '100%',
    },
    messagesContainer: {
      flex: 1,
    },
    messagesContent: {
      paddingBottom: Math.max(8, bottomPadding),
    },
    messageBubble: {
      maxWidth: '80%',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      marginVertical: 4,
      marginHorizontal: 16,
    },
    aiBubble: {
      alignSelf: 'flex-start',
      backgroundColor: isDark ? '#2d2d2d' : '#F5F3E9',
      marginRight: '20%',
    },
    userBubble: {
      alignSelf: 'flex-end',
      backgroundColor: isDark ? '#4a4a4a' : '#EBE9E0',
      marginLeft: '20%',
    },
    loadingBubble: {
      opacity: 0.7,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
      color: isDark ? '#ffffff' : '#2c3e50',
      fontWeight: '300',
      fontFamily: 'RobotoMono_300Light',
    },
    typingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    typingDot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: isDark ? '#ffffff' : '#2c3e50',
    },
    inputContainer: {
      paddingHorizontal: 16,
      paddingTop: 0,
      backgroundColor: isDark ? '#1a1a1a' : '#FDFBF0',
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? '#2d2d2d' : '#F5F3E9',
      borderRadius: 28,
      paddingHorizontal: 16,
      paddingVertical: 12,
      minHeight: 52,
    },
    textInput: {
      flex: 1,
      fontSize: 18,
      color: isDark ? '#ffffff' : '#2c3e50',
      fontFamily: 'RobotoMono_300Light',
      fontWeight: '300',
      textAlignVertical: 'center',
      paddingTop: 0,
      paddingBottom: 0,
      paddingRight: 46, // Reserve space for blue button
      includeFontPadding: false,
      textAlign: 'left',
      ...Platform.select({
        web: {
          outlineWidth: 0, // Remove blue focus border on web
          outlineStyle: 'none',
          borderWidth: 0, // Remove border
          height: '24px', // Fixed single line height
          lineHeight: '24px',
          paddingTop: '2px', // Fine-tune vertical centering
          paddingBottom: '2px',
        } as any, // Web-specific styles
      }),
    },
    sendButtonContainer: {
      position: 'absolute',
      right: 10,
      bottom: 7,
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButton: {
      backgroundColor: '#007AFF', // iMessage blue
      borderRadius: 19,
      width: 38,
      height: 38,
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: 2,
    },
    sendButtonText: {
      fontSize: 24,
      color: '#ffffff',
      fontWeight: '600',
      lineHeight: 24,
    },
  });
}; 