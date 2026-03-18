import { openDialog } from '@/store/dialogSlice';
import { RootStore, useAppDispatch } from '@/store/store';
import { baseURL } from '@/utils/config';
import { useRouter } from 'next/router';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Table from '@/extra/Table';
import Pagination from '@/extra/Pagination';
import ReasonDialog from '@/component/hostRequest/HostReasonDialog';
import { acceptOrDeclineWithdrawRequestForAgency, getWithdrawalRequest } from '@/store/withdrawalSlice';
import infoImage from "@/assets/images/info.svg";
import { Modal } from '@mui/material';
import male from "@/assets/images/male.png";
import CommonDialog from '@/utils/CommonDialog';
import image from "@/assets/images/bannerImage.png";
import AddWithdrawDialogue from '../setting/AddWithdrawDialogue';
import WithdrawPendingAgencyShimmer from '../shimmer/WithdrawPendingAgencyShimmer';

const pendingStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .pnd-wrap {
    font-family: 'Outfit', sans-serif;
  }

  /* ── Top action bar ── */
  .pnd-action-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    flex-wrap: wrap;
    gap: 10px;
  }

  .pnd-action-left {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  /* Hourglass pending indicator */
  .pnd-status-chip {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 6px 14px;
    border-radius: 20px;
    background: rgba(245,158,11,0.10);
    border: 1.5px solid rgba(245,158,11,0.25);
    font-size: 12px;
    font-weight: 700;
    color: #d97706;
  }

  .pnd-status-chip-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #f59e0b;
    animation: pndPulse 1.6s ease-in-out infinite;
  }

  @keyframes pndPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(1.5); }
  }

  /* Add button — amber style */
  .pnd-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 10px;
    background: rgba(245,158,11,0.10);
    border: 1.5px solid rgba(245,158,11,0.28);
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #d97706;
    cursor: pointer;
    transition: background .15s, box-shadow .15s, transform .12s;
  }
  .pnd-add-btn:hover {
    background: rgba(245,158,11,0.18);
    box-shadow: 0 3px 12px rgba(245,158,11,0.18);
    transform: translateY(-1px);
  }

  /* ── Summary strip ── */
  .pnd-summary {
    display: flex;
    gap: 12px;
    padding: 0 20px 16px;
    flex-wrap: wrap;
  }

  .pnd-stat {
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
    transition: box-shadow .15s;
  }
  .pnd-stat:hover { box-shadow: 0 4px 14px rgba(245,158,11,0.10); }

  .pnd-stat-icon {
    width: 36px; height: 36px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .pnd-stat-icon-amber  { background: rgba(245,158,11,0.10); }
  .pnd-stat-icon-purple { background: rgba(99,102,241,0.10); }
  .pnd-stat-icon-green  { background: rgba(16,185,129,0.10); }

  .pnd-stat-info { display: flex; flex-direction: column; gap: 1px; }
  .pnd-stat-label {
    font-size: 11px; font-weight: 600;
    color: #a0a8c0; text-transform: uppercase; letter-spacing: .4px;
  }
  .pnd-stat-value {
    font-family: 'Nunito', sans-serif;
    font-size: 18px; font-weight: 900; color: #1e2235;
  }

  /* ── Table topbar ── */
  .pnd-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid #e8eaf2;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(245,158,11,0.03) 0%, rgba(99,102,241,0.02) 100%);
    flex-wrap: wrap;
    gap: 10px;
  }

  .pnd-count-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    font-size: 12px;
    font-weight: 700;
    color: #d97706;
  }

  /* ── Search ── */
  .pnd-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f4f5fb;
    border: 1.5px solid #e8eaf2;
    border-radius: 10px;
    padding: 0 14px;
    height: 36px;
    width: 220px;
    transition: border-color .15s, box-shadow .15s;
  }
  .pnd-search:focus-within {
    border-color: #f59e0b;
    box-shadow: 0 0 0 3px rgba(245,158,11,0.09);
  }
  .pnd-search input {
    border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #1e2235;
    outline: none; width: 100%;
  }
  .pnd-search input::placeholder { color: #a0a8c0; }
  .pnd-search svg { color: #a0a8c0; flex-shrink: 0; }

  /* ── No badge ── */
  .pnd-no {
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
  .pnd-uid {
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

  /* ── Agency ── */
  .pnd-agency {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pnd-avatar {
    width: 40px; height: 40px;
    border-radius: 10px;
    object-fit: cover;
    border: 2px solid #e8eaf2;
    flex-shrink: 0;
    transition: border-color .15s;
  }
  .pnd-avatar:hover { border-color: #f59e0b; }
  .pnd-agency-name {
    font-size: 13px; font-weight: 600;
    color: #1e2235; white-space: nowrap; text-transform: capitalize;
  }

  /* ── Coin ── */
  .pnd-coin {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    font-size: 12.5px; font-weight: 700; color: #d97706;
  }

  /* ── Amount ── */
  .pnd-amount {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px;
    background: rgba(16,185,129,0.09);
    border: 1px solid rgba(16,185,129,0.20);
    font-size: 12.5px; font-weight: 700; color: #10b981;
  }

  /* ── Date ── */
  .pnd-date {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; color: #64748b;
    white-space: nowrap;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    border-radius: 20px;
    padding: 3px 10px;
  }
  .pnd-date svg { color: #a0a8c0; }

  /* ── Info btn ── */
  .pnd-info-btn {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    background: rgba(245,158,11,0.08);
    border: 1.5px solid rgba(245,158,11,0.22);
    transition: background .15s, box-shadow .15s, transform .12s;
  }
  .pnd-info-btn:hover {
    background: rgba(245,158,11,0.18);
    border-color: rgba(245,158,11,0.40);
    box-shadow: 0 3px 10px rgba(245,158,11,0.14);
    transform: translateY(-1px);
  }
  .pnd-info-btn img { width: 16px; height: 16px; object-fit: contain; }

  /* ── Pagination ── */
  .pnd-pagination {
    border-top: 1px solid #e8eaf2;
    padding: 12px 20px;
    background: linear-gradient(0deg, rgba(245,158,11,0.02), transparent);
  }

  /* ── Modal ── */
  .pnd-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 8px 40px rgba(245,158,11,0.14);
    overflow: hidden;
    outline: none;
    animation: pndFade .2s ease;
  }

  @keyframes pndFade {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .pnd-modal-head {
    background: linear-gradient(120deg, #f59e0b 0%, #fbbf24 100%);
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .pnd-modal-head h3 {
    font-family: 'Nunito', sans-serif;
    font-size: 17px; font-weight: 900;
    color: #fff; margin: 0;
    display: flex; align-items: center; gap: 8px;
  }

  .pnd-modal-close {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.22);
    border: 1.5px solid rgba(255,255,255,0.35);
    color: #fff; font-size: 16px; cursor: pointer;
    transition: background .14s;
  }
  .pnd-modal-close:hover { background: rgba(255,255,255,0.34); }

  .pnd-modal-body {
    padding: 20px 22px;
    display: flex; flex-direction: column; gap: 11px;
    max-height: 60vh; overflow-y: auto;
  }

  .pnd-modal-field { display: flex; flex-direction: column; gap: 4px; }

  .pnd-modal-label {
    font-size: 11px; font-weight: 700; color: #a0a8c0;
    text-transform: uppercase; letter-spacing: .5px;
  }

  .pnd-modal-value {
    font-size: 13.5px; font-weight: 600; color: #1e2235;
    background: #f4f5fb; border: 1.5px solid #e8eaf2;
    border-radius: 9px; padding: 9px 13px;
  }

  .pnd-modal-footer {
    padding: 14px 22px;
    border-top: 1px solid #e8eaf2;
    display: flex; justify-content: flex-end;
    background: linear-gradient(0deg, rgba(245,158,11,0.02), transparent);
  }

  .pnd-close-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 20px; border-radius: 10px;
    background: #f4f5fb; border: 1.5px solid #e8eaf2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 700; color: #64748b;
    cursor: pointer; transition: background .14s, border-color .14s;
  }
  .pnd-close-btn:hover { background: #eef0f8; border-color: #d0d4e8; }
`;

const PendingWithdrawReq = (props: any) => {
  const { statusType, type, startDate, endDate } = props;

  const person = type === "user" ? 3 : type === "host" ? 2 : type === "agency" ? 1 : null;
  const status =
    statusType === "pending_Request" ? 1
    : statusType === "accepted_Request" ? 2
    : statusType === "declined_Request" ? 3
    : null;

  const { withdrawRequest, totalWithdrawal } = useSelector((state: RootStore) => state.withdrawal);
  const { setting }: any = useSelector((state: RootStore) => state?.setting);
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
      search, startDate, endDate, person: 1, status: 1,
    };
    if (status && person && type) dispatch(getWithdrawalRequest(payload));
  }, [dispatch, page, rowsPerPage, search, person, status, startDate, endDate, type]);

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => { setRowsPerPage(parseInt(event, 10)); setPage(1); };
  const handleOpenInfo  = (row: any) => { setOpenInfo(true); setInfodata(row); };
  const handleCloseInfo = () => setOpenInfo(false);

  const handleActionAccept = (id: any) => { setSelectedId(id); setShowDialog(true); };
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

  const totalCoins = Array.isArray(withdrawRequest)
    ? withdrawRequest.reduce((s: number, r: any) => s + (r?.coin ?? 0), 0) : 0;
  const totalAmount = Array.isArray(withdrawRequest)
    ? withdrawRequest.reduce((s: number, r: any) => s + (r?.amount ?? 0), 0) : 0;

  const withdrawPendingTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span className="pnd-no">{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },
    {
      Header: "Unique Id",
      Cell: ({ row }: { row: any }) => (
        <span className="pnd-uid">{row?.uniqueId || "—"}</span>
      ),
    },
    {
      Header: "Agency",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.agencyId?.image
          ? row.agencyId.image.replace(/\\/g, "/") : "";
        return (
          <div className="pnd-agency">
            <img
              src={row?.agencyId?.image ? baseURL + updatedImagePath : male.src}
              alt="Agency"
              className="pnd-avatar"
            />
            <span className="pnd-agency-name">{row?.agencyId?.name || "—"}</span>
          </div>
        );
      },
    },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="pnd-coin">
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
        <span className="pnd-amount">
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
      Header: "Date",
      Cell: ({ row }: { row: any }) => (
        <span className="pnd-date">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8"  y1="2" x2="8"  y2="6" />
            <line x1="3"  y1="10" x2="21" y2="10" />
          </svg>
          {row?.requestDate?.split(",")[0] || "—"}
        </span>
      ),
    },
    {
      Header: "Info",
      Cell: ({ row }: { row: any }) => (
        <button className="pnd-info-btn" onClick={() => handleOpenInfo(row)} title="View Info">
          <img src={infoImage.src} alt="Info" />
        </button>
      ),
    },
  ].filter(Boolean);

  return (
    <>
      <style>{pendingStyle}</style>

      {dialogueType === "withdraw" && <AddWithdrawDialogue />}
      {dialogueType === "reasondialog" && <ReasonDialog />}

      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={handleAcceptRequest}
        text={"Accept"}
      />

      <div className="pnd-wrap">

        {/* ── Action bar ── */}
        <div className="pnd-action-bar">
          <div className="pnd-action-left">
            <span className="pnd-status-chip">
              <span className="pnd-status-chip-dot" />
              Pending Requests
            </span>
          </div>
          <button
            className="pnd-add-btn"
            onClick={() => dispatch(openDialog({ type: "withdraw" }))}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Withdraw
          </button>
        </div>

        {/* ── Summary strip ── */}
        <div className="pnd-summary">
          <div className="pnd-stat">
            <div className="pnd-stat-icon pnd-stat-icon-amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="pnd-stat-info">
              <span className="pnd-stat-label">Total Pending</span>
              <span className="pnd-stat-value">{totalWithdrawal ?? 0}</span>
            </div>
          </div>
          <div className="pnd-stat">
            <div className="pnd-stat-icon pnd-stat-icon-amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="pnd-stat-info">
              <span className="pnd-stat-label">Total Coins</span>
              <span className="pnd-stat-value">{totalCoins}</span>
            </div>
          </div>
          <div className="pnd-stat">
            <div className="pnd-stat-icon pnd-stat-icon-green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#10b981" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="pnd-stat-info">
              <span className="pnd-stat-label">Total Amount</span>
              <span className="pnd-stat-value">{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* ── Table topbar ── */}
        <div className="pnd-topbar">
          <span className="pnd-count-pill">
            <span className="pnd-status-chip-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "#f59e0b", display: "inline-block" }} />
            {totalWithdrawal ?? 0} Pending
          </span>
          <div className="pnd-search">
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
          data={withdrawRequest}
          mapData={withdrawPendingTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<WithdrawPendingAgencyShimmer />}
        />

        {/* ── Pagination ── */}
        <div className="pnd-pagination">
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
          <div className="pnd-modal">
            <div className="pnd-modal-head">
              <h3>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Payment Detail Info
              </h3>
              <button className="pnd-modal-close" onClick={handleCloseInfo}>
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="pnd-modal-body">
              <div className="pnd-modal-field">
                <span className="pnd-modal-label">Payment Gateway</span>
                <div className="pnd-modal-value">{infoData?.paymentGateway || "—"}</div>
              </div>
              {infoData?.paymentDetails &&
                Object.entries(infoData.paymentDetails).map(([key, value]: [string, any]) => (
                  <div className="pnd-modal-field" key={key}>
                    <span className="pnd-modal-label">{key || "—"}</span>
                    <div className="pnd-modal-value">{value || "—"}</div>
                  </div>
                ))
              }
            </div>
            <div className="pnd-modal-footer">
              <button className="pnd-close-btn" onClick={handleCloseInfo}>Close</button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default PendingWithdrawReq;