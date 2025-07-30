'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const API_BASE_URL = 'http://localhost:3333';

export default function WalletPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [amount, setAmount] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [modalType, setModalType] = useState<'add' | 'withdraw' | 'cardDetails' | null>(null);
  
  // Card details state
  const [cardDetails, setCardDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: ''
  });

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    if (!storedToken) {
      router.push('/');
      return;
    }
    setToken(storedToken);
  }, [router]);

  const fetchBalance = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/wallet/balance`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setBalance(res.data.balance);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      router.push('/');
    }
  };

  const fetchTransactions = async (authToken: string) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/wallet/transactions`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      setTransactions(res.data);
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchBalance(token);
      fetchTransactions(token);
    }
  }, [token]);

  const handlePaymentMethodSelected = (methodName: string) => {
    setSelectedMethod(methodName);
    setModalType('cardDetails');
  };

  const handleAddMoney = async () => {
    if (!amount || amount <= 0) {
      alert('Enter a valid amount');
      return;
    }
    if (!selectedMethod) {
      alert('Select a payment method');
      return;
    }
    if (!cardDetails.cardNumber || !cardDetails.expiryDate || !cardDetails.cvv || !cardDetails.cardholderName) {
      alert('Please fill in all card details');
      return;
    }
    
    try {
      await axios.post(
        `${API_BASE_URL}/wallet/add-money`,
        { 
          amount,
          paymentMethod: selectedMethod,
          cardDetails: cardDetails
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert(`$${amount} added successfully via ${selectedMethod}`);
      resetModal();
      fetchBalance(token!);
      fetchTransactions(token!);
    } catch (error) {
      alert('Add money failed');
      console.error(error);
    }
  };

  const handleWithdraw = async () => {
    if (!amount || amount <= 0) {
      alert('Enter a valid amount');
      return;
    }
    try {
      await axios.post(
        `${API_BASE_URL}/wallet/withdraw`,
        { amount },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Money withdrawn');
      resetModal();
      fetchBalance(token!);
      fetchTransactions(token!);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Withdraw failed');
      console.error(error);
    }
  };

  const resetModal = () => {
    setAmount(0);
    setSelectedMethod('');
    setModalType(null);
    setCardDetails({
      cardNumber: '',
      expiryDate: '',
      cvv: '',
      cardholderName: ''
    });
  };

  const handleCardDetailsChange = (field: string, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  const paymentMethods = [
    { id: 'telda', name: 'Telda', icon: '💳', color: 'from-purple-500 to-pink-500' },
    { id: 'instapay', name: 'InstaPay', icon: '⚡', color: 'from-blue-500 to-cyan-500' },
    { id: 'value', name: 'Value', icon: '💎', color: 'from-green-500 to-emerald-500' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦', color: 'from-gray-500 to-slate-600' }
  ];

  const quickActions = [
    { 
      id: 'add', 
      label: 'Add Money', 
      icon: '💰', 
      color: 'from-green-500 to-emerald-600',
      action: () => setModalType('add')
    },
    { 
      id: 'card', 
      label: 'Card Details', 
      icon: '💳', 
      color: 'from-blue-500 to-indigo-600',
      action: () => setModalType('withdraw')
    },
    { 
      id: 'send', 
      label: 'Send & Receive', 
      icon: '🔄', 
      color: 'from-purple-500 to-violet-600',
      action: () => router.push('/wallet/send-receive')
    }
  ];

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'add': return '⬆️';
      case 'withdraw': return '⬇️';
      case 'send': return '📤';
      case 'receive': return '📥';
      default: return '💸';
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case 'add': case 'receive': return 'text-green-400';
      case 'withdraw': case 'send': return 'text-red-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="page-background">
      <div className="unified-card max-w-4xl">

        {/* Centered Logo */}
        <div className="flex justify-center mt-10 mb-6">
          <div className="w-32 h-32 flex items-center justify-center">
            <svg width="100" height="60" viewBox="0 0 164 80" xmlns="http://www.w3.org/2000/svg">
              {/* G */}
              <path d="M0 40C0 18 18 0 40 0C50 0 58 4 64 10L58 18C54 14 48 12 40 12C26 12 14 26 14 40C14 54 26 68 40 68C48 68 54 66 58 62V50H44V38H72V70C66 76 52 80 40 80C18 80 0 62 0 40Z" fill="#000000"/>
              {/* I */}
              <rect x="80" y="0" width="12" height="80" fill="#DC2626"/>
              {/* U */}
              <path d="M100 0V50C100 66 116 80 132 80C148 80 164 66 164 50V0H152V50C152 58 146 68 132 68C118 68 112 58 112 50V0H100Z" fill="#D97706"/>
            </svg>
          </div>
        </div>

        {/* Header Section */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black mb-4 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 bg-clip-text text-transparent">
            GIU PAY
          </h1>
          <p className="text-xl text-slate-300 font-medium">Your Digital Campus Wallet</p>
        </div>

        {/* Balance Card */}
        <div className="relative mb-10 p-8 bg-gradient-to-br from-slate-800/50 to-slate-900/50 rounded-3xl border border-white/10 backdrop-blur-xl shadow-2xl">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 rounded-t-3xl"></div>
          
          <div className="text-center">
            <p className="text-slate-400 text-lg font-medium mb-2">Available Balance</p>
            <div className="balance text-6xl font-black mb-4 bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
              ${balance.toFixed(2)}
            </div>
            <div className="flex items-center justify-center space-x-2 text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium">Account Active</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold text-center mb-6 text-slate-200">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action) => (
              <button
                key={action.id}
                onClick={action.action}
                className={`group relative p-6 bg-gradient-to-br ${action.color} rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300`}
              >
                <div className="flex flex-col items-center space-y-3">
                  <div className="text-4xl">{action.icon}</div>
                  <span className="text-white font-bold text-lg">{action.label}</span>
                </div>
                <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </button>
            ))}
          </div>
        </div>

        {/* Transaction History */}
        <div className="bg-white/5 rounded-3xl border border-white/10 backdrop-blur-xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-200">Transaction History</h2>
            <div className="flex items-center space-x-2 text-slate-400">
              <span className="text-sm">Recent</span>
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            </div>
          </div>
          
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-slate-400 text-lg">No transactions yet</p>
              <p className="text-slate-500 text-sm">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4 max-h-80 overflow-y-auto scrollbar-thin">
              {transactions.map((t, idx) => (
                <div
                  key={idx}
                  className="group flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/20 transition-all duration-300"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl">
                      {getTransactionIcon(t.type)}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-lg ${getTransactionColor(t.type)}`}>
                          {t.type.toUpperCase()}
                        </span>
                        <span className="text-slate-300 font-semibold">${t.amount}</span>
                      </div>
                      <div className="text-slate-400 text-sm">
                        {t.toEmail && `To: ${t.toEmail}`}
                        {t.fromEmail && `From: ${t.fromEmail}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-slate-500 text-xs">
                    {new Date().toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Method Selection Modal */}
        {modalType === 'add' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="modal-card w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">💰</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-200">Add Money</h2>
                <p className="text-slate-400 mt-2">Select your payment method</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handlePaymentMethodSelected(method.name)}
                    className={`p-4 rounded-2xl transition-all duration-300 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 hover:border-white/20 hover:scale-105`}
                  >
                    <div className="text-2xl mb-2">{method.icon}</div>
                    <div className="text-sm font-semibold">{method.name}</div>
                  </button>
                ))}
              </div>

              <button
                onClick={resetModal}
                className="w-full bg-white/10 hover:bg-white/20 text-slate-300 font-bold py-4 rounded-2xl border border-white/20 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Card Details Modal */}
        {modalType === 'cardDetails' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="modal-card w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <h2 className="text-2xl font-bold text-slate-200">Card Details</h2>
                <p className="text-slate-400 mt-1">Pay with {selectedMethod}</p>
              </div>

              {/* Form Fields */}
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Cardholder Name
                  </label>
                  <input
                    type="text"
                    placeholder="John Doe"
                    value={cardDetails.cardholderName}
                    onChange={(e) => handleCardDetailsChange('cardholderName', e.target.value)}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Card Number
                  </label>
                  <input
                    type="text"
                    placeholder="1234 5678 9012 3456"
                    value={cardDetails.cardNumber}
                    onChange={(e) => handleCardDetailsChange('cardNumber', formatCardNumber(e.target.value))}
                    maxLength={19}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 transition-all duration-300 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      placeholder="MM/YY"
                      value={cardDetails.expiryDate}
                      onChange={(e) => handleCardDetailsChange('expiryDate', formatExpiryDate(e.target.value))}
                      maxLength={5}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 transition-all duration-300 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 text-sm font-medium mb-2">
                      CVV
                    </label>
                    <input
                      type="text"
                      placeholder="123"
                      value={cardDetails.cvv}
                      onChange={(e) => handleCardDetailsChange('cvv', e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength={4}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 transition-all duration-300 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 text-sm font-medium mb-2">
                    Amount to Add
                  </label>
                  <input
                    type="number"
                    placeholder="Enter amount"
                    value={amount || ''}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full p-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
                  />
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setModalType('add')}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-slate-300 font-medium py-3 rounded-xl border border-white/20 transition-all duration-300"
                >
                  Back
                </button>
                <button
                  onClick={handleAddMoney}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-3 rounded-xl transition-all duration-300 transform hover:-translate-y-0.5"
                >
                  Add Money
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Modal */}
        {modalType === 'withdraw' && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="modal-card w-full max-w-md">
              <div className="text-center mb-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">💳</span>
                </div>
                <h2 className="text-3xl font-bold text-slate-200">Card Details</h2>
              </div>

              <div className="mb-6 p-6 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl border border-white/10">
                <div className="flex justify-between items-start mb-4">
                  <div className="text-amber-400 font-bold text-lg">GIU PAY CARD</div>
                  <div className="text-slate-400 text-sm">VISA</div>
                </div>
                <div className="text-white text-2xl font-mono mb-4 tracking-wider">
                  1234 5678 9012 3456
                </div>
                <div className="flex justify-between text-sm">
                  <div>
                    <div className="text-slate-400 uppercase text-xs">Cardholder</div>
                    <div className="text-white font-semibold">Student ID</div>
                  </div>
                  <div>
                    <div className="text-slate-400 uppercase text-xs">Valid Thru</div>
                    <div className="text-white font-semibold">12/30</div>
                  </div>
                </div>
              </div>

              <input
                type="number"
                placeholder="Enter amount"
                value={amount || ''}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full mb-6 p-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:border-blue-500 focus:bg-white/10 transition-all duration-300"
              />

              <div className="flex space-x-4">
                <button
                  onClick={handleWithdraw}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 rounded-2xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Withdraw
                </button>
                <button
                  onClick={resetModal}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-slate-300 font-bold py-4 rounded-2xl border border-white/20 transition-all duration-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}