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
import Analytics from "@/extra/Analytic";
import Searching from "@/extra/Searching";
import historyInfo from "@/assets/images/history1.png";
import { blockRealHost, getRealOrFakeHost } from "@/store/hostSlice";
import notification from "@/assets/images/notification1.svg";
import { getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png";
import HostShimmer from "../Shimmer/HostShimmer";

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

/* ── Design tokens ── */
const T = {
  accent:  "#6366f1",
  accent2: "#a855f7",
  aSoft:   "rgba(99,102,241,0.09)",
  aMid:    "rgba(99,102,241,0.16)",
  aGlow:   "rgba(99,102,241,0.20)",
  green:   "#10b981",
  gSoft:   "rgba(16,185,129,0.10)",
  gMid:    "rgba(16,185,129,0.20)",
  amber:   "#f59e0b",
  amSoft:  "rgba(245,158,11,0.10)",
  amMid:   "rgba(245,158,11,0.22)",
  blue:    "#3b82f6",
  blSoft:  "rgba(59,130,246,0.10)",
  blMid:   "rgba(59,130,246,0.22)",
  rose:    "#f43f5e",
  rSoft:   "rgba(244,63,94,0.09)",
  rMid:    "rgba(244,63,94,0.20)",
  orange:  "#f97316",
  orSoft:  "rgba(249,115,22,0.10)",
  orMid:   "rgba(249,115,22,0.22)",
  border:  "#e8eaf2",
  txt:     "#64748b",
  txtDark: "#1e2235",
  txtDim:  "#a0a8c0",
  white:   "#ffffff",
  bg:      "#f4f5fb",
};

/* ── Reusable style objects ── */
const S: Record<string, React.CSSProperties> = {
  cellNo: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700, fontSize: "14px", color: T.txtDim,
  },
  personCell: {
    display: "flex", alignItems: "center", gap: "12px", padding: "4px 0",
  },
  personCellClick: {
    display: "flex", alignItems: "center", gap: "12px",
    padding: "4px 0", cursor: "pointer",
  },
  avatarWrap: { position: "relative", flexShrink: 0 },
  avatar: {
    width: "42px", height: "42px", borderRadius: "50%",
    objectFit: "cover", border: `2px solid ${T.border}`, display: "block",
  },
  statusDot: {
    position: "absolute", bottom: "1px", right: "1px",
    width: "10px", height: "10px", borderRadius: "50%",
    background: T.green, border: `2px solid ${T.white}`,
  },
  personInfo: { display: "flex", flexDirection: "column", gap: "2px" },
  personName: {
    fontSize: "13.5px", fontWeight: 600, color: T.txtDark,
    margin: 0, lineHeight: 1.3,
    whiteSpace: "nowrap", overflow: "hidden",
    textOverflow: "ellipsis", maxWidth: "150px",
  },
  personSub: { fontSize: "11px", color: T.txtDim, margin: 0, fontWeight: 500 },

  /* badges */
  badgePurple: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
    textTransform: "capitalize",
    background: T.aSoft, color: T.accent, border: `1px solid ${T.aMid}`,
  },
  badgeGreen: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
    background: T.gSoft, color: T.green, border: `1px solid ${T.gMid}`,
  },
  badgeAmber: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
    background: T.amSoft, color: T.amber, border: `1px solid ${T.amMid}`,
  },
  badgeBlue: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
    background: T.blSoft, color: T.blue, border: `1px solid ${T.blMid}`,
  },
  badgeRose: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
    background: T.rSoft, color: T.rose, border: `1px solid ${T.rMid}`,
  },
  badgeOrange: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap",
    background: T.orSoft, color: T.orange, border: `1px solid ${T.orMid}`,
  },

  /* country */
  countryCell: { display: "flex", alignItems: "center", gap: "8px" },
  flag: {
    width: "28px", height: "28px", borderRadius: "50%",
    objectFit: "cover", border: `1.5px solid ${T.border}`, flexShrink: 0,
  },
  cellText: {
    fontSize: "13px", color: T.txt, fontWeight: 500, whiteSpace: "nowrap",
  },
  cellDate: {
    fontSize: "12.5px", color: T.txtDim, fontWeight: 500, whiteSpace: "nowrap",
  },

  /* impression */
  impressionWrap: {
    maxWidth: "220px", fontSize: "13px", color: T.txt, lineHeight: 1.5,
  },

  /* action buttons */
  actionBtn: {
    width: "34px", height: "34px", borderRadius: "9px",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer",
    transition: "background .14s, border-color .14s, transform .12s",
  },

  /* filter bar */
  filterBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: "16px",
    background: T.white,
    border: `1px solid ${T.border}`,
    borderRadius: "14px",
    padding: "14px 18px",
    marginBottom: "18px",
    boxShadow: "0 1px 8px rgba(99,102,241,0.05)",
  },

  /* pagination */
  paginationWrap: {
    padding: "16px 20px", borderTop: `1px solid ${T.border}`,
  },
};

/* ── hover helpers ── */
const hoverIn  = (e: any, bg: string, border: string) => {
  e.currentTarget.style.background   = bg;
  e.currentTarget.style.borderColor  = border;
  e.currentTarget.style.transform    = "scale(1.08)";
};
const hoverOut = (e: any) => {
  e.currentTarget.style.background   = T.bg;
  e.currentTarget.style.borderColor  = T.border;
  e.currentTarget.style.transform    = "scale(1)";
};

/* ════════════════════════════════════════════ */

export const RealHost = (props: any) => {
  const dispatch = useDispatch();
  const router   = useRouter();

  const [startDate,   setStartDate]   = useState("All");
  const [endDate,     setEndDate]     = useState("All");
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page,        setPage]        = useState<number>(1);
  const [data,        setData]        = useState<any[]>([]);
  const [search,      setSearch]      = useState("");
  const [expanded,    setExpanded]    = useState<{ [key: number]: boolean }>({});

  const { host, total } = useSelector((state: RootStore) => state.host);

  const toggleReview      = (i: number) => setExpanded((p) => ({ ...p, [i]: !p[i] }));
  const handleChangePage  = (_: any, p: any) => setPage(p);
  const handleChangeRowsPerPage = (e: any) => { setRowsPerPage(parseInt(e, 10)); setPage(1); };
  const handleFilterData  = (f: any) => { if (typeof f === "string") setSearch(f); else setData(f); };

  useEffect(() => {
    dispatch(getRealOrFakeHost({ start: page, limit: rowsPerPage, startDate, endDate, search, type: 1 }));
  }, [dispatch, page, rowsPerPage, startDate, endDate, search]);

  const handleInfo = (row: any) => {
    router.push({ pathname: "/Host/HostInfoPage", query: { id: row?._id } });
    typeof window !== "undefined" && localStorage.setItem("hostData", JSON.stringify(row));
  };
  const handleRedirect = (row: any) => {
    router.push({ pathname: "/Host/HostHistoryPage", query: { id: row?._id, type: "host" } });
    typeof window !== "undefined" && localStorage.setItem("hostData", JSON.stringify(row));
  };
  const handleNotify = (id: any) =>
    dispatch(openDialog({ type: "notification", data: { id, type: "host" } }));

  /* ── columns ── */
  const userTable = [
    {
      Header: "No",
      Cell: ({ index }: any) => (
        <span style={S.cellNo}>{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Agency",
      Cell: ({ row }: any) => {
        const src = row?.agencyId?.image
          ? baseURL + row.agencyId.image.replace(/\\/g, "/") : male.src;
        return (
          <div style={S.personCell}>
            <div style={S.avatarWrap}>
              <img src={src} alt="agency" style={S.avatar}
                onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }} />
            </div>
            <div style={S.personInfo}>
              <p style={S.personName}>{row?.agencyId?.name || row?.agency?.name || "—"}</p>
              <p style={S.personSub}>{row?.agencyId?.agencyCode || "—"}</p>
            </div>
          </div>
        );
      },
    },

    {
      Header: "Host",
      Cell: ({ row }: any) => {
        const src = row?.image ? baseURL + row.image.replace(/\\/g, "/") : male.src;
        return (
          <div style={S.personCellClick}
            onClick={() => router.push({ pathname: "/Host/HostInfoPage", query: { id: row?._id } })}>
            <div style={S.avatarWrap}>
              <img src={src} alt="host" style={S.avatar}
                onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }} />
              <span style={S.statusDot} />
            </div>
            <div style={S.personInfo}>
              <p style={S.personName}>{row?.name || "—"}</p>
              <p style={S.personSub}>{row?.uniqueId || "—"}</p>
            </div>
          </div>
        );
      },
    },

    {
      Header: "User",
      Cell: ({ row }: any) => {
        const src = row?.userId?.image
          ? row.userId.image.replace(/\\/g, "/") : male.src;
        return (
          <div style={S.personCellClick}
            onClick={() => router.push({ pathname: "/User/UserInfoPage", query: { id: row?.userId?._id } })}>
            <div style={S.avatarWrap}>
              <img src={src} alt="user" style={S.avatar}
                onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }} />
            </div>
            <div style={S.personInfo}>
              <p style={S.personName}>{row?.userId?.name || "—"}</p>
              <p style={S.personSub}>{row?.userId?.uniqueId || "—"}</p>
            </div>
          </div>
        );
      },
    },

    {
      Header: "Country",
      Cell: ({ row }: any) => {
        const name    = row?.country || "—";
        const code    = getCountryCodeFromEmoji(row?.countryFlagImage);
        const flagUrl = code ? `https://flagcdn.com/w80/${code}.png` : india.src;
        return (
          <div style={S.countryCell}>
            <img src={flagUrl} alt={name} style={S.flag}
              onError={(e: any) => { e.target.onerror = null; e.target.src = india.src; }} />
            <span style={S.cellText}>{name}</span>
          </div>
        );
      },
    },

    {
      Header: "Followers",
      Cell: ({ row }: any) => (
        <span style={S.badgeBlue}>{row?.totalFollowers ?? 0}</span>
      ),
    },

    {
      Header: "Gender",
      Cell: ({ row }: any) => {
        const g = row?.gender?.toLowerCase();
        const style = g === "female" ? S.badgeOrange : S.badgePurple;
        return <span style={style}>{row?.gender || "—"}</span>;
      },
    },

    {
      Header: "ID Proof Type",
      Cell: ({ row }: any) => (
        <span style={S.badgePurple}>{row?.identityProofType || "—"}</span>
      ),
    },

    {
      Header: "Impression",
      Cell: ({ row, index }: any) => {
        const text = String(row?.impression || "");
        return (
          <div style={S.impressionWrap}>
            {text.substring(0, 15) || "—"}
          </div>
        );
      },
    },

    {
      Header: "Coin",
      Cell: ({ row }: any) => (
        <span style={S.badgeAmber}>{row?.coin?.toFixed(2) ?? "0.00"}</span>
      ),
    },

    {
      Header: "Online",
      Cell: ({ row }: any) => (
        <span style={row?.isOnline ? S.badgeGreen : S.badgeRose}>
          {row?.isOnline ? "Yes" : "No"}
        </span>
      ),
    },

    {
      Header: "Busy",
      Cell: ({ row }: any) => (
        <span style={row?.isBusy ? S.badgeAmber : S.badgeGreen}>
          {row?.isBusy ? "Yes" : "No"}
        </span>
      ),
    },

    {
      Header: "Live",
      Cell: ({ row }: any) => (
        <span style={row?.isLive ? S.badgeGreen : S.badgeRose}>
          {row?.isLive ? "Yes" : "No"}
        </span>
      ),
    },

    {
      Header: "Created At",
      Cell: ({ row }: any) => {
        const d = new Date(row?.createdAt);
        return (
          <span style={S.cellDate}>
            {isNaN(d.getTime()) ? "—"
              : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        );
      },
    },

    {
      Header: "Block",
      Cell: ({ row }: any) => (
        <ToggleSwitch
          value={row?.isBlock}
          onClick={() => dispatch(blockRealHost({ hostId: row?._id, type: "isBlock" }))}
        />
      ),
    },

    {
      Header: "Info",
      Cell: ({ row }: { row: SuggestedServiceData }) => (
        <button style={S.actionBtn} title="View Info"
          onClick={() => handleInfo(row)}
          onMouseEnter={(e) => hoverIn(e, T.blSoft, T.blue)}
          onMouseLeave={hoverOut}>
          <img src={info.src} height={18} width={18} alt="Info" />
        </button>
      ),
    },

    {
      Header: "Notification",
      Cell: ({ row }: any) => (
        <button style={S.actionBtn} title="Send Notification"
          onClick={() => handleNotify(row?._id)}
          onMouseEnter={(e) => hoverIn(e, T.amSoft, T.amber)}
          onMouseLeave={hoverOut}>
          <img src={notification.src} height={18} width={18} alt="Notify" />
        </button>
      ),
    },

    {
      Header: "History",
      Cell: ({ row }: any) => (
        <button style={S.actionBtn} title="View History"
          onClick={() => handleRedirect(row)}
          onMouseEnter={(e) => hoverIn(e, T.rSoft, T.rose)}
          onMouseLeave={hoverOut}>
          <img src={historyInfo.src} height={18} width={18} alt="History" />
        </button>
      ),
    },
  ];

  return (
    <div>
      {/* ── Filter bar ── */}
      <div style={S.filterBar}>
        <Analytics
          analyticsStartDate={startDate}
          analyticsStartEnd={endDate}
          analyticsStartDateSet={setStartDate}
          analyticsStartEndSet={setEndDate}
          direction="start"
        />
        <Searching
          type="server"
          data={host}
          setData={setData}
          column={userTable}
          serverSearching={handleFilterData}
          placeholder="Search by Host Name / Unique ID"
        />
      </div>

      {/* ── Table ── */}
      <Table
        data={host}
        mapData={userTable}
        PerPage={rowsPerPage}
        Page={page}
        type="server"
        shimmer={<HostShimmer />}
      />

      {/* ── Pagination ── */}
      <div style={S.paginationWrap}>
        <Pagination
          type="server"
          serverPage={page}
          setServerPage={setPage}
          serverPerPage={rowsPerPage}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          totalData={total}
        />
      </div>
    </div>
  );
};