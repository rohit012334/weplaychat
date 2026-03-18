import AcceptedHostRequest from "@/component/hostRequest/AcceptedHostRequest";
import DeclinedHostRequest from "@/component/hostRequest/DeclinedHostRequest";
import PendingHostRequest from "@/component/hostRequest/PendingHostRequest";
import RootLayout from "@/component/layout/Layout";
import { RootStore, useAppDispatch } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/router";
import { routerChange } from "@/utils/Common";
import { setHostRequest } from "@/store/hostRequestSlice";

const TAB_CONFIG = [
  {
    key: "Pending",
    label: "Pending",
    badgeCls: "hr-badge-amber",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    key: "accepted",
    label: "Accepted",
    badgeCls: "hr-badge-green",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    key: "declined",
    label: "Declined",
    badgeCls: "hr-badge-rose",
    icon: (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
        stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    ),
  },
];

const HostRequest = () => {
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const dispatch = useAppDispatch();
  const [type, setType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("hostRequestType") || "Pending";
    setType(storedType);
  }, []);

  useEffect(() => {
    if (type) localStorage.setItem("hostRequestType", type);
  }, [type]);

  useEffect(() => {
    routerChange("/HostRequest", "hostRequestType", router);
  }, [router]);

  const handleTabChange = (key: string) => {
    dispatch(setHostRequest([]));
    setType(key);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .hr-page {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.20);
          --green:    #10b981;
          --g-soft:   rgba(16,185,129,0.10);
          --g-mid:    rgba(16,185,129,0.20);
          --amber:    #f59e0b;
          --am-soft:  rgba(245,158,11,0.10);
          --am-mid:   rgba(245,158,11,0.22);
          --rose:     #f43f5e;
          --r-soft:   rgba(244,63,94,0.09);
          --r-mid:    rgba(244,63,94,0.20);
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

        /* ── Page header ── */
        .hr-page .hr-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .hr-page .hr-header-left { display: flex; align-items: center; gap: 12px; }
        .hr-page .hr-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          flex-shrink: 0;
        }
        .hr-page .hr-title {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1; margin: 0;
        }
        .hr-page .hr-sub { font-size: 12px; color: var(--txt-dim); margin-top: 2px; }

        /* ── Tab bar ── */
        .hr-page .hr-tabs {
          display: flex; align-items: center; gap: 8px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 10px 14px;
          margin-bottom: 20px;
          box-shadow: 0 1px 8px rgba(99,102,241,0.05);
          width: fit-content;
        }

        .hr-page .hr-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          border-radius: 10px;
          border: 1.5px solid transparent;
          background: transparent;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600;
          color: var(--txt-dim);
          cursor: pointer;
          transition: background .15s, color .15s, border-color .15s, box-shadow .15s, transform .12s;
          white-space: nowrap;
        }
        .hr-page .hr-tab:hover {
          background: var(--a-soft); color: var(--accent);
          transform: translateY(-1px);
        }

        /* Active states per tab */
        .hr-page .hr-tab.active-Pending {
          background: var(--am-soft); color: var(--amber);
          border-color: var(--am-mid);
          box-shadow: 0 3px 12px rgba(245,158,11,0.12);
        }
        .hr-page .hr-tab.active-accepted {
          background: var(--g-soft); color: var(--green);
          border-color: var(--g-mid);
          box-shadow: 0 3px 12px rgba(16,185,129,0.12);
        }
        .hr-page .hr-tab.active-declined {
          background: var(--r-soft); color: var(--rose);
          border-color: var(--r-mid);
          box-shadow: 0 3px 12px rgba(244,63,94,0.12);
        }

        /* Tab dot indicator */
        .hr-page .hr-tab-dot {
          width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
          transition: background .15s;
        }
        .hr-page .hr-tab.active-Pending  .hr-tab-dot { background: var(--amber); }
        .hr-page .hr-tab.active-accepted .hr-tab-dot { background: var(--green); }
        .hr-page .hr-tab.active-declined .hr-tab-dot { background: var(--rose); }
        .hr-page .hr-tab:not([class*="active"]) .hr-tab-dot { background: var(--txt-dim); }

        /* ── Content card wrapper ── */
        .hr-page .hr-content-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }

        .hr-page .hr-content-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
        }
        .hr-page .hr-content-title {
          font-family: 'Rajdhani', sans-serif; font-size: 16px;
          font-weight: 700; color: var(--txt-dark);
          display: flex; align-items: center; gap: 8px;
        }
        .hr-page .hr-status-pill {
          display: inline-flex; align-items: center;
          padding: 3px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
        }
        .hr-page .hr-badge-amber { background: var(--am-soft); color: var(--amber); border: 1px solid var(--am-mid); }
        .hr-page .hr-badge-green { background: var(--g-soft);  color: var(--green); border: 1px solid var(--g-mid); }
        .hr-page .hr-badge-rose  { background: var(--r-soft);  color: var(--rose);  border: 1px solid var(--r-mid); }

        .hr-page .hr-content-body { padding: 4px 0; }
      `}</style>

      <div className={`hr-page ${dialogueType === "doctor" ? "d-none" : ""}`}>

        {/* ── Page header ── */}
        <div className="hr-header">
          <div className="hr-header-left">
            <div className="hr-header-pill" />
            <div>
              <h1 className="hr-title">Host Request</h1>
              <p className="hr-sub">Review and manage incoming host applications</p>
            </div>
          </div>
        </div>

        {/* ── Tab switcher ── */}
        <div className="hr-tabs">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              className={`hr-tab ${type === tab.key ? `active-${tab.key}` : ""}`}
              onClick={() => handleTabChange(tab.key)}
            >
              <span className="hr-tab-dot" />
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Content card ── */}
        {type && (
          <div className="hr-content-card">
            <div className="hr-content-head">
              <span className="hr-content-title">
                {TAB_CONFIG.find((t) => t.key === type)?.icon}
                {type === "Pending" ? "Pending Requests" : type === "accepted" ? "Accepted Requests" : "Declined Requests"}
              </span>
              <span className={`hr-status-pill ${TAB_CONFIG.find((t) => t.key === type)?.badgeCls}`}>
                {type}
              </span>
            </div>

            <div className="hr-content-body">
              {type === "Pending" && <PendingHostRequest type={type} />}
              {type === "accepted" && <AcceptedHostRequest type={type} />}
              {type === "declined" && <DeclinedHostRequest type={type} />}
            </div>
          </div>
        )}

      </div>
    </>
  );
};

HostRequest.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default HostRequest;