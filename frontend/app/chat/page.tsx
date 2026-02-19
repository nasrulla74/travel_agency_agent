'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { chat } from '@/lib/api';

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
}

export default function ChatPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState(() => 
    `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const res = await chat.send(input, conversationId);
      const aiMessage: Message = {
        id: `msg_${Date.now()}_ai`,
        role: 'assistant',
        content: res.data.response,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      console.error('Chat error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-72 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="text-2xl font-bold text-primary">
            TravelMate
          </Link>
        </div>
        
        <div className="p-4">
          <button
            onClick={() => setConversationId(`conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`)}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition"
          >
            New Chat
          </button>
        </div>

        <div className="flex-1 p-4 overflow-y-auto">
          <div className="text-sm text-gray-500 mb-2">Quick Links</div>
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Dashboard
            </Link>
            <Link
              href="/dashboard/bookings"
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              My Bookings
            </Link>
            {user.role === 'admin' && (
              <Link
                href="/dashboard/escalations"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Escalations
              </Link>
            )}
            {user.role === 'admin' && (
              <Link
                href="/dashboard/properties"
                className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
              >
                Properties
              </Link>
            )}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold">
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{user.full_name}</div>
              <div className="text-xs text-gray-500 capitalize">{user.role.replace('_', ' ')}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full text-gray-600 hover:text-gray-900 text-sm"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold">AI Travel Assistant</h1>
          <p className="text-sm text-gray-500">Ask me about resorts, destinations, or make a booking</p>
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🏖️</div>
              <h2 className="text-xl font-semibold mb-2">Welcome to TravelMate!</h2>
              <p className="text-gray-600 mb-4">
                I&apos;m your AI travel assistant. Tell me about your dream vacation!
              </p>
              <div className="text-sm text-gray-500 space-y-2">
                <p>Try asking things like:</p>
                <p className="text-primary">&quot;Find beach resorts in Bali&quot;</p>
                <p className="text-primary">&quot;What are the best family hotels?&quot;</p>
                <p className="text-primary">&quot;I want to book a room for next weekend&quot;</p>
              </div>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                  message.role === 'user'
                    ? 'bg-primary text-white'
                    : message.role === 'system'
                    ? 'bg-yellow-50 text-yellow-800'
                    : 'bg-white border border-gray-200'
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
                <div className={`text-xs mt-1 ${
                  message.role === 'user' ? 'text-white/70' : 'text-gray-400'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 px-4 py-3 rounded-2xl">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        <div className="p-4 bg-white border-t border-gray-200">
          <div className="flex gap-2 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="bg-primary text-white px-6 py-3 rounded-xl hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
