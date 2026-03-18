import RootLayout from "@/component/layout/Layout";
import Analytics from "@/extra/Analytic";
import {
  getChartData,
  getChartDataOfHost,
  getDashboardData,
} from "@/store/dashboardSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { isLoading } from "@/utils/allSelector";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import GetNewUser from "./GetNewUser";
import TopPerformingHost from "./TopPerformingHost";
import { userTypes } from "@/utils/extra";
import TopPerformingAgency from "./TopPerformingAgency";
import TopSpenders from "./TopSpenders";
import total_user from "@/assets/images/total_user.svg";
import total_block_user from "@/assets/images/total_block_user.svg";
import total_vip_user from "@/assets/images/total_vip_user.svg";
import total_agency from "@/assets/images/total_agency.png";
import total_pending_host from "@/assets/images/total_pending_host.png";
import total_host from "@/assets/images/total_host.svg";
import total_impression from "@/assets/images/total_impression.svg";
import total_current_live_host from "@/assets/images/total_live_host.svg";
import { routerChange } from "@/utils/Common";

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const [startDate, setStartDate] = useState("All");
  const [endDate,   setEndDate]   = useState("All");
  const loader  = useSelector<any>(isLoading);
  const { loading } = useSelector((state: RootStore) => state.dashboard);
  const [type, setType] = useState<string | null>(null);
  const router = useRouter();
  const dashboard: any = useSelector((state: RootStore) => state.dashboard);

  useEffect(() => {
    const storedType = localStorage.getItem("dashType") || "Recent Users";
    if (storedType) setType(storedType);
  }, []);

  useEffect(() => {
    if (type) {
      localStorage.setItem("dashType", type);
      routerChange("/dashboard", "dashType", router);
    }
  }, [type, router]);

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    if (!token) return;
    // ✅ Fix: type field added as required by AllUsersPayload
    dispatch(getDashboardData({ startDate, endDate, type: 0 } as any));
    dispatch(getChartData({ startDate, endDate, type: 0 } as any));
    dispatch(getChartDataOfHost({ startDate, endDate, type: 0 } as any));
  }, [dispatch, startDate, endDate]);

  const dashboardCards = [
    { title: "Total Users",           icon: total_user.src,              amount: dashboard?.dashboardData?.totalUsers,           link: "/User/User",   color: "#6366f1", soft: "rgba(99,102,241,0.10)"  },
    { title: "Blocked Users",         icon: total_block_user.src,        amount: dashboard?.dashboardData?.totalBlockedUsers,     link: "/User/User",   color: "#f43f5e", soft: "rgba(244,63,94,0.09)"   },
    { title: "VIP Users",             icon: total_vip_user.src,          amount: dashboard?.dashboardData?.totalVipUsers,         link: "/User/User",   color: "#f59e0b", soft: "rgba(245,158,11,0.10)"  },
    { title: "Total Agency",          icon: total_agency.src,            amount: dashboard?.dashboardData?.totalAgency,           link: "/Agency",      color: "#a855f7", soft: "rgba(168,85,247,0.10)"  },
    { title: "Pending Host Requests", icon: total_pending_host.src,      amount: dashboard?.dashboardData?.totalPendingHosts,     link: "/HostRequest", color: "#f97316", soft: "rgba(249,115,22,0.09)"  },
    { title: "Total Hosts",           icon: total_host.src,              amount: dashboard?.dashboardData?.totalHosts,            link: "/Host",        color: "#10b981", soft: "rgba(16,185,129,0.10)"  },
    { title: "Live Hosts Now",        icon: total_current_live_host.src, amount: dashboard?.dashboardData?.totalCurrentLiveHosts, link: "/Host",        color: "#06b6d4", soft: "rgba(6,182,212,0.10)"   },
    { title: "Total Impressions",     icon: total_impression.src,        amount: dashboard?.dashboardData?.totalImpressions,      link: "/Impression",  color: "#8b5cf6", soft: "rgba(139,92,246,0.10)"  },
  ];

  const now = new Date();
  const greeting = now.getHours() < 12 ? "Good Morning" : now.getHours() < 17 ? "Good Afternoon" : "Good Evening";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .db-page {
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

        /* ── Hero bar ── */
        .db-page .db-hero {
          display: flex; align-items: center; justify-content: space-between;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 20px 24px;
          margin-bottom: 22px;
          box-shadow: 0 2px 16px rgba(99,102,241,0.06);
          position: relative; overflow: hidden;
        }
        .db-page .db-hero::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 5px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          border-radius: 0 3px 3px 0;
        }
        .db-page .db-hero::after {
          content: '';
          position: absolute; right: -60px; top: -60px;
          width: 200px; height: 200px; border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.07), transparent 70%);
          pointer-events: none;
        }
        .db-page .db-hero-left { padding-left: 12px; }
        .db-page .db-greeting {
          font-size: 12px; font-weight: 600; letter-spacing: .8px;
          text-transform: uppercase; color: var(--accent); margin-bottom: 3px;
        }
        .db-page .db-welcome {
          font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700;
          color: var(--txt-dark); line-height: 1.2; margin: 0;
        }
        .db-page .db-date { font-size: 12px; color: var(--txt-dim); margin-top: 3px; }

        /* ── Section header ── */
        .db-page .db-sh {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 16px; margin-top: 6px;
        }
        .db-page .db-sh-left { display: flex; align-items: center; gap: 10px; }
        .db-page .db-sh-pill {
          width: 4px; height: 22px; border-radius: 4px; flex-shrink: 0;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
        }
        .db-page .db-sh-title {
          font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700;
          color: var(--txt-dark); margin: 0;
        }

        /* ── Stat cards grid ── */
        .db-page .db-cards {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 22px;
        }
        @media(max-width:1100px){ .db-page .db-cards { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:600px) { .db-page .db-cards { grid-template-columns: 1fr; } }

        .db-page .db-card {
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 16px;
          padding: 18px 16px;
          display: flex; align-items: center; gap: 14px;
          cursor: pointer;
          transition: box-shadow .18s, transform .15s, border-color .15s;
          position: relative; overflow: hidden;
        }
        .db-page .db-card:hover { transform: translateY(-3px); }
        .db-page .db-card-icon {
          width: 48px; height: 48px; border-radius: 13px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .db-page .db-card-label {
          font-size: 11.5px; font-weight: 500; color: var(--txt-dim);
          margin: 0 0 3px; line-height: 1.3;
        }
        .db-page .db-card-val {
          font-family: 'Rajdhani', sans-serif; font-size: 26px; font-weight: 700;
          color: var(--txt-dark); line-height: 1; margin: 0;
        }
        .db-page .db-card-arrow {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          opacity: 0; transition: opacity .15s, right .15s; color: var(--txt-dim);
        }
        .db-page .db-card:hover .db-card-arrow { opacity: 1; right: 12px; }

        /* ── Chart card ── */
        .db-page .db-chart-card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 18px; box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden; margin-bottom: 22px;
        }
        .db-page .db-chart-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 22px; border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
        }
        .db-page .db-chart-title {
          font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: var(--txt-dark);
        }
        .db-page .db-chart-legend {
          display: flex; gap: 12px; align-items: center;
        }
        .db-page .db-chart-legend-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; font-weight: 600;
        }
        .db-page .db-chart-legend-dot {
          width: 10px; height: 10px; border-radius: 3px; display: inline-block;
        }
        .db-page .db-chart-body { padding: 4px 10px 10px; }

        /* ── Tab section ── */
        .db-page .db-tab-card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 18px; box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }
        .db-page .db-tab-head {
          padding: 16px 20px; border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
        }
        .db-page .db-tabs { display: flex; flex-wrap: wrap; gap: 6px; }
        .db-page .db-tab {
          padding: 7px 16px; border-radius: 20px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          border: 1.5px solid var(--border); background: var(--bg); color: var(--txt);
          cursor: pointer; transition: all .15s;
        }
        .db-page .db-tab:hover { border-color: var(--a-mid); color: var(--accent); background: var(--a-soft); }
        .db-page .db-tab.active {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; border-color: transparent; box-shadow: 0 3px 10px var(--a-glow);
        }
        .db-page .db-tab-body { padding: 16px 20px; }

        /* skeleton */
        .db-page .sk-card {
          background: var(--white); border: 1.5px solid var(--border);
          border-radius: 16px; padding: 18px 16px; display: flex; align-items: center; gap: 14px;
        }
      `}</style>

      <div className="db-page">

        {/* ── Hero ── */}
        <div className="db-hero">
          <div className="db-hero-left">
            <p className="db-greeting">{greeting} 👋</p>
            <h1 className="db-welcome">Welcome back, Admin!</h1>
            <p className="db-date">
              {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            direction="end"
          />
        </div>

        {/* ── Overview section header ── */}
        <div className="db-sh">
          <div className="db-sh-left">
            <div className="db-sh-pill" />
            <h2 className="db-sh-title">Overview</h2>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="db-cards">
          {dashboardCards.map((card, i) =>
            loading.dashboardData ? (
              <div className="sk-card" key={i}>
                <SkeletonTheme baseColor="#e8eaf2" highlightColor="#f4f5fb">
                  <Skeleton width={48} height={48} style={{ borderRadius: 13, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <Skeleton width="60%" height={11} style={{ marginBottom: 6 }} />
                    <Skeleton width="40%" height={22} />
                  </div>
                </SkeletonTheme>
              </div>
            ) : (
              <div
                key={i}
                className="db-card"
                onClick={() => router.push({ pathname: card.link })}
                style={{ boxShadow: `0 2px 0 0 ${card.color}20` }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow   = `0 6px 22px ${card.color}28`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${card.color}40`;
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow   = `0 2px 0 0 ${card.color}20`;
                  (e.currentTarget as HTMLElement).style.borderColor = "#e8eaf2";
                }}
              >
                <div className="db-card-icon" style={{ background: card.soft }}>
                  <img
                    src={card.icon} width={24} height={24} alt={card.title}
                    style={{ opacity: 0.9 }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <p className="db-card-label">{card.title}</p>
                  <p className="db-card-val">{(card.amount ?? 0).toLocaleString()}</p>
                </div>
                <div className="db-card-arrow">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </div>
              </div>
            )
          )}
        </div>

        {/* ── Data Analysis section header ── */}
        <div className="db-sh">
          <div className="db-sh-left">
            <div className="db-sh-pill" />
            <h2 className="db-sh-title">Data Analysis</h2>
          </div>
        </div>

        {/* ── Chart card ── */}
        <div className="db-chart-card">
          <div className="db-chart-head">
            <span className="db-chart-title">User & Host Growth</span>
            <div className="db-chart-legend">
              <span className="db-chart-legend-item" style={{ color: "#6366f1" }}>
                <span className="db-chart-legend-dot" style={{ background: "#6366f1" }} />
                Total Users
              </span>
              <span className="db-chart-legend-item" style={{ color: "#1e2235" }}>
                <span className="db-chart-legend-dot" style={{ background: "#1e2235" }} />
                Total Hosts
              </span>
            </div>
          </div>
          <div className="db-chart-body">
            {loading.chartDataHost ? (
              <SkeletonTheme baseColor="#e8eaf2" highlightColor="#f4f5fb">
                <div style={{ padding: "20px 10px" }}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Skeleton key={i} height={44} style={{ marginBottom: 8, borderRadius: 8 }} />
                  ))}
                </div>
              </SkeletonTheme>
            ) : (
              <ApexChart startDate={startDate} endDate={endDate} />
            )}
          </div>
        </div>

        {/* ── All Data Analysis section header ── */}
        <div className="db-sh">
          <div className="db-sh-left">
            <div className="db-sh-pill" />
            <h2 className="db-sh-title">All Data Analysis</h2>
          </div>
        </div>

        {/* ── Tab card ── */}
        <div className={`db-tab-card ${dialogueType === "doctor" ? "d-none" : ""}`}>
          <div className="db-tab-head">
            <div className="db-tabs">
              {userTypes.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className={`db-tab ${type === item.value ? "active" : ""}`}
                  onClick={() => setType(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
          <div className="db-tab-body">
            {type === "Recent Users"         && <GetNewUser          startDate={startDate} endDate={endDate} type={type} />}
            {type === "top_perfoming_host"   && <TopPerformingHost   startDate={startDate} endDate={endDate} type={type} />}
            {type === "top_perfoming_agency" && <TopPerformingAgency startDate={startDate} endDate={endDate} type={type} />}
            {type === "top_spenders"         && <TopSpenders         startDate={startDate} endDate={endDate} type={type} />}
          </div>
        </div>

      </div>
    </>
  );
};

Dashboard.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Dashboard;

/* ─────────────────────────────── ApexChart ─────────────────────────────── */
const ChartChart = dynamic(() => import("react-apexcharts"), { ssr: false });

const ApexChart = ({ startDate, endDate }: any) => {
  const { chartData, chartDataHost } = useSelector((state: RootStore) => state.dashboard);

  const allDatesSet = new Set([
    ...chartData.map((item: any) => item._id),
    ...chartDataHost.map((item: any) => item._id),
  ]);
  const label: any[] = Array.from(allDatesSet).sort();

  const dataAmount = label.map((d) => {
    const f: any = chartData.find((i: any) => i._id === d);
    return f ? f.count : 0;
  });
  const dataCount = label.map((d) => {
    const f: any = chartDataHost.find((i: any) => i._id === d);
    return f ? f.count : 0;
  });

  const series = [
    { name: "Total User", data: dataAmount },
    { name: "Total Host", data: dataCount },
  ];

  const options: any = {
    chart: {
      type: "area", height: 400, background: "#fff",
      toolbar: { show: false },
      fontFamily: "'Outfit', sans-serif",
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1, inverseColors: false,
        opacityFrom: 0.35, opacityTo: 0.02, stops: [10, 100],
      },
    },
    colors: ["#6366f1", "#1e2235"],
    grid: {
      borderColor: "#e8eaf2", strokeDashArray: 4,
      padding: { left: 16, right: 16 },
    },
    xaxis: {
      categories: label,
      labels: { style: { fontSize: "12px", colors: "#a0a8c0", fontFamily: "'Outfit', sans-serif" } },
      axisBorder: { show: false }, axisTicks: { show: false },
    },
    yaxis: {
      labels: { style: { fontSize: "12px", colors: "#a0a8c0", fontFamily: "'Outfit', sans-serif" } },
    },
    tooltip: {
      shared: true, theme: "light",
      style: { fontSize: "13px", fontFamily: "'Outfit', sans-serif" },
    },
    legend: { show: false },
    title: { text: "" },
  };

  return (
    <div id="chart">
      <ChartChart options={options} series={series} type="area" height={380} />
    </div>
  );
};