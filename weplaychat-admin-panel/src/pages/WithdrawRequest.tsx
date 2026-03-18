import RootLayout from "@/component/layout/Layout";
import AcceptedWithrawRequest from "@/component/withdrawRequest/AcceptedWithrawRequest";
import DeclineWithdrawRequest from "@/component/withdrawRequest/DeclineWithdrawRequest";
import PendingWithdrawReq from "@/component/withdrawRequest/PendingWithdrawReq";
import Analytics from "@/extra/Analytic";
import { RootStore } from "@/store/store";
import { setWithdrawal } from "@/store/withdrawalSlice";
import { routerChange } from "@/utils/Common";
import { withdrawRequestTypes } from "@/utils/extra";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

const statusTabs = [
  {
    key: "pending_Request",
    label: "Pending",
    color: "amber",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
  },
  {
    key: "accepted_Request",
    label: "Accepted",
    color: "green",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
  },
  {
    key: "declined_Request",
    label: "Declined",
    color: "rose",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
  },
];

const colorMap: Record<string, { soft: string; mid: string; color: string; glow: string }> = {
  amber: { soft: "rgba(245,158,11,0.10)", mid: "rgba(245,158,11,0.22)", color: "#f59e0b", glow: "rgba(245,158,11,0.18)" },
  green: { soft: "rgba(16,185,129,0.10)", mid: "rgba(16,185,129,0.22)", color: "#10b981", glow: "rgba(16,185,129,0.15)" },
  rose:  { soft: "rgba(244,63,94,0.09)",  mid: "rgba(244,63,94,0.20)",  color: "#f43f5e", glow: "rgba(244,63,94,0.14)" },
};

const WithdrawRequest = () => {
  const [type,       setType]       = useState<string>("agency");
  const [statusType, setStatusType] = useState<string | null>(null);
  const [startDate,  setStartDate]  = useState("All");
  const [endDate,    setEndDate]    = useState("All");

  const router   = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedStatus = localStorage.getItem("withdrawType") || "pending_Request";
      const storedMain   = localStorage.getItem("mainType");
      setStatusType(storedStatus);
      if (storedMain) setType(storedMain);
      routerChange("/WithdrawRequest", "mainType", router);
    }
  }, [router]);

  useEffect(() => {
    if (statusType && typeof window !== "undefined")
      localStorage.setItem("withdrawType", statusType);
  }, [statusType]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("mainType", type);
  }, [type]);

  const activeStatus = statusTabs.find((s) => s.key === statusType);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .wr-page {
          --accent:  #6366f1;
          --accent2: #a855f7;
          --a-soft:  rgba(99,102,241,0.09);
          --a-mid:   rgba(99,102,241,0.16);
          --a-glow:  rgba(99,102,241,0.20);
          --border:  #e8eaf2;
          --txt:     #64748b;
          --txt-dark:#1e2235;
          --txt-dim: #a0a8c0;
          --white:   #ffffff;
          --bg:      #f4f5fb;

          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── Header ── */
        .wr-page .wr-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 22px;
        }
        .wr-page .wr-header-left { display: flex; align-items: center; gap: 12px; }
        .wr-page .wr-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          flex-shrink: 0;
        }
        .wr-page .wr-title {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1; margin: 0;
        }
        .wr-page .wr-sub { font-size: 12px; color: var(--txt-dim); margin-top: 2px; }

        /* ── Controls row ── */
        .wr-page .wr-controls {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 12px 16px;
          margin-bottom: 16px;
          box-shadow: 0 1px 8px rgba(99,102,241,0.05);
        }

        /* ── Type tabs (Agency / Host etc.) ── */
        .wr-page .wr-type-tabs {
          display: flex; align-items: center; gap: 6px;
          background: var(--bg); border-radius: 10px; padding: 4px;
          border: 1px solid var(--border);
        }
        .wr-page .wr-type-tab {
          padding: 7px 16px; border-radius: 7px; border: none;
          background: transparent;
          font-family: 'Outfit', sans-serif; font-size: 13px;
          font-weight: 600; color: var(--txt-dim); cursor: pointer;
          transition: all .15s; white-space: nowrap;
        }
        .wr-page .wr-type-tab:hover:not(.active) { color: var(--txt); background: var(--white); }
        .wr-page .wr-type-tab.active {
          background: var(--white); color: var(--accent);
          box-shadow: 0 1px 6px rgba(99,102,241,0.12);
          border: 1px solid var(--a-mid);
        }

        /* ── Status tabs ── */
        .wr-page .wr-status-tabs {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 18px;
        }
        .wr-page .wr-status-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px; border-radius: 10px;
          border: 1.5px solid var(--border);
          background: var(--white);
          font-family: 'Outfit', sans-serif; font-size: 13px;
          font-weight: 600; color: var(--txt-dim); cursor: pointer;
          transition: all .16s; white-space: nowrap;
        }
        .wr-page .wr-status-tab:hover:not(.active) {
          color: var(--txt); border-color: #cdd0e0;
        }

        /* ── Content card ── */
        .wr-page .wr-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }
        .wr-page .wr-card-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg,rgba(99,102,241,0.04),rgba(168,85,247,0.02));
        }
        .wr-page .wr-card-title {
          font-family: 'Rajdhani', sans-serif; font-size: 16px;
          font-weight: 700; color: var(--txt-dark);
          display: flex; align-items: center; gap: 8px;
        }
        .wr-page .wr-card-badge {
          font-size: 12px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .wr-page .wr-card-body { padding: 20px; }
      `}</style>

      <div className="wr-page">

        {/* ── Header ── */}
        <div className="wr-header">
          <div className="wr-header-left">
            <div className="wr-header-pill" />
            <div>
              <h1 className="wr-title">Withdraw Requests</h1>
              <p className="wr-sub">Review and manage all withdrawal requests</p>
            </div>
          </div>
        </div>

        {/* ── Controls: type tabs + date filter ── */}
        <div className="wr-controls">
          <div className="wr-type-tabs">
            {withdrawRequestTypes.map((item: any, index: number) => (
              <button
                key={index}
                type="button"
                className={`wr-type-tab${type === item.value ? " active" : ""}`}
                onClick={() => {
                  dispatch(setWithdrawal([]));
                  setType(item.value);
                }}
              >
                {item.label}
              </button>
            ))}
          </div>

          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            direction={"start"}
          />
        </div>

        {/* ── Status tabs ── */}
        <div className="wr-status-tabs">
          {statusTabs.map((s) => {
            const c = colorMap[s.color];
            const isActive = statusType === s.key;
            return (
              <button
                key={s.key}
                className={`wr-status-tab${isActive ? " active" : ""}`}
                style={isActive ? {
                  background: c.soft,
                  borderColor: c.mid,
                  color: c.color,
                  boxShadow: `0 2px 10px ${c.glow}`,
                } : {}}
                onClick={() => setStatusType(s.key)}
              >
                {s.icon}
                {s.label}
              </button>
            );
          })}
        </div>

        {/* ── Content card ── */}
        <div className="wr-card">
          {activeStatus && (() => {
            const c = colorMap[activeStatus.color];
            return (
              <div className="wr-card-head">
                <span className="wr-card-title">
                  {activeStatus.icon && React.cloneElement(activeStatus.icon, { stroke: c.color })}
                  {activeStatus.label} Requests
                </span>
                <span
                  className="wr-card-badge"
                  style={{ background: c.soft, color: c.color, border: `1px solid ${c.mid}` }}
                >
                  {activeStatus.label}
                </span>
              </div>
            );
          })()}

          <div className="wr-card-body">
            {statusType === "pending_Request" && (
              <PendingWithdrawReq
                statusType={statusType} type={type}
                startDate={startDate} endDate={endDate}
              />
            )}
            {statusType === "accepted_Request" && (
              <AcceptedWithrawRequest
                statusType={statusType} type={type}
                startDate={startDate} endDate={endDate}
              />
            )}
            {statusType === "declined_Request" && (
              <DeclineWithdrawRequest
                statusType={statusType} type={type}
                startDate={startDate} endDate={endDate}
              />
            )}
          </div>
        </div>

      </div>
    </>
  );
};

WithdrawRequest.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default WithdrawRequest;