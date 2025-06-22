import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  StatusBar,
  Modal,
} from 'react-native';
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
}

interface ApiMessage {
  role: 'user' | 'assistant';
  content: string;
}

type Theme = 'dark' | 'wellness';

export const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: "Hello! I'm your AI wellness companion. How can I help you today?", isUser: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [theme, setTheme] = useState<Theme>('dark');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMenuVisible, setIsMenuVisible] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
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

  const callChatAPI = async (conversationHistory: Message[]): Promise<string> => {
    try {
      // Convert messages to API format, excluding the initial greeting
      const apiMessages: ApiMessage[] = conversationHistory
        .slice(1) // Skip the initial greeting message
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
    setInputValue('');
    setIsLoading(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const aiResponse = await callChatAPI(updatedMessages);
      
      const aiMessage: Message = {
        id: updatedMessages.length + 1,
        text: aiResponse,
        isUser: false
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage: Message = {
        id: updatedMessages.length + 1,
        text: 'Sorry, I encountered an error. Please try again.',
        isUser: false
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'wellness' : 'dark');
  };

  const toggleMenu = () => {
    setIsMenuOpen(prev => !prev);
  };

  const styles = createStyles(theme);

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
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesContainer}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {messages.map((message) => (
              <View
                key={message.id}
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userBubble : styles.aiBubble
                ]}
              >
                <Text style={styles.messageText}>{message.text}</Text>
              </View>
            ))}
            {isLoading && (
              <View style={[styles.messageBubble, styles.aiBubble, styles.loadingBubble]}>
                <TypingIndicator />
              </View>
            )}
          </ScrollView>
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

const createStyles = (theme: Theme) => {
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
    },
    messagesContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },
    messagesContent: {
      paddingBottom: 8,
    },
    messageBubble: {
      maxWidth: '80%',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 16,
      marginVertical: 4,
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
      maxWidth: 600, // Cap width on larger screens
      alignSelf: 'center',
      width: '100%',
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