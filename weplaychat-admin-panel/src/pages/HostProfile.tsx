import React, { useEffect, useState } from "react";
import RootLayout from "../component/layout/Layout";
import Skeleton, { SkeletonTheme } from "react-loading-skeleton";
import { ExInput, Textarea } from "@/extra/Input";
import { useSelector } from "react-redux";
import { isLoading } from "@/utils/allSelector";
import { useAppDispatch } from "@/store/store";
import { useRouter } from "next/router";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";

interface RootStore {
  setting: any;
  user: {
    userProfile: any;
    userWalletHistory: any;
    user: any;
  };
}

const HostProfile = () => {
  const hostData =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("hostData") || "null")
      : null;

  const loader = useSelector(isLoading);
  const router = useRouter();
  const id: any = router?.query?.id;

  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const { setting } = useSelector((state: RootStore) => state.setting);
  const [status, setStatus] = useState<any>("ALL");
  const [isClient, setIsClient] = useState(false);
  const [activeTab, setActiveTab] = useState<"info" | "gallery" | "docs">("info");
  const updatedImagePath = hostData?.image?.replace(/\\/g, "/");
  const dispatch = useAppDispatch();

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const InfoField = ({
    label,
    value,
    icon,
  }: {
    label: string;
    value: string | number;
    icon?: string;
  }) => (
    <div style={styles.fieldWrapper}>
      <span style={styles.fieldLabel}>{icon && <span style={{ marginRight: 6 }}>{icon}</span>}{label}</span>
      <div style={styles.fieldValue}>{value || "—"}</div>
    </div>
  );

  const profileImage = hostData?.image
    ? baseURL + updatedImagePath
    : male.src;

  const tabs = [
    { id: "info", label: "Profile Info", icon: "👤" },
    { id: "gallery", label: "Album", icon: "🖼️" },
    { id: "docs", label: "Documents", icon: "📄" },
  ] as const;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        * { box-sizing: border-box; }

        .host-page {
          font-family: 'DM Sans', sans-serif;
          background: #f4f2ee;
          min-height: 100vh;
          padding: 32px 28px;
        }

        .host-hero {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
          border-radius: 24px;
          padding: 40px;
          display: flex;
          gap: 40px;
          align-items: flex-start;
          margin-bottom: 28px;
          position: relative;
          overflow: hidden;
        }

        .host-hero::before {
          content: '';
          position: absolute;
          top: -80px; right: -80px;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(229,160,60,0.15) 0%, transparent 70%);
          pointer-events: none;
        }

        .host-hero::after {
          content: '';
          position: absolute;
          bottom: -60px; left: 30%;
          width: 200px; height: 200px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,179,237,0.08) 0%, transparent 70%);
          pointer-events: none;
        }

        .avatar-ring {
          flex-shrink: 0;
          position: relative;
          width: 200px;
          height: 200px;
        }

        .avatar-ring img {
          width: 200px;
          height: 200px;
          border-radius: 20px;
          object-fit: cover;
          border: 3px solid rgba(229,160,60,0.5);
          display: block;
        }

        .status-dot {
          position: absolute;
          bottom: 12px;
          right: 12px;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #48BB78;
          border: 2px solid #1a1a2e;
          box-shadow: 0 0 0 3px rgba(72,187,120,0.25);
        }

        .hero-info { flex: 1; min-width: 0; }

        .hero-name {
          font-family: 'Syne', sans-serif;
          font-size: 32px;
          font-weight: 800;
          color: #ffffff;
          margin: 0 0 4px 0;
          line-height: 1.1;
        }

        .hero-uid {
          font-size: 13px;
          color: rgba(255,255,255,0.45);
          font-weight: 400;
          margin-bottom: 20px;
          letter-spacing: 1px;
          text-transform: uppercase;
        }

        .hero-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 28px;
        }

        .hero-tag {
          padding: 5px 14px;
          border-radius: 100px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
        }

        .tag-gender { background: rgba(99,179,237,0.15); color: #90CDF4; border: 1px solid rgba(99,179,237,0.2); }
        .tag-country { background: rgba(154,205,50,0.12); color: #9ACD32; border: 1px solid rgba(154,205,50,0.2); }
        .tag-age { background: rgba(229,160,60,0.15); color: #E5A03C; border: 1px solid rgba(229,160,60,0.2); }

        .hero-stats {
          display: flex;
          gap: 28px;
        }

        .stat-item { text-align: left; }

        .stat-val {
          font-family: 'Syne', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: #E5A03C;
          line-height: 1;
        }

        .stat-lbl {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-top: 3px;
        }

        .tab-nav {
          display: flex;
          gap: 4px;
          background: #ffffff;
          border-radius: 16px;
          padding: 6px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.06);
          width: fit-content;
        }

        .tab-btn {
          padding: 10px 22px;
          border-radius: 12px;
          border: none;
          cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          background: transparent;
          color: #888;
        }

        .tab-btn.active {
          background: #1a1a2e;
          color: #ffffff;
          box-shadow: 0 2px 8px rgba(26,26,46,0.25);
        }

        .tab-btn:hover:not(.active) {
          background: #f4f2ee;
          color: #333;
        }

        .content-card {
          background: #ffffff;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.05);
        }

        .fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .field-wrapper {
          background: #fafafa;
          border: 1px solid #eeece8;
          border-radius: 14px;
          padding: 14px 18px;
          transition: border-color 0.2s;
        }

        .field-wrapper:hover { border-color: #d4c9b0; }

        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: #aaa;
          text-transform: uppercase;
          letter-spacing: 1px;
          display: block;
          margin-bottom: 6px;
        }

        .field-value {
          font-size: 15px;
          font-weight: 500;
          color: #1a1a2e;
        }

        .section-title {
          font-family: 'Syne', sans-serif;
          font-size: 16px;
          font-weight: 700;
          color: #1a1a2e;
          margin: 0 0 16px 0;
          padding-bottom: 12px;
          border-bottom: 2px solid #f0ede7;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .bio-block {
          background: #fafafa;
          border: 1px solid #eeece8;
          border-radius: 14px;
          padding: 18px;
          font-size: 14px;
          color: #555;
          line-height: 1.7;
          min-height: 80px;
          margin-bottom: 24px;
          white-space: pre-wrap;
        }

        .impression-pills {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 24px;
        }

        .impression-pill {
          background: linear-gradient(135deg, #1a1a2e, #0f3460);
          color: #90CDF4;
          padding: 6px 16px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 500;
          border: 1px solid rgba(99,179,237,0.2);
        }

        .gallery-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 16px;
        }

        .gallery-item {
          border-radius: 16px;
          overflow: hidden;
          aspect-ratio: 1;
          position: relative;
          background: #f0ede7;
        }

        .gallery-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.3s ease;
        }

        .gallery-item:hover img { transform: scale(1.05); }

        .doc-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #fff8ec;
          border: 1px solid #f6d860;
          color: #b7791f;
          padding: 6px 14px;
          border-radius: 100px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .doc-images {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
        }

        .doc-img-wrap {
          border-radius: 16px;
          overflow: hidden;
          border: 2px solid #e8e3d8;
          position: relative;
        }

        .doc-img-wrap img {
          display: block;
          width: 200px;
          height: 200px;
          object-fit: cover;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          color: #bbb;
          font-size: 15px;
        }

        .empty-state span { font-size: 48px; display: block; margin-bottom: 12px; }

        @media (max-width: 768px) {
          .host-hero { flex-direction: column; padding: 24px; }
          .avatar-ring { width: 120px; height: 120px; }
          .avatar-ring img { width: 120px; height: 120px; }
          .hero-name { font-size: 24px; }
          .hero-stats { gap: 16px; }
          .fields-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="host-page">
        {/* HERO SECTION */}
        <div className="host-hero">
          <div className="avatar-ring">
            {loader ? (
              <SkeletonTheme baseColor="#2d2d4e" highlightColor="#3d3d6e">
                <Skeleton height={200} width={200} style={{ borderRadius: 20 }} />
              </SkeletonTheme>
            ) : (
              <>
                <img src={profileImage} alt={hostData?.name} />
                <div className="status-dot" />
              </>
            )}
          </div>

          <div className="hero-info">
            {loader ? (
              <SkeletonTheme baseColor="#2d2d4e" highlightColor="#3d3d6e">
                <Skeleton height={36} width={220} style={{ marginBottom: 8 }} />
                <Skeleton height={16} width={140} style={{ marginBottom: 20 }} />
              </SkeletonTheme>
            ) : (
              <>
                <h1 className="hero-name">{hostData?.name || "Host Name"}</h1>
                <p className="hero-uid">UID: {hostData?.uniqueId || "—"}</p>

                <div className="hero-tags">
                  {hostData?.gender && (
                    <span className="hero-tag tag-gender">
                      {hostData.gender === "male" ? "♂" : "♀"} {hostData.gender}
                    </span>
                  )}
                  {hostData?.country && (
                    <span className="hero-tag tag-country">🌍 {hostData.country}</span>
                  )}
                  {hostData?.age && (
                    <span className="hero-tag tag-age">🎂 {hostData.age} yrs</span>
                  )}
                  {hostData?.language?.length > 0 && (
                    <span className="hero-tag" style={{ background: "rgba(159,122,234,0.15)", color: "#D6BCFA", border: "1px solid rgba(159,122,234,0.2)" }}>
                      💬 {hostData.language.join(", ")}
                    </span>
                  )}
                </div>

                <div className="hero-stats">
                  <div className="stat-item">
                    <div className="stat-val">{hostData?.photoGallery?.length || 0}</div>
                    <div className="stat-lbl">Photos</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-val">{hostData?.impression?.length || 0}</div>
                    <div className="stat-lbl">Impressions</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-val">{hostData?.dob ? new Date().getFullYear() - new Date(hostData.dob).getFullYear() : "—"}</div>
                    <div className="stat-lbl">Age</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* TAB NAV */}
        <div className="tab-nav">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* PROFILE INFO TAB */}
        {activeTab === "info" && (
          <div className="content-card">
            <p className="section-title">📋 Basic Information</p>
            <div className="fields-grid">
              <div className="field-wrapper">
                <span className="field-label">Full Name</span>
                <div className="field-value">{hostData?.name || "—"}</div>
              </div>
              <div className="field-wrapper">
                <span className="field-label">Unique ID</span>
                <div className="field-value">{hostData?.uniqueId || "—"}</div>
              </div>
              <div className="field-wrapper">
                <span className="field-label">Email</span>
                <div className="field-value">{hostData?.email || "—"}</div>
              </div>
              <div className="field-wrapper">
                <span className="field-label">Gender</span>
                <div className="field-value">{hostData?.gender || "—"}</div>
              </div>
              <div className="field-wrapper">
                <span className="field-label">Age</span>
                <div className="field-value">{hostData?.age || "—"}</div>
              </div>
              <div className="field-wrapper">
                <span className="field-label">Date of Birth</span>
                <div className="field-value">{hostData?.dob || "—"}</div>
              </div>
              <div className="field-wrapper">
                <span className="field-label">Country</span>
                <div className="field-value">{hostData?.country || "—"}</div>
              </div>
              <div className="field-wrapper">
                <span className="field-label">Languages</span>
                <div className="field-value">{hostData?.language?.join(", ") || "—"}</div>
              </div>
            </div>

            {hostData?.impression?.length > 0 && (
              <>
                <p className="section-title">✨ Impressions</p>
                <div className="impression-pills">
                  {(Array.isArray(hostData.impression)
                    ? hostData.impression
                    : hostData.impression.split(",")
                  ).map((imp: string, i: number) => (
                    <span className="impression-pill" key={i}>{imp.trim()}</span>
                  ))}
                </div>
              </>
            )}

            {hostData?.bio && (
              <>
                <p className="section-title">📝 Bio</p>
                <div className="bio-block">{hostData.bio}</div>
              </>
            )}
          </div>
        )}

        {/* GALLERY TAB */}
        {activeTab === "gallery" && (
          <div className="content-card">
            <p className="section-title">🖼️ Photo Album</p>
            {hostData?.photoGallery?.length > 0 ? (
              <div className="gallery-grid">
                {hostData.photoGallery.map((url: string, index: number) => (
                  <div className="gallery-item" key={index}>
                    <img
                      src={hostData?.image ? baseURL + url : male.src}
                      alt={`Gallery ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span>📷</span>
                No photos in album yet
              </div>
            )}
          </div>
        )}

        {/* DOCUMENTS TAB */}
        {activeTab === "docs" && (
          <div className="content-card">
            <p className="section-title">📄 Identity Documents</p>
            {hostData?.identityProof?.some((url: string) => url.trim() !== "") ? (
              <>
                {hostData?.identityProofType && (
                  <div className="doc-type-badge">
                    🪪 {hostData.identityProofType}
                  </div>
                )}
                <div className="doc-images">
                  {hostData.identityProof
                    .filter((url: string) => url.trim() !== "")
                    .map((url: string, index: number) => (
                      <div className="doc-img-wrap" key={index}>
                        <img src={baseURL + url} alt={`Document ${index + 1}`} />
                      </div>
                    ))}
                </div>
              </>
            ) : (
              <div className="empty-state">
                <span>📂</span>
                No documents uploaded
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

const styles = {
  fieldWrapper: {},
  fieldLabel: {},
  fieldValue: {},
};

HostProfile.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default HostProfile;