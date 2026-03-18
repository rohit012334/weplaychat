import { RootStore } from "@/store/store";
import { baseURL } from "@/utils/config";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import male from "@/assets/images/male.png";
import RootLayout from "@/component/layout/Layout";
import { getLiveHost } from "@/store/hostSlice";
import Table from "@/extra/Table";
import { getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png";
import LiveDataHostShimmer from "@/component/shimmer/LiveDataHostShimmer";

const liveHostStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .lh-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  .lh-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .lh-header-left h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 24px;
    font-weight: 900;
    color: #1e2235;
    margin: 0 0 4px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .lh-header-left p {
    font-size: 13px;
    color: #a0a8c0;
    margin: 0;
  }

  .lh-live-badge {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 12px;
    border-radius: 20px;
    background: rgba(244,63,94,0.09);
    border: 1px solid rgba(244,63,94,0.22);
    font-family: 'Outfit', sans-serif;
    font-size: 11px;
    font-weight: 800;
    color: #f43f5e;
    letter-spacing: 1px;
    text-transform: uppercase;
  }

  .lh-live-dot {
    width: 7px; height: 7px;
    border-radius: 50%;
    background: #f43f5e;
    animation: lhPulse 1.4s ease-in-out infinite;
    flex-shrink: 0;
  }

  @keyframes lhPulse {
    0%,100% { opacity:1; transform:scale(1);   box-shadow:0 0 0 0 rgba(244,63,94,0.5); }
    50%      { opacity:0.8; transform:scale(1.3); box-shadow:0 0 0 5px rgba(244,63,94,0); }
  }

  .lh-card {
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: lhFadeIn .25s ease;
  }

  @keyframes lhFadeIn {
    from { opacity:0; transform:translateY(8px); }
    to   { opacity:1; transform:translateY(0); }
  }

  .lh-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(244,63,94,0.03) 0%, rgba(99,102,241,0.02) 100%);
    flex-wrap: wrap;
    gap: 10px;
  }

  .lh-count-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(244,63,94,0.08);
    border: 1px solid rgba(244,63,94,0.20);
    font-size: 12px;
    font-weight: 700;
    color: #f43f5e;
  }

  .lh-count-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #f43f5e;
    animation: lhPulse 1.4s ease-in-out infinite;
  }

  .lh-search {
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
  .lh-search:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .lh-search input {
    border:none; background:transparent;
    font-family:'Outfit',sans-serif;
    font-size:13px; color:#1e2235;
    outline:none; width:100%;
  }
  .lh-search input::placeholder { color:#a0a8c0; }
  .lh-search svg { color:#a0a8c0; flex-shrink:0; }

  .lh-no {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 28px; height: 28px;
    border-radius: 7px;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    font-size: 12px;
    font-weight: 700;
    color: #a0a8c0;
  }

  .lh-host-cell {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .lh-avatar-wrap { position: relative; flex-shrink: 0; }

  .lh-avatar {
    width: 42px; height: 42px;
    border-radius: 11px;
    object-fit: cover;
    border: 2px solid rgba(244,63,94,0.25);
    display: block;
  }

  .lh-avatar-dot {
    position: absolute;
    bottom: -2px; right: -2px;
    width: 11px; height: 11px;
    border-radius: 50%;
    background: #f43f5e;
    border: 2px solid #fff;
    animation: lhPulse 1.4s ease-in-out infinite;
  }

  .lh-host-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e2235;
    white-space: nowrap;
  }

  .lh-country-cell {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .lh-flag {
    width: 32px; height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid #e8eaf2;
    flex-shrink: 0;
  }
  .lh-country-name {
    font-size: 13px;
    font-weight: 500;
    color: #1e2235;
    white-space: nowrap;
  }

  .lh-view-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 8px;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.15);
    font-size: 12.5px;
    font-weight: 700;
    color: #6366f1;
    white-space: nowrap;
  }

  .lh-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #64748b;
    white-space: nowrap;
  }
  .lh-date svg { color: #a0a8c0; }
`;

const LiveHost = (props: any) => {
  const { startDate, endDate } = props;
  const dispatch = useDispatch();

  const { liveHost }        = useSelector((state: RootStore) => state.host);
  const [rowsPerPage]       = useState<number>(10);
  const [page]              = useState<number>(1);
  const [search, setSearch] = useState("");

  useEffect(() => {
    dispatch(getLiveHost({ start: page, limit: rowsPerPage }));
  }, []);

  const liveDataHost = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="lh-no">{index + 1}</span>
      ),
    },
    {
      Header: "Host",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.image ? row.image.replace(/\\/g, "/") : "";
        return (
          <div className="lh-host-cell">
            <div className="lh-avatar-wrap">
              <img
                src={row?.image ? baseURL + updatedImagePath : male.src}
                alt="Host"
                className="lh-avatar"
                loading="eager"
                draggable={false}
              />
              <span className="lh-avatar-dot" />
            </div>
            <span className="lh-host-name">{row?.name || "—"}</span>
          </div>
        );
      },
    },
    {
      Header: "Country",
      Cell: ({ row }: { row: any }) => {
        const countryName = row?.country || "—";
        const emoji       = row?.countryFlagImage;
        const countryCode = getCountryCodeFromEmoji(emoji);
        const flagUrl     = countryCode
          ? `https://flagcdn.com/w80/${countryCode}.png`
          : india.src;
        return (
          <div className="lh-country-cell">
            <img src={flagUrl} alt={countryName} className="lh-flag" />
            <span className="lh-country-name">{countryName}</span>
          </div>
        );
      },
    },
    {
      Header: "Views",
      Cell: ({ row }: { row: any }) => (
        <span className="lh-view-badge">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          {row?.view ?? 0}
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
              day: "2-digit", month: "short", year: "numeric",
            });
        return (
          <span className="lh-date">
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
      <style>{liveHostStyle}</style>

      <div className="lh-root">

        {/* ── Page Header ── */}
        <div className="lh-header">
          <div className="lh-header-left">
            <h2>
              Live Host
              <span className="lh-live-badge">
                <span className="lh-live-dot" />
                Live Now
              </span>
            </h2>
            <p>Hosts currently streaming live on the platform</p>
          </div>
        </div>

        {/* ── Content Card ── */}
        <div className="lh-card">

          {/* Top bar */}
          <div className="lh-topbar">
            <span className="lh-count-pill">
              <span className="lh-count-dot" />
              {Array.isArray(liveHost) ? liveHost.length : 0} Live Now
            </span>

            <div className="lh-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search live hosts…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <Table
            data={liveHost}
            mapData={liveDataHost}
            type="client"
            shimmer={<LiveDataHostShimmer />}
          />

        </div>
      </div>
    </>
  );
};

LiveHost.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default LiveHost;