import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { getHostRequest } from "@/store/hostRequestSlice";
import { RootStore } from "@/store/store";
import { baseURL } from "@/utils/config";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import male from "@/assets/images/male.png";
import info from "@/assets/images/info.svg";
import { getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png";
import AcceptedHostRequestShimmer from "../shimmer/AcceptedHostRequestShimmer";

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
}

const acceptedStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .acc-wrap {
    font-family: 'Outfit', sans-serif;
    padding: 4px 0;
  }

  /* ── Top bar ── */
  .acc-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e8eaf2;
    flex-wrap: wrap;
    gap: 10px;
  }

  .acc-topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .acc-count-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(16,185,129,0.09);
    border: 1px solid rgba(16,185,129,0.20);
    font-size: 12px;
    font-weight: 700;
    color: #10b981;
  }

  .acc-count-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #10b981;
    animation: accPulse 1.8s ease-in-out infinite;
  }

  @keyframes accPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(1.5); }
  }

  .acc-search {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #f4f5fb;
    border: 1.5px solid #e8eaf2;
    border-radius: 10px;
    padding: 0 14px;
    height: 38px;
    width: 220px;
    transition: border-color .15s, box-shadow .15s;
  }
  .acc-search:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .acc-search input {
    border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #1e2235;
    outline: none; width: 100%;
  }
  .acc-search input::placeholder { color: #a0a8c0; }
  .acc-search svg { color: #a0a8c0; flex-shrink: 0; }

  /* ── Host cell ── */
  .acc-host-cell {
    display: flex;
    align-items: center;
    gap: 11px;
  }

  .acc-avatar {
    width: 42px; height: 42px;
    border-radius: 11px;
    object-fit: cover;
    border: 2px solid #e8eaf2;
    flex-shrink: 0;
    transition: border-color .15s;
  }
  .acc-avatar:hover { border-color: #6366f1; }

  .acc-host-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e2235;
    white-space: nowrap;
  }

  /* ── Impression cell ── */
  .acc-impression {
    font-size: 13px;
    color: #64748b;
    max-width: 220px;
    line-height: 1.5;
  }

  /* ── Doc type badge ── */
  .acc-doc-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 7px;
    background: rgba(99,102,241,0.08);
    border: 1px solid rgba(99,102,241,0.15);
    font-size: 12px;
    font-weight: 600;
    color: #6366f1;
    white-space: nowrap;
    text-transform: capitalize;
  }

  /* ── Country cell ── */
  .acc-country-cell {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .acc-flag {
    width: 32px; height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid #e8eaf2;
    flex-shrink: 0;
  }
  .acc-country-name {
    font-size: 13px;
    font-weight: 500;
    color: #1e2235;
    white-space: nowrap;
  }

  /* ── Date cell ── */
  .acc-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #64748b;
    white-space: nowrap;
  }
  .acc-date svg { color: #a0a8c0; }

  /* ── Info button ── */
  .acc-info-btn {
    width: 36px; height: 36px;
    border-radius: 9px;
    background: rgba(99,102,241,0.08);
    border: 1.5px solid rgba(99,102,241,0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background .15s, border-color .15s, transform .12s, box-shadow .15s;
  }
  .acc-info-btn:hover {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.35);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(99,102,241,0.15);
  }
  .acc-info-btn img { width: 18px; height: 18px; }

  /* ── No badge ── */
  .acc-no {
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

  /* ── Status badge ── */
  .acc-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 700;
    background: rgba(16,185,129,0.09);
    border: 1px solid rgba(16,185,129,0.20);
    color: #10b981;
  }
  .acc-status-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #10b981;
  }

  /* ── Pagination wrapper ── */
  .acc-pagination {
    border-top: 1px solid #e8eaf2;
    padding: 12px 20px;
    background: linear-gradient(0deg, rgba(99,102,241,0.02) 0%, transparent 100%);
  }
`;

const AcceptedHostRequest = (props: any) => {
  const dispatch = useDispatch();
  const router   = useRouter();
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage]               = useState<number>(1);
  const [search, setSearch]           = useState("");

  const { hostRequest, totalHostRequest } = useSelector(
    (state: RootStore) => state.hostRequest
  );
  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});

  const toggleReview = (index: number) =>
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  useEffect(() => {
    dispatch(getHostRequest({ start: page, limit: rowsPerPage, status: 2 }));
  }, [page, rowsPerPage]);

  const handleInfo = (row: any) => {
    router.push({ pathname: "/HostProfile", query: { id: row?._id } });
    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  const acceptedHostRequestTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="acc-no">
          {(page - 1) * rowsPerPage + parseInt(index) + 1}
        </span>
      ),
    },
    {
      Header: "Host",
      accessor: "host",
      Cell: ({ row }: { row: any }) => (
        <div className="acc-host-cell">
          <img
            src={row?.image ? baseURL + row.image.replace(/\\/g, "/") : male.src}
            alt="Host"
            className="acc-avatar"
          />
          <span className="acc-host-name">{row?.name || "—"}</span>
        </div>
      ),
    },
    {
      Header: "Impression",
      Cell: ({ row, index }: { row: any; index: any }) => {
        const isExpanded   = expanded[index] || false;
        const impressionText = String(row?.impression || "");
        const previewText  = impressionText.substring(0, 100);
        return (
          <div className="acc-impression">
            {isExpanded ? impressionText : previewText || "—"}
          </div>
        );
      },
    },
    {
      Header: "Document Type",
      Cell: ({ row }: { row: any }) => (
        <span className="acc-doc-badge">
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
      Header: "Country",
      Cell: ({ row }: { row: any }) => {
        const countryName = row?.country || "—";
        const emoji       = row?.countryFlagImage;
        const countryCode = getCountryCodeFromEmoji(emoji);
        const flagUrl     = countryCode
          ? `https://flagcdn.com/w80/${countryCode}.png`
          : india.src;
        return (
          <div className="acc-country-cell">
            <img src={flagUrl} alt={countryName} className="acc-flag" />
            <span className="acc-country-name">{countryName}</span>
          </div>
        );
      },
    },
    {
      Header: "Status",
      Cell: () => (
        <span className="acc-status-badge">
          <span className="acc-status-dot" />
          Accepted
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
          <span className="acc-date">
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
      Header: "Info",
      Cell: ({ row }: { row: SuggestedServiceData }) => (
        <button className="acc-info-btn" onClick={() => handleInfo(row)}>
          <img src={info.src} alt="Info" />
        </button>
      ),
    },
  ];

  return (
    <>
      <style>{acceptedStyle}</style>

      <div className="acc-wrap">
        {/* ── Top bar ── */}
        <div className="acc-topbar">
          <div className="acc-topbar-left">
            <span className="acc-count-pill">
              <span className="acc-count-dot" />
              {totalHostRequest ?? 0} Accepted
            </span>
          </div>

          {/* Search */}
          <div className="acc-search">
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

        {/* ── Table ── */}
        <Table
          data={hostRequest}
          mapData={acceptedHostRequestTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<AcceptedHostRequestShimmer />}
        />

        {/* ── Pagination ── */}
        <div className="acc-pagination">
          <Pagination
            type="server"
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalHostRequest}
          />
        </div>
      </div>
    </>
  );
};

export default AcceptedHostRequest;