import { RootStore, useAppDispatch } from "@/store/store";
import { baseURL } from "@/utils/config";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import ReasonDialog from "@/component/hostRequest/HostReasonDialog";
import { getWithdrawalRequest } from "@/store/withdrawalSlice";
import male from "@/assets/images/male.png";
import infoImage from "@/assets/images/info.svg";
import { Modal } from "@mui/material";
import WithdrawPendingAgencyShimmer from "../shimmer/WithdrawPendingAgencyShimmer";

const acceptedStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .acc-wrap {
    font-family: 'Outfit', sans-serif;
  }

  /* ── Summary strip ── */
  .acc-summary-strip {
    display: flex;
    align-items: stretch;
    gap: 12px;
    margin: 16px 20px;
    flex-wrap: wrap;
  }

  .acc-stat-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-radius: 12px;
    padding: 12px 18px;
    flex: 1;
    min-width: 150px;
    box-shadow: 0 1px 6px rgba(99,102,241,0.05);
    transition: box-shadow .15s;
  }
  .acc-stat-card:hover {
    box-shadow: 0 4px 14px rgba(99,102,241,0.10);
  }

  .acc-stat-icon {
    width: 36px; height: 36px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .acc-stat-icon-green  { background: rgba(16,185,129,0.10); }
  .acc-stat-icon-purple { background: rgba(99,102,241,0.10); }
  .acc-stat-icon-amber  { background: rgba(245,158,11,0.10); }

  .acc-stat-info {
    display: flex;
    flex-direction: column;
    gap: 1px;
  }
  .acc-stat-label {
    font-size: 11px;
    font-weight: 600;
    color: #a0a8c0;
    text-transform: uppercase;
    letter-spacing: .4px;
  }
  .acc-stat-value {
    font-family: 'Nunito', sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: #1e2235;
  }

  /* ── Table topbar ── */
  .acc-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-top: 1px solid #e8eaf2;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(16,185,129,0.03) 0%, rgba(99,102,241,0.02) 100%);
    flex-wrap: wrap;
    gap: 10px;
  }

  .acc-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(16,185,129,0.09);
    border: 1px solid rgba(16,185,129,0.20);
    font-size: 12px;
    font-weight: 700;
    color: #10b981;
  }

  .acc-badge-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #10b981;
  }

  /* ── Search ── */
  .acc-search {
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
  .acc-search:focus-within {
    border-color: #10b981;
    box-shadow: 0 0 0 3px rgba(16,185,129,0.08);
  }
  .acc-search input {
    border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #1e2235;
    outline: none; width: 100%;
  }
  .acc-search input::placeholder { color: #a0a8c0; }
  .acc-search svg { color: #a0a8c0; flex-shrink: 0; }

  /* ── No badge ── */
  .acc-no {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px; height: 26px;
    border-radius: 6px;
    background: rgba(16,185,129,0.08);
    border: 1px solid rgba(16,185,129,0.18);
    font-size: 11.5px;
    font-weight: 800;
    color: #10b981;
  }

  /* ── UID ── */
  .acc-uid {
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

  /* ── Agency cell ── */
  .acc-agency {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .acc-agency-avatar {
    width: 40px; height: 40px;
    border-radius: 10px;
    object-fit: cover;
    border: 2px solid #e8eaf2;
    flex-shrink: 0;
    transition: border-color .15s;
  }
  .acc-agency-avatar:hover { border-color: #10b981; }
  .acc-agency-name {
    font-size: 13px;
    font-weight: 600;
    color: #1e2235;
    white-space: nowrap;
    text-transform: capitalize;
  }

  /* ── Coin ── */
  .acc-coin {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 8px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    font-size: 12.5px;
    font-weight: 700;
    color: #f59e0b;
  }

  /* ── Amount ── */
  .acc-amount {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 8px;
    background: rgba(16,185,129,0.09);
    border: 1px solid rgba(16,185,129,0.20);
    font-size: 12.5px;
    font-weight: 700;
    color: #10b981;
  }

  /* ── Date ── */
  .acc-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
    font-weight: 500;
    white-space: nowrap;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    border-radius: 20px;
    padding: 3px 10px;
  }
  .acc-date svg { color: #a0a8c0; }

  /* ── Info btn ── */
  .acc-info-btn {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    background: rgba(16,185,129,0.08);
    border: 1.5px solid rgba(16,185,129,0.20);
    transition: background .15s, box-shadow .15s, transform .12s;
  }
  .acc-info-btn:hover {
    background: rgba(16,185,129,0.16);
    border-color: rgba(16,185,129,0.38);
    box-shadow: 0 3px 10px rgba(16,185,129,0.14);
    transform: translateY(-1px);
  }
  .acc-info-btn img { width: 16px; height: 16px; object-fit: contain; }

  /* ── Pagination ── */
  .acc-pagination {
    border-top: 1px solid #e8eaf2;
    padding: 12px 20px;
    background: linear-gradient(0deg, rgba(16,185,129,0.02), transparent);
  }

  /* ── Modal ── */
  .acc-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 460px;
    box-shadow: 0 8px 40px rgba(16,185,129,0.15);
    overflow: hidden;
    animation: accFade .2s ease;
    outline: none;
  }

  @keyframes accFade {
    from { opacity:0; transform:translateY(10px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .acc-modal-head {
    background: linear-gradient(120deg, #10b981 0%, #34d399 100%);
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .acc-modal-head h3 {
    font-family: 'Nunito', sans-serif;
    font-size: 17px;
    font-weight: 900;
    color: #fff;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .acc-modal-close {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.20);
    border: 1.5px solid rgba(255,255,255,0.32);
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background .14s;
  }
  .acc-modal-close:hover { background: rgba(255,255,255,0.32); }

  .acc-modal-body {
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 11px;
    max-height: 65vh;
    overflow-y: auto;
  }

  .acc-modal-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .acc-modal-label {
    font-size: 11px;
    font-weight: 700;
    color: #a0a8c0;
    text-transform: uppercase;
    letter-spacing: .5px;
  }

  .acc-modal-value {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e2235;
    background: #f4f5fb;
    border: 1.5px solid #e8eaf2;
    border-radius: 9px;
    padding: 9px 13px;
  }

  .acc-modal-footer {
    padding: 14px 22px;
    border-top: 1px solid #e8eaf2;
    display: flex;
    justify-content: flex-end;
    background: linear-gradient(0deg, rgba(16,185,129,0.02), transparent);
  }

  .acc-close-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 9px 20px;
    border-radius: 10px;
    background: #f4f5fb;
    border: 1.5px solid #e8eaf2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 700;
    color: #64748b;
    cursor: pointer;
    transition: background .14s, border-color .14s;
  }
  .acc-close-btn:hover {
    background: #eef0f8;
    border-color: #d0d4e8;
  }
`;

const AcceptedWithrawRequest = (props: any) => {
  const { statusType, type, startDate, endDate } = props;

  const person =
    type === "user" ? 3 : type === "host" ? 2 : type === "agency" ? 1 : null;
  const status =
    statusType === "pending_Request" ? 1
    : statusType === "accepted_Request" ? 2
    : statusType === "declined_Request" ? 3
    : null;

  const { acceptedWithdrawal, totalAcceptedWithdrawal } = useSelector(
    (state: RootStore) => state.withdrawal
  );
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const dispatch = useAppDispatch();
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string | undefined>("All");
  const [openInfo, setOpenInfo] = useState(false);
  const [infoData, setInfodata] = useState<any>();

  useEffect(() => {
    const payload: any = {
      start: page,
      limit: rowsPerPage,
      search,
      startDate,
      endDate,
      person: 1,
      status: 2,
    };
    if (status && person && statusType && type) {
      dispatch(getWithdrawalRequest(payload));
    }
  }, [dispatch, page, rowsPerPage, search, person, status, startDate, endDate]);

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };
  const handleOpenInfo  = (row: any) => { setOpenInfo(true); setInfodata(row); };
  const handleCloseInfo = () => setOpenInfo(false);

  const withdrawAcceptedtable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span className="acc-no">{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },
    {
      Header: "Unique Id",
      Cell: ({ row }: { row: any }) => (
        <span className="acc-uid">{row?.uniqueId || "—"}</span>
      ),
    },
    {
      Header: "Agency",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.agencyId?.image
          ? row.agencyId.image.replace(/\\/g, "/") : "";
        return (
          <div className="acc-agency">
            <img
              src={row?.agencyId?.image ? baseURL + updatedImagePath : male.src}
              alt="Agency"
              className="acc-agency-avatar"
              onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }}
            />
            <span className="acc-agency-name">{row?.agencyId?.name || "—"}</span>
          </div>
        );
      },
    },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="acc-coin">
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
        <span className="acc-amount">
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
        <span className="acc-date">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8"  y1="2" x2="8"  y2="6" />
            <line x1="3"  y1="10" x2="21" y2="10" />
          </svg>
          {row?.acceptOrDeclineDate?.split(",")[0] || "—"}
        </span>
      ),
    },
    {
      Header: "Info",
      Cell: ({ row }: { row: any }) => (
        <button className="acc-info-btn" onClick={() => handleOpenInfo(row)} title="View Info">
          <img src={infoImage.src} alt="Info" />
        </button>
      ),
    },
  ];

  const totalCoins = Array.isArray(acceptedWithdrawal)
    ? acceptedWithdrawal.reduce((s: number, r: any) => s + (r?.coin ?? 0), 0)
    : 0;
  const totalAmount = Array.isArray(acceptedWithdrawal)
    ? acceptedWithdrawal.reduce((s: number, r: any) => s + (r?.amount ?? 0), 0)
    : 0;

  return (
    <>
      <style>{acceptedStyle}</style>

      {dialogueType === "reasondialog" && <ReasonDialog />}

      <div className="acc-wrap">

        {/* ── Summary Strip ── */}
        <div className="acc-summary-strip">
          <div className="acc-stat-card">
            <div className="acc-stat-icon acc-stat-icon-green">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#10b981" strokeWidth="2.2" strokeLinecap="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div className="acc-stat-info">
              <span className="acc-stat-label">Total Accepted</span>
              <span className="acc-stat-value">{totalAcceptedWithdrawal ?? 0}</span>
            </div>
          </div>
          <div className="acc-stat-card">
            <div className="acc-stat-icon acc-stat-icon-amber">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
            </div>
            <div className="acc-stat-info">
              <span className="acc-stat-label">Total Coins</span>
              <span className="acc-stat-value">{totalCoins}</span>
            </div>
          </div>
          <div className="acc-stat-card">
            <div className="acc-stat-icon acc-stat-icon-purple">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div className="acc-stat-info">
              <span className="acc-stat-label">Total Amount</span>
              <span className="acc-stat-value">{totalAmount}</span>
            </div>
          </div>
        </div>

        {/* ── Table topbar ── */}
        <div className="acc-topbar">
          <span className="acc-badge">
            <span className="acc-badge-dot" />
            {totalAcceptedWithdrawal ?? 0} Accepted
          </span>
          <div className="acc-search">
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
          data={acceptedWithdrawal}
          mapData={withdrawAcceptedtable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<WithdrawPendingAgencyShimmer />}
        />

        {/* ── Pagination ── */}
        <div className="acc-pagination">
          <Pagination
            type="server"
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalAcceptedWithdrawal}
          />
        </div>
      </div>

      {/* ── Info Modal ── */}
      <Modal open={openInfo} onClose={handleCloseInfo}>
        <div style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", height: "100vh", padding: "20px"
        }}>
          <div className="acc-modal">
            <div className="acc-modal-head">
              <h3>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Payment Detail Info
              </h3>
              <button className="acc-modal-close" onClick={handleCloseInfo}>
                <i className="ri-close-line" />
              </button>
            </div>
            <div className="acc-modal-body">
              <div className="acc-modal-field">
                <span className="acc-modal-label">Payment Gateway</span>
                <div className="acc-modal-value">{infoData?.paymentGateway || "—"}</div>
              </div>
              {infoData?.paymentDetails &&
                Object.entries(infoData.paymentDetails).map(([key, value]: [string, any]) => (
                  <div className="acc-modal-field" key={key}>
                    <span className="acc-modal-label">{key || "—"}</span>
                    <div className="acc-modal-value">{value || "—"}</div>
                  </div>
                ))
              }
            </div>
            <div className="acc-modal-footer">
              <button className="acc-close-btn" onClick={handleCloseInfo}>Close</button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default AcceptedWithrawRequest;