import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { updateVipPlanBenefits } from "@/store/vipPlanSlice";
import { DangerRight } from "@/api/toastServices";
import { getStorageUrl } from "@/utils/config";

const VipPlanBenefitDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const { isLoading } = useSelector((state: RootStore) => state.vipPlan);
  const dispatch = useAppDispatch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mongoId, setMongoId] = useState("");
  const [level, setLevel] = useState(1);
  const [name, setName] = useState("");
  
  // Numerical Fields
  const [numericalFields, setNumericalFields] = useState({
    audioCallDiscount: 0,
    videoCallDiscount: 0,
    randomMatchCallDiscount: 0,
    topUpCoinBonus: 0,
    freeMessages: 0,
  });

  // Boolean Fields (Toggles)
  const [booleanFields, setBooleanFields] = useState({
    muteAvailability: false,
    specialName: false,
    freeEntry: false,
    roomAuthority: false,
    unlimitedChat: false,
    memberTag: false,
    profileEdit: false,
    kick: false,
    backgroundAdd: false,
    hide: false,
    canMuteOthers: false,
  });

  const [badgeImage, setBadgeImage] = useState<File | null>(null);
  const [badgePreview, setBadgePreview] = useState("");

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData._id || "");
      setLevel(dialogueData.level || 1);
      setName(dialogueData.name || "");
      
      setNumericalFields({
        audioCallDiscount: dialogueData.audioCallDiscount || 0,
        videoCallDiscount: dialogueData.videoCallDiscount || 0,
        randomMatchCallDiscount: dialogueData.randomMatchCallDiscount || 0,
        topUpCoinBonus: dialogueData.topUpCoinBonus || 0,
        freeMessages: dialogueData.freeMessages || 0,
      });

      setBooleanFields({
        muteAvailability: !!dialogueData.muteAvailability,
        specialName: !!dialogueData.specialName,
        freeEntry: !!dialogueData.freeEntry,
        roomAuthority: !!dialogueData.roomAuthority,
        unlimitedChat: !!dialogueData.unlimitedChat,
        memberTag: !!dialogueData.memberTag,
        profileEdit: !!dialogueData.profileEdit,
        kick: !!dialogueData.kick,
        backgroundAdd: !!dialogueData.backgroundAdd,
        hide: !!dialogueData.hide,
        canMuteOthers: !!dialogueData.canMuteOthers,
      });

      if (dialogueData.vipFrameBadge) {
        setBadgePreview(getStorageUrl(dialogueData.vipFrameBadge));
      }
    }
  }, [dialogueData]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBadgeImage(file);
      setBadgePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append("level", level.toString());
    formData.append("name", name || (level === 1 ? "VIP" : level === 2 ? "VVIP" : "SVIP"));
    if (mongoId) formData.append("privilegeId", mongoId);
    if (badgeImage) formData.append("vipFrameBadge", badgeImage);

    // Append numerical
    Object.entries(numericalFields).forEach(([key, val]) => {
      formData.append(key, val.toString());
    });

    // Append boolean
    Object.entries(booleanFields).forEach(([key, val]) => {
      formData.append(key, val.toString());
    });

    dispatch(updateVipPlanBenefits(formData));
    dispatch(closeDialog());
  };

  const toggleField = (key: keyof typeof booleanFields) => {
    setBooleanFields(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const updateNumeric = (key: keyof typeof numericalFields, val: string) => {
    setNumericalFields(prev => ({ ...prev, [key]: parseInt(val) || 0 }));
  };

  const toggleLabels: Record<string, string> = {
    muteAvailability: "Mute Immunity",
    specialName: "Golden Name",
    freeEntry: "Free Room Entry",
    roomAuthority: "Room Authority",
    unlimitedChat: "Unlimited Chat",
    memberTag: "Member Tag",
    profileEdit: "Profile Customization",
    kick: "Kick Privilege",
    backgroundAdd: "Custom Backgrounds",
    hide: "Stealth Mode",
    canMuteOthers: "Punish Others",
  };

  return (
    <>
      <style>{`
        .vpb-dialog { position: fixed; inset: 0; background: rgba(15,23,42,0.6); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; font-family: 'Outfit', sans-serif; }
        .vpb-content { background: #fff; width: 100%; max-width: 800px; border-radius: 24px; display: flex; flex-direction: column; max-height: 90vh; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25); border: 1px solid rgba(255,255,255,0.1); overflow: hidden; }
        .vpb-header { padding: 24px 30px; background: #0f172a; color: #fff; display: flex; align-items: center; justify-content: space-between; }
        .vpb-title { margin: 0; font-family: 'Rajdhani', sans-serif; font-size: 24px; font-weight: 800; letter-spacing: 0.5px; }
        .vpb-close { cursor: pointer; opacity: 0.7; transition: 0.2s; font-size: 24px; }
        .vpb-close:hover { opacity: 1; transform: rotate(90deg); }
        .vpb-body { padding: 30px; overflow-y: auto; flex: 1; background: #f8fafc; }
        .vpb-section-title { font-size: 14px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin: 24px 0 16px; display: flex; align-items: center; gap: 8px; }
        .vpb-section-title::after { content: ''; flex: 1; height: 1px; background: #e2e8f0; }
        
        .vpb-main-grid { display: grid; grid-template-columns: 200px 1fr; gap: 30px; }
        .vpb-badge-upload { width: 200px; height: 200px; background: #fff; border: 2px dashed #e2e8f0; border-radius: 20px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; overflow: hidden; position: relative; transition: 0.3s; }
        .vpb-badge-upload:hover { border-color: #6366f1; background: #f5f3ff; }
        .vpb-badge-img { width: 100%; height: 100%; object-fit: contain; }
        
        .vpb-num-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; }
        .vpb-input-group { display: flex; flex-direction: column; gap: 8px; }
        .vpb-label { font-size: 13px; font-weight: 600; color: #475569; }
        .vpb-input { padding: 12px 16px; border: 1.5px solid #e2e8f0; border-radius: 12px; font-size: 14px; outline: none; transition: 0.2s; }
        .vpb-input:focus { border-color: #6366f1; box-shadow: 0 0 0 4px rgba(99,102,241,0.1); }
        
        .vpb-powers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
        .vpb-power-item { background: #fff; padding: 12px 16px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: 0.2s; }
        .vpb-power-item:hover { border-color: #6366f1; transform: translateY(-1px); }
        .vpb-power-item.active { border-color: #6366f1; background: #f5f3ff; }
        .vpb-power-label { font-size: 13px; font-weight: 600; color: #1e293b; }
        
        .vpb-switch { width: 40px; height: 22px; background: #cbd5e1; border-radius: 20px; position: relative; transition: 0.3s; }
        .vpb-switch.active { background: #6366f1; }
        .vpb-dot { width: 16px; height: 16px; background: #fff; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.3s; }
        .vpb-switch.active .vpb-dot { left: 21px; }
        
        .vpb-footer { padding: 24px 30px; background: #fff; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px; }
        .vpb-btn { padding: 12px 28px; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: 0.2s; border: none; }
        .vpb-btn-cancel { background: #f1f5f9; color: #475569; }
        .vpb-btn-submit { background: #0f172a; color: #fff; box-shadow: 0 10px 15px -3px rgba(15,23,42,0.2); }
        .vpb-btn-submit:hover { transform: translateY(-1px); background: #1e293b; }
      `}</style>

      <div className="vpb-dialog">
        <div className="vpb-content">
          <div className="vpb-header">
            <h3 className="vpb-title">{mongoId ? `MANAGE ${name}` : "ADD VIP PRIVILEGE"}</h3>
            <div className="vpb-close" onClick={() => dispatch(closeDialog())}>✕</div>
          </div>

          <form id="vipBenefitForm" onSubmit={handleSubmit} className="vpb-body">
            <div className="vpb-main-grid">
              <div className="vpb-input-group">
                <label className="vpb-label">Level Badge</label>
                <div className="vpb-badge-upload" onClick={() => fileInputRef.current?.click()}>
                  {badgePreview ? (
                    <img src={badgePreview} className="vpb-badge-img" alt="Badge" />
                  ) : (
                    <div style={{ textAlign: "center", color: "#94a3b8" }}>
                      <svg width="32" height="32" fill="currentColor" viewBox="0 0 16 16"><path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/></svg>
                      <div style={{ fontSize: 12, marginTop: 4 }}>Upload Icon</div>
                    </div>
                  )}
                  <input ref={fileInputRef} type="file" hidden accept="image/*" onChange={handleImageChange} />
                </div>
              </div>

              <div className="vpb-num-grid">
                <div className="vpb-input-group">
                  <label className="vpb-label">VIP Level</label>
                  <select className="vpb-input" value={level} onChange={(e) => setLevel(parseInt(e.target.value))}>
                    <option value={1}>Level 1 (VIP)</option>
                    <option value={2}>Level 2 (VVIP)</option>
                    <option value={3}>Level 3 (SVIP)</option>
                  </select>
                </div>
                <div className="vpb-input-group">
                  <label className="vpb-label">Level Custom Name</label>
                  <input className="vpb-input" placeholder="e.g. VIP" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                {Object.keys(numericalFields).map((key) => (
                  <div key={key} className="vpb-input-group">
                    <label className="vpb-label">{key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}</label>
                    <input className="vpb-input" type="number" value={numericalFields[key as keyof typeof numericalFields]} onChange={(e) => updateNumeric(key as any, e.target.value)} />
                  </div>
                ))}
              </div>
            </div>

            <div className="vpb-section-title">Special Powers & Privileges</div>
            <div className="vpb-powers-grid">
              {Object.keys(booleanFields).map((key) => (
                <div key={key} className={`vpb-power-item ${booleanFields[key as keyof typeof booleanFields] ? "active" : ""}`} onClick={() => toggleField(key as any)}>
                  <span className="vpb-power-label">{toggleLabels[key] || key}</span>
                  <div className={`vpb-switch ${booleanFields[key as keyof typeof booleanFields] ? "active" : ""}`}>
                    <div className="vpb-dot" />
                  </div>
                </div>
              ))}
            </div>
          </form>

          <div className="vpb-footer">
            <button type="button" className="vpb-btn vpb-btn-cancel" onClick={() => dispatch(closeDialog())}>Cancel</button>
            <button type="submit" form="vipBenefitForm" className="vpb-btn vpb-btn-submit">
              {isLoading ? "Saving..." : mongoId ? "Save Changes" : "Create Privilege"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VipPlanBenefitDialog;