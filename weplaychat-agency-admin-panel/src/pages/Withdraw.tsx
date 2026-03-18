import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import image from "@/assets/images/bannerImage.png";
import { baseURL } from "@/utils/config";
import { useEffect, useState } from "react";
import Analytics from "@/extra/Analytic";
import { getWithdrawalRequest } from "@/store/withdrawalSlice";
import { RootStore } from "@/store/store";
import AddWithdrawDialogue from "@/component/setting/AddWithdrawDialogue";
import male from "@/assets/images/male.png";
import infoImage from "@/assets/images/info.svg";
import { Modal } from "@mui/material";
import { ExInput } from "@/extra/Input";

const withdrawStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .wd-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  /* ── Header: gradient banner card style ── */
  .wd-header {
    background: linear-gradient(120deg, #6366f1 0%, #a855f7 100%);
    border-radius: 16px;
    padding: 20px 24px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 14px;
    box-shadow: 0 4px 20px rgba(99,102,241,0.25);
    position: relative;
    overflow: hidden;
  }

  .wd-header::before {
    content: '';
    position: absolute;
    top: -30px; right: -30px;
    width: 130px; height: 130px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
    pointer-events: none;
  }

  .wd-header::after {
    content: '';
    position: absolute;
    bottom: -40px; left: 30%;
    width: 180px; height: 100px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    pointer-events: none;
  }

  .wd-header-left h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 22px;
    font-weight: 900;
    color: #fff;
    margin: 0 0 3px;
  }

  .wd-header-left p {
    font-size: 12.5px;
    color: rgba(255,255,255,0.70);
    margin: 0;
  }

  /* Add button inside header */
  .wd-add-btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 9px 18px;
    border-radius: 10px;
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.30);
    color: #fff;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: background .15s, box-shadow .15s, transform .12s;
    backdrop-filter: blur(4px);
    z-index: 1;
    position: relative;
  }
  .wd-add-btn:hover {
    background: rgba(255,255,255,0.28);
    box-shadow: 0 4px 14px rgba(0,0,0,0.12);
    transform: translateY(-1px);
  }

  /* ── Filter row ── */
  .wd-filter-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 18px;
    flex-wrap: wrap;
  }

  /* ── Card ── */
  .wd-card {
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: wdFade .25s ease;
  }

  @keyframes wdFade {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ── Topbar ── */
  .wd-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(90deg, rgba(99,102,241,0.03) 0%, rgba(168,85,247,0.02) 100%);
    flex-wrap: wrap;
    gap: 10px;
  }

  .wd-topbar-tabs {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* Underline tab style (different from Host pill / PaymentMethod tag) */
  .wd-tab {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 5px 13px;
    border-radius: 7px;
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    border: none;
    background: transparent;
    color: #a0a8c0;
    transition: color .14s, background .14s;
  }
  .wd-tab.active {
    background: rgba(99,102,241,0.10);
    color: #6366f1;
    border: 1px solid rgba(99,102,241,0.18);
  }

  /* ── No badge: diamond/rotated square ── */
  .wd-no {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px; height: 26px;
    border-radius: 6px;
    background: linear-gradient(135deg, rgba(99,102,241,0.10), rgba(168,85,247,0.10));
    border: 1px solid rgba(99,102,241,0.18);
    font-size: 11.5px;
    font-weight: 800;
    color: #6366f1;
    transform: rotate(4deg);
  }

  /* ── Unique ID ── */
  .wd-uid {
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
  .wd-agency {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .wd-agency-avatar {
    width: 40px; height: 40px;
    border-radius: 10px;
    object-fit: cover;
    border: 2px solid #e8eaf2;
    flex-shrink: 0;
    transition: border-color .15s;
  }
  .wd-agency-avatar:hover { border-color: #6366f1; }
  .wd-agency-name {
    font-size: 13px;
    font-weight: 600;
    color: #1e2235;
    white-space: nowrap;
    text-transform: capitalize;
  }

  /* ── Coin badge ── */
  .wd-coin {
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
    white-space: nowrap;
  }

  /* ── Amount badge ── */
  .wd-amount {
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
    white-space: nowrap;
  }

  /* ── Date: pill style ── */
  .wd-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 500;
    color: #64748b;
    white-space: nowrap;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    border-radius: 20px;
    padding: 3px 10px;
  }
  .wd-date svg { color: #a0a8c0; }

  /* ── Info button: ghost with hover fill ── */
  .wd-info-btn {
    width: 34px; height: 34px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    background: rgba(99,102,241,0.07);
    border: 1.5px solid rgba(99,102,241,0.18);
    transition: background .15s, box-shadow .15s, transform .12s;
  }
  .wd-info-btn:hover {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.35);
    box-shadow: 0 3px 10px rgba(99,102,241,0.15);
    transform: translateY(-1px);
  }
  .wd-info-btn img { width: 16px; height: 16px; object-fit: contain; }

  /* ── Modal ── */
  .wd-modal-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }

  .wd-modal {
    background: #fff;
    border-radius: 18px;
    width: 100%;
    max-width: 440px;
    box-shadow: 0 8px 40px rgba(99,102,241,0.18);
    overflow: hidden;
    animation: wdFade .2s ease;
    outline: none;
  }

  .wd-modal-head {
    background: linear-gradient(120deg, #6366f1 0%, #a855f7 100%);
    padding: 18px 22px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .wd-modal-head h3 {
    font-family: 'Nunito', sans-serif;
    font-size: 17px;
    font-weight: 900;
    color: #fff;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .wd-modal-close {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.30);
    color: #fff;
    font-size: 16px;
    cursor: pointer;
    transition: background .14s;
  }
  .wd-modal-close:hover { background: rgba(255,255,255,0.30); }

  .wd-modal-body {
    padding: 20px 22px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .wd-modal-field {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .wd-modal-label {
    font-size: 11.5px;
    font-weight: 700;
    color: #a0a8c0;
    text-transform: uppercase;
    letter-spacing: .5px;
  }

  .wd-modal-value {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e2235;
    background: #f4f5fb;
    border: 1.5px solid #e8eaf2;
    border-radius: 9px;
    padding: 9px 13px;
  }

  .wd-modal-footer {
    padding: 14px 22px;
    border-top: 1px solid #e8eaf2;
    display: flex;
    justify-content: flex-end;
    background: linear-gradient(0deg, rgba(99,102,241,0.02) 0%, transparent 100%);
  }

  .wd-close-btn {
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
  .wd-close-btn:hover {
    background: #eef0f8;
    border-color: #d0d4e8;
  }
`;

const Withdraw = () => {
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<number>(1);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [search, setSearch] = useState<string | undefined>("All");
  const [openInfo, setOpenInfo] = useState(false);
  const [infoData, setInfodata] = useState<any>();

  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { withdrawRequest } = useSelector((state: RootStore) => state.withdrawal);
  const dispatch = useDispatch();

  useEffect(() => {
    const payload: any = {
      start: page,
      limit: rowsPerPage,
      search,
      startDate,
      endDate,
      person: 1,
      status: 1,
    };
    dispatch(getWithdrawalRequest(payload));
  }, [dispatch, page, rowsPerPage, search, startDate, endDate]);

  const handleOpenInfo = (row: any) => { setOpenInfo(true); setInfodata(row); };
  const handleCloseInfo = () => setOpenInfo(false);

  const withdrawPendingTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span className="wd-no">{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },
    {
      Header: "Unique Id",
      Cell: ({ row }: { row: any }) => (
        <span className="wd-uid">{row?.uniqueId || "—"}</span>
      ),
    },
    {
      Header: "Agency",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.agencyId?.image
          ? row.agencyId.image.replace(/\\/g, "/")
          : "";
        return (
          <div className="wd-agency">
            <img
              src={row?.agencyId?.image ? baseURL + updatedImagePath : male.src}
              alt="Agency"
              className="wd-agency-avatar"
            />
            <span className="wd-agency-name">{row?.agencyId?.name || "—"}</span>
          </div>
        );
      },
    },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="wd-coin">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {row?.coin ?? 0}
        </span>
      ),
    },
    {
      Header: "Amount",
      Cell: ({ row }: { row: any }) => (
        <span className="wd-amount">
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
        <span className="wd-date">
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
        <button className="wd-info-btn" onClick={() => handleOpenInfo(row)} title="View Info">
          <img src={infoImage.src} alt="Info" />
        </button>
      ),
    },
  ];

  return (
    <>
      <style>{withdrawStyle}</style>

      {dialogueType === "withdraw" && <AddWithdrawDialogue />}

      <div className="wd-root">

        {/* ── Gradient Banner Header ── */}
        <div className="wd-header">
          <div className="wd-header-left">
            <h2>Withdrawal Requests</h2>
            <p>Review and manage agency withdrawal requests</p>
          </div>
          <button
            className="wd-add-btn"
            onClick={() => dispatch(openDialog({ type: "withdraw" }))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Withdraw
          </button>
        </div>

        {/* ── Date Filter Row ── */}
        <div className="wd-filter-row">
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            direction={"start"}
          />
        </div>

        {/* ── Table Card ── */}
        <div className="wd-card">
          <div className="wd-topbar">
            <div className="wd-topbar-tabs">
              <span className="wd-tab active">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
                All Requests
              </span>
            </div>
            <span style={{
              fontSize: "12px", fontWeight: 700, color: "#a0a8c0",
              background: "#f4f5fb", border: "1px solid #e8eaf2",
              borderRadius: "7px", padding: "4px 10px"
            }}>
              {Array.isArray(withdrawRequest) ? withdrawRequest.length : 0} records
            </span>
          </div>

          <Table
            data={withdrawRequest}
            mapData={withdrawPendingTable}
            type="client"
          />
        </div>
      </div>

      {/* ── Info Modal ── */}
      <Modal open={openInfo} onClose={handleCloseInfo}>
        <div className="wd-modal-overlay" style={{
          display: "flex", alignItems: "center",
          justifyContent: "center", height: "100vh"
        }}>
          <div className="wd-modal">
            {/* Head */}
            <div className="wd-modal-head">
              <h3>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                Payment Detail Info
              </h3>
              <button className="wd-modal-close" onClick={handleCloseInfo}>
                <i className="ri-close-line" />
              </button>
            </div>

            {/* Body */}
            <div className="wd-modal-body">
              <div className="wd-modal-field">
                <span className="wd-modal-label">Payment Gateway</span>
                <div className="wd-modal-value">{infoData?.paymentGateway || "—"}</div>
              </div>

              {infoData?.paymentDetails?.map((item: any, i: number) => (
                <div className="wd-modal-field" key={i}>
                  <span className="wd-modal-label">{item?.split(":")[0] || "—"}</span>
                  <div className="wd-modal-value">{item?.split(":")[1] || "—"}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="wd-modal-footer">
              <button className="wd-close-btn" onClick={handleCloseInfo}>
                Close
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

Withdraw.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Withdraw;