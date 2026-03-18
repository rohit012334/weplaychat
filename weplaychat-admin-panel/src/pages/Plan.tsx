import AcceptedHostRequest from "@/component/hostRequest/AcceptedHostRequest";
import DeclinedHostRequest from "@/component/hostRequest/DeclinedHostRequest";
import PendingHostRequest from "@/component/hostRequest/PendingHostRequest";
import RootLayout from "@/component/layout/Layout";
import { RootStore, useAppDispatch } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CoinPlan from "./CoinPlan";
import VipPlan from "./VipPlan";
import { openDialog } from "@/store/dialogSlice";
import CoinPlanDialog from "@/component/coinPlan/CoinPlanDialog";
import VipPlanDialog from "@/component/vipPlan/VipPlanDialog";
import { useRouter } from "next/router";
import { routerChange } from "@/utils/Common";
import VipPlanPrevilage from "./VipPlanPrevilage";

const Plan = () => {
    const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
    const dispatch = useAppDispatch();
    const router = useRouter();

    const [type, setType] = useState<string | null>(null);

    useEffect(() => {
        const storedType = localStorage.getItem("planType") || "coinPlan";
        setType(storedType);
    }, []);

    useEffect(() => {
        if (type) localStorage.setItem("planType", type);
    }, [type]);

    useEffect(() => {
        routerChange("/Plan", "planType", router);
    }, [router]);

    const tabs = [
        {
            key: "coinPlan",
            label: "Coin Plan",
            dialogType: "coinplan",
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9m0 0h4.5a1.5 1.5 0 0 1 0 3H9" />
                </svg>
            ),
        },
        {
            key: "vipPlan",
            label: "VIP Plan",
            dialogType: "vipPlan",
            icon: (
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
            ),
        },
    ];

    const activeTab = tabs.find((t) => t.key === type);

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .pl-page {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.20);
          --amber:    #f59e0b;
          --am-soft:  rgba(245,158,11,0.10);
          --am-mid:   rgba(245,158,11,0.20);
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
        .pl-page .pl-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 22px;
        }
        .pl-page .pl-header-left { display: flex; align-items: center; gap: 12px; }
        .pl-page .pl-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          flex-shrink: 0;
        }
        .pl-page .pl-title {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1; margin: 0;
        }
        .pl-page .pl-sub { font-size: 12px; color: var(--txt-dim); margin-top: 2px; }

        /* ── Add button ── */
        .pl-page .pl-add-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--a-glow);
          transition: box-shadow .15s, transform .13s;
        }
        .pl-page .pl-add-btn:hover {
          box-shadow: 0 6px 20px var(--a-glow); transform: translateY(-1px);
        }
        .pl-page .pl-add-btn.vip-btn {
          background: linear-gradient(135deg, var(--amber), #f97316);
          box-shadow: 0 4px 14px var(--am-mid);
        }
        .pl-page .pl-add-btn.vip-btn:hover {
          box-shadow: 0 6px 20px var(--am-mid);
        }

        /* ── Tab bar ── */
        .pl-page .pl-tabs {
          display: flex;
          align-items: center;
          gap: 6px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 6px;
          width: fit-content;
          margin-bottom: 20px;
          box-shadow: 0 1px 6px rgba(99,102,241,0.05);
        }
        .pl-page .pl-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 8px;
          border: none; background: transparent;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600;
          color: var(--txt-dim); cursor: pointer;
          transition: all .16s;
        }
        .pl-page .pl-tab:hover:not(.pl-tab-active) {
          color: var(--txt); background: var(--bg);
        }
        .pl-page .pl-tab.pl-tab-active {
          color: var(--accent);
          background: var(--a-soft);
          box-shadow: inset 0 0 0 1.5px var(--a-mid);
        }
        .pl-page .pl-tab.pl-tab-active.vip-active {
          color: var(--amber);
          background: var(--am-soft);
          box-shadow: inset 0 0 0 1.5px var(--am-mid);
        }
        .pl-page .pl-tab-label { line-height: 1; }

        /* ── Content card wrapper ── */
        .pl-page .pl-content {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }
        .pl-page .pl-content-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg,rgba(99,102,241,0.04),rgba(168,85,247,0.02));
        }
        .pl-page .pl-content-head.vip-head {
          background: linear-gradient(135deg,rgba(245,158,11,0.05),rgba(249,115,22,0.02));
        }
        .pl-page .pl-content-title {
          font-family: 'Rajdhani', sans-serif; font-size: 16px;
          font-weight: 700; color: var(--txt-dark);
          display: flex; align-items: center; gap: 8px;
        }
        .pl-page .pl-content-badge {
          background: var(--a-soft); color: var(--accent);
          font-size: 12px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid var(--a-mid);
          display: inline-flex; align-items: center; gap: 5px;
        }
        .pl-page .pl-content-badge.vip-badge {
          background: var(--am-soft); color: var(--amber);
          border-color: var(--am-mid);
        }
        .pl-page .pl-content-body {
          padding: 20px;
        }
      `}</style>

            {dialogueType === "coinplan" && <CoinPlanDialog />}
            {dialogueType === "vipPlan" && <VipPlanDialog />}

            <div className={`pl-page ${dialogueType === "doctor" ? "d-none" : ""}`}>

                {/* ── Header ── */}
                <div className="pl-header">
                    <div className="pl-header-left">
                        <div className="pl-header-pill" />
                        <div>
                            <h1 className="pl-title">Plans</h1>
                            <p className="pl-sub">Manage Coin Plans and VIP Plans</p>
                        </div>
                    </div>

                    {/* Add button changes based on active tab */}
                    {type === "coinPlan" ? (
                        <button
                            className="pl-add-btn"
                            onClick={() => dispatch(openDialog({ type: "coinplan" }))}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add Coin Plan
                        </button>
                    ) : (
                        <button
                            className="pl-add-btn vip-btn"
                            onClick={() => dispatch(openDialog({ type: "vipPlan" }))}
                        >
                            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                                stroke="white" strokeWidth="2.5" strokeLinecap="round">
                                <line x1="12" y1="5" x2="12" y2="19" />
                                <line x1="5" y1="12" x2="19" y2="12" />
                            </svg>
                            Add VIP Plan
                        </button>
                    )}
                </div>

                {/* ── Tab switcher ── */}
                <div className="pl-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            className={`pl-tab ${type === tab.key ? "pl-tab-active" : ""} ${type === tab.key && tab.key === "vipPlan" ? "vip-active" : ""
                                }`}
                            onClick={() => setType(tab.key)}
                        >
                            {tab.icon}
                            <span className="pl-tab-label">{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* ── Content card ── */}
                <div className="pl-content">
                    <div className={`pl-content-head ${type === "vipPlan" ? "vip-head" : ""}`}>
                        <span className="pl-content-title">
                            {activeTab?.icon}
                            {activeTab?.label ?? "Plans"}
                        </span>
                        <span className={`pl-content-badge ${type === "vipPlan" ? "vip-badge" : ""}`}>
                            {type === "coinPlan" ? (
                                <>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <circle cx="12" cy="12" r="10" />
                                        <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9m0 0h4.5a1.5 1.5 0 0 1 0 3H9" />
                                    </svg>
                                    Coin Plans
                                </>
                            ) : (
                                <>
                                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                                    </svg>
                                    VIP Plans
                                </>
                            )}
                        </span>
                    </div>

                    <div className="pl-content-body">
                        {type === "coinPlan" && <CoinPlan type={type} />}
                        {type === "vipPlan" && <VipPlan type={type} />}
                    </div>
                </div>

            </div>
        </>
    );
};

Plan.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};

export default Plan;