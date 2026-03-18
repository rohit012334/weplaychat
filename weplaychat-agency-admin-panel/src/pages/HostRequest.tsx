import AcceptedHostRequest from "@/component/hostRequest/AcceptedHostRequest";
import DeclinedHostRequest from "@/component/hostRequest/DeclinedHostRequest";
import PendingHostRequest from "@/component/hostRequest/PendingHostRequest";
import RootLayout from "@/component/layout/Layout";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { useRouter } from "next/router";
import { routerChange } from "@/utils/Common";

const hostRequestStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .hr-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  /* ── Page header ── */
  .hr-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .hr-header-left {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .hr-header-left h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 24px;
    font-weight: 900;
    color: #1e2235;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .hr-header-left h2 span.hr-title-dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    animation: hrPulse 2s ease-in-out infinite;
  }

  @keyframes hrPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50%       { transform: scale(1.5); opacity: 0.6; }
  }

  .hr-header-left p {
    font-size: 13px;
    color: #a0a8c0;
    margin: 0;
  }

  /* ── Stats pills in header ── */
  .hr-header-stats {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .hr-stat-pill {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 7px 14px;
    border-radius: 10px;
    border: 1.5px solid #e8eaf2;
    background: #ffffff;
    font-size: 12.5px;
    font-weight: 600;
    color: #64748b;
    transition: all .15s;
  }

  .hr-stat-pill-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  /* ── Tab bar ── */
  .hr-tabs {
    display: flex;
    gap: 0;
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    border-radius: 14px;
    padding: 5px;
    width: fit-content;
    margin-bottom: 24px;
    box-shadow: 0 2px 10px rgba(99,102,241,0.05);
  }

  .hr-tab {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 22px;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    font-weight: 600;
    cursor: pointer;
    border: none;
    background: transparent;
    color: #a0a8c0;
    transition: all .18s;
    position: relative;
    white-space: nowrap;
  }

  .hr-tab:hover:not(.hr-tab-active) {
    color: #6366f1;
    background: rgba(99,102,241,0.05);
  }

  .hr-tab-active {
    background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.08) 100%);
    color: #6366f1;
    border: 1px solid rgba(99,102,241,0.22) !important;
    box-shadow: 0 2px 10px rgba(99,102,241,0.10);
  }

  .hr-tab-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 5px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    line-height: 1;
  }

  .hr-tab-active .hr-tab-badge {
    background: linear-gradient(135deg, #6366f1, #a855f7);
    color: #fff;
  }

  .hr-tab:not(.hr-tab-active) .hr-tab-badge {
    background: #f4f5fb;
    color: #a0a8c0;
  }

  /* ── Content card ── */
  .hr-content {
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: hrFadeIn .25s ease;
  }

  @keyframes hrFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Content header strip ── */
  .hr-content-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(168,85,247,0.02) 100%);
  }

  .hr-content-head-title {
    display: flex;
    align-items: center;
    gap: 9px;
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 800;
    color: #1e2235;
  }

  .hr-content-head-icon {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hr-content-body {
    padding: 4px 0;
  }

  /* ── Status colors ── */
  .hr-pending  { color: #f59e0b; }
  .hr-accepted { color: #10b981; }
  .hr-declined { color: #f43f5e; }

  .hr-icon-pending  { background: rgba(245,158,11,0.10);  }
  .hr-icon-accepted { background: rgba(16,185,129,0.10);  }
  .hr-icon-declined { background: rgba(244,63,94,0.10);   }

  .hr-badge-pending  { background: rgba(245,158,11,0.10);  color: #f59e0b; border: 1px solid rgba(245,158,11,0.20);  }
  .hr-badge-accepted { background: rgba(16,185,129,0.10);  color: #10b981; border: 1px solid rgba(16,185,129,0.20); }
  .hr-badge-declined { background: rgba(244,63,94,0.10);   color: #f43f5e; border: 1px solid rgba(244,63,94,0.20);  }
`;

const tabs = [
  {
    key: "Pending",
    label: "Pending",
    badgeClass: "hr-badge-pending",
    iconClass: "hr-icon-pending",
    textClass: "hr-pending",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: "accepted",
    label: "Accepted",
    badgeClass: "hr-badge-accepted",
    iconClass: "hr-icon-accepted",
    textClass: "hr-accepted",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  {
    key: "declined",
    label: "Declined",
    badgeClass: "hr-badge-declined",
    iconClass: "hr-icon-declined",
    textClass: "hr-declined",
    icon: (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
];

const HostRequest = () => {
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const [type, setType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedType = localStorage.getItem("hostRequestType") || "Pending";
      setType(storedType);
    }
  }, []);

  useEffect(() => {
    if (type) localStorage.setItem("hostRequestType", type);
  }, [type]);

  useEffect(() => {
    routerChange("/HostRequest", "hostRequestType", router);
  }, []);

  const activeTab = tabs.find(t => t.key === type) || tabs[0];

  return (
    <>
      <style>{hostRequestStyle}</style>

      <div className={`hr-root ${dialogueType === "doctor" ? "d-none" : ""}`}>

        {/* ── Page Header ── */}
        <div className="hr-header">
          <div className="hr-header-left">
            <h2>
              <span className="hr-title-dot" />
              Host Requests
            </h2>
            <p>Review and manage incoming host applications</p>
          </div>

          {/* Status pills */}
          <div className="hr-header-stats">
            {tabs.map(tab => (
              <div className="hr-stat-pill" key={tab.key}>
                <span
                  className="hr-stat-pill-dot"
                  style={{
                    background:
                      tab.key === "Pending"  ? "#f59e0b" :
                      tab.key === "accepted" ? "#10b981" : "#f43f5e",
                  }}
                />
                {tab.label}
              </div>
            ))}
          </div>
        </div>

        {/* ── Tab Bar ── */}
        <div className="hr-tabs">
          {tabs.map(tab => (
            <button
              key={tab.key}
              className={`hr-tab${type === tab.key ? " hr-tab-active" : ""} ${tab.textClass}`}
              onClick={() => setType(tab.key)}
            >
              {tab.icon}
              {tab.label}
              <span className={`hr-tab-badge ${tab.badgeClass}`}>
                {tab.key === "Pending" ? "●" : tab.key === "accepted" ? "✓" : "✕"}
              </span>
            </button>
          ))}
        </div>

        {/* ── Content Card ── */}
        <div className="hr-content" key={type}>
          <div className="hr-content-head">
            <div className="hr-content-head-title">
              <div className={`hr-content-head-icon ${activeTab.iconClass} ${activeTab.textClass}`}>
                {activeTab.icon}
              </div>
              {activeTab.label} Requests
            </div>
            <span className={`hr-tab-badge ${activeTab.badgeClass}`} style={{ padding: "4px 10px", borderRadius: "8px", fontSize: "11px" }}>
              {activeTab.label}
            </span>
          </div>

          <div className="hr-content-body">
            {type === "Pending"  && <PendingHostRequest />}
            {type === "accepted" && <AcceptedHostRequest />}
            {type === "declined" && <DeclinedHostRequest />}
          </div>
        </div>

      </div>
    </>
  );
};

HostRequest.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default HostRequest;