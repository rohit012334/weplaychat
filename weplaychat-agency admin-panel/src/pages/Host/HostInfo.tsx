import React, { useEffect, useState } from "react";
import RootLayout from "../../component/layout/Layout";
import Skeleton from "react-loading-skeleton";
import { ExInput, Textarea } from "@/extra/Input";
import { useSelector } from "react-redux";
import { isLoading } from "@/utils/allSelector";
import { useRouter } from "next/router";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import Image from "next/image";

interface RootStore {
  setting: any;
  user: { userProfile: any; userWalletHistory: any; user: any };
}

const hostInfoStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .hi-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 48px;
  }

  /* ── Page header ── */
  .hi-page-header {
    display: flex;
    align-items: center;
    gap: 14px;
    margin-bottom: 24px;
  }

  .hi-back-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 16px;
    border-radius: 10px;
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px;
    font-weight: 600;
    color: #64748b;
    cursor: pointer;
    transition: all .15s;
    box-shadow: 0 1px 4px rgba(99,102,241,0.06);
  }
  .hi-back-btn:hover {
    background: #f4f5fb;
    border-color: #6366f1;
    color: #6366f1;
    transform: translateX(-2px);
  }

  .hi-page-title {
    font-family: 'Nunito', sans-serif;
    font-size: 22px;
    font-weight: 900;
    color: #1e2235;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .hi-title-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    animation: hiDotPulse 2s ease-in-out infinite;
  }

  @keyframes hiDotPulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.5); opacity: 0.5; }
  }

  /* ── Main card ── */
  .hi-card {
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 4px 24px rgba(99,102,241,0.07);
    animation: hiFadeIn .3s ease;
  }

  @keyframes hiFadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Banner ── */
  .hi-banner {
    background: linear-gradient(135deg, #1e2235 0%, #2d2f4e 40%, #3b3d6e 70%, #6366f1 100%);
    padding: 28px 32px;
    display: flex;
    align-items: center;
    gap: 24px;
    position: relative;
    overflow: hidden;
  }

  .hi-banner::before {
    content: '';
    position: absolute;
    top: -60px; right: -60px;
    width: 200px; height: 200px;
    border-radius: 50%;
    background: rgba(99,102,241,0.12);
  }
  .hi-banner::after {
    content: '';
    position: absolute;
    bottom: -70px; right: 130px;
    width: 150px; height: 150px;
    border-radius: 50%;
    background: rgba(168,85,247,0.10);
  }

  .hi-avatar-wrap {
    position: relative;
    flex-shrink: 0;
    z-index: 1;
  }

  .hi-avatar {
    width: 90px; height: 90px;
    border-radius: 16px;
    object-fit: cover;
    border: 3px solid rgba(255,255,255,0.20);
    box-shadow: 0 8px 28px rgba(0,0,0,0.35);
    display: block;
  }

  .hi-avatar-dot {
    position: absolute;
    bottom: -3px; right: -3px;
    width: 14px; height: 14px;
    border-radius: 50%;
    background: #10b981;
    border: 3px solid #1e2235;
    animation: hiOnlinePulse 2s ease-in-out infinite;
  }

  @keyframes hiOnlinePulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); }
    50%      { box-shadow: 0 0 0 6px rgba(16,185,129,0); }
  }

  .hi-banner-info { flex: 1; z-index: 1; }

  .hi-host-name {
    font-family: 'Nunito', sans-serif;
    font-size: 24px;
    font-weight: 900;
    color: #ffffff;
    margin: 0 0 3px;
  }

  .hi-host-id {
    font-size: 12px;
    font-weight: 500;
    color: rgba(255,255,255,0.45);
    letter-spacing: 1.2px;
    margin: 0 0 12px;
    font-family: monospace;
  }

  .hi-badge-row { display: flex; flex-wrap: wrap; gap: 6px; }

  .hi-badge {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 4px 12px; border-radius: 20px;
    font-size: 11.5px; font-weight: 600;
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.16);
    color: rgba(255,255,255,0.80);
  }

  .hi-badge-green {
    background: rgba(16,185,129,0.20);
    border-color: rgba(16,185,129,0.40);
    color: #6ee7b7;
  }

  /* ── Stats row ── */
  .hi-stats-row {
    display: flex;
    border-bottom: 1px solid #e8eaf2;
    flex-wrap: wrap;
  }

  .hi-stat {
    flex: 1;
    min-width: 100px;
    padding: 14px 18px;
    text-align: center;
    border-right: 1px solid #e8eaf2;
    transition: background .15s;
  }
  .hi-stat:last-child { border-right: none; }
  .hi-stat:hover { background: rgba(99,102,241,0.03); }

  .hi-stat-value {
    font-family: 'Nunito', sans-serif;
    font-size: 16px; font-weight: 900;
    color: #1e2235; margin-bottom: 2px;
  }

  .hi-stat-label {
    font-size: 10.5px; font-weight: 600;
    color: #a0a8c0; text-transform: uppercase; letter-spacing: 0.8px;
  }

  /* ── Body ── */
  .hi-body { padding: 26px 30px; }

  /* ── Section head ── */
  .hi-section-head {
    display: flex; align-items: center; gap: 10px;
    margin-bottom: 16px; margin-top: 6px;
  }

  .hi-section-icon {
    width: 28px; height: 28px; border-radius: 8px;
    background: linear-gradient(135deg, rgba(99,102,241,0.12), rgba(168,85,247,0.08));
    border: 1px solid rgba(99,102,241,0.14);
    display: flex; align-items: center; justify-content: center;
    color: #6366f1; flex-shrink: 0;
  }

  .hi-section-title {
    font-family: 'Nunito', sans-serif;
    font-size: 14px; font-weight: 800; color: #1e2235;
  }

  .hi-section-line {
    flex: 1; height: 1px;
    background: linear-gradient(90deg, #e8eaf2, transparent);
  }

  /* ── Fields grid ── */
  .hi-fields-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .hi-field {
    background: #f8f9fc;
    border: 1.5px solid #e8eaf2;
    border-radius: 11px;
    padding: 13px 15px;
    transition: border-color .15s, box-shadow .15s;
  }
  .hi-field:hover {
    border-color: rgba(99,102,241,0.25);
    box-shadow: 0 2px 10px rgba(99,102,241,0.07);
  }

  .hi-field-label {
    font-size: 10px; font-weight: 700; color: #a0a8c0;
    text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 5px;
  }

  .hi-field-value {
    font-size: 13px; font-weight: 600; color: #1e2235; word-break: break-word;
  }

  /* status dot inside field value */
  .hi-field-yes {
    display: inline-flex; align-items: center; gap: 5px;
    color: #10b981; font-weight: 700;
  }
  .hi-field-no {
    display: inline-flex; align-items: center; gap: 5px;
    color: #a0a8c0; font-weight: 700;
  }
  .hi-dot-on  { width:7px;height:7px;border-radius:50%;background:#10b981;flex-shrink:0; }
  .hi-dot-off { width:7px;height:7px;border-radius:50%;background:#a0a8c0;flex-shrink:0; }

  /* ── Rate section ── */
  .hi-rates-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 12px;
    margin-bottom: 24px;
  }

  .hi-rate-card {
    background: linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.03));
    border: 1.5px solid rgba(99,102,241,0.12);
    border-radius: 11px;
    padding: 13px 15px;
    transition: border-color .15s, box-shadow .15s;
  }
  .hi-rate-card:hover {
    border-color: rgba(99,102,241,0.28);
    box-shadow: 0 3px 12px rgba(99,102,241,0.09);
  }

  .hi-rate-label {
    font-size: 10px; font-weight: 700; color: #6366f1;
    text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 5px;
  }

  .hi-rate-value {
    font-family: 'Nunito', sans-serif;
    font-size: 18px; font-weight: 900; color: #1e2235;
  }

  /* ── About grid ── */
  .hi-about-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 14px;
    margin-bottom: 24px;
  }

  @media (max-width: 640px) {
    .hi-about-grid { grid-template-columns: 1fr; }
    .hi-banner { flex-direction: column; align-items: flex-start; }
    .hi-stats-row .hi-stat { min-width: 50%; border-bottom: 1px solid #e8eaf2; }
  }

  .hi-about-box {
    background: #f8f9fc;
    border: 1.5px solid #e8eaf2;
    border-radius: 12px;
    padding: 16px;
    transition: border-color .15s;
  }
  .hi-about-box:hover { border-color: rgba(99,102,241,0.22); }

  .hi-about-label {
    font-size: 10px; font-weight: 700; color: #a0a8c0;
    text-transform: uppercase; letter-spacing: 0.9px; margin-bottom: 10px;
  }

  .hi-about-text {
    font-size: 13.5px; color: #475569; line-height: 1.65;
    white-space: pre-wrap; word-break: break-word;
  }

  .hi-empty { color: #c4c9d8; font-style: italic; font-size: 13px; }

  /* ── Video ── */
  .hi-video-wrap {
    background: #f8f9fc; border: 1.5px solid #e8eaf2;
    border-radius: 12px; padding: 16px;
    display: inline-flex; flex-direction: column; gap: 10px;
    margin-bottom: 24px;
  }

  .hi-video {
    width: 220px; height: 220px;
    border-radius: 12px; object-fit: cover;
    border: 2px solid #e8eaf2;
  }

  /* ── Gallery ── */
  .hi-gallery-wrap { margin-bottom: 24px; }

  .hi-gallery-grid {
    display: flex; flex-wrap: wrap; gap: 12px;
    margin-top: 10px;
  }

  .hi-gallery-img {
    width: 130px; height: 140px;
    object-fit: cover; border-radius: 14px;
    border: 2px solid #e8eaf2; cursor: pointer;
    transition: transform .2s, box-shadow .2s, border-color .2s;
  }
  .hi-gallery-img:hover {
    transform: scale(1.04);
    box-shadow: 0 10px 28px rgba(99,102,241,0.15);
    border-color: #a855f7;
  }
`;

const HostInfo = (props: any) => {
  const { type1 } = props;

  let hostData: any = null;
  if (typeof window !== "undefined") {
    const data = localStorage.getItem("hostData");
    hostData = data ? JSON.parse(data) : null;
  }

  const [isClient, setIsClient] = useState(false);
  const loader  = useSelector(isLoading);
  const router  = useRouter();

  const updatedImagePath = hostData?.image?.replace(/\\/g, "/");

  useEffect(() => { setIsClient(true); }, []);
  if (!isClient) return null;

  const isFake = type1 === "fakeHost";

  /* ── field definitions ── */
  const basicFields = [
    { label: "Name",        value: hostData?.name },
    { label: "Unique ID",   value: hostData?.uniqueId },
    { label: "Gender",      value: hostData?.gender },
    { label: "Email",       value: hostData?.email },
    { label: "Date of Birth", value: hostData?.dob },
    { label: "Language",    value: Array.isArray(hostData?.language) ? hostData.language.join(", ") : hostData?.language },
    { label: "Country",     value: hostData?.country?.toUpperCase() },
    ...(!isFake ? [{ label: "Identity Proof Type", value: hostData?.identityProofType }] : []),
    ...(!isFake ? [{ label: "Coin", value: hostData?.coin?.toFixed(2) }] : []),
  ];

  const statusFields = [
    { label: "Is Online",  value: hostData?.isOnline },
    { label: "Is Busy",    value: hostData?.isBusy },
    { label: "Is Live",    value: hostData?.isLive },
    { label: "Is Block",   value: hostData?.isBlock },
  ];

  const rateFields = [
    { label: "Private Call Rate",       value: hostData?.privateCallRate },
    { label: "Random Call Female Rate", value: hostData?.randomCallFemaleRate },
    { label: "Random Call Male Rate",   value: hostData?.randomCallMaleRate },
    { label: "Random Call Rate",        value: hostData?.randomCallRate },
    { label: "Audio Call Rate",         value: hostData?.audioCallRate },
    { label: "Chat Rate",               value: hostData?.chatRate },
    { label: "Total Gifts",             value: hostData?.totalGifts },
  ];

  const stats = [
    { label: "Coins",   value: hostData?.coin?.toFixed(2) ?? "0.00" },
    { label: "Online",  value: hostData?.isOnline ? "Yes" : "No" },
    { label: "Live",    value: hostData?.isLive   ? "Yes" : "No" },
    { label: "Busy",    value: hostData?.isBusy   ? "Yes" : "No" },
    { label: "Blocked", value: hostData?.isBlock  ? "Yes" : "No" },
  ];

  return (
    <>
      <style>{hostInfoStyle}</style>

      <div className="hi-root">

        {/* ── Page Header ── */}
        <div className="hi-page-header">
          <button className="hi-back-btn" onClick={() => router.back()}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            Back
          </button>
          <div className="hi-page-title">
            <span className="hi-title-dot" />
            {hostData?.name ? `${hostData.name}'s Info` : "Host Info"}
          </div>
        </div>

        {/* ── Main Card ── */}
        <div className="hi-card">

          {/* ── Banner ── */}
          <div className="hi-banner">
            <div className="hi-avatar-wrap">
              {loader ? (
                <Skeleton width={90} height={90} borderRadius="16px" />
              ) : (
                <img
                  src={hostData?.image ? baseURL + updatedImagePath : male.src}
                  className="hi-avatar"
                  alt={hostData?.name}
                />
              )}
              <span className="hi-avatar-dot" />
            </div>

            <div className="hi-banner-info">
              <div className="hi-host-name">{hostData?.name || "—"}</div>
              <div className="hi-host-id">ID · {hostData?.uniqueId || "—"}</div>
              <div className="hi-badge-row">
                {hostData?.gender  && <span className="hi-badge">{hostData.gender}</span>}
                {hostData?.country && <span className="hi-badge">{hostData.country}</span>}
                {hostData?.age > 0 && <span className="hi-badge">{hostData.age} yrs</span>}
                <span className="hi-badge hi-badge-green">
                  <span style={{width:6,height:6,borderRadius:'50%',background:'#6ee7b7',display:'inline-block'}} />
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* ── Stats row ── */}
          {!isFake && (
            <div className="hi-stats-row">
              {stats.map(s => (
                <div className="hi-stat" key={s.label}>
                  <div className="hi-stat-value">{s.value}</div>
                  <div className="hi-stat-label">{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {/* ── Body ── */}
          <div className="hi-body">

            {/* Basic Info */}
            <div className="hi-section-head">
              <div className="hi-section-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <span className="hi-section-title">Basic Information</span>
              <span className="hi-section-line" />
            </div>

            <div className="hi-fields-grid">
              {loader
                ? Array(9).fill(0).map((_, i) => <Skeleton key={i} height={62} borderRadius="11px" />)
                : basicFields.map(f => (
                    <div className="hi-field" key={f.label}>
                      <div className="hi-field-label">{f.label}</div>
                      <div className="hi-field-value">{f.value || "—"}</div>
                    </div>
                  ))}
            </div>

            {/* Status fields */}
            {!isFake && (
              <>
                <div className="hi-section-head">
                  <div className="hi-section-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <span className="hi-section-title">Status</span>
                  <span className="hi-section-line" />
                </div>

                <div className="hi-fields-grid" style={{gridTemplateColumns:'repeat(auto-fill,minmax(160px,1fr))'}}>
                  {loader
                    ? Array(4).fill(0).map((_, i) => <Skeleton key={i} height={62} borderRadius="11px" />)
                    : statusFields.map(f => (
                        <div className="hi-field" key={f.label}>
                          <div className="hi-field-label">{f.label}</div>
                          <div className="hi-field-value">
                            {f.value
                              ? <span className="hi-field-yes"><span className="hi-dot-on"/>Yes</span>
                              : <span className="hi-field-no"><span className="hi-dot-off"/>No</span>}
                          </div>
                        </div>
                      ))}
                </div>
              </>
            )}

            {/* Call Rates */}
            {!isFake && (
              <>
                <div className="hi-section-head">
                  <div className="hi-section-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <line x1="12" y1="1" x2="12" y2="23"/>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                    </svg>
                  </div>
                  <span className="hi-section-title">Call Rates</span>
                  <span className="hi-section-line" />
                </div>

                <div className="hi-rates-grid">
                  {loader
                    ? Array(7).fill(0).map((_, i) => <Skeleton key={i} height={62} borderRadius="11px" />)
                    : rateFields.map(f => (
                        <div className="hi-rate-card" key={f.label}>
                          <div className="hi-rate-label">{f.label}</div>
                          <div className="hi-rate-value">{f.value ?? "—"}</div>
                        </div>
                      ))}
                </div>
              </>
            )}

            {/* Bio & Impression */}
            <div className="hi-section-head">
              <div className="hi-section-icon">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
              </div>
              <span className="hi-section-title">About</span>
              <span className="hi-section-line" />
            </div>

            <div className="hi-about-grid">
              <div className="hi-about-box">
                <div className="hi-about-label">Bio</div>
                {loader
                  ? <Skeleton height={80} borderRadius="8px" />
                  : <div className="hi-about-text">
                      {hostData?.bio || <span className="hi-empty">No bio provided</span>}
                    </div>}
              </div>
              <div className="hi-about-box">
                <div className="hi-about-label">Impression</div>
                {loader
                  ? <Skeleton height={80} borderRadius="8px" />
                  : <div className="hi-about-text">
                      {hostData?.impression?.[0] || <span className="hi-empty">No impression data</span>}
                    </div>}
              </div>
            </div>

            {/* Video (fakeHost only) */}
            {isFake && hostData?.video && (
              <>
                <div className="hi-section-head">
                  <div className="hi-section-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <polygon points="23 7 16 12 23 17 23 7"/>
                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                    </svg>
                  </div>
                  <span className="hi-section-title">Video</span>
                  <span className="hi-section-line" />
                </div>
                <div className="hi-video-wrap">
                  <video controls className="hi-video" src={baseURL + hostData.video} />
                </div>
              </>
            )}

            {/* Photo Gallery */}
            {hostData?.photoGallery?.length > 0 && (
              <div className="hi-gallery-wrap">
                <div className="hi-section-head">
                  <div className="hi-section-icon">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                  </div>
                  <span className="hi-section-title">Photo Gallery</span>
                  <span className="hi-section-line" />
                </div>
                <div className="hi-gallery-grid">
                  {hostData.photoGallery.map((item: any, index: number) => {
                    const finalUrl = typeof item === "string" ? item : item?.url;
                    return (
                      <Image
                        key={index}
                        src={finalUrl ? baseURL + finalUrl : male.src}
                        className="hi-gallery-img"
                        width={130}
                        height={140}
                        alt={`Gallery ${index + 1}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </>
  );
};

HostInfo.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default HostInfo;