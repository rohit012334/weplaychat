import RootLayout from "@/component/layout/Layout";
import Analytics from "@/extra/Analytic";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { getAgencyEarningHistory } from "@/store/agencySlice";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import AgencyEarningHistoryShimmer from "@/component/shimmer/AgencyEarningHistoryShimmer ";
import coin from "@/assets/images/coin.png";
import { getSetting } from "@/store/settingSlice";

const earningStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .aeh-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  /* ── Page Header ── */
  .aeh-header {
    margin-bottom: 22px;
  }

  .aeh-header h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 23px;
    font-weight: 900;
    color: #1e2235;
    margin: 0 0 3px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .aeh-header p {
    font-size: 12.5px;
    color: #a0a8c0;
    margin: 0;
  }

  /* ── Controls row ── */
  .aeh-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  /* ── Total earning card ── */
  .aeh-earning-card {
    display: flex;
    align-items: center;
    gap: 12px;
    background: linear-gradient(120deg, #0d9488 0%, #14b8a6 100%);
    border-radius: 14px;
    padding: 13px 20px;
    box-shadow: 0 4px 18px rgba(13,148,136,0.22);
    position: relative;
    overflow: hidden;
    min-width: 220px;
  }

  .aeh-earning-card::before {
    content: '';
    position: absolute;
    top: -20px; right: -20px;
    width: 80px; height: 80px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    pointer-events: none;
  }

  .aeh-earning-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.28);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    z-index: 1;
  }

  .aeh-earning-info {
    z-index: 1;
  }

  .aeh-earning-label {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255,255,255,0.75);
    text-transform: uppercase;
    letter-spacing: .5px;
    margin-bottom: 2px;
  }

  .aeh-earning-value {
    font-family: 'Nunito', sans-serif;
    font-size: 20px;
    font-weight: 900;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .aeh-earning-coin-img {
    width: 20px; height: 20px;
    object-fit: contain;
    filter: drop-shadow(0 1px 3px rgba(0,0,0,0.15));
  }

  /* ── Content card ── */
  .aeh-card {
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(13,148,136,0.06);
    animation: aehFade .25s ease;
  }

  @keyframes aehFade {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* ── Topbar ── */
  .aeh-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 20px;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(13,148,136,0.03) 0%, rgba(99,102,241,0.02) 100%);
    flex-wrap: wrap;
    gap: 10px;
  }

  .aeh-count-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(13,148,136,0.09);
    border: 1px solid rgba(13,148,136,0.20);
    font-size: 12px;
    font-weight: 700;
    color: #0d9488;
  }

  .aeh-count-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #0d9488;
    animation: aehPulse 2s ease-in-out infinite;
  }

  @keyframes aehPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.4; transform:scale(1.5); }
  }

  /* ── No badge ── */
  .aeh-no {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px; height: 26px;
    border-radius: 50%;
    background: rgba(13,148,136,0.09);
    border: 1px solid rgba(13,148,136,0.20);
    font-size: 11.5px;
    font-weight: 800;
    color: #0d9488;
  }

  /* ── UID ── */
  .aeh-uid {
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

  /* ── Name badges ── */
  .aeh-sender {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 600;
    color: #1e2235;
    text-transform: capitalize;
    white-space: nowrap;
  }

  .aeh-receiver {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 13px;
    font-weight: 600;
    color: #1e2235;
    text-transform: capitalize;
    white-space: nowrap;
  }

  /* ── Description chip ── */
  .aeh-desc {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 3px 10px;
    border-radius: 20px;
    background: rgba(99,102,241,0.07);
    border: 1px solid rgba(99,102,241,0.15);
    font-size: 12px;
    font-weight: 600;
    color: #6366f1;
    white-space: nowrap;
    text-transform: capitalize;
  }

  /* ── Coin cells ── */
  .aeh-coin-user {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 7px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.18);
    font-size: 12px; font-weight: 700; color: #d97706;
    white-space: nowrap;
  }

  .aeh-coin-host {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 7px;
    background: rgba(99,102,241,0.07);
    border: 1px solid rgba(99,102,241,0.16);
    font-size: 12px; font-weight: 700; color: #6366f1;
    white-space: nowrap;
  }

  .aeh-coin-admin {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 7px;
    background: rgba(244,63,94,0.07);
    border: 1px solid rgba(244,63,94,0.16);
    font-size: 12px; font-weight: 700; color: #f43f5e;
    white-space: nowrap;
  }

  .aeh-coin-agency {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 7px;
    background: rgba(13,148,136,0.08);
    border: 1px solid rgba(13,148,136,0.18);
    font-size: 12px; font-weight: 700; color: #0d9488;
    white-space: nowrap;
  }

  /* ── Date ── */
  .aeh-date {
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
  .aeh-date svg { color: #a0a8c0; }

  /* ── Pagination ── */
  .aeh-pagination {
    border-top: 1px solid #e8eaf2;
    padding: 12px 20px;
    background: linear-gradient(0deg, rgba(13,148,136,0.02), transparent);
  }

  /* ── Coin icon small ── */
  .aeh-coin-icon {
    width: 13px; height: 13px;
    object-fit: contain;
    vertical-align: middle;
  }
`;

const AgencyEarningHistory = () => {
  const dispatch = useDispatch();
  const {
    totalAgencyEarningHistory,
    agencyEarningHistory,
    totalAgencyEarning,
  } = useSelector((state: RootStore) => state.agency);

  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    dispatch(getAgencyEarningHistory({ start: page, limit: rowsPerPage, startDate, endDate }));
  }, [dispatch, page, rowsPerPage, startDate, endDate]);

  useEffect(() => { dispatch(getSetting()); }, [dispatch]);

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10)); setPage(1);
  };

  const CoinIcon = () => (
    <img src={coin.src} alt="coin" className="aeh-coin-icon" />
  );

  const agencyEarningHistoryTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span className="aeh-no">{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },
    {
      Header: "Unique Id",
      Cell: ({ row }: { row: any }) => (
        <span className="aeh-uid">{row?.uniqueId || "—"}</span>
      ),
    },
    {
      Header: "Sender",
      Cell: ({ row }: { row: any }) => (
        <span className="aeh-sender">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="#a0a8c0" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {row?.senderName || "—"}
        </span>
      ),
    },
    {
      Header: "Receiver",
      Cell: ({ row }: { row: any }) => (
        <span className="aeh-receiver">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="#a0a8c0" strokeWidth="2" strokeLinecap="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          {row?.receiverName || "—"}
        </span>
      ),
    },
    {
      Header: "Description",
      Cell: ({ row }: { row: any }) => (
        <span className="aeh-desc">
          {row?.typeDescription || "—"}
        </span>
      ),
    },
    {
      Header: "User Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="aeh-coin-user">
          <CoinIcon /> {row?.userCoin ?? 0}
        </span>
      ),
    },
    {
      Header: "Host Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="aeh-coin-host">
          <CoinIcon /> {row?.hostCoin ?? 0}
        </span>
      ),
    },
    {
      Header: "Admin Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="aeh-coin-admin">
          <CoinIcon /> {row?.adminCoin ?? 0}
        </span>
      ),
    },
    {
      Header: "Agency Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="aeh-coin-agency">
          <CoinIcon /> {row?.agencyCoin ?? 0}
        </span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }: { row: any }) => (
        <span className="aeh-date">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8"  y1="2" x2="8"  y2="6" />
            <line x1="3"  y1="10" x2="21" y2="10" />
          </svg>
          {row?.createdAt?.split("T")[0] || "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <style>{earningStyle}</style>

      <div className="aeh-root">

        {/* ── Page Header ── */}
        <div className="aeh-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#0d9488" strokeWidth="2.2" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Agency Earning History
          </h2>
          <p>Track all coin transactions and earnings across the agency</p>
        </div>

        {/* ── Controls ── */}
        <div className="aeh-controls">
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            direction="start"
          />

          {/* Total earning card */}
          <div className="aeh-earning-card">
            <div className="aeh-earning-icon">
              <img src={coin.src} alt="coin"
                style={{ width: 20, height: 20, objectFit: "contain" }} />
            </div>
            <div className="aeh-earning-info">
              <div className="aeh-earning-label">Total Agency Earning</div>
              <div className="aeh-earning-value">
                {(totalAgencyEarning ?? 0).toFixed(2)}
              </div>
            </div>
          </div>
        </div>

        {/* ── Content Card ── */}
        <div className="aeh-card">

          {/* Topbar */}
          <div className="aeh-topbar">
            <span className="aeh-count-pill">
              <span className="aeh-count-dot" />
              {totalAgencyEarningHistory ?? 0} Records
            </span>
            <span style={{
              fontSize: "12px", fontWeight: 600, color: "#a0a8c0",
              background: "#f4f5fb", border: "1px solid #e8eaf2",
              borderRadius: "7px", padding: "4px 10px",
              display: "inline-flex", alignItems: "center", gap: "5px"
            }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              Showing page {page}
            </span>
          </div>

          {/* Table */}
          <Table
            data={agencyEarningHistory}
            mapData={agencyEarningHistoryTable}
            PerPage={rowsPerPage}
            Page={page}
            type="server"
            shimmer={<AgencyEarningHistoryShimmer />}
          />

          {/* Pagination */}
          <div className="aeh-pagination">
            <Pagination
              type="server"
              serverPage={page}
              setServerPage={setPage}
              serverPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              totalData={totalAgencyEarningHistory}
            />
          </div>

        </div>
      </div>
    </>
  );
};

AgencyEarningHistory.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default AgencyEarningHistory;