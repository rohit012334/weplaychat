import Button from "@/extra/Button";
import { ExInput, Textarea } from "@/extra/Input";
import PasswordInput from "@/extra/PasswordInput";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { useSelector } from "react-redux";
import { createAgency, updateAgency } from "@/store/agencySlice";
import { baseURL } from "@/utils/config";
import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  signInWithEmailAndPassword,
  updateEmail,
  updatePassword,
  User,
} from "firebase/auth";
import { auth } from "../lib/firebaseConfig";
import countriesData from "@/api/countries.json";
import male from "@/assets/images/male.png";
import { toast } from "react-toastify";

interface ErrorState {
  name: string; email: string; commission: string; password: string;
  mobileNumber: string; country: string; image: string;
  description: string; countryCode: string;
}

const AgencyDialog = () => {
  const dispatch = useAppDispatch();
  const { dialogue, dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const isEdit = Boolean(dialogueData);

  const [name,           setName]           = useState("");
  const [email,          setEmail]          = useState("");
  const [commissionType, setCommissionType] = useState<number>(1); // 1: Percentage, 2: Salary
  const [commission,     setCommission]     = useState<string>("");
  const [password,       setPassword]       = useState("");
  const [mobileNumber,   setMobileNumber]   = useState("");
  const [countryCode,    setCountryCode]    = useState<any>();
  const [countryOptions, setCountryOptions] = useState<any[]>([]);
  const [selectedCountry,setSelectedCountry]= useState<any>(null);
  const [imagePath,      setImagePath]      = useState<string>();
  const [description,    setDescription]    = useState<any>();
  const [image,          setImage]          = useState<any>();
  const [loadingCountries,setLoadingCountries] = useState(false);
  const [isSubmitting,   setIsSubmitting]   = useState(false);

  const selectStyles = {
    control: (p: any, s: any) => ({
      ...p,
      background: "var(--bg) !important",
      border: s.isFocused ? "1.5px solid var(--accent) !important" : "1.5px solid var(--border) !important",
      borderRadius: "10px !important",
      minHeight: "42px !important",
      height: "42px !important",
      boxShadow: s.isFocused ? "0 0 0 3px var(--a-soft) !important" : "none !important",
      transition: "all .15s",
    }),
    valueContainer: (p: any) => ({ ...p, padding: "0 12px !important" }),
    input: (p: any) => ({ ...p, margin: "0 !important", padding: "0 !important" }),
    placeholder: (p: any) => ({ ...p, color: "var(--txt-dim) !important", fontSize: "13px" }),
    singleValue: (p: any) => ({ ...p, color: "var(--txt-dark) !important", fontSize: "13.5px", margin: "0" }),
    menu: (p: any) => ({ ...p, borderRadius: "12px !important", overflow: "hidden !important", zIndex: 1000 }),
    option: (p: any, s: any) => ({
      ...p,
      backgroundColor: s.isSelected ? "var(--accent) !important" : s.isFocused ? "var(--a-soft) !important" : "transparent !important",
      color: s.isSelected ? "#fff !important" : "var(--txt-dark) !important",
      cursor: "pointer !important",
      fontSize: "13px !important",
      padding: "10px 12px !important",
    }),
    indicatorSeparator: () => ({ display: "none !important" }),
    dropdownIndicator: (p: any) => ({ ...p, padding: "0 8px !important" }),
  };

  const [error, setError] = useState<ErrorState>({
    name:"", email:"", commission:"", password:"",
    mobileNumber:"", country:"", image:"", description:"", countryCode:"",
  });

  const updatedImagePath = dialogueData?.image?.replace(/\\/g, "/");

  useEffect(() => {
    if (dialogueData) {
      setName(dialogueData.name || "");
      setEmail(dialogueData.email || "");
      setCommission(dialogueData.commission?.toString() || "");
      setCommissionType(dialogueData.commissionType || 1);
      setMobileNumber(dialogueData.mobileNumber?.toString() || "");
    } else {
      setName("");
      setEmail("");
      setCommission("");
      setCommissionType(1);
      setPassword("");
      setMobileNumber("");
      setImagePath("");
      setDescription("");
      setCountryCode("");
      setImage(null);
      setSelectedCountry(null);
    }
  }, [dialogueData]);

  useEffect(() => {
    setLoadingCountries(true);
    try {
      const transformed = countriesData
        .filter((c) => c.name?.common && c.cca2 && c.flags?.png)
        .map((c) => ({
          value: c.cca2, label: c.name.common, name: c.name.common,
          code: c.cca2, flagUrl: c.flags.png || c.flags.svg,
          flag: c.flags.png || c.flags.svg,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setCountryOptions(transformed);
      if (dialogueData?.country) {
        const found = transformed.find((c) => c.name.toLowerCase() === dialogueData.country.toLowerCase());
        setSelectedCountry(found || null);
      } else {
        setSelectedCountry(transformed.find((c) => c.name === "India") || transformed[0] || null);
      }
    } catch { /* silent */ }
    finally { setLoadingCountries(false); }
  }, [dialogueData]);

  const getUserFriendlyErrorMessage = (code: string) => {
    const map: Record<string,string> = {
      "auth/user-mismatch":        "Authentication failed. Please try again.",
      "auth/user-not-found":       "User not found.",
      "auth/wrong-password":       "Current password is incorrect.",
      "auth/invalid-email":        "Please enter a valid email address.",
      "auth/email-already-in-use": "This email is already registered.",
      "auth/weak-password":        "Password must be at least 6 characters.",
      "auth/requires-recent-login":"Please log in again and retry.",
      "auth/invalid-credential":   "Invalid credentials.",
      "auth/too-many-requests":    "Too many attempts. Try again later.",
    };
    return map[code] || "An error occurred. Please try again.";
  };

  const updateFirebaseCredentials = async (
    currentEmail: string, currentPassword: string,
    newEmail?: string, newPassword?: string
  ): Promise<User | null> => {
    const { user } = await signInWithEmailAndPassword(auth, currentEmail, currentPassword);
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(currentEmail, currentPassword));
    if (newEmail && newEmail !== currentEmail) await updateEmail(user, newEmail);
    if (newPassword && newPassword !== currentPassword) await updatePassword(user, newPassword);
    return user;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newError: Partial<ErrorState> = {};
      if (!name)         newError.name         = "Name is required";
      if (!email)        newError.email        = "Email is required";
      else if (!email.includes("@")) newError.email = "Email must include '@'";
      if (!commission)   newError.commission   = "Commission is required";
      if (!isEdit && !password) newError.password = "Password is required";
      if (!mobileNumber) newError.mobileNumber = "Mobile Number is required";
      if (!description)  newError.description  = "Description is required";
      if (!countryCode)  newError.countryCode  = "Country code is required";

      if (!selectedCountry) newError.country   = "Country is required";
      if (!isEdit && !image) newError.image = "Profile image is required";

      if (Object.keys(newError).length) {
        setError(newError as ErrorState);
        // Show the first error in toast for better visibility
        const firstError = Object.values(newError)[0];
        toast.error(firstError);
        setIsSubmitting(false);
        return;
      }
      setError({} as ErrorState);

      const formData: any = new FormData();
      const appendIfChanged = (key: string, value: any) => {
        if (!isEdit || dialogueData![key] !== value) formData.append(key, String(value));
      };
      appendIfChanged("name", name); appendIfChanged("email", email);
      appendIfChanged("commission", commission); appendIfChanged("password", password || "");
      appendIfChanged("mobileNumber", mobileNumber); appendIfChanged("description", description);
      appendIfChanged("commissionType", commissionType.toString());
      appendIfChanged("countryCode", countryCode);

      if (!isEdit || image) formData.append("image", image!);
      if (!isEdit || selectedCountry?.name !== dialogueData?.country) formData.append("country", selectedCountry!.name);
      if (!isEdit || selectedCountry?.flag !== dialogueData?.countryFlagImage) formData.append("countryFlagImage", selectedCountry!.flag);

      let user: User | null = null;
      if (isEdit) {
        const emailChanged    = email !== dialogueData.email;
        const passwordChanged = password && password.length > 0 && password !== dialogueData?.password;
        if (emailChanged || passwordChanged) {
          try {
            user = await updateFirebaseCredentials(
              dialogueData.email, dialogueData.password,
              emailChanged ? email : undefined,
              passwordChanged ? password : undefined
            );
            if (user) formData.append("uid", user.uid);
          } catch (authError: any) {
            toast.error(authError.message || "Auth error");
            return;
          }
        }
        await dispatch(updateAgency({ agencyId: dialogueData!._id, formData })).unwrap();
      } else {
        try {
          const { user: newUser } = await createUserWithEmailAndPassword(auth, email, password!);
          user = newUser;
          formData.append("uid", user.uid);
          await dispatch(createAgency(formData)).unwrap();
        } catch (createError: any) {
          if (createError.code) {
            const fieldError: Partial<ErrorState> = {};
            if (createError.code === "auth/email-already-in-use") fieldError.email = "This email is already registered";
            else if (createError.code === "auth/weak-password")   fieldError.password = "Password must be at least 6 characters";
            else if (createError.code === "auth/invalid-email")   fieldError.email = "Please enter a valid email address";
            else { toast.error("Failed to create agency"); return; }
            setError(fieldError as ErrorState);
            if (user) { try { await (user as any).delete(); } catch {} }
            return;
          }
          toast.error("Failed to create agency");
          return;
        }
      }
      dispatch(closeDialog());
    } catch { toast.error("An unexpected error occurred"); }
    finally { setIsSubmitting(false); }
  };

  const handleSelectChange = (selected: any) => {
    setSelectedCountry(selected);
    setError({ ...error, country: selected ? "" : "Country is required" });
  };

  const handleInputImage = (e: any) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setError({ ...error, image: "" });
    }
  };

  const Field = ({ children, label, error: err }: { children: React.ReactNode; label: string; error?: string }) => (
    <div className="agy-field">
      <label className="agy-label">{label}</label>
      {children}
      {err && <span className="agy-error"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{err}</span>}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .agy-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(20, 24, 40, 0.50);
          backdrop-filter: blur(5px);
          display: flex; align-items: center; justify-content: center;
          padding: 20px; overflow-y: auto;
          animation: agy-fade .18s ease;
        }
        @keyframes agy-fade { from{opacity:0} to{opacity:1} }

        .agy-box {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.22);
          --rose:     #f43f5e;
          --r-soft:   rgba(244,63,94,0.08);
          --green:    #10b981;
          --border:   #e8eaf2;
          --txt:      #64748b;
          --txt-dark: #1e2235;
          --txt-dim:  #a0a8c0;
          --white:    #ffffff;
          --bg:       #f4f5fb;

          width: 100%; max-width: 640px;
          background: var(--white);
          border-radius: 22px;
          border: 1px solid var(--border);
          box-shadow: 0 24px 64px rgba(20,24,40,0.18), 0 4px 20px rgba(99,102,241,0.10);
          overflow: hidden;
          animation: agy-slide .22s ease;
          font-family: 'Outfit', sans-serif;
        }
        @keyframes agy-slide {
          from { opacity:0; transform: translateY(-14px) scale(.97); }
          to   { opacity:1; transform: translateY(0) scale(1); }
        }

        /* ── Header ── */
        .agy-header {
          padding: 22px 26px 18px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(99,102,241,0.07), rgba(168,85,247,0.04));
          display: flex; align-items: center; justify-content: space-between;
          position: relative;
        }
        .agy-header::before {
          content:''; position:absolute; left:0; top:0; bottom:0;
          width:4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          border-radius: 0 3px 3px 0;
        }
        .agy-header-left { display:flex; align-items:center; gap:14px; }
        .agy-hicon {
          width:44px; height:44px; border-radius:13px; flex-shrink:0;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          display:flex; align-items:center; justify-content:center;
          box-shadow: 0 4px 14px var(--a-glow);
        }
        .agy-htitle {
          font-family:'Rajdhani',sans-serif; font-size:21px; font-weight:700;
          color:var(--txt-dark); margin:0; line-height:1.2;
        }
        .agy-hsub { font-size:12px; color:var(--txt-dim); margin-top:2px; }
        .agy-close {
          width:32px; height:32px; border-radius:9px;
          background:var(--bg); border:1.5px solid var(--border);
          color:var(--txt-dim); display:flex; align-items:center; justify-content:center;
          cursor:pointer; flex-shrink:0;
          transition: background .14s, color .14s, border-color .14s;
        }
        .agy-close:hover { background:var(--r-soft); border-color:var(--rose); color:var(--rose); }

        /* ── Scrollable body ── */
        .agy-body {
          padding: 24px 26px;
          max-height: 70vh;
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--border) transparent;
        }
        .agy-body::-webkit-scrollbar { width:5px; }
        .agy-body::-webkit-scrollbar-track { background:transparent; }
        .agy-body::-webkit-scrollbar-thumb { background:var(--border); border-radius:10px; }

        /* Mode badge */
        .agy-mode {
          display:inline-flex; align-items:center; gap:6px;
          padding:5px 12px; border-radius:20px; margin-bottom:20px;
          font-size:12px; font-weight:600;
          background:var(--a-soft); color:var(--accent);
          border:1px solid var(--a-mid); width:fit-content;
        }

        /* Section label */
        .agy-sec {
          display:flex; align-items:center; gap:8px;
          font-size:10px; font-weight:700; letter-spacing:1.2px;
          text-transform:uppercase; color:var(--txt-dim);
          margin: 18px 0 14px;
        }
        .agy-sec::after { content:''; flex:1; height:1px; background:var(--border); }
        .agy-sec:first-of-type { margin-top:0; }

        /* Grid */
        .agy-grid2 { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .agy-grid1 { display:grid; grid-template-columns:1fr; gap:14px; }

        /* Field wrapper */
        .agy-field { display:flex; flex-direction:column; gap:5px; }
        .agy-label {
          font-size:10.5px; font-weight:700; letter-spacing:.6px;
          text-transform:uppercase; color:var(--txt-dim);
        }
        .agy-error {
          display:flex; align-items:center; gap:4px;
          font-size:11.5px; color:var(--rose); font-weight:500; margin-top:1px;
        }

        /* Input overrides */
        .agy-body .inputData input,
        .agy-body .inputData textarea {
          background: var(--bg) !important;
          border: 1.5px solid var(--border) !important;
          border-radius: 10px !important;
          padding: 10px 14px !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 13.5px !important;
          color: var(--txt-dark) !important;
          transition: border-color .15s, box-shadow .15s !important;
          box-shadow: none !important;
          outline: none !important;
        }
        .agy-body .inputData input:focus,
        .agy-body .inputData textarea:focus {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--a-soft) !important;
        }
        .agy-body .inputData label {
          font-size: 10.5px !important; font-weight: 700 !important;
          letter-spacing: .6px !important; text-transform: uppercase !important;
          color: var(--txt-dim) !important; margin-bottom: 5px !important;
        }
        .agy-body .inputData .text-danger,
        .agy-body .text-danger { font-size:11.5px !important; color:var(--rose) !important; }

        /* React Select override */
        .agy-body .react-select__control {
          background: var(--bg) !important;
          border: 1.5px solid var(--border) !important;
          border-radius: 10px !important;
          min-height: 42px !important;
          box-shadow: none !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 13.5px !important;
          transition: border-color .15s !important;
        }
        .agy-body .react-select__control:hover,
        .agy-body .react-select__control--is-focused {
          border-color: var(--accent) !important;
          box-shadow: 0 0 0 3px var(--a-soft) !important;
        }
        .agy-body .react-select__menu { border-radius:12px !important; border:1px solid var(--border) !important; box-shadow:0 8px 24px rgba(30,34,53,.12) !important; overflow:hidden; }
        .agy-body .react-select__option:hover { background:var(--a-soft) !important; }
        .agy-body .react-select__option--is-selected { background:var(--accent) !important; }
        .agy-body .react-select__placeholder { color:var(--txt-dim) !important; }

        /* Image upload zone */
        .agy-upload {
          border: 2px dashed var(--border);
          border-radius: 12px;
          padding: 18px;
          text-align: center;
          background: var(--bg);
          cursor: pointer;
          transition: border-color .15s, background .15s;
          position: relative;
        }
        .agy-upload:hover { border-color: var(--accent); background: var(--a-soft); }
        .agy-upload input[type=file] {
          position:absolute; inset:0; opacity:0; cursor:pointer; width:100%; height:100%;
        }
        .agy-upload-icon {
          width:38px; height:38px; border-radius:10px; margin:0 auto 8px;
          background: var(--a-soft); color:var(--accent);
          display:flex; align-items:center; justify-content:center;
        }
        .agy-upload-text { font-size:13px; font-weight:600; color:var(--txt-dark); }
        .agy-upload-hint { font-size:11px; color:var(--txt-dim); margin-top:2px; }

        /* Image preview */
        .agy-preview {
          display:flex; align-items:center; gap:14px;
          background:var(--bg); border:1.5px solid var(--border);
          border-radius:12px; padding:12px 14px; margin-top:10px;
        }
        .agy-preview img {
          width:60px; height:60px; border-radius:10px;
          object-fit:cover; border:2px solid var(--border); flex-shrink:0;
        }
        .agy-preview-info { flex:1; min-width:0; }
        .agy-preview-name { font-size:13px; font-weight:600; color:var(--txt-dark); }
        .agy-preview-sub  { font-size:11px; color:var(--txt-dim); margin-top:2px; }

        /* ── Footer ── */
        .agy-footer {
          padding: 16px 26px 20px;
          border-top: 1px solid var(--border);
          display:flex; align-items:center; justify-content:flex-end; gap:10px;
          background: rgba(244,245,251,0.6);
        }
        .agy-btn {
          display:inline-flex; align-items:center; gap:7px;
          padding:10px 22px; border-radius:10px;
          font-family:'Outfit',sans-serif; font-size:14px; font-weight:600; cursor:pointer;
          transition: background .15s, box-shadow .15s, transform .12s, border-color .15s;
          border:1.5px solid transparent;
        }
        .agy-btn:disabled { opacity:.55; cursor:not-allowed; }
        .agy-btn-cancel {
          background:var(--white); border-color:var(--border); color:var(--txt);
        }
        .agy-btn-cancel:hover:not(:disabled) {
          background:var(--r-soft); border-color:var(--rose); color:var(--rose);
        }
        .agy-btn-submit {
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color:#fff; box-shadow:0 4px 14px var(--a-glow);
        }
        .agy-btn-submit:hover:not(:disabled) {
          box-shadow:0 6px 22px var(--a-glow); transform:translateY(-1px);
        }
        .agy-spin {
          width:14px; height:14px; border-radius:50%;
          border:2px solid rgba(255,255,255,.3); border-top-color:#fff;
          animation:agy-spin .7s linear infinite; flex-shrink:0;
        }
        @keyframes agy-spin { to{transform:rotate(360deg)} }
      `}</style>

      <div className="agy-overlay">
        <div className="agy-box">

          {/* ── Header ── */}
          <div className="agy-header">
            <div className="agy-header-left">
              <div className="agy-hicon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  {isEdit
                    ? <><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></>
                    : <><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/></>
                  }
                </svg>
              </div>
              <div>
                <h2 className="agy-htitle">{isEdit ? "Edit Agency" : "Create Agency"}</h2>
                <p className="agy-hsub">{isEdit ? "Update agency details below" : "Fill in all details to register a new agency"}</p>
              </div>
            </div>
            <div className="agy-close" onClick={() => dispatch(closeDialog())}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </div>
          </div>

          {/* ── Body ── */}
          <form className="agy-body" onSubmit={handleSubmit}>

            {/* Mode badge */}
            <div className="agy-mode">
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                {isEdit
                  ? <><path d="M11 4H4a2 2 0 0 0-2 2v14"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4z"/></>
                  : <><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></>
                }
              </svg>
              {isEdit ? "Edit Mode" : "Create Mode — all fields required"}
            </div>

            {/* ── Basic Info ── */}
            <div className="agy-sec">Basic Information</div>
            <div className="agy-grid2">
              <ExInput type="text" id="name" name="name" value={name} label="Name"
                placeholder="Agency name" errorMessage={error.name}
                onChange={(e: any) => { setName(e.target.value); setError({...error, name: e.target.value ? "" : "Name is required"}); }}
              />
              <ExInput type="text" id="email" name="email" value={email} label="Email"
                placeholder="Agency email" errorMessage={error.email}
                onChange={(e: any) => {
                  const v = e.target.value; setEmail(v);
                  setError({...error, email: !v ? "Email is required" : !v.includes("@") ? "Email must include '@'" : ""});
                }}
              />
              {/* Commission Type Selection */}
              <div className="agy-field">
                <label className="agy-label">Commission Type</label>
                <ReactSelect
                  options={[
                    { label: "Percentage (%)", value: 1 },
                    { label: "Salary", value: 2 },
                  ]}
                  value={commissionType === 1 ? { label: "Percentage (%)", value: 1 } : { label: "Salary", value: 2 }}
                  onChange={(opt: any) => setCommissionType(opt.value)}
                  classNamePrefix="react-select"
                  placeholder="Select Type"
                  styles={selectStyles}
                />
              </div>

              {/* Commission Value */}
              <div className="agy-field">
                <label className="agy-label">{commissionType === 1 ? "Commission (%)" : "Salary Amount"}</label>
                <input
                  type="number"
                  className="inputData" // Apply inputData class for styling
                  placeholder={commissionType === 1 ? "Enter percentage" : "Enter amount"}
                  value={commission}
                  onChange={(e) => { setCommission(e.target.value); setError({...error, commission: e.target.value ? "" : "Commission is required"}); }}
                />
                {error.commission && (
                  <span className="agy-error">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                    {error.commission}
                  </span>
                )}
              </div>
              <PasswordInput label="Password" value={password}
                placeholder={isEdit ? "New password (optional)" : "Create password"}
                onChange={(e: any) => {
                  setPassword(e.target.value);
                  setError({...error, password: (!dialogueData && !e.target.value) ? "Password is required" : ""});
                }}
                error={error.password}
              />
            </div>

            {/* ── Contact ── */}
            <div className="agy-sec">Contact Details</div>
            <div className="agy-grid2">
              <ExInput type="number" id="countryCode" name="countryCode" value={countryCode}
                label="Country Code" placeholder="+91" errorMessage={error.countryCode}
                onChange={(e: any) => {
                  const v = e.target.value; setCountryCode(v);
                  setError({...error, countryCode: !v ? "Country code required" : v <= 0 ? "Must be > 0" : ""});
                }}
              />
              <ExInput type="number" id="mobileNumber" name="mobileNumber" value={mobileNumber}
                label="Mobile Number" placeholder="10-digit number" errorMessage={error.mobileNumber}
                onChange={(e: any) => { setMobileNumber(e.target.value); setError({...error, mobileNumber: e.target.value ? "" : "Mobile number is required"}); }}
              />
            </div>

            {/* ── Country ── */}
            <div className="agy-sec">Location</div>
            <div className="agy-field" style={{ marginBottom: 14 }}>
              <label className="agy-label">Country</label>
              <ReactSelect
                options={countryOptions}
                value={selectedCountry}
                isClearable
                isLoading={loadingCountries}
                placeholder="Select a country..."
                onChange={handleSelectChange}
                classNamePrefix="react-select"
                formatOptionLabel={(option: any) => (
                  <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                    <img height={18} width={26} alt={option.name} src={option.flagUrl}
                      style={{ objectFit:"cover", borderRadius:3, flexShrink:0 }}
                      onError={(e: any) => { e.target.style.display = "none"; }}
                    />
                    <span>{option.label}</span>
                  </div>
                )}
                styles={selectStyles}
              />
              {error.country && (
                <span className="agy-error">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  {error.country}
                </span>
              )}
            </div>

            {/* ── Media ── */}
            <div className="agy-sec">Profile Image</div>
            <div className="agy-upload">
              <input type="file" accept="image/png,image/jpeg" onChange={handleInputImage}/>
              <div className="agy-upload-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <rect x="3" y="3" width="18" height="18" rx="4"/><circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div className="agy-upload-text">Click to upload image</div>
              <div className="agy-upload-hint">PNG or JPEG accepted</div>
            </div>

            {imagePath && (
              <div className="agy-preview">
                <img src={imagePath} alt="Preview"
                  onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }}
                />
                <div className="agy-preview-info">
                  <div className="agy-preview-name">Image Preview</div>
                  <div className="agy-preview-sub">Looking good!</div>
                </div>
              </div>
            )}

            {/* ── Description ── */}
            <div className="agy-sec">Description</div>
            <Textarea row={3} type="text" id="description" name="description"
              value={description} defaultValue={description}
              label="Description" placeholder="Brief description about the agency..."
              errorMessage={error.description}
              onChange={(e: any) => { setDescription(e.target.value); setError({...error, description: e.target.value ? "" : "Description is required"}); }}
            />

          </form>

          {/* ── Footer ── */}
          <div className="agy-footer">
            <button type="button" className="agy-btn agy-btn-cancel"
              onClick={() => dispatch(closeDialog())} disabled={isSubmitting}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
              Cancel
            </button>
            <button type="submit" className="agy-btn agy-btn-submit"
              disabled={isSubmitting} onClick={handleSubmit as any}>
              {isSubmitting
                ? <><div className="agy-spin"/> Processing…</>
                : <>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2.2" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                    {isEdit ? "Update Agency" : "Create Agency"}
                  </>
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default AgencyDialog;