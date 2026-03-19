import Button from "@/extra/Button";
import { ExInput, Textarea } from "@/extra/Input";
import PasswordInput from "@/extra/PasswordInput";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { createManagerUser, updateManagerUser } from "@/store/userSlice";
import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { useSelector } from "react-redux";
import { getStorageUrl } from "@/utils/config";
import countriesData from "@/api/countries.json";
import male from "@/assets/images/male.png";
import { toast } from "react-toastify";

interface ErrorState {
  name: string; email: string; mobile: string; password: string;
  mobileNumber: string; country: string; image: string;
  description: string; countryCode: string;
}

const ManagerDialog = () => {
  const dispatch = useAppDispatch();
  const { dialogue, dialogueData } = useSelector((state: RootStore) => state.dialogue);

  const [name, setName]               = useState("");
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [mobile, setMobile]           = useState("");
  const [description, setDescription] = useState<any>();
  const [countryCode, setCountryCode] = useState<any>("");
  const [countryOptions, setCountryOptions]   = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [imagePath, setImagePath] = useState<string>("");
  const [image, setImage]         = useState<any>(null);
  const [loadingCountries, setLoadingCountries] = useState(false);
  const [isSubmitting, setIsSubmitting]         = useState(false);

  // Identity Fields
  const [nationalId, setNationalId]           = useState("");
  const [nationalIdType, setNationalIdType]   = useState("other");
  const [nationalIdFront, setNationalIdFront] = useState<File | null>(null);
  const [nationalIdBack, setNationalIdBack]   = useState<File | null>(null);
  const [frontPreview, setFrontPreview]       = useState("");
  const [backPreview, setBackPreview]         = useState("");

  const isEdit = Boolean(dialogueData);

  const selectStyles = {
    control: (p: any, s: any) => ({
      ...p,
      background: "var(--bg) !important",
      border: s.isFocused ? "1.5px solid var(--ac) !important" : "1.5px solid var(--bd) !important",
      borderRadius: "11px !important",
      minHeight: "42px !important",
      height: "42px !important",
      boxShadow: s.isFocused ? "0 0 0 3px rgba(99,102,241,.12) !important" : "none !important",
      transition: "all .15s",
    }),
    valueContainer: (p: any) => ({ ...p, padding: "0 12px !important" }),
    input: (p: any) => ({ ...p, margin: "0 !important", padding: "0 !important" }),
    placeholder: (p: any) => ({ ...p, color: "var(--dim) !important", fontSize: "13px" }),
    singleValue: (p: any) => ({ ...p, color: "var(--td) !important", fontSize: "13.5px", margin: "0" }),
    menu: (p: any) => ({ ...p, borderRadius: "12px !important", overflow: "hidden !important", zIndex: 1000 }),
    option: (p: any, s: any) => ({
      ...p,
      backgroundColor: s.isSelected ? "var(--ac) !important" : s.isFocused ? "var(--as) !important" : "transparent !important",
      color: s.isSelected ? "#fff !important" : "var(--td) !important",
      cursor: "pointer !important",
      fontSize: "13px !important",
      padding: "10px 12px !important",
    }),
    indicatorSeparator: () => ({ display: "none !important" }),
    dropdownIndicator: (p: any) => ({ ...p, padding: "0 8px !important" }),
  };

  const [error, setError] = useState<ErrorState>({
    name:"", email:"", mobile:"", password:"", mobileNumber:"",
    country:"", image:"", description:"", countryCode:"",
  });

  useEffect(() => {
    if (dialogueData) {
      setName(dialogueData.name || "");
      setEmail(dialogueData.email || "");
      setPassword(dialogueData.password || "");
      setDescription(dialogueData?.description);
      setMobile(String(dialogueData.mobile || ""));
      setCountryCode(dialogueData.countryCode || "");
      setImagePath(getStorageUrl(dialogueData.image) || "");

      // Identity fields for edit
      setNationalId(dialogueData.nationalId || "");
      setNationalIdType(dialogueData.nationalIdType || "other");
      if (dialogueData.nationalIdImage) {
        setFrontPreview(getStorageUrl(dialogueData.nationalIdImage.front) || "");
        setBackPreview(getStorageUrl(dialogueData.nationalIdImage.back) || "");
      }
    }
  }, [dialogueData]);

  useEffect(() => {
    setLoadingCountries(true);
    try {
      const transformed = countriesData
        .filter((c) => c.name?.common && c.cca2 && c.flags?.png)
        .map((c) => ({
          value: c.cca2, label: c.name.common, name: c.name.common,
          code: c.cca2, flagUrl: c.flags.png || c.flags.svg, flag: c.flags.png || c.flags.svg,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setCountryOptions(transformed);
      if (dialogueData?.country) {
        const match = transformed.find((c: any) => c.name.toLowerCase() === dialogueData.country.toLowerCase());
        setSelectedCountry(match || null);
      } else {
        const india = transformed.find((c: any) => c.name === "India");
        setSelectedCountry(india || transformed[0] || null);
      }
    } catch {} finally { setLoadingCountries(false); }
  }, [dialogueData]);

  const handleInputImage = (e: any) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setError((p) => ({ ...p, image: "" }));
    }
  };

  const handleSelectChange = (selected: any) => {
    setSelectedCountry(selected);
    setError((p) => ({ ...p, country: selected ? "" : "Country is required" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const newError: Partial<ErrorState> = {};
      if (!name)   newError.name  = "Name is required";
      if (!email)  newError.email = "Email is required";
      else if (!email.includes("@")) newError.email = "Email must include '@'";
      if (!isEdit && !password) newError.password = "Password is required";
      if (!mobile) newError.mobile = "Mobile number is required";
      if (!countryCode) newError.countryCode = "Country code is required";
      if (!selectedCountry) newError.country = "Country is required";

      // Identity Validation (Aadhar requires both sides)
      if (nationalIdType === "aadhar" && !isEdit) {
        if (!nationalIdFront) toast.error("Front side of Aadhar is required");
        if (!nationalIdBack) toast.error("Back side of Aadhar is required");
        if (!nationalIdFront || !nationalIdBack) { setIsSubmitting(false); return; }
      }

      if (Object.keys(newError).length) { setError((p) => ({ ...p, ...newError })); setIsSubmitting(false); return; }
      setError({} as ErrorState);
      const formData = new FormData();
      if (isEdit) {
        formData.append("password", password);
        const result = await dispatch(updateManagerUser({ data: { password }, id: dialogueData!._id })).unwrap();
        if (!result.status) { toast.error(result.message || "Failed to update"); return; }
      } else {
        formData.append("name", name.trim());
        formData.append("email", email.trim().toLowerCase());
        formData.append("password", password!);
        formData.append("mobile", mobile);
        formData.append("countryCode", countryCode);
        formData.append("country", selectedCountry!.name);
        formData.append("countryFlagImage", selectedCountry!.flag);
        formData.append("nationalId", nationalId);
        formData.append("nationalIdType", nationalIdType);
        
        if (image) formData.append("image", image);
        if (nationalIdFront) formData.append("nationalIdFront", nationalIdFront);
        if (nationalIdBack) formData.append("nationalIdBack", nationalIdBack);
        const result = await dispatch(createManagerUser(formData)).unwrap();
        if (!result.status) { toast.error(result.message || "Failed to create"); return; }
      }
      dispatch(closeDialog());
    } catch (err: any) {
      toast.error(err?.message || "An unexpected error occurred");
    } finally { setIsSubmitting(false); }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        /* ── overlay ── */
        .md-overlay {
          position: fixed; inset: 0; z-index: 1200;
          background: rgba(15,17,35,0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
          animation: md-fade-in .18s ease;
        }
        @keyframes md-fade-in { from{opacity:0} to{opacity:1} }

        /* ── modal box ── */
        .md-box {
          --ac:  #6366f1; --ac2: #a855f7;
          --as:  rgba(99,102,241,0.09); --am: rgba(99,102,241,0.16);
          --bd:  #e8eaf2; --tx: #64748b; --td: #1e2235; --dim: #a0a8c0;
          --wh:  #ffffff; --bg: #f4f5fb; --rd: #f43f5e;

          font-family: 'Outfit', sans-serif;
          background: var(--wh);
          border-radius: 22px;
          width: 100%; max-width: 580px;
          box-shadow: 0 24px 64px rgba(15,17,35,.22), 0 0 0 1px rgba(99,102,241,.10);
          overflow: hidden;
          animation: md-slide-up .22s ease;
        }
        @keyframes md-slide-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        /* ── header ── */
        .md-box .md-head {
          padding: 20px 24px 18px;
          background: linear-gradient(135deg, rgba(99,102,241,.06), rgba(168,85,247,.03));
          border-bottom: 1px solid var(--bd);
          display: flex; align-items: center; justify-content: space-between;
          position: relative;
        }
        .md-box .md-head::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: linear-gradient(180deg, var(--ac), var(--ac2));
          border-radius: 0 2px 2px 0;
        }
        .md-box .md-head-l { display: flex; align-items: center; gap: 12px; padding-left: 10px; }
        .md-box .md-head-icon {
          width: 38px; height: 38px; border-radius: 11px; flex-shrink: 0;
          background: linear-gradient(135deg, var(--ac), var(--ac2));
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 3px 10px rgba(99,102,241,.28);
          font-size: 17px;
        }
        .md-box .md-head-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px; font-weight: 700; color: var(--td); margin: 0;
        }
        .md-box .md-head-sub {
          font-size: 12px; color: var(--dim); margin: 1px 0 0;
        }
        .md-box .md-close {
          width: 32px; height: 32px; border-radius: 9px;
          border: 1.5px solid var(--bd); background: var(--bg);
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; color: var(--dim); font-size: 14px;
          transition: all .13s; flex-shrink: 0;
        }
        .md-box .md-close:hover {
          background: #ffe4e6; border-color: #fecdd3; color: var(--rd);
        }

        /* ── body ── */
        .md-box .md-body {
          padding: 22px 24px;
          max-height: 70vh; overflow-y: auto;
        }
        .md-box .md-body::-webkit-scrollbar { width: 4px; }
        .md-box .md-body::-webkit-scrollbar-track { background: transparent; }
        .md-box .md-body::-webkit-scrollbar-thumb { background: var(--bd); border-radius: 4px; }

        /* section label */
        .md-box .md-sec-label {
          font-size: 10.5px; font-weight: 700; color: var(--dim);
          text-transform: uppercase; letter-spacing: .7px;
          margin: 0 0 12px; display: flex; align-items: center; gap: 7px;
        }
        .md-box .md-sec-label::after {
          content: ''; flex: 1; height: 1px; background: var(--bd);
        }

        /* 2-col grid */
        .md-box .md-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 0 14px;
        }
        .md-box .md-grid.full { grid-template-columns: 1fr; }

        /* ── input overrides ── */
        /* ── input overrides ── */
        .md-box input[type="text"]:not([class*="react-select"]),
        .md-box input[type="email"],
        .md-box input[type="number"],
        .md-box input[type="password"],
        .md-box input[type="file"],
        .md-box textarea {
          width: 100% !important;
          background: var(--bg) !important;
          border: 1.5px solid var(--bd) !important;
          border-radius: 11px !important;
          padding: 10px 14px !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 13.5px !important;
          color: var(--td) !important;
          outline: none !important;
          box-shadow: none !important;
          transition: border-color .15s, box-shadow .15s !important;
        }

        /* React Select Reset */
        .md-box .react-select__control input {
          width: auto !important;
          height: auto !important;
          padding: 0 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .md-box .react-select__value-container {
          padding: 0 12px !important;
          display: flex !important;
          align-items: center !important;
        }
        .md-box input:focus,
        .md-box textarea:focus {
          border-color: var(--ac) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12) !important;
          background: var(--wh) !important;
        }
        .md-box input::placeholder,
        .md-box textarea::placeholder { color: var(--dim) !important; }
        .md-box input:disabled {
          opacity: .55 !important; cursor: not-allowed !important;
        }
        /* label */
        .md-box label,
        .md-box .inputData label {
          font-size: 11.5px !important; font-weight: 600 !important;
          color: var(--dim) !important; text-transform: uppercase !important;
          letter-spacing: .5px !important; margin-bottom: 6px !important;
          display: block !important;
        }
        /* error */
        .md-box .text-danger,
        .md-box [class*="error"] {
          font-size: 11px !important; color: var(--rd) !important;
          margin-top: 4px !important;
        }

        /* ── react-select override ── */
        .md-box .react-select__control {
          background: var(--bg) !important;
          border: 1.5px solid var(--bd) !important;
          border-radius: 11px !important;
          min-height: 42px !important;
          box-shadow: none !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 13.5px !important;
          transition: border-color .15s !important;
        }
        .md-box .react-select__control:hover,
        .md-box .react-select__control--is-focused {
          border-color: var(--ac) !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,.12) !important;
          background: var(--wh) !important;
        }
        .md-box .react-select__placeholder { color: var(--dim) !important; font-size:13px !important; }
        .md-box .react-select__single-value { color: var(--td) !important; font-size:13.5px !important; }
        .md-box .react-select__menu {
          border-radius: 12px !important; border: 1px solid var(--bd) !important;
          box-shadow: 0 8px 30px rgba(15,17,35,.12) !important;
          overflow: hidden !important; font-family: 'Outfit', sans-serif !important;
        }
        .md-box .react-select__option {
          font-size: 13px !important; padding: 9px 12px !important;
          cursor: pointer !important;
        }
        .md-box .react-select__option--is-focused { background: var(--as) !important; }
        .md-box .react-select__option--is-selected { background: var(--ac) !important; color:#fff !important; }
        .md-box .react-select__indicator-separator { display:none !important; }

        /* ── image preview ── */
        .md-box .md-img-preview {
          width: 72px; height: 72px; border-radius: 14px;
          object-fit: cover; border: 2px solid var(--bd);
          margin-top: 10px;
          box-shadow: 0 2px 10px rgba(99,102,241,.12);
        }

        /* ── footer ── */
        .md-box .md-foot {
          padding: 16px 24px;
          border-top: 1px solid var(--bd);
          background: #fafbff;
          display: flex; align-items: center; justify-content: flex-end; gap: 10px;
        }
        .md-box .md-btn-cancel {
          height: 40px; padding: 0 18px; border-radius: 11px;
          border: 1.5px solid var(--bd); background: var(--bg);
          font-family: 'Outfit', sans-serif; font-size: 13.5px;
          font-weight: 600; color: var(--tx); cursor: pointer;
          transition: all .13s;
        }
        .md-box .md-btn-cancel:hover {
          border-color: var(--dim); color: var(--td);
        }
        .md-box .md-btn-submit {
          height: 40px; padding: 0 22px; border-radius: 11px;
          border: none;
          background: linear-gradient(135deg, var(--ac), var(--ac2));
          font-family: 'Outfit', sans-serif; font-size: 13.5px;
          font-weight: 700; color: #fff; cursor: pointer;
          box-shadow: 0 3px 12px rgba(99,102,241,.28);
          transition: transform .13s, box-shadow .13s;
          display: inline-flex; align-items: center; gap: 7px;
        }
        .md-box .md-btn-submit:hover:not(:disabled) {
          transform: translateY(-1px); box-shadow: 0 6px 18px rgba(99,102,241,.36);
        }
        .md-box .md-btn-submit:disabled { opacity:.55; cursor:not-allowed; }
        .md-box .md-spinner {
          width: 14px; height: 14px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,.35);
          border-top-color: #fff;
          animation: md-spin .7s linear infinite;
        }
        @keyframes md-spin { to{transform:rotate(360deg)} }

        /* divider between sections */
        .md-box .md-div { height:1px; background:var(--bd); margin:18px 0; }
      `}</style>

      <div className="md-overlay">
        <div className="md-box">

          {/* ── Header ── */}
          <div className="md-head">
            <div className="md-head-l">
              <div className="md-head-icon">{isEdit ? "✏️" : "👤"}</div>
              <div>
                <h2 className="md-head-title">{isEdit ? "Edit Manager" : "Create Manager"}</h2>
                <p className="md-head-sub">{isEdit ? "Update manager password" : "Fill in details to add a new manager"}</p>
              </div>
            </div>
            <div className="md-close" onClick={() => dispatch(closeDialog())}>✕</div>
          </div>

          {/* ── Body ── */}
          <div className="md-body">
            <form onSubmit={handleSubmit}>

              {/* Basic Info */}
              <p className="md-sec-label">Basic Info</p>
              <div className="md-grid">
                <ExInput
                  type="text" id="name" name="name" value={name}
                  label="Name" placeholder="Full name" disabled={isEdit}
                  errorMessage={error.name}
                  onChange={(e: any) => { setName(e.target.value); setError((p)=>({...p,name:e.target.value?"":"Name is required"})); }}
                />
                <ExInput
                  type="text" id="email" name="email" value={email}
                  label="Email" placeholder="email@example.com" disabled={isEdit}
                  errorMessage={error.email}
                  onChange={(e: any) => { const v=e.target.value; setEmail(v); setError((p)=>({...p,email:!v?"Email is required":!v.includes("@")?"Must include '@'":""})); }}
                />
              </div>

              <div className="md-div" />

              {/* Security & Contact */}
              <p className="md-sec-label">Security &amp; Contact</p>
              <div className="md-grid">
                <PasswordInput
                  label={isEdit ? "New Password" : "Password"}
                  value={password} placeholder="Password"
                  onChange={(e: any) => { setPassword(e.target.value); setError((p)=>({...p,password:!isEdit&&!e.target.value?"Password is required":""})); }}
                  error={error.password}
                />
                <ExInput
                  type="number" id="mobile" name="mobile" value={mobile}
                  label="Mobile Number" placeholder="eg. 9876543210" disabled={isEdit}
                  errorMessage={error.mobile}
                  onChange={(e: any) => { setMobile(e.target.value); setError((p)=>({...p,mobile:e.target.value?"":"Mobile is required"})); }}
                />
              </div>

              <div className="md-grid" style={{ marginTop: 0 }}>
                <ExInput
                  type="text" id="countryCode" name="countryCode" value={countryCode}
                  label="Country Code" placeholder="+91" disabled={isEdit}
                  errorMessage={error.countryCode}
                  onChange={(e: any) => { setCountryCode(e.target.value); setError((p)=>({...p,countryCode:e.target.value?"":"Code is required"})); }}
                />
                {/* spacer */}
                <div />
              </div>

              {/* Country + Image (create only) */}
              {!isEdit && (
                <>
                  <div className="md-div" />
                  <p className="md-sec-label">Location &amp; Profile</p>

                  <div className="md-grid full">
                    <div style={{ marginBottom: 14 }}>
                      <label>Country</label>
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
                            <img height={18} width={26} alt={option.name} src={option.flagUrl} style={{ objectFit:"cover", borderRadius:2 }} onError={(e:any)=>{e.target.style.display="none";}} />
                            <span>{option.label}</span>
                          </div>
                        )}
                        styles={selectStyles}
                      />
                      {error.country && <div className="text-danger" style={{fontSize:11,marginTop:4}}>{error.country}</div>}
                    </div>
                  </div>

                  <div style={{ marginBottom: 14 }}>
                    <ExInput
                      type="file" label="Profile Image"
                      accept="image/png, image/jpeg"
                      errorMessage={error.image}
                      onChange={handleInputImage}
                    />
                    <span style={{ fontSize:11, color:"#a0a8c0" }}>Accepted: PNG, JPEG</span>
                    {imagePath && (
                      <div>
                        <img src={imagePath} className="md-img-preview" alt="preview"
                          onError={(e:any)=>{e.target.onerror=null;e.target.src=male.src;}}
                        />
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="md-div" />

              {/* Description */}
              <p className="md-sec-label">Additional Info</p>
              <Textarea
                row={3} type="text" id="description" name="description"
                value={description} defaultValue={description}
                label="Description" placeholder="Brief description..."
                errorMessage={error.description}
                onChange={(e: any) => {
                  setDescription(e.target.value);
                  setError((p) => ({ ...p, description: e.target.value ? "" : "Description is required" }));
                }}
              />

              {!isEdit && (
                <>
                  <div className="md-div" />
                  <p className="md-sec-label">Identity Verification</p>
                  
                  <div className="md-grid">
                    <div style={{ marginBottom: 14 }}>
                      <label>ID Type</label>
                      <ReactSelect
                        options={[
                          { value: "aadhar", label: "Aadhar Card" },
                          { value: "pan", label: "PAN Card" },
                          { value: "driving", label: "Driving License" },
                          { value: "voter", label: "Voter ID" },
                          { value: "passport", label: "Passport" },
                          { value: "other", label: "Other" },
                        ]}
                        value={{ value: nationalIdType, label: nationalIdType.charAt(0).toUpperCase() + nationalIdType.slice(1) }}
                        onChange={(opt: any) => setNationalIdType(opt.value)}
                        classNamePrefix="react-select"
                        styles={selectStyles}
                      />
                    </div>
                    <ExInput
                      type="text" label="Identity Number"
                      placeholder="Enter ID number"
                      value={nationalId}
                      onChange={(e: any) => setNationalId(e.target.value)}
                    />
                  </div>

                  <div className="md-grid">
                    <div style={{ marginBottom: 14 }}>
                      <label>National ID Front</label>
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setNationalIdFront(e.target.files[0]);
                            setFrontPreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                      {frontPreview && <img src={frontPreview} className="md-img-preview" alt="front" />}
                    </div>

                    <div style={{ marginBottom: 14 }}>
                      <label>National ID Back</label>
                      <input
                        type="file"
                        onChange={(e) => {
                          if (e.target.files?.[0]) {
                            setNationalIdBack(e.target.files[0]);
                            setBackPreview(URL.createObjectURL(e.target.files[0]));
                          }
                        }}
                      />
                      {backPreview && <img src={backPreview} className="md-img-preview" alt="back" />}
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* ── Footer ── */}
          <div className="md-foot">
            <button type="button" className="md-btn-cancel" onClick={() => dispatch(closeDialog())}>
              Cancel
            </button>
            <button type="submit" className="md-btn-submit" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting
                ? <><span className="md-spinner" />{isEdit ? "Updating..." : "Creating..."}</>
                : <>{isEdit ? "Update Manager" : "Create Manager"}</>
              }
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default ManagerDialog;