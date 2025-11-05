import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { sanitizeInput, getValidationError } from '../utils/validation';
import api from '../utils/api';

const CustomerDashboard = () => {
  const { user, logout } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [showTransferForm, setShowTransferForm] = useState(false);
  const [transferData, setTransferData] = useState({
    recipientName: '',
    recipientBank: '',
    swiftCode: '',
    accountNumber: '',
    amount: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!user) return;

    const fetchTransactions = async () => {
      try {
        const res = await api.get('/transactions');
        setTransactions(res.data);
      } catch (err) {
        console.error('Failed to fetch transactions', err);
      }
    };

    fetchTransactions();
  }, [user]);

  const handleTransferChange = (e) => {
    const { name, value } = e.target;
    setTransferData({ ...transferData, [name]: sanitizeInput(value) });

    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateTransferForm = () => {
    const newErrors = {};
    const fields = [
      'recipientName', 'recipientBank', 'swiftCode',
      'accountNumber', 'amount', 'cardNumber',
      'cardExpiry', 'cardCvv'
    ];

    fields.forEach(field => {
      const error = getValidationError(field, transferData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTransferSubmit = async (e) => {
    e.preventDefault();
    if (!validateTransferForm()) return;

    try {
      const res = await api.post('/transactions', transferData);
      setTransactions([res.data, ...transactions]);
      setShowTransferForm(false);
      setTransferData({
        recipientName: '',
        recipientBank: '',
        swiftCode: '',
        accountNumber: '',
        amount: '',
        cardNumber: '',
        cardExpiry: '',
        cardCvv: ''
      });
      setErrors({});
    } catch (err) {
      console.error('Transaction error', err);
      alert(err.response?.data?.error || 'Transaction failed');
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Welcome, {user.name}</h1>
        <button className="logout-btn" onClick={logout}>Logout</button>
      </header>

      <div className="dashboard-actions">
        <button
          className="primary-btn"
          onClick={() => setShowTransferForm(!showTransferForm)}
        >
          {showTransferForm ? 'Cancel Transfer' : 'New International Transfer'}
        </button>
      </div>

      <div className="dashboard-content">
        {/* Centered inner container for form and table */}
        <div className="dashboard-inner">
          {showTransferForm && (
            <form className="transfer-form" onSubmit={handleTransferSubmit}>
              <h2>International Money Transfer</h2>

              <div className="form-row">
                <div className="form-group">
                  <label>Recipient Name</label>
                  <input
                    type="text"
                    name="recipientName"
                    value={transferData.recipientName}
                    onChange={handleTransferChange}
                    className={errors.recipientName ? 'error' : ''}
                  />
                  {errors.recipientName && <span className="error-text">{errors.recipientName}</span>}
                </div>

                <div className="form-group">
                  <label>Recipient Bank</label>
                  <input
                    type="text"
                    name="recipientBank"
                    value={transferData.recipientBank}
                    onChange={handleTransferChange}
                    className={errors.recipientBank ? 'error' : ''}
                  />
                  {errors.recipientBank && <span className="error-text">{errors.recipientBank}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>SWIFT/BIC</label>
                  <input
                    type="text"
                    name="swiftCode"
                    value={transferData.swiftCode}
                    onChange={handleTransferChange}
                    className={errors.swiftCode ? 'error' : ''}
                  />
                  {errors.swiftCode && <span className="error-text">{errors.swiftCode}</span>}
                </div>

                <div className="form-group">
                  <label>Account Number</label>
                  <input
                    type="text"
                    name="accountNumber"
                    value={transferData.accountNumber}
                    onChange={handleTransferChange}
                    className={errors.accountNumber ? 'error' : ''}
                  />
                  {errors.accountNumber && <span className="error-text">{errors.accountNumber}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Amount (USD)</label>
                <input
                  type="number"
                  name="amount"
                  value={transferData.amount}
                  onChange={handleTransferChange}
                  className={errors.amount ? 'error' : ''}
                />
                {errors.amount && <span className="error-text">{errors.amount}</span>}
              </div>

              <h3>Card Details</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={transferData.cardNumber}
                    onChange={handleTransferChange}
                    className={errors.cardNumber ? 'error' : ''}
                  />
                  {errors.cardNumber && <span className="error-text">{errors.cardNumber}</span>}
                </div>

                <div className="form-group">
                  <label>Expiry</label>
                  <input
                    type="text"
                    name="cardExpiry"
                    placeholder="MM/YY"
                    value={transferData.cardExpiry}
                    onChange={handleTransferChange}
                    className={errors.cardExpiry ? 'error' : ''}
                  />
                  {errors.cardExpiry && <span className="error-text">{errors.cardExpiry}</span>}
                </div>

                <div className="form-group">
                  <label>CVV</label>
                  <input
                    type="text"
                    name="cardCvv"
                    value={transferData.cardCvv}
                    onChange={handleTransferChange}
                    className={errors.cardCvv ? 'error' : ''}
                  />
                  {errors.cardCvv && <span className="error-text">{errors.cardCvv}</span>}
                </div>
              </div>

              <button type="submit" className="primary-btn submit-btn">Send Money</button>
            </form>
          )}

          <div className="transactions">
            <h2>Your Transactions</h2>
            {transactions.length === 0 ? (
              <p>No transactions found.</p>
            ) : (
              <table className="transactions-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Recipient</th>
                    <th>Bank</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx._id}>
                      <td>{new Date(tx.createdAt).toLocaleDateString()}</td>
                      <td>{tx.recipientName}</td>
                      <td>{tx.recipientBank}</td>
                      <td>${tx.amount}</td>
                      <td className={`status ${tx.status}`}>{tx.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
