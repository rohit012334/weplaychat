import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { ChangeEvent, useEffect, useState } from "react";
import { adminProfileGet, adminProfileUpdate, updateAdminPassword } from "@/store/adminSlice";
import RootLayout from "@/component/layout/Layout";
import { baseURL, key } from "@/utils/config";
import { EmailAuthProvider, reauthenticateWithCredential, updateEmail, updatePassword } from "firebase/auth";
import CryptoJS from "crypto-js";
import PasswordInput from "@/extra/PasswordInput";
import { isSkeleton } from "@/utils/allSelector";
import male from "@/assets/images/user.png";
import { auth } from "@/component/lib/firebaseConfig";
import React from "react";
import { DangerRight } from "@/api/toastServices";

interface ErrorState {
  name: string; email: string;
  oldPassword: string; newPassword: string; confirmPassword: string;
  image: string; imagePath: string;
}

const AdminProfile = () => {
  const dispatch = useAppDispatch();
  const roleSkeleton = useSelector(isSkeleton);
  const { admin } = useSelector((state: RootStore) => state.admin);
  const updatedImagePath = admin?.image?.replace(/\\/g, "/");

  const [email, setEmail] = useState<string>("");
  const [name, setName] = useState<string>("");
  const [image, setImage] = useState<File | undefined>();
  const [imagePath, setImagePath] = useState<any>("");
  const [type, setType] = useState<string>("edit_profile");
  const [oldPassword, setOldPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [error, setError] = useState<ErrorState>({
    name: "", email: "", oldPassword: "", newPassword: "",
    confirmPassword: "", image: "", imagePath: "",
  });

  useEffect(() => { dispatch(adminProfileGet()); }, [dispatch]);
  useEffect(() => { if (admin) setOldPassword(admin?.password || ""); }, [admin]);
  useEffect(() => {
    setName(admin?.name || "");
    setEmail(admin?.email || "");
    if (updatedImagePath) setImagePath(baseURL + updatedImagePath);
  }, [admin, updatedImagePath]);

  const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setError((p) => ({ ...p, image: "" }));
    }
  };

  const handleEditName = async () => {
    if (!imagePath || !name || !email) {
      setError({
        ...error,
        email: !email ? "Email is required" : "",
        name: !name ? "Name is required" : "",
        image: !image ? "Image is required" : "",
      });
      return;
    }
    
    try {
      const user = auth?.currentUser;
      if (user) {
        // If email is being changed, we MUST re-authenticate
        if (user.email !== email) {
          const stored: any = sessionStorage.getItem("data");
          if (!stored) {
             DangerRight("Session expired. Please logout and login again to change email.");
             return;
          }
          const decryptedPassword = CryptoJS.AES.decrypt(stored, key).toString(CryptoJS.enc.Utf8);
          const credential = EmailAuthProvider.credential(user.email || "", decryptedPassword);
          await reauthenticateWithCredential(user, credential);
          await updateEmail(user, email);
        }
      }
      
      const formData = new FormData();
      if (image) formData.append("image", image);
      formData.append("name", name);
      formData.append("email", email);
      
      dispatch(adminProfileUpdate(formData));
    } catch (err: any) {
      console.error(err);
      DangerRight(err.message || "Failed to update profile");
    }
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword || newPassword !== confirmPassword || !oldPassword) {
      const err = {} as ErrorState;
      if (!newPassword) err.newPassword = "New password is required";
      if (!confirmPassword) err.confirmPassword = "Confirm password is required";
      if (newPassword !== confirmPassword) err.confirmPassword = "Passwords do not match";
      if (!oldPassword) err.oldPassword = "Old password is required";
      return setError(err);
    }
    const user: any = auth?.currentUser;
    const stored: any = sessionStorage.getItem("data");
    const decryptedPassword = CryptoJS.AES.decrypt(stored, key).toString(CryptoJS.enc.Utf8);
    const credential = EmailAuthProvider.credential(user.email, decryptedPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    sessionStorage.setItem("data", newPassword);
    dispatch(updateAdminPassword({ oldPass: oldPassword, confirmPass: confirmPassword, newPass: newPassword }));
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .ap-page {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.22);
          --green:    #10b981;
          --g-soft:   rgba(16,185,129,0.10);
          --border:   #e8eaf2;
          --txt:      #64748b;
          --txt-dark: #1e2235;
          --txt-dim:  #a0a8c0;
          --white:    #ffffff;
          --bg:       #f4f5fb;
          --error:    #f43f5e;
          --e-soft:   rgba(244,63,94,0.08);

          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── Header ── */
        .ap-page .ap-header {
          display: flex; align-items: center; gap: 12px; margin-bottom: 24px;
        }
        .ap-page .ap-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2)); flex-shrink: 0;
        }
        .ap-page .ap-title {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1; margin: 0;
        }
        .ap-page .ap-sub { font-size: 12px; color: var(--txt-dim); margin-top: 2px; }

        /* ── Layout ── */
        .ap-page .ap-layout {
          display: grid; grid-template-columns: 280px 1fr; gap: 20px; align-items: start;
        }
        @media(max-width:900px) { .ap-page .ap-layout { grid-template-columns: 1fr; } }

        /* ── Profile card (left) ── */
        .ap-page .ap-profile-card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 20px; padding: 28px 24px 24px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          display: flex; flex-direction: column; align-items: center; gap: 0;
        }

        /* Avatar */
        .ap-page .ap-avatar-wrap {
          position: relative; margin-bottom: 20px;
        }
        .ap-page .ap-avatar {
          width: 130px; height: 130px; border-radius: 20px;
          object-fit: cover;
          border: 3px solid var(--border);
          display: block; cursor: pointer;
          transition: border-color .15s;
        }
        .ap-page .ap-avatar:hover { border-color: var(--accent); }
        .ap-page .ap-camera-btn {
          position: absolute; top: 8px; right: 8px;
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; border: 2px solid var(--white);
          box-shadow: 0 2px 8px var(--a-glow);
          transition: transform .14s;
        }
        .ap-page .ap-camera-btn:hover { transform: scale(1.1); }
        .ap-page .ap-avatar-online {
          position: absolute; bottom: 8px; left: 8px;
          width: 12px; height: 12px; border-radius: 50%;
          background: var(--green); border: 2px solid var(--white);
        }

        /* Profile info */
        .ap-page .ap-profile-name {
          font-family: 'Rajdhani', sans-serif; font-size: 20px;
          font-weight: 700; color: var(--txt-dark); margin: 0; text-align: center;
        }
        .ap-page .ap-profile-email {
          font-size: 12.5px; color: var(--txt-dim); margin: 4px 0 20px; text-align: center;
        }
        .ap-page .ap-profile-badge {
          display: inline-flex; align-items: center; gap: 5px;
          background: var(--a-soft); color: var(--accent);
          font-size: 11.5px; font-weight: 700;
          padding: 4px 12px; border-radius: 20px;
          border: 1px solid var(--a-mid); margin-bottom: 20px;
        }

        /* Update image btn */
        .ap-page .ap-update-img-btn {
          width: 100%; padding: 10px; border-radius: 12px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--a-glow);
          display: flex; align-items: center; justify-content: center; gap: 7px;
          transition: box-shadow .15s, transform .13s;
        }
        .ap-page .ap-update-img-btn:hover {
          box-shadow: 0 6px 20px var(--a-glow); transform: translateY(-1px);
        }

        /* ── Right card ── */
        .ap-page .ap-right-card {
          background: var(--white); border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }
        .ap-page .ap-right-head {
          padding: 18px 24px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg,rgba(99,102,241,0.04),rgba(168,85,247,0.02));
        }

        /* ── Inner tab bar ── */
        .ap-page .ap-tabs {
          display: flex; align-items: center; gap: 6px;
          background: var(--bg); border-radius: 10px; padding: 4px;
          width: fit-content; border: 1px solid var(--border);
        }
        .ap-page .ap-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 8px; border: none;
          background: transparent; font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 600;
          color: var(--txt-dim); cursor: pointer; transition: all .15s;
        }
        .ap-page .ap-tab:hover:not(.ap-tab-active) { color: var(--txt); background: var(--white); }
        .ap-page .ap-tab.ap-tab-active {
          background: var(--white); color: var(--accent);
          box-shadow: 0 1px 6px rgba(99,102,241,0.12);
          border: 1px solid var(--a-mid);
        }

        /* ── Form body ── */
        .ap-page .ap-form-body { padding: 28px 28px 32px; }
        .ap-page .ap-field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 18px; }
        .ap-page .ap-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600; color: var(--txt-dark);
        }
        .ap-page .ap-label-icon { color: var(--accent); display: flex; }
        .ap-page .ap-input {
          width: 100%; max-width: 480px; box-sizing: border-box;
          padding: 10px 14px; border: 1.5px solid var(--border);
          border-radius: 10px; background: var(--bg);
          font-family: 'Outfit', sans-serif; font-size: 13.5px; color: var(--txt-dark);
          outline: none;
          transition: border-color .15s, box-shadow .15s, background .15s;
        }
        .ap-page .ap-input::placeholder { color: var(--txt-dim); }
        .ap-page .ap-input:focus {
          border-color: var(--accent); background: var(--white);
          box-shadow: 0 0 0 3px var(--a-soft);
        }
        .ap-page .ap-input.has-error { border-color: var(--error); background: var(--e-soft); }
        .ap-page .ap-error {
          display: flex; align-items: center; gap: 5px;
          font-size: 11.5px; color: var(--error); font-weight: 500;
        }

        /* Submit btn */
        .ap-page .ap-submit-btn {
          margin-top: 8px;
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 26px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--a-glow);
          transition: box-shadow .15s, transform .13s;
        }
        .ap-page .ap-submit-btn:hover {
          box-shadow: 0 6px 20px var(--a-glow); transform: translateY(-1px);
        }

        /* ── Skeleton ── */
        .ap-page .ap-skel {
          background: #eaecf4; border-radius: 10px; overflow: hidden; position: relative;
        }
        .ap-page .ap-skel::after {
          content: ""; position: absolute; inset: 0;
          background: linear-gradient(90deg,#eaecf4 25%,#f4f5fb 50%,#eaecf4 75%);
          background-size: 200% 100%;
          animation: ap-shim 1.4s infinite;
        }
        @keyframes ap-shim {
          0%   { background-position: -200% 0; }
          100% { background-position:  200% 0; }
        }
      `}</style>

      <div className="ap-page">

        {/* ── Page Header ── */}
        <div className="ap-header">
          <div className="ap-header-pill" />
          <div>
            <h1 className="ap-title">Admin Profile</h1>
            <p className="ap-sub">Manage your account details and security</p>
          </div>
        </div>

        <div className="ap-layout">

          {/* ── Left: Profile Card ── */}
          <div className="ap-profile-card">
            {roleSkeleton ? (
              <>
                <div className="ap-skel" style={{ width: 130, height: 130, borderRadius: 20, marginBottom: 20 }} />
                <div className="ap-skel" style={{ width: "60%", height: 20, borderRadius: 6, marginBottom: 8 }} />
                <div className="ap-skel" style={{ width: "50%", height: 14, borderRadius: 6, marginBottom: 20 }} />
                <div className="ap-skel" style={{ width: "100%", height: 42, borderRadius: 12 }} />
              </>
            ) : (
              <>
                <div className="ap-avatar-wrap">
                  <input id="ap-file" type="file" accept="image/*"
                    style={{ display: "none" }} onChange={handleUploadImage} />
                  <img
                    src={imagePath || male.src}
                    alt="Admin"
                    className="ap-avatar"
                    onClick={() => window.open(imagePath, "_blank")}
                  />
                  <label htmlFor="ap-file" className="ap-camera-btn">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                  </label>
                  <span className="ap-avatar-online" />
                </div>

                <p className="ap-profile-name">{admin?.name || "Admin"}</p>
                <p className="ap-profile-email">{admin?.email || "—"}</p>

                <div className="ap-profile-badge">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  Administrator
                </div>

                <button className="ap-update-img-btn" onClick={handleEditName}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  Update Profile Image
                </button>
              </>
            )}
          </div>

          {/* ── Right: Form Card ── */}
          <div className="ap-right-card">
            <div className="ap-right-head">
              <div className="ap-tabs">
                {[
                  {
                    key: "edit_profile", label: "Edit Profile",
                    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                  },
                  {
                    key: "change_password", label: "Change Password",
                    icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                  },
                ].map((t) => (
                  <button key={t.key}
                    className={`ap-tab${type === t.key ? " ap-tab-active" : ""}`}
                    onClick={() => setType(t.key)}>
                    {t.icon}{t.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="ap-form-body">
              {roleSkeleton ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 480 }}>
                  {[1, 2, type === "change_password" ? 3 : null].filter(Boolean).map((_, i) => (
                    <div key={i}>
                      <div className="ap-skel" style={{ width: 140, height: 14, borderRadius: 5, marginBottom: 8 }} />
                      <div className="ap-skel" style={{ width: "100%", height: 42, borderRadius: 10 }} />
                    </div>
                  ))}
                  <div className="ap-skel" style={{ width: 140, height: 42, borderRadius: 10, marginTop: 8 }} />
                </div>
              ) : type === "edit_profile" ? (
                <>
                  {/* Name */}
                  <div className="ap-field">
                    <label className="ap-label" htmlFor="ap-name">
                      <span className="ap-label-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                      </span>
                      Name
                    </label>
                    <input id="ap-name" type="text" className={`ap-input${error.name ? " has-error" : ""}`}
                      placeholder="Enter your name" value={name}
                      onChange={(e) => { setName(e.target.value); setError((p) => ({ ...p, name: !e.target.value ? "Name is required" : "" })); }}
                    />
                    {error.name && <span className="ap-error">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      {error.name}
                    </span>}
                  </div>

                  {/* Email */}
                  <div className="ap-field">
                    <label className="ap-label" htmlFor="ap-email">
                      <span className="ap-label-icon">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                      </span>
                      Email
                    </label>
                    <input id="ap-email" type="email" className={`ap-input${error.email ? " has-error" : ""}`}
                      placeholder="Enter your email" value={email}
                      onChange={(e) => { setEmail(e.target.value); setError((p) => ({ ...p, email: !e.target.value ? "Email is required" : "" })); }}
                    />
                    {error.email && <span className="ap-error">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
                      {error.email}
                    </span>}
                  </div>

                  <button className="ap-submit-btn" onClick={handleEditName}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Save Changes
                  </button>
                </>
              ) : (
                <>
                  {/* Old Password */}
                  <div className="ap-field" style={{ maxWidth: 480 }}>
                    <PasswordInput
                      label="Old Password" value={oldPassword}
                      placeholder="Enter old password" name="oldPassword"
                      onChange={(e: any) => { setOldPassword(e.target.value); setError((p) => ({ ...p, oldPassword: !e.target.value ? "Old password is required" : "" })); }}
                      error={error.oldPassword}
                    />
                  </div>
                  <div className="ap-field" style={{ maxWidth: 480 }}>
                    <PasswordInput
                      label="New Password" value={newPassword}
                      placeholder="Enter new password" name="newPassword"
                      onChange={(e: any) => { setNewPassword(e.target.value); setError((p) => ({ ...p, newPassword: !e.target.value ? "New password is required" : "" })); }}
                      error={error.newPassword}
                    />
                  </div>
                  <div className="ap-field" style={{ maxWidth: 480 }}>
                    <PasswordInput
                      label="Confirm Password" value={confirmPassword}
                      placeholder="Confirm new password" name="confirmPassword"
                      onChange={(e: any) => { setConfirmPassword(e.target.value); setError((p) => ({ ...p, confirmPassword: !e.target.value ? "Confirm password is required" : "" })); }}
                      error={error.confirmPassword}
                    />
                  </div>

                  <button className="ap-submit-btn" onClick={handleChangePassword}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2.5" strokeLinecap="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Update Password
                  </button>
                </>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

AdminProfile.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default AdminProfile;