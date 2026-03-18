import { FakeHost } from "@/component/host/FakeHost";
import { RealHost } from "@/component/host/RealHost";
import RootLayout from "@/component/layout/Layout";
import { routerChange } from "@/utils/Common";
import { hostTypes } from "@/utils/extra";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import image from "@/assets/images/bannerImage.png";
import { getMessage } from "@/store/hostSlice";
import { openMessageDialog } from "@/store/dialogSlice";
import MessageDialog from "@/component/host/MessageDialog";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";

const Host = () => {
  const dispatch = useDispatch();
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const [type, setType] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const storedType = localStorage.getItem("hostTypeData") || "real_host";
    if (storedType) setType(storedType);
  }, []);

  useEffect(() => {
    if (type) localStorage.setItem("hostTypeData", type);
  }, [type]);

  useEffect(() => {
    routerChange("/Host", "hostTypeData", router);
  }, [router]);

  const handleMaleMessage = async () => {
    const data = await dispatch(getMessage({ gender: 1 }));
    dispatch(openMessageDialog({
      type: "messageHost", gender: "male",
      data: data?.payload?.data?.message.toString(),
    }));
  };

  const handleFemaleMessage = async () => {
    const data = await dispatch(getMessage({ gender: 2 }));
    dispatch(openMessageDialog({
      type: "messageHost", gender: "female",
      data: data?.payload?.data?.message.toString(),
    }));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .ht-page {
          --ac:  #6366f1; --ac2: #a855f7;
          --as:  rgba(99,102,241,0.09); --am: rgba(99,102,241,0.16); --ag: rgba(99,102,241,0.20);
          --bd:  #e8eaf2; --tx: #64748b; --td: #1e2235; --dim: #a0a8c0;
          --wh:  #ffffff; --bg: #f4f5fb;
          --pink: #ec4899; --pink-s: rgba(236,72,153,0.10);
          font-family: 'Outfit', sans-serif;
          padding: 24px 24px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── TOP BAR ── */
        .ht-page .ht-topbar {
          background: var(--wh);
          border: 1px solid var(--bd);
          border-radius: 18px;
          padding: 14px 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 16px rgba(99,102,241,.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        .ht-page .ht-topbar::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: linear-gradient(180deg, var(--ac), var(--ac2));
          border-radius: 0 3px 3px 0;
        }

        /* left: title + tabs */
        .ht-page .ht-topbar-l {
          display: flex; align-items: center; gap: 14px; padding-left: 10px; flex-wrap: wrap;
        }
        .ht-page .ht-title-wrap {
          display: flex; align-items: center; gap: 8px;
        }
        .ht-page .ht-pill {
          width: 4px; height: 22px; border-radius: 4px; flex-shrink: 0;
          background: linear-gradient(180deg, var(--ac), var(--ac2));
        }
        .ht-page .ht-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px; font-weight: 700; color: var(--td); margin: 0;
        }

        /* tab separator */
        .ht-page .ht-sep {
          width: 1px; height: 24px; background: var(--bd); flex-shrink: 0;
        }

        /* tab buttons */
        .ht-page .ht-tabs {
          display: flex; align-items: center; gap: 6px;
        }
        .ht-page .ht-tab {
          padding: 7px 16px; border-radius: 20px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 600;
          border: 1.5px solid var(--bd); background: var(--bg); color: var(--tx);
          cursor: pointer; transition: all .15s; white-space: nowrap;
        }
        .ht-page .ht-tab:hover {
          border-color: var(--am); color: var(--ac); background: var(--as);
        }
        .ht-page .ht-tab.active {
          background: linear-gradient(135deg, var(--ac), var(--ac2));
          color: #fff; border-color: transparent;
          box-shadow: 0 3px 10px var(--ag);
        }

        /* right: message buttons (fake_host only) */
        .ht-page .ht-topbar-r {
          display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
        }
        .ht-page .ht-msg-btn {
          display: inline-flex; align-items: center; gap: 7px;
          border: none; border-radius: 12px; padding: 9px 16px;
          font-family: 'Outfit', sans-serif; font-size: 13px; font-weight: 700;
          cursor: pointer; white-space: nowrap;
          transition: transform .13s, box-shadow .13s;
        }
        .ht-page .ht-msg-btn:hover { transform: translateY(-2px); }
        .ht-page .ht-msg-btn.male {
          background: linear-gradient(135deg, var(--ac), var(--ac2));
          color: #fff;
          box-shadow: 0 3px 10px rgba(99,102,241,.28);
        }
        .ht-page .ht-msg-btn.male:hover { box-shadow: 0 6px 18px rgba(99,102,241,.38); }
        .ht-page .ht-msg-btn.female {
          background: linear-gradient(135deg, #ec4899, #f472b6);
          color: #fff;
          box-shadow: 0 3px 10px rgba(236,72,153,.28);
        }
        .ht-page .ht-msg-btn.female:hover { box-shadow: 0 6px 18px rgba(236,72,153,.38); }

        /* gender icons */
        .ht-page .ht-gender-icon {
          width: 22px; height: 22px; border-radius: 6px;
          display: inline-flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.20); font-size: 12px; flex-shrink: 0;
        }

        /* ── CONTENT CARD ── */
        .ht-page .ht-content {
          background: var(--wh);
          border: 1px solid var(--bd);
          border-radius: 18px;
          box-shadow: 0 2px 18px rgba(99,102,241,.06);
          overflow: hidden;
        }
        .ht-page .ht-content-head {
          padding: 13px 22px;
          border-bottom: 1px solid var(--bd);
          background: linear-gradient(135deg, rgba(99,102,241,.04), rgba(168,85,247,.02));
          display: flex; align-items: center; gap: 8px;
        }
        .ht-page .ht-content-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--ac), var(--ac2));
        }
        .ht-page .ht-content-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 700; color: var(--td);
        }
        .ht-page .ht-content-badge {
          margin-left: auto;
          background: var(--as); color: var(--ac);
          font-size: 11px; font-weight: 700;
          padding: 2px 10px; border-radius: 20px;
          border: 1px solid var(--am);
        }
        .ht-page .ht-content-inner {
          padding: 0;
        }
      `}</style>

      <div className="ht-page">
        {dialogueType === "messageHost" && <MessageDialog />}

        {/* ── TOP BAR ── */}
        <div className="ht-topbar">

          {/* Left: title + type tabs */}
          <div className="ht-topbar-l">
            <div className="ht-title-wrap">
              <div className="ht-pill" />
              <h1 className="ht-title">Host Management</h1>
            </div>

            <div className="ht-sep" />

            <div className="ht-tabs">
              {hostTypes.map((item, i) => (
                <button
                  key={i}
                  type="button"
                  className={`ht-tab ${type === item.value ? "active" : ""}`}
                  onClick={() => setType(item.value)}
                >
                  {item.value === "real_host" ? "🎙️" : "🤖"} {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: message buttons (only for fake_host) */}
          {type === "fake_host" && (
            <div className="ht-topbar-r">
              <button className="ht-msg-btn male" onClick={handleMaleMessage}>
                <span className="ht-gender-icon">♂</span>
                Male Message
              </button>
              <button className="ht-msg-btn female" onClick={handleFemaleMessage}>
                <span className="ht-gender-icon">♀</span>
                Female Message
              </button>
            </div>
          )}
        </div>

        {/* ── CONTENT CARD ── */}
        <div className="ht-content">
          <div className="ht-content-head">
            <div className="ht-content-dot" />
            <span className="ht-content-title">
              {type === "real_host" ? "Real Hosts" : "Fake Hosts"}
            </span>
            <span className="ht-content-badge">
              {type === "real_host" ? "🎙️ Live" : "🤖 Virtual"}
            </span>
          </div>
          <div className="ht-content-inner">
            {type === "real_host" && <RealHost type={type} />}
            {type === "fake_host" && <FakeHost type={type} />}
          </div>
        </div>
      </div>
    </>
  );
};

Host.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Host;