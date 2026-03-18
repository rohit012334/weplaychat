import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import info from "@/assets/images/info.svg";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import ToggleSwitch from "@/extra/TogggleSwitch";
import RootLayout from "@/component/layout/Layout";
import historyInfo from "@/assets/images/history1.png";
import notification from "@/assets/images/notification1.svg";
import { blockonlinebusyHost, getAgencyWiseHost } from "@/store/agencySlice";
import UserShimmer from "@/component/shimmer/UserShimmer";

interface SuggestedServiceData {
  _id: string;
  doctor: string;
  name: string;
  gender: string;
  email: string;
  age: number;
  dob: any;
  description: string;
  country: string;
  impression: string;
}

const hostStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .host-root {
    font-family: 'Outfit', sans-serif;
    background: #f4f5fb;
    min-height: 100vh;
    padding: 24px 24px 40px;
  }

  /* ── Page Header ── */
  .host-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 24px;
    flex-wrap: wrap;
    gap: 12px;
  }

  .host-header-left h2 {
    font-family: 'Nunito', sans-serif;
    font-size: 24px;
    font-weight: 900;
    color: #1e2235;
    margin: 0 0 4px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .host-title-dot {
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    animation: hostPulse 2s ease-in-out infinite;
  }

  @keyframes hostPulse {
    0%,100% { transform: scale(1); opacity: 1; }
    50%      { transform: scale(1.5); opacity: 0.6; }
  }

  .host-header-left p {
    font-size: 13px;
    color: #a0a8c0;
    margin: 0;
  }

  /* ── Content card ── */
  .host-card {
    background: #ffffff;
    border: 1.5px solid #e8eaf2;
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 2px 16px rgba(99,102,241,0.06);
    animation: hostFadeIn .25s ease;
  }

  @keyframes hostFadeIn {
    from { opacity: 0; transform: translateY(8px); }
    to   { opacity: 1; transform: translateY(0); }
  }

  /* ── Top bar ── */
  .host-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e8eaf2;
    background: linear-gradient(135deg, rgba(99,102,241,0.03) 0%, rgba(168,85,247,0.02) 100%);
    flex-wrap: wrap;
    gap: 10px;
  }

  .host-topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .host-count-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.18);
    font-size: 12px;
    font-weight: 700;
    color: #6366f1;
  }

  .host-count-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #6366f1;
    animation: hostPulse 2s ease-in-out infinite;
  }

  /* ── Search ── */
  .host-search {
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
  .host-search:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .host-search input {
    border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #1e2235;
    outline: none; width: 100%;
  }
  .host-search input::placeholder { color: #a0a8c0; }
  .host-search svg { color: #a0a8c0; flex-shrink: 0; }

  /* ── No badge ── */
  .host-no {
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

  /* ── Unique ID ── */
  .host-uid {
    font-family: 'Outfit', sans-serif;
    font-size: 12px;
    font-weight: 600;
    color: #64748b;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    border-radius: 6px;
    padding: 3px 8px;
    white-space: nowrap;
    letter-spacing: .4px;
  }

  /* ── Host cell ── */
  .host-cell {
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .host-avatar {
    width: 42px; height: 42px;
    border-radius: 11px;
    object-fit: cover;
    border: 2px solid #e8eaf2;
    flex-shrink: 0;
    transition: border-color .15s;
  }
  .host-avatar:hover { border-color: #6366f1; }
  .host-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e2235;
    white-space: nowrap;
  }

  /* ── Gender badge ── */
  .host-gender {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    text-transform: capitalize;
    white-space: nowrap;
  }
  .host-gender-male   { background: rgba(99,102,241,0.08);  color: #6366f1; border: 1px solid rgba(99,102,241,0.18); }
  .host-gender-female { background: rgba(236,72,153,0.08);  color: #ec4899; border: 1px solid rgba(236,72,153,0.18); }
  .host-gender-other  { background: rgba(245,158,11,0.08);  color: #f59e0b; border: 1px solid rgba(245,158,11,0.18); }

  /* ── Doc badge ── */
  .host-doc-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 7px;
    background: rgba(99,102,241,0.07);
    border: 1px solid rgba(99,102,241,0.14);
    font-size: 12px;
    font-weight: 600;
    color: #6366f1;
    white-space: nowrap;
    text-transform: capitalize;
  }

  /* ── Impression ── */
  .host-impression {
    font-size: 13px;
    color: #64748b;
    max-width: 200px;
    line-height: 1.5;
  }
  .host-read-toggle {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin-left: 5px;
    font-size: 11.5px;
    font-weight: 600;
    color: #6366f1;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    transition: color .14s;
  }
  .host-read-toggle:hover { color: #a855f7; }

  /* ── Coin badge ── */
  .host-coin {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 8px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.20);
    font-size: 12.5px;
    font-weight: 700;
    color: #f59e0b;
    white-space: nowrap;
  }

  /* ── Status badges (Online / Busy / Live) ── */
  .host-status-yes {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700;
    background: rgba(16,185,129,0.09);
    border: 1px solid rgba(16,185,129,0.20);
    color: #10b981;
  }
  .host-status-no {
    display: inline-flex; align-items: center; gap: 4px;
    padding: 3px 9px; border-radius: 20px;
    font-size: 11.5px; font-weight: 700;
    background: #f4f5fb;
    border: 1px solid #e8eaf2;
    color: #a0a8c0;
  }
  .host-status-dot-on  { width:5px; height:5px; border-radius:50%; background:#10b981; flex-shrink:0; }
  .host-status-dot-off { width:5px; height:5px; border-radius:50%; background:#a0a8c0; flex-shrink:0; }

  /* ── Date ── */
  .host-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #64748b;
    white-space: nowrap;
  }
  .host-date svg { color: #a0a8c0; }

  /* ── Action buttons ── */
  .host-btn {
    width: 36px; height: 36px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    border: 1.5px solid;
    transition: background .15s, border-color .15s, transform .12s, box-shadow .15s;
    flex-shrink: 0;
  }
  .host-btn:hover {
    transform: translateY(-1px);
  }
  .host-btn img { width: 18px; height: 18px; object-fit: contain; }

  .host-btn-info {
    background: rgba(99,102,241,0.08);
    border-color: rgba(99,102,241,0.18);
  }
  .host-btn-info:hover {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.35);
    box-shadow: 0 3px 10px rgba(99,102,241,0.15);
  }

  .host-btn-notify {
    background: rgba(245,158,11,0.08);
    border-color: rgba(245,158,11,0.20);
  }
  .host-btn-notify:hover {
    background: rgba(245,158,11,0.16);
    border-color: rgba(245,158,11,0.38);
    box-shadow: 0 3px 10px rgba(245,158,11,0.15);
  }

  .host-btn-history {
    background: rgba(244,63,94,0.07);
    border-color: rgba(244,63,94,0.18);
  }
  .host-btn-history:hover {
    background: rgba(244,63,94,0.14);
    border-color: rgba(244,63,94,0.35);
    box-shadow: 0 3px 10px rgba(244,63,94,0.14);
  }

  /* ── Action group ── */
  .host-actions {
    display: flex;
    align-items: center;
    gap: 6px;
  }

  /* ── Pagination ── */
  .host-pagination {
    border-top: 1px solid #e8eaf2;
    padding: 12px 20px;
    background: linear-gradient(0deg, rgba(99,102,241,0.02) 0%, transparent 100%);
  }
`;

const Host = () => {
  const dispatch = useDispatch();
  const router   = useRouter();

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage]               = useState<number>(1);
  const [search, setSearch]           = useState("");
  const [expanded, setExpanded]       = useState<{ [key: number]: boolean }>({});

  const { agencyWiseHost, totalagencyWiseHost } = useSelector(
    (state: RootStore) => state.agency
  );

  const toggleReview = (index: number) =>
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  useEffect(() => {
    dispatch(getAgencyWiseHost({ limit: rowsPerPage, start: page }));
  }, [search, rowsPerPage, page]);

  const handleInfo = (row: any) => {
    router.push({ pathname: "/Host/HostInfo", query: { id: row?._id } });
    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  const handleRedirect = (row: any) => {
    router.push({ pathname: "/Host/HostHistoryPage", query: { id: row?._id, type: "host" } });
    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  const handleNotify = (id: any) =>
    dispatch(openDialog({ type: "notification", data: { id, type: "host" } }));

  const getGenderClass = (gender: string) => {
    if (!gender) return "host-gender-other";
    const g = gender.toLowerCase();
    if (g === "male")   return "host-gender-male";
    if (g === "female") return "host-gender-female";
    return "host-gender-other";
  };

  const userTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="host-no">
          {(page - 1) * rowsPerPage + parseInt(index) + 1}
        </span>
      ),
    },
    {
      Header: "Unique Id",
      Cell: ({ row }: { row: any }) => (
        <span className="host-uid">{row?.uniqueId || "—"}</span>
      ),
    },
    {
      Header: "Host",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.image ? row.image.replace(/\\/g, "/") : "";
        return (
          <div className="host-cell" style={{ cursor: "pointer" }}>
            <img
              src={row?.image ? baseURL + updatedImagePath : male.src}
              alt="Host"
              className="host-avatar"
              loading="eager"
            />
            <span className="host-name">{row?.name || "—"}</span>
          </div>
        );
      },
    },
    {
      Header: "Gender",
      Cell: ({ row }: { row: any }) => (
        <span className={`host-gender ${getGenderClass(row?.gender)}`}>
          {row?.gender || "—"}
        </span>
      ),
    },
    {
      Header: "Identity Proof",
      Cell: ({ row }: { row: any }) => (
        <span className="host-doc-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          {row?.identityProofType || "—"}
        </span>
      ),
    },
    {
      Header: "Impression",
      Cell: ({ row, index }: { row: SuggestedServiceData; index: any }) => {
        const isExpanded     = expanded[index] || false;
        const impressionText = String(row?.impression || "");
        const previewText    = impressionText.substring(0, 50);
        return (
          <div className="host-impression">
            {isExpanded ? impressionText : previewText || "—"}
            {impressionText.length > 50 && (
              <button className="host-read-toggle" onClick={() => toggleReview(index)}>
                {isExpanded ? "Read less" : "Read more"}
              </button>
            )}
          </div>
        );
      },
    },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="host-coin">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          {row?.coin?.toFixed(2) ?? "0.00"}
        </span>
      ),
    },
    {
      Header: "Online",
      Cell: ({ row }: { row: any }) => (
        row?.isOnline
          ? <span className="host-status-yes"><span className="host-status-dot-on" />Yes</span>
          : <span className="host-status-no"><span className="host-status-dot-off" />No</span>
      ),
    },
    {
      Header: "Busy",
      Cell: ({ row }: { row: any }) => (
        row?.isBusy
          ? <span className="host-status-yes"><span className="host-status-dot-on" />Yes</span>
          : <span className="host-status-no"><span className="host-status-dot-off" />No</span>
      ),
    },
    {
      Header: "Live",
      Cell: ({ row }: { row: any }) => (
        row?.isLive
          ? <span className="host-status-yes"><span className="host-status-dot-on" />Yes</span>
          : <span className="host-status-no"><span className="host-status-dot-off" />No</span>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        const formatted = isNaN(date.getTime())
          ? "—"
          : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        return (
          <span className="host-date">
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
    {
      Header: "Block",
      body: "isBlock",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={row?.isBlock}
          onClick={() =>
            dispatch(blockonlinebusyHost({ hostId: row?._id, type: "isBlock" }))
          }
        />
      ),
    },
    {
      Header: "Actions",
      Cell: ({ row }: { row: SuggestedServiceData }) => (
        <div className="host-actions">
          {/* Info */}
          <button className="host-btn host-btn-info" onClick={() => handleInfo(row)} title="Info">
            <img src={info.src} alt="Info" />
          </button>
          {/* Notify */}
          <button className="host-btn host-btn-notify" onClick={() => handleNotify(row._id)} title="Notify">
            <img src={notification.src} alt="Notify" />
          </button>
          {/* History */}
          <button className="host-btn host-btn-history" onClick={() => handleRedirect(row)} title="History">
            <img src={historyInfo.src} alt="History" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{hostStyle}</style>

      <div className="host-root">

        {/* ── Page Header ── */}
        <div className="host-header">
          <div className="host-header-left">
            <h2>
              <span className="host-title-dot" />
              Host Management
            </h2>
            <p>View and manage all hosts under your agency</p>
          </div>
        </div>

        {/* ── Content Card ── */}
        <div className="host-card">

          {/* Top bar */}
          <div className="host-topbar">
            <div className="host-topbar-left">
              <span className="host-count-pill">
                <span className="host-count-dot" />
                {totalagencyWiseHost ?? 0} Hosts
              </span>
            </div>

            {/* Search */}
            <div className="host-search">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search hosts…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>

          {/* Table */}
          <Table
            data={agencyWiseHost}
            mapData={userTable}
            PerPage={rowsPerPage}
            Page={page}
            type="server"
            shimmer={<UserShimmer />}
          />

          {/* Pagination */}
          <div className="host-pagination">
            <Pagination
              type="server"
              serverPage={page}
              setServerPage={setPage}
              serverPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              totalData={totalagencyWiseHost}
            />
          </div>

        </div>
      </div>
    </>
  );
};

Host.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Host;