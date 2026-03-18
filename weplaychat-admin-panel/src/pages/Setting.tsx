import React, { useEffect, useState } from "react";
import RootLayout from "@/component/layout/Layout";
import AdminSetting from "@/component/setting/AdminSetting";
import PaymetSetting from "@/component/setting/PaymentSetting";
import WithdrawSetting from "@/component/setting/WithdrawSetting";
import CurrencySetting from "@/component/setting/CurrencySetting";
import DocumentType from "./DocumentType";
import Other from "./Other";
import { useRouter } from "next/router";
import { routerChange } from "@/utils/Common";

const tabs = [
  {
    key: "Setting",
    label: "Settings",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="3"/>
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
      </svg>
    ),
  },
  {
    key: "PaymetSetting",
    label: "Payment",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
        <line x1="1" y1="10" x2="23" y2="10"/>
      </svg>
    ),
  },
  {
    key: "WithdrawSetting",
    label: "Withdraw",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
      </svg>
    ),
  },
  {
    key: "CurrencySetting",
    label: "Currency",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9m0 0h4.5a1.5 1.5 0 0 1 0 3H9"/>
      </svg>
    ),
  },
  {
    key: "DocumentType",
    label: "Identity Proof",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    key: "Other",
    label: "Other",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
        <circle cx="12" cy="12" r="1"/>
        <circle cx="19" cy="12" r="1"/>
        <circle cx="5" cy="12" r="1"/>
      </svg>
    ),
  },
];

const Setting = () => {
  const [type, setType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("settingType") || "Setting";
    setType(storedType);
    routerChange("/Setting", "planType", router);
  }, [router]);

  useEffect(() => {
    if (type) localStorage.setItem("settingType", type);
  }, [type]);

  const activeTab = tabs.find((t) => t.key === type);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .st-page {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.20);
          --border:   #e8eaf2;
          --txt:      #64748b;
          --txt-dark: #1e2235;
          --txt-dim:  #a0a8c0;
          --white:    #ffffff;
          --bg:       #f4f5fb;

          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── Header ── */
        .st-page .st-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 22px;
        }
        .st-page .st-header-left { display: flex; align-items: center; gap: 12px; }
        .st-page .st-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          flex-shrink: 0;
        }
        .st-page .st-title {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1; margin: 0;
        }
        .st-page .st-sub { font-size: 12px; color: var(--txt-dim); margin-top: 2px; }

        /* ── Tab bar ── */
        .st-page .st-tabs {
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 8px;
          margin-bottom: 20px;
          box-shadow: 0 1px 8px rgba(99,102,241,0.05);
        }
        .st-page .st-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 16px; border-radius: 9px;
          border: none; background: transparent;
          font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--txt-dim); cursor: pointer;
          transition: all .16s; white-space: nowrap;
        }
        .st-page .st-tab:hover:not(.st-tab-active) {
          color: var(--txt); background: var(--bg);
        }
        .st-page .st-tab.st-tab-active {
          background: var(--a-soft);
          color: var(--accent);
          box-shadow: inset 0 0 0 1.5px var(--a-mid);
        }
        .st-page .st-tab-icon { display: flex; align-items: center; }

        /* ── Content card ── */
        .st-page .st-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
          margin-bottom: 50px;
        }
        .st-page .st-card-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
        }
        .st-page .st-card-title {
          font-family: 'Rajdhani', sans-serif; font-size: 16px;
          font-weight: 700; color: var(--txt-dark);
          display: flex; align-items: center; gap: 8px;
        }
        .st-page .st-card-badge {
          background: var(--a-soft); color: var(--accent);
          font-size: 12px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid var(--a-mid);
          display: inline-flex; align-items: center; gap: 5px;
        }
        .st-page .st-card-body { padding: 24px; }
      `}</style>

      <div className="st-page">

        {/* ── Header ── */}
        <div className="st-header">
          <div className="st-header-left">
            <div className="st-header-pill" />
            <div>
              <h1 className="st-title">Settings</h1>
              <p className="st-sub">Configure platform preferences and options</p>
            </div>
          </div>
        </div>

        {/* ── Tab bar ── */}
        <div className="st-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`st-tab${type === tab.key ? " st-tab-active" : ""}`}
              onClick={() => setType(tab.key)}
            >
              <span className="st-tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content card ── */}
        <div className="st-card">
          <div className="st-card-head">
            <span className="st-card-title">
              {activeTab && <span style={{ color: "var(--accent)", display: "flex" }}>{activeTab.icon}</span>}
              {activeTab?.label ?? "Settings"}
            </span>
            <span className="st-card-badge">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
              </svg>
              Configuration
            </span>
          </div>

          <div className="st-card-body">
            {type === "Setting"          && <AdminSetting />}
            {type === "PaymetSetting"    && <PaymetSetting />}
            {type === "WithdrawSetting"  && <WithdrawSetting />}
            {type === "CurrencySetting"  && <CurrencySetting />}
            {type === "DocumentType"     && <DocumentType />}
            {type === "Other"            && <Other />}
          </div>
        </div>

      </div>
    </>
  );
};

Setting.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Setting;