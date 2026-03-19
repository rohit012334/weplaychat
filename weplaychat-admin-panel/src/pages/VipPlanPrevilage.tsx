import RootLayout from "@/component/layout/Layout";
import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { baseURL } from "../utils/config";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getVipPlanBeneFits } from "@/store/vipPlanSlice";
import VipPlanBenefitDialog from "@/component/VipPlanBenefitDialog";
import { isSkeleton } from "@/utils/allSelector";

const VipPlanPrevilage = () => {
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { vipPlanBenefits }: any = useSelector((state: RootStore) => state.vipPlan);
  const roleSkeleton = useSelector<any>(isSkeleton);
  const dispatch = useAppDispatch();

  const [activeLevel, setActiveLevel] = useState(1);

  useEffect(() => {
    dispatch(getVipPlanBeneFits());
  }, [dispatch]);

  // Find benefits for the active level from the array returned by backend
  const currentPrivilege = Array.isArray(vipPlanBenefits) 
    ? vipPlanBenefits.find((p: any) => p.level === activeLevel) 
    : vipPlanBenefits;

  const getBenefitList = (priv: any) => [
    { title: "VIP Frame Badge", value: "Badge", icon: priv?.vipFrameBadge ? baseURL + priv.vipFrameBadge : "", color: "amber", isImage: true },
    { title: "Audio Call Discount", value: priv?.audioCallDiscount, color: "purple", suffix: "%" },
    { title: "Video Call Discount", value: priv?.videoCallDiscount, color: "purple", suffix: "%" },
    { title: "Random Match Discount", value: priv?.randomMatchCallDiscount, color: "green", suffix: "%" },
    { title: "Top-up Coin Bonus", value: priv?.topUpCoinBonus, color: "amber", suffix: "%" },
    { title: "Free Messages", value: priv?.freeMessages, color: "green", suffix: "" },
    { title: "Mute Availability", value: priv?.muteAvailability ? "Yes" : "No", color: priv?.muteAvailability ? "green" : "red" },
    { title: "Special Name", value: priv?.specialName ? "Active" : "None", color: priv?.specialName ? "amber" : "gray" },
    { title: "Free Entry", value: priv?.freeEntry ? "Yes" : "No", color: priv?.freeEntry ? "green" : "red" },
    { title: "Room Authority", value: priv?.roomAuthority ? "High" : "None", color: priv?.roomAuthority ? "amber" : "gray" },
    { title: "Unlimited Chat", value: priv?.unlimitedChat ? "Unlimited" : "Limited", color: priv?.unlimitedChat ? "green" : "gray" },
    { title: "Member Tag", value: priv?.memberTag ? "Badge" : "None", color: priv?.memberTag ? "amber" : "gray" },
    { title: "Profile Edit", value: priv?.profileEdit ? "Allowed" : "Restricted", color: priv?.profileEdit ? "green" : "red" },
    { title: "Kick Ability", value: priv?.kick ? "Authorized" : "None", color: priv?.kick ? "red" : "gray" },
    { title: "Room Backgrounds", value: priv?.backgroundAdd ? "Available" : "Standard", color: priv?.backgroundAdd ? "purple" : "gray" },
    { title: "Hide Mode", value: priv?.hide ? "Enabled" : "Disabled", color: priv?.hide ? "green" : "red" },
    { title: "Mute Others", value: priv?.canMuteOthers ? "Yes" : "No", color: priv?.canMuteOthers ? "red" : "gray" },
  ];

  const benefits = getBenefitList(currentPrivilege);

  const colorMap: Record<string, any> = {
    amber:  { bg: "rgba(245,158,11,0.10)", border: "rgba(245,158,11,0.22)", color: "#f59e0b", glow: "rgba(245,158,11,0.15)" },
    purple: { bg: "rgba(168,85,247,0.10)", border: "rgba(168,85,247,0.22)", color: "#a855f7", glow: "rgba(168,85,247,0.15)" },
    green:  { bg: "rgba(16,185,129,0.10)", border: "rgba(16,185,129,0.22)", color: "#10b981", glow: "rgba(16,185,129,0.15)" },
    red:    { bg: "rgba(239, 68, 68, 0.10)", border: "rgba(239, 68, 68, 0.22)", color: "#ef4444", glow: "rgba(239, 68, 68, 0.15)" },
    gray:   { bg: "rgba(107, 114, 128, 0.10)", border: "rgba(107, 114, 128, 0.22)", color: "#6b7280", glow: "rgba(107, 114, 128, 0.15)" },
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');
        .vpp-page {
          --accent: #6366f1; --accent2: #a855f7; --amber: #f59e0b; --border: #e8eaf2;
          --txt-dark: #1e2235; --txt-dim: #a0a8c0; --bg: #f4f5fb;
          font-family: 'Outfit', sans-serif; padding: 28px; background: var(--bg); min-height: 100vh;
        }
        .vpp-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
        .vpp-title { font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 700; color: var(--txt-dark); margin: 0; }
        .vpp-tabs { display: flex; gap: 10px; margin-bottom: 24px; background: #fff; padding: 6px; border-radius: 12px; border: 1px solid var(--border); width: fit-content; }
        .vpp-tab { padding: 8px 24px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; border: none; background: transparent; color: var(--txt-dim); }
        .vpp-tab.active { background: linear-gradient(135deg, var(--amber), #f97316); color: #fff; box-shadow: 0 4px 12px rgba(245,158,11,0.25); }
        .vpp-edit-btn { background: linear-gradient(135deg, var(--accent), var(--accent2)); color: #fff; padding: 10px 24px; border-radius: 10px; border: none; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
        .vpp-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; }
        .vpp-card { background: #fff; border-radius: 16px; padding: 20px; border: 1.5px solid var(--border); display: flex; align-items: center; gap: 16px; transition: transform 0.2s; }
        .vpp-card:hover { transform: translateY(-3px); }
        .vpp-card-icon { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justify-content: center; }
        .vpp-card-title { font-size: 12px; font-weight: 600; color: var(--txt-dim); text-transform: uppercase; margin: 0 0 4px; }
        .vpp-card-val { font-family: 'Rajdhani', sans-serif; font-size: 22px; font-weight: 700; margin: 0; }
      `}</style>

      {dialogueType === "banner" && <VipPlanBenefitDialog />}

      <div className="vpp-page">
        <div className="vpp-header">
          <div>
            <h1 className="vpp-title">User Privileges Control</h1>
            <p style={{ color: "var(--txt-dim)", margin: 0 }}>Manage benefits for each VIP Tier</p>
          </div>
          <button className="vpp-edit-btn" onClick={() => dispatch(openDialog({ type: "banner", data: currentPrivilege || { level: activeLevel } }))}>
            Edit {activeLevel === 1 ? "VIP" : activeLevel === 2 ? "VVIP" : "SVIP"} Privileges
          </button>
        </div>

        <div className="vpp-tabs">
          {[1, 2, 3].map(lvl => (
            <button key={lvl} className={`vpp-tab ${activeLevel === lvl ? "active" : ""}`} onClick={() => setActiveLevel(lvl)}>
              {lvl === 1 ? "VIP" : lvl === 2 ? "VVIP" : "SVIP"}
            </button>
          ))}
        </div>

        <div className="vpp-grid">
          {benefits.map((card, i) => {
            const c = colorMap[card.color] || colorMap.gray;
            return (
              <div key={i} className="vpp-card" style={{ borderColor: c.border }}>
                <div className="vpp-card-icon" style={{ background: c.bg, border: `1px solid ${c.border}` }}>
                  {card.isImage && card.icon ? (
                    <img src={card.icon} width={24} height={24} alt="" />
                  ) : (
                    <span style={{ color: c.color, fontSize: "18px", fontWeight: "bold" }}>{card.title[0]}</span>
                  )}
                </div>
                <div>
                  <p className="vpp-card-title">{card.title}</p>
                  <p className="vpp-card-val" style={{ color: c.color }}>
                    {card.value ?? "—"}
                    {card.suffix && <span style={{ fontSize: "14px", marginLeft: "2px" }}>{card.suffix}</span>}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

VipPlanPrevilage.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default VipPlanPrevilage;