import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { baseURL } from "@/utils/config";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import ReasonDialog from "@/component/hostRequest/HostReasonDialog";
import {
  acceptOrDeclineWithdrawRequestForAgency,
  getWithdrawalRequest,
} from "@/store/withdrawalSlice";
import infoImage from "@/assets/images/info.svg";
import { Modal } from "@mui/material";
import male from "@/assets/images/male.png";
import CommonDialog from "@/utils/CommonDialog";
import WithdrawPendingShimmer from "../shimmer/WithdrawPendingShimmer";

const hostPendingStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .hpnd-wrap {
    font-family: 'Outfit', sans-serif;
  }

  /* ── Summary strip ── */
  .hpnd-summary {
    display: flex;
    gap: 12px;
    padding: 16px 20px 14px;
    flex-wrap: wrap;
  }

  .hpnd-stat {
    display: flex;
    align-items: center;
    gap: 11px;
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-radius: 12px;
    padding: 11px 16px;
    flex: 1;
    min-width: 140px;
    box-shadow: 0 1px 6px rgba(245,158,11,0.05);
    transition: box-shadow .15s, transform .15s;
  }
  .hpnd-stat:hover {
    box-shadow: 0 4px 16px rgba(245,158,11,0.11);
    transform: translateY(-1px);
  }

  .hpnd-stat-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .hpnd-icon-amber  { background: rgba(245,158,11,0.10); }
  .hpnd-icon-green  { background: rgba(16,185,129,0.10); }
  .hpnd-icon-purple { background: rgba(99,102,241,0.10); }

  .hpnd-stat-info { display: flex; flex-direction: column; gap: 1px; }
  .hpnd-stat-label {
    font-size: 11px; font-weight: 600;
    color: #a0a8c0; text-transform: uppercase; letter-spacing: .4px;
  }
  .hpnd-stat-value {
    font-family: 'Nunito', sans-serif;
    font-size: 19px; font-weight: 900; color: #1e2235;
  }

  /* ── Topbar ── */
  .hpnd-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid #e8eaf2;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(245,158,11,0.03) 0%, rgba(251,191,36,0.01) 100%);
    flex-wrap: wrap;
    gap: 10px;
  }

  .hpnd-count-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 13px;
    border-radius: 8px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    font-size: 12px;
    font-weight: 700;
    color: #d97706;
  }

  .hpnd-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #f59e0b;
    animation: hpndPulse 1.8s ease-in-out infinite;
  }

  @keyframes hpndPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(1.55); }
  }

  /* ── Search ── */
  .hpnd-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f4f5fb;
    border: 1.5px solid #e8eaf2;
    border-radius: 10px;
    padding: 0 13px;
    height: 36px;
    width: 220px;
    transition: border-color .15s, box-shadow .15s;
  }
  .hpnd-search:focus-within {
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.09);
  }
  .hpnd-search input {
    border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #1e2235;
    outline: none; width: 100%;
  }
  .hpnd-search input::placeholder { color: #a0a8c0; }
  .hpnd-search svg { color: #a0a8c0; flex-shrink: 0; }

  /* ── No badge ── */
  .hpnd-no {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px; height: 26px;
    border-radius: 6px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    font-size: 11.5px;
    font-weight: 800;
    color: #d97706;
  }

  /* ── UID ── */
  .hpnd-uid {
    font-size: 12px;
    font-weight: 700;
    color: #6366f1;
    background: rgba(99,102,241,0.07);
    border: 1px dashed rgba(99,102,241,0.25);
    border-radius: 6px;
    padding: 3px 9px;
    letter-spacing: .4px;
    white-space: nowrap;
  }

  /* ── Host cell ── */
  .hpnd-host-cell {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hpnd-host-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2.5px solid #e8eaf2;
    flex-shrink: 0;
    transition: border-color .15s, box-shadow .15s;
  }
  .hpnd-host-avatar:hover {
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.12);
  }
  .hpnd-host-name {
    font-size: 13px; font-weight: 600;
    color: #1e2235; white-space: nowrap; text-transform: capitalize;
  }

  /* ── Coin ── */
  .hpnd-coin {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    font-size: 12.5px; font-weight: 700; color: #d97706;
  }

  /* ── Amount ── */
  .hpnd-amount {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px;
    background: rgba(16,185,129,0.09);
    border: 1px solid rgba(16,185,129,0.20);
    font-size: 12.5px; font-weight: 700; color: #059669;
  }

  /* ── Date ── */
  .hpnd-date {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; color: #64748b;
    white-space: nowrap;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    border-radius: 20px;
    padding: 3px 10px;
  }
  .hpnd-date svg { color: #a0a8c0; }

  /* ── Info btn ── */
  .hpnd-info-btn {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    background: rgba(99,102,241,0.07);
    border: 1.5px solid rgba(99,102,241,0.18);
    transition: background .15s, box-shadow .15s, transform .12s;
  }
  .hpnd-info-btn:hover {
    background: rgba(99,102,241,0.14);
    border-color: rgba(99,102,241,0.34);
    box-shadow: 0 3px 10px rgba(99,102,241,0.13);
    transform: translateY(-1px);
  }
  .hpnd-info-btn img { width: 16px; height: 16px; object-fit: contain; }

  /* ── Action buttons group ── */
  .hpnd-actions {
    display: flex;
    align-items: center;
    gap: 7px;
  }

  /* Accept btn */
  .hpnd-accept-btn {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    background: rgba(16,185,129,0.09);
    border: 1.5px solid rgba(16,185,129,0.22);
    transition: background .15s, box-shadow .15s, transform .12s;
  }
  .hpnd-accept-btn:hover {
    background: rgba(16,185,129,0.18);
    border-color: rgba(16,185,129,0.40);
    box-shadow: 0 3px 12px rgba(16,185,129,0.16);
    transform: translateY(-1px);
  }

  /* Decline btn */
  .hpnd-decline-btn {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    background: rgba(244,63,94,0.07);
    border: 1.5px solid rgba(244,63,94,0.18);
    transition: background .15s, box-shadow .15s, transform .12s;
  }
  .hpnd-decline-btn:hover {
    background: rgba(244,63,94,0.15);
    border-color: rgba(244,63,94,0.36);
    box-shadow: 0 3px 12px rgba(244,63,94,0.13);
    transform: translateY(-1px);
  }

  /* ── Pagination ── */
  .hpnd-pagination {
    border-top: 1px solid #e8eaf2;
    padding: 12px 20px;
    background: linear-gradient(0deg, rgba(245,158,11,0.02), transparent);
  }

  /* ── Modal ── */
  .hpnd-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 8px 40px rgba(245,158,11,0.14);
    overflow: hidden;
    outline: none;
    animation: hpndFade .2s ease;
  }

  @keyframes hpndFade {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .hpnd-modal-head {
    background: linear-gradient(120deg, #f59e0b 0%, #fbbf24 100%);
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .hpnd-modal-head::before {
    content: '';
    position: absolute;
    top: -20px; right: -20px;
    width: 80px; height: 80px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    pointer-events: none;
  }

  .hpnd-modal-head h3 {
    font-family: 'Nunito', sans-serif;
    font-size: 17px; font-weight: 900;
    color: #fff; margin: 0;
    display: flex; align-items: center; gap: 8px;
    z-index: 1;
  }

  .hpnd-modal-close {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.20);
    border: 1.5px solid rgba(255,255,255,0.32);
    color: #fff; font-size: 16px; cursor: pointer;
    transition: background .14s; z-index: 1;
  }
  .hpnd-modal-close:hover { background: rgba(255,255,255,0.32); }

  .hpnd-modal-body {
    padding: 20px 22px;
    display: flex; flex-direction: column; gap: 11px;
    max-height: 60vh; overflow-y: auto;
  }
  .hpnd-modal-body::-webkit-scrollbar { width: 4px; }
  .hpnd-modal-body::-webkit-scrollbar-track { background: #f4f5fb; }
  .hpnd-modal-body::-webkit-scrollbar-thumb { background: rgba(245,158,11,0.25); border-radius: 4px; }

  .hpnd-modal-field { display: flex; flex-direction: column; gap: 4px; }
  .hpnd-modal-label {
    font-size: 11px; font-weight: 700; color: #a0a8c0;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .hpnd-modal-value {
    font-size: 13.5px; font-weight: 600; color: #1e2235;
    background: #f4f5fb; border: 1.5px solid #e8eaf2;
    border-radius: 9px; padding: 9px 13px;
  }

  .hpnd-modal-footer {
    padding: 14px 22px;
    border-top: 1px solid #e8eaf2;
    display: flex; justify-content: flex-end;
    background: linear-gradient(0deg, rgba(245,158,11,0.02), transparent);
  }

  .hpnd-close-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 20px; border-radius: 10px;
    background: #f4f5fb; border: 1.5px solid #e8eaf2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 700; color: #64748b;
    cursor: pointer; transition: background .14s, border-color .14s;
  }
  .hpnd-close-btn:hover { background: #eef0f8; border-color: #d0d4e8; }
`;

const PendingWithdrawReq = (props: any) => {
  const { statusType, type, startDate, endDate } = props;

  const person = type === "user" ? 3 : type === "host" ? 2 : type === "agency" ? 1 : null;
  const status =
    statusType === "pending_Request" ? 1
    : statusType === "accepted_Request" ? 2
    : statusType === "declined_Request" ? 3
    : null;

  const { withDrawal, totalWithdrawal } = useSelector((state: RootStore) => state.withdrawal);
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const dispatch = useAppDispatch();
  const [search, setSearch] = useState<string | undefined>("All");
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [openInfo, setOpenInfo] = useState(false);
  const [infoData, setInfodata] = useState<any>();
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);

  useEffect(() => {
    const payload: any = {
      start: page, limit: rowsPerPage,
      search, startDate, endDate,
      person: 2, status,
    };
    if (status && person && type) dispatch(getWithdrawalRequest(payload));
  }, [dispatch, page, rowsPerPage, search, person, status, startDate, endDate, type]);

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10)); setPage(1);
  };
  const handleOpenInfo    = (row: any) => { setOpenInfo(true); setInfodata(row); };
  const handleCloseInfo   = () => setOpenInfo(false);
  const handleActionAccept  = (row: any) => { setSelectedId(row); setShowDialog(true); };
  const handleActionDeclined = (row: any) => dispatch(openDialog({ type: "reasondialog", data: { _id: row } }));

  const handleAcceptRequest = async () => {
    if (selectedId) {
      dispatch(acceptOrDeclineWithdrawRequestForAgency({
        requestId: selectedId?._id,
        hostId: selectedId?.hostId?._id,
        type: "approve",
      }));
      setShowDialog(false);
    }
  };

  const totalCoins = Array.isArray(withDrawal)
    ? withDrawal.reduce((s: number, r: any) => s + (r?.coin ?? 0), 0) : 0;
  const totalAmount = Array.isArray(withDrawal)
    ? withDrawal.reduce((s: number, r: any) => s + (r?.amount ?? 0), 0) : 0;

  const withdrawPendingTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span className="hpnd-no">{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },
    {
      Header: "Unique Id",
      Cell: ({ row }: { row: any }) => (
        <span className="hpnd-uid">{row?.uniqueId || "—"}</span>
      ),
    },
    {
      Header: "Host",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.hostId?.image
          ? row.hostId.image.replace(/\\/g, "/") : "";
        return (
          <div className="hpnd-host-cell">
            <img
              src={row?.hostId?.image ? baseURL + updatedImagePath : male.src}
              alt="Host"
              className="hpnd-host-avatar"
              onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }}
            />
            <span className="hpnd-host-name">{row?.hostId?.name || "—"}</span>
          </div>
        );
      },
    },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="hpnd-coin">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
          </svg>
          {row?.coin ?? 0}
        </span>
      ),
    },
    {
      Header: "Amount",
      Cell: ({ row }: { row: any }) => (
        <span className="hpnd-amount">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          {row?.amount ?? 0}
        </span>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        const formatted = isNaN(date.getTime())
          ? "—"
          : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        return (
          <span className="hpnd-date">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8"  y1="2" x2="8"  y2="6" />
              <line x1="3"  y1="10" x2="21" y2="10" />
            </svg>
            {formatted}
          </span>
        );
      },
    },
    {
      Header: "Info",
      Cell: ({ row }: { row: any }) => (
        <button className="hpnd-info-btn" onClick={() => handleOpenInfo(row)} title="View Info">
          <img src={infoImage.src} alt="Info" />
        </button>
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }: { row: any }) => (
        <div className="hpnd-actions">
          {/* Accept */}
          <button
            className="hpnd-accept-btn"
            onClick={() => handleActionAccept(row)}
            title="Accept"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </button>
          {/* Decline */}
          <button
            className="hpnd-decline-btn"
            onClick={() => handleActionDeclined(row)}
            title="Decline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      ),
    },
  ].filter(Boolean);

  return (
    <>
      <style>{hostPendingStyle}</style>

      {dialogueType === "reasondialog" && <ReasonDialog />}

      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={handleAcceptRequest}
        text="Accept"
      />

      <div className="hpnd-wrap">

        {/* ── Summary strip ── */}
        <div className="hpnd-summary">
          <div className="hpnd-stat">
            <div className="hpnd-stat-icon hpnd-icon-amber">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="hpnd-stat-info">
              <span className="hpnd-stat-label">Total Pending</span>
              <span className="hpnd-stat-value">{totalWithdrawal ?? 0}</span>
            </div>
          </div>
          <div className="hpnd-stat">
            <div className="hpnd-stat-icon hpnd-icon-amber">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="hpnd-stat-info">
              <span className="hpnd-stat-label">Total Coins</span>
              <span className="hpnd-stat-value">{totalCoins}</span>
            </div>
          </div>
          <div className="hpnd-stat">
            <div className="hpnd-stat-icon hpnd-icon-green">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="hpnd-stat-info">
              <span className="hpnd-stat-label">Total Amount</span>
              <span className="hpnd-stat-value">{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* ── Topbar ── */}
        <div className="hpnd-topbar">
          <span className="hpnd-count-badge">
            <span className="hpnd-badge-dot" />
            {totalWithdrawal ?? 0} Pending
          </span>
          <div className="hpnd-search">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search…"
              value={search === "All" ? "" : search}
              onChange={e => setSearch(e.target.value || "All")}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <Table
          data={withDrawal}
          mapData={withdrawPendingTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<WithdrawPendingShimmer />}
        />

        {/* ── Pagination ── */}
        <div className="hpnd-pagination">
          <Pagination
            type="server"
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalWithdrawal}
          />
        </div>
      </div>

      {/* ── Info Modal ── */}
      <Modal open={openInfo} onClose={handleCloseInfo}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", height: "100vh", padding: "20px",
        }}>
          <div className="hpnd-modal">
            <div className="hpnd-modal-head">
              <h3>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Payment Detail Info
              </h3>
              <button className="hpnd-modal-close" onClick={handleCloseInfo}>
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="hpnd-modal-body">
              <div className="hpnd-modal-field">
                <span className="hpnd-modal-label">Payment Gateway</span>
                <div className="hpnd-modal-value">{infoData?.paymentGateway || "—"}</div>
              </div>
              {infoData?.paymentDetails &&
                Object.entries(infoData.paymentDetails).map(([key, value]: [string, any]) => (
                  <div className="hpnd-modal-field" key={key}>
                    <span className="hpnd-modal-label">{key || "—"}</span>
                    <div className="hpnd-modal-value">{String(value) || "—"}</div>
                  </div>
                ))
              }
            </div>
            <div className="hpnd-modal-footer">
              <button className="hpnd-close-btn" onClick={handleCloseInfo}>Close</button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PendingWithdrawReq;