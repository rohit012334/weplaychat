import RootLayout from "@/component/layout/Layout";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import { useEffect, useState } from "react";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import { getPaymentMethod } from "@/store/settingSlice";
import CoinPlanShimmer from "@/component/shimmer/CoinPlanShimmer";

const paymentStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .pm-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  /* ── Page Header: left accent bar style (different from Host dot style) ── */
  .pm-header {
    margin-bottom: 24px;
  }

  .pm-header-title-wrap {
    display: inline-flex;
    align-items: stretch;
    gap: 0;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(99,102,241,0.10);
  }

  .pm-header-accent {
    width: 6px;
    background: linear-gradient(180deg, #6366f1 0%, #a855f7 100%);
    border-radius: 12px 0 0 12px;
    flex-shrink: 0;
  }

  .pm-header-text {
    background: #fff;
    border: 1.5px solid #e8eaf2;
    border-left: none;
    border-radius: 0 12px 12px 0;
    padding: 12px 20px;
  }

  .pm-header-text h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 22px;
    font-weight: 900;
    color: #1e2235;
    margin: 0 0 2px;
  }

  .pm-header-text p {
    font-size: 12.5px;
    color: #a0a8c0;
    margin: 0;
  }

  /* ── Content card ── */
  .pm-card {
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: pmFadeIn .25s ease;
  }

  @keyframes pmFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Top bar: reversed layout vs Host (count right, search left) ── */
  .pm-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(168,85,247,0.02) 100%);
    flex-wrap: wrap;
    gap: 10px;
  }

  /* ── Search ── */
  .pm-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f4f5fb;
    border: 1.5px solid #e8eaf2;
    border-radius: 10px;
    padding: 0 14px;
    height: 38px;
    width: 240px;
    transition: border-color .15s, box-shadow .15s;
  }
  .pm-search:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .pm-search input {
    border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #1e2235;
    outline: none; width: 100%;
  }
  .pm-search input::placeholder { color: #a0a8c0; }
  .pm-search svg { color: #a0a8c0; flex-shrink: 0; }

  /* ── Count: tag style (different from Host pill) ── */
  .pm-count-tag {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 5px 14px 5px 8px;
    border-radius: 8px;
    background: #fff;
    border: 1.5px solid rgba(99,102,241,0.20);
    font-size: 12px;
    font-weight: 700;
    color: #6366f1;
  }

  .pm-count-icon {
    width: 22px; height: 22px;
    border-radius: 6px;
    background: rgba(99,102,241,0.10);
    display: flex; align-items: center; justify-content: center;
  }

  /* ── No: rounded square (Host used border-radius:7px) ── */
  .pm-no {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 26px; height: 26px;
    border-radius: 50%;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.18);
    font-size: 11.5px;
    font-weight: 800;
    color: #6366f1;
    padding: 0 4px;
  }

  /* ── Avatar: circle (Host used rounded square) ── */
  .pm-avatar {
    width: 40px; height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2.5px solid #e8eaf2;
    flex-shrink: 0;
    transition: border-color .15s, box-shadow .15s;
    display: block;
  }
  .pm-avatar:hover {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
  }

  /* ── Name ── */
  .pm-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e2235;
    white-space: nowrap;
    text-transform: capitalize;
  }

  /* ── Details: horizontal wrap chips (Host used vertical list) ── */
  .pm-details {
    list-style: none;
    padding: 0; margin: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 5px;
    max-width: 240px;
  }
  .pm-details li {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    font-size: 11.5px;
    font-weight: 600;
    color: #6366f1;
    background: rgba(99,102,241,0.07);
    border: 1px solid rgba(99,102,241,0.16);
    border-radius: 20px;
    padding: 3px 9px;
    white-space: nowrap;
    text-transform: capitalize;
  }

  /* ── Active: filled pill (Host used outline badge) ── */
  .pm-active-yes {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 8px;
    font-size: 12px; font-weight: 700;
    background: rgba(16,185,129,0.10);
    border: 1.5px solid rgba(16,185,129,0.22);
    color: #10b981;
  }
  .pm-active-no {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 11px; border-radius: 8px;
    font-size: 12px; font-weight: 700;
    background: #f4f5fb;
    border: 1.5px solid #e8eaf2;
    color: #a0a8c0;
  }
  .pm-dot-on  { width:6px; height:6px; border-radius:50%; background:#10b981; flex-shrink:0; animation: pmPulse2 2s ease-in-out infinite; }
  .pm-dot-off { width:6px; height:6px; border-radius:50%; background:#cbd5e1; flex-shrink:0; }

  @keyframes pmPulse2 {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(1.4); }
  }

  /* ── Date: box style (Host used flat inline) ── */
  .pm-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    border-radius: 7px;
    padding: 4px 9px;
    white-space: nowrap;
  }
  .pm-date svg { color: #6366f1; }
`;

const PaymentMethod = () => {
  const dispatch = useDispatch();
  const [search, setSearch] = useState("");

  const { paymentMethod } = useSelector((state: RootStore) => state?.setting);

  useEffect(() => {
    dispatch(getPaymentMethod());
  }, [dispatch]);

  const filtered = Array.isArray(paymentMethod)
    ? paymentMethod.filter((row: any) =>
        row?.name?.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  const coinPlanTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="pm-no">{parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.image ? row.image.replace(/\\/g, "/") : "";
        return (
          <img
            src={row?.image ? baseURL + updatedImagePath : male.src}
            alt="Method"
            className="pm-avatar"
            loading="eager"
            draggable={false}
          />
        );
      },
    },
    {
      Header: "Name",
      Cell: ({ row }: { row: any }) => (
        <span className="pm-name">{row?.name || "—"}</span>
      ),
    },
    {
      Header: "Details",
      body: "details",
      Cell: ({ row }: { row: any }) => (
        <ul className="pm-details">
          {Array.isArray(row?.details) && row.details.length > 0
            ? row.details.map((detail: any, i: number) => (
                <li key={i}>{String(detail)}</li>
              ))
            : <span style={{ fontSize: "13px", color: "#a0a8c0" }}>—</span>
          }
        </ul>
      ),
    },
    {
      Header: "Active",
      Cell: ({ row }: { row: any }) =>
        row?.isActive ? (
          <span className="pm-active-yes">
            <span className="pm-dot-on" />Active
          </span>
        ) : (
          <span className="pm-active-no">
            <span className="pm-dot-off" />Inactive
          </span>
        ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        const formatted = isNaN(date.getTime())
          ? "—"
          : date.toLocaleDateString("en-GB", {
              day: "2-digit",
              month: "short",
              year: "numeric",
            });
        return (
          <span className="pm-date">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8"  y1="2" x2="8"  y2="6" />
              <line x1="3"  y1="10" x2="21" y2="10" />
            </svg>
            {formatted}
          </span>
        );
      },
    },
  ];

  return (
    <>
      <style>{paymentStyle}</style>

      <div className="pm-root">

        {/* ── Page Header: Left accent bar style ── */}
        <div className="pm-header">
          <div className="pm-header-title-wrap">
            <div className="pm-header-accent" />
            <div className="pm-header-text">
              <h2>Payment Methods</h2>
              <p>Manage all active payment methods for the platform</p>
            </div>
          </div>
        </div>

        {/* ── Content Card ── */}
        <div className="pm-card">

          {/* Top bar: search LEFT, count RIGHT */}
          <div className="pm-topbar">

            {/* Search on left */}
            <div className="pm-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search methods…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* Count tag on right */}
            <span className="pm-count-tag">
              <span className="pm-count-icon">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                  stroke="#6366f1" strokeWidth="2.5" strokeLinecap="round">
                  <rect x="2" y="5" width="20" height="14" rx="2" />
                  <line x1="2" y1="10" x2="22" y2="10" />
                </svg>
              </span>
              {filtered.length} Methods
            </span>
          </div>

          {/* Table */}
          <Table
            data={filtered}
            mapData={coinPlanTable}
            type="server"
            shimmer={<CoinPlanShimmer />}
          />

        </div>
      </div>
    </>
  );
};

PaymentMethod.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default PaymentMethod;