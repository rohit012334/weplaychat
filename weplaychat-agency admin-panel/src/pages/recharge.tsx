/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/store";
import {
  findUser,
  createRecharge,
  getRechargeHistory,
  updateRechargeStatus,
} from "@/store/resellerRechargeSlice";
import Loader from "@/utils/Loader";
import Layout from "@/component/layout/Layout";
import { Success, DangerRight } from "@/api/toastServices";



export default function ResellerRecharge() {
  const dispatch = useAppDispatch();
  const { searchedUser, history, loading, error } = useAppSelector(
    (state: any) => state.resellerRecharge
  );

  const [searchId, setSearchId] = useState("");
  const [amount, setAmount] = useState("");
  const [completedRecharge, setCompletedRecharge] = useState<any>(null);

  useEffect(() => {
    dispatch(getRechargeHistory());
  }, [dispatch]);
  console.log("History:", history);

  const handleSearch = async () => {
    if (!searchId.trim()) {
      DangerRight("Please enter a user ID");
      return;
    }
    const result: any = await dispatch(findUser(searchId));
    if (result.payload?.status) {
      Success("User found successfully");
    } else {
      DangerRight(result.payload?.message || "User not found");
    }
  };

  const handleRecharge = async () => {
    if (!searchedUser) {
      DangerRight("Please search and select a user first");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      DangerRight("Please enter a valid amount");
      return;
    }
    const result: any = await dispatch(
      createRecharge({ userId: searchedUser.uniqueId, amount: Number(amount) })
    );
    if (result.payload?.status) {
      Success("Recharge created successfully");
      setAmount("");
      setSearchId("");
      dispatch(getRechargeHistory());
    } else {
      DangerRight(result.payload?.message || "Recharge failed");
    }
  };

  const handleStatus = async (rechargeId: string) => {
    const result: any = await dispatch(
      updateRechargeStatus({ id: rechargeId, status: "done" })
    );

    if (result.payload?.status) {
      Success("Status updated successfully");
      const foundRecharge = history.find((r: any) => r._id === rechargeId);
      setCompletedRecharge(foundRecharge);
      dispatch(getRechargeHistory());
    } else {
      DangerRight("Failed to update status");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (completedRecharge) {
      const text = `
Recharge Receipt
User: ${completedRecharge.userId?.name}
ID: ${completedRecharge.userId?.uniqueId}
Amount: ${completedRecharge.amount} coins
Date: ${new Date(completedRecharge.createdAt).toLocaleDateString()}
Status: ${completedRecharge.status}
      `;
      if (navigator.share) {
        navigator.share({ title: "Recharge Receipt", text });
      } else {
        alert(text);
      }
    }
  };
  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 p-6 md:p-8">
        {loading && <Loader />}

        <div className="max-w-7xl mx-auto">
          {/* Step Indicator
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12 p-6 bg-white/10 rounded-xl backdrop-blur-md">
            {[
              { num: 1, label: "Search User", icon: "🔍" },
              { num: 2, label: "Recharge", icon: "💰" },
              { num: 3, label: "History", icon: "📋" },
              { num: 4, label: "Receipt", icon: "📄" },
            ].map((step, idx) => (
              <React.Fragment key={step.num}>
                <div className="flex flex-col items-center gap-2">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      step.num <= 2
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                        : history.length > 0 && step.num === 3
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                        : completedRecharge && step.num === 4
                        ? "bg-green-500 text-white shadow-lg shadow-green-500/50"
                        : "bg-white/30 text-white"
                    }`}
                  >
                    {step.num}
                  </div>
                  <p className="text-xs text-white font-semibold">{step.label}</p>
                </div>
                {idx < 3 && (
                  <div className="hidden sm:block flex-1 h-0.5 bg-white/20 max-w-12"></div>
                )}
              </React.Fragment>
            ))}
          </div> */}
          {/* Step 1: Search User */}
          <div className="card step1">
            <div className="card-header">
              <h3>Step 1: Search User</h3>
              <span className="icon">🔍</span>
            </div>
            <div className="card-body">
              <div className="search-group">
                <input
                  type="text"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="Enter User ID or Unique ID..."
                  className="search-input"
                />
                <button onClick={handleSearch} className="btn btn-primary">
                  Search
                </button>
              </div>

              {searchedUser && (
                <div className="user-info">
                  <div className="info-row">
                    <span>Name:</span>
                    <strong>{searchedUser.name}</strong>
                  </div>
                  <div className="info-row">
                    <span>User ID:</span>
                    <strong>{searchedUser._id}</strong>
                  </div>
                  <div className="info-row">
                    <span>Current Coins:</span>
                    <strong className="coin-badge">{searchedUser.coin || 0}</strong>
                  </div>
                </div>
              )}
              {error && <div className="error-msg">{error}</div>}
            </div>
          </div>

          {/* Step 2: Recharge */}
          <div className="card step2 mt-5">
            <div className="card-header">
              <h3>Step 2: Recharge Coins</h3>
              <span className="icon">💰</span>
            </div>
            <div className="card-body">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter coin amount..."
                className="amount-input"
                disabled={!searchedUser}
              />
              <button
                onClick={handleRecharge}
                disabled={!searchedUser || !amount}
                className="btn btn-success full-width"
              >
                Submit Recharge
              </button>
            </div>
          </div>
        </div>

        {/* Step 3: History */}
        {history.length > 0 && (
          <div className="card step3 mt-5">
            <div className="card-header">
              <h3>Step 3: Recharge History</h3>
              <span className="icon">📋</span>
            </div>
            <div className="card-body table-responsive">
              <table className="history-table">
                <thead>
                  <tr>
                    <th>User Name</th>
                    <th>User ID</th>
                    <th>Amount</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item: any) => (
                    <tr key={item._id} className={item.status === "pending" ? "pending" : "done"}>
                      <td>{item.userId?.name}</td>
                      <td className="id-cell">{item.userId?.uniqueId || item.userId?._id}</td>
                      <td className="amount-cell">{item.amount}</td>
                      <td>{new Date(item.createdAt).toLocaleDateString()}</td>
                      <td>
                        <span className={`status-badge ${item.status}`}>
                          {item.status.toUpperCase()}
                        </span>
                      </td>
                      <td>
                        {item.status === "pending" ? (
                          <button
                            onClick={() => handleStatus(item._id)}
                            className="btn btn-small btn-approve"
                          >
                            ✓ Mark Done
                          </button>
                        ) : (
                          <button
                            onClick={() => setCompletedRecharge(item)}
                            className="btn btn-small btn-view"
                          >
                            View Receipt
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Step 4: Receipt */}
        {completedRecharge && (
          <div className="card step4 mt-5">
            <div className="card-header">
              <h3>Step 4: Recharge Receipt</h3>
              <span className="icon">📄</span>
            </div>
            <div className="card-body receipt">
              <div className="receipt-container">
                <div className="receipt-header">
                  <h2>COIN RECHARGE RECEIPT</h2>
                  <div className="divider-line"></div>
                </div>

                <div className="receipt-section">
                  <h4>Recipient Details</h4>
                  <div className="receipt-row">
                    <span>Name:</span>
                    <strong>{completedRecharge.userId?.name}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>User ID:</span>
                    <strong>{completedRecharge.userId?.uniqueId || completedRecharge.userId?._id}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Total Coins:</span>
                    <strong>{completedRecharge.userId?.coin || 0}</strong>
                  </div>
                </div>

                <div className="divider-line"></div>

                <div className="receipt-section">
                  <h4>Transaction Details</h4>
                  <div className="receipt-row">
                    <span>Coins Recharged:</span>
                    <strong className="highlight">{completedRecharge.amount}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Transaction Date:</span>
                    <strong>{new Date(completedRecharge.createdAt).toLocaleDateString()}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Transaction Time:</span>
                    <strong>{new Date(completedRecharge.createdAt).toLocaleTimeString()}</strong>
                  </div>
                  <div className="receipt-row">
                    <span>Reference ID:</span>
                    <strong className="mono">{completedRecharge._id}</strong>
                  </div>
                </div>

                <div className="divider-line"></div>

                <div className="receipt-section">
                  <h4>Status</h4>
                  <div className="receipt-row">
                    <span>Current Status:</span>
                    <strong className="status-success">✓ Done</strong>
                  </div>
                </div>

                <div className="divider-line"></div>

                <div className="receipt-footer">
                  <p>Thank you for using our recharge service</p>
                  <p className="timestamp">Generated: {new Date().toLocaleString()}</p>
                </div>
              </div>

              <div className="receipt-actions">
                <button onClick={handlePrint} className="btn btn-primary">
                  🖨️ Print Receipt
                </button>
                <button onClick={handleShare} className="btn btn-secondary">
                  📤 Share Receipt
                </button>
                <button
                  onClick={() => setCompletedRecharge(null)}
                  className="btn btn-outline"
                >
                  ✕ Close
                </button>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          .recharge-container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
          }

          /* Step Indicator */
          .step-indicator {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 40px;
            padding: 20px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }

          .step {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            position: relative;
            z-index: 1;
          }

          .step span {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            transition: all 0.3s ease;
          }

          .step.active span {
            background: #10b981;
            box-shadow: 0 0 20px rgba(16, 185, 129, 0.5);
          }

          .step p {
            color: white;
            font-size: 12px;
            margin: 0;
            font-weight: 500;
          }

          .divider {
            flex: 1;
            height: 2px;
            background: rgba(255, 255, 255, 0.2);
            margin: 0 10px;
          }

          @media (max-width: 768px) {
            .step-indicator {
              flex-wrap: wrap;
              gap: 10px;
            }
            .divider {
              flex-basis: 100%;
              margin: 10px 0;
              height: 1px;
            }
          }

          /* Cards */
          .content-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 24px;
            margin-bottom: 30px;
          }

          .card {
            background: white;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
          }

          .card:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 40px rgba(0, 0, 0, 0.3);
          }

          .card-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
          }

          .card-header h3 {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
          }

          .card-header .icon {
            font-size: 24px;
          }

          .card-body {
            padding: 24px;
          }

          /* Search Group */
          .search-group {
            display: flex;
            gap: 12px;
            margin-bottom: 20px;
          }

          .search-input,
          .amount-input {
            flex: 1;
            padding: 12px 16px;
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            font-size: 14px;
            transition: border-color 0.3s ease;
          }

          .search-input:focus,
          .amount-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .amount-input:disabled {
            background: #f3f4f6;
            cursor: not-allowed;
          }

          /* Buttons */
          .btn {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }

          .btn-primary:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
          }

          .btn-success {
            background: #10b981;
            color: white;
          }

          .btn-success:hover:not(:disabled) {
            background: #059669;
          }

          .btn-success:disabled {
            background: #d1d5db;
            cursor: not-allowed;
          }

          .btn-secondary {
            background: #6366f1;
            color: white;
          }

          .btn-outline {
            background: transparent;
            color: #667eea;
            border: 2px solid #667eea;
          }

          .btn-small {
            padding: 8px 12px;
            font-size: 12px;
          }

          .btn-approve {
            background: #10b981;
            color: white;
          }

          .btn-view {
            background: #3b82f6;
            color: white;
          }

          .full-width {
            width: 100%;
            margin-top: 20px;
          }

          /* User Info */
          .user-info {
            background: #f0f9ff;
            border-left: 4px solid #667eea;
            padding: 16px;
            border-radius: 8px;
            margin-top: 16px;
          }

          .info-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 14px;
          }

          .info-row span {
            color: #6b7280;
            font-weight: 500;
          }

          .info-row strong {
            color: #1f2937;
          }

          .coin-badge {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white !important;
            padding: 4px 12px;
            border-radius: 20px;
            display: inline-block;
          }

          .error-msg {
            background: #fee2e2;
            color: #991b1b;
            padding: 12px;
            border-radius: 8px;
            margin-top: 12px;
            font-size: 13px;
          }

          /* Table */
          .table-responsive {
            overflow-x: auto;
          }

          .history-table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
          }

          .history-table thead {
            background: #f3f4f6;
          }

          .history-table th,
          .history-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }

          .history-table th {
            font-weight: 600;
            color: #374151;
          }

          .history-table tbody tr {
            transition: background-color 0.3s ease;
          }

          .history-table tbody tr:hover {
            background: #f9fafb;
          }

          .history-table tbody tr.pending {
            background: #fef3c7;
          }

          .history-table tbody tr.done {
            background: #dcfce7;
          }

          .id-cell {
            font-family: 'Courier New', monospace;
            font-size: 12px;
          }

          .amount-cell {
            font-weight: 600;
            color: #667eea;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
          }

          .status-badge.pending {
            background: #fef3c7;
            color: #92400e;
          }

          .status-badge.done {
            background: #dcfce7;
            color: #166534;
          }

          /* Receipt */
          .receipt {
            background: #fff9e6;
          }

          .receipt-container {
            background: white;
            padding: 32px;
            border: 2px dashed #e5e7eb;
            border-radius: 8px;
            margin-bottom: 20px;
            font-family: 'Courier New', monospace;
          }

          .receipt-header {
            text-align: center;
            margin-bottom: 20px;
          }

          .receipt-header h2 {
            margin: 0 0 10px 0;
            color: #1f2937;
            font-size: 18px;
            letter-spacing: 1px;
          }

          .receipt-section h4 {
            margin: 20px 0 10px 0;
            color: #374151;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }

          .receipt-row {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            font-size: 13px;
            border-bottom: 1px dotted #e5e7eb;
          }

          .receipt-row span {
            color: #6b7280;
          }

          .receipt-row strong {
            color: #1f2937;
            font-weight: 600;
          }

          .receipt-row .highlight {
            color: #667eea;
            font-size: 16px;
          }

          .receipt-row .status-success {
            color: #10b981;
          }

          .mono {
            font-family: 'Courier New', monospace;
            font-size: 11px;
          }

          .divider-line {
            border-bottom: 1px dashed #e5e7eb;
            margin: 16px 0;
          }

          .receipt-footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 20px;
            border-top: 1px dashed #e5e7eb;
            font-size: 12px;
            color: #6b7280;
          }

          .receipt-footer p {
            margin: 5px 0;
          }

          .timestamp {
            color: #9ca3af;
            font-size: 11px;
          }

          .receipt-actions {
            display: flex;
            gap: 12px;
            justify-content: center;
            flex-wrap: wrap;
          }

          .receipt-actions .btn {
            flex: 1;
            min-width: 140px;
          }

          /* Print Styles */
          @media print {
            .recharge-container {
              background: white;
              padding: 0;
              margin: 0;
            }
            .step-indicator,
            .content-grid,
            .step3,
            .receipt-actions {
              display: none;
            }
            .card {
              box-shadow: none;
              border: 1px solid #e5e7eb;
            }
            .receipt-container {
              border: 1px solid #e5e7eb;
            }
          }

          /* Responsive */
          @media (max-width: 768px) {
            .recharge-container {
              padding: 12px;
            }
            .content-grid {
              grid-template-columns: 1fr;
              gap: 16px;
            }
            .card-body {
              padding: 16px;
            }
            .receipt-container {
              padding: 16px;
            }
            .history-table {
              font-size: 12px;
            }
            .history-table th,
            .history-table td {
              padding: 8px;
            }
            .receipt-actions .btn {
              min-width: auto;
              padding: 10px 16px;
            }
          }
        `}</style>
      </div>
    </Layout>
  );
}
