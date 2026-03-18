import RootLayout from "@/component/layout/Layout";
import Analytics from "@/extra/Analytic";
import Title from "@/extra/Title";
import {
  getagencyEarnings,
  getDashboardData,
  getHostEarnings,
  getNewHost,
  getResellerAnalytics,
} from "@/store/dashboardSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { isLoading } from "@/utils/allSelector";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import TopPerformingHost from "./TopPerformingHost";
import { userTypes } from "@/utils/extra";
import { routerChange } from "@/utils/Common";
import GetNewHost from "./GetNewHost";
import totalActiveHost from "@/assets/images/totalactiveHost.svg";
import totalLiveHost from "@/assets/images/totalLiveHost.svg";
import totalSuspendedHost from "@/assets/images/totalSuspendedHost.svg";
import totalHost from "@/assets/images/totalHost.svg";
import totalPayoutPending from "@/assets/images/totalPayoutPending.svg";
import totalPayoutCompleted from "@/assets/images/totalPayoutCompleted.svg";
import totalAgencyEarning from "@/assets/images/totalImpression.png";
import totalAgencyUnderHost from "@/assets/images/totalAgencyUnderHost.svg";

interface topProviderData {
  profileImage?: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  doctorEarning?: number;
  appointment?: number;
  maskType?: string;
  earning?: number;
  avgRating?: number;
  uniqueId?: string;
  createdAt?: any;
  completedBookingCount: any;
}

const dashStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  :root {
    --d-accent:   #6366f1;
    --d-purple:   #a855f7;
    --d-soft:     rgba(99,102,241,0.08);
    --d-border:   #e8eaf2;
    --d-bg:       #f4f5fb;
    --d-white:    #ffffff;
    --d-text:     #64748b;
    --d-dark:     #1e2235;
    --d-dim:      #a0a8c0;
    --d-green:    #10b981;
    --d-orange:   #f59e0b;
    --d-red:      #f43f5e;
  }

  .dash-root {
    font-family: 'Outfit', sans-serif;
    background: var(--d-bg);
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  /* ── Welcome banner ── */
  .dash-banner {
    background: linear-gradient(135deg, #6366f1 0%, #a855f7 60%, #ec4899 100%);
    border-radius: 18px;
    padding: 28px 32px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 28px;
    position: relative;
    overflow: hidden;
    box-shadow: 0 8px 32px rgba(99,102,241,0.28);
  }
  .dash-banner::before {
    content: '';
    position: absolute;
    top: -40px; right: -40px;
    width: 180px; height: 180px;
    border-radius: 50%;
    background: rgba(255,255,255,0.07);
    pointer-events: none;
  }
  .dash-banner::after {
    content: '';
    position: absolute;
    bottom: -30px; left: 120px;
    width: 120px; height: 120px;
    border-radius: 50%;
    background: rgba(255,255,255,0.05);
    pointer-events: none;
  }
  .dash-banner-left h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 26px;
    font-weight: 900;
    color: #fff;
    margin: 0 0 6px;
  }
  .dash-banner-left p {
    font-size: 13.5px;
    color: rgba(255,255,255,0.75);
    margin: 0;
  }
  .dash-banner-right {
    position: relative; z-index: 1;
  }

  /* ── Section heading ── */
  .dash-section-head {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 16px;
  }
  .dash-section-head h4 {
    font-family: 'Nunito', sans-serif;
    font-size: 18px;
    font-weight: 800;
    color: var(--d-dark);
    margin: 0;
  }
  .dash-section-head-line {
    flex: 1;
    height: 1px;
    background: var(--d-border);
  }

  /* ── Stats grid ── */
  .dash-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  @media (max-width: 1200px) { .dash-grid { grid-template-columns: repeat(3,1fr); } }
  @media (max-width: 900px)  { .dash-grid { grid-template-columns: repeat(2,1fr); } }
  @media (max-width: 540px)  { .dash-grid { grid-template-columns: 1fr; } }

  /* ── Stat card ── */
  .dash-card {
    background: var(--d-white);
    border: 1px solid var(--d-border);
    border-radius: 16px;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    transition: transform .18s, box-shadow .18s, border-color .18s;
    animation: cardIn .4s ease both;
  }
  .dash-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 28px rgba(99,102,241,0.13);
    border-color: rgba(99,102,241,0.25);
  }
  .dash-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0;
    height: 3px;
    background: linear-gradient(90deg, var(--d-accent), var(--d-purple));
    opacity: 0;
    transition: opacity .18s;
  }
  .dash-card:hover::before { opacity: 1; }

  @keyframes cardIn {
    from { opacity: 0; transform: translateY(12px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .dash-card:nth-child(1) { animation-delay: .04s; }
  .dash-card:nth-child(2) { animation-delay: .08s; }
  .dash-card:nth-child(3) { animation-delay: .12s; }
  .dash-card:nth-child(4) { animation-delay: .16s; }
  .dash-card:nth-child(5) { animation-delay: .20s; }
  .dash-card:nth-child(6) { animation-delay: .24s; }
  .dash-card:nth-child(7) { animation-delay: .28s; }
  .dash-card:nth-child(8) { animation-delay: .32s; }

  .dash-card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .dash-card-icon {
    width: 48px; height: 48px;
    border-radius: 13px;
    background: linear-gradient(135deg, rgba(99,102,241,0.10), rgba(168,85,247,0.10));
    border: 1px solid rgba(99,102,241,0.14);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .dash-card-icon img { width: 28px; height: 28px; object-fit: contain; }

  .dash-card-badge {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: .8px;
    text-transform: uppercase;
    padding: 3px 9px;
    border-radius: 20px;
    background: rgba(16,185,129,0.10);
    color: var(--d-green);
    border: 1px solid rgba(16,185,129,0.18);
  }

  .dash-card-amount {
    font-family: 'Nunito', sans-serif;
    font-size: 30px;
    font-weight: 900;
    color: var(--d-dark);
    line-height: 1;
    letter-spacing: -0.5px;
  }
  .dash-card-title {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--d-dim);
    text-transform: uppercase;
    letter-spacing: .7px;
    margin-top: 2px;
  }

  /* skeleton card */
  .dash-card-skeleton {
    background: var(--d-white);
    border: 1px solid var(--d-border);
    border-radius: 16px;
    padding: 20px;
    display: flex; flex-direction: column; gap: 14px;
  }

  /* ── Chart box ── */
  .dash-chart-box {
    background: var(--d-white);
    border: 1px solid var(--d-border);
    border-radius: 18px;
    padding: 24px;
    margin-bottom: 28px;
    box-shadow: 0 2px 12px rgba(99,102,241,0.05);
  }

  /* ── Tab group ── */
  .dash-tabs {
    display: flex;
    gap: 8px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .dash-tab {
    padding: 8px 18px;
    border-radius: 10px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1.5px solid var(--d-border);
    background: var(--d-white);
    color: var(--d-text);
    transition: all .15s;
  }
  .dash-tab.active {
    background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08));
    border-color: rgba(99,102,241,0.30);
    color: var(--d-accent);
    box-shadow: 0 2px 10px rgba(99,102,241,0.10);
  }
  .dash-tab:hover:not(.active) {
    background: var(--d-soft);
    border-color: rgba(99,102,241,0.15);
    color: var(--d-accent);
  }

  /* ── Reseller cards ── */
  .dash-reseller-grid {
    display: grid;
    grid-template-columns: repeat(3,1fr);
    gap: 16px;
    margin-bottom: 28px;
  }
  @media (max-width: 768px) { .dash-reseller-grid { grid-template-columns: 1fr; } }
`;

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { tab } = router.query;

  const role =
    typeof window !== "undefined"
      ? sessionStorage.getItem("currentRole")
      : null;

  const { dashboardData, resellerAnalyticsData }: any = useSelector((state: RootStore) => state.dashboard);
  const { reseller }: any = useSelector((state: RootStore) => state.reseller);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate]     = useState("All");
  const loader = useSelector<any>(isLoading);
  const [type, setType] = useState<string | null>(null);

  const resellerCards = [
    { title: "Wallet Balance",        amount: `₹${reseller?.coin || 0}`, icon: totalActiveHost.src, badge: "Live" },
    { title: "Total Users Recharged", amount: resellerAnalyticsData?.reduce((acc: any, curr: any) => acc + curr.count, 0) || "0",  icon: totalHost.src,       badge: "Total" },
    { title: "Total Coins Recharged", amount: resellerAnalyticsData?.reduce((acc: any, curr: any) => acc + curr.totalAmount, 0) || "0",  icon: totalPayoutCompleted.src, badge: "Active" },
  ];

  const agencyCards = [
    { title: "Total Active Host",          amount: dashboardData?.activeHosts?.toFixed(),                        icon: totalActiveHost.src,      path: "/Host" },
    { title: "Total Live Host",            amount: dashboardData?.hostsLiveNow?.toFixed(),                       icon: totalLiveHost.src,         path: "/LiveHost" },
    { title: "Total Suspended Host",       amount: dashboardData?.suspendedHosts?.toFixed(),                     icon: totalSuspendedHost.src,    path: "/Host" },
    { title: "Total Host",                 amount: dashboardData?.totalHosts?.toFixed(),                         icon: totalHost.src,             path: "/Host" },
    { title: "Total Payout Pending",       amount: dashboardData?.totalPayoutPending?.toFixed(),                 icon: totalPayoutPending.src,    path: null },
    { title: "Total Payout Completed",     amount: dashboardData?.totalPayoutCompleted?.toFixed(),               icon: totalPayoutCompleted.src,  path: null },
    { title: "Total Agency Earnings",      amount: dashboardData?.totalAgencyEarnings?.toFixed(2),               icon: totalAgencyEarning.src,    path: "/AgencyEarningHistory" },
    { title: "Agency Under Host Earning",  amount: dashboardData?.totalAgencyUnderHostsEarning?.toFixed(2),      icon: totalAgencyUnderHost.src,  path: "/Host" },
  ];

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedType = localStorage.getItem("dashType") || "Recent Host";
      setType(storedType);
    }
  }, []);

  useEffect(() => {
    if (type) localStorage.setItem("dashType", type);
  }, [type]);

  useEffect(() => { routerChange("/dashboard", "dashType", router); }, []);

  useEffect(() => {
    const payload: any = { startDate, endDate };
    if (role !== "reseller") {
      dispatch(getDashboardData(payload));
      dispatch(getNewHost(payload));
    }
  }, [dispatch, startDate, endDate, role]);

  useEffect(() => {
    if (role !== "reseller") {
      dispatch(getagencyEarnings({ startDate, endDate, type: "agencyEarning" } as any));
      dispatch(getHostEarnings({ startDate, endDate, type: "hostEarning" } as any));
    } else {
      dispatch(getResellerAnalytics({ startDate, endDate }));
    }
  }, [dispatch, startDate, endDate, role]);

  return (
    <>
      <style>{dashStyle}</style>

      <div className="dash-root">

        {role === "reseller" ? (
          <>
            {/* ── Reseller Banner ── */}
            <div className="dash-banner">
              <div className="dash-banner-left">
                <h2>Welcome back, Reseller! 👋</h2>
                <p>Manage your operations and track your performance metrics.</p>
              </div>
              <div className="dash-banner-right">
                <Analytics
                  analyticsStartDate={startDate}
                  analyticsStartEnd={endDate}
                  analyticsStartDateSet={setStartDate}
                  analyticsStartEndSet={setEndDate}
                  direction="end"
                />
              </div>
            </div>

            <div className="dash-section-head">
              <h4>Overview</h4>
              <div className="dash-section-head-line" />
            </div>

            <div className="dash-reseller-grid">
              {resellerCards.map((card, i) => (
                <div className="dash-card" key={i} style={{ animationDelay: `${i * 0.06}s` }}>
                  <div className="dash-card-top">
                    <div className="dash-card-icon">
                      <img src={card.icon} alt={card.title} />
                    </div>
                    <span className="dash-card-badge">{card.badge}</span>
                  </div>
                  <div>
                    <div className="dash-card-amount">{card.amount}</div>
                    <div className="dash-card-title">{card.title}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* ── Reseller Chart ── */}
            <div className="dash-section-head">
              <h4>Recharge Analytics</h4>
              <div className="dash-section-head-line" />
            </div>

            <div className="dash-chart-box">
              {loader ? (
                <SkeletonTheme baseColor="#e8eaf2" highlightColor="#f4f5fb">
                  <Skeleton height={360} borderRadius="12px" />
                </SkeletonTheme>
              ) : (
                <ApexChart startDate={startDate} endDate={endDate} isReseller={true} />
              )}
            </div>
          </>
        ) : (
          <>
            {/* ── Agency Banner ── */}
            <div className="dash-banner">
              <div className="dash-banner-left">
                <h2>Welcome back, Agency! 👋</h2>
                <p>Here's what's happening with your hosts today.</p>
              </div>
              <div className="dash-banner-right">
                <Analytics
                  analyticsStartDate={startDate}
                  analyticsStartEnd={endDate}
                  analyticsStartDateSet={setStartDate}
                  analyticsStartEndSet={setEndDate}
                  direction="end"
                />
              </div>
            </div>

            {/* ── Stats Cards ── */}
            <div className="dash-section-head">
              <h4>Key Metrics</h4>
              <div className="dash-section-head-line" />
            </div>

            <div className="dash-grid">
              {agencyCards.map((card, i) =>
                loader ? (
                  <div className="dash-card-skeleton" key={i}>
                    <SkeletonTheme baseColor="#e8eaf2" highlightColor="#f4f5fb">
                      <Skeleton height={48} width={48} borderRadius="13px" />
                      <Skeleton height={32} width="60%" />
                      <Skeleton height={12} width="80%" />
                    </SkeletonTheme>
                  </div>
                ) : (
                  <div
                    className="dash-card"
                    key={i}
                    onClick={() => card.path && router.push({ pathname: card.path })}
                    style={{ animationDelay: `${i * 0.05}s` }}
                  >
                    <div className="dash-card-top">
                      <div className="dash-card-icon">
                        <img src={card.icon} alt={card.title} />
                      </div>
                      <span className="dash-card-badge">Live</span>
                    </div>
                    <div>
                      <div className="dash-card-amount">{card.amount ?? "—"}</div>
                      <div className="dash-card-title">{card.title}</div>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* ── Chart ── */}
            <div className="dash-section-head">
              <h4>Data Analysis</h4>
              <div className="dash-section-head-line" />
            </div>

            <div className="dash-chart-box">
              {loader ? (
                <SkeletonTheme baseColor="#e8eaf2" highlightColor="#f4f5fb">
                  <Skeleton height={360} borderRadius="12px" />
                </SkeletonTheme>
              ) : (
                <ApexChart startDate={startDate} endDate={endDate} />
              )}
            </div>

            {/* ── Table tabs ── */}
            <div className="dash-section-head">
              <h4>All Data Analysis</h4>
              <div className="dash-section-head-line" />
            </div>

            <div className="dash-tabs">
              {userTypes.map((item, index) => (
                <button
                  key={index}
                  className={`dash-tab${type === item.value ? " active" : ""}`}
                  onClick={() => setType(item.value)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {type === "Recent Host" && (
              <GetNewHost startDate={startDate} endDate={endDate} />
            )}
            {type === "top_perfoming_host" && (
              <TopPerformingHost startDate={startDate} endDate={endDate} />
            )}
          </>
        )}
      </div>
    </>
  );
};

Dashboard.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Dashboard;

/* ─────────────────────────────────────────
   ApexChart — same logic, styled wrapper
───────────────────────────────────────── */
const ApexChart = ({ startDate, endDate, isReseller = false }: any) => {
  const dispatch = useAppDispatch();
  const ChartChart = dynamic(() => import("react-apexcharts"), { ssr: false });
  const { agencyEarningData, hostEarningData, resellerAnalyticsData } = useSelector(
    (state: RootStore) => state.dashboard,
  );

  const allDatesSet = isReseller 
    ? new Set(resellerAnalyticsData.map((item: any) => item._id))
    : new Set([
        ...agencyEarningData.map((item: any) => item._id),
        ...hostEarningData.map((item: any) => item._id),
      ]);
  const label: any = Array.from(allDatesSet).sort();

  const dataAmount: number[] = label.map((date: any) => {
    const found: any = agencyEarningData.find((item: any) => item._id === date);
    return found ? parseFloat(found.totalAgencyEarnings?.toFixed(2)) : 0;
  });
  const dataCount: number[] = label.map((date: any) => {
    const found: any = hostEarningData.find((item: any) => item._id === date);
    return found ? parseFloat(found.totalHostEarnings?.toFixed(2)) : 0;
  });

  const resellerData: number[] = label.map((date: any) => {
    const found: any = resellerAnalyticsData.find((item: any) => item._id === date);
    return found ? found.totalAmount : 0;
  });

  const series: { name: string; data: number[] }[] = isReseller 
    ? [ { name: "Coins Recharged", data: resellerData } ]
    : [
        { name: "Agency Earning", data: dataAmount },
        { name: "Host Earning",   data: dataCount  },
      ];

  const options: any = {
    chart: {
      type: "area", height: 400, background: "transparent",
      toolbar: { show: false },
      fontFamily: "'Outfit', sans-serif",
    },
    dataLabels: { enabled: false },
    stroke: { curve: "smooth", width: 2.5 },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1, inverseColors: false,
        opacityFrom: 0.35, opacityTo: 0.02,
        stops: [20, 100],
      },
    },
    colors: ["#6366f1", "#a855f7"],
    grid: {
      borderColor: "#e8eaf2",
      padding: { left: 16, right: 16 },
    },
    xaxis: {
      categories: label,
      labels: {
        style: { fontSize: "12px", colors: "#a0a8c0", fontFamily: "'Outfit', sans-serif" },
      },
      axisBorder: { show: false },
      axisTicks:  { show: false },
    },
    yaxis: { show: false },
    tooltip: { shared: true, theme: "light" },
    legend: {
      position: "top", horizontalAlign: "right",
      fontFamily: "'Outfit', sans-serif", fontSize: "13px",
      offsetY: 4,
    },
    title: {
      text: isReseller ? "Recharge Volume" : "Earnings Overview",
      style: {
        color: "#1e2235",
        fontSize: "15px",
        fontFamily: "'Nunito', sans-serif",
        fontWeight: 800,
      },
      align: "left",
      offsetX: 4,
    },
  };

  return (
    <div id="chart">
      <ChartChart options={options} series={series} type="area" height={380} />
    </div>
  );
};