import Navigator from "@/extra/Navigator";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useRouter as nextUseRouter } from "next/router";
import $ from "jquery";
import CommonDialog from "@/utils/CommonDialog";
import { toast } from "react-toastify";
import Agency from "@/assets/images/Agency";
import Host from "@/assets/images/host";
import HostRequest from "@/assets/images/hostRequest";
import Impression from "@/assets/images/impression";
import GiftCategory from "@/assets/images/giftCategory";
import Gift from "@/assets/images/gift";
import DailyCheckInReward from "@/assets/images/dailyCheckInReward";
import Plan from "@/assets/images/plan";
import Vipplan_benefits from "@/assets/images/vipplan_benefits";
import WithdrawRequest from "@/assets/images/withdrawRequest";
import User from "@/assets/images/user";
import { useSelector } from "react-redux";
import { RootStore } from "@/store/store";

// ── Logo image ──
import LogoNew from "@/assets/images/unnamed__2_..-removebg-preview.png";

const DashIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 0h16v16H0zm1 1v6.5h6.5V1zm7.5 0v6.5H15V1zM15 8.5H8.5V15H15zM7.5 15V8.5H1V15z" />
  </svg>
);
const GearIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 4.754a3.246 3.246 0 1 0 0 6.492A3.246 3.246 0 0 0 8 4.754M5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0" />
    <path d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52z" />
  </svg>
);
const PersonIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
  </svg>
);
const StoreIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M2.97 1.35A1 1 0 0 1 3.73 1h8.54a1 1 0 0 1 .76.35l2.609 3.044A1.5 1.5 0 0 1 16 5.37v.255a2.375 2.375 0 0 1-4.25 1.458A2.371 2.371 0 0 1 9.875 8 2.37 2.37 0 0 1 8 7.083 2.37 2.37 0 0 1 6.125 8a2.37 2.37 0 0 1-1.875-.917A2.375 2.375 0 0 1 0 5.625V5.37a1.5 1.5 0 0 1 .361-.976zm1.78 4.275a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0 1.375 1.375 0 1 0 2.75 0V5.37a.5.5 0 0 0-.12-.325L12.27 2H3.73L1.12 5.045A.5.5 0 0 0 1 5.37v.255a1.375 1.375 0 0 0 2.75 0 .5.5 0 0 1 1 0M1.5 8.5A.5.5 0 0 1 2 9v6h12V9a.5.5 0 0 1 1 0v6h.5a.5.5 0 0 1 0 1H.5a.5.5 0 0 1 0-1H1V9a.5.5 0 0 1 .5-.5" />
  </svg>
);
const WheelIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1m0 1a6 6 0 0 1 5.657 4H9.5a.5.5 0 0 0-.5.5v2.23l2.165 2.165a.5.5 0 1 0 .707-.707L10 8.207V6.5h3.93A6 6 0 1 1 8 2" />
    <path d="M8 4.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5" />
  </svg>
);

const Sidebar = () => {
  const router = useRouter();
  const nextRouter = nextUseRouter();
  const [showDialog, setShowDialog] = useState(false);

  const { currentRole: roleFromStore } = useSelector((state: RootStore) => state?.admin);
  const role =
    roleFromStore ??
    (typeof window !== "undefined" ? sessionStorage.getItem("currentRole") : null);

  const handleLogout = () => setShowDialog(true);
  const handleOnClick = () => window && localStorage.removeItem("dialog");

  const confirmLogout = async () => {
    ["token", "admin", "key", "isAuth", "isManager", "currentRole", "admin_"].forEach(k =>
      sessionStorage.removeItem(k)
    );
    localStorage.removeItem("persist:admin");
    sessionStorage.setItem("isAgency", "false");
    toast.success("Logout successful");
    setTimeout(() => router.push("/"), 1000);
  };

  const isAdminRoute = (p: string) =>
    ["/Agency", "/Host", "/Banner", "/HostRequest", "/Impression"].includes(p);

  useEffect(() => {
    if (role === "admin" && !isAdminRoute(nextRouter.pathname)) router.push("/Agency");
  }, [nextRouter.pathname, role]);

  const genralMenu = [
    { name: "Dashboard", path: "/dashboard", navSVG: <DashIcon /> },
    { name: "User", path: "/User/User", path4: "/User/UserInfoPage", path2: "/User/CoinPlanHistoryPage", path3: "/PurchaseCoinPlanHistory", navSVG: <User />, onClick: handleOnClick },
    { name: "Manager", path: "/User/Manager", path4: "/User/UserInfoPage", path2: "/User/CoinPlanHistoryPage", path3: "/PurchaseCoinPlanHistory", navSVG: <User />, onClick: handleOnClick },
    { name: "Admin", path: "/User/Admin", path4: "/User/UserInfoPage", path2: "/User/CoinPlanHistoryPage", path3: "/PurchaseCoinPlanHistory", navSVG: <User />, onClick: handleOnClick },
    { name: "Reseller", path: "/User/Reseller", path4: "/User/UserInfoPage", path2: "/User/CoinPlanHistoryPage", path3: "/PurchaseCoinPlanHistory", navSVG: <User />, onClick: handleOnClick },
  ];

  const managerMenu = [
    { name: "Dashboard", path: "/dashboard", navSVG: <DashIcon /> },
    { name: "Admin", path: "/User/Admin", path4: "/User/UserInfoPage", path2: "/User/CoinPlanHistoryPage", path3: "/PurchaseCoinPlanHistory", navSVG: <User />, onClick: handleOnClick },
  ];

  const hostAndAgency = [
    { name: "Agency", path: "/Agency", path2: "/Host/AgencyWiseHost", navSVG: <Agency />, onClick: handleOnClick },
    { name: "Host", path: "/Host", path2: "/Host/HostInfoPage", path3: "/Host/HostHistoryPage", navSVG: <Host />, onClick: handleOnClick },
    { name: "Host Request", path: "/HostRequest", path2: "/HostProfile", navSVG: <HostRequest /> },
    { name: "Host Tags", path: "/Impression", navSVG: <Impression />, onClick: handleOnClick },
  ];

  const giftAndRewards = [
    { name: "Gift Category", path: "/GiftCategory", navSVG: <GiftCategory />, onClick: handleOnClick },
    { name: "Gift", path: "/GiftPage", navSVG: <Gift />, onClick: handleOnClick },
    { name: "Daily CheckIn", path: "/DailyCheckInReward", navSVG: <DailyCheckInReward />, onClick: handleOnClick },
    { name: "Spin Wheel", path: "/SpinWheel", navSVG: <WheelIcon />, onClick: handleOnClick },
  ];

  const storeMenu = [
    { name: "Store", path: "/Store", onClick: handleOnClick, navSVG: <StoreIcon /> },
  ];

  const packages = [
    { name: "Plan", path: "/Plan", navSVG: <Plan />, onClick: handleOnClick },
    { name: "Vip Plan Benefits", path: "/VipPlanPrevilage", navSVG: <Vipplan_benefits />, onClick: handleOnClick },
  ];

  const finance = [
    { name: "Withdrawal", path: "/WithdrawRequest", navSVG: <WithdrawRequest />, onClick: handleOnClick },
  ];

  const setting = [
    // { name: "Setting", path: "/Setting", navSVG: <GearIcon />, onClick: handleOnClick },
    { name: "Profile", path: "/adminProfile", navSVG: <PersonIcon />, onClick: handleOnClick },
  ];

  const renderMenuItems = (items: any[]) =>
    items.map((res: any, i: number) => (
      <React.Fragment key={i}>
        <Navigator
          name={res?.name} path={res?.path}
          path2={res?.path2} path3={res?.path3} path4={res?.path4}
          navIcon={res?.navIcon} navSVG={res?.navSVG}
          onClick={res?.onClick}
        >
          {res?.subMenu && (
            <ul className="subMenu">
              <span className="subhead">{res?.name}</span>
              {res?.subMenu?.map((sub: any) => (
                <Navigator name={sub.subName} path={sub.subPath} onClick={sub.onClick} key={sub.subPath} />
              ))}
            </ul>
          )}
        </Navigator>
      </React.Fragment>
    ));

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

        .wpc-sidebar {
          --sb-bg:          #ffffff;
          --sb-page:        #f4f5fb;
          --sb-border:      #e8eaf2;
          --sb-accent:      #6366f1;
          --sb-purple:      #a855f7;
          --sb-accent-soft: rgba(99,102,241,0.08);
          --sb-text:        #64748b;
          --sb-text-bright: #1e2235;
          --sb-text-dim:    #a0a8c0;
          --sb-danger:      #f43f5e;
          --sb-dsof:        rgba(244,63,94,0.07);
          --sb-dbdr:        rgba(244,63,94,0.18);

          width: 100%;
          min-width: 0;
          height: 100vh;
          background: var(--sb-bg);
          border-right: 1px solid var(--sb-border);
          display: flex;
          flex-direction: column;
          font-family: 'Outfit', sans-serif;
          box-shadow: 2px 0 20px rgba(99,102,241,0.07);
          position: relative;
        }

        /* ══════════════════════════════
           HEADER
        ══════════════════════════════ */
        .wpc-sidebar .sb-header {
          padding: 0 16px;
          border-bottom: 1px solid var(--sb-border);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-shrink: 0;
          height: 80px;
          background: linear-gradient(135deg,
            rgba(99,102,241,0.05) 0%,
            rgba(168,85,247,0.03) 100%);
          position: relative;
          overflow: hidden;
        }

        /* subtle decorative blobs behind header */
        .wpc-sidebar .sb-header::before {
          content: '';
          position: absolute;
          top: -20px; right: -20px;
          width: 80px; height: 80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(168,85,247,0.12) 0%, transparent 70%);
          pointer-events: none;
        }

        .wpc-sidebar .sb-header::after {
          content: '';
          position: absolute;
          bottom: -10px; left: 40px;
          width: 60px; height: 60px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%);
          pointer-events: none;
        }

        /* ── Brand wrapper ── */
        .wpc-sidebar .sb-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 1;
        }

        /* ── Logo image wrapper ── */
        .wpc-sidebar .sb-logo-wrap {
          flex-shrink: 0;
          width: 52px;
          height: 52px;
          border-radius: 14px;
          background: linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(168,85,247,0.10) 100%);
          border: 1.5px solid rgba(99,102,241,0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(99,102,241,0.15), inset 0 1px 0 rgba(255,255,255,0.8);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .wpc-sidebar .sb-logo-wrap:hover {
          transform: scale(1.06) rotate(-2deg);
          box-shadow: 0 6px 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.8);
        }

        .wpc-sidebar .sb-logo-wrap img {
          height: 40px;
          width: 40px;
          object-fit: contain;
          object-position: center;
          display: block;
        }

        /* ── Text block ── */
        .wpc-sidebar .sb-brand-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 3px;
        }

        /* ── Main name: "WePlay" bold + "Chat" accent color ── */
        .wpc-sidebar .sb-brand-name {
          font-family: 'Nunito', sans-serif;
          font-size: 21px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.3px;
          white-space: nowrap;
          display: flex;
          align-items: baseline;
          gap: 3px;
        }

        .wpc-sidebar .sb-brand-name .part1 {
          color: #1e2235;
        }

        .wpc-sidebar .sb-brand-name .part2 {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        /* ── Subtitle pill ── */
        .wpc-sidebar .sb-brand-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          width: fit-content;
          background: linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(168,85,247,0.08) 100%);
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 20px;
          padding: 2px 9px 2px 6px;
        }

        .wpc-sidebar .sb-brand-pill-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          flex-shrink: 0;
          animation: pillPulse 2.2s ease-in-out infinite;
        }

        @keyframes pillPulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50%       { opacity: 0.5; transform: scale(1.5); }
        }

        .wpc-sidebar .sb-brand-pill-text {
          font-family: 'Outfit', sans-serif;
          font-size: 9.5px;
          font-weight: 700;
          letter-spacing: 1.4px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          white-space: nowrap;
        }

        /* ── Close / toggle button ── */
        .wpc-sidebar .sb-close {
          width: 32px; height: 32px; border-radius: 9px;
          background: var(--sb-page); border: 1px solid var(--sb-border);
          color: var(--sb-text-dim); display: flex; align-items: center; justify-content: center;
          cursor: pointer; font-size: 14px; flex-shrink: 0; margin-left: 6px;
          transition: background .18s, color .18s, border-color .18s;
          position: relative; z-index: 1;
        }
        .wpc-sidebar .sb-close:hover {
          background: var(--sb-accent-soft);
          border-color: var(--sb-accent);
          color: var(--sb-accent);
        }

        .wpc-sidebar .sb-scroll .sb-toggle-wrap {
          position: sticky;
          top: 0;
          z-index: 2;
          display: flex;
          justify-content: flex-end;
          padding: 8px 6px 10px;
          background: linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(255,255,255,0.80) 60%, rgba(255,255,255,0) 100%);
          backdrop-filter: blur(6px);
        }

        .wpc-sidebar .sb-scroll .sb-close {
          margin-left: auto;
        }

        .mainAdminGrid.webAdminGrid .wpc-sidebar .sb-scroll .sb-toggle-wrap {
          justify-content: center;
          padding: 8px 0 10px;
        }

        /* ══════════════════════════════
           SCROLLABLE NAV
        ══════════════════════════════ */
        .wpc-sidebar .sb-scroll {
          flex: 1; overflow-y: auto; overflow-x: hidden; padding: 10px 12px 0;
        }
        .wpc-sidebar .sb-scroll::-webkit-scrollbar { width: 3px; }
        .wpc-sidebar .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .wpc-sidebar .sb-scroll::-webkit-scrollbar-thumb {
          background: rgba(99,102,241,0.18); border-radius: 10px;
        }

        /* ── Section labels ── */
        .wpc-sidebar .sb-label {
          display: flex; align-items: center; gap: 8px;
          padding: 18px 8px 6px; list-style: none;
          font-size: 10.5px; font-weight: 700; letter-spacing: 1.3px;
          text-transform: uppercase; color: var(--sb-text-dim);
        }
        .wpc-sidebar .sb-label::after {
          content: ''; flex: 1; height: 1px; background: var(--sb-border);
        }

        /* ── Menu items ── */
        .wpc-sidebar .mainMenu { list-style: none; padding: 0; margin: 0; }

        .wpc-sidebar .mainMenu > li > a {
          display: flex; align-items: center; gap: 12px;
          padding: 10px 13px; border-radius: 10px;
          border: 1px solid transparent; color: var(--sb-text);
          text-decoration: none; font-family: 'Outfit', sans-serif;
          font-size: 15.5px; font-weight: 600; margin-bottom: 2px;
          transition: background .15s, color .15s, border-color .15s, box-shadow .15s;
          position: relative; cursor: pointer;
        }

        .wpc-sidebar .mainMenu > li > a svg,
        .wpc-sidebar .mainMenu > li > a > div svg {
          width: 18px; height: 18px; flex-shrink: 0;
          opacity: .45; transition: opacity .15s;
        }

        .wpc-sidebar .mainMenu > li > a:hover {
          background: var(--sb-accent-soft); color: var(--sb-accent);
        }
        .wpc-sidebar .mainMenu > li > a:hover svg,
        .wpc-sidebar .mainMenu > li > a:hover > div svg { opacity: .9; }

        .wpc-sidebar .mainMenu > li > a.activeMenu {
          background: linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.06) 100%);
          color: var(--sb-accent); border-color: rgba(99,102,241,0.20);
          box-shadow: 0 2px 12px rgba(99,102,241,0.09); font-weight: 700;
        }
        .wpc-sidebar .mainMenu > li > a.activeMenu svg,
        .wpc-sidebar .mainMenu > li > a.activeMenu > div svg { opacity: 1; }

        .wpc-sidebar .mainMenu > li > a.activeMenu::before {
          content: ''; position: absolute; left: 0; top: 50%;
          transform: translateY(-50%); width: 3px; height: 55%;
          background: linear-gradient(180deg, var(--sb-accent), var(--sb-purple));
          border-radius: 0 3px 3px 0;
        }

        /* ══════════════════════════════
           FOOTER / LOGOUT
        ══════════════════════════════ */
        .wpc-sidebar .sb-footer {
          flex-shrink: 0; padding: 12px; border-top: 1px solid var(--sb-border);
          background: linear-gradient(0deg, rgba(244,63,94,0.025) 0%, transparent 100%);
        }

        .wpc-sidebar .sb-logout {
          display: flex; align-items: center; gap: 12px; width: 100%;
          padding: 11px 16px; border-radius: 10px;
          background: var(--sb-dsof); border: 1px solid var(--sb-dbdr);
          color: var(--sb-danger); font-family: 'Outfit', sans-serif;
          font-size: 15.5px; font-weight: 600; cursor: pointer; text-align: left;
          transition: background .18s, border-color .18s, box-shadow .18s;
        }
        .wpc-sidebar .sb-logout:hover {
          background: rgba(244,63,94,0.12); border-color: rgba(244,63,94,0.32);
          box-shadow: 0 2px 14px rgba(244,63,94,0.11);
        }
        .wpc-sidebar .sb-logout svg { opacity: .65; flex-shrink: 0; transition: opacity .18s; }
        .wpc-sidebar .sb-logout:hover svg { opacity: 1; }

        .wpc-sidebar .blackBox { display: none !important; }

        /* ══════════════════════════════
           COLLAPSED STATE (grid toggle)
        ══════════════════════════════ */
        .mainAdminGrid.webAdminGrid .wpc-sidebar {
          width: 110px;
          min-width: 110px;
        }
        @media screen and (max-width: 992px) {
          .mainAdminGrid.webAdminGrid .wpc-sidebar { width: 70px; min-width: 70px; }
        }
        @media screen and (max-width: 768px) {
          .mainAdminGrid.webAdminGrid .wpc-sidebar { width: 60px; min-width: 60px; }
        }

        .mainAdminGrid.webAdminGrid .wpc-sidebar .sb-brand-text { display: none; }
        .mainAdminGrid.webAdminGrid .wpc-sidebar .sb-label { display: none; }
        .mainAdminGrid.webAdminGrid .wpc-sidebar .mainMenu > li > a {
          justify-content: center;
          gap: 0;
          padding-left: 12px;
          padding-right: 12px;
        }
        .mainAdminGrid.webAdminGrid .wpc-sidebar .mainMenu > li > a span { display: none; }
        .mainAdminGrid.webAdminGrid .wpc-sidebar .sb-footer .sb-logout {
          justify-content: center;
        }

        .mainAdminGrid.webAdminGrid .wpc-sidebar .sb-close svg {
          transform: rotate(180deg);
        }
      `}</style>

      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmLogout}
        text="LogOut"
      />

      <div className="mainSidebar">
        <SideMenuJS />

        <div className="sideBar wpc-sidebar">

          {/* ══ Brand Header ══ */}
          <div className="sb-header sideBarLogo">
            <div className="sb-brand">

              {/* Logo inside rounded card */}
              <div className="sb-logo-wrap">
                <img src={LogoNew.src} alt="WePlayChat" />
              </div>

              {/* Text block */}
              <div className="sb-brand-text">

                {/* WePlay  Chat — two-tone bold name */}
                <div className="sb-brand-name">
                  <span className="part1">WePlay</span>
                  <span className="part2">Chat</span>
                </div>

                {/* Animated pill subtitle */}
                <div className="sb-brand-pill">
                  <span className="sb-brand-pill-dot" />
                  <span className="sb-brand-pill-text">Admin Panel</span>
                </div>

              </div>
            </div>

          </div>

          {/* ══ Scrollable Nav ══ */}
          <div className="sb-scroll">
            <div className="sb-toggle-wrap">
              <button className="sb-close navToggle" type="button" aria-label="Toggle sidebar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"
                  strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
            </div>
            <nav>
              <ul className="mainMenu webMenu">

                {role !== "admin" && role !== "manager" && renderMenuItems(genralMenu)}
                {role === "manager" && renderMenuItems(managerMenu)}

                <li className="sb-label">Host &amp; Agency</li>
                {renderMenuItems(hostAndAgency)}

                {role !== "admin" && role !== "manager" && (
                  <>
                    <li className="sb-label">Gifts &amp; Rewards</li>
                    {renderMenuItems(giftAndRewards)}

                    <li className="sb-label">Store</li>
                    {renderMenuItems(storeMenu)}

                    <li className="sb-label">Packages</li>
                    {renderMenuItems(packages)}

                    <li className="sb-label">Finance</li>
                    {renderMenuItems(finance)}

                    <li className="sb-label">Settings</li>
                    {renderMenuItems(setting)}
                  </>
                )}

                <li style={{ height: "16px", listStyle: "none" }} />
              </ul>
            </nav>
          </div>

          {/* ══ Logout Footer ══ */}
          <div className="sb-footer">
            <button className="sb-logout" onClick={handleLogout}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              LogOut
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Sidebar;

export const SideMenuJS = () => {
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    $(".subMenu").hide();
    const handleNav = (event: any) => {
      const t = event.currentTarget;
      $(".subMenu").not($(t).next(".subMenu")).slideUp();
      $(".mainMenu i").not($(t).children("i")).removeClass("rotate90");
      $(t).next(".subMenu").slideToggle();
      $(t).children("i").toggleClass("rotate90");
    };
    $(".mainMenu.webMenu > li > a").on("click", handleNav);
    const handleSidebar = () => {
      $(".subMenu").slideUp();
      $(".mainMenu i").removeClass("rotate90");
      $(".mainAdminGrid").toggleClass("webAdminGrid");
      $(".mainMenu").toggleClass("mobMenu webMenu");
      setMenu(prev => !prev);
    };
    $(".navToggle").on("click", handleSidebar);
    return () => {
      $(".mainMenu > li > a").off("click", handleNav);
      $(".navToggle").off("click", handleSidebar);
    };
  }, [menu]);
  return null;
};