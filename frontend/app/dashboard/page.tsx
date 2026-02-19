'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { bookings, properties } from '@/lib/api';

export default function DashboardPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
  });
  const [recentBookings, setRecentBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      const bookingsRes = await bookings.list();
      setRecentBookings(bookingsRes.data.slice(0, 5));
      
      const stats = {
        total: bookingsRes.data.length,
        pending: bookingsRes.data.filter((b: any) => b.status === 'pending').length,
        confirmed: bookingsRes.data.filter((b: any) => b.status === 'confirmed').length,
        completed: bookingsRes.data.filter((b: any) => b.status === 'completed').length,
      };
      setBookingStats(stats);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside className="w-64 bg-white border-r border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <Link href="/" className="text-2xl font-bold text-primary">
            TravelMate
          </Link>
        </div>
        
        <div className="p-4">
          <nav className="space-y-1">
            <Link
              href="/dashboard"
              className="block px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
            >
              Dashboard
            </Link>
            <Link
              href="/chat"
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Chat
            </Link>
            <Link
              href="/dashboard/bookings"
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
            >
              Bookings
            </Link>
            {user.role === 'admin' && (
              <>
                <Link
                  href="/dashboard/properties"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Properties
                </Link>
                <Link
                  href="/dashboard/escalations"
                  className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
                >
                  Escalations
                </Link>
              </>
            )}
          </nav>
        </div>

        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
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

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Dashboard</h1>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-gray-500 text-sm mb-1">Total Bookings</div>
              <div className="text-3xl font-bold">{bookingStats.total}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-yellow-600 text-sm mb-1">Pending</div>
              <div className="text-3xl font-bold text-yellow-600">{bookingStats.pending}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-green-600 text-sm mb-1">Confirmed</div>
              <div className="text-3xl font-bold text-green-600">{bookingStats.confirmed}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className="text-blue-600 text-sm mb-1">Completed</div>
              <div className="text-3xl font-bold text-blue-600">{bookingStats.completed}</div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Recent Bookings</h2>
            </div>
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">Loading...</div>
              ) : recentBookings.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No bookings yet. Start a conversation to book your first stay!
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-sm text-gray-500">
                        <th className="pb-3">Property</th>
                        <th className="pb-3">Check-in</th>
                        <th className="pb-3">Check-out</th>
                        <th className="pb-3">Amount</th>
                        <th className="pb-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {recentBookings.map((booking) => (
                        <tr key={booking.id}>
                          <td className="py-3">{booking.property_id}</td>
                          <td className="py-3">{new Date(booking.check_in).toLocaleDateString()}</td>
                          <td className="py-3">{new Date(booking.check_out).toLocaleDateString()}</td>
                          <td className="py-3">${booking.total_amount}</td>
                          <td className="py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-blue-100 text-blue-700'
                            }`}>
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
