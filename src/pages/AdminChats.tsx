import React, { useEffect, useState, useRef } from 'react';
import { collection, getDocs, query, orderBy, doc, deleteDoc, setDoc, arrayUnion, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { toast } from 'sonner';
import { MessageSquare, Trash2, User, Clock, ChevronRight, Search, ArrowLeft, Send, ShieldCheck, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import Markdown from 'react-markdown';

interface ChatSession {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  lastMessageAt: any;
  messages: {
    role: 'user' | 'model' | 'admin';
    text: string;
    timestamp: string;
  }[];
}

const AdminChats: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<ChatSession | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const q = query(collection(db, 'chats'), orderBy('lastMessageAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snap) => {
      setSessions(snap.docs.map(d => ({ id: d.id, ...d.data() } as ChatSession)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'chats');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedSession]);

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSession || !reply.trim() || sending) return;

    setSending(true);
    const chatRef = doc(db, 'chats', selectedSession.id);
    const newReply = {
      role: 'admin',
      text: reply.trim(),
      timestamp: new Date().toISOString()
    };

    try {
      await setDoc(chatRef, {
        lastMessageAt: serverTimestamp(),
        messages: arrayUnion(newReply)
      }, { merge: true });
      setReply('');
      toast.success('Reply sent');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `chats/${selectedSession.id}`);
      toast.error('Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat history?')) return;
    
    try {
      await deleteDoc(doc(db, 'chats', id));
      if (selectedSession?.id === id) setSelectedSession(null);
      toast.success('Chat deleted');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `chats/${id}`);
    }
  };

  const filteredSessions = sessions.filter(s => 
    s.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.userName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentSession = sessions.find(s => s.id === selectedSession?.id) || selectedSession;

  if (loading) return <div className="h-screen flex items-center justify-center bg-zinc-50"><div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div></div>;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-4">
          <Link to="/admin" className="p-2 hover:bg-zinc-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-4xl font-bold tracking-tight">AI Chat Logs</h1>
            <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs mt-2">Monitor AI interactions and customer inquiries</p>
          </div>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
          <input
            type="text"
            placeholder="Search by user or email..."
            className="minimal-input w-full pl-12 py-4"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Session List */}
        <div className="lg:col-span-1 space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
          {filteredSessions.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-zinc-100">
              <MessageSquare size={48} className="mx-auto text-zinc-200 mb-4" />
              <p className="text-zinc-400 font-bold uppercase tracking-widest text-xs">No chats found</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <motion.div
                key={session.id}
                layoutId={session.id}
                onClick={() => setSelectedSession(session)}
                className={`p-6 rounded-3xl border cursor-pointer transition-all ${
                  currentSession?.id === session.id 
                    ? 'border-black bg-zinc-50 shadow-lg' 
                    : 'border-zinc-100 bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center">
                      <User size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{session.userName}</h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{session.userEmail}</p>
                    </div>
                  </div>
                  <button 
                    onClick={(e) => handleDelete(session.id, e)}
                    className="p-2 text-zinc-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-zinc-400">
                    <Clock size={12} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {session.lastMessageAt?.toDate ? session.lastMessageAt.toDate().toLocaleString() : 'Recent'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-black font-bold text-[10px] uppercase tracking-widest">
                    <span>{session.messages.length} msgs</span>
                    <ChevronRight size={12} />
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Chat Detail */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {currentSession ? (
              <motion.div
                key={currentSession.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="minimal-card bg-white h-[700px] flex flex-col"
              >
                <div className="p-8 border-b border-zinc-50 flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">{currentSession.userName}</h3>
                    <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">{currentSession.userEmail}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Session ID</p>
                    <p className="text-xs font-mono text-zinc-300">#{currentSession.id.substring(0, 12)}</p>
                  </div>
                </div>

                <div className="flex-grow overflow-y-auto p-8 space-y-8 bg-zinc-50/50 custom-scrollbar" ref={scrollRef}>
                  {currentSession.messages.map((msg, idx) => (
                    <div 
                      key={idx} 
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`flex items-start space-x-4 max-w-[80%] ${msg.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                          msg.role === 'user' ? 'bg-zinc-200 text-zinc-600' : 
                          msg.role === 'admin' ? 'bg-zinc-800 text-white' : 'bg-black text-white'
                        }`}>
                          {msg.role === 'user' ? <User size={18} /> : 
                           msg.role === 'admin' ? <ShieldCheck size={18} /> : <MessageSquare size={18} />}
                        </div>
                        <div className="space-y-2">
                          <div className={`p-6 rounded-3xl text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                              ? 'bg-black text-white rounded-tr-none' 
                              : msg.role === 'admin'
                              ? 'bg-zinc-800 text-white rounded-tl-none border border-zinc-700'
                              : 'bg-white text-zinc-800 rounded-tl-none border border-zinc-100'
                          }`}>
                            {msg.role === 'admin' && (
                              <p className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 mb-2">Admin Reply</p>
                            )}
                            <div className="markdown-body">
                              <Markdown>{msg.text}</Markdown>
                            </div>
                          </div>
                          <p className={`text-[9px] font-bold uppercase tracking-widest text-zinc-400 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                            {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString() : 'Just now'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <form onSubmit={handleReply} className="p-8 border-t border-zinc-50 bg-white">
                  <div className="relative">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder="Type your reply here..."
                      className="minimal-input w-full pr-14 py-4 h-20 resize-none"
                    />
                    <button
                      type="submit"
                      disabled={!reply.trim() || sending}
                      className="absolute right-4 bottom-4 w-10 h-10 bg-black text-white rounded-xl flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50"
                    >
                      {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                    </button>
                  </div>
                </form>
              </motion.div>
            ) : (
              <div className="minimal-card bg-white h-[700px] flex flex-col items-center justify-center text-center space-y-6">
                <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center">
                  <MessageSquare size={48} className="text-zinc-200" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight">Select a conversation</h3>
                  <p className="text-zinc-400 font-bold uppercase tracking-widest text-[10px] mt-2">Choose a chat from the list to view full history and reply</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminChats;
