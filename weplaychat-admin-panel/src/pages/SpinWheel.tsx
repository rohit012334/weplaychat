import RootLayout from "@/component/layout/Layout";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { useEffect, useMemo, useState } from "react";
import { setToast } from "@/utils/toastServices";

type RewardType = "coin" | "none";

type SpinWheelSlot = {
  label: string;
  rewardType: RewardType;
  rewardValue: number;
  weight: number;
  isActive: boolean;
};

type SpinWheelDoc = {
  key: string;
  slots: SpinWheelSlot[];
};

const emptySlots = (): SpinWheelSlot[] =>
  Array.from({ length: 8 }).map(() => ({
    label: "",
    rewardType: "none",
    rewardValue: 0,
    weight: 1,
    isActive: true,
  }));

export default function SpinWheelPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wheelKey, setWheelKey] = useState<string>("default");
  const [slots, setSlots] = useState<SpinWheelSlot[]>(emptySlots());

  const activeCount = useMemo(() => slots.filter((s) => s.isActive && Number(s.weight) > 0).length, [slots]);

  const loadWheel = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiInstanceFetch.get("api/admin/spinWheel/get");
      if (!res?.status) {
        setToast("error", res?.message || "Failed to load spin wheel.");
        return;
      }
      const data: SpinWheelDoc | undefined = res?.data;
      setWheelKey(data?.key || "default");
      const incoming = Array.isArray(data?.slots) ? data!.slots : [];
      setSlots(incoming.length === 8 ? incoming : emptySlots());
    } catch (e: any) {
      setToast("error", e?.message || "Failed to load spin wheel.");
    } finally {
      setIsLoading(false);
    }
  };

  const saveWheel = async () => {
    setIsSaving(true);
    try {
      const payload = {
        slots: slots.map((s) => ({
          label: (s?.label ?? "").toString(),
          rewardType: (s?.rewardType === "coin" || s?.rewardType === "none") ? s.rewardType : "none",
          rewardValue: Number.isFinite(Number(s?.rewardValue)) ? Number(s.rewardValue) : 0,
          weight: Number.isFinite(Number(s?.weight)) ? Number(s.weight) : 1,
          isActive: Boolean(s?.isActive),
        })),
      };

      const res: any = await apiInstanceFetch.patch("api/admin/spinWheel/update", payload);
      if (!res?.status) {
        setToast("error", res?.message || "Failed to update spin wheel.");
        return;
      }
      setToast("success", res?.message || "Spin wheel updated.");
      const updated: SpinWheelDoc | undefined = res?.data;
      if (updated?.slots?.length === 8) setSlots(updated.slots);
    } catch (e: any) {
      setToast("error", e?.message || "Failed to update spin wheel.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    loadWheel();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateSlot = (idx: number, patch: Partial<SpinWheelSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .sw-page {
          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: #f4f5fb;
          min-height: 100vh;
          box-sizing: border-box;
        }

        .sw-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 18px;
        }
        .sw-title-wrap { display: flex; align-items: center; gap: 12px; }
        .sw-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, #6366f1, #a855f7);
          flex-shrink: 0;
        }
        .sw-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #1e2235;
          margin: 0;
        }
        .sw-sub { font-size: 12px; color: #a0a8c0; margin: 2px 0 0; }

        .sw-actions { display: flex; align-items: center; gap: 10px; }
        .sw-btn {
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
          padding: 10px 16px;
          border-radius: 12px;
          border: 1px solid #e8eaf2;
          background: #fff;
          color: #1e2235;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 1px 10px rgba(99,102,241,0.06);
          transition: transform .12s ease, box-shadow .12s ease, border-color .12s ease;
          min-width: 110px;
        }
        .sw-btn:hover { transform: translateY(-1px); border-color: rgba(99,102,241,0.25); box-shadow: 0 4px 18px rgba(99,102,241,0.10); }
        .sw-btn.primary {
          border: none;
          color: #fff;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          box-shadow: 0 6px 18px rgba(99,102,241,0.28);
        }
        .sw-btn:disabled { opacity: .6; cursor: not-allowed; transform: none; }

        .sw-grid {
          display: grid;
          grid-template-columns: 1fr 360px;
          gap: 16px;
        }
        @media (max-width: 1100px) {
          .sw-grid { grid-template-columns: 1fr; }
        }

        .sw-card {
          background: #ffffff;
          border: 1px solid #e8eaf2;
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }
        .sw-card-head {
          padding: 14px 18px;
          border-bottom: 1px solid #e8eaf2;
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }
        .sw-card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1e2235;
          margin: 0;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .sw-badge {
          display: inline-flex;
          align-items: center;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 800;
          background: rgba(99,102,241,0.09);
          color: #6366f1;
          border: 1px solid rgba(99,102,241,0.20);
          white-space: nowrap;
        }

        .sw-list { padding: 14px 18px 18px; }
        .sw-slot {
          border: 1px solid #e8eaf2;
          border-radius: 14px;
          padding: 12px;
          display: grid;
          grid-template-columns: 64px 1.4fr 120px 120px 120px 94px;
          gap: 10px;
          align-items: center;
          margin-bottom: 10px;
          background: #fff;
        }
        @media (max-width: 1100px) {
          .sw-slot {
            grid-template-columns: 64px 1fr 1fr;
            grid-auto-rows: auto;
          }
          .sw-slot .sw-col-wide { grid-column: 1 / -1; }
        }
        .sw-idx {
          width: 46px; height: 46px;
          border-radius: 12px;
          background: rgba(99,102,241,0.09);
          border: 1px solid rgba(99,102,241,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 900;
          color: #6366f1;
        }
        .sw-field label {
          display: block;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: .6px;
          text-transform: uppercase;
          color: #a0a8c0;
          margin-bottom: 6px;
        }
        .sw-field input,
        .sw-field select {
          width: 100%;
          height: 40px;
          border-radius: 12px;
          border: 1px solid #e8eaf2;
          padding: 0 12px;
          outline: none;
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 600;
          color: #1e2235;
          background: #ffffff;
        }
        .sw-field input:focus,
        .sw-field select:focus {
          border-color: rgba(99,102,241,0.35);
          box-shadow: 0 0 0 4px rgba(99,102,241,0.10);
        }
        .sw-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          justify-content: flex-start;
        }
        .sw-switch {
          width: 46px;
          height: 26px;
          border-radius: 999px;
          background: rgba(100,116,139,0.18);
          border: 1px solid rgba(100,116,139,0.18);
          position: relative;
          cursor: pointer;
          transition: background .15s ease, border-color .15s ease;
          flex-shrink: 0;
        }
        .sw-switch.on {
          background: rgba(34,197,94,0.20);
          border-color: rgba(34,197,94,0.35);
        }
        .sw-knob {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 2px 10px rgba(15,23,42,0.18);
          transition: transform .15s ease;
        }
        .sw-switch.on .sw-knob { transform: translateX(20px); }

        .sw-hint {
          padding: 14px 18px 18px;
          color: #64748b;
          font-size: 13px;
          line-height: 1.5;
        }
        .sw-kv {
          margin-top: 10px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .sw-kv .box {
          border: 1px solid #e8eaf2;
          border-radius: 14px;
          padding: 12px;
          background: #fff;
        }
        .sw-kv .k { font-size: 11px; font-weight: 900; letter-spacing: .6px; text-transform: uppercase; color: #a0a8c0; }
        .sw-kv .v { margin-top: 6px; font-size: 14px; font-weight: 800; color: #1e2235; }
      `}</style>

      <div className="sw-page">
        <div className="sw-header">
          <div className="sw-title-wrap">
            <div className="sw-pill" />
            <div>
              <h1 className="sw-title">Spin Wheel</h1>
              <p className="sw-sub">Configure 8 slots (label, reward, weight, active)</p>
            </div>
          </div>

          <div className="sw-actions">
            <button className="sw-btn" onClick={loadWheel} disabled={isLoading || isSaving}>
              {isLoading ? "Loading…" : "Reload"}
            </button>
            <button className="sw-btn primary" onClick={saveWheel} disabled={isLoading || isSaving}>
              {isSaving ? "Saving…" : "Save"}
            </button>
          </div>
        </div>

        <div className="sw-grid">
          <div className="sw-card">
            <div className="sw-card-head">
              <p className="sw-card-title">
                Slots
                <span className="sw-badge">8 required</span>
              </p>
              <span className="sw-badge">{activeCount} active</span>
            </div>

            <div className="sw-list">
              {slots.map((s, idx) => (
                <div className="sw-slot" key={idx}>
                  <div className="sw-idx">{idx + 1}</div>

                  <div className="sw-field sw-col-wide">
                    <label>Label</label>
                    <input
                      value={s.label}
                      onChange={(e) => updateSlot(idx, { label: e.target.value })}
                      placeholder="e.g. +50 Coins"
                      maxLength={40}
                    />
                  </div>

                  <div className="sw-field">
                    <label>Reward</label>
                    <select
                      value={s.rewardType}
                      onChange={(e) => {
                        const rt = (e.target.value as RewardType) || "none";
                        updateSlot(idx, { rewardType: rt, rewardValue: rt === "coin" ? s.rewardValue : 0 });
                      }}
                    >
                      <option value="none">None</option>
                      <option value="coin">Coin</option>
                    </select>
                  </div>

                  <div className="sw-field">
                    <label>Value</label>
                    <input
                      type="number"
                      value={Number(s.rewardValue)}
                      onChange={(e) => updateSlot(idx, { rewardValue: Number(e.target.value) })}
                      disabled={s.rewardType !== "coin"}
                      min={0}
                      step={1}
                      placeholder="0"
                    />
                  </div>

                  <div className="sw-field">
                    <label>Weight</label>
                    <input
                      type="number"
                      value={Number(s.weight)}
                      onChange={(e) => updateSlot(idx, { weight: Number(e.target.value) })}
                      min={0}
                      step={1}
                      placeholder="1"
                    />
                  </div>

                  <div className="sw-field">
                    <label>Active</label>
                    <div className="sw-toggle">
                      <div
                        className={`sw-switch ${s.isActive ? "on" : ""}`}
                        role="button"
                        tabIndex={0}
                        onClick={() => updateSlot(idx, { isActive: !s.isActive })}
                        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && updateSlot(idx, { isActive: !s.isActive })}
                      >
                        <div className="sw-knob" />
                      </div>
                      <span style={{ fontWeight: 800, color: s.isActive ? "#16a34a" : "#94a3b8" }}>
                        {s.isActive ? "On" : "Off"}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="sw-card">
            <div className="sw-card-head">
              <p className="sw-card-title">Info</p>
              <span className="sw-badge">key: {wheelKey}</span>
            </div>
            <div className="sw-hint">
              - **Weight** controls probability among active slots (higher = more chance).<br />
              - **Coin** rewards add coins to user on play.<br />
              - Setting weight to 0 effectively disables a slot even if active.

              <div className="sw-kv">
                <div className="box">
                  <div className="k">Total slots</div>
                  <div className="v">8</div>
                </div>
                <div className="box">
                  <div className="k">Active slots</div>
                  <div className="v">{activeCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

SpinWheelPage.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

