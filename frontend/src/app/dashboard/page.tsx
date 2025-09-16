'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Heart, User, LogOut, Plus, MessageCircle, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <p>Not authenticated. Redirecting...</p>
        </div>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-pink-500 mr-3" />
              <h1 className="text-2xl font-bold text-white">VIPConnect</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-300">
                Welcome, {user.firstName} {user.lastName}
              </span>
              <span className="px-3 py-1 bg-purple-600 text-white text-xs rounded-full">
                {user.accountType.toUpperCase()}
              </span>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 text-gray-300 hover:text-white transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="bg-gradient-to-r from-purple-800 to-pink-800 rounded-xl p-8 mb-8">
          <div className="text-center text-white">
            <h2 className="text-3xl font-bold mb-2">
              Welcome to VIPConnect, {user.firstName}!
            </h2>
            <p className="text-purple-200 mb-4">
              {user.accountType === 'creator' 
                ? 'Start sharing your content and connecting with fans'
                : 'Discover amazing content from your favorite creators'
              }
            </p>
            <div className="flex items-center justify-center space-x-2 text-sm">
              <span>Email: {user.emailVerified ? '✅' : '❌'}</span>
              <span>Age: {user.ageVerified ? '✅' : '❌'}</span>
              <span className="text-purple-200">Status: {user.accountStatus}</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {user.accountType === 'creator' ? (
            <>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center mb-4">
                  <Plus className="h-8 w-8 text-pink-500 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Create Content</h3>
                </div>
                <p className="text-gray-400 mb-4">Upload photos, videos, or start a live stream</p>
                <button className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors">
                  Create New Post
                </button>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center mb-4">
                  <MessageCircle className="h-8 w-8 text-blue-500 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Messages</h3>
                </div>
                <p className="text-gray-400 mb-4">Connect with your fans and subscribers</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Messages
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center mb-4">
                  <DollarSign className="h-8 w-8 text-green-500 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Earnings</h3>
                </div>
                <p className="text-gray-400 mb-4">Track your income and set subscription prices</p>
                <button className="w-full bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 transition-colors">
                  View Analytics
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center mb-4">
                  <Heart className="h-8 w-8 text-pink-500 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Discover Creators</h3>
                </div>
                <p className="text-gray-400 mb-4">Find and follow your favorite content creators</p>
                <button className="w-full bg-pink-600 text-white py-2 rounded-lg hover:bg-pink-700 transition-colors">
                  Browse Creators
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center mb-4">
                  <User className="h-8 w-8 text-blue-500 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Subscriptions</h3>
                </div>
                <p className="text-gray-400 mb-4">Manage your active subscriptions</p>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
                  View Subscriptions
                </button>
              </div>

              <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex items-center mb-4">
                  <MessageCircle className="h-8 w-8 text-purple-500 mr-3" />
                  <h3 className="text-xl font-semibold text-white">Messages</h3>
                </div>
                <p className="text-gray-400 mb-4">Chat with creators you follow</p>
                <button className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors">
                  View Messages
                </button>
              </div>
            </>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800 p-6 rounded-xl border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
          <div className="text-center text-gray-400 py-8">
            <p>No recent activity to display.</p>
            <p className="text-sm mt-2">Start exploring the platform to see your activity here!</p>
          </div>
        </div>
      </main>
    </div>
  );
}