import RootLayout from "@/component/layout/Layout";
import { RootStore, useAppDispatch } from "@/store/store";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import HostInfo from "@/pages/Host/HostInfo";
import { useRouter } from "next/router";
import { routerChange } from "@/utils/Common";

const hostInfoPageStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .hip-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 48px;
  }

  /* ── Page header ── */
  .hip-page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .hip-header-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .hip-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all .15s;
    box-shadow: 0 1px 4px rgba(99,102,241,0.06);
  }
  .hip-back-btn:hover {
    background: #f4f5fb;
    border-color: #6366f1;
    color: #6366f1;
    transform: translateX(-2px);
  }

  .hip-page-title {
    font-family: 'Nunito', sans-serif;
    font-size: 22px;
    font-weight: 900;
    color: #1e2235;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hip-title-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    animation: hipDotPulse 2s ease-in-out infinite;
  }

  @keyframes hipDotPulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.5); opacity: 0.5; }
  }

  /* ── Tab bar ── */
  .hip-tabs {
    display: flex;
    gap: 0;
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    border-radius: 12px;
    padding: 4px;
    width: fit-content;
    box-shadow: 0 2px 10px rgba(99,102,241,0.05);
  }

  .hip-tab {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 8px 18px;
    border-radius: 9px;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    border: 1px solid transparent;
    background: transparent;
    color: #a0a8c0;
    transition: all .18s;
    white-space: nowrap;
  }

  .hip-tab:hover:not(.hip-tab-active) {
    color: #6366f1;
    background: rgba(99,102,241,0.05);
  }

  .hip-tab-active {
    background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.07));
    border-color: rgba(99,102,241,0.22) !important;
    color: #6366f1 !important;
    box-shadow: 0 2px 8px rgba(99,102,241,0.10);
  }

  /* ── Content wrapper ── */
  .hip-content {
    animation: hipFadeIn .22s ease;
  }

  @keyframes hipFadeIn {
    from { opacity: 0; transform: translateY(6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`;

const HostInfoPage = () => {
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const router   = useRouter();
  const dispatch = useAppDispatch();
  const type1    = router.query.type;

  const [type, setType] = useState<string>("profile");

  useEffect(() => {
    routerChange("/Host/HostInfoPage", "hostInfoType", router);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedType = localStorage.getItem("hostInfoType");
      if (storedType) setType(storedType);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("hostInfoType", type);
    }
  }, [type]);

  const showContent = type === "profile" || type1 === "fakeHost";

  return (
    <>
      <style>{hostInfoPageStyle}</style>

      <div className={`hip-root ${dialogueType === "doctor" ? "d-none" : ""}`}>

        {/* ── Page Header ── */}
        <div className="hip-page-header">
          <div className="hip-header-left">
            <button className="hip-back-btn" onClick={() => router.back()}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="19" y1="12" x2="5" y2="12"/>
                <polyline points="12 19 5 12 12 5"/>
              </svg>
              Back
            </button>

            <div className="hip-page-title">
              <span className="hip-title-dot" />
              Host Info
            </div>
          </div>

          {/* Tab bar — only show if not fakeHost */}
          {type1 !== "fakeHost" && (
            <div className="hip-tabs">
              <button
                className={`hip-tab ${type === "profile" ? "hip-tab-active" : ""}`}
                onClick={() => setType("profile")}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile
              </button>
            </div>
          )}
        </div>

        {/* ── Content ── */}
        {showContent && (
          <div className="hip-content" key={type}>
            <HostInfo type1={type1} />
          </div>
        )}

      </div>
    </>
  );
};

HostInfoPage.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default HostInfoPage;