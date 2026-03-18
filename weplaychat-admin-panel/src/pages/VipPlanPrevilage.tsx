import RootLayout from "@/component/layout/Layout";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import { baseURL } from "../utils/config";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getVipPlanBeneFits } from "@/store/vipPlanSlice";
import VipPlanBenefitDialog from "@/component/VipPlanBenefitDialog";
import randommatch      from "@/assets/images/random_match.svg";
import videocall_discount from "@/assets/images/videocall_discount.svg";
import { isSkeleton }   from "@/utils/allSelector";

const VipPlanPrevilage = ({ type }: any) => {
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { vipPlanBenefits }: any = useSelector((state: RootStore) => state.vipPlan);
  const roleSkeleton = useSelector<any>(isSkeleton);
  const dispatch = useAppDispatch();

  useEffect(() => { dispatch(getVipPlanBeneFits()); }, [dispatch]);

  const vipBenefits = [
    {
      title: "VIP Frame Badge",
      value: "Frame",
      icon: baseURL + (vipPlanBenefits?.vipFrameBadge || "").replace(/\\/g, "/"),
      color: "amber",
      suffix: "",
    },
    {
      title: "Video Call Discount",
      value: vipPlanBenefits?.videoCallDiscount,
      icon: videocall_discount.src,
      color: "purple",
      suffix: "%",
    },
    {
      title: "Random Match Discount",
      value: vipPlanBenefits?.randomMatchCallDiscount,
      icon: randommatch.src,
      color: "green",
      suffix: "%",
    },
  ];

  const colorMap: Record<string, { bg: string; border: string; color: string; glow: string }> = {
    amber:  { bg: "rgba(245,158,11,0.10)",  border: "rgba(245,158,11,0.22)",  color: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
    purple: { bg: "rgba(168,85,247,0.10)",  border: "rgba(168,85,247,0.22)",  color: "#a855f7", glow: "rgba(168,85,247,0.15)" },
    green:  { bg: "rgba(16,185,129,0.10)",  border: "rgba(16,185,129,0.22)",  color: "#10b981", glow: "rgba(16,185,129,0.15)" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .vpp-page {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.20);
          --amber:    #f59e0b;
          --am-soft:  rgba(245,158,11,0.09);
          --am-mid:   rgba(245,158,11,0.20);
          --am-glow:  rgba(245,158,11,0.22);
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
        .vpp-page .vpp-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 24px;
        }
        .vpp-page .vpp-header-left { display: flex; align-items: center; gap: 12px; }
        .vpp-page .vpp-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, var(--amber), #f97316);
          flex-shrink: 0;
        }
        .vpp-page .vpp-title {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1; margin: 0;
        }
        .vpp-page .vpp-sub { font-size: 12px; color: var(--txt-dim); margin-top: 2px; }

        /* Edit button — amber theme */
        .vpp-page .vpp-edit-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--amber), #f97316);
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--am-glow);
          transition: box-shadow .15s, transform .13s;
        }
        .vpp-page .vpp-edit-btn:hover {
          box-shadow: 0 6px 20px var(--am-glow); transform: translateY(-1px);
        }

        /* ── Section label ── */
        .vpp-page .vpp-section-label {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 16px;
        }
        .vpp-page .vpp-section-title {
          font-family: 'Rajdhani', sans-serif; font-size: 15px;
          font-weight: 700; color: var(--txt-dark);
        }
        .vpp-page .vpp-section-badge {
          background: var(--am-soft); color: var(--amber);
          font-size: 11.5px; font-weight: 700;
          padding: 2px 9px; border-radius: 20px;
          border: 1px solid var(--am-mid);
        }

        /* ── Benefits grid ── */
        .vpp-page .vpp-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 1024px) { .vpp-page .vpp-grid { grid-template-columns: repeat(2,1fr); } }
        @media (max-width: 640px)  { .vpp-page .vpp-grid { grid-template-columns: 1fr; } }

        /* ── Benefit card ── */
        .vpp-page .vpp-card {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 20px;
          display: flex; align-items: center; gap: 16px;
          transition: transform .18s, box-shadow .18s;
          cursor: default;
        }
        .vpp-page .vpp-card:hover {
          transform: translateY(-3px);
        }

        /* icon wrap — color injected inline */
        .vpp-page .vpp-card-icon {
          width: 52px; height: 52px; border-radius: 14px;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .vpp-page .vpp-card-info { flex: 1; min-width: 0; }
        .vpp-page .vpp-card-title {
          font-size: 12px; font-weight: 600;
          color: var(--txt-dim); margin: 0 0 6px;
          text-transform: uppercase; letter-spacing: 0.04em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .vpp-page .vpp-card-val {
          font-family: 'Rajdhani', sans-serif;
          font-size: 26px; font-weight: 700;
          color: var(--txt-dark); line-height: 1; margin: 0;
        }
        .vpp-page .vpp-card-val .vpp-suffix {
          font-size: 16px; font-weight: 600; color: var(--txt-dim); margin-left: 2px;
        }

        /* ── Skeleton card ── */
        .vpp-page .vpp-skel {
          display: flex; align-items: center; gap: 16px;
        }
        .vpp-page .vpp-skel-icon {
          width: 52px; height: 52px; border-radius: 14px;
          background: #eaecf4; overflow: hidden; flex-shrink: 0;
        }
        .vpp-page .vpp-skel-lines { flex: 1; }
        .vpp-page .vpp-skel-t {
          height: 12px; width: 110px; border-radius: 6px;
          background: #eaecf4; margin-bottom: 10px;
        }
        .vpp-page .vpp-skel-v {
          height: 22px; width: 70px; border-radius: 6px; background: #eaecf4;
        }
        .vpp-page .vpp-shimmer {
          width: 100%; height: 100%;
          background: linear-gradient(90deg,#eaecf4 25%,#f4f5fb 50%,#eaecf4 75%);
          background-size: 200% 100%;
          animation: vpp-shim 1.4s infinite;
        }
        @keyframes vpp-shim {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      {dialogueType === "banner" && <VipPlanBenefitDialog />}

      <div className="vpp-page">

        {/* ── Header ── */}
        <div className="vpp-header">
          <div className="vpp-header-left">
            <div className="vpp-header-pill" />
            <div>
              <h1 className="vpp-title">VIP Privileges</h1>
              <p className="vpp-sub">Benefits and perks for VIP plan members</p>
            </div>
          </div>
          <button
            className="vpp-edit-btn"
            onClick={() => dispatch(openDialog({ type: "banner", data: vipPlanBenefits }))}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Edit Privileges
          </button>
        </div>

        {/* ── Section label ── */}
        <div className="vpp-section-label">
          <span className="vpp-section-title">All Benefits</span>
          <span className="vpp-section-badge">{vipBenefits.length} privileges</span>
        </div>

        {/* ── Grid ── */}
        <div className="vpp-grid">
          {vipBenefits.map((card, i) => {
            const c = colorMap[card.color];
            return (
              <div
                className="vpp-card"
                key={i}
                style={{ boxShadow: `0 2px 16px ${c.glow}`, borderColor: c.border }}
              >
                {roleSkeleton ? (
                  <div className="vpp-skel">
                    <div className="vpp-skel-icon"><div className="vpp-shimmer" /></div>
                    <div className="vpp-skel-lines">
                      <div className="vpp-skel-t" />
                      <div className="vpp-skel-v" />
                    </div>
                  </div>
                ) : (
                  <>
                    <div
                      className="vpp-card-icon"
                      style={{ background: c.bg, border: `1.5px solid ${c.border}` }}
                    >
                      <img src={card.icon} width={28} height={28} alt={card.title} />
                    </div>
                    <div className="vpp-card-info">
                      <p className="vpp-card-title">{card.title}</p>
                      <p className="vpp-card-val" style={{ color: c.color }}>
                        {card.value ?? "—"}
                        {card.suffix && <span className="vpp-suffix">{card.suffix}</span>}
                      </p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
};

VipPlanPrevilage.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default VipPlanPrevilage;