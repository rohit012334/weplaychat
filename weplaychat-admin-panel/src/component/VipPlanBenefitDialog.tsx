import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { updateVipPlanBenefits } from "@/store/vipPlanSlice";
import { DangerRight } from "@/api/toastServices";

const VipPlanBenefitDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const { isLoading } = useSelector((state: RootStore) => state.vipPlan);
  const dispatch = useAppDispatch();

  const [mongoId, setMongoId] = useState("");
  const [level, setLevel] = useState(1);
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");

  const [benefits, setBenefits] = useState({
    profileFrame: true,
    entryEffect: true,
    vipBadge: true,
    uniqueId: true,
    exclusiveGifts: true,
    vipCustomerService: true,
    preventKick: true,
    preventMute: true,
    hiddenLocation: true,
    hiddenVisit: true,
  });

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData._id || "");
      setLevel(dialogueData.level || 1);
      setDuration(dialogueData.duration?.toString() || "");
      setPrice(dialogueData.price?.toString() || "");
      if (dialogueData.benefits) {
        setBenefits({ ...benefits, ...dialogueData.benefits });
      }
    }
  }, [dialogueData]);

  const handleSubmit = (e: React.FormEvent) => {
     e.preventDefault();
     if (!duration || !price) { DangerRight("All fields are required"); return; }
     
     const payload = { 
        level, 
        duration: parseInt(duration), 
        price: parseInt(price),
        benefits,
        ...(mongoId ? { privilegeId: mongoId } : {})
     };

     dispatch(updateVipPlanBenefits(payload));
     dispatch(closeDialog());
  };

  const toggleBenefit = (key: keyof typeof benefits) => {
    setBenefits(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const benefitList = [
    { label: "Profile Frame", key: "profileFrame" },
    { label: "Entry Effect", key: "entryEffect" },
    { label: "VIP Badge", key: "vipBadge" },
    { label: "Unique ID", key: "uniqueId" },
    { label: "Exclusive Gifts", key: "exclusiveGifts" },
    { label: "VIP Customer Service", key: "vipCustomerService" },
    { label: "Prevent Kick", key: "preventKick" },
    { label: "Prevent Mute", key: "preventMute" },
    { label: "Hidden Location", key: "hiddenLocation" },
    { label: "Hidden Visit", key: "hiddenVisit" },
  ];

  return (
    <>
      <style>{`
        .vpb-dialog { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 9999; padding: 20px; font-family: 'Outfit', sans-serif; }
        .vpb-content { background: #fff; width: 100%; max-width: 580px; border-radius: 20px; display: flex; flex-direction: column; max-height: 90vh; box-shadow: 0 10px 40px rgba(0,0,0,0.15); }
        .vpb-header { padding: 20px 24px; border-bottom: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: space-between; }
        .vpb-title { margin: 0; font-size: 20px; font-weight: 700; color: #1a1a1a; }
        .vpb-close { cursor: pointer; color: #999; font-size: 20px; transition: 0.2s; }
        .vpb-close:hover { color: #555; }
        .vpb-body { padding: 24px; overflow-y: auto; flex: 1; }
        .vpb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-top: 20px; }
        .vpb-item { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border: 1px solid #eee; border-radius: 12px; transition: 0.2s; cursor: pointer; }
        .vpb-item.active { border-color: #6366f1; background: rgba(99,102,241,0.05); }
        .vpb-label { font-size: 14px; font-weight: 500; color: #444; }
        .vpb-switch { width: 36px; height: 20px; border-radius: 20px; background: #ddd; position: relative; transition: 0.2s; }
        .vpb-switch.active { background: #6366f1; }
        .vpb-dot { width: 14px; height: 14px; background: #fff; border-radius: 50%; position: absolute; top: 3px; left: 3px; transition: 0.2s; }
        .vpb-switch.active .vpb-dot { left: 19px; }
        .vpb-form-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 24px; }
        .vpb-input-group { display: flex; flex-direction: column; gap: 6px; }
        .vpb-input-label { font-size: 12px; font-weight: 700; color: #666; text-transform: uppercase; }
        .vpb-select, .vpb-input { padding: 10px 14px; border: 1.5px solid #eee; border-radius: 10px; font-family: inherit; font-size: 14px; outline: none; transition: 0.2s; }
        .vpb-select:focus, .vpb-input:focus { border-color: #6366f1; }
        .vpb-footer { padding: 20px 24px; border-top: 1px solid #f0f0f0; display: flex; align-items: center; justify-content: flex-end; gap: 12px; }
        .vpb-btn { padding: 10px 24px; border-radius: 10px; font-size: 14px; font-weight: 600; cursor: pointer; transition: 0.2s; border: none; }
        .vpb-btn-cancel { background: #f5f5f5; color: #666; }
        .vpb-btn-submit { background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.2); }
      `}</style>
      <div className="vpb-dialog">
        <div className="vpb-content">
          <div className="vpb-header">
            <h3 className="vpb-title">{mongoId ? "Edit VIP Privilege" : "Add VIP Privilege"}</h3>
            <div className="vpb-close" onClick={() => dispatch(closeDialog())}>✕</div>
          </div>
          <form id="vipPrivilegeForm" onSubmit={handleSubmit} className="vpb-body">
            <div className="vpb-form-row">
              <div className="vpb-input-group">
                <label className="vpb-input-label">VIP Level</label>
                <select className="vpb-select" value={level} onChange={(e) => setLevel(parseInt(e.target.value))}>
                  <option value={1}>VIP</option>
                  <option value={2}>VVIP</option>
                  <option value={3}>SVIP</option>
                </select>
              </div>
              <div className="vpb-input-group">
                <label className="vpb-input-label">Duration (Days)</label>
                <input className="vpb-input" type="number" placeholder="30" value={duration} onChange={(e) => setDuration(e.target.value)} />
              </div>
              <div className="vpb-input-group">
                <label className="vpb-input-label">Price (Coins)</label>
                <input className="vpb-input" type="number" placeholder="500" value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </div>

            <label className="vpb-input-label">Benefits & Privileges</label>
            <div className="vpb-grid">
              {benefitList.map((item) => (
                <div key={item.key} className={`vpb-item ${benefits[item.key as keyof typeof benefits] ? "active" : ""}`} onClick={() => toggleBenefit(item.key as any)}>
                   <span className="vpb-label">{item.label}</span>
                   <div className={`vpb-switch ${benefits[item.key as keyof typeof benefits] ? "active" : ""}`}>
                     <div className="vpb-dot" />
                   </div>
                </div>
              ))}
            </div>
          </form>

          <div className="vpb-footer">
            <button type="button" className="vpb-btn vpb-btn-cancel" onClick={() => dispatch(closeDialog())}>Cancel</button>
            <button type="submit" form="vipPrivilegeForm" className="vpb-btn vpb-btn-submit">
               {isLoading ? "Saving..." : mongoId ? "Update Privilege" : "Create Privilege"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VipPlanBenefitDialog;