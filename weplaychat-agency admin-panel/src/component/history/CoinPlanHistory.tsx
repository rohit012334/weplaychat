import RootLayout from "@/component/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useState } from "react";
import Analytics from "@/extra/Analytic";
import { getCoinPlanHistory } from "@/store/hostSlice";
import CoinPlan from "../shimmer/CoinPlan";

const coinPlanStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .cph-wrap { font-family: 'Outfit', sans-serif; padding: 4px 0; }

  .cph-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(245,158,11,0.03) 0%, rgba(99,102,241,0.02) 100%);
    flex-wrap: wrap;
    gap: 10px;
  }

  .cph-count-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 8px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    font-size: 12px; font-weight: 700; color: #f59e0b;
  }

  .cph-count-dot {
    width: 6px; height: 6px; border-radius: 50%; background: #f59e0b;
    animation: cphPulse 2s ease-in-out infinite;
  }

  @keyframes cphPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(1.5); }
  }

  .cph-no {
    display: inline-flex; align-items: center; justify-content: center;
    width: 28px; height: 28px; border-radius: 7px;
    background: #f4f5fb; border: 1px solid #e8eaf2;
    font-size: 12px; font-weight: 700; color: #a0a8c0;
  }

  .cph-uid {
    font-size: 12px; font-weight: 600; color: #64748b;
    background: #f4f5fb; border: 1px solid #e8eaf2;
    border-radius: 6px; padding: 3px 8px;
    white-space: nowrap; letter-spacing: 0.4px;
  }

  .cph-sender { font-size: 13.5px; font-weight: 600; color: #1e2235; white-space: nowrap; }

  .cph-desc { font-size: 12.5px; color: #64748b; max-width: 200px; line-height: 1.5; text-transform: capitalize; }

  .cph-coin-user {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 7px; font-size: 12.5px; font-weight: 700;
    background: rgba(99,102,241,0.08); border: 1px solid rgba(99,102,241,0.18); color: #6366f1; white-space: nowrap;
  }

  .cph-coin-host {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 7px; font-size: 12.5px; font-weight: 700;
    background: rgba(16,185,129,0.09); border: 1px solid rgba(16,185,129,0.20); color: #10b981; white-space: nowrap;
  }

  .cph-coin-admin {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 7px; font-size: 12.5px; font-weight: 700;
    background: rgba(245,158,11,0.08); border: 1px solid rgba(245,158,11,0.18); color: #f59e0b; white-space: nowrap;
  }

  .cph-date {
    display: inline-flex; align-items: center; gap: 6px;
    font-size: 12.5px; color: #64748b; white-space: nowrap;
  }
  .cph-date svg { color: #a0a8c0; }

  .cph-pagination {
    border-top: 1px solid #e8eaf2; padding: 12px 20px;
    background: linear-gradient(0deg, rgba(99,102,241,0.02) 0%, transparent 100%);
  }
`;

const CoinPlanUserHistory = () => {
  const dispatch = useDispatch();

  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );

  const hostData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hostData") || "null")
      : null;

  const { hostCoinHistory, totalHostCoinPlanHistory } = useSelector(
    (state: RootStore) => state.host
  );

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage]               = useState<number>(1);
  const [startDate, setStartDate]     = useState("All");
  const [endDate, setEndDate]         = useState("All");

  useEffect(() => {
    const payload = {
      start: page,
      limit: rowsPerPage,
      hostId: hostData?._id,
      startDate,
      endDate,
    };
    dispatch(getCoinPlanHistory(payload));
  }, [dispatch, page, rowsPerPage, startDate, endDate]);

  const handleChangePage = (event: any, newPage: any) => setPage(newPage);

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  const coinPlanTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="cph-no">
          {(page - 1) * rowsPerPage + parseInt(index) + 1}
        </span>
      ),
    },
    {
      Header: "Unique Id",
      Cell: ({ row }: { row: any }) => (
        <span className="cph-uid">{row?.uniqueId || "—"}</span>
      ),
    },
    {
      Header: "Sender Name",
      Cell: ({ row }: { row: any }) => (
        <span className="cph-sender">{row?.senderName || "—"}</span>
      ),
    },
    {
      Header: "Description",
      Cell: ({ row }: { row: any }) => (
        <span className="cph-desc">{row?.typeDescription || "—"}</span>
      ),
    },
    {
      Header: "User Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="cph-coin-user">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
          </svg>
          {row?.userCoin || 0}
        </span>
      ),
    },
    {
      Header: "Host Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="cph-coin-host">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {row?.hostCoin || 0}
        </span>
      ),
    },
    {
      Header: "Admin Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="cph-coin-admin">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/>
          </svg>
          {row?.adminCoin || 0}
        </span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }: { row: any }) => (
        <span className="cph-date">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8"  y1="2" x2="8"  y2="6"/>
            <line x1="3"  y1="10" x2="21" y2="10"/>
          </svg>
          {row?.createdAt?.split("T")[0] || "—"}
        </span>
      ),
    },
  ];

  return (
    <>
      <style>{coinPlanStyle}</style>

      <div className="cph-wrap">

        {/* ── Top bar ── */}
        <div className="cph-topbar">
          <span className="cph-count-pill">
            <span className="cph-count-dot" />
            {totalHostCoinPlanHistory ?? 0} Records
          </span>

          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            direction="end"
          />
        </div>

        {/* ── Table ── */}
        <Table
          data={hostCoinHistory}
          mapData={coinPlanTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<CoinPlan />}
        />

        {/* ── Pagination ── */}
        <div className="cph-pagination">
          <Pagination
            type="server"
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalHostCoinPlanHistory}
          />
        </div>

      </div>
    </>
  );
};

CoinPlanUserHistory.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default CoinPlanUserHistory;