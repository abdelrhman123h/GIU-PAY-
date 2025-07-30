'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:3333';

export default function SendReceivePage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [receiverId, setReceiverId] = useState('');
  const [selectedFoodCourt, setSelectedFoodCourt] = useState('');
  const [amount, setAmount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/');
    } else {
      setToken(storedToken);
    }
  }, [router]);

  const handleSend = async () => {
    if (!amount || amount <= 0) {
      alert('Please enter a valid positive amount');
      return;
    }

    // For student-staff category, require receiver ID
    if (category === 'student-staff' && receiverId.trim() === '') {
      alert('Please enter a Receiver ID or Email');
      return;
    }

    // For food-court category, require food court selection
    if (category === 'food-court' && selectedFoodCourt === '') {
      alert('Please select a Food Court');
      return;
    }

    setLoading(true);

    try {
      let payload;

      if (category === 'student-staff') {
        // For student/staff - just send receiver and amount (no category needed)
        payload = {
          receiver: receiverId.trim(),
          amount
        };
      } else if (category === 'food-court') {
        // For food court - send the vendor's email as receiver
        payload = {
          receiver: selectedFoodCourt, // This is now the email address
          amount,
          category: 'food-court',
          foodCourt: foodCourts.find(fc => fc.email === selectedFoodCourt)?.name || selectedFoodCourt
        };
      }

      console.log('Sending payload:', payload);

      const response = await axios.post(
        `${API_BASE_URL}/wallet/send`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Response:', response.data);
      alert(`Money sent successfully! ${response.data.message}`);
      router.push('/wallet');
    } catch (error: any) {
      console.error('Send money error:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        'Send money failed';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    {
      id: 'student-staff',
      label: 'Student & Staff',
      icon: '👥',
      color: 'from-blue-500 to-purple-600',
      description: 'Send money to students or staff members',
    },
    {
      id: 'food-court',
      label: 'Food Court',
      icon: '🍽️',
      color: 'from-orange-500 to-red-500',
      description: 'Purchase from campus restaurants',
    },
  ];

  const foodCourts = [
    { id: 'essen', name: 'Essen', icon: '🍕', email: 'essen@giu.com' },
    { id: 'container', name: 'Container', icon: '📦', email: 'container@giu.com' },
    { id: 'demeshk', name: 'Demeshk', icon: '🥙', email: 'Demeshk@giu.com' },
    { id: 'cafeteria', name: 'Cafeteria', icon: '☕', email: 'cafeteria@giu.com' },
    { id: 'bean-bunn', name: 'Bean & Bunn', icon: '🫘', email: 'Bean&Bunn@giu.com' },
    { id: 'x-square', name: 'X Square', icon: '⭐', email: 'Xsquare@giu.com' },
    { id: 'mullery', name: 'Mullery', icon: '🍰', email: 'Mullery@giu.com' },
    { id: 'loaded', name: 'Loaded', icon: '🍔', email: 'Loaded@giu.com' },
    { id: 'boosters', name: 'Boosters', icon: '🥤', email: 'Boosters@giu.com' },
  ];

  if (!category) {
    return (
      <div className="page-background">
        <div className="unified-card max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl">
              <span className="text-3xl">🔄</span>
            </div>
            <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-blue-600 via-purple-500 to-orange-500 bg-clip-text text-transparent">
              Send Money
            </h1>
            <p className="text-xl text-slate-300 font-medium">Choose your transaction type</p>
          </div>

          {/* Category Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12 max-w-3xl mx-auto">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategory(cat.id)}
                className={`group relative p-10 bg-gradient-to-br ${cat.color} rounded-3xl shadow-xl hover:shadow-2xl transform hover:-translate-y-3 hover:rotate-1 transition-all duration-500`}
              >
                <div className="text-center">
                  <div className="text-7xl mb-6">{cat.icon}</div>
                  <h3 className="text-3xl font-bold text-white mb-3">{cat.label}</h3>
                  <p className="text-white/80 text-base leading-relaxed">{cat.description}</p>
                </div>
                <div className="absolute inset-0 bg-white/10 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute top-4 right-4 w-3 h-3 bg-white/30 rounded-full group-hover:bg-white/50 transition-colors duration-300"></div>
              </button>
            ))}
          </div>

          {/* Back Button */}
          <div className="text-center">
            <button
              onClick={() => router.push('/wallet')}
              className="inline-flex items-center space-x-2 text-slate-400 hover:text-white transition-colors duration-300 group"
            >
              <span className="transform group-hover:-translate-x-1 transition-transform duration-300">←</span>
              <span className="font-medium">Back to Dashboard</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  const selectedCategory = categories.find((cat) => cat.id === category);

  return (
    <div className="page-background">
      <div className="unified-card max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div
            className={`w-20 h-20 mx-auto mb-6 bg-gradient-to-br ${selectedCategory?.color} rounded-3xl flex items-center justify-center shadow-2xl`}
          >
            <span className="text-3xl">{selectedCategory?.icon}</span>
          </div>
          <h1 className="text-4xl font-black mb-2 text-slate-200">Send to {selectedCategory?.label}</h1>
          <p className="text-slate-400">{selectedCategory?.description}</p>
        </div>

        {/* Form */}
        <div className="space-y-6">
          {/* Food Court Selector - Only for food-court category */}
          {category === 'food-court' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-3">Select Food Court</label>
              <div className="grid grid-cols-3 gap-3">
                {foodCourts.map((vendor) => (
                  <button
                    key={vendor.id}
                    onClick={() => setSelectedFoodCourt(vendor.email)} // Use email instead of name
                    className={`p-4 rounded-2xl text-center transition-all duration-300 ${
                      selectedFoodCourt === vendor.email
                        ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white shadow-lg scale-105'
                        : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                    }`}
                  >
                    <div className="text-2xl mb-2">{vendor.icon}</div>
                    <div className="font-medium text-xs">{vendor.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Receiver ID Input - Only for student-staff category */}
          {category === 'student-staff' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-3">Receiver ID or Email</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Enter receiver's ID or email"
                  value={receiverId}
                  onChange={(e) => setReceiverId(e.target.value)}
                  className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 transition-all duration-300 pl-12"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                  
                </div>
              </div>
            </div>
          )}

          {/* Amount Input */}
          <div>
            <label className="block text-slate-300 font-semibold mb-3">Amount</label>
            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:border-yellow-500 focus:bg-white/10 transition-all duration-300 pl-12"
              />
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400">
                
              </div>
            </div>
          </div>

          {/* Quick Amount */}
          <div>
            <label className="block text-slate-300 font-semibold mb-3">Quick Amount</label>
            <div className="grid grid-cols-4 gap-3">
              {[10, 25, 50, 100].map((quickAmount) => (
                <button
                  key={quickAmount}
                  onClick={() => setAmount(quickAmount)}
                  className={`p-3 rounded-xl transition-all duration-300 ${
                    amount === quickAmount
                      ? `bg-gradient-to-br ${selectedCategory?.color} text-white shadow-lg`
                      : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10'
                  }`}
                >
                  ${quickAmount}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          {((category === 'student-staff' && receiverId) || (category === 'food-court' && selectedFoodCourt) || amount > 0) && (
            <div className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-2xl border border-white/10 p-6">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">Transaction Summary</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Category:</span>
                  <span className="text-white font-medium">{selectedCategory?.label}</span>
                </div>
                {category === 'food-court' && selectedFoodCourt && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Vendor:</span>
                    <span className="text-white font-medium">
                      {foodCourts.find(fc => fc.email === selectedFoodCourt)?.name || selectedFoodCourt}
                    </span>
                  </div>
                )}
                {category === 'student-staff' && receiverId && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Receiver:</span>
                    <span className="text-white font-medium">{receiverId}</span>
                  </div>
                )}
                {amount > 0 && (
                  <div className="flex justify-between border-t border-white/10 pt-3">
                    <span className="text-slate-400">Amount:</span>
                    <span className="text-yellow-400 font-bold text-xl">${amount.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <button
              onClick={handleSend}
              disabled={
                !amount || 
                amount <= 0 || 
                loading ||
                (category === 'student-staff' && !receiverId) ||
                (category === 'food-court' && !selectedFoodCourt)
              }
              className={`w-full bg-gradient-to-r ${selectedCategory?.color} hover:opacity-90 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg shadow-xl hover:shadow-2xl transform hover:-translate-y-1 disabled:hover:translate-y-0 transition-all duration-300 relative overflow-hidden group`}
            >
              <span className="relative z-10">{loading ? '⏳ Sending...' : '🚀 Send Money'}</span>
              {!loading && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              )}
            </button>

            <div className="flex space-x-4">
              <button
                onClick={() => setCategory(null)}
                disabled={loading}
                className="flex-1 bg-white/10 hover:bg-white/20 text-slate-300 font-semibold py-3 rounded-xl border border-white/20 transition-all duration-300 disabled:opacity-50"
              >
                ← Change Category
              </button>
              <button
                onClick={() => router.push('/wallet')}
                disabled={loading}
                className="flex-1 bg-white/10 hover:bg-white/20 text-slate-300 font-semibold py-3 rounded-xl border border-white/20 transition-all duration-300 disabled:opacity-50"
              >
                🏠 Dashboard
              </button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="mt-8 p-4 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">🛡️</span>
            </div>
            <div>
              <p className="text-blue-400 font-semibold text-sm">Secure Transaction</p>
              <p className="text-slate-400 text-xs">All transactions are encrypted and monitored for security</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}