import RootLayout from "@/component/layout/Layout";
import { RootStore, useAppDispatch } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CallHistory from "@/component/history/CallHistory";
import GiftHistory from "@/component/history/GiftHistory";
import { useRouter } from "next/router";
import LiveBroadCastHistory from "@/component/history/LiveBroadCastHistory";
import { routerChange } from "@/utils/Common";
import CoinPlanUserHistory from "@/component/history/CoinPlanHistory";

const historyStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .hist-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  /* ── Page Header ── */
  .hist-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .hist-header-left h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 24px;
    font-weight: 900;
    color: #1e2235;
    margin: 0 0 4px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hist-title-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    animation: histPulse 2s ease-in-out infinite;
  }

  @keyframes histPulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.5); opacity: 0.6; }
  }

  .hist-header-left p {
    font-size: 13px;
    color: #a0a8c0;
    margin: 0;
  }

  /* ── Tab bar ── */
  .hist-tabs {
    display: flex;
    gap: 0;
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    border-radius: 14px;
    padding: 5px;
    width: fit-content;
    margin-bottom: 24px;
    box-shadow: 0 2px 10px rgba(99,102,241,0.05);
    flex-wrap: wrap;
  }

  .hist-tab {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 20px;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    background: transparent;
    color: #a0a8c0;
    transition: all .18s;
    white-space: nowrap;
  }

  .hist-tab:hover:not(.hist-tab-active) {
    color: #6366f1;
    background: rgba(99,102,241,0.05);
  }

  /* per-tab active colors */
  .hist-tab-active-coin {
    background: linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.06));
    border-color: rgba(245,158,11,0.28) !important;
    color: #f59e0b !important;
    box-shadow: 0 2px 10px rgba(245,158,11,0.10);
  }

  .hist-tab-active-call {
    background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06));
    border-color: rgba(99,102,241,0.25) !important;
    color: #6366f1 !important;
    box-shadow: 0 2px 10px rgba(99,102,241,0.10);
  }

  .hist-tab-active-gift {
    background: linear-gradient(135deg, rgba(236,72,153,0.10), rgba(244,63,94,0.06));
    border-color: rgba(236,72,153,0.25) !important;
    color: #ec4899 !important;
    box-shadow: 0 2px 10px rgba(236,72,153,0.10);
  }

  .hist-tab-active-live {
    background: linear-gradient(135deg, rgba(244,63,94,0.10), rgba(244,63,94,0.04));
    border-color: rgba(244,63,94,0.24) !important;
    color: #f43f5e !important;
    box-shadow: 0 2px 10px rgba(244,63,94,0.10);
  }

  /* ── Content card ── */
  .hist-content {
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: histFadeIn .22s ease;
  }

  @keyframes histFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Content header strip ── */
  .hist-content-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e8eaf2;
  }

  .hist-content-head-title {
    display: flex;
    align-items: center;
    gap: 9px;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 800;
    color: #1e2235;
  }

  .hist-head-icon {
    width: 30px; height: 30px;
    border-radius: 8px;
    display: flex; align-items: center; justify-content: center;
  }

  .hist-head-icon-coin  { background: rgba(245,158,11,0.10); color: #f59e0b; }
  .hist-head-icon-call  { background: rgba(99,102,241,0.10);  color: #6366f1; }
  .hist-head-icon-gift  { background: rgba(236,72,153,0.10);  color: #ec4899; }
  .hist-head-icon-live  { background: rgba(244,63,94,0.10);   color: #f43f5e; }

  /* status badge */
  .hist-head-badge {
    padding: 4px 12px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 700;
  }

  .hist-badge-coin  { background: rgba(245,158,11,0.09);  color: #f59e0b; border: 1px solid rgba(245,158,11,0.22); }
  .hist-badge-call  { background: rgba(99,102,241,0.09);  color: #6366f1; border: 1px solid rgba(99,102,241,0.22); }
  .hist-badge-gift  { background: rgba(236,72,153,0.09);  color: #ec4899; border: 1px solid rgba(236,72,153,0.22); }
  .hist-badge-live  { background: rgba(244,63,94,0.09);   color: #f43f5e; border: 1px solid rgba(244,63,94,0.22); }
`;

const tabs = [
  {
    key: "coin_plan",
    label: "Coin History",
    activeClass: "hist-tab-active-coin",
    iconClass: "hist-head-icon-coin",
    badgeClass: "hist-badge-coin",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
  },
  {
    key: "call",
    label: "Call History",
    activeClass: "hist-tab-active-call",
    iconClass: "hist-head-icon-call",
    badgeClass: "hist-badge-call",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.4 2 2 0 0 1 3.6 1.22h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.78a16 16 0 0 0 6.29 6.29l.97-.97a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
      </svg>
    ),
  },
  {
    key: "gift",
    label: "Gift History",
    activeClass: "hist-tab-active-gift",
    iconClass: "hist-head-icon-gift",
    badgeClass: "hist-badge-gift",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <polyline points="20 12 20 22 4 22 4 12" />
        <rect x="2" y="7" width="20" height="5" />
        <line x1="12" y1="22" x2="12" y2="7" />
        <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
        <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
      </svg>
    ),
  },
  {
    key: "vip_plan_purchase",
    label: "Live History",
    activeClass: "hist-tab-active-live",
    iconClass: "hist-head-icon-live",
    badgeClass: "hist-badge-live",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="2" />
        <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14" />
      </svg>
    ),
  },
];

const CoinPlanHistoryPage = () => {
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const dispatch = useAppDispatch();
  const router   = useRouter();

  const [type, setType] = useState<string>("coin_plan");

  useEffect(() => {
    routerChange("/Host/HostHistoryPage", "coinplantype", router);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedType = localStorage.getItem("coinplantype");
      if (storedType) setType(storedType);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("coinplantype", type);
    }
  }, [type]);

  const activeTab = tabs.find(t => t.key === type) || tabs[0];

  return (
    <>
      <style>{historyStyle}</style>

      <div className={`hist-root ${dialogueType === "doctor" ? "d-none" : ""}`}>

        {/* ── Page Header ── */}
        <div className="hist-header">
          <div className="hist-header-left">
            <h2>
              <span className="hist-title-dot" />
              Host History
            </h2>
            <p>View complete activity history for this host</p>
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="hist-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`hist-tab${type === tab.key ? ` ${tab.activeClass}` : ""}`}
              onClick={() => setType(tab.key)}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content Card ── */}
        <div className="hist-content" key={type}>
          {/* Header strip */}
          <div className="hist-content-head">
            <div className="hist-content-head-title">
              <div className={`hist-head-icon ${activeTab.iconClass}`}>
                {activeTab.icon}
              </div>
              {activeTab.label}
            </div>
            <span className={`hist-head-badge ${activeTab.badgeClass}`}>
              {activeTab.label}
            </span>
          </div>

          {/* Content */}
          {type === "coin_plan"        && <CoinPlanUserHistory />}
          {type === "call"             && <CallHistory />}
          {type === "gift"             && <GiftHistory />}
          {type === "vip_plan_purchase"&& <LiveBroadCastHistory />}
        </div>

      </div>
    </>
  );
};

CoinPlanHistoryPage.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default CoinPlanHistoryPage;