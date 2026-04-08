import RootLayout from "@/component/layout/Layout";
import { useState } from "react";
import dynamic from "next/dynamic";

// Dynamic import - pages se seedha load hoga, koi error nahi
const BackgroundPage = dynamic(() => import("@/pages/Background"), { ssr: false });
const FramePage  = dynamic(() => import("@/pages/Frame"),  { ssr: false });
const EntryPage  = dynamic(() => import("@/pages/Entry"),  { ssr: false });
const EntryTagPage = dynamic(() => import("@/pages/EntryTag"), { ssr: false });
const TagPage    = dynamic(() => import("@/pages/Tag"),    { ssr: false });


const TAB_CONFIG = [
  {
    key: "Background",
    label: "Background",
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
        <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
        <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1z" />
      </svg>
    ),
  },
  {
    key: "Frame",
    label: "Frame",
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
        <path d="M0 1a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H1a1 1 0 0 1-1-1zm1 0v14h14V1zm1 1h12v12H2zm1 1v10h10V3z" />
      </svg>
    ),
  },
  {
    key: "Entry",
    label: "Entry",
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
        <path d="M8.354 1.146a.5.5 0 0 0-.708 0l-6 6A.5.5 0 0 0 1.5 7.5v7a.5.5 0 0 0 .5.5h4.5v-5h4v5H15a.5.5 0 0 0 .5-.5v-7a.5.5 0 0 0-.146-.354zM2.5 14V7.707l5.5-5.5 5.5 5.5V14H11v-5H5v5z" />
      </svg>
    ),
  },
  {
    key: "EntryTag",
    label: "Entry Effect",
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
        <path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
      </svg>
    ),
  },
  {
    key: "Tag",
    label: "Tag",
    icon: (
      <svg width="15" height="15" fill="currentColor" viewBox="0 0 16 16">
        <path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
      </svg>
    ),
  },
];

const Store = () => {
  const [activeTab, setActiveTab] = useState<string>("Background");

  const renderContent = () => {
    switch (activeTab) {
      case "Background": return <BackgroundPage />;
      case "Frame":       return <FramePage />;
      case "Entry":       return <EntryPage />;
      case "EntryTag":    return <EntryTagPage />;
      case "Tag":         return <TagPage />;
      default:            return null;
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .store-page {
          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: #f4f5fb;
          min-height: 100vh;
          box-sizing: border-box;
        }
        .store-header {
          display: flex; align-items: center; gap: 12px;
          margin-bottom: 24px;
        }
        .store-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, #6366f1, #a855f7);
          flex-shrink: 0;
        }
        .store-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px; font-weight: 700;
          color: #1e2235; margin: 0;
        }
        .store-sub { font-size: 12px; color: #a0a8c0; margin-top: 2px; }

        .store-tabs {
          display: flex; align-items: center; gap: 8px;
          background: #ffffff;
          border: 1px solid #e8eaf2;
          border-radius: 14px;
          padding: 10px 14px;
          margin-bottom: 20px;
          box-shadow: 0 1px 8px rgba(99,102,241,0.05);
          width: fit-content;
        }
        .store-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 9px 18px;
          border-radius: 10px;
          border: 1.5px solid transparent;
          background: transparent;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600;
          color: #a0a8c0;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .store-tab:hover {
          background: rgba(99,102,241,0.08);
          color: #6366f1;
          transform: translateY(-1px);
        }
        .store-tab.active {
          background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.06));
          color: #6366f1;
          border-color: rgba(99,102,241,0.25);
          box-shadow: 0 3px 12px rgba(99,102,241,0.12);
        }
        .store-tab-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: #a0a8c0; transition: background 0.15s; flex-shrink: 0;
        }
        .store-tab.active .store-tab-dot { background: #6366f1; }

        .store-content-card {
          background: #ffffff;
          border: 1px solid #e8eaf2;
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }
        .store-content-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #e8eaf2;
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
        }
        .store-content-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px; font-weight: 700; color: #1e2235;
          display: flex; align-items: center; gap: 8px;
        }
        .store-content-badge {
          display: inline-flex; align-items: center;
          padding: 3px 12px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
          background: rgba(99,102,241,0.09);
          color: #6366f1;
          border: 1px solid rgba(99,102,241,0.20);
        }
        .store-content-body { padding: 4px 0; }
      `}</style>

      <div className="store-page">

        <div className="store-header">
          <div className="store-header-pill" />
          <div>
            <h1 className="store-title">Store</h1>
            <p className="store-sub">Manage store sections</p>
          </div>
        </div>

        <div className="store-tabs">
          {TAB_CONFIG.map((tab) => (
            <button
              key={tab.key}
              className={`store-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <span className="store-tab-dot" />
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="store-content-card">
          <div className="store-content-head">
            <span className="store-content-title">
              {TAB_CONFIG.find((t) => t.key === activeTab)?.icon}
              {activeTab}
            </span>
            <span className="store-content-badge">{activeTab}</span>
          </div>
          <div className="store-content-body">
            {renderContent()}
          </div>
        </div>

      </div>
    </>
  );
};

Store.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Store;