import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { updateVipPlanBenefits } from "@/store/vipPlanSlice";
import { baseURL } from "@/utils/config";

interface ErrorState {
  videoCallDiscount: string;
  randomMatchCallDiscount: string;
  image: string;
}

const VipPlanBenefitDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const dispatch = useAppDispatch();

  const [videoCallDiscount, setVideoCallDiscount] = useState<any>("");
  const [randomMatchCallDiscount, setRandomMatchCallDiscount] = useState<any>("");
  const [image, setImage] = useState<any>(null);
  const [imagePath, setImagePath] = useState<any>("");

  const [error, setError] = useState<ErrorState>({
    videoCallDiscount: "",
    randomMatchCallDiscount: "",
    image: "",
  });

  useEffect(() => {
    if (dialogueData) {
      setVideoCallDiscount(dialogueData?.videoCallDiscount);
      setRandomMatchCallDiscount(dialogueData?.randomMatchCallDiscount);
      setImagePath(baseURL + dialogueData?.vipFrameBadge);
    }
  }, [dialogueData]);

  const validatePercent = (val: any, key: string, label: string) => {
    if (!val) return `${label} is required`;
    if (val <= 0) return `${label} must be > 0`;
    if (val > 100) return `${label} cannot exceed 100`;
    return "";
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const err: ErrorState = {
      videoCallDiscount: validatePercent(videoCallDiscount, "videoCallDiscount", "Video Call Discount"),
      randomMatchCallDiscount: validatePercent(randomMatchCallDiscount, "randomMatchCallDiscount", "Random Match Discount"),
      image: "",
    };
    if (Object.values(err).some(Boolean)) return setError(err);

    const formData = new FormData();
    formData.append("videoCallDiscount", String(videoCallDiscount));
    formData.append("randomMatchCallDiscount", String(randomMatchCallDiscount));
    if (image) formData.append("vipFrameBadge", image);

    dispatch(updateVipPlanBenefits(formData));
    dispatch(closeDialog());
  };

  const handleInputImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setError((p) => ({ ...p, image: "" }));
    }
  };

  // ── field definitions (2-col grid) ──
  const fields = [
    {
      id: "videoCallDiscount", label: "Video Call Discount (%)", value: videoCallDiscount,
      error: error.videoCallDiscount,
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polygon points="23 7 16 12 23 17 23 7" /><rect x="1" y="5" width="15" height="14" rx="2" ry="2" /></svg>,
      onChange: (e: any) => { setVideoCallDiscount(e.target.value); setError((p) => ({ ...p, videoCallDiscount: validatePercent(e.target.value, "", "Video Call Discount") })); },
    },
    {
      id: "randomMatchCallDiscount", label: "Random Match Discount (%)", value: randomMatchCallDiscount,
      error: error.randomMatchCallDiscount,
      icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="16 3 21 3 21 8" /><line x1="4" y1="20" x2="21" y2="3" /><polyline points="21 16 21 21 16 21" /><line x1="15" y1="15" x2="21" y2="21" /></svg>,
      onChange: (e: any) => { setRandomMatchCallDiscount(e.target.value); setError((p) => ({ ...p, randomMatchCallDiscount: validatePercent(e.target.value, "", "Random Match Discount") })); },
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .vpb-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15,17,35,0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }

        .vpb-box {
          --accent:  #f59e0b;
          --accent2: #f97316;
          --a-soft:  rgba(245,158,11,0.09);
          --a-mid:   rgba(245,158,11,0.20);
          --a-glow:  rgba(245,158,11,0.28);
          --border:  #e8eaf2;
          --txt:     #64748b;
          --txt-dark:#1e2235;
          --txt-dim: #a0a8c0;
          --white:   #ffffff;
          --bg:      #f7f8fc;
          --error:   #f43f5e;
          --e-soft:  rgba(244,63,94,0.08);

          font-family: 'Outfit', sans-serif;
          background: var(--white);
          border-radius: 20px;
          width: 100%; max-width: 560px;
          box-shadow: 0 24px 64px rgba(15,17,35,0.18), 0 0 0 1px var(--border);
          overflow: hidden;
          animation: vpb-in .22s cubic-bezier(.4,0,.2,1);
          max-height: 92vh;
          display: flex; flex-direction: column;
        }

        @keyframes vpb-in {
          from { opacity:0; transform:translateY(16px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }

        /* ── Header ── */
        .vpb-box .vpb-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 18px;
          background: linear-gradient(135deg,rgba(245,158,11,0.07),rgba(249,115,22,0.04));
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .vpb-box .vpb-header-left { display: flex; align-items: center; gap: 10px; }
        .vpb-box .vpb-header-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: var(--a-soft); color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--a-mid); flex-shrink: 0;
        }
        .vpb-box .vpb-title {
          font-family: 'Rajdhani', sans-serif; font-size: 18px;
          font-weight: 700; color: var(--txt-dark); margin: 0; line-height: 1.1;
        }
        .vpb-box .vpb-subtitle { font-size: 11.5px; color: var(--txt-dim); margin-top: 1px; }
        .vpb-box .vpb-close {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer; color: var(--txt-dim);
          transition: background .14s, color .14s, border-color .14s;
        }
        .vpb-box .vpb-close:hover {
          background: var(--e-soft); border-color: var(--error); color: var(--error);
        }

        /* ── Scrollable body ── */
        .vpb-box .vpb-body {
          padding: 22px 24px; overflow-y: auto;
          display: flex; flex-direction: column; gap: 0;
        }

        /* ── 2-col grid ── */
        .vpb-box .vpb-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 14px;
          margin-bottom: 14px;
        }

        /* ── Field ── */
        .vpb-box .vpb-field { display: flex; flex-direction: column; gap: 6px; }
        .vpb-box .vpb-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600; color: var(--txt-dark);
        }
        .vpb-box .vpb-label-icon { color: var(--accent); display: flex; }
        .vpb-box .vpb-input {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px; border: 1.5px solid var(--border);
          border-radius: 10px; background: var(--bg);
          font-family: 'Outfit', sans-serif; font-size: 13.5px; color: var(--txt-dark);
          outline: none;
          transition: border-color .15s, box-shadow .15s, background .15s;
        }
        .vpb-box .vpb-input::placeholder { color: var(--txt-dim); }
        .vpb-box .vpb-input:focus {
          border-color: var(--accent); background: var(--white);
          box-shadow: 0 0 0 3px var(--a-soft);
        }
        .vpb-box .vpb-input.has-error { border-color: var(--error); background: var(--e-soft); }
        .vpb-box .vpb-error {
          display: flex; align-items: center; gap: 5px;
          font-size: 11px; color: var(--error); font-weight: 500;
        }

        /* ── Image upload ── */
        .vpb-box .vpb-upload-area {
          border: 1.5px dashed var(--a-mid);
          border-radius: 12px; padding: 16px;
          background: var(--a-soft);
          display: flex; align-items: center; gap: 16px;
          cursor: pointer; transition: border-color .15s, background .15s;
          margin-bottom: 4px;
        }
        .vpb-box .vpb-upload-area:hover {
          border-color: var(--accent); background: rgba(245,158,11,0.13);
        }
        .vpb-box .vpb-upload-icon {
          width: 42px; height: 42px; border-radius: 11px;
          background: var(--white); color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--a-mid); flex-shrink: 0;
        }
        .vpb-box .vpb-upload-text { flex: 1; }
        .vpb-box .vpb-upload-title {
          font-size: 13px; font-weight: 600; color: var(--txt-dark); margin: 0 0 2px;
        }
        .vpb-box .vpb-upload-hint {
          font-size: 11px; color: var(--txt-dim); margin: 0;
        }
        .vpb-box .vpb-upload-input { display: none; }

        .vpb-box .vpb-preview-wrap {
          display: flex; align-items: center; gap: 12px; margin-top: 10px;
        }
        .vpb-box .vpb-preview {
          width: 72px; height: 72px; border-radius: 12px;
          object-fit: cover; border: 2px solid var(--a-mid);
          box-shadow: 0 2px 8px var(--a-soft);
        }
        .vpb-box .vpb-preview-label {
          font-size: 12px; color: var(--txt-dim); font-weight: 500;
        }

        /* ── Footer ── */
        .vpb-box .vpb-footer {
          display: flex; align-items: center; justify-content: flex-end; gap: 10px;
          padding: 16px 24px 20px;
          border-top: 1px solid var(--border); flex-shrink: 0;
        }
        .vpb-box .vpb-btn-cancel {
          padding: 9px 20px; border-radius: 10px;
          border: 1.5px solid var(--border); background: var(--bg);
          font-family: 'Outfit', sans-serif; font-size: 13.5px;
          font-weight: 600; color: var(--txt); cursor: pointer;
          transition: border-color .14s, color .14s, background .14s;
        }
        .vpb-box .vpb-btn-cancel:hover {
          border-color: var(--txt); color: var(--txt-dark); background: var(--white);
        }
        .vpb-box .vpb-btn-submit {
          padding: 9px 24px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--a-glow);
          display: flex; align-items: center; gap: 7px;
          transition: box-shadow .15s, transform .13s;
        }
        .vpb-box .vpb-btn-submit:hover {
          box-shadow: 0 6px 20px var(--a-glow); transform: translateY(-1px);
        }
      `}</style>

      <div className="vpb-overlay" onClick={() => dispatch(closeDialog())}>
        <div className="vpb-box" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="vpb-header">
            <div className="vpb-header-left">
              <div className="vpb-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div>
                <h4 className="vpb-title">VIP Plan Benefits</h4>
                <p className="vpb-subtitle">Update privileges for VIP members</p>
              </div>
            </div>
            <button className="vpb-close" onClick={() => dispatch(closeDialog())}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="vpb-body">

              {/* 2-col grid for discount/bonus fields */}
              <div className="vpb-grid">
                {fields.map((f) => (
                  <div className="vpb-field" key={f.id}>
                    <label className="vpb-label" htmlFor={f.id}>
                      <span className="vpb-label-icon">{f.icon}</span>
                      {f.label}
                    </label>
                    <input
                      id={f.id}
                      type="number"
                      className={`vpb-input${f.error ? " has-error" : ""}`}
                      value={f.value}
                      placeholder="0"
                      onChange={f.onChange}
                    />
                    {f.error && (
                      <span className="vpb-error">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {f.error}
                      </span>
                    )}
                  </div>
                ))}

                {/* Image upload in grid */}
                <div className="vpb-field" style={{ gridColumn: "1 / -1" }}>
                  <label className="vpb-label">
                    <span className="vpb-label-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </span>
                    VIP Frame Badge
                  </label>

                  <label className="vpb-upload-area" htmlFor="vpb-image-input">
                    <div className="vpb-upload-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div className="vpb-upload-text">
                      <p className="vpb-upload-title">Click to upload frame badge</p>
                      <p className="vpb-upload-hint">Accepted: PNG, JPEG</p>
                    </div>
                    <input
                      id="vpb-image-input"
                      className="vpb-upload-input"
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleInputImage}
                    />
                  </label>

                  {error.image && (
                    <span className="vpb-error">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error.image}
                    </span>
                  )}

                  {imagePath && (
                    <div className="vpb-preview-wrap">
                      <img src={imagePath} alt="Frame Badge Preview" className="vpb-preview" />
                      <span className="vpb-preview-label">Current frame badge</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ── Footer ── */}
            <div className="vpb-footer">
              <button type="button" className="vpb-btn-cancel"
                onClick={() => dispatch(closeDialog())}>
                Cancel
              </button>
              <button type="submit" className="vpb-btn-submit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Save Benefits
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default VipPlanBenefitDialog;