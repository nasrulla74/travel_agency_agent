'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { messages } from '@/lib/api';

export default function EscalationsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEscalation, setSelectedEscalation] = useState<any>(null);
  const [response, setResponse] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadEscalations();
    }
  }, [user]);

  const loadEscalations = async () => {
    try {
      const res = await messages.getEscalations();
      setEscalations(res.data);
    } catch (err) {
      console.error('Error loading escalations:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedEscalation || !response.trim()) return;
    try {
      await messages.respondEscalation(selectedEscalation.id, {
        admin_response: response,
        status: 'resolved',
      });
      setSelectedEscalation(null);
      setResponse('');
      loadEscalations();
    } catch (err) {
      console.error('Error responding to escalation:', err);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (user.role !== 'admin') return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="text-2xl font-bold text-primary">TravelMate</Link>
        </div>
        <div className="p-4">
          <nav className="space-y-1">
            <Link href="/dashboard" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Dashboard</Link>
            <Link href="/chat" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Chat</Link>
            <Link href="/dashboard/bookings" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Bookings</Link>
            <Link href="/dashboard/properties" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Properties</Link>
            <Link href="/dashboard/escalations" className="block px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">Escalations</Link>
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button onClick={logout} className="w-full text-gray-600 hover:text-gray-900 text-sm">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Escalations</h1>

          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : escalations.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl">
              No escalations pending. Great job!
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="divide-y divide-gray-100">
                {escalations.map((escalation) => (
                  <div key={escalation.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{escalation.user_id?.slice(0, 8) || 'Unknown'}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            escalation.escalation_status === 'pending' 
                              ? 'bg-yellow-100 text-yellow-700' 
                              : 'bg-green-100 text-green-700'
                          }`}>
                            {escalation.escalation_status}
                          </span>
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(escalation.created_at).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="text-sm font-medium text-gray-500 mb-2">User Message:</div>
                      <div className="text-gray-700">{escalation.content}</div>
                    </div>
                    {escalation.admin_response && (
                      <div className="bg-green-50 rounded-lg p-4 mb-4">
                        <div className="text-sm font-medium text-green-600 mb-2">Admin Response:</div>
                        <div className="text-gray-700">{escalation.admin_response}</div>
                      </div>
                    )}
                    {escalation.escalation_status === 'pending' && (
                      <button
                        onClick={() => setSelectedEscalation(escalation)}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                      >
                        Respond
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {selectedEscalation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg">
            <h2 className="text-xl font-semibold mb-4">Respond to Escalation</h2>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="text-sm font-medium text-gray-500 mb-2">User&apos;s Question:</div>
              <div className="text-gray-700">{selectedEscalation.content}</div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Your Response</label>
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                placeholder="Type your response here..."
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => { setSelectedEscalation(null); setResponse(''); }}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRespond}
                className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
              >
                Send Response
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
