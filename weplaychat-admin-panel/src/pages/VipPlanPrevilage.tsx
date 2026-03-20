import Table from "@/extra/Table";
import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/images/delete.svg";
import EditIcon from "@/assets/images/edit.svg";
import { baseURL, getStorageUrl } from "@/utils/config";
import { getVipPlanBeneFits } from "@/store/vipPlanSlice";
import VipPlanBenefitDialog from "@/component/VipPlanBenefitDialog";
import React from "react";
import SvgaPlayer from "@/extra/SvgaPlayer";

const VipPlanPrevilage = () => {
    const dispatch = useDispatch();
    const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
    const { vipPlanBenefits: vipPrivileges } = useSelector((state: RootStore) => state.vipPlan);

    useEffect(() => {
        dispatch(getVipPlanBeneFits());
    }, [dispatch]);

    const renderPowerLabel = (label: string, active: boolean) => (
        <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "8px 12px",
            borderRadius: "10px",
            background: active ? "rgba(99,102,241,0.08)" : "#f8fafc",
            border: active ? "1px solid rgba(99,102,241,0.2)" : "1px solid #f1f5f9",
            opacity: active ? 1 : 0.5,
            transition: "0.2s"
        }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: active ? "#6366f1" : "#64748b" }}>{label}</span>
            {active ? (
                <svg width="14" height="14" fill="none" stroke="#6366f1" strokeWidth="3" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" /></svg>
            ) : (
                <svg width="14" height="14" fill="none" stroke="#cbd5e1" strokeWidth="3" viewBox="0 0 24 24"><path d="M18 6L6 18M6 6l12 12" /></svg>
            )}
        </div>
    );

    const levels = [
        { id: 1, name: "VIP", color: "#6366f1", bg: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)" },
        { id: 2, name: "VVIP", color: "#a855f7", bg: "linear-gradient(135deg, #a855f7 0%, #c084fc 100%)" },
        { id: 3, name: "SVIP", color: "#1e293b", bg: "linear-gradient(135deg, #0f172a 0%, #334155 100%)" }
    ];

    return (
        <>
            <style>{`
                .vip-wrap { padding: 40px; background: #f1f5f9; min-height: 100vh; font-family: 'Outfit', sans-serif; }
                .vip-header { margin-bottom: 40px; text-align: center; }
                .vip-header h1 { font-family: 'Rajdhani', sans-serif; font-size: 36px; font-weight: 800; color: #0f172a; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
                .vip-header p { color: #64748b; font-size: 16px; margin-top: 5px; }
                
                .vip-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; max-width: 1200px; margin: 0 auto; }
                .vip-card { background: #fff; border-radius: 24px; overflow: hidden; position: relative; border: 1px solid #e2e8f0; box-shadow: 0 10px 40px rgba(0,0,0,0.05); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
                .vip-card:hover { transform: translateY(-8px); box-shadow: 0 20px 60px rgba(0,0,0,0.1); }
                
                .vip-card-header { padding: 30px 24px; color: #fff; text-align: center; position: relative; }
                .vip-badge-box { width: 70px; height: 70px; background: rgba(255,255,255,0.2); backdrop-filter: blur(10px); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; border: 1px solid rgba(255,255,255,0.3); }
                .level-title { font-size: 24px; font-weight: 800; font-family: 'Rajdhani', sans-serif; letter-spacing: 2px; }
                
                .vip-card-body { padding: 24px; background: #fff; }
                .vip-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
                .vip-stat-item { background: #f8fafc; padding: 12px; border-radius: 12px; border: 1px solid #f1f5f9; }
                .stat-label { font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; margin-bottom: 4px; }
                .stat-val { font-size: 16px; font-weight: 800; color: #1e293b; }
                
                .powers-section { margin-top: 20px; display: grid; grid-template-columns: 1fr; gap: 8px; }
                .edit-priv-btn { width: 100%; padding: 14px; border-radius: 14px; background: #0f172a; color: #fff; border: none; cursor: pointer; font-weight: 700; margin-top: 24px; transition: 0.2s; box-shadow: 0 10px 15px -3px rgba(15,23,42,0.1); }
                .edit-priv-btn:hover { background: #1e293b; letter-spacing: 0.5px; }
            `}</style>

            <div className="vip-wrap">
                {dialogue && dialogueType === "vipPrivilege" && <VipPlanBenefitDialog />}

                <div className="vip-header">
                    <h1>VIP PRIVILEGE MANAGEMENT</h1>
                    <p>Customize specific benefits and discount tiers for all club levels</p>
                </div>

                <div className="vip-grid">
                    {levels.map((lvl) => {
                        const data = vipPrivileges?.find((v: any) => v.level === lvl.id) || {};
                        return (
                            <div key={lvl.id} className="vip-card">
                                <div className="vip-card-header" style={{ background: lvl.bg }}>
                                    <div style={{ display: "flex", justifyContent: "center", gap: "12px", marginBottom: "15px" }}>
                                        <div className="vip-badge-box" style={{ margin: 0 }}>
                                            {data.vipFrameBadge ? (
                                                data.vipFrameBadge.toLowerCase().endsWith(".svga") ? (
                                                    <SvgaPlayer url={getStorageUrl(data.vipFrameBadge)} style={{ width: "80%", height: "80%" }} />
                                                ) : data.vipFrameBadge.toLowerCase().endsWith(".mp4") ? (
                                                    <video src={getStorageUrl(data.vipFrameBadge)} style={{ width: "80%", height: "80%", objectFit: "contain" }} autoPlay loop muted />
                                                ) : (
                                                    <img src={getStorageUrl(data.vipFrameBadge)} style={{ width: "80%", height: "80%", objectFit: "contain" }} alt="Badge" />
                                                )
                                            ) : (
                                                <svg width="32" height="32" fill="#fff" viewBox="0 0 16 16"><path d="M7.646 6.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1-.708.708L8 7.707 2.354 13.354a.5.5 0 1 1-.708-.708l6-6z" /></svg>
                                            )}
                                        </div>
                                    </div>
                                    <div className="level-title" style={{ color: lvl.id === 3 ? "#fbbf24" : "#fff" }}>{lvl.name}</div>
                                    <div style={{ fontSize: "12px", opacity: 0.8 }}>{data.name || lvl.name} Privilege</div>
                                    {data.freeEntryImage && (
                                        <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", alignItems: "center" }}>
                                            <div className="vip-badge-box" style={{ margin: "0 0 8px 0", background: "rgba(255,255,255,0.1)" }}>
                                                {data.freeEntryImage.toLowerCase().endsWith(".svga") ? (
                                                    <SvgaPlayer url={getStorageUrl(data.freeEntryImage)} style={{ width: "80%", height: "80%" }} />
                                                ) : data.freeEntryImage.toLowerCase().endsWith(".mp4") ? (
                                                    <video src={getStorageUrl(data.freeEntryImage)} style={{ width: "80%", height: "80%", objectFit: "contain" }} autoPlay loop muted />
                                                ) : (
                                                    <img src={getStorageUrl(data.freeEntryImage)} style={{ width: "80%", height: "80%", objectFit: "contain" }} alt="Free Entry" />
                                                )}
                                            </div>
                                            <div style={{ fontSize: "10px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>Free Entry</div>
                                        </div>
                                    )}
                                </div>

                                <div className="vip-card-body">
                                    <div className="vip-stat-grid" style={{ gridTemplateColumns: "repeat(3, 1fr)" }}>
                                        <div className="vip-stat-item">
                                            <div className="stat-label">Video Discount</div>
                                            <div className="stat-val" style={{ color: lvl.color }}>{data.videoCallDiscount || 0}%</div>
                                        </div>
                                        <div className="vip-stat-item">
                                            <div className="stat-label">Random Match</div>
                                            <div className="stat-val" style={{ color: "#8b5cf6" }}>{data.randomMatchCallDiscount || 0}%</div>
                                        </div>
                                        <div className="vip-stat-item">
                                            <div className="stat-label">Coin Bonus</div>
                                            <div className="stat-val" style={{ color: "#d97706" }}>+{data.topUpCoinBonus || 0}%</div>
                                        </div>
                                    </div>

                                    <div className="vip-section-title" style={{ fontSize: "11px", fontWeight: 800, color: "#94a3b8", textTransform: "uppercase", marginBottom: "12px" }}>Specific Powers</div>
                                    <div className="powers-section" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                                        {renderPowerLabel("Special Name", data.specialName)}
                                        {renderPowerLabel("Member Tag", data.memberTag)}
                                        {renderPowerLabel("Room Authority", data.roomAuthority)}
                                        {renderPowerLabel("Kick Users", data.kick)}
                                        {renderPowerLabel("Mute VIP/VVIP", data.canMuteOthers)}
                                        {renderPowerLabel("Hide Entry", data.hide)}
                                        {renderPowerLabel("Unlimited Chat", data.unlimitedChat)}
                                        {renderPowerLabel("Free Entry", data.freeEntry)}
                                        {renderPowerLabel("Mute Availability", data.muteAvailability)}
                                        {renderPowerLabel("Profile Edit", data.profileEdit)}
                                    </div>

                                    <button className="edit-priv-btn" onClick={() => dispatch(openDialog({ type: "vipPrivilege", data: data }))}>
                                        Manage {lvl.name} Options
                                    </button>
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