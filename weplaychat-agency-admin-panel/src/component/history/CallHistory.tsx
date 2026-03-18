import RootLayout from "@/component/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useState } from "react";
import Analytics from "@/extra/Analytic";
import { getHostCallHistory } from "@/store/hostSlice";
import CoinPlan from "../shimmer/CoinPlan";

const callHistoryStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .ch-wrap {
    font-family: 'Outfit', sans-serif;
    padding: 4px 0;
  }

  /* ── Top bar ── */
  .ch-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e8eaf2;
    flex-wrap: wrap;
    gap: 10px;
  }

  .ch-topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .ch-count-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.18);
    font-size: 12px;
    font-weight: 700;
    color: #6366f1;
  }

  .ch-count-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #6366f1;
    animation: chPulse 2s ease-in-out infinite;
  }

  @keyframes chPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(1.5); }
  }

  /* ── No badge ── */
  .ch-no {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px; height: 28px;
    border-radius: 7px;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    font-size: 12px;
    font-weight: 700;
    color: #a0a8c0;
  }

  /* ── Unique ID ── */
  .ch-uid {
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    border-radius: 6px;
    padding: 3px 8px;
    white-space: nowrap;
    letter-spacing: .4px;
    font-family: 'Outfit', monospace;
  }

  /* ── Sender name ── */
  .ch-sender {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e2235;
    white-space: nowrap;
  }

  /* ── Description ── */
  .ch-desc {
    font-size: 12.5px;
    color: #64748b;
    max-width: 200px;
    line-height: 1.5;
  }

  /* ── Coin badges ── */
  .ch-coin-positive {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 7px;
    font-size: 12.5px;
    font-weight: 700;
    background: rgba(16,185,129,0.09);
    border: 1px solid rgba(16,185,129,0.20);
    color: #10b981;
    white-space: nowrap;
  }

  .ch-coin-negative {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 7px;
    font-size: 12.5px;
    font-weight: 700;
    background: rgba(244,63,94,0.08);
    border: 1px solid rgba(244,63,94,0.18);
    color: #f43f5e;
    white-space: nowrap;
  }

  .ch-coin-neutral {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 9px;
    border-radius: 7px;
    font-size: 12.5px;
    font-weight: 700;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.18);
    color: #f59e0b;
    white-space: nowrap;
  }

  /* ── Call type badge ── */
  .ch-calltype {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 7px;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.15);
    font-size: 12px;
    font-weight: 600;
    color: #6366f1;
    text-transform: capitalize;
    white-space: nowrap;
  }

  /* ── Yes/No badges ── */
  .ch-yes {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700;
    background: rgba(16,185,129,0.09);
    border: 1px solid rgba(16,185,129,0.20);
    color: #10b981;
  }
  .ch-no-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    color: #a0a8c0;
  }

  /* ── DateTime ── */
  .ch-datetime {
    display: flex;
    flex-direction: column;
    gap: 2px;
    white-space: nowrap;
  }
  .ch-datetime-date {
    font-size: 12.5px;
    font-weight: 600;
    color: #1e2235;
  }
  .ch-datetime-time {
    font-size: 11px;
    color: #a0a8c0;
  }

  /* ── Duration badge ── */
  .ch-duration {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 7px;
    background: rgba(168,85,247,0.08);
    border: 1px solid rgba(168,85,247,0.16);
    font-size: 12px;
    font-weight: 600;
    color: #a855f7;
    white-space: nowrap;
  }

  /* ── Date cell ── */
  .ch-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #64748b;
    white-space: nowrap;
  }
  .ch-date svg { color: #a0a8c0; }

  /* ── Pagination ── */
  .ch-pagination {
    border-top: 1px solid #e8eaf2;
    padding: 12px 20px;
    background: linear-gradient(0deg, rgba(99,102,241,0.02) 0%, transparent 100%);
  }
`;

const CallHistory = (props: any) => {
  const { queryType } = props;
  const dispatch = useDispatch();

  const hostData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hostData") || "null")
      : null;

  const { hostCallHistory, totalCallHistory }: any = useSelector(
    (state: RootStore) => state.host
  );

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage]               = useState<number>(1);
  const [startDate, setStartDate]     = useState("All");
  const [endDate, setEndDate]         = useState("All");

  useEffect(() => {
    dispatch(getHostCallHistory({
      start: page, limit: rowsPerPage,
      hostId: hostData?._id, startDate, endDate,
    }));
  }, [dispatch, page, rowsPerPage, startDate, endDate]);

  const handleChangePage        = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  /* ── format datetime helper ── */
  const formatDateTime = (rawDate: string) => {
    if (!rawDate) return { date: "—", time: "" };
    const d = new Date(rawDate);
    return {
      date: d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }),
      time: d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", second: "2-digit", hour12: true }),
    };
  };

  const callHistoryTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="ch-no">
          {(page - 1) * rowsPerPage + parseInt(index) + 1}
        </span>
      ),
    },
    {
      Header: "Unique ID",
      Cell: ({ row }: { row: any }) => (
        <span className="ch-uid">{row?.uniqueId || "—"}</span>
      ),
    },
    {
      Header: "Sender Name",
      Cell: ({ row }: { row: any }) => (
        <span className="ch-sender">{row?.senderName || "—"}</span>
      ),
    },
    {
      Header: "Description",
      Cell: ({ row }: { row: any }) => (
        <span className="ch-desc">{row?.typeDescription || "—"}</span>
      ),
    },
    {
      Header: "User Coin",
      Cell: ({ row }: { row: any }) => {
        if (queryType === "host") {
          return (
            <span className="ch-coin-negative">
              − {row?.userCoin?.toFixed(2) ?? "0.00"}
            </span>
          );
        }
        return row?.isIncome ? (
          <span className="ch-coin-positive">+ {row?.userCoin?.toFixed(2) ?? "0.00"}</span>
        ) : (
          <span className="ch-coin-negative">− {row?.userCoin?.toFixed(2) ?? "0.00"}</span>
        );
      },
    },
    {
      Header: "Host Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="ch-coin-positive">+ {row?.hostCoin?.toFixed(2) ?? "0.00"}</span>
      ),
    },
    {
      Header: "Admin Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="ch-coin-neutral">{row?.adminCoin?.toFixed(2) ?? "0.00"}</span>
      ),
    },
    {
      Header: "Call Type",
      Cell: ({ row }: { row: any }) => (
        <span className="ch-calltype">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          {row?.callType || "—"}
        </span>
      ),
    },
    {
      Header: "Random",
      Cell: ({ row }: { row: any }) => (
        row?.isRandom
          ? <span className="ch-yes">Yes</span>
          : <span className="ch-no-badge">No</span>
      ),
    },
    {
      Header: "Private",
      Cell: ({ row }: { row: any }) => (
        row?.isPrivate
          ? <span className="ch-yes">Yes</span>
          : <span className="ch-no-badge">No</span>
      ),
    },
    {
      Header: "Call Start",
      Cell: ({ row }: { row: any }) => {
        const { date, time } = formatDateTime(row?.callStartTime);
        return (
          <div className="ch-datetime">
            <span className="ch-datetime-date">{date}</span>
            <span className="ch-datetime-time">{time}</span>
          </div>
        );
      },
    },
    {
      Header: "Call End",
      Cell: ({ row }: { row: any }) => {
        const { date, time } = formatDateTime(row?.callEndTime);
        return (
          <div className="ch-datetime">
            <span className="ch-datetime-date">{date}</span>
            <span className="ch-datetime-time">{time}</span>
          </div>
        );
      },
    },
    {
      Header: "Duration",
      Cell: ({ row }: { row: any }) => (
        <span className="ch-duration">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {row?.duration || "—"}
        </span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }: { row: any }) => (
        <span className="ch-date">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
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
      <style>{callHistoryStyle}</style>

      <div className="ch-wrap">

        {/* ── Top bar ── */}
        <div className="ch-topbar">
          <div className="ch-topbar-left">
            <span className="ch-count-pill">
              <span className="ch-count-dot" />
              {totalCallHistory ?? 0} Records
            </span>
          </div>

          {/* Analytics date filter */}
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
          data={hostCallHistory}
          mapData={callHistoryTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<CoinPlan />}
        />

        {/* ── Pagination ── */}
        <div className="ch-pagination">
          <Pagination
            type="server"
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalCallHistory}
          />
        </div>

      </div>
    </>
  );
};

CallHistory.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default CallHistory;