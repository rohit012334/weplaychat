import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import Button from "@/extra/Button";
import { updateLevel } from "@/store/levelSlice";
import { getStorageUrl } from "@/utils/config";
import { DangerRight } from "@/api/toastServices";
import SvgaPlayer from "@/extra/SvgaPlayer";

const LevelDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const dispatch = useAppDispatch();

  const [mongoId, setMongoId] = useState<string>("");
  const [level, setLevel] = useState<number>(0);
  const [threshold, setThreshold] = useState<number>(0);
  
  const [userImage, setUserImage] = useState<File | null>(null);
  const [userPreview, setUserPreview] = useState<string>("");
  
  const [hostImage, setHostImage] = useState<File | null>(null);
  const [hostPreview, setHostPreview] = useState<string>("");

  const userInputRef = useRef<HTMLInputElement>(null);
  const hostInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData._id || "");
      setLevel(dialogueData.level || 0);
      setThreshold(dialogueData.threshold || 0);
      if (dialogueData.userImage) setUserPreview(getStorageUrl(dialogueData.userImage));
      if (dialogueData.hostImage) setHostPreview(getStorageUrl(dialogueData.hostImage));
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

  const renderPreview = (preview: string, isHost: boolean) => {
    if (!preview) return <span style={{ fontSize: "12px", color: isHost ? "#a855f7" : "#8F6DFF" }}>Upload {isHost ? "Host" : "User"} Image</span>;
    // Check if it's an SVGA file (based on preview URL or filename)
    // For blob URLs, we can check the file type if we have it
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
    formData.append("threshold", threshold.toString());
    if (userImage) formData.append("userImage", userImage);
    if (hostImage) formData.append("hostImage", hostImage);

    dispatch(updateLevel({ formData, levelId: mongoId }));
    dispatch(closeDialog());
  };

  return (
    <div className="dialog">
      <div className="w-100">
        <div className="row justify-content-center">
          <div className="col-xl-5 col-md-7 col-11">
            <div className="mainDiaogBox">
              <div className="row justify-content-between align-items-center formHead">
                <div className="col-8">
                  <h4 className="text-theme m0">Edit Level {level}</h4>
                </div>
                <div className="col-4">
                  <div className="closeButton" onClick={() => dispatch(closeDialog())}>✖</div>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="row formBody">

                  <div className="col-md-6 mb-3">
                    <label className="form-label" style={{ fontWeight: 600 }}>User Level Image</label>
                    <div
                      className="image-upload-box"
                      onClick={() => userInputRef.current?.click()}
                      style={{
                        height: "150px", border: "2px dashed #8F6DFF", borderRadius: "12px",
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
                        height: "150px", border: "2px dashed #a855f7", borderRadius: "12px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        overflow: "hidden", cursor: "pointer", background: "#fdf8ff"
                      }}
                    >
                      {renderPreview(hostPreview, true)}
                    </div>
                    <input type="file" hidden ref={hostInputRef} onChange={handleHostFile} accept="image/*,.svga" />
                  </div>

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
