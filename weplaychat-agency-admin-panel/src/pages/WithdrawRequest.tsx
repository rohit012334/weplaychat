import RootLayout from "@/component/layout/Layout";
import AcceptedWithrawRequest from "@/component/withdrawRequest/AcceptedWithrawRequest";
import DeclineWithdrawRequest from "@/component/withdrawRequest/DeclineWithdrawRequest";
import PendingWithdrawReq from "@/component/withdrawRequest/PendingWithdrawReq";
import Analytics from "@/extra/Analytic";
import { RootStore } from "@/store/store";
import { routerChange } from "@/utils/Common";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const withdrawRequestStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .wr-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  /* ── Page Header ── */
  .wr-page-header {
    margin-bottom: 22px;
  }

  .wr-page-header h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 23px;
    font-weight: 900;
    color: #1e2235;
    margin: 0 0 3px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .wr-page-header p {
    font-size: 12.5px;
    color: #a0a8c0;
    margin: 0;
  }

  /* ── Controls bar ── */
  .wr-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    flex-wrap: wrap;
    margin-bottom: 20px;
  }

  /* ── Tab strip — pill style with shadow ── */
  .wr-tab-strip {
    display: inline-flex;
    align-items: stretch;
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-radius: 14px;
    padding: 5px;
    gap: 5px;
    box-shadow: 0 2px 12px rgba(99,102,241,0.07);
  }

  .wr-tab {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: transparent;
    color: #a0a8c0;
    transition: background .16s, color .16s, box-shadow .16s;
    white-space: nowrap;
    position: relative;
  }

  .wr-tab:hover:not(.wr-tab-active-pending):not(.wr-tab-active-accepted):not(.wr-tab-active-declined) {
    background: #f4f5fb;
    color: #64748b;
  }

  /* Pending */
  .wr-tab-active-pending {
    background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(251,191,36,0.08));
    color: #d97706;
    box-shadow: 0 2px 10px rgba(245,158,11,0.14);
    border: 1px solid rgba(245,158,11,0.20);
  }

  /* Accepted */
  .wr-tab-active-accepted {
    background: linear-gradient(135deg, rgba(16,185,129,0.11), rgba(52,211,153,0.07));
    color: #059669;
    box-shadow: 0 2px 10px rgba(16,185,129,0.13);
    border: 1px solid rgba(16,185,129,0.20);
  }

  /* Declined */
  .wr-tab-active-declined {
    background: linear-gradient(135deg, rgba(244,63,94,0.10), rgba(251,113,133,0.06));
    color: #e11d48;
    box-shadow: 0 2px 10px rgba(244,63,94,0.12);
    border: 1px solid rgba(244,63,94,0.18);
  }

  /* Tab icon dot */
  .wr-tab-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
    transition: transform .2s;
  }
  .wr-tab:hover .wr-tab-dot { transform: scale(1.3); }

  .wr-dot-pending  { background: #f59e0b; }
  .wr-dot-accepted { background: #10b981; }
  .wr-dot-declined { background: #f43f5e; }

  .wr-tab-active-pending .wr-dot-pending   { animation: wrPulse 1.8s ease-in-out infinite; }
  .wr-tab-active-accepted .wr-dot-accepted { animation: wrPulse 1.8s ease-in-out infinite; }
  .wr-tab-active-declined .wr-dot-declined { animation: wrPulse 1.8s ease-in-out infinite; }

  @keyframes wrPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.45; transform:scale(1.5); }
  }

  /* ── Content wrapper ── */
  .wr-content-wrap {
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: wrFade .22s ease;
    border: 1.5px solid #e8eaf2;
  }

  @keyframes wrFade {
    from { opacity:0; transform:translateY(7px); }
    to   { opacity:1; transform:translateY(0); }
  }

  /* Colored accent top bar that changes with tab */
  .wr-accent-bar {
    height: 4px;
    width: 100%;
    border-radius: 0;
    transition: background .25s ease;
  }
  .wr-accent-pending  { background: linear-gradient(90deg, #f59e0b, #fbbf24, #fcd34d); }
  .wr-accent-accepted { background: linear-gradient(90deg, #10b981, #34d399, #6ee7b7); }
  .wr-accent-declined { background: linear-gradient(90deg, #f43f5e, #fb7185, #fda4af); }

  /* Inner topbar inside content */
  .wr-inner-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 13px 20px;
    border-bottom: 1px solid #e8eaf2;
    background: #fff;
    flex-wrap: wrap;
    gap: 8px;
  }

  .wr-status-label {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #1e2235;
  }

  .wr-status-badge {
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 700;
    padding: 3px 9px;
    border-radius: 20px;
    letter-spacing: .3px;
  }

  .wr-badge-pending  {
    background: rgba(245,158,11,0.10);
    border: 1px solid rgba(245,158,11,0.22);
    color: #d97706;
  }
  .wr-badge-accepted {
    background: rgba(16,185,129,0.10);
    border: 1px solid rgba(16,185,129,0.22);
    color: #059669;
  }
  .wr-badge-declined {
    background: rgba(244,63,94,0.09);
    border: 1px solid rgba(244,63,94,0.20);
    color: #e11d48;
  }

  /* ── Content body ── */
  .wr-content-body {
    background: #fff;
  }
`;

const tabConfig = [
  {
    key: "pending_Request",
    label: "Pending",
    dotClass: "wr-dot-pending",
    activeClass: "wr-tab-active-pending",
    accentClass: "wr-accent-pending",
    badgeClass: "wr-badge-pending",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: "accepted_Request",
    label: "Accepted",
    dotClass: "wr-dot-accepted",
    activeClass: "wr-tab-active-accepted",
    accentClass: "wr-accent-accepted",
    badgeClass: "wr-badge-accepted",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    key: "declined_Request",
    label: "Declined",
    dotClass: "wr-dot-declined",
    activeClass: "wr-tab-active-declined",
    accentClass: "wr-accent-declined",
    badgeClass: "wr-badge-declined",
    icon: (
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
];

const WithdrawRequest = () => {
  const [type, setType] = useState<string>("agency");
  const [statusType, setStatusType] = useState<string | null>("pending_Request");
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedType = localStorage.getItem("withdrawType") || "pending_Request";
      setStatusType(storedType);
    }
  }, []);

  useEffect(() => {
    if (statusType) localStorage.setItem("withdrawType", statusType);
  }, [statusType]);

  useEffect(() => { routerChange("/WithdrawRequest", "mainType", router); }, []);

  const activeTab = tabConfig.find(t => t.key === statusType) || tabConfig[0];

  return (
    <>
      <style>{withdrawRequestStyle}</style>

      <div className="wr-root">

        {/* ── Page Header ── */}
        <div className="wr-page-header">
          <h2>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#6366f1" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            Withdraw Requests
          </h2>
          <p>Manage and track all agency withdrawal requests by status</p>
        </div>

        {/* ── Controls ── */}
        <div className="wr-controls">

          {/* Segmented tab strip */}
          <div className="wr-tab-strip">
            {tabConfig.map(tab => (
              <button
                key={tab.key}
                className={`wr-tab ${statusType === tab.key ? tab.activeClass : ""}`}
                onClick={() => setStatusType(tab.key)}
              >
                <span className={`wr-tab-dot ${tab.dotClass}`} />
                {tab.icon}
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
            direction="end"
          />
        </div>

        {/* ── Content ── */}
        <div className="wr-content-wrap">

          {/* Colored accent top bar */}
          <div className={`wr-accent-bar ${activeTab.accentClass}`} />

          {/* Inner topbar */}
          <div className="wr-inner-topbar">
            <span className="wr-status-label">
              {activeTab.icon}
              {activeTab.label} Requests
            </span>
            <span className={`wr-status-badge ${activeTab.badgeClass}`}>
              {activeTab.label}
            </span>
          </div>

          {/* Content body */}
          <div className="wr-content-body">
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