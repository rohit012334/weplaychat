import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { getHostRequest, hostRequestUpdate } from "@/store/hostRequestSlice";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import HostReasonDialog from "./HostReasonDialog";
import { useRouter } from "next/router";
import info from "@/assets/images/info.svg";
import accept from "@/assets/images/accept.svg";
import decline from "@/assets/images/decline.svg";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import { getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png";
import AcceptedHostRequestShimmer from "../shimmer/AcceptedHostRequestShimmer";
import AssignAgencyToDialog from "./AssignAgencyToDialg";
import CommonDialog from "@/utils/CommonDialog";

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

const pendingStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  .pnd-wrap {
    font-family: 'Outfit', sans-serif;
    padding: 4px 0;
  }

  /* ── Top bar ── */
  .pnd-topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 20px;
    border-bottom: 1px solid #e8eaf2;
    flex-wrap: wrap;
    gap: 10px;
  }

  .pnd-topbar-left {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pnd-count-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 12px;
    border-radius: 8px;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    font-size: 12px;
    font-weight: 700;
    color: #f59e0b;
  }

  .pnd-count-dot {
    width: 6px; height: 6px;
    border-radius: 50%;
    background: #f59e0b;
    animation: pndPulse 1.8s ease-in-out infinite;
  }

  @keyframes pndPulse {
    0%,100% { opacity:1; transform:scale(1); }
    50%      { opacity:0.5; transform:scale(1.6); }
  }

  /* ── Search ── */
  .pnd-search {
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
  .pnd-search:focus-within {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.08);
  }
  .pnd-search input {
    border: none; background: transparent;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; color: #1e2235;
    outline: none; width: 100%;
  }
  .pnd-search input::placeholder { color: #a0a8c0; }
  .pnd-search svg { color: #a0a8c0; flex-shrink: 0; }

  /* ── No badge ── */
  .pnd-no {
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
  .pnd-host-cell {
    display: flex;
    align-items: center;
    gap: 11px;
  }
  .pnd-avatar {
    width: 42px; height: 42px;
    border-radius: 11px;
    object-fit: cover;
    border: 2px solid #e8eaf2;
    flex-shrink: 0;
    transition: border-color .15s;
  }
  .pnd-avatar:hover { border-color: #6366f1; }
  .pnd-host-name {
    font-size: 13.5px;
    font-weight: 600;
    color: #1e2235;
    white-space: nowrap;
  }

  /* ── Doc type badge ── */
  .pnd-doc-badge {
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
  .pnd-country-cell {
    display: flex;
    align-items: center;
    gap: 9px;
  }
  .pnd-flag {
    width: 32px; height: 32px;
    border-radius: 50%;
    object-fit: cover;
    border: 1.5px solid #e8eaf2;
    flex-shrink: 0;
  }
  .pnd-country-name {
    font-size: 13px;
    font-weight: 500;
    color: #1e2235;
    white-space: nowrap;
  }

  /* ── Date cell ── */
  .pnd-date {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12.5px;
    color: #64748b;
    white-space: nowrap;
  }
  .pnd-date svg { color: #a0a8c0; }

  /* ── Status badge ── */
  .pnd-status-badge {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11.5px;
    font-weight: 700;
    background: rgba(245,158,11,0.09);
    border: 1px solid rgba(245,158,11,0.22);
    color: #f59e0b;
  }
  .pnd-status-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #f59e0b;
    animation: pndPulse 1.8s ease-in-out infinite;
  }

  /* ── Info button ── */
  .pnd-info-btn {
    width: 36px; height: 36px;
    border-radius: 9px;
    background: rgba(99,102,241,0.08);
    border: 1.5px solid rgba(99,102,241,0.15);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background .15s, border-color .15s, transform .12s, box-shadow .15s;
    flex-shrink: 0;
  }
  .pnd-info-btn:hover {
    background: rgba(99,102,241,0.15);
    border-color: rgba(99,102,241,0.35);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(99,102,241,0.15);
  }
  .pnd-info-btn img { width: 18px; height: 18px; }

  /* ── Action buttons ── */
  .pnd-actions {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .pnd-accept-btn {
    width: 36px; height: 36px;
    border-radius: 9px;
    background: rgba(16,185,129,0.09);
    border: 1.5px solid rgba(16,185,129,0.22);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background .15s, border-color .15s, transform .12s, box-shadow .15s;
    flex-shrink: 0;
  }
  .pnd-accept-btn:hover {
    background: rgba(16,185,129,0.18);
    border-color: rgba(16,185,129,0.40);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(16,185,129,0.18);
  }
  .pnd-accept-btn img { width: 18px; height: 18px; }

  .pnd-decline-btn {
    width: 36px; height: 36px;
    border-radius: 9px;
    background: rgba(244,63,94,0.08);
    border: 1.5px solid rgba(244,63,94,0.18);
    display: flex; align-items: center; justify-content: center;
    cursor: pointer;
    transition: background .15s, border-color .15s, transform .12s, box-shadow .15s;
    flex-shrink: 0;
  }
  .pnd-decline-btn:hover {
    background: rgba(244,63,94,0.16);
    border-color: rgba(244,63,94,0.38);
    transform: translateY(-1px);
    box-shadow: 0 3px 10px rgba(244,63,94,0.15);
  }
  .pnd-decline-btn img { width: 18px; height: 18px; }

  /* ── Pagination wrapper ── */
  .pnd-pagination {
    border-top: 1px solid #e8eaf2;
    padding: 12px 20px;
    background: linear-gradient(0deg, rgba(99,102,241,0.02) 0%, transparent 100%);
  }
`;

const PendingHostRequest = (props: any) => {
  const dispatch = useDispatch();
  const router   = useRouter();
  const [showDialog, setShowDialog]   = useState(false);
  const [selectedId, setSelectedId]   = useState<any>(null);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage]               = useState<number>(1);
  const [search, setSearch]           = useState("");
  const [expanded, setExpanded]       = useState<{ [key: number]: boolean }>({});

  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { hostRequest, totalHostRequest } = useSelector((state: RootStore) => state.hostRequest);

  const toggleReview = (index: number) =>
    setExpanded(prev => ({ ...prev, [index]: !prev[index] }));

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  const handleOpenWithdrawDialogue = (row: any) =>
    dispatch(openDialog({ type: "reason", data: row }));

  const handleAccepteHostRequest = async () => {
    if (selectedId) {
      dispatch(hostRequestUpdate({ requestId: selectedId?._id, userId: selectedId?.userId }));
      setShowDialog(false);
    }
  };

  const handleActionAccept = (id: any) => {
    setSelectedId(id);
    setShowDialog(true);
  };

  const handleInfo = (row: any) => {
    router.push({ pathname: "/HostProfile", query: { id: row?._id } });
    typeof window !== "undefined" &&
      localStorage.setItem("hostData", JSON.stringify(row));
  };

  useEffect(() => {
    dispatch(getHostRequest({ start: page, limit: rowsPerPage, status: 1 }));
  }, [page, rowsPerPage]);

  const pendingHostRequest = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="pnd-no">
          {(page - 1) * rowsPerPage + parseInt(index) + 1}
        </span>
      ),
    },
    {
      Header: "Host",
      accessor: "host",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.image ? row.image.replace(/\\/g, "/") : "";
        return (
          <div className="pnd-host-cell">
            <img
              src={row?.image ? baseURL + updatedImagePath : male.src}
              alt="Host"
              className="pnd-avatar"
            />
            <span className="pnd-host-name">{row?.name || "—"}</span>
          </div>
        );
      },
    },
    {
      Header: "Document Type",
      Cell: ({ row }: { row: any }) => (
        <span className="pnd-doc-badge">
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
          <div className="pnd-country-cell">
            <img src={flagUrl} alt={countryName} className="pnd-flag" />
            <span className="pnd-country-name">{countryName}</span>
          </div>
        );
      },
    },
    {
      Header: "Status",
      Cell: () => (
        <span className="pnd-status-badge">
          <span className="pnd-status-dot" />
          Pending
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
          <span className="pnd-date">
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
        <button className="pnd-info-btn" onClick={() => handleInfo(row)}>
          <img src={info.src} alt="Info" />
        </button>
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }: { row: SuggestedServiceData }) => (
        <div className="pnd-actions">
          {/* Accept */}
          <button
            className="pnd-accept-btn"
            onClick={() => handleActionAccept(row)}
            title="Accept"
          >
            <img src={accept.src} alt="Accept" />
          </button>

          {/* Decline */}
          <button
            className="pnd-decline-btn"
            onClick={() => handleOpenWithdrawDialogue(row)}
            title="Decline"
          >
            <img src={decline.src} alt="Decline" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{pendingStyle}</style>

      {dialogueType === "reason"       && <HostReasonDialog />}
      {dialogueType === "assignagency" && <AssignAgencyToDialog />}

      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={handleAccepteHostRequest}
        text="Accept"
      />

      <div className="pnd-wrap">

        {/* ── Top bar ── */}
        <div className="pnd-topbar">
          <div className="pnd-topbar-left">
            <span className="pnd-count-pill">
              <span className="pnd-count-dot" />
              {totalHostRequest ?? 0} Pending
            </span>
          </div>

          {/* Search */}
          <div className="pnd-search">
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
          mapData={pendingHostRequest}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<AcceptedHostRequestShimmer />}
        />

        {/* ── Pagination ── */}
        <div className="pnd-pagination">
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

export default PendingHostRequest;