import React, { useEffect } from "react";
import RootLayout from "../component/layout/Layout";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { ExInput, Textarea } from "@/extra/Input";
import { useSelector } from "react-redux";
import { isLoading } from "@/utils/allSelector";
import { useAppDispatch } from "@/store/store";
import { getStorageUrl } from "@/utils/config";
import male from "@/assets/images/male.png";
import { getUserProfile } from "@/store/userSlice";
import { useRouter } from "next/router";

interface RootStore {
  setting: any;
  user: {
    userProfile: any;
    userWalletHistory: any;
    user: any;
  };
}

const UserInfo = () => {
  const { userProfile, user } = useSelector((state: RootStore) => state.user);
  const userData = (() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(localStorage.getItem("userData") || "null");
    } catch {
      return null;
    }
  })();
  const loader = useSelector(isLoading);
  const { setting } = useSelector((state: RootStore) => state.setting);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const id: any = router?.query?.id;

  useEffect(() => {
    if (!userData?._id) return;
    if (userData?._id === router?.query?.id) {
      dispatch(getUserProfile(userData._id));
    } else {
      dispatch(getUserProfile(id || userData?._id));
    }
  }, [dispatch, userData?._id, id, router?.query?.id]);

  const fields = [
    { id: "name",         label: "Name",          value: userProfile?.name || "-",          icon: "👤" },
    { id: "uniqueId",     label: "Unique ID",      value: userProfile?.uniqueId || "-",      icon: "🔑" },
    { id: "emailId",      label: "Email",          value: userProfile?.email || "-",         icon: "✉️" },
    { id: "Country",      label: "Country",        value: userProfile?.country || "-",       icon: "🌍" },
    { id: "isOnline",     label: "Status",         value: userProfile?.isOnline ? "Online" : "Offline", icon: "🟢", isStatus: true, online: userProfile?.isOnline },
    { id: "Coin",         label: "Coins",          value: (userProfile?.coin || 0).toLocaleString(),    icon: "🪙" },
    { id: "RechargeCoin", label: "Recharged Coins",value: (userProfile?.rechargedCoins || 0).toLocaleString(), icon: "💳" },
    { id: "spendCoins",   label: "Spent Coins",    value: (userProfile?.spentCoins || 0).toLocaleString(),    icon: "💸" },
    { id: "SelfIntro",    label: "Self Intro",     value: userProfile?.selfIntro || "-",     icon: "💬" },
  ];

  const avatarSrc = userProfile?.image
    ? userProfile.image.replace(/\\/g, "/").includes("storage")
      ? getStorageUrl(userProfile.image)
      : userProfile.image.replace(/\\/g, "/")
    : male.src;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .ui-page {
          --accent:    #6366f1;
          --accent2:   #a855f7;
          --a-soft:    rgba(99,102,241,0.09);
          --a-mid:     rgba(99,102,241,0.16);
          --a-glow:    rgba(99,102,241,0.22);
          --border:    #e8eaf2;
          --txt:       #64748b;
          --txt-dark:  #1e2235;
          --txt-dim:   #a0a8c0;
          --white:     #ffffff;
          --bg:        #f4f5fb;
          --green:     #10b981;
          --red:       #f43f5e;

          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── Page header ── */
        .ui-page .ui-header {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 22px;
        }
        .ui-page .ui-header-pill {
          width: 4px; height: 24px; border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          flex-shrink: 0;
        }
        .ui-page .ui-header-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px; font-weight: 700;
          color: var(--txt-dark); margin: 0;
        }

        /* ── Main profile card ── */
        .ui-page .ui-profile-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 20px;
          box-shadow: 0 2px 20px rgba(99,102,241,0.07);
          overflow: hidden;
          margin-bottom: 20px;
        }

        /* Card top strip */
        .ui-page .ui-profile-banner {
          height: 90px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 60%, #ec4899 100%);
          position: relative;
        }
        .ui-page .ui-profile-banner::after {
          content: '';
          position: absolute; inset: 0;
          background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }

        .ui-page .ui-profile-body {
          padding: 0 28px 28px;
        }

        /* Avatar */
        .ui-page .ui-avatar-wrap {
          display: flex; align-items: flex-end; gap: 20px;
          margin-top: -44px; margin-bottom: 20px;
        }
        .ui-page .ui-avatar {
          width: 100px; height: 100px; border-radius: 20px;
          object-fit: cover;
          border: 4px solid var(--white);
          box-shadow: 0 4px 18px rgba(99,102,241,0.18);
          flex-shrink: 0;
        }
        .ui-page .ui-avatar-sk {
          width: 100px; height: 100px; border-radius: 20px;
          border: 4px solid var(--white);
          flex-shrink: 0; overflow: hidden;
        }
        .ui-page .ui-avatar-info { padding-bottom: 6px; }
        .ui-page .ui-avatar-name {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px; font-weight: 700;
          color: var(--txt-dark); margin: 0 0 3px;
        }
        .ui-page .ui-avatar-uid {
          font-size: 12px; color: var(--txt-dim); font-weight: 500;
        }
        .ui-page .ui-badge {
          display: inline-flex; align-items: center; gap: 5px;
          padding: 3px 10px; border-radius: 20px;
          font-size: 11px; font-weight: 600;
          margin-left: 10px;
        }
        .ui-page .ui-badge.online  { background: rgba(16,185,129,0.10); color: var(--green); }
        .ui-page .ui-badge.offline { background: rgba(244,63,94,0.09);  color: var(--red); }
        .ui-page .ui-badge-dot {
          width: 6px; height: 6px; border-radius: 50%;
        }
        .ui-page .ui-badge.online  .ui-badge-dot { background: var(--green); }
        .ui-page .ui-badge.offline .ui-badge-dot { background: var(--red); }

        /* ── Fields grid ── */
        .ui-page .ui-fields-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 14px;
          margin-bottom: 18px;
        }
        @media(max-width:900px){ .ui-page .ui-fields-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:580px){ .ui-page .ui-fields-grid { grid-template-columns: 1fr; } }

        .ui-page .ui-field {
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 12px;
          padding: 12px 14px;
          transition: border-color .15s, box-shadow .15s;
        }
        .ui-page .ui-field:hover {
          border-color: var(--a-mid);
          box-shadow: 0 2px 10px var(--a-glow);
        }
        .ui-page .ui-field-label {
          font-size: 10.5px; font-weight: 600;
          color: var(--txt-dim); text-transform: uppercase;
          letter-spacing: .6px; margin: 0 0 5px;
          display: flex; align-items: center; gap: 5px;
        }
        .ui-page .ui-field-val {
          font-size: 14.5px; font-weight: 600;
          color: var(--txt-dark); margin: 0;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* ── Coin highlight cards ── */
        .ui-page .ui-coins-row {
          display: grid;
          grid-template-columns: repeat(3,1fr);
          gap: 14px;
          margin-bottom: 18px;
        }
        @media(max-width:700px){ .ui-page .ui-coins-row { grid-template-columns: 1fr; } }

        .ui-page .ui-coin-card {
          border-radius: 14px; padding: 14px 16px;
          display: flex; align-items: center; gap: 12px;
          border: 1.5px solid transparent;
        }
        .ui-page .ui-coin-card.c1 { background: rgba(99,102,241,0.07);  border-color: rgba(99,102,241,0.18); }
        .ui-page .ui-coin-card.c2 { background: rgba(16,185,129,0.07);  border-color: rgba(16,185,129,0.18); }
        .ui-page .ui-coin-card.c3 { background: rgba(244,63,94,0.07);   border-color: rgba(244,63,94,0.16);  }
        .ui-page .ui-coin-icon {
          font-size: 24px; line-height: 1; flex-shrink: 0;
        }
        .ui-page .ui-coin-label {
          font-size: 10.5px; font-weight: 600; text-transform: uppercase;
          letter-spacing: .6px; margin: 0 0 3px; color: var(--txt-dim);
        }
        .ui-page .ui-coin-val {
          font-family: 'Rajdhani', sans-serif;
          font-size: 22px; font-weight: 700; margin: 0;
        }
        .ui-page .ui-coin-card.c1 .ui-coin-val { color: var(--accent); }
        .ui-page .ui-coin-card.c2 .ui-coin-val { color: var(--green);  }
        .ui-page .ui-coin-card.c3 .ui-coin-val { color: var(--red);    }

        /* ── Section title ── */
        .ui-page .ui-sec {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 12px; margin-top: 4px;
        }
        .ui-page .ui-sec-pill {
          width: 3px; height: 18px; border-radius: 3px; flex-shrink: 0;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
        }
        .ui-page .ui-sec-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 700;
          color: var(--txt-dark); margin: 0;
        }

        /* ── Bio / textarea box ── */
        .ui-page .ui-bio-box {
          background: var(--bg);
          border: 1.5px solid var(--border);
          border-radius: 14px; padding: 14px 16px;
          font-size: 14px; color: var(--txt);
          line-height: 1.65; min-height: 100px;
          white-space: pre-wrap;
          margin-bottom: 20px;
        }

        /* ── Gallery ── */
        .ui-page .ui-gallery {
          display: flex; flex-wrap: wrap; gap: 12px;
        }
        .ui-page .ui-gallery-img {
          width: 110px; height: 120px; border-radius: 14px;
          object-fit: cover; border: 2px solid var(--border);
          transition: transform .15s, box-shadow .15s;
          cursor: pointer;
        }
        .ui-page .ui-gallery-img:hover {
          transform: scale(1.04);
          box-shadow: 0 6px 20px rgba(99,102,241,0.18);
        }

        /* ── Identity proof ── */
        .ui-page .ui-id-img {
          width: 80px; height: 80px; border-radius: 12px;
          object-fit: cover; border: 2px solid var(--border);
          cursor: pointer;
          transition: transform .15s, box-shadow .15s;
        }
        .ui-page .ui-id-img:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 14px rgba(99,102,241,0.18);
        }
        .ui-page .ui-id-row {
          display: flex; flex-wrap: wrap; gap: 10px;
          margin-bottom: 20px;
        }
      `}</style>

      <div className="ui-page">
        <SkeletonTheme baseColor="#e8eaf2" highlightColor="#f4f5fb">

          {/* ── Page heading ── */}
          <div className="ui-header">
            <div className="ui-header-pill"/>
            <h1 className="ui-header-title">User Profile</h1>
          </div>

          {/* ── Profile card ── */}
          <div className="ui-profile-card">
            <div className="ui-profile-banner"/>
            <div className="ui-profile-body">

              {/* Avatar + name row */}
              <div className="ui-avatar-wrap">
                {loader ? (
                  <div className="ui-avatar-sk">
                    <Skeleton height={100} width={100}/>
                  </div>
                ) : (
                  <img src={avatarSrc} className="ui-avatar" alt="Profile"/>
                )}
                <div className="ui-avatar-info">
                  {loader ? (
                    <>
                      <Skeleton width={160} height={22} style={{ marginBottom:6 }}/>
                      <Skeleton width={100} height={14}/>
                    </>
                  ) : (
                    <>
                      <p className="ui-avatar-name">
                        {userProfile?.name || "—"}
                        <span className={`ui-badge ${userProfile?.isOnline ? "online" : "offline"}`}>
                          <span className="ui-badge-dot"/>
                          {userProfile?.isOnline ? "Online" : "Offline"}
                        </span>
                      </p>
                      <p className="ui-avatar-uid">UID: {userProfile?.uniqueId || "—"}</p>
                    </>
                  )}
                </div>
              </div>

              {/* ── Coin highlights ── */}
              <div className="ui-sec">
                <div className="ui-sec-pill"/>
                <h2 className="ui-sec-title">Coin Summary</h2>
              </div>

              <div className="ui-coins-row" style={{ marginBottom: 22 }}>
                {loader ? (
                  [1,2,3].map(i => (
                    <Skeleton key={i} height={70} style={{ borderRadius:14 }}/>
                  ))
                ) : (
                  <>
                    <div className="ui-coin-card c1">
                      <span className="ui-coin-icon">🪙</span>
                      <div>
                        <p className="ui-coin-label">Current Coins</p>
                        <p className="ui-coin-val">{(userProfile?.coin || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="ui-coin-card c2">
                      <span className="ui-coin-icon">💳</span>
                      <div>
                        <p className="ui-coin-label">Recharged</p>
                        <p className="ui-coin-val">{(userProfile?.rechargedCoins || 0).toLocaleString()}</p>
                      </div>
                    </div>
                    <div className="ui-coin-card c3">
                      <span className="ui-coin-icon">💸</span>
                      <div>
                        <p className="ui-coin-label">Spent</p>
                        <p className="ui-coin-val">{(userProfile?.spentCoins || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* ── Info fields ── */}
              <div className="ui-sec">
                <div className="ui-sec-pill"/>
                <h2 className="ui-sec-title">Profile Details</h2>
              </div>

              <div className="ui-fields-grid" style={{ marginBottom: 22 }}>
                {loader
                  ? [1,2,3,4,5,6].map(i => (
                      <Skeleton key={i} height={62} style={{ borderRadius:12 }}/>
                    ))
                  : [
                      { label:"Name",       icon:"👤", value: userProfile?.name || "—" },
                      { label:"Unique ID",  icon:"🔑", value: userProfile?.uniqueId || "—" },
                      { label:"Email",      icon:"✉️",  value: userProfile?.email || "—" },
                      { label:"Country",    icon:"🌍", value: userProfile?.country || "—" },
                      { label:"Self Intro", icon:"💬", value: userProfile?.selfIntro || "—" },
                    ].map((f, i) => (
                      <div className="ui-field" key={i}>
                        <p className="ui-field-label">
                          <span>{f.icon}</span>{f.label}
                        </p>
                        <p className="ui-field-val">{f.value}</p>
                      </div>
                    ))
                }
              </div>

              {/* ── Bio ── */}
              <div className="ui-sec">
                <div className="ui-sec-pill"/>
                <h2 className="ui-sec-title">Bio</h2>
              </div>

              {loader ? (
                <Skeleton height={100} style={{ borderRadius:14, marginBottom:22 }}/>
              ) : (
                <div className="ui-bio-box" style={{ marginBottom: 22 }}>
                  {userProfile?.bio || "No bio available."}
                </div>
              )}

              {/* ── Identity Proof ── */}
              {!loader && userProfile?.identityProof?.some((url: string) => url.trim() !== "") && (
                <>
                  <div className="ui-sec">
                    <div className="ui-sec-pill"/>
                    <h2 className="ui-sec-title">Identity Proof</h2>
                  </div>
                  <div className="ui-id-row">
                    {userProfile.identityProof
                      .filter((url: string) => url.trim() !== "")
                      .map((url: string, i: number) => (
                        <img
                          key={i}
                          src={baseURL + url}
                          className="ui-id-img"
                          alt={`ID Proof ${i + 1}`}
                        />
                      ))}
                  </div>
                </>
              )}

              {/* ── Photo Gallery ── */}
              {!loader && userProfile?.photoGallery?.length > 0 && (
                <>
                  <div className="ui-sec">
                    <div className="ui-sec-pill"/>
                    <h2 className="ui-sec-title">Host Gallery</h2>
                  </div>
                  <div className="ui-gallery">
                    {userProfile.photoGallery.map((url: string, i: number) => (
                      <img
                        key={i}
                        src={userProfile?.image ? baseURL + url : male.src}
                        className="ui-gallery-img"
                        alt={`Gallery ${i + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}

            </div>
          </div>

        </SkeletonTheme>
      </div>
    </>
  );
};

UserInfo.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default UserInfo;