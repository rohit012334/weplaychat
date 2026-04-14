import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import Button from "@/extra/Button";
import { updateLevel } from "@/store/levelSlice";
import { getStorageUrl } from "@/utils/config";
import { DangerRight } from "@/api/toastServices";
import SvgaPlayer from "@/extra/SvgaPlayer";
import { getFrames } from "@/store/frameSlice";
import { getEntries } from "@/store/entrySlice";
import { getEntryTags } from "@/store/entryTagSlice";
import { getBackgrounds } from "@/store/backgroundSlice";
import { getTags } from "@/store/tagSlice";
import { allGiftApi } from "@/store/giftSlice";

const LevelDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const dispatch = useAppDispatch();

  // Assets for rewards
  const { frames } = useSelector((state: RootStore) => state.frame);
  const { entries } = useSelector((state: RootStore) => state.entry);
  const { entryTags } = useSelector((state: RootStore) => state.entryTag);
  const { backgrounds } = useSelector((state: RootStore) => state.background);
  const { tags } = useSelector((state: RootStore) => state.tag);
  const { allGift } = useSelector((state: RootStore) => state.gift);

  // Gifts are often grouped by category in this slice, flatten if necessary
  const gifts = allGift.flatMap((category: any) => category.gifts || []);

  const isLevelEdit = useSelector((state: RootStore) => state.dialogue.dialogueType === "level");
  const isGiftEdit = useSelector((state: RootStore) => state.dialogue.dialogueType === "levelGift");

  const [mongoId, setMongoId] = useState<string>("");
  const [level, setLevel] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);
  
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userPreview, setUserPreview] = useState<string>("");
  
  const [hostImage, setHostImage] = useState<File | null>(null);
  const [hostPreview, setHostPreview] = useState<string>("");

  const [rewards, setRewards] = useState<any[]>([]);
  const [newRewardType, setNewRewardType] = useState<string>("frame");
  const [newRewardId, setNewRewardId] = useState<string>("");
  const [newRewardName, setNewRewardName] = useState<string>("");
  const [newRewardFile, setNewRewardFile] = useState<File | null>(null);
  const [isNewUpload, setIsNewUpload] = useState<boolean>(false);

  const userInputRef = useRef<HTMLInputElement>(null);
  const hostInputRef = useRef<HTMLInputElement>(null);
  const rewardInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    dispatch(getFrames({ start: 1, limit: 1000 }));
    dispatch(getEntries({ start: 1, limit: 1000 }));
    dispatch(getEntryTags({ start: 1, limit: 1000 }));
    dispatch(getBackgrounds({ start: 1, limit: 1000 }));
    dispatch(getTags({ start: 1, limit: 1000 }));
    dispatch(allGiftApi());
  }, [dispatch]);

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData._id || "");
      setLevel(dialogueData.level || 0);
      setThreshold(dialogueData.threshold || 0);
      if (dialogueData.userImage) setUserPreview(getStorageUrl(dialogueData.userImage));
      if (dialogueData.hostImage) setHostPreview(getStorageUrl(dialogueData.hostImage));
      setRewards(dialogueData.rewards || []);
    }
  }, [dialogueData]);

  const handleUserFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUserImage(file);
      setUserPreview(URL.createObjectURL(file));
    }
  };

  const handleHostFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setHostImage(file);
      setHostPreview(URL.createObjectURL(file));
    }
  };

  const addReward = () => {
    if (isNewUpload || newRewardType === "custom") {
      if (!newRewardName || !newRewardFile) return DangerRight("Name and File are required for custom upload");
      setRewards([...rewards, { 
        itemType: newRewardType, 
        customName: newRewardName, 
        file: newRewardFile,
        preview: URL.createObjectURL(newRewardFile)
      }]);
      setNewRewardName("");
      setNewRewardFile(null);
    } else {
      if (!newRewardId) return DangerRight("Please select an item");
      if (rewards.find(r => r.itemId === newRewardId && r.itemType === newRewardType)) {
        return DangerRight("This reward is already added");
      }
      setRewards([...rewards, { itemId: newRewardId, itemType: newRewardType }]);
      setNewRewardId("");
    }
  };

  const removeReward = (index: number) => {
    setRewards(rewards.filter((_, i) => i !== index));
  };

  const getItemName = (reward: any) => {
    if (reward.customName) return reward.customName;
    
    let items = [];
    switch (reward.itemType) {
      case "frame": items = frames; break;
      case "entry": items = entries; break;
      case "entryTag": items = entryTags; break;
      case "background": items = backgrounds; break;
      case "tag": items = tags; break;
      case "gift": items = gifts; break;
      default: items = [];
    }
    const item = items.find((i: any) => i._id === reward.itemId);
    const fileName = item?.file || item?.image || item?.svgaImage || reward.itemId;
    const cleanName = typeof fileName === 'string' ? fileName.split('/').pop() : reward.itemId;
    return item ? (item.name || item.title || cleanName) : reward.itemId;
  };

  const renderPreview = (preview: string, isHost: boolean) => {
    if (!preview) return <span style={{ fontSize: "12px", color: isHost ? "#a855f7" : "#8F6DFF" }}>Upload {isHost ? "Host" : "User"} Image</span>;
    const isSvga = (isHost ? hostImage : userImage)?.name?.toLowerCase().endsWith(".svga") || preview.toLowerCase().includes(".svga");
    
    if (isSvga) {
      return (
        <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
          <SvgaPlayer url={preview} id={`preview-${isHost ? "host" : "user"}`} key={preview} />
        </div>
      );
    }
    return <img src={preview} style={{ width: "100%", height: "100%", objectFit: "contain" }} alt="Preview" />;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!mongoId) return;

    const formData = new FormData();
    
    if (isLevelEdit) {
      formData.append("threshold", threshold.toString());
      if (userImage) formData.append("userImage", userImage);
      if (hostImage) formData.append("hostImage", hostImage);
    }

    if (isGiftEdit) {
      const rewardsToSave = rewards.map((r, i) => {
        if (r.file) {
          formData.append(`rewardFile_${i}`, r.file);
        }
        // Remove temporary frontend properties like 'file' and 'preview'
        const { file, preview, ...rest } = r;
        return rest;
      });
      formData.append("rewards", JSON.stringify(rewardsToSave));
    }

    dispatch(updateLevel({ formData, levelId: mongoId }));
    dispatch(closeDialog());
  };

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-6 col-md-8 col-11">
            <div className="mainDiaogBox" style={{ maxHeight: "85vh", overflowY: "auto" }}>
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h4 className="text-theme m0">{isGiftEdit ? "Manage Gifts" : "Edit Level"} {level}</h4>
                </div>
                <div className="col-4">
                  <div className="closeButton" onClick={() => dispatch(closeDialog())}>✖</div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row formBody">

                  {isLevelEdit && (
                    <>
                      <div className="col-md-6 mb-3">
                        <label className="form-label" style={{ fontWeight: 600 }}>User Level Image</label>
                        <div
                          className="image-upload-box"
                          onClick={() => userInputRef.current?.click()}
                          style={{
                            height: "120px", border: "2px dashed #8F6DFF", borderRadius: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            overflow: "hidden", cursor: "pointer", background: "#f8f9ff"
                          }}
                        >
                          {renderPreview(userPreview, false)}
                        </div>
                        <input type="file" hidden ref={userInputRef} onChange={handleUserFile} accept="image/*,.svga" />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label className="form-label" style={{ fontWeight: 600 }}>Host Level Image</label>
                        <div
                          className="image-upload-box"
                          onClick={() => hostInputRef.current?.click()}
                          style={{
                            height: "120px", border: "2px dashed #a855f7", borderRadius: "12px",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            overflow: "hidden", cursor: "pointer", background: "#fdf8ff"
                          }}
                        >
                          {renderPreview(hostPreview, true)}
                        </div>
                        <input type="file" hidden ref={hostInputRef} onChange={handleHostFile} accept="image/*,.svga" />
                      </div>

                      <div className="col-12 mb-3">
                        <label className="form-label" style={{ fontWeight: 600 }}>Level Threshold (Spent Coins)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={threshold} 
                          onChange={(e) => setThreshold(parseInt(e.target.value))}
                        />
                      </div>
                    </>
                  )}

                  {isGiftEdit && (
                    <div className="col-12 mt-2">
                       <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label mb-0" style={{ fontWeight: 600, color: "#6366f1" }}>Level Gifts / Rewards</label>
                        <div className="form-check form-switch small">
                          <input className="form-check-input" type="checkbox" id="uploadSwitch" checked={isNewUpload} onChange={(e) => setIsNewUpload(e.target.checked)} />
                          <label className="form-check-label" htmlFor="uploadSwitch">Upload New Asset</label>
                        </div>
                      </div>

                      <div className="reward-input-box p-3 border rounded-3 bg-light mb-3">
                        <div className="row g-2 align-items-end">
                          <div className="col-md-3">
                            <label className="small mb-1">Type</label>
                            <select className="form-select" value={newRewardType} onChange={(e) => {setNewRewardType(e.target.value); setNewRewardId("");}}>
                              <option value="frame">Frame</option>
                              <option value="entry">Entry</option>
                              <option value="entryTag">Entry Tag</option>
                              <option value="background">Background</option>
                              <option value="tag">Tag</option>
                              <option value="gift">Virtual Gift</option>
                              <option value="custom">Generic Custom</option>
                            </select>
                          </div>
                          
                          {isNewUpload || newRewardType === "custom" ? (
                            <>
                              <div className="col-md-3">
                                <label className="small mb-1">Gift Name</label>
                                <input type="text" className="form-control" placeholder="Name..." value={newRewardName} onChange={(e) => setNewRewardName(e.target.value)} />
                              </div>
                              <div className="col-md-4">
                                <label className="small mb-1">Image/SVGA</label>
                                <input type="file" className="form-control" onChange={(e) => setNewRewardFile(e.target.files?.[0] || null)} accept="image/*,.svga" />
                              </div>
                            </>
                          ) : (
                            <div className="col-md-7">
                              <label className="small mb-1">Select Item</label>
                              <select className="form-select" value={newRewardId} onChange={(e) => setNewRewardId(e.target.value)}>
                                <option value="">Choose item...</option>
                                {newRewardType === "frame" && frames.map((f: any) => (<option key={f._id} value={f._id}>{getItemName({ itemType: "frame", itemId: f._id })}</option>))}
                                {newRewardType === "entry" && entries.map((f: any) => (<option key={f._id} value={f._id}>{getItemName({ itemType: "entry", itemId: f._id })}</option>))}
                                {newRewardType === "entryTag" && entryTags.map((f: any) => (<option key={f._id} value={f._id}>{getItemName({ itemType: "entryTag", itemId: f._id })}</option>))}
                                {newRewardType === "background" && backgrounds.map((f: any) => (<option key={f._id} value={f._id}>{getItemName({ itemType: "background", itemId: f._id })}</option>))}
                                {newRewardType === "tag" && tags.map((f: any) => (<option key={f._id} value={f._id}>{getItemName({ itemType: "tag", itemId: f._id })}</option>))}
                                {newRewardType === "gift" && gifts.map((f: any) => (<option key={f._id} value={f._id}>{getItemName({ itemType: "gift", itemId: f._id })}</option>))}
                              </select>
                            </div>
                          )}
                          
                          <div className="col-md-2">
                            <button type="button" className="btn btn-primary w-100" onClick={addReward}>Add</button>
                          </div>
                        </div>
                      </div>

                      <div className="rewards-list border rounded-3 p-2 bg-white" style={{ minHeight: "80px" }}>
                        {rewards.length === 0 && <p className="text-center text-muted m-0 p-3 small">No gifts added for this level yet.</p>}
                        <div className="d-flex flex-wrap gap-2">
                          {rewards.map((reward, index) => (
                            <div key={index} className="badge bg-indigo-soft text-indigo d-flex align-items-center gap-2 p-2 border" style={{ borderRadius: "8px", background: "rgba(99, 102, 241, 0.1)", color: "#6366f1", border: "1px solid rgba(99,102,241,0.2)" }}>
                              <span className="small fw-bold">{reward.itemType.toUpperCase()}:</span>
                              <span className="small">{getItemName(reward)}</span>
                              <span className="cursor-pointer text-danger fw-bold ms-1" onClick={() => removeReward(index)}>×</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-12 mt-4 d-flex justify-content-end gap-2">
                    <Button className="cancelButton" text="Cancel" type="button" onClick={() => dispatch(closeDialog())} />
                    <Button className="submitButton" text="Save Changes" type="submit" />
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelDialog;
