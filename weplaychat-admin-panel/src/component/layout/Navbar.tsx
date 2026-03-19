import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { useSelector } from "react-redux";
import NotificationDialog from "../user/NotificationDialogue";
import { adminProfileGet, getAdminById, logoutApi } from "@/store/adminSlice";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/user.png";
import { toast } from "react-toastify";

const Navbar = () => {
  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { admin } = useSelector((state: RootStore) => state?.admin);
  const dispatch = useAppDispatch();
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);

  useEffect(() => {
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    const uid = typeof window !== "undefined" ? sessionStorage.getItem("uid") : null;

    // Avoid firing authenticated APIs before token/uid are present.
    if (!token || !uid) return;
    dispatch(adminProfileGet());
  }, [dispatch]);

  useEffect(() => {
    if (!admin?._id) return;
    dispatch(getAdminById({ id: admin._id }));
  }, [admin?._id, dispatch]);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node))
        setShowDropdown(false);
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const handleNotify = (id: any) =>
    dispatch(openDialog({ type: "notification", data: { id, type: "Alluser" } }));

  const handleLogout = () => {
    ["token", "admin", "key", "isAuth", "isManager", "currentRole", "admin_"]
      .forEach(k => sessionStorage.removeItem(k));
    localStorage.removeItem("persist:admin");
    dispatch(logoutApi());
    toast.success("Logout successful");
    setTimeout(() => router.push("/"), 1000);
  };

  const adminImage = admin?.image ? baseURL + admin.image : male.src;
  const adminName = admin?.name || "WePlayChat";
  const adminEmail = admin?.email || "admin@weplaychat.com";
  const avatarLetter = adminName.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        /* ── tokens: exact mirror of sidebar ── */
        .wpc-nb {
          --accent:       #6366f1;
          --accent2:      #a855f7;
          --accent-soft:  rgba(99,102,241,0.08);
          --accent-mid:   rgba(99,102,241,0.13);
          --accent-glow:  rgba(99,102,241,0.20);
          --red:          #f43f5e;
          --red-soft:     rgba(244,63,94,0.07);
          --red-bdr:      rgba(244,63,94,0.18);
          --border:       #e8eaf2;
          --text:         #64748b;
          --text-dark:    #1e2235;
          --text-dim:     #a0a8c0;
          --white:        #ffffff;
          --bg:           #f4f5fb;
        }

        /* ── Navbar shell ──
           Height derived same way as sidebar sb-header:
           padding-top(18) + logo(44) + padding-bottom(15) = ~77px
           We match that exactly so the horizontal border lines up.
        ── */
        .wpc-nb {
          width: 105%;
          height: 77px;
          min-height: 77px;
          background: var(--white);
          border-bottom: 1px solid var(--border);
          display: flex;
          align-items: center;
          /* left gap = sidebar width (280px) already occupied by sidebar;
             navbar starts right after sidebar so no extra left padding needed */
          padding: 0 20px 0 10px;
          gap: 0;
          box-shadow: 0 1px 10px rgba(99,102,241,0.06);
          font-family: 'Outfit', sans-serif;
          position: sticky;
          top: 0;
          z-index: 100;
          box-sizing: border-box;
        }

        /* ── Search ── */
        .wpc-nb .nb-search {
          display: flex;
          align-items: center;
          gap: 8px;
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 10px;
          padding: 0 14px;
          height: 40px;
          width: 400px;
          transition: border-color .16s, box-shadow .16s;
          flex-shrink: 0;
        }
        .wpc-nb .nb-search:focus-within {
          border-color: var(--accent);
          box-shadow: 0 0 0 3px var(--accent-soft);
        }
        .wpc-nb .nb-search svg   { color: var(--text-dim); flex-shrink: 0; }
        .wpc-nb .nb-search input {
          border: none; background: transparent;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; color: var(--text-dark);
          outline: none; width: 100%;
        }
        .wpc-nb .nb-search input::placeholder { color: var(--text-dim); }

        /* spacer */
        .wpc-nb .nb-space { flex: 1; }

        /* ── Icon group ── */
        .wpc-nb .nb-icons {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .wpc-nb .nb-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: transparent;
          border: 1.5px solid var(--border);
          color: var(--text);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer;
          position: relative;
          transition: background .14s, border-color .14s, color .14s, transform .12s;
          padding: 0;
          flex-shrink: 0;
        }
        .wpc-nb .nb-icon:hover {
          background: var(--accent-soft);
          border-color: var(--accent);
          color: var(--accent);
          transform: translateY(-1px);
        }

        /* notification red dot */
        .wpc-nb .nb-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 8px; height: 8px;
          background: var(--red);
          border-radius: 50%;
          border: 2px solid var(--white);
          animation: nbpulse 1.8s ease-in-out infinite;
        }
        @keyframes nbpulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(244,63,94,.5); }
          50%      { box-shadow: 0 0 0 4px rgba(244,63,94,0); }
        }

        /* divider */
        .wpc-nb .nb-sep {
          width: 1px; height: 24px;
          background: var(--border);
          margin: 0 8px;
          flex-shrink: 0;
        }

        /* ── User chip ── */
        .wpc-nb .nb-chip {
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 5px 10px 5px 5px;
          border-radius: 11px;
          border: 1.5px solid var(--border);
          background: var(--white);
          cursor: pointer;
          transition: background .14s, border-color .14s, box-shadow .14s;
          user-select: none;
          flex-shrink: 0;
        }
        .wpc-nb .nb-chip:hover {
          background: var(--accent-soft);
          border-color: var(--accent-mid);
          box-shadow: 0 2px 12px var(--accent-soft);
        }

        /* avatar */
        .wpc-nb .nb-ava {
          width: 32px; height: 32px;
          border-radius: 9px;
          background: linear-gradient(135deg, #c4b5fd, var(--accent));
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
          overflow: hidden;
        }
        .wpc-nb .nb-ava img {
          width: 32px; height: 32px;
          object-fit: cover;
          border-radius: 9px;
          display: block;
        }
        .wpc-nb .nb-ava-letter {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 15px;
          color: #fff;
          line-height: 1;
        }

        .wpc-nb .nb-uinfo { display: flex; flex-direction: column; gap: 0; }

        .wpc-nb .nb-uname {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 13.5px;
          color: var(--text-dark);
          line-height: 1.2;
          white-space: nowrap;
        }

        .wpc-nb .nb-uemail {
          font-size: 10.5px;
          color: var(--text-dim);
          line-height: 1.2;
          white-space: nowrap;
        }

        .wpc-nb .nb-chev {
          color: var(--text-dim);
          transition: transform .18s, color .15s;
          flex-shrink: 0;
        }
        .wpc-nb .nb-chev.open { transform: rotate(180deg); color: var(--accent); }

        /* ── Dropdown ── */
        .wpc-nb .nb-drop {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 210px;
          background: var(--white);
          border: 1.5px solid var(--border);
          border-radius: 14px;
          box-shadow: 0 10px 32px rgba(99,102,241,0.13);
          z-index: 400;
          overflow: hidden;
          animation: dropIn .15s ease;
        }
        @keyframes dropIn {
          from { opacity:0; transform:translateY(-5px); }
          to   { opacity:1; transform:translateY(0); }
        }

        .wpc-nb .nb-dh {
          padding: 12px 15px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg,
            rgba(99,102,241,0.05) 0%,
            rgba(168,85,247,0.02) 100%);
        }
        .wpc-nb .nb-dh p    { margin:0; font-family:'Rajdhani',sans-serif; font-weight:700; font-size:14px; color:var(--text-dark); line-height:1.3; }
        .wpc-nb .nb-dh span { font-size:11px; color:var(--text-dim); }

        .wpc-nb .nb-db { padding: 6px 0; }

        .wpc-nb .nb-di {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 15px;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 500;
          color: var(--text);
          text-decoration: none;
          background: transparent; border: none;
          width: 100%; text-align: left;
          cursor: pointer;
          transition: background .12s, color .12s;
        }
        .wpc-nb .nb-di:hover         { background: var(--accent-soft); color: var(--accent); }
        .wpc-nb .nb-di.danger        { color: var(--red); }
        .wpc-nb .nb-di.danger:hover  { background: var(--red-soft); color: var(--red); }

        .wpc-nb .nb-dsep { height: 1px; background: var(--border); margin: 4px 0; }
      `}</style>

      {dialogueType === "notification" && <NotificationDialog />}

      <header className="wpc-nb">

        {/* ── Search bar ── */}
        <div className="nb-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input type="text" placeholder="Search users, chats, reports…" />
        </div>

        <div className="nb-space" />

        {/* ── Right icons + user ── */}
        <div className="nb-icons">

          {/* Notification */}
          <button className="nb-icon" onClick={() => handleNotify(admin?._id)} title="Notifications">
            <div className="nb-dot" />
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
          </button>

          {/* Messages */}
          <button className="nb-icon" title="Messages">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </button>

          {/* Settings */}
          {/* <button className="nb-icon" onClick={() => router.push("/Setting")} title="Settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17"
              viewBox="0 0 24 24" fill="none" stroke="currentColor"
              strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button> */}

          <div className="nb-sep" />

          {/* User chip */}
          <div ref={dropdownRef} style={{ position: "relative" }}>
            <div className="nb-chip" onClick={() => setShowDropdown(v => !v)}>
              <div className="nb-ava">
                {admin?.image
                  ? <img src={adminImage} alt={adminName} />
                  : <span className="nb-ava-letter">{avatarLetter}</span>
                }
              </div>
              <div className="nb-uinfo">
                <span className="nb-uname">{adminName}</span>
                <span className="nb-uemail">{adminEmail}</span>
              </div>
              <svg className={`nb-chev${showDropdown ? " open" : ""}`}
                xmlns="http://www.w3.org/2000/svg" width="13" height="13"
                viewBox="0 0 24 24" fill="none" stroke="currentColor"
                strokeWidth="2.5" strokeLinecap="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>

            {showDropdown && (
              <div className="nb-drop">
                <div className="nb-dh">
                  <p>{adminName}</p>
                  <span>{adminEmail}</span>
                </div>
                <div className="nb-db">
                  <Link href="/adminProfile" className="nb-di"
                    onClick={() => setShowDropdown(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    My Profile
                  </Link>
                  <Link href="/Setting" className="nb-di"
                    onClick={() => setShowDropdown(false)}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    Settings
                  </Link>
                  <div className="nb-dsep" />
                  <button className="nb-di danger" onClick={handleLogout}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16 17 21 12 16 7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </header>
    </>
  );
};

export default Navbar;