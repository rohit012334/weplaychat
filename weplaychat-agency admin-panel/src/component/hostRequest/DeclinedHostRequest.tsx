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
  reason: string;
}

const declinedStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .dcl-wrap {
    font-family: 'Outfit', sans-serif;
    padding: 4px 0;
  }

  /* ── Top bar ── */
  .dcl-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e8eaf2;
    flex-wrap: wrap;
    gap: 10px;
  }

  .dcl-count-pill {
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

  .dcl-count-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #f43f5e;
  }

  /* ── Search ── */
  .dcl-search {
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
  .dcl-search:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .dcl-search input {
    border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #1e2235;
    outline: none; width: 100%;
  }
  .dcl-search input::placeholder { color: #a0a8c0; }
  .dcl-search svg { color: #a0a8c0; flex-shrink: 0; }

  /* ── No badge ── */
  .dcl-no {
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

  /* ── Host cell ── */
  .dcl-host-cell {
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .dcl-avatar {
    width: 42px; height: 42px;
    border-radius: 11px;
    object-fit: cover;
    border: 2px solid #e8eaf2;
    flex-shrink: 0;
    transition: border-color .15s;
  }
  .dcl-avatar:hover { border-color: #f43f5e; }
  .dcl-host-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e2235;
    white-space: nowrap;
  }

  /* ── Impression ── */
  .dcl-impression {
    font-size: 13px;
    color: #64748b;
    max-width: 180px;
    line-height: 1.5;
  }

  /* ── Doc type badge ── */
  .dcl-doc-badge {
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

  /* ── Reason cell ── */
  .dcl-reason-wrap {
    max-width: 260px;
  }
  .dcl-reason-text {
    font-size: 13px;
    color: #64748b;
    line-height: 1.5;
  }
  .dcl-reason-toggle {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-top: 4px;
    font-size: 11.5px;
    font-weight: 600;
    color: #6366f1;
    cursor: pointer;
    background: none;
    border: none;
    padding: 0;
    transition: color .14s;
  }
  .dcl-reason-toggle:hover { color: #a855f7; }

  /* ── Country cell ── */
  .dcl-country-cell {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .dcl-flag {
    width: 32px; height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid #e8eaf2;
    flex-shrink: 0;
  }
  .dcl-country-name {
    font-size: 13px;
    font-weight: 500;
    color: #1e2235;
    white-space: nowrap;
  }

  /* ── Status badge ── */
  .dcl-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 700;
    background: rgba(244,63,94,0.08);
    border: 1px solid rgba(244,63,94,0.20);
    color: #f43f5e;
    white-space: nowrap;
  }
  .dcl-status-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #f43f5e;
    flex-shrink: 0;
  }

  /* ── Date cell ── */
  .dcl-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #64748b;
    white-space: nowrap;
  }
  .dcl-date svg { color: #a0a8c0; }

  /* ── Info button ── */
  .dcl-info-btn {
    width: 36px; height: 36px;
    border-radius: 9px;
    background: rgba(99,102,241,0.08);
    border: 1.5px solid rgba(99,102,241,0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background .15s, border-color .15s, transform .12s, box-shadow .15s;
    flex-shrink: 0;
  }
  .dcl-info-btn:hover {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.35);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(99,102,241,0.15);
  }
  .dcl-info-btn img { width: 18px; height: 18px; }

  /* ── Pagination wrapper ── */
  .dcl-pagination {
    border-top: 1px solid #e8eaf2;
    padding: 12px 20px;
    background: linear-gradient(0deg, rgba(99,102,241,0.02) 0%, transparent 100%);
  }
`;

const DeclinedHostRequest = (props: any) => {
  const router   = useRouter();
  const dispatch = useDispatch();

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage]               = useState<number>(1);
  const [search, setSearch]           = useState("");
  const [expanded, setExpanded]       = useState<{ [key: number]: boolean }>({});
  const [expandedReason, setExpandedReason] = useState<{ [key: number]: boolean }>({});

  const { hostRequest, totalHostRequest } = useSelector(
    (state: RootStore) => state.hostRequest
  );

  const toggleReview       = (i: number) => setExpanded(p => ({ ...p, [i]: !p[i] }));
  const toggleReviewReason = (i: number) => setExpandedReason(p => ({ ...p, [i]: !p[i] }));

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  useEffect(() => {
    dispatch(getHostRequest({ start: page, limit: rowsPerPage, status: 3 }));
  }, [page, rowsPerPage]);

  const handleInfo = (row: any) => {
    router.push({ pathname: "/HostProfile", query: { id: row?._id } });
    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  const declinedHostRequestTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="dcl-no">
          {(page - 1) * rowsPerPage + parseInt(index) + 1}
        </span>
      ),
    },
    {
      Header: "Host",
      accessor: "host",
      Cell: ({ row }: { row: any }) => (
        <div className="dcl-host-cell">
          <img
            src={row?.image ? baseURL + row.image.replace(/\\/g, "/") : male.src}
            alt="Host"
            className="dcl-avatar"
          />
          <span className="dcl-host-name">{row?.name || "—"}</span>
        </div>
      ),
    },
    {
      Header: "Impression",
      Cell: ({ row, index }: { row: any; index: any }) => {
        const isExpanded     = expanded[index] || false;
        const impressionText = String(row?.impression || "");
        const previewText    = impressionText.substring(0, 60);
        return (
          <div className="dcl-impression">
            {isExpanded ? impressionText : previewText || "—"}
          </div>
        );
      },
    },
    {
      Header: "Document Type",
      Cell: ({ row }: { row: any }) => (
        <span className="dcl-doc-badge">
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
      Header: "Reason",
      Cell: ({ row, index }: { row: any; index: any }) => {
        const isExpanded     = expandedReason[index] || false;
        const reasonText     = String(row?.reason || "");
        const previewText    = reasonText.substring(0, 60);
        return (
          <div className="dcl-reason-wrap">
            <span className="dcl-reason-text">
              {isExpanded ? reasonText : previewText || "—"}
            </span>
            {reasonText.length > 60 && (
              <button
                className="dcl-reason-toggle"
                onClick={() => toggleReviewReason(index)}
              >
                {isExpanded ? (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="18 15 12 9 6 15" />
                    </svg>
                    Read less
                  </>
                ) : (
                  <>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                    Read more
                  </>
                )}
              </button>
            )}
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
          <div className="dcl-country-cell">
            <img src={flagUrl} alt={countryName} className="dcl-flag" />
            <span className="dcl-country-name">{countryName}</span>
          </div>
        );
      },
    },
    {
      Header: "Status",
      Cell: () => (
        <span className="dcl-status-badge">
          <span className="dcl-status-dot" />
          Declined
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
          <span className="dcl-date">
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
        <button className="dcl-info-btn" onClick={() => handleInfo(row)}>
          <img src={info.src} alt="Info" />
        </button>
      ),
    },
  ];

  return (
    <>
      <style>{declinedStyle}</style>

      <div className="dcl-wrap">

        {/* ── Top bar ── */}
        <div className="dcl-topbar">
          <div className="dcl-count-pill">
            <span className="dcl-count-dot" />
            {totalHostRequest ?? 0} Declined
          </div>

          {/* Search */}
          <div className="dcl-search">
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
          mapData={declinedHostRequestTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<AcceptedHostRequestShimmer />}
        />

        {/* ── Pagination ── */}
        <div className="dcl-pagination">
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

export default DeclinedHostRequest;