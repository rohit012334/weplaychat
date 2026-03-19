import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { updateVipPlanBenefits } from "@/store/vipPlanSlice";
import { baseURL } from "@/utils/config";

const VipPlanBenefitDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const dispatch = useAppDispatch();

  // Numeric Fields
  const [level, setLevel] = useState(1);
  const [audioCallDiscount, setAudioCallDiscount] = useState(0);
  const [videoCallDiscount, setVideoCallDiscount] = useState(0);
  const [randomMatchCallDiscount, setRandomMatchCallDiscount] = useState(0);
  const [topUpCoinBonus, setTopUpCoinBonus] = useState(0);
  const [freeMessages, setFreeMessages] = useState(0);

  // Boolean (Toggle) Fields
  const [muteAvailability, setMuteAvailability] = useState(false);
  const [specialName, setSpecialName] = useState(false);
  const [freeEntry, setFreeEntry] = useState(false);
  const [roomAuthority, setRoomAuthority] = useState(false);
  const [unlimitedChat, setUnlimitedChat] = useState(false);
  const [memberTag, setMemberTag] = useState(false);
  const [profileEdit, setProfileEdit] = useState(false);
  const [kick, setKick] = useState(false);
  const [backgroundAdd, setBackgroundAdd] = useState(false);
  const [hide, setHide] = useState(false);
  const [canMuteOthers, setCanMuteOthers] = useState(false);

  // Image
  const [image, setImage] = useState<any>(null);
  const [imagePath, setImagePath] = useState("");

  useEffect(() => {
    if (dialogueData) {
      setLevel(dialogueData.level || 1);
      setAudioCallDiscount(dialogueData.audioCallDiscount || 0);
      setVideoCallDiscount(dialogueData.videoCallDiscount || 0);
      setRandomMatchCallDiscount(dialogueData.randomMatchCallDiscount || 0);
      setTopUpCoinBonus(dialogueData.topUpCoinBonus || 0);
      setFreeMessages(dialogueData.freeMessages || 0);
      
      setMuteAvailability(!!dialogueData.muteAvailability);
      setSpecialName(!!dialogueData.specialName);
      setFreeEntry(!!dialogueData.freeEntry);
      setRoomAuthority(!!dialogueData.roomAuthority);
      setUnlimitedChat(!!dialogueData.unlimitedChat);
      setMemberTag(!!dialogueData.memberTag);
      setProfileEdit(!!dialogueData.profileEdit);
      setKick(!!dialogueData.kick);
      setBackgroundAdd(!!dialogueData.backgroundAdd);
      setHide(!!dialogueData.hide);
      setCanMuteOthers(!!dialogueData.canMuteOthers);
      
      setImagePath(dialogueData.vipFrameBadge ? baseURL + dialogueData.vipFrameBadge : "");
    }
  }, [dialogueData]);

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("level", String(level));
    formData.append("audioCallDiscount", String(audioCallDiscount));
    formData.append("videoCallDiscount", String(videoCallDiscount));
    formData.append("randomMatchCallDiscount", String(randomMatchCallDiscount));
    formData.append("topUpCoinBonus", String(topUpCoinBonus));
    formData.append("freeMessages", String(freeMessages));
    
    formData.append("muteAvailability", String(muteAvailability));
    formData.append("specialName", String(specialName));
    formData.append("freeEntry", String(freeEntry));
    formData.append("roomAuthority", String(roomAuthority));
    formData.append("unlimitedChat", String(unlimitedChat));
    formData.append("memberTag", String(memberTag));
    formData.append("profileEdit", String(profileEdit));
    formData.append("kick", String(kick));
    formData.append("backgroundAdd", String(backgroundAdd));
    formData.append("hide", String(hide));
    formData.append("canMuteOthers", String(canMuteOthers));

    if (image) formData.append("vipFrameBadge", image);

    dispatch(updateVipPlanBenefits(formData));
    dispatch(closeDialog());
  };

  const handleInputImage = (e: any) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
    }
  };

  return (
    <>
      <style>{`
        .vpb-overlay { position: fixed; inset: 0; z-index: 1000; background: rgba(0,0,0,0.6); display: flex; align-items: center; justify-content: center; padding: 20px; font-family: 'Outfit', sans-serif; }
        .vpb-box { background: #fff; width: 100%; max-width: 800px; border-radius: 20px; overflow: hidden; display: flex; flex-direction: column; max-height: 90vh; box-shadow: 0 10px 40px rgba(0,0,0,0.2); }
        .vpb-header { padding: 20px 24px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; background: #fbfbfd; }
        .vpb-title { margin: 0; font-size: 20px; font-weight: 700; color: #1a1a1a; }
        .vpb-body { padding: 24px; overflow-y: auto; }
        .vpb-section { margin-bottom: 24px; }
        .vpb-section-title { font-size: 14px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.5px; border-bottom: 2px solid #6366f1; width: fit-content; margin-bottom: 16px; padding-bottom: 2px; }
        .vpb-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
        .vpb-field { display: flex; flex-direction: column; gap: 8px; }
        .vpb-label { font-size: 13px; font-weight: 600; color: #4b5563; }
        .vpb-input { padding: 10px 14px; border: 1px solid #e5e7eb; border-radius: 10px; font-size: 14px; outline: none; transition: border-color 0.2s; }
        .vpb-input:focus { border-color: #6366f1; }
        
        /* Toggle Switch */
        .vpb-toggle-wrap { display: flex; align-items: center; justify-content: space-between; background: #f9fafb; padding: 12px 16px; border-radius: 12px; border: 1px solid #f1f1f1; cursor: pointer; transition: 0.2s; }
        .vpb-toggle-wrap:hover { background: #f3f4f6; }
        .vpb-toggle { width: 44px; height: 24px; background: #d1d5db; border-radius: 12px; position: relative; transition: 0.3s; }
        .vpb-toggle.active { background: #10b981; }
        .vpb-toggle::after { content: ''; position: absolute; left: 2px; top: 2px; width: 20px; height: 20px; background: #fff; border-radius: 50%; transition: 0.3s; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .vpb-toggle.active::after { transform: translateX(20px); }
        
        .vpb-upload-area { border: 2px dashed #e5e7eb; border-radius: 12px; padding: 20px; text-align: center; cursor: pointer; transition: 0.2s; }
        .vpb-upload-area:hover { border-color: #6366f1; background: #fbfbfd; }
        .vpb-preview { width: 80px; height: 80px; border-radius: 12px; object-fit: cover; margin-top: 12px; border: 1px solid #e5e7eb; }
        
        .vpb-footer { padding: 16px 24px; background: #f9fafb; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid #eee; }
        .vpb-btn { padding: 10px 24px; border-radius: 10px; font-weight: 600; cursor: pointer; border: none; font-size: 14px; }
        .vpb-btn-cancel { background: #fff; border: 1px solid #e5e7eb; color: #6b7280; }
        .vpb-btn-submit { background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.2); }
      `}</style>

      <div className="vpb-overlay" onClick={() => dispatch(closeDialog())}>
        <div className="vpb-box" onClick={(e) => e.stopPropagation()}>
          <div className="vpb-header">
            <h2 className="vpb-title">Edit {level === 1 ? "VIP" : level === 2 ? "VVIP" : "SVIP"} Privileges</h2>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px" }} onClick={() => dispatch(closeDialog())}>&times;</button>
          </div>

          <div className="vpb-body">
            <form onSubmit={handleSubmit} id="vipPrivilegeForm">
              
              <div className="vpb-section">
                <h3 className="vpb-section-title">Visual & Discounts</h3>
                <div className="vpb-grid">
                  <div className="vpb-field" style={{ gridColumn: "1 / -1" }}>
                    <label className="vpb-label">Upgrade Frame Badge</label>
                    <label className="vpb-upload-area">
                      <input type="file" style={{ display: "none" }} onChange={handleInputImage} accept="image/*" />
                      <div style={{ color: "#6b7280", fontSize: "14px" }}>{image ? image.name : "Click to select frame image"}</div>
                      {imagePath && <img src={imagePath} className="vpb-preview" alt="Preview" />}
                    </label>
                  </div>
                  <div className="vpb-field">
                    <label className="vpb-label">Audio Call Discount (%)</label>
                    <input type="number" className="vpb-input" value={audioCallDiscount} onChange={(e) => setAudioCallDiscount(Number(e.target.value))} />
                  </div>
                  <div className="vpb-field">
                    <label className="vpb-label">Video Call Discount (%)</label>
                    <input type="number" className="vpb-input" value={videoCallDiscount} onChange={(e) => setVideoCallDiscount(Number(e.target.value))} />
                  </div>
                  <div className="vpb-field">
                    <label className="vpb-label">Random Match Discount (%)</label>
                    <input type="number" className="vpb-input" value={randomMatchCallDiscount} onChange={(e) => setRandomMatchCallDiscount(Number(e.target.value))} />
                  </div>
                  <div className="vpb-field">
                    <label className="vpb-label">Top-up Bonus (%)</label>
                    <input type="number" className="vpb-input" value={topUpCoinBonus} onChange={(e) => setTopUpCoinBonus(Number(e.target.value))} />
                  </div>
                  <div className="vpb-field">
                    <label className="vpb-label">Max Free Messages</label>
                    <input type="number" className="vpb-input" value={freeMessages} onChange={(e) => setFreeMessages(Number(e.target.value))} />
                  </div>
                </div>
              </div>

              <div className="vpb-section">
                <h3 className="vpb-section-title">Feature Access Toggles</h3>
                <div className="vpb-grid">
                  {[
                    { label: "Unlimited Chat", val: unlimitedChat, set: setUnlimitedChat },
                    { label: "Room Authority", val: roomAuthority, set: setRoomAuthority },
                    { label: "Mute Availability", val: muteAvailability, set: setMuteAvailability },
                    { label: "Kick Power", val: kick, set: setKick },
                    { label: "Special Name Display", val: specialName, set: setSpecialName },
                    { label: "Free Room Entry", val: freeEntry, set: setFreeEntry },
                    { label: "Member Tag Enabled", val: memberTag, set: setMemberTag },
                    { label: "Profile Editing", val: profileEdit, set: setProfileEdit },
                    { label: "Custom Backgrounds", val: backgroundAdd, set: setBackgroundAdd },
                    { label: "Hide Mode (Silent Join)", val: hide, set: setHide },
                    { label: "Mute Authority (Hierarchy)", val: canMuteOthers, set: setCanMuteOthers },
                  ].map((item, idx) => (
                    <div key={idx} className="vpb-toggle-wrap" onClick={() => item.set(!item.val)}>
                      <span className="vpb-label">{item.label}</span>
                      <div className={`vpb-toggle ${item.val ? "active" : ""}`} />
                    </div>
                  ))}
                </div>
              </div>

            </form>
          </div>

          <div className="vpb-footer">
            <button type="button" className="vpb-btn vpb-btn-cancel" onClick={() => dispatch(closeDialog())}>Cancel</button>
            <button type="submit" form="vipPrivilegeForm" className="vpb-btn vpb-btn-submit">Update {level === 1 ? "VIP" : level === 2 ? "VVIP" : "SVIP"} Level</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default VipPlanBenefitDialog;