import React, { useEffect, useState } from "react";
import RootLayout from "../../component/layout/Layout";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { useDispatch, useSelector } from "react-redux";
import { isLoading } from "@/utils/allSelector";
import { useRouter } from "next/router";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import { getHostProfile } from "@/store/hostSlice";
import ReactSelect from "react-select";
import countriesData from "@/api/countries.json";

const HostInfo = (props: any) => {
  const { type1 } = props;
  const { hostProfile } = useSelector((state: any) => state.host);
  const hostInfoData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hostData") || "null")
      : null;

  const [countryOptions, setCountryOptions] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const loader = useSelector(isLoading);
  const router = useRouter();
  const id: any = router?.query?.id;
  const [isClient, setIsClient] = useState(false);
  const dispatch = useDispatch();

  let hostData: any = null;
  if (typeof window !== "undefined") {
    const d = localStorage.getItem("hostData");
    hostData = d ? JSON.parse(d) : null;
  }
  const updatedImagePath = hostData?.image?.replace(/\\/g, "/");

  useEffect(() => { dispatch(getHostProfile(id || hostInfoData?._id)); }, [dispatch, id]);

  useEffect(() => {
    setIsClient(true);
    try {
      const opts = countriesData
        .filter((c) => c.name?.common && c.cca2 && c.flags?.png)
        .map((c) => ({
          value: c.cca2, label: c.name.common, name: c.name.common,
          code: c.cca2, flagUrl: c.flags.png || c.flags.svg, flag: c.flags.png || c.flags.svg,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setCountryOptions(opts);
      if (hostProfile?.country) {
        setSelectedCountry(opts.find((c: any) => c.name.toLowerCase() === hostProfile.country.toLowerCase()) || null);
      } else {
        setSelectedCountry(opts.find((c: any) => c.name === "India") || opts[0] || null);
      }
    } catch {}
  }, [hostProfile]);

  if (!isClient) return null;

  const isFake = type1 === "fakeHost";

  const CustomOption = ({ innerRef, innerProps, data }: any) => (
    <div ref={innerRef} {...innerProps}
      style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", cursor:"pointer" }}>
      <img height={18} width={26} alt={data.name} src={data.flagUrl}
        style={{ objectFit:"cover", borderRadius:2 }}
        onError={(e:any)=>{ e.target.style.display="none"; }} />
      <span style={{ fontSize:13 }}>{data.label}</span>
    </div>
  );

  const infoFields = [
    { icon:"👤", label:"Name",          value: hostProfile?.name || "—" },
    { icon:"🆔", label:"Unique ID",     value: hostProfile?.uniqueId || "—" },
    { icon:"⚧",  label:"Gender",        value: hostProfile?.gender || "—" },
    { icon:"✉️", label:"Email",         value: hostProfile?.email || "—" },
    { icon:"🎂", label:"Date of Birth", value: hostProfile?.dob || "—" },
    ...(!isFake ? [{ icon:"🪙", label:"Coins", value: hostProfile?.coin?.toFixed(2) || "0" }] : []),
    { icon:"🌐", label:"Language",      value: hostProfile?.language?.length ? hostProfile.language.toString() : "—" },
  ];

  const rateFields = [
    { icon:"📞", label:"Private Call Rate",       value: hostProfile?.privateCallRate || "0" },
    { icon:"👩", label:"Random Call Female",       value: hostProfile?.randomCallFemaleRate || "0" },
    { icon:"👨", label:"Random Call Male",         value: hostProfile?.randomCallMaleRate || "0" },
    { icon:"🎲", label:"Random Call Rate",         value: hostProfile?.randomCallRate || "0" },
    ...(!isFake ? [
      { icon:"🎙️", label:"Audio Call Rate",        value: hostProfile?.audioCallRate || "0" },
      { icon:"💬", label:"Chat Rate",              value: hostProfile?.chatRate || "0" },
      { icon:"🎁", label:"Total Gifts Received",   value: hostProfile?.totalGifts || "0" },
    ] : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .hi-page {
          --ac:  #6366f1; --ac2: #a855f7; --pink: #ec4899;
          --gn:  #10b981; --am: rgba(99,102,241,.16); --as: rgba(99,102,241,.08);
          --bd:  #e8eaf2; --tx: #64748b; --td: #1e2235; --dim: #a0a8c0;
          --wh:  #ffffff; --bg: #f4f5fb;
          font-family: 'Outfit', sans-serif;
          padding: 24px 24px 56px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* page heading */
        .hi-page .hi-ph { display:flex; align-items:center; gap:10px; margin-bottom:22px; }
        .hi-page .hi-ph-bar { width:4px; height:26px; border-radius:4px; flex-shrink:0; background:linear-gradient(180deg,var(--ac),var(--ac2)); }
        .hi-page .hi-ph-title { font-family:'Rajdhani',sans-serif; font-size:23px; font-weight:700; color:var(--td); margin:0; }
        .hi-page .hi-ph-badge { padding:3px 12px; border-radius:20px; font-size:12px; font-weight:700; display:inline-flex; align-items:center; gap:5px; }
        .hi-page .hi-ph-badge.real { background:rgba(16,185,129,.10); color:var(--gn); }
        .hi-page .hi-ph-badge.fake { background:rgba(168,85,247,.10); color:#a855f7; }

        /* cards */
        .hi-page .hi-card { background:var(--wh); border:1px solid var(--bd); border-radius:20px; box-shadow:0 2px 20px rgba(99,102,241,.06); overflow:hidden; margin-bottom:18px; }
        .hi-page .hi-card-head { padding:13px 22px; background:linear-gradient(135deg,rgba(99,102,241,.04),rgba(168,85,247,.02)); border-bottom:1px solid var(--bd); display:flex; align-items:center; gap:9px; }
        .hi-page .hi-card-head-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,var(--ac),var(--ac2)); }
        .hi-page .hi-card-head-title { font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:700; color:var(--td); margin:0; }
        .hi-page .hi-cb { padding:20px 22px; }

        /* banner */
        .hi-page .hi-banner { height:96px; background:linear-gradient(135deg,#6366f1 0%,#a855f7 55%,#ec4899 100%); position:relative; overflow:hidden; }
        .hi-page .hi-banner::before { content:''; position:absolute; inset:0; background:repeating-linear-gradient(45deg,transparent 0,transparent 14px,rgba(255,255,255,.04) 14px,rgba(255,255,255,.04) 28px); }

        /* avatar row */
        .hi-page .hi-av-row { display:flex; align-items:flex-end; gap:18px; padding:0 26px 22px; margin-top:-50px; }
        .hi-page .hi-av { width:108px; height:108px; border-radius:20px; object-fit:cover; border:4px solid var(--wh); box-shadow:0 4px 20px rgba(99,102,241,.20); flex-shrink:0; }
        .hi-page .hi-av-sk { width:108px; height:108px; border-radius:20px; border:4px solid var(--wh); flex-shrink:0; overflow:hidden; }
        .hi-page .hi-av-name { font-family:'Rajdhani',sans-serif; font-size:23px; font-weight:700; color:var(--td); margin:0 0 3px; }
        .hi-page .hi-av-uid  { font-size:12.5px; color:var(--dim); font-weight:500; margin:0; }

        /* section label */
        .hi-page .hi-sec { font-size:10.5px; font-weight:700; color:var(--dim); text-transform:uppercase; letter-spacing:.7px; margin:0 0 12px; display:flex; align-items:center; gap:8px; }
        .hi-page .hi-sec::after { content:''; flex:1; height:1px; background:var(--bd); }

        /* grids */
        .hi-page .hi-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        .hi-page .hi-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:12px; }
        @media(max-width:1100px){ .hi-page .hi-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:768px) { .hi-page .hi-grid,.hi-page .hi-grid-2 { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:480px) { .hi-page .hi-grid,.hi-page .hi-grid-2 { grid-template-columns:1fr; } }

        /* field tile */
        .hi-page .hi-field { background:var(--bg); border:1.5px solid var(--bd); border-radius:13px; padding:11px 14px; transition:border-color .15s,box-shadow .15s; }
        .hi-page .hi-field:hover { border-color:var(--am); box-shadow:0 2px 10px rgba(99,102,241,.07); }
        .hi-page .hi-field-label { font-size:10px; font-weight:700; color:var(--dim); text-transform:uppercase; letter-spacing:.7px; margin:0 0 5px; }
        .hi-page .hi-field-val   { font-size:14px; font-weight:600; color:var(--td); margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        /* rate tiles */
        .hi-page .hi-rate-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:12px; }
        @media(max-width:1100px){ .hi-page .hi-rate-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:768px) { .hi-page .hi-rate-grid { grid-template-columns:repeat(2,1fr); } }
        .hi-page .hi-rate-tile { background:var(--as); border:1.5px solid var(--am); border-radius:13px; padding:13px 16px; transition:transform .13s; }
        .hi-page .hi-rate-tile:hover { transform:translateY(-2px); }
        .hi-page .hi-rate-icon  { font-size:18px; margin-bottom:6px; display:block; }
        .hi-page .hi-rate-label { font-size:10px; font-weight:700; color:var(--ac); text-transform:uppercase; letter-spacing:.6px; margin:0 0 4px; }
        .hi-page .hi-rate-val   { font-family:'Rajdhani',sans-serif; font-size:22px; font-weight:700; color:var(--td); margin:0; }

        /* bio */
        .hi-page .hi-bio-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        @media(max-width:700px){ .hi-page .hi-bio-grid { grid-template-columns:1fr; } }
        .hi-page .hi-bio-lbl { font-size:10.5px; font-weight:700; color:var(--dim); text-transform:uppercase; letter-spacing:.6px; margin:0 0 8px; }
        .hi-page .hi-bio-box { background:var(--bg); border:1.5px solid var(--bd); border-radius:13px; padding:14px 16px; font-size:13.5px; color:var(--tx); line-height:1.7; min-height:110px; white-space:pre-wrap; word-break:break-word; }

        /* react-select inside field — readonly look */
        .hi-page .hi-field .react-select__control { background:transparent !important; border:none !important; min-height:unset !important; box-shadow:none !important; padding:0 !important; font-family:'Outfit',sans-serif !important; font-size:14px !important; font-weight:600 !important; }
        .hi-page .hi-field .react-select__value-container { padding:0 !important; }
        .hi-page .hi-field .react-select__indicators { display:none !important; }
        .hi-page .hi-field .react-select__single-value { color:var(--td) !important; font-size:14px !important; font-weight:600 !important; margin:0 !important; }
        .hi-page .hi-field .react-select__menu { border-radius:12px !important; border:1px solid var(--bd) !important; box-shadow:0 8px 30px rgba(15,17,35,.12) !important; z-index:999; }
        .hi-page .hi-field .react-select__option--is-selected { background:var(--ac) !important; color:#fff !important; }
        .hi-page .hi-field .react-select__option--is-focused  { background:var(--as) !important; }

        /* media */
        .hi-page .hi-media { display:flex; flex-wrap:wrap; gap:12px; }
        .hi-page .hi-media-img { width:130px; height:130px; border-radius:14px; object-fit:cover; border:2px solid var(--bd); cursor:pointer; transition:transform .15s,box-shadow .15s; }
        .hi-page .hi-media-img:hover { transform:scale(1.04); box-shadow:0 6px 20px rgba(99,102,241,.18); }
        .hi-page .hi-media-vid { width:170px; height:170px; border-radius:14px; border:2px solid var(--bd); background:#0a0a14; }
        .hi-page .hi-id-img   { width:110px; height:110px; border-radius:13px; object-fit:cover; border:2px solid var(--bd); cursor:pointer; transition:transform .15s; }
        .hi-page .hi-id-img:hover { transform:scale(1.05); }

        .hi-page .hi-div { height:1px; background:var(--bd); margin:18px 0; }
      `}</style>

      <div className="hi-page">
        <SkeletonTheme baseColor="#e8eaf2" highlightColor="#f4f5fb">

          {/* Page heading */}
          <div className="hi-ph">
            <div className="hi-ph-bar" />
            <h1 className="hi-ph-title">
              {loader ? "Host Profile" : hostProfile?.name ? `${hostProfile.name}'s Profile` : "Host Profile"}
            </h1>
            {!loader && (
              <span className={`hi-ph-badge ${isFake ? "fake" : "real"}`}>
                {isFake ? "🤖 Fake Host" : "🎙️ Real Host"}
              </span>
            )}
          </div>

          {/* ── PROFILE CARD ── */}
          <div className="hi-card">
            <div className="hi-banner" />
            <div className="hi-av-row">
              {loader ? (
                <div className="hi-av-sk"><Skeleton height={108} width={108} /></div>
              ) : (
                <img src={hostProfile?.image ? baseURL + updatedImagePath : male.src} className="hi-av" alt="Host" />
              )}
              <div style={{ paddingBottom:6 }}>
                {loader ? (
                  <><Skeleton width={160} height={22} style={{marginBottom:6}}/><Skeleton width={110} height={14}/></>
                ) : (
                  <>
                    <p className="hi-av-name">{hostProfile?.name || "—"}</p>
                    <p className="hi-av-uid">UID: {hostProfile?.uniqueId || "—"}</p>
                  </>
                )}
              </div>
            </div>

            <div className="hi-cb" style={{ paddingTop:0 }}>
              {/* Agency details — real only */}
              {!isFake && (
                <>
                  <p className="hi-sec">Agency Details</p>
                  <div className="hi-grid-2" style={{ marginBottom:18 }}>
                    {loader ? [1,2].map(i=><Skeleton key={i} height={58} style={{borderRadius:13}}/>) : (
                      <>
                        <div className="hi-field">
                          <p className="hi-field-label">🏷️ Agency Code</p>
                          <p className="hi-field-val">{hostProfile?.agencyId?.agencyCode || "—"}</p>
                        </div>
                        <div className="hi-field">
                          <p className="hi-field-label">🏢 Agency Name</p>
                          <p className="hi-field-val">{hostProfile?.agencyId?.name || "—"}</p>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="hi-div" />
                </>
              )}

              <p className="hi-sec">Host Details</p>
              <div className="hi-grid" style={{ marginBottom:14 }}>
                {loader
                  ? [1,2,3,4,5,6,7].map(i=><Skeleton key={i} height={58} style={{borderRadius:13}}/>)
                  : infoFields.map((f,i)=>(
                    <div className="hi-field" key={i}>
                      <p className="hi-field-label">{f.icon} {f.label}</p>
                      <p className="hi-field-val">{f.value}</p>
                    </div>
                  ))
                }
                {!loader && (
                  <div className="hi-field">
                    <p className="hi-field-label">🌍 Country</p>
                    <ReactSelect
                      options={countryOptions} value={selectedCountry}
                      isClearable={false} isDisabled placeholder="—"
                      classNamePrefix="react-select"
                      formatOptionLabel={(option:any)=>(
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <img height={16} width={22} alt={option.name} src={option.flagUrl}
                            style={{objectFit:"cover",borderRadius:2}}
                            onError={(e:any)=>{e.target.style.display="none";}} />
                          <span>{option.label}</span>
                        </div>
                      )}
                      components={{ Option: CustomOption }}
                      styles={{ option:(p)=>({...p,cursor:"pointer"}) }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── CALL RATES ── */}
          <div className="hi-card">
            <div className="hi-card-head">
              <div className="hi-card-head-dot" />
              <span className="hi-card-head-title">Call Rates</span>
            </div>
            <div className="hi-cb">
              <div className="hi-rate-grid">
                {loader
                  ? [1,2,3,4].map(i=><Skeleton key={i} height={76} style={{borderRadius:13}}/>)
                  : rateFields.map((f,i)=>(
                    <div className="hi-rate-tile" key={i}>
                      <span className="hi-rate-icon">{f.icon}</span>
                      <p className="hi-rate-label">{f.label}</p>
                      <p className="hi-rate-val">{f.value}</p>
                    </div>
                  ))
                }
              </div>
            </div>
          </div>

          {/* ── BIO & IMPRESSION ── */}
          <div className="hi-card">
            <div className="hi-card-head">
              <div className="hi-card-head-dot" />
              <span className="hi-card-head-title">Bio &amp; Impression</span>
            </div>
            <div className="hi-cb">
              {loader ? (
                <div className="hi-bio-grid">{[1,2].map(i=><Skeleton key={i} height={110} style={{borderRadius:13}}/>)}</div>
              ) : (
                <div className="hi-bio-grid">
                  <div>
                    <p className="hi-bio-lbl">Bio</p>
                    <div className="hi-bio-box">{hostProfile?.bio || "No bio available."}</div>
                  </div>
                  <div>
                    <p className="hi-bio-lbl">Impression</p>
                    <div className="hi-bio-box">
                      {hostProfile?.impression?.length ? hostProfile.impression.toString() : "No impression data."}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── IDENTITY PROOF (real only) ── */}
          {!isFake && hostProfile?.identityProof?.some((u:string)=>u.trim()!=="") && (
            <div className="hi-card">
              <div className="hi-card-head">
                <div className="hi-card-head-dot" />
                <span className="hi-card-head-title">Identity Proof</span>
              </div>
              <div className="hi-cb">
                {hostProfile?.identityProofType && (
                  <div className="hi-field" style={{display:"inline-block",marginBottom:16}}>
                    <p className="hi-field-label">🪪 Proof Type</p>
                    <p className="hi-field-val">{hostProfile.identityProofType}</p>
                  </div>
                )}
                <div className="hi-media">
                  {hostProfile.identityProof.filter((u:string)=>u.trim()!=="").map((url:string,i:number)=>(
                    <img key={i} src={baseURL+url} className="hi-id-img" alt={`ID ${i+1}`} />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── FAKE HOST VIDEOS ── */}
          {isFake && hostProfile?.video?.length > 0 && (
            <div className="hi-card">
              <div className="hi-card-head"><div className="hi-card-head-dot"/><span className="hi-card-head-title">Videos</span></div>
              <div className="hi-cb"><div className="hi-media">
                {hostProfile.video.map((item:string,i:number)=>(
                  <video key={i} controls className="hi-media-vid" src={baseURL+item} />
                ))}
              </div></div>
            </div>
          )}
          {isFake && hostProfile?.liveVideo?.length > 0 && (
            <div className="hi-card">
              <div className="hi-card-head"><div className="hi-card-head-dot"/><span className="hi-card-head-title">Live Videos</span></div>
              <div className="hi-cb"><div className="hi-media">
                {hostProfile.liveVideo.map((item:string,i:number)=>(
                  <video key={i} controls className="hi-media-vid" src={baseURL+item} />
                ))}
              </div></div>
            </div>
          )}

          {/* ── PROFILE VIDEO ── */}
          {hostProfile?.profileVideo?.length > 0 && (
            <div className="hi-card">
              <div className="hi-card-head"><div className="hi-card-head-dot"/><span className="hi-card-head-title">Profile Video</span></div>
              <div className="hi-cb"><div className="hi-media">
                {hostProfile.profileVideo.map((item:any,i:number)=>{
                  const url = typeof item==="string"?item:item?.url;
                  return <video key={i} controls className="hi-media-vid" src={baseURL+url} />;
                })}
              </div></div>
            </div>
          )}

          {/* ── PHOTO GALLERY ── */}
          {hostProfile?.photoGallery?.length > 0 && (
            <div className="hi-card">
              <div className="hi-card-head"><div className="hi-card-head-dot"/><span className="hi-card-head-title">Photo Gallery</span></div>
              <div className="hi-cb"><div className="hi-media">
                {hostProfile.photoGallery.map((item:any,i:number)=>{
                  const url = typeof item==="string"?item:item?.url;
                  return <img key={i} src={url?baseURL+url:male.src} className="hi-media-img" alt={`Gallery ${i+1}`} />;
                })}
              </div></div>
            </div>
          )}

        </SkeletonTheme>
      </div>
    </>
  );
};

HostInfo.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default HostInfo;