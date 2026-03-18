import { ExInput, Textarea } from "@/extra/Input";
import PasswordInput from "@/extra/PasswordInput";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { createReseller, updateReseller } from "@/store/userSlice";
import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { useSelector } from "react-redux";
import { baseURL } from "@/utils/config";
import countriesData from "@/api/countries.json";
import male from "@/assets/images/male.png";
import { toast } from "react-toastify";

interface ErrorState {
    name: string; email: string; mobile: string; password: string;
    country: string; image: string; description: string;
    countryCode: string; nationalId: string;
}

const ResellerDialog = () => {
    const dispatch = useAppDispatch();
    const { dialogueData } = useSelector((state: RootStore) => state.dialogue);

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [mobile, setMobile] = useState("");
    const [description, setDescription] = useState("");
    const [nationalId, setNationalId] = useState("");
    const [nationalIdType, setNationalIdType] = useState("other");
    const [nationalIdFront, setNationalIdFront] = useState<any>(null);
    const [nationalIdBack, setNationalIdBack] = useState<any>(null);
    const [frontPreview, setFrontPreview] = useState("");
    const [backPreview, setBackPreview] = useState("");
    const [countryCode, setCountryCode] = useState<any>("");
    const [countryOptions, setCountryOptions] = useState<any[]>([]);
    const [selectedCountry, setSelectedCountry] = useState<any>(null);
    const [imagePath, setImagePath] = useState<string>("");
    const [image, setImage] = useState<any>(null);
    const [loadingCountries, setLoadingCountries] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
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

    const [error, setError] = useState<Partial<ErrorState>>({
        name: "", email: "", mobile: "", password: "",
        country: "", image: "", description: "", countryCode: "", nationalId: "",
    });

    useEffect(() => {
        if (dialogueData) {
            setName(dialogueData.name || "");
            setEmail(dialogueData.email || "");
            setPassword(dialogueData.password || "");
            setDescription(dialogueData?.description || "");
            setMobile(String(dialogueData.mobile || ""));
            setCountryCode(dialogueData.countryCode || "");
            setNationalId(dialogueData?.nationalId || "");
            setNationalIdType(dialogueData?.nationalIdType || "other");
            setImagePath(dialogueData.image ? baseURL + dialogueData.image.replace(/\\/g, "/") : "");
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
                setSelectedCountry(transformed.find((c: any) => c.name.toLowerCase() === dialogueData.country.toLowerCase()) || null);
            } else {
                setSelectedCountry(transformed.find((c: any) => c.name === "India") || transformed[0] || null);
            }
        } catch { } finally { setLoadingCountries(false); }
    }, [dialogueData]);

    const handleInputImage = (e: any) => {
        if (e.target.files?.[0]) {
            setImage(e.target.files[0]);
            setImagePath(URL.createObjectURL(e.target.files[0]));
            setError((p) => ({ ...p, image: "" }));
        }
    };

    const handleFrontImage = (e: any) => {
        if (e.target.files?.[0]) {
            setNationalIdFront(e.target.files[0]);
            setFrontPreview(URL.createObjectURL(e.target.files[0]));
        }
    };

    const handleBackImage = (e: any) => {
        if (e.target.files?.[0]) {
            setNationalIdBack(e.target.files[0]);
            setBackPreview(URL.createObjectURL(e.target.files[0]));
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
            if (!name) newError.name = "Name is required";
            if (!email) newError.email = "Email is required";
            else if (!email.includes("@")) newError.email = "Must include '@'";
            if (!isEdit && !password) newError.password = "Password is required";
            if (!mobile) newError.mobile = "Mobile is required";
            if (!countryCode) newError.countryCode = "Country code is required";
            if (!selectedCountry) newError.country = "Country is required";
            if (!nationalId) newError.nationalId = "National ID is required";

            if (nationalIdType === "aadhar" && !isEdit) {
                if (!nationalIdFront || !nationalIdBack) {
                    toast.error("Both front and back images are required for Aadhar");
                    setIsSubmitting(false);
                    return;
                }
            }

            if (Object.keys(newError).length) { setError((p) => ({ ...p, ...newError })); setIsSubmitting(false); return; }
            setError({});
            const formData = new FormData();
            if (isEdit) {
                formData.append("password", password);
                const result = await dispatch(updateReseller({ data: { password }, id: dialogueData!._id })).unwrap();
                if (!result.status) { toast.error(result.message || "Failed to update"); return; }
            } else {
                formData.append("name", name.trim());
                formData.append("email", email.trim().toLowerCase());
                formData.append("password", password!);
                formData.append("mobile", mobile);
                formData.append("countryCode", countryCode);
                formData.append("nationalId", nationalId);
                formData.append("nationalIdType", nationalIdType);
                formData.append("country", selectedCountry!.name);
                formData.append("countryFlagImage", selectedCountry!.flag);
                if (image) formData.append("image", image);
                if (nationalIdFront) formData.append("nationalIdFront", nationalIdFront);
                if (nationalIdBack) formData.append("nationalIdBack", nationalIdBack);

                const result = await dispatch(createReseller(formData)).unwrap();
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

        .rd-overlay {
          position:fixed; inset:0; z-index:1200;
          background:rgba(15,17,35,0.55);
          backdrop-filter:blur(5px);
          display:flex; align-items:center; justify-content:center;
          padding:16px;
          animation:rd-in .18s ease;
        }
        @keyframes rd-in { from{opacity:0} to{opacity:1} }

        .rd-box {
          --ac:#6366f1; --ac2:#a855f7;
          --as:rgba(99,102,241,0.09); --am:rgba(99,102,241,0.16);
          --bd:#e8eaf2; --tx:#64748b; --td:#1e2235; --dim:#a0a8c0;
          --wh:#ffffff; --bg:#f4f5fb; --rd2:#f43f5e;

          font-family:'Outfit',sans-serif;
          background:var(--wh);
          border-radius:22px;
          width:100%; max-width:600px;
          box-shadow:0 24px 64px rgba(15,17,35,.22), 0 0 0 1px rgba(99,102,241,.10);
          overflow:hidden;
          animation:rd-up .22s ease;
        }
        @keyframes rd-up { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }

        /* ── Header ── */
        .rd-box .rd-head {
          padding:20px 24px 18px;
          background:linear-gradient(135deg,rgba(99,102,241,.06),rgba(168,85,247,.03));
          border-bottom:1px solid var(--bd);
          display:flex; align-items:center; justify-content:space-between;
          position:relative;
        }
        .rd-box .rd-head::before {
          content:''; position:absolute; left:0; top:0; bottom:0; width:4px;
          background:linear-gradient(180deg,var(--ac),var(--ac2));
          border-radius:0 2px 2px 0;
        }
        .rd-box .rd-head-l { display:flex; align-items:center; gap:12px; padding-left:10px; }
        .rd-box .rd-head-icon {
          width:40px; height:40px; border-radius:12px; flex-shrink:0;
          background:linear-gradient(135deg,var(--ac),var(--ac2));
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 3px 10px rgba(99,102,241,.28); font-size:18px;
        }
        .rd-box .rd-head-title { font-family:'Rajdhani',sans-serif; font-size:21px; font-weight:700; color:var(--td); margin:0; }
        .rd-box .rd-head-sub   { font-size:12px; color:var(--dim); margin:1px 0 0; }
        .rd-box .rd-close {
          width:32px; height:32px; border-radius:9px;
          border:1.5px solid var(--bd); background:var(--bg);
          display:flex; align-items:center; justify-content:center;
          cursor:pointer; color:var(--dim); font-size:14px;
          transition:all .13s; flex-shrink:0;
        }
        .rd-box .rd-close:hover { background:#ffe4e6; border-color:#fecdd3; color:var(--rd2); }

        /* ── Body ── */
        .rd-box .rd-body {
          padding:22px 24px;
          max-height:68vh; overflow-y:auto;
        }
        .rd-box .rd-body::-webkit-scrollbar { width:4px; }
        .rd-box .rd-body::-webkit-scrollbar-track { background:transparent; }
        .rd-box .rd-body::-webkit-scrollbar-thumb { background:var(--bd); border-radius:4px; }

        /* section label */
        .rd-box .rd-sec {
          font-size:10.5px; font-weight:700; color:var(--dim);
          text-transform:uppercase; letter-spacing:.7px;
          margin:0 0 12px; display:flex; align-items:center; gap:8px;
        }
        .rd-box .rd-sec::after { content:''; flex:1; height:1px; background:var(--bd); }

        /* grid */
        .rd-box .rd-g2 { display:grid; grid-template-columns:1fr 1fr; gap:0 14px; }
        .rd-box .rd-g1 { display:grid; grid-template-columns:1fr; }

        /* divider */
        .rd-box .rd-div { height:1px; background:var(--bd); margin:18px 0; }

        /* ── Input overrides ── */
        /* ── Input overrides ── */
        .rd-box input[type="text"]:not([class*="react-select"]),
        .rd-box input[type="email"],
        .rd-box input[type="number"],
        .rd-box input[type="password"],
        .rd-box input[type="file"],
        .rd-box textarea {
          width:100% !important;
          background:var(--bg) !important;
          border:1.5px solid var(--bd) !important;
          border-radius:11px !important;
          padding:10px 14px !important;
          font-family:'Outfit',sans-serif !important;
          font-size:13.5px !important;
          color:var(--td) !important;
          outline:none !important;
          box-shadow:none !important;
          transition:border-color .15s,box-shadow .15s !important;
        }

        /* React Select Reset */
        .rd-box .react-select__control input {
          width: auto !important;
          height: auto !important;
          padding: 0 !important;
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        .rd-box .react-select__value-container {
          padding: 0 12px !important;
          display: flex !important;
          align-items: center !important;
        }
        .rd-box input:focus,
        .rd-box textarea:focus {
          border-color:var(--ac) !important;
          box-shadow:0 0 0 3px rgba(99,102,241,.12) !important;
          background:var(--wh) !important;
        }
        .rd-box input::placeholder,
        .rd-box textarea::placeholder { color:var(--dim) !important; }
        .rd-box input:disabled,
        .rd-box textarea:disabled { opacity:.5 !important; cursor:not-allowed !important; }

        .rd-box label,
        .rd-box .inputData label {
          font-size:11.5px !important; font-weight:600 !important;
          color:var(--dim) !important; text-transform:uppercase !important;
          letter-spacing:.5px !important; margin-bottom:6px !important;
          display:block !important;
        }
        .rd-box .text-danger,
        .rd-box [class*="error"] {
          font-size:11px !important; color:var(--rd2) !important; margin-top:4px !important;
        }

        /* ── ReactSelect ── */
        .rd-box .react-select__control {
          background:var(--bg) !important;
          border:1.5px solid var(--bd) !important;
          border-radius:11px !important;
          min-height:42px !important;
          box-shadow:none !important;
          font-family:'Outfit',sans-serif !important;
          font-size:13.5px !important;
          transition:border-color .15s !important;
        }
        .rd-box .react-select__control:hover,
        .rd-box .react-select__control--is-focused {
          border-color:var(--ac) !important;
          box-shadow:0 0 0 3px rgba(99,102,241,.12) !important;
          background:var(--wh) !important;
        }
        .rd-box .react-select__placeholder  { color:var(--dim) !important; font-size:13px !important; }
        .rd-box .react-select__single-value { color:var(--td) !important; font-size:13.5px !important; }
        .rd-box .react-select__menu {
          border-radius:12px !important; border:1px solid var(--bd) !important;
          box-shadow:0 8px 30px rgba(15,17,35,.12) !important;
          overflow:hidden !important; font-family:'Outfit',sans-serif !important;
        }
        .rd-box .react-select__option { font-size:13px !important; padding:9px 12px !important; cursor:pointer !important; }
        .rd-box .react-select__option--is-focused  { background:var(--as) !important; }
        .rd-box .react-select__option--is-selected { background:var(--ac) !important; color:#fff !important; }
        .rd-box .react-select__indicator-separator { display:none !important; }

        /* ── Image preview ── */
        .rd-box .rd-img-preview {
          width:72px; height:72px; border-radius:14px;
          object-fit:cover; border:2px solid var(--bd);
          margin-top:10px; box-shadow:0 2px 10px rgba(99,102,241,.12);
        }

        /* ── Footer ── */
        .rd-box .rd-foot {
          padding:16px 24px; border-top:1px solid var(--bd);
          background:#fafbff;
          display:flex; align-items:center; justify-content:flex-end; gap:10px;
        }
        .rd-box .rd-btn-cancel {
          height:40px; padding:0 18px; border-radius:11px;
          border:1.5px solid var(--bd); background:var(--bg);
          font-family:'Outfit',sans-serif; font-size:13.5px;
          font-weight:600; color:var(--tx); cursor:pointer;
          transition:all .13s;
        }
        .rd-box .rd-btn-cancel:hover { border-color:var(--dim); color:var(--td); }
        .rd-box .rd-btn-submit {
          height:40px; padding:0 22px; border-radius:11px; border:none;
          background:linear-gradient(135deg,var(--ac),var(--ac2));
          font-family:'Outfit',sans-serif; font-size:13.5px;
          font-weight:700; color:#fff; cursor:pointer;
          box-shadow:0 3px 12px rgba(99,102,241,.28);
          transition:transform .13s,box-shadow .13s;
          display:inline-flex; align-items:center; gap:7px;
        }
        .rd-box .rd-btn-submit:hover:not(:disabled) { transform:translateY(-1px); box-shadow:0 6px 18px rgba(99,102,241,.36); }
        .rd-box .rd-btn-submit:disabled { opacity:.55; cursor:not-allowed; }
        .rd-box .rd-spinner {
          width:14px; height:14px; border-radius:50%;
          border:2px solid rgba(255,255,255,.35); border-top-color:#fff;
          animation:rd-spin .7s linear infinite;
        }
        @keyframes rd-spin { to{transform:rotate(360deg)} }
      `}</style>

            <div className="rd-overlay">
                <div className="rd-box">

                    {/* ── Header ── */}
                    <div className="rd-head">
                        <div className="rd-head-l">
                            <div className="rd-head-icon">{isEdit ? "✏️" : "🏪"}</div>
                            <div>
                                <h2 className="rd-head-title">{isEdit ? "Edit Reseller" : "Create Reseller"}</h2>
                                <p className="rd-head-sub">{isEdit ? "Update reseller password" : "Fill in details to add a new reseller"}</p>
                            </div>
                        </div>
                        <div className="rd-close" onClick={() => dispatch(closeDialog())}>✕</div>
                    </div>

                    {/* ── Body ── */}
                    <div className="rd-body">
                        <form onSubmit={handleSubmit}>

                            {/* Basic Info */}
                            <p className="rd-sec">Basic Info</p>
                            <div className="rd-g2">
                                <ExInput type="text" id="name" name="name" value={name} label="Name"
                                    placeholder="Full name" disabled={isEdit} errorMessage={error.name}
                                    onChange={(e: any) => { setName(e.target.value); setError((p) => ({ ...p, name: e.target.value ? "" : "Name is required" })); }}
                                />
                                <ExInput type="text" id="email" name="email" value={email} label="Email"
                                    placeholder="email@example.com" disabled={isEdit} errorMessage={error.email}
                                    onChange={(e: any) => { const v = e.target.value; setEmail(v); setError((p) => ({ ...p, email: !v ? "Email is required" : !v.includes("@") ? "Must include '@'" : "" })); }}
                                />
                            </div>

                            <div className="rd-div" />

                            {/* Security & Contact */}
                            <p className="rd-sec">Security &amp; Contact</p>
                            <div className="rd-g2">
                                <PasswordInput
                                    label={isEdit ? "New Password" : "Password"}
                                    value={password} placeholder="Password"
                                    onChange={(e: any) => { setPassword(e.target.value); setError((p) => ({ ...p, password: !isEdit && !e.target.value ? "Password is required" : "" })); }}
                                    error={error.password}
                                />
                                <ExInput type="number" id="mobile" name="mobile" value={mobile} label="Mobile Number"
                                    placeholder="eg. 9876543210" disabled={isEdit} errorMessage={error.mobile}
                                    onChange={(e: any) => { setMobile(e.target.value); setError((p) => ({ ...p, mobile: e.target.value ? "" : "Mobile is required" })); }}
                                />
                            </div>

                            <div className="rd-g2">
                                <ExInput type="text" id="countryCode" name="countryCode" value={countryCode} label="Country Code"
                                     placeholder="+91" disabled={isEdit} errorMessage={error.countryCode}
                                     onChange={(e: any) => { setCountryCode(e.target.value); setError((p) => ({ ...p, countryCode: e.target.value ? "" : "Code is required" })); }}
                                 />
                                 <div className="rd-field">
                                    <label>National ID Type</label>
                                    <ReactSelect
                                        options={[
                                            { value: "aadhar", label: "Aadhar" },
                                            { value: "pan", label: "PAN" },
                                            { value: "driving", label: "Driving License" },
                                            { value: "voter", label: "Voter ID" },
                                            { value: "passport", label: "Passport" },
                                            { value: "other", label: "Other" },
                                        ]}
                                        value={{ value: nationalIdType, label: nationalIdType.charAt(0).toUpperCase() + nationalIdType.slice(1) }}
                                        onChange={(opt: any) => setNationalIdType(opt.value)}
                                        classNamePrefix="react-select"
                                        styles={selectStyles}
                                        isDisabled={isEdit}
                                    />
                                </div>
                            </div>

                            <div className="rd-g1">
                                <ExInput type="text" id="nationalId" name="nationalId" value={nationalId} label="National ID Number"
                                    placeholder="eg. ABC123456" disabled={isEdit} errorMessage={error.nationalId}
                                    onChange={(e: any) => { setNationalId(e.target.value); setError((p) => ({ ...p, nationalId: e.target.value ? "" : "National ID is required" })); }}
                                />
                            </div>

                            {!isEdit && (
                                <div className="rd-g2" style={{ marginTop: "10px" }}>
                                    <div className="inputData">
                                        <label>National ID Front</label>
                                        <input type="file" accept="image/*" onChange={handleFrontImage} />
                                        {frontPreview && <img src={frontPreview} alt="front" style={{ width: "60px", marginTop: "5px", borderRadius: "8px" }} />}
                                    </div>
                                    <div className="inputData">
                                        <label>National ID Back</label>
                                        <input type="file" accept="image/*" onChange={handleBackImage} />
                                        {backPreview && <img src={backPreview} alt="back" style={{ width: "60px", marginTop: "5px", borderRadius: "8px" }} />}
                                    </div>
                                </div>
                            )}

                            {/* Country + Image (create only) */}
                            {!isEdit && (
                                <>
                                    <div className="rd-div" />
                                    <p className="rd-sec">Profile & Location</p>

                                    <div style={{ marginBottom: 14 }}>
                                        <label>Country</label>
                                        <ReactSelect
                                            options={countryOptions} value={selectedCountry}
                                            isClearable isLoading={loadingCountries}
                                            placeholder="Select a country..."
                                            onChange={handleSelectChange}
                                            classNamePrefix="react-select"
                                            formatOptionLabel={(option: any) => (
                                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                                    <img height={18} width={26} alt={option.name} src={option.flagUrl}
                                                        style={{ objectFit: "cover", borderRadius: 2 }}
                                                        onError={(e: any) => { e.target.style.display = "none"; }}
                                                    />
                                                    <span>{option.label}</span>
                                                </div>
                                            )}
                                            styles={selectStyles}
                                        />
                                        {error.country && <div style={{ fontSize: 11, color: "#f43f5e", marginTop: 4 }}>{error.country}</div>}
                                    </div>

                                    <div style={{ marginBottom: 14 }}>
                                        <ExInput type="file" label="Profile Image" accept="image/png, image/jpeg"
                                            errorMessage={error.image} onChange={handleInputImage}
                                        />
                                        <span style={{ fontSize: 11, color: "#a0a8c0" }}>Accepted: PNG, JPEG</span>
                                        {imagePath && (
                                            <div>
                                                <img src={imagePath} className="rd-img-preview" alt="preview"
                                                    onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}

                            <div className="rd-div" />

                            {/* Description */}
                            <p className="rd-sec">Additional Info</p>
                            <Textarea
                                row={3} type="text" id="description" name="description"
                                value={description} defaultValue={description}
                                label="Description" placeholder="Brief description about the reseller..."
                                errorMessage={error.description} disabled={isEdit}
                                onChange={(e: any) => {
                                    setDescription(e.target.value);
                                    setError((p) => ({ ...p, description: e.target.value ? "" : "Description is required" }));
                                }}
                            />

                        </form>
                    </div>

                    {/* ── Footer ── */}
                    <div className="rd-foot">
                        <button type="button" className="rd-btn-cancel" onClick={() => dispatch(closeDialog())}>
                            Cancel
                        </button>
                        <button type="submit" className="rd-btn-submit" disabled={isSubmitting} onClick={handleSubmit}>
                            {isSubmitting
                                ? <><span className="rd-spinner" />{isEdit ? "Updating..." : "Creating..."}</>
                                : <>{isEdit ? "Update Reseller" : "Create Reseller"}</>
                            }
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
};

export default ResellerDialog;