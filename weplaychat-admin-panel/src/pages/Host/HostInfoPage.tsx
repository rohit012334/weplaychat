import RootLayout from "@/component/layout/Layout";
import { RootStore, useAppDispatch } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HostInfo from "@/pages/Host/HostInfo";
import HostFollowerList from "./HostFollowerList";
import UserBlock from "./UserBlock";
import { useRouter } from "next/router";
import { routerChange } from "@/utils/Common";

const tabs = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "follower list", label: "Follower List", icon: "👥" },
  { key: "user_block", label: "User Block", icon: "🚫" },
];

const HostInfoPage = () => {
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const router = useRouter();
  const type1 = router.query.type;
  const dispatch = useAppDispatch();
  const [type, setType] = useState<string>("profile");

  useEffect(() => { routerChange("/Host/HostInfoPage", "hostInfoType", router); }, [router]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const s = localStorage.getItem("hostInfoType");
      if (s) setType(s);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("hostInfoType", type);
  }, [type]);

  const isFake = type1 === "fakeHost";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .hip-page {
          --ac:  #6366f1; --ac2: #a855f7;
          --as:  rgba(99,102,241,0.09); --am: rgba(99,102,241,0.16); --ag: rgba(99,102,241,0.22);
          --bd:  #e8eaf2; --tx: #64748b; --td: #1e2235; --dim: #a0a8c0;
          --wh:  #ffffff; --bg: #f4f5fb;
          font-family: 'Outfit', sans-serif;
          padding: 24px 24px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── top bar ── */
        .hip-page .hip-topbar {
          background: var(--wh);
          border: 1px solid var(--bd);
          border-radius: 18px;
          padding: 14px 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 16px rgba(99,102,241,.06);
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          position: relative;
          overflow: hidden;
        }
        .hip-page .hip-topbar::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: linear-gradient(180deg, var(--ac), var(--ac2));
          border-radius: 0 3px 3px 0;
        }

        /* title */
        .hip-page .hip-title-wrap {
          display: flex; align-items: center; gap: 8px; padding-left: 10px;
        }
        .hip-page .hip-pill {
          width: 4px; height: 22px; border-radius: 4px; flex-shrink: 0;
          background: linear-gradient(180deg, var(--ac), var(--ac2));
        }
        .hip-page .hip-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px; font-weight: 700; color: var(--td); margin: 0;
        }
        .hip-page .hip-type-badge {
          padding: 3px 11px; border-radius: 20px;
          font-size: 11.5px; font-weight: 700;
          display: inline-flex; align-items: center; gap: 5px;
        }
        .hip-page .hip-type-badge.real { background: rgba(16,185,129,.10); color: #10b981; }
        .hip-page .hip-type-badge.fake { background: rgba(168,85,247,.10); color: #a855f7; }

        /* separator */
        .hip-page .hip-sep {
          width: 1px; height: 24px; background: var(--bd); flex-shrink: 0;
        }

        /* tabs */
        .hip-page .hip-tabs {
          display: flex; align-items: center; gap: 6px; flex-wrap: wrap;
        }
        .hip-page .hip-tab {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 16px; border-radius: 20px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          border: 1.5px solid var(--bd); background: var(--bg); color: var(--tx);
          cursor: pointer; transition: all .15s; white-space: nowrap;
          position: relative; overflow: hidden;
        }
        .hip-page .hip-tab:hover {
          border-color: var(--am); color: var(--ac); background: var(--as);
        }
        .hip-page .hip-tab.active {
          background: linear-gradient(135deg, var(--ac), var(--ac2));
          color: #fff; border-color: transparent;
          box-shadow: 0 3px 10px var(--ag);
        }
        .hip-page .hip-tab.active::after {
          content: '';
          position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);
          width: 20px; height: 3px; border-radius: 3px 3px 0 0;
          background: rgba(255,255,255,.4);
        }

        /* ── content wrapper ── */
        .hip-page .hip-content {
          background: var(--wh);
          border: 1px solid var(--bd);
          border-radius: 20px;
          box-shadow: 0 2px 18px rgba(99,102,241,.06);
          overflow: hidden;
          /* let child pages handle their own padding */
        }
        .hip-page .hip-content-head {
          padding: 13px 22px;
          border-bottom: 1px solid var(--bd);
          background: linear-gradient(135deg, rgba(99,102,241,.04), rgba(168,85,247,.02));
          display: flex; align-items: center; gap: 8px;
        }
        .hip-page .hip-content-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--ac), var(--ac2));
        }
        .hip-page .hip-content-label {
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 700; color: var(--td);
        }
      `}</style>

      <div
        className={`hip-page ${dialogueType === "doctor" ? "d-none" : ""}`}
      >
        {/* ── Top Bar ── */}
        <div className="hip-topbar">
          <div className="hip-title-wrap">
            <div className="hip-pill" />
            <h1 className="hip-title">Host Info</h1>
            <span className={`hip-type-badge ${isFake ? "fake" : "real"}`}>
              {isFake ? "🤖 Fake Host" : "🎙️ Real Host"}
            </span>
          </div>

          {/* tabs — only for real host */}
          {!isFake && (
            <>
              <div className="hip-sep" />
              <div className="hip-tabs">
                {tabs.map((t) => (
                  <button
                    key={t.key}
                    type="button"
                    className={`hip-tab ${type === t.key ? "active" : ""}`}
                    onClick={() => setType(t.key)}
                  >
                    {t.icon} {t.label}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Content Card ── */}
        <div className="hip-content">
          <div className="hip-content-head">
            <div className="hip-content-dot" />
            <span className="hip-content-label">
              {isFake
                ? "Fake Host Profile"
                : tabs.find((t) => t.key === type)?.label ?? "Profile"}
            </span>
          </div>

          {type === "profile" || isFake ? (
            <HostInfo type1={type1} />
          ) : type === "follower list" && !isFake ? (
            <HostFollowerList />
          ) : type === "user_block" && !isFake ? (
            <UserBlock />
          ) : null}
        </div>
      </div>
    </>
  );
};

HostInfoPage.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default HostInfoPage;