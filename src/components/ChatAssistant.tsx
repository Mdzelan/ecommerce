import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import { MessageCircle, X, Send, Loader2, Bot, User, Minimize2, Maximize2, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { collection, getDocs, limit, query, doc, getDoc, setDoc, arrayUnion, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';
import Markdown from 'react-markdown';
import { useAuth } from '../context/AuthContext';

interface ChatMessage {
  role: 'user' | 'model' | 'admin';
  text: string;
  timestamp?: any;
}

const ChatAssistant: React.FC = () => {
  const { user, profile } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [chatId, setChatId] = useState<string | null>(sessionStorage.getItem('activeChatId'));
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSettingsAndProducts = async () => {
      try {
        // Fetch products for context
        const q = query(collection(db, 'products'), limit(10));
        const snap = await getDocs(q);
        setProducts(snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));

        // Fetch auto-message from settings
        const settingsRef = doc(db, 'settings', 'contact');
        const settingsSnap = await getDoc(settingsRef);
        let initialMessage = 'Hello! I am your Aurelius Assistant. How can I help you today?';
        
        if (settingsSnap.exists()) {
          const data = settingsSnap.data();
          if (data.chatAutoMessage) {
            initialMessage = data.chatAutoMessage;
          }
        }
        
        setMessages([{ role: 'model', text: initialMessage }]);
      } catch (error) {
        console.error('Error fetching chat context:', error);
        setMessages([{ role: 'model', text: 'Hello! I am your Aurelius Assistant. How can I help you today?' }]);
      }
    };
    fetchSettingsAndProducts();
  }, []);

  // Real-time listener for admin replies
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = onSnapshot(doc(db, 'chats', chatId), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        if (data.messages) {
          // Merge local messages with Firestore messages to ensure we don't lose the initial greeting
          // if it wasn't saved yet, or just use Firestore as source of truth if it exists
          setMessages(data.messages);
        }
      }
    });

    return () => unsubscribe();
  }, [chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const saveMessageToFirestore = async (message: ChatMessage, isFirstMessage: boolean = false) => {
    let currentChatId = chatId;
    if (!currentChatId) {
      currentChatId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      setChatId(currentChatId);
      sessionStorage.setItem('activeChatId', currentChatId);
    }

    const chatRef = doc(db, 'chats', currentChatId);
    try {
      const messagesToSave = isFirstMessage 
        ? [...messages, message] 
        : [message];

      await setDoc(chatRef, {
        userId: user?.uid || 'anonymous',
        userEmail: user?.email || 'anonymous',
        userName: profile?.displayName || 'Guest',
        lastMessageAt: serverTimestamp(),
        messages: arrayUnion(...messagesToSave.map(m => ({
          ...m,
          timestamp: m.timestamp || new Date().toISOString()
        })))
      }, { merge: true });
    } catch (error) {
      console.error('Error saving message to Firestore:', error);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    const isFirst = !chatId;
    setInput('');
    const newUserMsg: ChatMessage = { role: 'user', text: userMessage, timestamp: new Date().toISOString() };
    
    // Update local state immediately for responsiveness
    setMessages(prev => [...prev, newUserMsg]);
    setIsLoading(true);

    // Save user message to Firestore
    await saveMessageToFirestore(newUserMsg, isFirst);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const productContext = products.map(p => 
        `- ${p.name}: ${p.description} ($${p.price})`
      ).join('\n');

      const systemInstruction = `
        You are an AI Assistant for "Aurelius", a luxury e-commerce store.
        Your tone is professional, helpful, and sophisticated.
        Here is some information about our top products:
        ${productContext}
        
        Answer customer questions about products, shipping (free), and our brand.
        If you don't know something, be honest and offer to connect them with human support.
        Keep responses concise and elegant.
      `;

      const chat = ai.chats.create({
        model: "gemini-3-flash-preview",
        config: {
          systemInstruction,
        },
        history: messages.map(m => ({
          role: m.role === 'admin' ? 'model' : m.role, // Treat admin as model for AI context
          parts: [{ text: m.text }]
        }))
      });

      const response = await chat.sendMessage({ message: userMessage });
      const botText = response.text || "I'm sorry, I couldn't process that. Please try again.";
      
      const newBotMsg: ChatMessage = { role: 'model', text: botText, timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, newBotMsg]);
      
      // Save bot message to Firestore
      await saveMessageToFirestore(newBotMsg);
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMsg: ChatMessage = { role: 'model', text: "I'm having trouble connecting right now. Please try again later.", timestamp: new Date().toISOString() };
      setMessages(prev => [...prev, errorMsg]);
      await saveMessageToFirestore(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-8 right-8 z-[100]">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          >
            <MessageCircle size={28} />
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 100, opacity: 0, scale: 0.9 }}
            className={`bg-white rounded-3xl shadow-2xl border border-zinc-100 overflow-hidden flex flex-col transition-all duration-300 ${
              isMinimized ? 'h-20 w-80' : 'h-[600px] w-[400px]'
            }`}
          >
            {/* Header */}
            <div className="bg-black p-6 flex justify-between items-center text-white">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Aurelius Assistant</h3>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Online</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Messages */}
                <div 
                  ref={scrollRef}
                  className="flex-grow overflow-y-auto p-6 space-y-6 custom-scrollbar bg-zinc-50"
                >
                  {messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-3 max-w-[85%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                          msg.role === 'user' ? 'bg-zinc-200 text-zinc-600' : 
                          msg.role === 'admin' ? 'bg-zinc-800 text-white' : 'bg-black text-white'
                        }`}>
                          {msg.role === 'user' ? <User size={14} /> : 
                           msg.role === 'admin' ? <ShieldCheck size={14} /> : <Bot size={14} />}
                        </div>
                        <div className={`p-4 rounded-2xl text-sm leading-relaxed ${
                          msg.role === 'user' 
                            ? 'bg-black text-white rounded-tr-none shadow-lg' 
                            : msg.role === 'admin'
                            ? 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700 shadow-sm'
                            : 'bg-white text-zinc-800 rounded-tl-none border border-zinc-100 shadow-sm'
                        }`}>
                          {msg.role === 'admin' && (
                            <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-1">Admin Reply</p>
                          )}
                          <div className="markdown-body">
                            <Markdown>{msg.text}</Markdown>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center">
                          <Bot size={14} />
                        </div>
                        <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-zinc-100 shadow-sm">
                          <Loader2 size={16} className="animate-spin text-zinc-400" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-6 bg-white border-t border-zinc-100">
                  <div className="relative">
                    <input
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask me anything..."
                      className="w-full bg-zinc-50 border-none rounded-2xl py-4 pl-6 pr-14 text-sm focus:ring-2 focus:ring-black transition-all"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:scale-100"
                    >
                      <Send size={18} />
                    </button>
                  </div>
                  <p className="mt-3 text-[10px] text-zinc-400 font-bold uppercase tracking-widest text-center">
                    Powered by Aurelius AI
                  </p>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChatAssistant;
