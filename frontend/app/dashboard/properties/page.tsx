'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { properties } from '@/lib/api';

export default function PropertiesPage() {
  const { user, loading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [propertiesList, setPropertiesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
  });

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
      loadProperties();
    }
  }, [user]);

  const loadProperties = async () => {
    try {
      const res = await properties.list();
      setPropertiesList(res.data);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await properties.create(formData);
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        location: '',
        contact_name: '',
        contact_email: '',
        contact_phone: '',
      });
      loadProperties();
    } catch (err) {
      console.error('Error creating property:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this property?')) return;
    try {
      await properties.delete(id);
      loadProperties();
    } catch (err) {
      console.error('Error deleting property:', err);
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
            <Link href="/dashboard/properties" className="block px-3 py-2 rounded-lg bg-primary/10 text-primary font-medium">Properties</Link>
            <Link href="/dashboard/escalations" className="block px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100">Escalations</Link>
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200">
          <button onClick={logout} className="w-full text-gray-600 hover:text-gray-900 text-sm">Logout</button>
        </div>
      </aside>

      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Properties</h1>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
            >
              Add Property
            </button>
          </div>

          {loading ? (
            <div className="p-8 text-center">Loading...</div>
          ) : propertiesList.length === 0 ? (
            <div className="p-8 text-center text-gray-500 bg-white rounded-xl">No properties yet</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {propertiesList.map((property) => (
                <div key={property.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h3 className="font-semibold text-lg mb-2">{property.name}</h3>
                  <p className="text-gray-500 text-sm mb-2">{property.location}</p>
                  <p className="text-gray-600 text-sm mb-4">{property.description}</p>
                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <button
                      onClick={() => handleDelete(property.id)}
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">Add Property</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Name</label>
                <input
                  type="text"
                  value={formData.contact_name}
                  onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Email</label>
                <input
                  type="email"
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
