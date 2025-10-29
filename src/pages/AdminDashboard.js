import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const AdminDashboard = () => {
  const { logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch all transactions from backend (admin only)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transactions/admin'); // admin endpoint
        setTransactions(res.data);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
        alert(err.response?.data?.error || 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const updateTransactionStatus = async (transactionId, status) => {
    try {
      const res = await api.patch(`/transactions/${transactionId}/status`, { status });
      // Update the local state with new status
      setTransactions(transactions.map(tx => tx._id === transactionId ? res.data : tx));
    } catch (err) {
      console.error('Failed to update status', err);
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard - International Bank</h1>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </header>

      <div className="dashboard-content">
        <div className="transactions">
          <h2>All Transactions</h2>
          {transactions.length === 0 ? (
            <p>No transactions found.</p>
          ) : (
            <table className="transactions-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Recipient</th>
                  <th>Bank</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx._id}>
                    <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                    <td>{tx.userName}</td>
                    <td>{tx.recipientName}</td>
                    <td>{tx.recipientBank}</td>
                    <td>${tx.amount}</td>
                    <td className={`status ${tx.status}`}>{tx.status}</td>
                    <td>
                      {tx.status === 'pending' && (
                        <>
                          <button
                            className="approve-btn"
                            onClick={() => updateTransactionStatus(tx._id, 'approved')}
                          >
                            Approve
                          </button>
                          <button
                            className="reject-btn"
                            onClick={() => updateTransactionStatus(tx._id, 'rejected')}
                          >
                            Reject
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
