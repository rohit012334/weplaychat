import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
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
import HostRequsetShimmer from "../Shimmer/HostRequsetShimmer";

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

/* ── Design tokens ── */
const T = {
  accent:  "#6366f1",
  accent2: "#a855f7",
  aSoft:   "rgba(99,102,241,0.09)",
  aMid:    "rgba(99,102,241,0.16)",
  green:   "#10b981",
  gSoft:   "rgba(16,185,129,0.10)",
  gMid:    "rgba(16,185,129,0.20)",
  blue:    "#3b82f6",
  blSoft:  "rgba(59,130,246,0.10)",
  blMid:   "rgba(59,130,246,0.22)",
  rose:    "#f43f5e",
  rSoft:   "rgba(244,63,94,0.09)",
  rMid:    "rgba(244,63,94,0.20)",
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
  /* Rose dot = declined */
  statusDot: {
    position: "absolute", bottom: "1px", right: "1px",
    width: "10px", height: "10px", borderRadius: "50%",
    background: T.rose, border: `2px solid ${T.white}`,
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
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" as const,
    textTransform: "capitalize" as const,
    background: T.aSoft, color: T.accent, border: `1px solid ${T.aMid}`,
  },
  badgeRose: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" as const,
    background: T.rSoft, color: T.rose, border: `1px solid ${T.rMid}`,
  },

  /* country */
  countryCell: { display: "flex", alignItems: "center", gap: "8px" },
  flag: {
    width: "28px", height: "28px", borderRadius: "50%",
    objectFit: "cover", border: `1.5px solid ${T.border}`, flexShrink: 0,
  },
  cellText: {
    fontSize: "13px", color: T.txt, fontWeight: 500, whiteSpace: "nowrap" as const,
  },
  cellDate: {
    fontSize: "12.5px", color: T.txtDim, fontWeight: 500, whiteSpace: "nowrap" as const,
  },

  /* impression / reason */
  textWrap: {
    maxWidth: "240px", fontSize: "13px", color: T.txt, lineHeight: 1.5,
  },
  reasonWrap: {
    maxWidth: "280px", fontSize: "13px", lineHeight: 1.5,
    color: T.rose,
  },
  readMore: {
    background: "none", border: "none", padding: 0,
    fontSize: "12px", fontWeight: 600, color: T.accent,
    cursor: "pointer", marginLeft: "4px",
  },
  readMoreRose: {
    background: "none", border: "none", padding: 0,
    fontSize: "12px", fontWeight: 600, color: T.rose,
    cursor: "pointer", marginLeft: "4px",
  },

  /* action btn */
  actionBtn: {
    width: "34px", height: "34px", borderRadius: "9px",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer",
  },

  paginationWrap: {
    padding: "16px 20px", borderTop: `1px solid ${T.border}`,
  },
};

/* ── hover helpers ── */
const hoverIn  = (e: any, bg: string, border: string) => {
  e.currentTarget.style.background  = bg;
  e.currentTarget.style.borderColor = border;
  e.currentTarget.style.transform   = "scale(1.08)";
};
const hoverOut = (e: any) => {
  e.currentTarget.style.background  = T.bg;
  e.currentTarget.style.borderColor = T.border;
  e.currentTarget.style.transform   = "scale(1)";
};

/* ════════════════════════════════════════════ */

const DeclinedHostRequest = ({ type }: any) => {
  const dispatch = useDispatch();
  const router   = useRouter();

  const [rowsPerPage,     setRowsPerPage]     = useState<number>(10);
  const [page,            setPage]            = useState<number>(1);
  const [expanded,        setExpanded]        = useState<{ [key: number]: boolean }>({});
  const [expandedReason,  setExpandedReason]  = useState<{ [key: number]: boolean }>({});

  const { hostRequest, totalHostRequest } = useSelector((state: RootStore) => state.hostRequest);

  const toggleReview       = (i: number) => setExpanded((p)       => ({ ...p, [i]: !p[i] }));
  const toggleReviewReason = (i: number) => setExpandedReason((p) => ({ ...p, [i]: !p[i] }));

  const handleChangePage        = (_: any, p: any) => setPage(p);
  const handleChangeRowsPerPage = (e: any) => { setRowsPerPage(parseInt(e, 10)); setPage(1); };

  useEffect(() => {
    if (type === "declined")
      dispatch(getHostRequest({ start: page, limit: rowsPerPage, status: 3 }));
  }, [dispatch, page, rowsPerPage, type]);

  const handleInfo = (row: any) => {
    router.push({ pathname: "/HostProfile", query: { id: row?._id } });
    typeof window !== "undefined" && localStorage.setItem("hostData", JSON.stringify(row));
  };

  /* ── columns ── */
  const declinedHostRequestTable = [
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
              <img src={src} alt="host" style={S.avatar} />
              {/* Rose dot = declined */}
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
      Header: "Impression",
      Cell: ({ row, index }: any) => {
        const isExp = expanded[index] || false;
        const text  = String(row?.impression || "");
        return (
          <div style={S.textWrap}>
            {isExp ? text : text.substring(0, 30) || "—"}
            {text.length > 10 && (
              <button style={S.readMore} onClick={() => toggleReview(index)}>
                {isExp ? "Read less" : "Read more..."}
              </button>
            )}
          </div>
        );
      },
    },

    {
      Header: "ID Proof Type",
      Cell: ({ row }: any) => (
        <span style={S.badgePurple}>{row?.identityProofType || "—"}</span>
      ),
    },

    {
      Header: "Reason",
      Cell: ({ row, index }: any) => {
        const isExp = expandedReason[index] || false;
        const text  = String(row?.reason || "");
        return (
          <div style={S.reasonWrap}>
            {isExp ? text : text.substring(0, 30) || "—"}
            {text.length > 10 && (
              <button style={S.readMoreRose} onClick={() => toggleReviewReason(index)}>
                {isExp ? "Read less" : "Read more..."}
              </button>
            )}
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
      Header: "Info",
      Cell: ({ row }: { row: SuggestedServiceData }) => (
        <button style={S.actionBtn} title="View Profile"
          onClick={() => handleInfo(row)}
          onMouseEnter={(e) => hoverIn(e, T.blSoft, T.blue)}
          onMouseLeave={hoverOut}>
          <img src={info.src} height={18} width={18} alt="Info" />
        </button>
      ),
    },
  ];

  return (
    <div>
      <Table
        data={hostRequest}
        mapData={declinedHostRequestTable}
        PerPage={rowsPerPage}
        Page={page}
        type="server"
        shimmer={<HostRequsetShimmer />}
      />
      <div style={S.paginationWrap}>
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
  );
};

export default DeclinedHostRequest;