import RootLayout from "@/component/layout/Layout";
import AcceptedWithrawRequest from "@/component/agencyWIthdrawRequest/AcceptedWithrawRequest";
import DeclineWithdrawRequest from "@/component/agencyWIthdrawRequest/DeclineWithdrawRequest";
import PendingWithdrawReq from "@/component/agencyWIthdrawRequest/PendingWithdrawReq";
import Analytics from "@/extra/Analytic";
import { routerChange } from "@/utils/Common";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const agencyWithdrawStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .awr-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  /* ── Page Header ── */
  .awr-header {
    margin-bottom: 22px;
  }

  .awr-header h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 23px;
    font-weight: 900;
    color: #1e2235;
    margin: 0 0 3px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .awr-header p {
    font-size: 12.5px;
    color: #a0a8c0;
    margin: 0;
  }

  /* ── Segmented control row ── */
  .awr-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    flex-wrap: wrap;
    margin-bottom: 22px;
  }

  /* Tab strip — card with inner buttons */
  .awr-tab-strip {
    display: inline-flex;
    align-items: center;
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-radius: 13px;
    padding: 5px;
    gap: 4px;
    box-shadow: 0 2px 10px rgba(99,102,241,0.06);
  }

  .awr-tab {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 8px 16px;
    border-radius: 9px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: transparent;
    color: #a0a8c0;
    transition: background .16s, color .16s, box-shadow .16s;
    white-space: nowrap;
  }

  .awr-tab:hover:not(.awr-tab-pending-active):not(.awr-tab-accepted-active):not(.awr-tab-declined-active) {
    background: #f4f5fb;
    color: #64748b;
  }

  /* Pending active */
  .awr-tab-pending-active {
    background: rgba(99,102,241,0.10);
    color: #6366f1;
    box-shadow: 0 2px 8px rgba(99,102,241,0.12);
  }

  /* Accepted active */
  .awr-tab-accepted-active {
    background: rgba(16,185,129,0.10);
    color: #10b981;
    box-shadow: 0 2px 8px rgba(16,185,129,0.12);
  }

  /* Declined active */
  .awr-tab-declined-active {
    background: rgba(244,63,94,0.09);
    color: #f43f5e;
    box-shadow: 0 2px 8px rgba(244,63,94,0.10);
  }

  /* Tab icon dot */
  .awr-tab-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }
  .awr-tab-dot-pending  { background: #6366f1; }
  .awr-tab-dot-accepted { background: #10b981; }
  .awr-tab-dot-declined { background: #f43f5e; }

  /* Status indicator strip on top of content */
  .awr-status-bar {
    height: 3px;
    border-radius: 3px 3px 0 0;
    width: 100%;
    transition: background .2s;
  }
  .awr-status-bar-pending  { background: linear-gradient(90deg, #6366f1, #a855f7); }
  .awr-status-bar-accepted { background: linear-gradient(90deg, #10b981, #34d399); }
  .awr-status-bar-declined { background: linear-gradient(90deg, #f43f5e, #fb7185); }

  /* ── Content card ── */
  .awr-content {
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-radius: 0 0 16px 16px;
    border-top: none;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: awrFade .22s ease;
  }

  @keyframes awrFade {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  .awr-content-inner {
    border: 1.5px solid #e8eaf2;
    border-top: none;
    border-radius: 0 0 16px 16px;
    overflow: hidden;
  }

  /* ── Content topbar ── */
  .awr-content-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(99,102,241,0.02) 0%, rgba(168,85,247,0.01) 100%);
  }

  .awr-content-label {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    font-size: 13px;
    font-weight: 700;
    color: #1e2235;
  }

  .awr-content-label-dot {
    width: 8px; height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  .awr-content-label-dot-pending  { background: #6366f1; animation: awrPulse 2s infinite; }
  .awr-content-label-dot-accepted { background: #10b981; }
  .awr-content-label-dot-declined { background: #f43f5e; }

  @keyframes awrPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(1.4); }
  }

  /* ── Divider ── */
  .awr-divider {
    height: 1px;
    background: #e8eaf2;
    margin: 0;
  }
`;

const tabConfig = [
  {
    key: "pending_Request",
    label: "Pending",
    dotClass: "awr-tab-dot-pending",
    activeClass: "awr-tab-pending-active",
    barClass: "awr-status-bar-pending",
    labelDotClass: "awr-content-label-dot-pending",
  },
  {
    key: "accepted_Request",
    label: "Accepted",
    dotClass: "awr-tab-dot-accepted",
    activeClass: "awr-tab-accepted-active",
    barClass: "awr-status-bar-accepted",
    labelDotClass: "awr-content-label-dot-accepted",
  },
  {
    key: "declined_Request",
    label: "Declined",
    dotClass: "awr-tab-dot-declined",
    activeClass: "awr-tab-declined-active",
    barClass: "awr-status-bar-declined",
    labelDotClass: "awr-content-label-dot-declined",
  },
];

const AgencyWithdrawRequest = () => {
  const [type, setType] = useState<string>("agency");
  const [statusType, setStatusType] = useState<string | null>(null);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedType = localStorage.getItem("withdrawType") || "pending_Request";
      if (storedType) setStatusType(storedType);
    }
  }, []);

  useEffect(() => {
    if (statusType) localStorage.setItem("withdrawType", statusType);
  }, [statusType]);

  useEffect(() => {
    routerChange("/AgencyWithdrawRequest", "mainType", router);
  }, []);

  const activeTab = tabConfig.find(t => t.key === statusType) || tabConfig[0];

  return (
    <>
      <style>{agencyWithdrawStyle}</style>

      <div className="awr-root">

        {/* ── Page Header ── */}
        <div className="awr-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Agency Withdraw Requests
          </h2>
          <p>Track and manage all withdrawal requests by status</p>
        </div>

        {/* ── Controls Row ── */}
        <div className="awr-controls">

          {/* Segmented tab strip */}
          <div className="awr-tab-strip">
            {tabConfig.map(tab => (
              <button
                key={tab.key}
                className={`awr-tab ${statusType === tab.key ? tab.activeClass : ""}`}
                onClick={() => setStatusType(tab.key)}
              >
                <span className={`awr-tab-dot ${tab.dotClass}`} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Analytics date picker */}
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            direction={"end"}
          />
        </div>

        {/* ── Content area with colored top bar ── */}
        <div>
          {/* Colored status top bar */}
          <div className={`awr-status-bar ${activeTab.barClass}`} />

          {/* Inner content topbar */}
          <div className="awr-content-topbar" style={{
            background: "#fff",
            border: "1.5px solid #e8eaf2",
            borderTop: "none",
            borderBottom: "1px solid #e8eaf2",
          }}>
            <span className="awr-content-label">
              <span className={`awr-content-label-dot ${activeTab.labelDotClass}`} />
              {activeTab.label} Requests
            </span>
          </div>

          {/* Table content */}
          <div style={{
            background: "#fff",
            border: "1.5px solid #e8eaf2",
            borderTop: "none",
            borderRadius: "0 0 16px 16px",
            overflow: "hidden",
            boxShadow: "0 2px 16px rgba(99,102,241,0.06)",
            animation: "awrFade .22s ease",
          }}>
            {statusType === "pending_Request" && (
              <PendingWithdrawReq
                statusType={statusType}
                type={type}
                startDate={startDate}
                endDate={endDate}
              />
            )}
            {statusType === "accepted_Request" && (
              <AcceptedWithrawRequest
                statusType={statusType}
                type={type}
                startDate={startDate}
                endDate={endDate}
              />
            )}
            {statusType === "declined_Request" && (
              <DeclineWithdrawRequest
                statusType={statusType}
                type={type}
                startDate={startDate}
                endDate={endDate}
              />
            )}
          </div>
        </div>

      </div>
    </>
  );
};

AgencyWithdrawRequest.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default AgencyWithdrawRequest;