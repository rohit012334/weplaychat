import { RootStore, useAppDispatch } from '@/store/store';
import { baseURL } from '@/utils/config';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Table from '@/extra/Table';
import Pagination from '@/extra/Pagination';
import ReasonDialog from '@/component/hostRequest/HostReasonDialog';
import { getWithdrawalRequest } from '@/store/withdrawalSlice';
import male from "@/assets/images/male.png";
import infoImage from "@/assets/images/info.svg";
import { Modal } from '@mui/material';
import WithdrawPendingShimmer from '../shimmer/WithdrawPendingShimmer';

const hostDeclineStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .hdcl-wrap { font-family: 'Outfit', sans-serif; }

  /* ── Summary strip ── */
  .hdcl-summary {
    display: flex; gap: 12px;
    padding: 16px 20px 14px; flex-wrap: wrap;
  }

  .hdcl-stat {
    display: flex; align-items: center; gap: 11px;
    background: #fff; border: 1.5px solid #e8eaf2;
    border-radius: 12px; padding: 11px 16px;
    flex: 1; min-width: 140px;
    box-shadow: 0 1px 6px rgba(244,63,94,0.05);
    transition: box-shadow .15s, transform .15s;
  }
  .hdcl-stat:hover {
    box-shadow: 0 4px 16px rgba(244,63,94,0.11);
    transform: translateY(-1px);
  }

  .hdcl-stat-icon {
    width: 38px; height: 38px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center; flex-shrink: 0;
  }
  .hdcl-icon-red    { background: rgba(244,63,94,0.09); }
  .hdcl-icon-amber  { background: rgba(245,158,11,0.10); }
  .hdcl-icon-purple { background: rgba(99,102,241,0.10); }

  .hdcl-stat-info { display: flex; flex-direction: column; gap: 1px; }
  .hdcl-stat-label {
    font-size: 11px; font-weight: 600; color: #a0a8c0;
    text-transform: uppercase; letter-spacing: .4px;
  }
  .hdcl-stat-value {
    font-family: 'Nunito', sans-serif;
    font-size: 19px; font-weight: 900; color: #1e2235;
  }

  /* ── Topbar ── */
  .hdcl-topbar {
    display: flex; align-items: center; justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid #e8eaf2; border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(244,63,94,0.03) 0%, rgba(251,113,133,0.01) 100%);
    flex-wrap: wrap; gap: 10px;
  }

  .hdcl-count-badge {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 13px; border-radius: 8px;
    background: rgba(244,63,94,0.08);
    border: 1px solid rgba(244,63,94,0.20);
    font-size: 12px; font-weight: 700; color: #e11d48;
  }

  .hdcl-badge-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: #f43f5e;
    animation: hdclPulse 2s ease-in-out infinite;
  }

  @keyframes hdclPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(1.55); }
  }

  /* ── Search ── */
  .hdcl-search {
    display: flex; align-items: center; gap: 8px;
    background: #f4f5fb; border: 1.5px solid #e8eaf2;
    border-radius: 10px; padding: 0 13px;
    height: 36px; width: 220px;
    transition: border-color .15s, box-shadow .15s;
  }
  .hdcl-search:focus-within {
    border-color: #f43f5e;
    box-shadow: 0 0 0 3px rgba(244,63,94,0.08);
  }
  .hdcl-search input {
    border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #1e2235; outline: none; width: 100%;
  }
  .hdcl-search input::placeholder { color: #a0a8c0; }
  .hdcl-search svg { color: #a0a8c0; flex-shrink: 0; }

  /* ── Row No ── */
  .hdcl-no {
    display: inline-flex; align-items: center; justify-content: center;
    width: 26px; height: 26px; border-radius: 6px;
    background: rgba(244,63,94,0.08);
    border: 1px solid rgba(244,63,94,0.20);
    font-size: 11.5px; font-weight: 800; color: #e11d48;
  }

  /* ── UID ── */
  .hdcl-uid {
    font-size: 12px; font-weight: 700; color: #6366f1;
    background: rgba(99,102,241,0.07);
    border: 1px dashed rgba(99,102,241,0.25);
    border-radius: 6px; padding: 3px 9px;
    letter-spacing: .4px; white-space: nowrap;
  }

  /* ── Host cell ── */
  .hdcl-host-cell { display: flex; align-items: center; gap: 10px; }
  .hdcl-host-avatar {
    width: 40px; height: 40px; border-radius: 50%;
    object-fit: cover; border: 2.5px solid #e8eaf2; flex-shrink: 0;
    transition: border-color .15s, box-shadow .15s;
  }
  .hdcl-host-avatar:hover {
    border-color: #f43f5e;
    box-shadow: 0 0 0 3px rgba(244,63,94,0.10);
  }
  .hdcl-host-name {
    font-size: 13px; font-weight: 600;
    color: #1e2235; white-space: nowrap; text-transform: capitalize;
  }

  /* ── Reason pill ── */
  .hdcl-reason {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px; max-width: 180px;
    background: rgba(244,63,94,0.07);
    border: 1px solid rgba(244,63,94,0.18);
    font-size: 12px; font-weight: 600; color: #e11d48;
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
  }

  /* ── Coin ── */
  .hdcl-coin {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    font-size: 12.5px; font-weight: 700; color: #d97706;
  }

  /* ── Amount ── */
  .hdcl-amount {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 8px;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.18);
    font-size: 12.5px; font-weight: 700; color: #6366f1;
  }

  /* ── Date ── */
  .hdcl-date {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; color: #64748b;
    white-space: nowrap; background: #f4f5fb;
    border: 1px solid #e8eaf2; border-radius: 20px; padding: 3px 10px;
  }
  .hdcl-date svg { color: #a0a8c0; }

  /* ── Info btn ── */
  .hdcl-info-btn {
    width: 34px; height: 34px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    background: rgba(244,63,94,0.07);
    border: 1.5px solid rgba(244,63,94,0.18);
    transition: background .15s, box-shadow .15s, transform .12s;
  }
  .hdcl-info-btn:hover {
    background: rgba(244,63,94,0.14);
    border-color: rgba(244,63,94,0.34);
    box-shadow: 0 3px 10px rgba(244,63,94,0.12);
    transform: translateY(-1px);
  }
  .hdcl-info-btn img { width: 16px; height: 16px; object-fit: contain; }

  /* ── Pagination ── */
  .hdcl-pagination {
    border-top: 1px solid #e8eaf2; padding: 12px 20px;
    background: linear-gradient(0deg, rgba(244,63,94,0.02), transparent);
  }

  /* ── Modal ── */
  .hdcl-modal {
    background: #fff; border-radius: 18px;
    width: 100%; max-width: 460px;
    box-shadow: 0 8px 40px rgba(244,63,94,0.14);
    overflow: hidden; outline: none;
    animation: hdclFade .2s ease;
  }

  @keyframes hdclFade {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .hdcl-modal-head {
    background: linear-gradient(120deg, #f43f5e 0%, #fb7185 100%);
    padding: 18px 22px;
    display: flex; align-items: center; justify-content: space-between;
    position: relative; overflow: hidden;
  }
  .hdcl-modal-head::before {
    content: ''; position: absolute;
    top: -20px; right: -20px;
    width: 80px; height: 80px; border-radius: 50%;
    background: rgba(255,255,255,0.08); pointer-events: none;
  }
  .hdcl-modal-head h3 {
    font-family: 'Nunito', sans-serif;
    font-size: 17px; font-weight: 900; color: #fff; margin: 0;
    display: flex; align-items: center; gap: 8px; z-index: 1;
  }
  .hdcl-modal-close {
    width: 30px; height: 30px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.20);
    border: 1.5px solid rgba(255,255,255,0.32);
    color: #fff; font-size: 16px; cursor: pointer;
    transition: background .14s; z-index: 1;
  }
  .hdcl-modal-close:hover { background: rgba(255,255,255,0.32); }

  .hdcl-modal-body {
    padding: 20px 22px; display: flex; flex-direction: column; gap: 11px;
    max-height: 60vh; overflow-y: auto;
  }
  .hdcl-modal-body::-webkit-scrollbar { width: 4px; }
  .hdcl-modal-body::-webkit-scrollbar-track { background: #f4f5fb; }
  .hdcl-modal-body::-webkit-scrollbar-thumb { background: rgba(244,63,94,0.25); border-radius: 4px; }

  .hdcl-modal-field { display: flex; flex-direction: column; gap: 4px; }
  .hdcl-modal-label {
    font-size: 11px; font-weight: 700; color: #a0a8c0;
    text-transform: uppercase; letter-spacing: .5px;
  }
  .hdcl-modal-value {
    font-size: 13.5px; font-weight: 600; color: #1e2235;
    background: #f4f5fb; border: 1.5px solid #e8eaf2;
    border-radius: 9px; padding: 9px 13px;
  }

  .hdcl-modal-footer {
    padding: 14px 22px; border-top: 1px solid #e8eaf2;
    display: flex; justify-content: flex-end;
    background: linear-gradient(0deg, rgba(244,63,94,0.02), transparent);
  }
  .hdcl-close-btn {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 9px 20px; border-radius: 10px;
    background: #f4f5fb; border: 1.5px solid #e8eaf2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 700; color: #64748b;
    cursor: pointer; transition: background .14s, border-color .14s;
  }
  .hdcl-close-btn:hover { background: #eef0f8; border-color: #d0d4e8; }
`;

const DeclineWithdrawRequest = (props: any) => {
  const { statusType, type, startDate, endDate } = props;

  const person = type === "user" ? 3 : type === "host" ? 2 : type === "agency" ? 1 : null;
  const status =
    statusType === "pending_Request" ? 1
    : statusType === "accepted_Request" ? 2
    : statusType === "declined_Request" ? 3 : null;

  const { declinedWIthdrawal, totalDeclinedWithdrawal } = useSelector(
    (state: RootStore) => state.withdrawal
  );
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const dispatch = useAppDispatch();
  const [search, setSearch] = useState<string | undefined>("All");
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [openInfo, setOpenInfo] = useState(false);
  const [infoData, setInfodata] = useState<any>();

  useEffect(() => {
    const payload: any = {
      start: page, limit: rowsPerPage,
      search, startDate, endDate,
      person: 2, status: 3,
    };
    if (status && person) dispatch(getWithdrawalRequest(payload));
  }, [dispatch, page, rowsPerPage, search, person, status, startDate, endDate]);

  const handleChangePage    = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => { setRowsPerPage(parseInt(event, 10)); setPage(1); };
  const handleOpenInfo  = (row: any) => { setOpenInfo(true); setInfodata(row); };
  const handleCloseInfo = () => setOpenInfo(false);

  const totalCoins = Array.isArray(declinedWIthdrawal)
    ? declinedWIthdrawal.reduce((s: number, r: any) => s + (r?.coin ?? 0), 0) : 0;
  const totalAmount = Array.isArray(declinedWIthdrawal)
    ? declinedWIthdrawal.reduce((s: number, r: any) => s + (r?.amount ?? 0), 0) : 0;

  const withdrawDeclinedtable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span className="hdcl-no">{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },
    {
      Header: "Unique Id",
      Cell: ({ row }: { row: any }) => (
        <span className="hdcl-uid">{row?.uniqueId || "—"}</span>
      ),
    },
    {
      Header: "Host",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.hostId?.image
          ? row.hostId.image.replace(/\\/g, "/") : "";
        return (
          <div className="hdcl-host-cell">
            <img
              src={row?.hostId?.image ? baseURL + updatedImagePath : male.src}
              alt="Host"
              className="hdcl-host-avatar"
              onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }}
            />
            <span className="hdcl-host-name">{row?.hostId?.name || "—"}</span>
          </div>
        );
      },
    },
    {
      Header: "Reason",
      Cell: ({ row }: { row: any }) => (
        <span className="hdcl-reason" title={row?.reason || "—"}>
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {row?.reason || "—"}
        </span>
      ),
    },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="hdcl-coin">
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
        <span className="hdcl-amount">
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
          <span className="hdcl-date">
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
        <button className="hdcl-info-btn" onClick={() => handleOpenInfo(row)} title="View Info">
          <img src={infoImage.src} alt="Info" />
        </button>
      ),
    },
  ];

  return (
    <>
      <style>{hostDeclineStyle}</style>

      {dialogueType === "reasondialog" && <ReasonDialog />}

      <div className="hdcl-wrap">

        {/* ── Summary strip ── */}
        <div className="hdcl-summary">
          <div className="hdcl-stat">
            <div className="hdcl-stat-icon hdcl-icon-red">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#f43f5e" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </div>
            <div className="hdcl-stat-info">
              <span className="hdcl-stat-label">Total Declined</span>
              <span className="hdcl-stat-value">{totalDeclinedWithdrawal ?? 0}</span>
            </div>
          </div>
          <div className="hdcl-stat">
            <div className="hdcl-stat-icon hdcl-icon-amber">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="hdcl-stat-info">
              <span className="hdcl-stat-label">Total Coins</span>
              <span className="hdcl-stat-value">{totalCoins}</span>
            </div>
          </div>
          <div className="hdcl-stat">
            <div className="hdcl-stat-icon hdcl-icon-purple">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="hdcl-stat-info">
              <span className="hdcl-stat-label">Total Amount</span>
              <span className="hdcl-stat-value">{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* ── Topbar ── */}
        <div className="hdcl-topbar">
          <span className="hdcl-count-badge">
            <span className="hdcl-badge-dot" />
            {totalDeclinedWithdrawal ?? 0} Declined
          </span>
          <div className="hdcl-search">
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
          data={declinedWIthdrawal}
          mapData={withdrawDeclinedtable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<WithdrawPendingShimmer />}
        />

        {/* ── Pagination ── */}
        <div className="hdcl-pagination">
          <Pagination
            type="server"
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalDeclinedWithdrawal}
          />
        </div>
      </div>

      {/* ── Info Modal ── */}
      <Modal open={openInfo} onClose={handleCloseInfo}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", height: "100vh", padding: "20px",
        }}>
          <div className="hdcl-modal">
            <div className="hdcl-modal-head">
              <h3>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Payment Detail Info
              </h3>
              <button className="hdcl-modal-close" onClick={handleCloseInfo}>
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="hdcl-modal-body">
              <div className="hdcl-modal-field">
                <span className="hdcl-modal-label">Payment Gateway</span>
                <div className="hdcl-modal-value">{infoData?.paymentGateway || "—"}</div>
              </div>
              {infoData?.paymentDetails &&
                Object.entries(infoData.paymentDetails).map(([key, value]: [string, any]) => (
                  <div className="hdcl-modal-field" key={key}>
                    <span className="hdcl-modal-label">{key || "—"}</span>
                    <div className="hdcl-modal-value">{String(value) || "—"}</div>
                  </div>
                ))
              }
            </div>
            <div className="hdcl-modal-footer">
              <button className="hdcl-close-btn" onClick={handleCloseInfo}>Close</button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DeclineWithdrawRequest;