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
import { vipsSidebarMenu } from "./vipsSidebarMenu";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import GroupRoundedIcon from "@mui/icons-material/GroupRounded";
import AdminPanelSettingsRoundedIcon from "@mui/icons-material/AdminPanelSettingsRounded";
import StorefrontRoundedIcon from "@mui/icons-material/StorefrontRounded";
import CardGiftcardRoundedIcon from "@mui/icons-material/CardGiftcardRounded";
import WorkspacePremiumRoundedIcon from "@mui/icons-material/WorkspacePremiumRounded";
import PublicRoundedIcon from "@mui/icons-material/PublicRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import AccountTreeRoundedIcon from "@mui/icons-material/AccountTreeRounded";
import SlowMotionVideoRoundedIcon from "@mui/icons-material/SlowMotionVideoRounded";
import PhotoSizeSelectActualRoundedIcon from "@mui/icons-material/PhotoSizeSelectActualRounded";
import SportsEsportsRoundedIcon from "@mui/icons-material/SportsEsportsRounded";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import AssessmentRoundedIcon from "@mui/icons-material/AssessmentRounded";
import MonetizationOnRoundedIcon from "@mui/icons-material/MonetizationOnRounded";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import CampaignRoundedIcon from "@mui/icons-material/CampaignRounded";
import RoomPreferencesRoundedIcon from "@mui/icons-material/RoomPreferencesRounded";
import EmojiEmotionsRoundedIcon from "@mui/icons-material/EmojiEmotionsRounded";

// ── Logo image ──
import LogoNew from "@/assets/images/unnamed__2_..-removebg-preview.png";

const DashIcon = () => <DashboardRoundedIcon fontSize="small" />;
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
const getTitleIcon = (title: string) => {
  const t = title.toLowerCase();
  if (t.includes("store")) return <StorefrontRoundedIcon fontSize="small" />;
  if (t.includes("gift") || t.includes("badge") || t.includes("reward") || t.includes("event") || t.includes("frame") || t.includes("entry") || t.includes("tag") || t.includes("spin")) return <CardGiftcardRoundedIcon fontSize="small" />;
  if (t.includes("vip") || t.includes("achievement") || t.includes("rank")) return <WorkspacePremiumRoundedIcon fontSize="small" />;
  if (t.includes("user") || t.includes("employee") || t.includes("manager") || t.includes("host") || t.includes("agency") || t.includes("family") || t.includes("reseller") || t.includes("bd")) return <GroupRoundedIcon fontSize="small" />;
  if (t.includes("permission") || t.includes("role") || t.includes("admin") || t.includes("invitation")) return <AdminPanelSettingsRoundedIcon fontSize="small" />;
  if (t.includes("setting") || t.includes("config") || t.includes("dashboard")) return <SettingsRoundedIcon fontSize="small" />;
  if (t.includes("system") || t.includes("module") || t.includes("work") || t.includes("app")) return <AccountTreeRoundedIcon fontSize="small" />;
  if (t.includes("report") || t.includes("log") || t.includes("history") || t.includes("assessment") || t.includes("stat")) return <AssessmentRoundedIcon fontSize="small" />;
  if (t.includes("coin") || t.includes("charge") || t.includes("wallet") || t.includes("finance") || t.includes("withdraw") || t.includes("currency") || t.includes("diamond") || t.includes("target")) return <MonetizationOnRoundedIcon fontSize="small" />;
  if (t.includes("ban") || t.includes("complaint") || t.includes("security") || t.includes("close") || t.includes("block") || t.includes("delete")) return <SecurityRoundedIcon fontSize="small" />;
  if (t.includes("room") || t.includes("chat") || t.includes("broadcast") || t.includes("live")) return <RoomPreferencesRoundedIcon fontSize="small" />;
  if (t.includes("emoji")) return <EmojiEmotionsRoundedIcon fontSize="small" />;
  if (t.includes("banner") || t.includes("announcement") || t.includes("advertisement") || t.includes("official") || t.includes("splash")) return <CampaignRoundedIcon fontSize="small" />;
  if (t.includes("level") || t.includes("chart") || t.includes("rank")) return <BarChartRoundedIcon fontSize="small" />;
  if (t.includes("reels") || t.includes("video") || t.includes("moment") || t.includes("photo") || t.includes("gallery")) return <SlowMotionVideoRoundedIcon fontSize="small" />;
  if (t.includes("game")) return <SportsEsportsRoundedIcon fontSize="small" />;
  return <PublicRoundedIcon fontSize="small" />;
};

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
    [
      "/dashboard", "/User/User", "/User/Manager", "/User/Admin", "/User/Reseller",
      "/Agency", "/Host", "/HostRequest", "/Impression",
      "/GiftCategory", "/GiftPage", "/DailyCheckInReward", "/SpinWheel", "/Banner",
      "/Store", "/Background", "/EntryTag", "/Frame", "/Entry", "/Tag", "/Event",
      "/Plan", "/VipPlanPrevilage",
      "/WithdrawRequest", "/adminProfile", "/Level", "/LevelGift",
      "/User/UserInfoPage", "/User/CoinPlanHistoryPage", "/PurchaseCoinPlanHistory",
      "/Host/AgencyWiseHost", "/Host/HostInfoPage", "/Host/HostHistoryPage", "/HostProfile"
    ].some(route => route.toLowerCase() === p.toLowerCase());

  useEffect(() => {
    if (role === "admin" && !isAdminRoute(nextRouter.pathname)) router.push("/Agency");
  }, [nextRouter.pathname, role]);

  const genralMenu = [
    { name: "Dashboard", path: "/dashboard", navSVG: <DashIcon /> },
    {
      name: "Employee & Permission",
      path: "/User/User",
      path2: "/User/Manager",
      path3: "/User/Admin",
      path4: "/User/Reseller",
      navSVG: <GroupRoundedIcon fontSize="small" />,
      onClick: handleOnClick,
      subMenu: [
        { subName: "User", subPath: "/User/User", onClick: handleOnClick },
        { subName: "Manager", subPath: "/User/Manager", onClick: handleOnClick },
        { subName: "Admin", subPath: "/User/Admin", onClick: handleOnClick },
        { subName: "Reseller", subPath: "/User/Reseller", onClick: handleOnClick },
      ],
    },
  ];

  const managerMenu = [
    { name: "Dashboard", path: "/dashboard", navSVG: <DashIcon /> },
    {
      name: "Employee & Permission",
      path: "/User/Admin",
      path2: "/User/Reseller",
      navSVG: <GroupRoundedIcon fontSize="small" />,
      onClick: handleOnClick,
      subMenu: [
        { subName: "Admin", subPath: "/User/Admin", onClick: handleOnClick },
        { subName: "Reseller", subPath: "/User/Reseller", onClick: handleOnClick },
      ],
    },
  ];

  const fastOrdersData = vipsSidebarMenu.find(
    (item: any) => String(item?.title || "").toLowerCase() === "fast orders"
  );
  const fastOrdersMenu = fastOrdersData
    ? [
      {
        name: "Fast orders",
        path: fastOrdersData?.href || "#",
        navSVG: getTitleIcon("fast orders"),
        external: fastOrdersData?.href !== "#",
        onClick: (fastOrdersData?.href === "#" && (!fastOrdersData?.children || fastOrdersData?.children?.length === 0)) ? () => toast.info("Coming soon") : undefined,
        subMenu: (fastOrdersData?.children || []).map((child: any) => ({
          subName: child?.title,
          subPath: child?.href,
          external: child?.href !== "#",
          onClick: child?.href === "#" ? () => toast.info("Coming soon") : undefined,
          navSVG: getTitleIcon(child?.title || ""),
        })),
      },
    ]
    : [];

  const hostAndAgency = [
    {
      name: "Host & Agency",
      path: "/Agency",
      path2: "/Host",
      path3: "/HostRequest",
      path4: "/Impression",
      path5: "/Host/AgencyWiseHost",
      path6: "/Host/HostInfoPage",
      path7: "/Host/HostHistoryPage",
      path8: "/HostProfile",
      navSVG: <Agency />,
      onClick: handleOnClick,
      subMenu: [
        { subName: "Agency", subPath: "/Agency", onClick: handleOnClick },
        { subName: "Host", subPath: "/Host", onClick: handleOnClick },
        { subName: "Host Request", subPath: "/HostRequest", onClick: handleOnClick },
        { subName: "Host Tags", subPath: "/Impression", onClick: handleOnClick },
      ],
    },
  ];

  const giftAndRewards = [
    {
      name: "Gifts & Rewards",
      path: "/GiftCategory",
      path2: "/GiftPage",
      path3: "/DailyCheckInReward",
      path4: "/SpinWheel",
      navSVG: <Gift />,
      onClick: handleOnClick,
      subMenu: [
        { subName: "Gift Category", subPath: "/GiftCategory", onClick: handleOnClick },
        { subName: "Gift", subPath: "/GiftPage", onClick: handleOnClick },
        { subName: "Daily CheckIn", subPath: "/DailyCheckInReward", onClick: handleOnClick },
        { subName: "Spin Wheel", subPath: "/SpinWheel", onClick: handleOnClick },
      ],
    },
  ];

  const storeMenu = [
    {
      name: "Store",
      path: "/Background",
      path2: "/EntryTag",
      path3: "/Frame",
      path4: "/Entry",
      path5: "/Tag",
      navSVG: <StorefrontRoundedIcon fontSize="small" />,
      onClick: handleOnClick,
      subMenu: [
        { subName: "Frame", subPath: "/Frame", onClick: handleOnClick },
        { subName: "Entry", subPath: "/Entry", onClick: handleOnClick },
        { subName: "Tag", subPath: "/Tag", onClick: handleOnClick },
        { subName: "Background", subPath: "/Background", onClick: handleOnClick },
        { subName: "Entry Effect", subPath: "/EntryTag", onClick: handleOnClick },
      ],
    },
  ];

  const bannerAndEvent = [
    {
      name: "Banner & Event",
      path: "/Banner",
      path2: "/Event",
      navSVG: <CampaignRoundedIcon fontSize="small" />,
      onClick: handleOnClick,
      subMenu: [
        { subName: "Banner", subPath: "/Banner", onClick: handleOnClick },
        { subName: "Event", subPath: "/Event", onClick: handleOnClick },
      ],
    },
  ];

  const vipMenu = [
    {
      name: "VIP",
      path: "/Plan",
      path2: "/VipPlanPrevilage",
      navSVG: <WorkspacePremiumRoundedIcon fontSize="small" />,
      onClick: handleOnClick,
      subMenu: [
        { subName: "Plan", subPath: "/Plan", onClick: handleOnClick },
        { subName: "Vip Plan Benefits", subPath: "/VipPlanPrevilage", onClick: handleOnClick },
      ],
    },
  ];

  const finance = [
    { name: "Withdrawal", path: "/WithdrawRequest", navSVG: <WithdrawRequest />, onClick: handleOnClick },
  ];



  const reelsAndMoments = [
    {
      name: "Reels & Moments",
      path: "#",
      navSVG: <SlowMotionVideoRoundedIcon fontSize="small" />,
      onClick: () => toast.info("Coming soon"),
    },
  ];

  const gamesMenu = [
    {
      name: "Games",
      path: "#",
      navSVG: <SportsEsportsRoundedIcon fontSize="small" />,
      onClick: () => toast.info("Coming soon"),
    },
  ];
  const levelData = vipsSidebarMenu.find(
    (item: any) => String(item?.title || "").toLowerCase() === "level"
  );
  const levelMenu = levelData
    ? [
      {
        name: levelData?.title,
        path: levelData?.href || "#",
        navSVG: getTitleIcon(levelData?.title || ""),
        onClick: (levelData?.href === "#" && (!levelData?.children || levelData?.children?.length === 0)) ? () => toast.info("Coming soon") : undefined,
        subMenu: (levelData?.children || []).map((child: any) => ({
          subName: child?.title,
          subPath: child?.href,
          navSVG: getTitleIcon(child?.title || ""),
          onClick: child?.href === "#" ? () => toast.info("Coming soon") : undefined,
        })),
      },
    ]
    : [];



  const blockedVipsTopLevel = new Set([
    "dashboard",
    "users",
    "gifts rewards",
    "store",
    "vip",
    "fast orders",
    "employees and permissions",
    "agency system",
    "regions system",
    "countries system",
    "advertisements",
    "chat",
    "moment",
    "reels",
    "games",
    "level",
    "settings",
    "setting",
    "advertisements",
    "events",
  ]);
  const vipsImportedMenu = vipsSidebarMenu
    .filter((item: any) => !blockedVipsTopLevel.has(String(item?.title || "").toLowerCase()))
    .map((item: any) => ({
      name: item?.title,
      path: item?.href || "#",
      navSVG: getTitleIcon(item?.title || ""),
      external: item?.href && item?.href !== "#",
      onClick: (item?.href === "#" && (!item?.children || item?.children?.length === 0)) ? () => toast.info("Coming soon") : undefined,
      subMenu: item?.children?.map((child: any) => ({
        subName: child?.title,
        subPath: child?.href,
        external: child?.href !== "#",
        onClick: child?.href === "#" ? () => toast.info("Coming soon") : undefined,
        navSVG: getTitleIcon(child?.title || ""),
      })),
    }));

  const renderMenuItems = (items: any[]) =>
    items.map((res: any, i: number) => (
      <React.Fragment key={`${res?.name}-${i}`}>
        {/*
          Ensure icons always show: if navSVG isn't provided in data,
          derive it from the item name/title.
        */}
        <Navigator
          name={res?.name} path={res?.path}
          path2={res?.path2} path3={res?.path3} path4={res?.path4}
          navIcon={res?.navIcon}
          navSVG={res?.navSVG ?? getTitleIcon(res?.name || "")}
          onClick={res?.onClick}
          external={res?.external}
        >
          {res?.subMenu && (
            <ul className="subMenu">
              <span className="subhead">{res?.name}</span>
              {res?.subMenu?.map((sub: any, subIdx: number) => (
                <Navigator
                  name={sub?.subName}
                  path={sub?.subPath}
                  external={sub?.external}
                  navIcon={sub?.navIcon}
                  navSVG={sub?.navSVG ?? getTitleIcon(sub?.subName || "")}
                  onClick={sub?.onClick}
                  key={`${sub?.subName}-${subIdx}`}
                />
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
          --sb-bg:          linear-gradient(180deg, #f8fbff 0%, #f3f7ff 52%, #ecebff 100%);
          --sb-page:        #f8fafc;
          --sb-border:      #d8e2f4;
          --sb-accent:      #3b5bdb;
          --sb-purple:      #7c3aed;
          --sb-accent-soft: rgba(59,91,219,0.14);
          --sb-text:        #1b2436;
          --sb-text-bright: #0f172a;
          --sb-text-dim:    #64748b;
          --sb-danger:      #ef4444;
          --sb-dsof:        rgba(239,68,68,0.07);
          --sb-dbdr:        rgba(239,68,68,0.22);

          width: 100%;
          min-width: 0;
          height: 100vh;
          background: var(--sb-bg);
          border-right: 1px solid var(--sb-border);
          display: flex;
          flex-direction: column;
          font-family: 'Outfit', sans-serif;
          box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08);
          position: relative;
          animation: dynamicSidebarBg 8s ease-in-out infinite;
        }

        @keyframes dynamicSidebarBg {
          0% { background: linear-gradient(180deg, #ffffff 0%, #f8fafc 60%, #eef2ff 100%); }
          50% { background: linear-gradient(180deg, #f8fafc 0%, #ffffff 40%, #e0e7ff 100%); }
          100% { background: linear-gradient(180deg, #ffffff 0%, #f8fafc 60%, #eef2ff 100%); }
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
            rgba(37,99,235,0.10) 0%,
            rgba(124,58,237,0.08) 100%);
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
        .wpc-sidebar .sb-scroll::-webkit-scrollbar { width: 8px; }
        .wpc-sidebar .sb-scroll::-webkit-scrollbar-track { background: transparent; }
        .wpc-sidebar .sb-scroll::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(37,99,235,.45), rgba(124,58,237,.45));
          border-radius: 999px;
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
          justify-content: space-between;
          padding: 12px 14px; border-radius: 12px;
          border: 1px solid transparent; color: var(--sb-text);
          text-decoration: none; font-family: 'Outfit', sans-serif;
          font-size: 15.5px; font-weight: 600; margin-bottom: 2px;
          transition: background .22s, color .22s, border-color .22s, box-shadow .22s, transform .22s;
          position: relative; cursor: pointer;
          margin: 3px 0;
          overflow: hidden;
        }
        .wpc-sidebar .mainMenu > li > a > div {
          display: flex;
          align-items: center;
          min-width: 0;
          gap: 12px;
        }
        .wpc-sidebar .mainMenu > li > a .subtext {
          margin-left: 0 !important;
          font-weight: 600;
          letter-spacing: .1px;
          color: inherit;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .wpc-sidebar .mainMenu > li > a::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, rgba(37,99,235,0.06), rgba(124,58,237,0.03));
          opacity: 0;
          transition: opacity .22s;
          pointer-events: none;
        }

        .wpc-sidebar .mainMenu > li > a svg,
        .wpc-sidebar .mainMenu > li > a > div svg {
          width: 18px; height: 18px; flex-shrink: 0;
          opacity: .45; transition: opacity .15s;
        }

        .wpc-sidebar .mainMenu > li > a:hover {
          background: var(--sb-accent-soft);
          color: var(--sb-accent);
          transform: translateX(4px);
          box-shadow: 0 6px 16px rgba(37,99,235,0.14);
        }
        .wpc-sidebar .mainMenu > li > a:hover::after { opacity: 1; }
        .wpc-sidebar .mainMenu > li > a:hover svg,
        .wpc-sidebar .mainMenu > li > a:hover > div svg {
          opacity: .95;
          filter: drop-shadow(0 0 4px rgba(37,99,235,.55));
          animation: iconGlow .9s ease-in-out infinite;
        }

        @keyframes iconGlow {
          0%,100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .wpc-sidebar .mainMenu > li > a.activeMenu {
          background: linear-gradient(135deg, rgba(37,99,235,0.18) 0%, rgba(124,58,237,0.08) 100%);
          color: var(--sb-accent); border-color: rgba(37,99,235,0.24);
          box-shadow: 0 8px 20px rgba(37,99,235,0.14); font-weight: 700;
          transform: translateX(4px);
        }
        .wpc-sidebar .mainMenu > li > a.activeMenu svg,
        .wpc-sidebar .mainMenu > li > a.activeMenu > div svg { opacity: 1; }

        .wpc-sidebar .mainMenu > li > a.activeMenu::before {
          content: ''; position: absolute; left: 0; top: 50%;
          transform: translateY(-50%); width: 3px; height: 55%;
          background: linear-gradient(180deg, var(--sb-accent), var(--sb-purple));
          border-radius: 0 3px 3px 0;
        }

        /* ── Dropdown / Submenu ── */
        .wpc-sidebar .subMenu {
          list-style: none;
          margin: 4px 0 10px 12px;
          padding: 8px;
          border-radius: 12px;
          border: 1px solid rgba(99,102,241,0.20);
          background: linear-gradient(145deg, rgba(59,91,219,0.10) 0%, rgba(124,58,237,0.08) 100%);
          box-shadow: inset 0 1px 0 rgba(255,255,255,.65), 0 8px 20px rgba(59,91,219,0.10);
        }
        .wpc-sidebar .subMenu .subhead {
          display: block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1.05px;
          color: #5b6ea6;
          padding: 2px 8px 7px;
        }
        .wpc-sidebar .subMenu > li {
          list-style: none;
        }
        .wpc-sidebar .subMenu > li > a {
          display: flex;
          align-items: center;
          border-radius: 9px;
          padding: 9px 10px;
          color: #334155;
          font-size: 14px;
          font-weight: 500;
          text-decoration: none;
          margin: 2px 0;
          transition: background .2s ease, color .2s ease, transform .2s ease;
        }
        .wpc-sidebar .subMenu > li > a .subtext {
          font-size: 13.5px;
          font-weight: 600;
          margin-left: 0 !important;
          color: inherit;
        }
        .wpc-sidebar .subMenu > li > a:hover {
          background: rgba(59,91,219,0.16);
          color: #1d4ed8;
          transform: translateX(3px);
        }
        .wpc-sidebar .subMenu > li > a.activeMenu {
          background: linear-gradient(135deg, rgba(59,91,219,0.24), rgba(124,58,237,0.14));
          color: #1e40af;
          box-shadow: inset 0 0 0 1px rgba(59,91,219,0.24);
        }
        .wpc-sidebar .mainMenu > li > a > i {
          font-size: 18px;
          color: #7282a7;
          transition: transform .2s ease, color .2s ease;
          flex-shrink: 0;
        }
        .wpc-sidebar .mainMenu > li > a:hover > i {
          color: #3454d1;
        }
        .wpc-sidebar .mainMenu > li > a > i.rotate90 {
          transform: rotate(90deg);
          color: #3454d1;
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
                  <span className="sb-brand-pill-text">Global Admin</span>
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
                {renderMenuItems(fastOrdersMenu)}

                {renderMenuItems(hostAndAgency)}

                {role !== "admin" && role !== "manager" && (
                  <>
                    {renderMenuItems(giftAndRewards)}

                    {renderMenuItems(storeMenu)}

                    {renderMenuItems(bannerAndEvent)}

                    {renderMenuItems(vipMenu)}
                  </>
                )}
                {renderMenuItems(reelsAndMoments)}
                {renderMenuItems(gamesMenu)}
                {renderMenuItems(levelMenu)}

                <li className="sb-label">More Modules</li>
                {renderMenuItems(vipsImportedMenu)}

                <li className="sb-label">Finance</li>
                {renderMenuItems(finance)}



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
      if ($(t).next(".subMenu").length) event.preventDefault();
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