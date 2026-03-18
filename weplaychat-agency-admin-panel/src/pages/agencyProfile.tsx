import React, { ChangeEvent, useEffect, useState } from "react";
import RootLayout from "../component/layout/Layout";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { Textarea } from "@/extra/Input";
import { useSelector } from "react-redux";
import { isLoading, isSkeleton } from "@/utils/allSelector";
import { RootStore, useAppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import { agencyProfileGet, agencyProfileUpdate } from "@/store/adminSlice";
import ReactSelect from "react-select";
import countriesData from "@/api/countries.json";
import { auth } from "@/component/lib/firebaseConfig";
import {
  EmailAuthProvider,
  reauthenticateWithCredential,
  updateEmail,
  updatePassword,
} from "firebase/auth";
import coin from "@/assets/images/coin.png";

const profileStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .ap-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 48px;
  }

  /* ── Page header ── */
  .ap-page-header {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .ap-page-header h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 23px;
    font-weight: 900;
    color: #1e2235;
    margin: 0 0 2px;
  }

  .ap-page-header p {
    font-size: 12.5px;
    color: #a0a8c0;
    margin: 0;
  }

  .ap-page-icon {
    width: 44px; height: 44px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
    box-shadow: 0 4px 12px rgba(99,102,241,0.25);
  }

  /* ── Main layout: sidebar + form ── */
  .ap-layout {
    display: grid;
    grid-template-columns: 260px 1fr;
    gap: 20px;
    align-items: start;
  }

  @media (max-width: 900px) {
    .ap-layout { grid-template-columns: 1fr; }
  }

  /* ── Left sidebar card ── */
  .ap-sidebar {
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: apFade .25s ease;
  }

  @keyframes apFade {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .ap-sidebar-banner {
    height: 70px;
    background: linear-gradient(120deg, #6366f1 0%, #a855f7 100%);
    position: relative;
  }

  .ap-sidebar-banner::after {
    content: '';
    position: absolute;
    bottom: -1px; left: 0; right: 0;
    height: 22px;
    background: #fff;
    border-radius: 18px 18px 0 0;
  }

  .ap-avatar-wrap {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0 20px 20px;
    margin-top: -50px;
    position: relative;
    z-index: 1;
  }

  .ap-avatar-ring {
    position: relative;
    width: 100px; height: 100px;
    border-radius: 22px;
    border: 3px solid #fff;
    box-shadow: 0 4px 18px rgba(99,102,241,0.18);
    overflow: hidden;
    cursor: pointer;
    transition: box-shadow .15s;
  }
  .ap-avatar-ring:hover { box-shadow: 0 6px 24px rgba(99,102,241,0.28); }

  .ap-avatar-ring img {
    width: 100%; height: 100%;
    object-fit: cover;
    display: block;
  }

  .ap-avatar-cam {
    position: absolute;
    bottom: 0; right: 0;
    width: 30px; height: 30px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    border-radius: 8px 0 0 0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
  }

  .ap-avatar-name {
    font-family: 'Nunito', sans-serif;
    font-size: 16px;
    font-weight: 900;
    color: #1e2235;
    margin: 12px 0 2px;
    text-align: center;
    text-transform: capitalize;
  }

  .ap-avatar-email {
    font-size: 12px;
    color: #a0a8c0;
    font-weight: 500;
    text-align: center;
    word-break: break-all;
  }

  /* Agency code badge */
  .ap-agency-code {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 10px;
    padding: 5px 13px;
    border-radius: 8px;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.18);
    font-size: 12px;
    font-weight: 700;
    color: #6366f1;
    letter-spacing: .4px;
  }

  .ap-divider {
    height: 1px;
    background: #e8eaf2;
    margin: 16px 0;
  }

  /* Stat row inside sidebar */
  .ap-stat-row {
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 0 16px 16px;
  }

  .ap-stat-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 9px 12px;
    border-radius: 10px;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
  }

  .ap-stat-item-left {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
  }

  .ap-stat-item-val {
    font-family: 'Nunito', sans-serif;
    font-size: 14px;
    font-weight: 800;
    color: #1e2235;
    display: flex;
    align-items: center;
    gap: 4px;
  }

  .ap-coin-img {
    width: 14px; height: 14px;
    object-fit: contain;
  }

  /* ── Right form card ── */
  .ap-form-card {
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: apFade .28s ease;
  }

  .ap-form-head {
    padding: 16px 24px;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(99,102,241,0.03), rgba(168,85,247,0.02));
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .ap-form-head-title {
    font-family: 'Nunito', sans-serif;
    font-size: 15px;
    font-weight: 900;
    color: #1e2235;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .ap-section-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
  }

  .ap-form-body {
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  /* Section label */
  .ap-section-label {
    font-size: 11px;
    font-weight: 700;
    color: #a0a8c0;
    text-transform: uppercase;
    letter-spacing: .6px;
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 7px;
  }

  .ap-section-label::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e8eaf2;
  }

  /* Grid of fields */
  .ap-fields-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 14px;
  }

  /* ── Field ── */
  .ap-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .ap-label {
    font-size: 11.5px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: .45px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .ap-label-dot {
    width: 4px; height: 4px;
    border-radius: 50%;
    background: #6366f1;
    flex-shrink: 0;
  }

  .ap-input {
    width: 100%;
    height: 42px;
    padding: 0 13px;
    border: 1.5px solid #e8eaf2;
    border-radius: 10px;
    background: #f4f5fb;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #1e2235;
    outline: none;
    transition: border-color .15s, box-shadow .15s, background .15s;
    box-sizing: border-box;
  }
  .ap-input::placeholder { color: #a0a8c0; }
  .ap-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.09);
    background: #fff;
  }
  .ap-input.ap-input-readonly {
    background: #f9fafc;
    color: #94a3b8;
    cursor: not-allowed;
    border-color: #eef0f6;
  }
  .ap-input.ap-input-error {
    border-color: #f43f5e;
    background: rgba(244,63,94,0.03);
  }
  .ap-input.ap-input-error:focus {
    box-shadow: 0 0 0 3px rgba(244,63,94,0.09);
  }

  .ap-textarea {
    width: 100%;
    padding: 11px 13px;
    border: 1.5px solid #e8eaf2;
    border-radius: 10px;
    background: #f4f5fb;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #1e2235;
    outline: none;
    resize: vertical;
    min-height: 100px;
    transition: border-color .15s, box-shadow .15s, background .15s;
    box-sizing: border-box;
  }
  .ap-textarea::placeholder { color: #a0a8c0; }
  .ap-textarea:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.09);
    background: #fff;
  }
  .ap-textarea.ap-input-error { border-color: #f43f5e; }

  .ap-error {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 11px;
    font-weight: 600;
    color: #f43f5e;
    margin-top: 1px;
  }

  /* ── Country select override ── */
  .ap-country-wrap .react-select__control {
    border: 1.5px solid #e8eaf2 !important;
    border-radius: 10px !important;
    background: #f4f5fb !important;
    min-height: 42px !important;
    box-shadow: none !important;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
  }
  .ap-country-wrap .react-select__control:hover {
    border-color: #6366f1 !important;
  }
  .ap-country-wrap .react-select__control--is-focused {
    border-color: #6366f1 !important;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.09) !important;
    background: #fff !important;
  }
  .ap-country-wrap .react-select__placeholder { color: #a0a8c0; }
  .ap-country-wrap .react-select__single-value { color: #1e2235; font-weight: 500; }
  .ap-country-wrap .react-select__option:hover { background: #f4f5fb !important; }
  .ap-country-wrap .react-select__option--is-selected { background: rgba(99,102,241,0.10) !important; color: #6366f1 !important; }
  .ap-country-wrap .react-select__indicator-separator { display: none; }
  .ap-country-wrap .react-select__dropdown-indicator svg { color: #6366f1; }

  /* ── Form footer ── */
  .ap-form-footer {
    padding: 16px 24px;
    border-top: 1px solid #e8eaf2;
    display: flex;
    justify-content: flex-end;
    background: linear-gradient(0deg, rgba(99,102,241,0.02), transparent);
  }

  .ap-submit-btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 11px 26px;
    border-radius: 11px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    border: none;
    font-family: 'Outfit', sans-serif;
    font-size: 14px;
    font-weight: 700;
    color: #fff;
    cursor: pointer;
    box-shadow: 0 4px 14px rgba(99,102,241,0.28);
    transition: opacity .15s, transform .12s, box-shadow .15s;
  }
  .ap-submit-btn:hover {
    opacity: .92;
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(99,102,241,0.34);
  }
  .ap-submit-btn:active { transform: translateY(0); }

  /* ── Skeleton ── */
  .ap-skel { border-radius: 10px; }
`;

const AgencyProfile = () => {
  const { admin } = useSelector((state: any) => state.admin);
  const roleSkeleton = useSelector(isSkeleton);
  const router = useRouter();
  const id: any = router?.query?.id;
  const [loadingCountries, setLoadingCountries] = useState(false);
  const updatedImagePath = admin?.image?.replace(/\\/g, "/");
  const dispatch = useAppDispatch();

  const [countryOptions, setCountryOptions] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [commission, setCommission] = useState("");
  const [countryCode, setCountryCode] = useState<any>("");
  const [description, setDescription] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [agencyCode, setAgencyCode] = useState("");
  const [image, setImage] = useState<File | undefined>();
  const [imagePath, setImagePath] = useState<any>();
  const [error, setError] = useState({
    name: "", countryCode: "", mobileNumber: "", email: "",
    password: "", commission: "", country: "", description: "",
    image: "", imagePath: "",
  });

  useEffect(() => { if (!id) return; dispatch(agencyProfileGet()); }, [dispatch, id]);

  useEffect(() => {
    setName(admin?.name);
    setEmail(admin?.email);
    setPassword(admin?.password);
    setCommission(admin?.commission);
    setCountryCode(admin?.countryCode);
    setDescription(admin?.description);
    setMobileNumber(admin?.mobileNumber);
    setAgencyCode(admin?.agencyCode);
    if (updatedImagePath) setImagePath(baseURL + updatedImagePath);
  }, [admin]);

  useEffect(() => {
    setLoadingCountries(true);
    try {
      const transformed = (countriesData as any[])
        .filter(c => c.name?.common && c.cca2 && c.flags?.png)
        .map(c => ({
          value: c.cca2, label: c.name.common,
          name: c.name.common, code: c.cca2,
          flagUrl: c.flags.png || c.flags.svg,
          flag: c.flags.png || c.flags.svg,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setCountryOptions(transformed);
      if (admin?.country) {
        const existing = transformed.find((c: any) => c.name.toLowerCase() === admin.country.toLowerCase());
        setSelectedCountry(existing || null);
      } else {
        setSelectedCountry(transformed.find((c: any) => c.name === "India") || transformed[0] || null);
      }
    } catch (e) { console.error(e); }
    finally { setLoadingCountries(false); }
  }, [admin]);

  const handleUploadImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImage(e.target.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setError(prev => ({ ...prev, image: "" }));
    }
  };

  const setFieldError = (field: string, val: string, msg: string) =>
    setError(prev => ({ ...prev, [field]: val ? "" : msg }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const errs: any = {};
    if (!name)        errs.name        = "Name is required!";
    if (!email)       errs.email       = "Email is required!";
    if (!email?.includes("@")) errs.email = "Email must include '@'";
    if (!image && !imagePath) errs.image = "Image is required";
    if (!commission)  errs.commission  = "Commission is required!";
    if (!password)    errs.password    = "Password is required!";
    if (!mobileNumber) errs.mobileNumber = "Mobile number is required!";
    if (!description) errs.description = "Description is required!";
    if (!countryCode) errs.countryCode  = "Country code is required!";
    if (countryCode <= 0) errs.countryCode = "Country code cannot be ≤ 0";
    if (Object.keys(errs).length > 0) return setError(errs);

    try {
      const updatedFields: any = {};
      if (name !== admin.name) updatedFields.name = name;
      if (email !== admin.email) updatedFields.email = email;
      if (image instanceof File) updatedFields.image = image;
      if (commission !== admin.commission) updatedFields.commission = commission;
      if (password !== admin.password) updatedFields.password = password;
      if (mobileNumber !== admin.mobileNumber) updatedFields.mobileNumber = mobileNumber;
      if (description !== admin.description) updatedFields.description = description;
      if (selectedCountry?.name !== admin.country) updatedFields.country = selectedCountry?.name;
      if (selectedCountry?.flag !== admin.countryFlagImage) updatedFields.countryFlagImage = selectedCountry?.flag;

      const formData = new FormData();
      for (const key in updatedFields) {
        if (updatedFields[key] != null) formData.append(key, updatedFields[key]);
      }

      if (updatedFields?.email) {
        const u: any = auth?.currentUser;
        const cred = EmailAuthProvider.credential(u.email, admin.password);
        await reauthenticateWithCredential(u, cred);
        await updateEmail(u, updatedFields.email);
      }
      if (updatedFields?.password) {
        const u: any = auth?.currentUser;
        const cred = EmailAuthProvider.credential(u.email, admin.password);
        await reauthenticateWithCredential(u, cred);
        await updatePassword(u, updatedFields.password);
      }
      dispatch(agencyProfileUpdate({ agencyId: admin?._id, data: formData }));
    } catch (err: any) { console.error(err.message); }
  };

  const FieldSkel = () => (
    <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff">
      <Skeleton height={42} className="ap-skel" />
    </SkeletonTheme>
  );

  return (
    <>
      <style>{profileStyle}</style>

      <div className="ap-root">

        {/* ── Page Header ── */}
        <div className="ap-page-header">
          <div className="ap-page-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div>
            <h2>{name ? `${name}'s Profile` : "Agency Profile"}</h2>
            <p>Manage your agency account details and settings</p>
          </div>
        </div>

        {/* ── Layout ── */}
        <div className="ap-layout">

          {/* ── Sidebar ── */}
          <div className="ap-sidebar">
            <div className="ap-sidebar-banner" />
            <div className="ap-avatar-wrap">
              <div className="ap-avatar-ring" onClick={() => document.getElementById("ap-file-input")?.click()}>
                <img
                  src={imagePath || male.src}
                  alt="avatar"
                  onError={(e: any) => { e.currentTarget.src = male.src; }}
                />
                <div className="ap-avatar-cam">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </div>
              </div>
              <input id="ap-file-input" type="file" accept="image/*"
                style={{ display: "none" }} onChange={handleUploadImage} />

              {roleSkeleton
                ? <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff"><Skeleton width={120} height={16} className="ap-skel" style={{ marginTop: 12 }} /></SkeletonTheme>
                : <div className="ap-avatar-name">{name || "Agency Name"}</div>
              }
              <div className="ap-avatar-email">{email || "—"}</div>

              {agencyCode && (
                <span className="ap-agency-code">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <line x1="8" y1="21" x2="16" y2="21" />
                    <line x1="12" y1="17" x2="12" y2="21" />
                  </svg>
                  {agencyCode}
                </span>
              )}

              <div className="ap-divider" style={{ margin: "14px 0", width: "100%" }} />

              {/* Stat items */}
              <div className="ap-stat-row" style={{ width: "100%" }}>
                <div className="ap-stat-item">
                  <span className="ap-stat-item-left">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#6366f1" strokeWidth="2" strokeLinecap="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.59 3.54 2 2 0 0 1 3.57 1.34h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.88a16 16 0 0 0 6.29 6.29l.88-.88a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    Mobile
                  </span>
                  <span className="ap-stat-item-val">{mobileNumber || "—"}</span>
                </div>
                <div className="ap-stat-item">
                  <span className="ap-stat-item-left">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#f59e0b" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                    </svg>
                    Commission
                  </span>
                  <span className="ap-stat-item-val">{commission ? `${commission}%` : "—"}</span>
                </div>
                <div className="ap-stat-item">
                  <span className="ap-stat-item-left">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="#10b981" strokeWidth="2.2" strokeLinecap="round">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                    </svg>
                    Country Code
                  </span>
                  <span className="ap-stat-item-val">+{countryCode || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Form card ── */}
          <div className="ap-form-card">
            <div className="ap-form-head">
              <span className="ap-form-head-title">
                <span className="ap-section-dot" />
                Edit Profile Information
              </span>
              <span style={{
                fontSize: "12px", color: "#a0a8c0", fontWeight: 600,
                background: "#f4f5fb", border: "1px solid #e8eaf2",
                borderRadius: "7px", padding: "4px 10px"
              }}>
                All fields required
              </span>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="ap-form-body">

                {/* Section: Basic Info */}
                <div>
                  <div className="ap-section-label">Basic Information</div>
                  <div className="ap-fields-grid">

                    {/* Name */}
                    <div className="ap-field">
                      <label className="ap-label"><span className="ap-label-dot" />Name</label>
                      {roleSkeleton ? <FieldSkel /> : (
                        <>
                          <input className={`ap-input ${error.name ? "ap-input-error" : ""}`}
                            value={name || ""} placeholder="Full name"
                            onChange={e => { setName(e.target.value); setFieldError("name", e.target.value, "Name is required!"); }} />
                          {error.name && <span className="ap-error">⚠ {error.name}</span>}
                        </>
                      )}
                    </div>

                    {/* Agency Code (readonly) */}
                    <div className="ap-field">
                      <label className="ap-label"><span className="ap-label-dot" />Agency Code</label>
                      {roleSkeleton ? <FieldSkel /> : (
                        <input className="ap-input ap-input-readonly" value={agencyCode || ""} readOnly />
                      )}
                    </div>

                    {/* Email */}
                    <div className="ap-field">
                      <label className="ap-label"><span className="ap-label-dot" />Email</label>
                      {roleSkeleton ? <FieldSkel /> : (
                        <>
                          <input className={`ap-input ${error.email ? "ap-input-error" : ""}`}
                            type="email" value={email || ""} placeholder="Email address"
                            onChange={e => { setEmail(e.target.value); setFieldError("email", e.target.value, "Email is required!"); }} />
                          {error.email && <span className="ap-error">⚠ {error.email}</span>}
                        </>
                      )}
                    </div>

                    {/* Password */}
                    <div className="ap-field">
                      <label className="ap-label"><span className="ap-label-dot" />Password</label>
                      {roleSkeleton ? <FieldSkel /> : (
                        <>
                          <input className={`ap-input ${error.password ? "ap-input-error" : ""}`}
                            type="password" value={password || ""} placeholder="Password"
                            onChange={e => { setPassword(e.target.value); setFieldError("password", e.target.value, "Password is required!"); }} />
                          {error.password && <span className="ap-error">⚠ {error.password}</span>}
                        </>
                      )}
                    </div>

                    {/* Commission */}
                    <div className="ap-field">
                      <label className="ap-label"><span className="ap-label-dot" />Commission (%)</label>
                      {roleSkeleton ? <FieldSkel /> : (
                        <>
                          <input className={`ap-input ${error.commission ? "ap-input-error" : ""}`}
                            type="number" value={commission || ""} placeholder="e.g. 10"
                            onChange={e => { setCommission(e.target.value); setFieldError("commission", e.target.value, "Commission is required!"); }} />
                          {error.commission && <span className="ap-error">⚠ {error.commission}</span>}
                        </>
                      )}
                    </div>

                  </div>
                </div>

                {/* Section: Contact */}
                <div>
                  <div className="ap-section-label">Contact & Location</div>
                  <div className="ap-fields-grid">

                    {/* Country Code */}
                    <div className="ap-field">
                      <label className="ap-label"><span className="ap-label-dot" />Country Code</label>
                      {roleSkeleton ? <FieldSkel /> : (
                        <>
                          <input className={`ap-input ${error.countryCode ? "ap-input-error" : ""}`}
                            type="number" value={countryCode || ""} placeholder="e.g. 91"
                            onChange={e => { setCountryCode(e.target.value); setFieldError("countryCode", e.target.value, "Country code is required!"); }} />
                          {error.countryCode && <span className="ap-error">⚠ {error.countryCode}</span>}
                        </>
                      )}
                    </div>

                    {/* Mobile */}
                    <div className="ap-field">
                      <label className="ap-label"><span className="ap-label-dot" />Mobile Number</label>
                      {roleSkeleton ? <FieldSkel /> : (
                        <>
                          <input className={`ap-input ${error.mobileNumber ? "ap-input-error" : ""}`}
                            type="number" value={mobileNumber || ""} placeholder="Mobile number"
                            onChange={e => { setMobileNumber(e.target.value); setFieldError("mobileNumber", e.target.value, "Mobile is required!"); }} />
                          {error.mobileNumber && <span className="ap-error">⚠ {error.mobileNumber}</span>}
                        </>
                      )}
                    </div>

                    {/* Country */}
                    <div className="ap-field">
                      <label className="ap-label"><span className="ap-label-dot" />Country</label>
                      {roleSkeleton ? <FieldSkel /> : (
                        <div className="ap-country-wrap">
                          <ReactSelect
                            options={countryOptions}
                            value={selectedCountry}
                            isClearable
                            isLoading={loadingCountries}
                            placeholder="Select country…"
                            onChange={(sel: any) => {
                              setSelectedCountry(sel);
                              setError(prev => ({ ...prev, country: sel ? "" : "Country is required" }));
                            }}
                            classNamePrefix="react-select"
                            formatOptionLabel={(opt: any) => (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <img height={16} width={22} alt={opt.name} src={opt.flagUrl}
                                  style={{ objectFit: "cover" }}
                                  onError={(e: any) => { e.target.style.display = "none"; }} />
                                <span>{opt.label}</span>
                              </div>
                            )}
                          />
                          {error.country && <span className="ap-error">⚠ {error.country}</span>}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

                {/* Section: Description */}
                <div>
                  <div className="ap-section-label">About</div>
                  <div className="ap-field">
                    <label className="ap-label"><span className="ap-label-dot" />Description</label>
                    {roleSkeleton
                      ? <SkeletonTheme baseColor="#e2e5e7" highlightColor="#fff"><Skeleton height={100} className="ap-skel" /></SkeletonTheme>
                      : (
                        <>
                          <textarea
                            className={`ap-textarea ${error.description ? "ap-input-error" : ""}`}
                            rows={4}
                            value={description || ""}
                            placeholder="Write a short description about your agency…"
                            onChange={e => { setDescription(e.target.value); setFieldError("description", e.target.value, "Description is required!"); }}
                          />
                          {error.description && <span className="ap-error">⚠ {error.description}</span>}
                        </>
                      )}
                  </div>
                </div>

              </div>

              {/* ── Footer ── */}
              <div className="ap-form-footer">
                <button type="submit" className="ap-submit-btn">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Save Changes
                </button>
              </div>
            </form>
          </div>

        </div>
      </div>
    </>
  );
};

AgencyProfile.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default AgencyProfile;