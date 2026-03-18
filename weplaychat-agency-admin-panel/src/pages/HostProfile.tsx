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
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const loader = useSelector(isLoading);
  const router = useRouter();
  const id: any = router?.query?.id;
  const [type, setType] = useState<string>("wallet_history");
  const [data, setData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("ALL");
  const [endDate, setEndDate] = useState("ALL");
  const { setting } = useSelector((state: RootStore) => state.setting);
  const [status, setStatus] = useState<any>("ALL");
  const [isClient, setIsClient] = useState(false);
  const updatedImagePath = hostData?.image?.replace(/\\/g, "/");
  const dispatch = useAppDispatch();

  useEffect(() => {
    const payload: any = { startDate, endDate, status, id };
  }, [dispatch, id, startDate, endDate, status]);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(0);
  };

  const handleChangePage = (event: any, newPage: any) => {
    setPage(newPage);
  };

  const fields = [
    { id: "name", label: "Name", value: hostData?.name },
    { id: "uniqueId", label: "Unique ID", value: hostData?.uniqueId || "-" },
    { id: "gender", label: "Gender", value: hostData?.gender },
    { id: "age", label: "Age", value: hostData?.age > 0 && hostData?.age !== "" ? hostData?.age : "-" },
    { id: "email", label: "Email", value: hostData?.email || "-" },
    { id: "country", label: "Country", value: hostData?.country },
    { id: "dob", label: "Date of Birth", value: hostData?.dob },
    { id: "language", label: "Language", value: hostData?.language?.join(", ") || "-" },
  ];

  return (
    <>
      <style>{`
        .hp-wrapper {
          background: #f4f6fb;
          min-height: 100vh;
          padding: 28px 24px;
          font-family: 'Segoe UI', sans-serif;
        }

        .hp-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
        }

        .hp-back-btn {
          background: #fff;
          border: 1.5px solid #e0e0e0;
          border-radius: 10px;
          padding: 7px 14px;
          font-size: 13px;
          color: #555;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .hp-back-btn:hover {
          background: #f0f0f0;
          border-color: #bbb;
        }

        .hp-title {
          font-size: 22px;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.3px;
        }

        .hp-card {
          background: #fff;
          border-radius: 20px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          overflow: hidden;
          margin-bottom: 20px;
        }

        .hp-card-header {
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 60%, #0f3460 100%);
          padding: 28px 32px;
          display: flex;
          align-items: center;
          gap: 28px;
          position: relative;
          overflow: hidden;
        }

        .hp-card-header::before {
          content: '';
          position: absolute;
          top: -40px;
          right: -40px;
          width: 180px;
          height: 180px;
          background: rgba(255,255,255,0.04);
          border-radius: 50%;
        }

        .hp-card-header::after {
          content: '';
          position: absolute;
          bottom: -60px;
          right: 80px;
          width: 120px;
          height: 120px;
          background: rgba(255,255,255,0.03);
          border-radius: 50%;
        }

        .hp-avatar-wrap {
          position: relative;
          flex-shrink: 0;
        }

        .hp-avatar {
          width: 110px;
          height: 110px;
          border-radius: 18px;
          object-fit: cover;
          border: 3px solid rgba(255,255,255,0.2);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }

        .hp-status-dot {
          position: absolute;
          bottom: 6px;
          right: 6px;
          width: 14px;
          height: 14px;
          background: #22c55e;
          border-radius: 50%;
          border: 2.5px solid #1a1a2e;
        }

        .hp-header-info {
          flex: 1;
          z-index: 1;
        }

        .hp-host-name {
          font-size: 26px;
          font-weight: 700;
          color: #fff;
          margin: 0 0 6px 0;
          letter-spacing: -0.5px;
        }

        .hp-host-id {
          font-size: 13px;
          color: rgba(255,255,255,0.55);
          margin: 0 0 14px 0;
          font-family: monospace;
          letter-spacing: 0.5px;
        }

        .hp-badge-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .hp-badge {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.18);
          color: rgba(255,255,255,0.85);
          border-radius: 20px;
          padding: 4px 12px;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(4px);
        }

        .hp-badge.green {
          background: rgba(34,197,94,0.2);
          border-color: rgba(34,197,94,0.4);
          color: #86efac;
        }

        .hp-card-body {
          padding: 28px 32px;
        }

        .hp-section-title {
          font-size: 13px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 18px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hp-section-title::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #f0f0f0;
        }

        .hp-fields-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 16px;
          margin-bottom: 24px;
        }

        .hp-field {
          background: #f8f9fc;
          border-radius: 12px;
          padding: 14px 16px;
          border: 1px solid #eef0f5;
          transition: box-shadow 0.2s;
        }

        .hp-field:hover {
          box-shadow: 0 2px 10px rgba(0,0,0,0.06);
        }

        .hp-field-label {
          font-size: 11px;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 6px;
        }

        .hp-field-value {
          font-size: 14px;
          font-weight: 600;
          color: #1a1a2e;
          word-break: break-word;
        }

        .hp-textarea-wrap {
          background: #f8f9fc;
          border-radius: 12px;
          padding: 16px;
          border: 1px solid #eef0f5;
          margin-bottom: 16px;
        }

        .hp-textarea-label {
          font-size: 11px;
          font-weight: 600;
          color: #999;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          margin-bottom: 10px;
        }

        .hp-textarea-content {
          font-size: 14px;
          color: #444;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .hp-text-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          margin-bottom: 24px;
        }

        @media (max-width: 768px) {
          .hp-text-grid { grid-template-columns: 1fr; }
          .hp-card-header { flex-direction: column; align-items: flex-start; }
        }

        .hp-doc-section {
          margin-bottom: 24px;
        }

        .hp-doc-type {
          background: #f8f9fc;
          border-radius: 12px;
          padding: 14px 16px;
          border: 1px solid #eef0f5;
          display: inline-flex;
          flex-direction: column;
          margin-bottom: 16px;
        }

        .hp-images-wrap {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
        }

        .hp-doc-img {
          width: 180px;
          height: 180px;
          object-fit: cover;
          border-radius: 14px;
          border: 2px solid #eef0f5;
          cursor: pointer;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .hp-doc-img:hover {
          transform: scale(1.03);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .hp-gallery-img {
          width: 140px;
          height: 151px;
          object-fit: cover;
          border-radius: 14px;
          border: 2px solid #eef0f5;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .hp-gallery-img:hover {
          transform: scale(1.04);
          box-shadow: 0 8px 24px rgba(0,0,0,0.12);
        }

        .hp-empty {
          color: #bbb;
          font-size: 13px;
          font-style: italic;
        }
      `}</style>

      <div className="hp-wrapper">
        {/* Header */}
        <div className="hp-header">
          <button className="hp-back-btn" onClick={() => router.back()}>
            ← Back
          </button>
          <div className="hp-title">{hostData?.name}'s Profile</div>
        </div>

        {/* Profile Card */}
        <div className="hp-card">
          {/* Top Banner */}
          <div className="hp-card-header">
            <div className="hp-avatar-wrap">
              {loader ? (
                <Skeleton width={110} height={110} borderRadius={18} />
              ) : (
                <img
                  src={hostData?.image ? baseURL + updatedImagePath : male.src}
                  className="hp-avatar"
                  alt={hostData?.name}
                />
              )}
              <div className="hp-status-dot" />
            </div>
            <div className="hp-header-info">
              <div className="hp-host-name">{hostData?.name || "—"}</div>
              <div className="hp-host-id">ID: {hostData?.uniqueId || "—"}</div>
              <div className="hp-badge-row">
                {hostData?.gender && <span className="hp-badge">{hostData.gender}</span>}
                {hostData?.country && <span className="hp-badge">{hostData.country}</span>}
                {hostData?.age > 0 && <span className="hp-badge">{hostData.age} yrs</span>}
                <span className="hp-badge green">Active</span>
              </div>
            </div>
          </div>

          {/* Body */}
          <div className="hp-card-body">
            {/* Basic Info */}
            <div className="hp-section-title">Basic Information</div>
            <div className="hp-fields-grid">
              {loader
                ? Array(8).fill(0).map((_, i) => (
                    <Skeleton key={i} height={68} borderRadius={12} />
                  ))
                : fields.map((f) => (
                    <div className="hp-field" key={f.id}>
                      <div className="hp-field-label">{f.label}</div>
                      <div className="hp-field-value">{f.value || "—"}</div>
                    </div>
                  ))}
            </div>

            {/* Bio & Impression */}
            <div className="hp-section-title">About</div>
            <div className="hp-text-grid">
              <div className="hp-textarea-wrap">
                <div className="hp-textarea-label">Bio</div>
                {loader ? (
                  <Skeleton height={80} borderRadius={8} />
                ) : (
                  <div className="hp-textarea-content">
                    {hostData?.bio || <span className="hp-empty">No bio provided</span>}
                  </div>
                )}
              </div>
              <div className="hp-textarea-wrap">
                <div className="hp-textarea-label">Impression</div>
                {loader ? (
                  <Skeleton height={80} borderRadius={8} />
                ) : (
                  <div className="hp-textarea-content">
                    {Array.isArray(hostData?.impression) && hostData.impression.length > 0
                      ? hostData.impression.join(", ")
                      : <span className="hp-empty">No impression data</span>}
                  </div>
                )}
              </div>
            </div>

            {/* Identity Proof */}
            {hostData?.identityProof?.some((url: string) => url.trim() !== "") && (
              <>
                <div className="hp-section-title">Identity Proof</div>
                <div className="hp-doc-section">
                  {hostData?.identityProofType && (
                    <div className="hp-doc-type">
                      <div className="hp-field-label">Document Type</div>
                      <div className="hp-field-value">{hostData.identityProofType}</div>
                    </div>
                  )}
                  <div className="hp-images-wrap">
                    {hostData.identityProof
                      .filter((url: string) => url.trim() !== "")
                      .map((url: string, index: number) => (
                        <img
                          key={index}
                          src={baseURL + url}
                          className="hp-doc-img"
                          alt={`Identity proof ${index + 1}`}
                        />
                      ))}
                  </div>
                </div>
              </>
            )}

            {/* Photo Gallery */}
            {hostData?.photoGallery?.length > 0 && (
              <>
                <div className="hp-section-title">Photo Gallery</div>
                <div className="hp-images-wrap">
                  {hostData.photoGallery.map((item: any, index: number) => {
                    const finalUrl = typeof item === "string" ? item : item?.url;
                    return (
                      <img
                        key={index}
                        src={finalUrl ? baseURL + finalUrl : male.src}
                        className="hp-gallery-img"
                        alt={`Gallery ${index + 1}`}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

HostProfile.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default HostProfile;