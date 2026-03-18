import Navigator from "@/extra/Navigator";
import { useEffect, useState } from "react";
import sideBarLogo from "../../assets/images/unnamed__2_..-removebg-preview.png";
import { useRouter } from "next/navigation";
import $ from "jquery";
import { projectName } from "@/utils/config";
import CommonDialog from "@/utils/CommonDialog";
import { toast } from "react-toastify";
import HostRequest from "../../assets/images/HostRequest";
import Host from "../../assets/images/Host";
import PaymentMethod from "../../assets/images/PaymentMethod";
import HostWithdrawal from "../../assets/images/HostWithdrawal";
import AgencyWithdraw from "../../assets/images/AgencyWithdraw";
import AgenyEarning from "../../assets/images/AgenyEarning";
import LogOut from "../../assets/images/Logout";

const DashIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M0 0h16v16H0zm1 1v6.5h6.5V1zm7.5 0v6.5H15V1zM15 8.5H8.5V15H15zM7.5 15V8.5H1V15z" />
  </svg>
);

const RechargeIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
  </svg>
);

const PersonIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m2-3a2 2 0 1 1-4 0 2 2 0 0 1 4 0m4 8c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4m-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10s-3.516.68-4.168 1.332c-.678.678-.83 1.418-.832 1.664z" />
  </svg>
);

const LiveHostIcon = () => (
  <svg width="18" height="18" fill="currentColor" viewBox="0 0 16 16">
    <path d="M12.5 16a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7m.354-5.854 1.5 1.5a.5.5 0 0 1-.708.708L13 11.707V14.5a.5.5 0 0 1-1 0v-2.793l-.646.647a.5.5 0 0 1-.708-.708l1.5-1.5a.5.5 0 0 1 .708 0M11 5a3 3 0 1 1-6 0 3 3 0 0 1 6 0M8 7a2 2 0 1 0 0-4 2 2 0 0 0 0 4" />
    <path d="M8.256 14a4.5 4.5 0 0 1-.229-1.004H3c.001-.246.154-.986.832-1.664C4.484 10.68 5.711 10 8 10q.39 0 .74.025c.226-.341.496-.65.804-.918Q8.844 9.002 8 9c-5 0-6 3-6 4s1 1 1 1z" />
  </svg>
);

const Sidebar = () => {
  const router = useRouter();
  const [showDialog, setShowDialog] = useState(false);

  const currentRole =
    typeof window !== "undefined"
      ? sessionStorage.getItem("currentRole")
      : null;

  const handleLogout = () => setShowDialog(true);
  const handleOnClick = () => window && localStorage.removeItem("dialog");

  const confirmLogout = async () => {
    if (currentRole === "reseller") {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("uid");
      sessionStorage.removeItem("reseller_");
      sessionStorage.removeItem("isReseller");
      sessionStorage.removeItem("currentRole");
      localStorage.removeItem("persist:reseller");
      setTimeout(() => router.push("/ResellerLogin"), 1000);
    } else {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("admin");
      sessionStorage.removeItem("key");
      sessionStorage.removeItem("isAuth");
      sessionStorage.setItem("isAgency", "false");
      setTimeout(() => router.push("/"), 1000);
    }
    toast.success("Logout successful");
  };

  const resellerNavArray = [
    { name: "Dashboard", path: "/dashboard", navSVG: <DashIcon /> },
    { name: "Recharge", path: "/recharge", navSVG: <RechargeIcon /> },
    { name: "Profile", path: "/reseller/profile", navSVG: <PersonIcon /> },
  ];

  const agencyNavArray = [
    { name: "Dashboard", path: "/dashboard", navSVG: <DashIcon /> },
  ];

  const navBarArray = currentRole === "reseller" ? resellerNavArray : agencyNavArray;

  const array1 = [
    { name: "Host Request", path: "/HostRequest", path2: "/HostProfile", navSVG: <HostRequest /> },
    { name: "Host", path: "/Host", path2: "/Host/HostInfo", path3: "/Host/HostHistoryPage", navSVG: <Host />, onClick: handleOnClick },
    { name: "Live Host", path: "/LiveHost", navSVG: <LiveHostIcon />, onClick: handleOnClick },
  ];

  const array2 = [
    { name: "Payment Method", path: "/PaymentMethod", navSVG: <PaymentMethod />, onClick: handleOnClick },
    { name: "Host Withdrawal", path: "/WithdrawRequest", navSVG: <HostWithdrawal />, onClick: handleOnClick },
    { name: "Agency Withdrawal", path: "/AgencyWithdrawRequest", navSVG: <AgencyWithdraw />, onClick: handleOnClick },
    { name: "Agency Earning", path: "/AgencyEarningHistory", navSVG: <AgenyEarning />, onClick: handleOnClick },
  ];

  const array5 = [
    { name: "Profile", path: "/agencyProfile", navSVG: <PersonIcon />, onClick: handleOnClick },
  ];

  const renderMenuItems = (items: any[]) =>
    items.map((res: any, i: number) => (
      <Navigator
        key={i}
        name={res?.name}
        path={res?.path}
        path2={res?.path2}
        path3={res?.path3}
        path4={res?.path4}
        navIcon={res?.navIcon}
        navSVG={res?.navSVG}
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

          width: 280px;
          min-width: 280px;
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

        .wpc-sidebar .sb-brand {
          display: flex;
          align-items: center;
          gap: 11px;
          flex: 1;
          min-width: 0;
          position: relative;
          z-index: 1;
        }

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

        .wpc-sidebar .sb-brand-text {
          display: flex;
          flex-direction: column;
          min-width: 0;
          gap: 3px;
        }

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
                <img src={sideBarLogo.src} alt={projectName} />
              </div>

              {/* Text block */}
              <div className="sb-brand-text">

                {/* WePlay Chat — two-tone bold name */}
                <div className="sb-brand-name">
                  <span className="part1">WePlay</span>
                  <span className="part2">Chat</span>
                </div>

                {/* Animated pill subtitle */}
                <div className="sb-brand-pill">
                  <span className="sb-brand-pill-dot" />
                  <span className="sb-brand-pill-text">
                    {currentRole === "reseller" ? "Reseller Panel" : "Agency Panel"}
                  </span>
                </div>

              </div>
            </div>

            <div className="blackBox navToggle" />
          </div>

          {/* ══ Scrollable Nav ══ */}
          <div className="sb-scroll">
            <nav>
              <ul className="mainMenu webMenu">

                {/* Menu section */}
                <li className="sb-label">Menu</li>
                {renderMenuItems(navBarArray)}

                {/* Host Management — agency only */}
                {currentRole !== "reseller" && (
                  <>
                    <li className="sb-label">Host Management</li>
                    {renderMenuItems(array1)}

                    <li className="sb-label">Finance</li>
                    {renderMenuItems(array2)}

                    <li className="sb-label">Settings</li>
                    {renderMenuItems(array5)}
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