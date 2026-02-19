'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function Home() {
  const { user, loading } = useAuth();

  return (
    <main className="min-h-screen">
      <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">TravelMate</span>
            </div>
            <div className="flex items-center gap-4">
              {!loading && !user && (
                <>
                  <Link href="/login" className="text-gray-600 hover:text-primary">
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                  >
                    Get Started
                  </Link>
                </>
              )}
              {!loading && user && (
                <Link
                  href="/chat"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition"
                >
                  Go to Chat
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-32 pb-20 px-4 bg-gradient-to-b from-blue-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Your Personal <span className="text-primary">AI Travel Agent</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Discover amazing resorts, get instant quotes, and book your perfect vacation - all through natural conversation with our AI assistant.
          </p>
          <div className="flex gap-4 justify-center">
            <Link
              href={user ? '/chat' : '/register'}
              className="bg-primary text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-dark transition"
            >
              Start Chatting
            </Link>
            <Link
              href="/login"
              className="bg-white text-gray-700 border border-gray-200 px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-50 transition"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Chat with AI</h3>
              <p className="text-gray-600">
                Simply tell our AI assistant about your dream vacation - destination, dates, and preferences.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🏨</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Get Recommendations</h3>
              <p className="text-gray-600">
                Receive personalized resort recommendations with real-time pricing and availability.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✈️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Book Instantly</h3>
              <p className="text-gray-600">
                Confirm your booking with secure payment and receive your voucher instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="text-2xl mb-2 block">🤖</span>
              <h3 className="font-semibold mb-1">AI Assistant</h3>
              <p className="text-sm text-gray-600">24/7 intelligent responses</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="text-2xl mb-2 block">📚</span>
              <h3 className="font-semibold mb-1">Knowledge Base</h3>
              <p className="text-sm text-gray-600">Comprehensive travel info</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="text-2xl mb-2 block">💳</span>
              <h3 className="font-semibold mb-1">Secure Payments</h3>
              <p className="text-sm text-gray-600">Stripe integration</p>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm">
              <span className="text-2xl mb-2 block">📱</span>
              <h3 className="font-semibold mb-1">Mobile Friendly</h3>
              <p className="text-sm text-gray-600">Access anywhere</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <span className="text-2xl font-bold">TravelMate AI</span>
          <p className="mt-2 text-gray-400">Your personal AI travel agent</p>
          <p className="mt-4 text-gray-500 text-sm            © 2024 TravelMate AI.">
 All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
