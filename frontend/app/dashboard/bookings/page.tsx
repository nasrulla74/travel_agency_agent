'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { bookings } from '@/lib/api';

export default function BookingsPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [bookingsList, setBookingsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      const res = await bookings.list();
      setBookingsList(res.data);
    } catch (err) {
      console.error('Error loading bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      await bookings.confirm(id);
      loadBookings();
    } catch (err) {
      console.error('Error confirming booking:', err);
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await bookings.cancel(id);
      loadBookings();
    } catch (err) {
      console.error('Error cancelling booking:', err);
    }
  };

  const handlePay = async (id: string) => {
    try {
      await bookings.pay(id);
      loadBookings();
    } catch (err) {
      console.error('Error paying booking:', err);
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
              className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100"
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
              className="block px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium"
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
          <button onClick={logout} className="w-full text-gray-600 hover:text-gray-900 text-sm">
            Logout
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold mb-8">Bookings</h1>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {loading ? (
              <div className="p-8 text-center">Loading...</div>
            ) : bookingsList.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No bookings found. Start a conversation to book your first stay!
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b border-gray-100">
                      <th className="p-4">ID</th>
                      <th className="p-4">Property</th>
                      <th className="p-4">Check-in</th>
                      <th className="p-4">Check-out</th>
                      <th className="p-4">Guests</th>
                      <th className="p-4">Amount</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Payment</th>
                      <th className="p-4">Voucher</th>
                      <th className="p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingsList.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100">
                        <td className="p-4 text-sm">{booking.id.slice(0, 8)}</td>
                        <td className="p-4">{booking.property_id.slice(0, 8)}</td>
                        <td className="p-4">{new Date(booking.check_in).toLocaleDateString()}</td>
                        <td className="p-4">{new Date(booking.check_out).toLocaleDateString()}</td>
                        <td className="p-4">{booking.guests}</td>
                        <td className="p-4 font-medium">${booking.total_amount}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            booking.payment_status === 'paid' ? 'bg-green-100 text-green-700' :
                            booking.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                          }`}>
                            {booking.payment_status}
                          </span>
                        </td>
                        <td className="p-4 font-mono text-sm">
                          {booking.voucher_code || '-'}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            {user.role !== 'traveler' && booking.status === 'pending' && (
                              <button
                                onClick={() => handleConfirm(booking.id)}
                                className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                              >
                                Confirm
                              </button>
                            )}
                            {user.role === 'traveler' && booking.status === 'confirmed' && booking.payment_status === 'pending' && (
                              <button
                                onClick={() => handlePay(booking.id)}
                                className="px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-dark"
                              >
                                Pay
                              </button>
                            )}
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button
                                onClick={() => handleCancel(booking.id)}
                                className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
