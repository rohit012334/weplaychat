"use-client";
import RootLayout from "../component/layout/Layout";
import React from "react";
import { RootStore, useAppSelector } from "../store/store";
import GiftShow from "@/component/gift/GiftShow";
import AddSvgaDialogue from "@/component/gift/AddSvgaDialogue";
import CreateGift from "@/component/gift/CreateGift";

const HIDDEN_DIALOGUES = [
  "hostSettleMent",
  "hostHistory",
  "fakeUserAdd",
  "fakeUser",
  "hostReport",
];

const GiftPage = () => {
  const { dialogueType } = useAppSelector(
    (state: RootStore) => state.dialogue
  );

  const isHidden = HIDDEN_DIALOGUES.includes(dialogueType);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .gp-page {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.22);
          --green:    #10b981;
          --g-soft:   rgba(16,185,129,0.10);
          --amber:    #f59e0b;
          --am-soft:  rgba(245,158,11,0.10);
          --blue:     #3b82f6;
          --bl-soft:  rgba(59,130,246,0.10);
          --rose:     #f43f5e;
          --r-soft:   rgba(244,63,94,0.08);
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

        /* ── Page Header ── */
        .gp-page .gp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 22px;
        }
        .gp-page .gp-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .gp-page .gp-header-pill {
          width: 4px;
          height: 28px;
          border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          flex-shrink: 0;
        }
        .gp-page .gp-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--txt-dark);
          line-height: 1.1;
          margin: 0;
        }
        .gp-page .gp-sub {
          font-size: 12px;
          color: var(--txt-dim);
          margin-top: 2px;
        }

        /* ── Breadcrumb trail ── */
        .gp-page .gp-breadcrumb {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 20px;
        }
        .gp-page .gp-breadcrumb span {
          font-size: 12px;
          color: var(--txt-dim);
          font-weight: 500;
        }
        .gp-page .gp-breadcrumb .gp-bc-sep {
          color: var(--border);
        }
        .gp-page .gp-breadcrumb .gp-bc-active {
          color: var(--accent);
          font-weight: 600;
        }

        /* ── Stats strip ── */
        .gp-page .gp-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .gp-page .gp-stat {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          padding: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          transition: box-shadow .18s, transform .15s;
          cursor: default;
        }
        .gp-page .gp-stat:hover {
          box-shadow: 0 4px 18px var(--a-soft);
          transform: translateY(-2px);
        }
        .gp-page .gp-stat-icon {
          width: 40px;
          height: 40px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .gp-page .si-p { background: var(--a-soft);  color: var(--accent); }
        .gp-page .si-g { background: var(--g-soft);  color: var(--green); }
        .gp-page .si-a { background: var(--am-soft); color: var(--amber); }
        .gp-page .gp-stat-val {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--txt-dark);
          line-height: 1.1;
        }
        .gp-page .gp-stat-lbl {
          font-size: 11.5px;
          color: var(--txt-dim);
          font-weight: 500;
        }

        /* ── Type tab bar ── */
        .gp-page .gp-tabs {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 18px;
        }
        .gp-page .gp-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px;
          border-radius: 10px;
          border: 1.5px solid var(--border);
          background: var(--white);
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: var(--txt);
          cursor: pointer;
          transition: all .15s;
        }
        .gp-page .gp-tab:hover {
          border-color: var(--accent);
          color: var(--accent);
          background: var(--a-soft);
        }
        .gp-page .gp-tab.active {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          border-color: transparent;
          color: #fff;
          box-shadow: 0 4px 14px var(--a-glow);
        }
        .gp-page .gp-tab-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: currentColor;
          opacity: 0.6;
        }

        /* ── Main content card ── */
        .gp-page .gp-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }

        .gp-page .gp-card-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
        }
        .gp-page .gp-card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: var(--txt-dark);
        }
        .gp-page .gp-card-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--a-soft);
          color: var(--accent);
          font-size: 12px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          border: 1px solid var(--a-mid);
        }
        .gp-page .gp-card-body {
          padding: 20px;
        }

        /* ── Divider ── */
        .gp-page .gp-divider {
          height: 1px;
          background: var(--border);
          margin: 0 20px;
        }

        /* ── Dialog overlay wrappers ── */
        .gp-page .gp-dialog-section {
          margin-top: 20px;
        }

        /* ── Empty / loading state ── */
        .gp-page .gp-empty {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          padding: 56px 20px;
          color: var(--txt-dim);
        }
        .gp-page .gp-empty-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          background: var(--a-soft);
          color: var(--accent);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .gp-page .gp-empty-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 17px;
          font-weight: 700;
          color: var(--txt-dark);
          margin: 0;
        }
        .gp-page .gp-empty-sub {
          font-size: 13px;
          color: var(--txt-dim);
          margin: 0;
        }
      `}</style>

      <div className="gp-page">

        {/* ── Page Header ── */}
        <div className="gp-header">
          <div className="gp-header-left">
            <div className="gp-header-pill" />
            <div>
              <h1 className="gp-title">Gifts</h1>
              <p className="gp-sub">Browse, add and manage all platform gifts</p>
            </div>
          </div>
        </div>

        {/* ── Breadcrumb ── */}
        <div className="gp-breadcrumb">
          <span>Dashboard</span>
          <span className="gp-bc-sep">›</span>
          <span>Gifts</span>
          <span className="gp-bc-sep">›</span>
          <span className="gp-bc-active">Gift Library</span>
        </div>

        {/* ── Stats Strip ── */}
        <div className="gp-stats">
          {[
            {
              label: "Gift Library",
              val: "All",
              cls: "si-p",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 12 20 22 4 22 4 12"/>
                  <rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              ),
            },
            {
              label: "SVGA Gifts",
              val: "SVGA",
              cls: "si-g",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
                </svg>
              ),
            },
            {
              label: "Image Gifts",
              val: "IMG",
              cls: "si-a",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              ),
            },
          ].map((s, i) => (
            <div className="gp-stat" key={i}>
              <div className={`gp-stat-icon ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="gp-stat-val">{s.val}</div>
                <div className="gp-stat-lbl">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Main gift content ── */}
        {!isHidden && (
          <div className="gp-card">
            <div className="gp-card-head">
              <span className="gp-card-title">Gift Library</span>
              <span className="gp-card-badge">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 12 20 22 4 22 4 12"/>
                  <rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
                All Gifts
              </span>
            </div>

            <div className="gp-card-body">
              <GiftShow />
            </div>

            {/* SVGA Dialog */}
            {dialogueType === "svgaGift" && (
              <div className="gp-dialog-section">
                <div className="gp-divider" />
                <AddSvgaDialogue />
              </div>
            )}

            {/* Image Gift Dialog */}
            {dialogueType === "imageGift" && (
              <div className="gp-dialog-section">
                <div className="gp-divider" />
                <CreateGift />
              </div>
            )}
          </div>
        )}

      </div>
    </>
  );
};

GiftPage.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default GiftPage;