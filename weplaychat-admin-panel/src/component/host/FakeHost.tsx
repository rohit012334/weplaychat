import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import { baseURL } from "@/utils/config";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { useRouter } from "next/router";
import info from "@/assets/images/info.svg";
import male from "@/assets/images/male.png";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import Analytics from "@/extra/Analytic";
import Searching from "@/extra/Searching";
import HostDialog from "./HostDialog";
import { blockonlinebusyHost, deleteHost, getRealOrFakeHost } from "@/store/hostSlice";
import EditIcon from "@/assets/images/edit.svg";
import TrashIcon from "@/assets/images/delete.svg";
import CommonDialog from "@/utils/CommonDialog";
import FakeHostShimmer from "../Shimmer/FakeHostShimmer";

/* ── Design tokens ── */
const T = {
  accent: "#6366f1",
  accent2: "#a855f7",
  aSoft: "rgba(99,102,241,0.09)",
  aMid: "rgba(99,102,241,0.16)",
  aGlow: "rgba(99,102,241,0.20)",
  green: "#10b981",
  gSoft: "rgba(16,185,129,0.10)",
  gMid: "rgba(16,185,129,0.20)",
  amber: "#f59e0b",
  amSoft: "rgba(245,158,11,0.10)",
  amMid: "rgba(245,158,11,0.22)",
  blue: "#3b82f6",
  blSoft: "rgba(59,130,246,0.10)",
  blMid: "rgba(59,130,246,0.22)",
  rose: "#f43f5e",
  rSoft: "rgba(244,63,94,0.09)",
  rMid: "rgba(244,63,94,0.20)",
  orange: "#f97316",
  orSoft: "rgba(249,115,22,0.10)",
  orMid: "rgba(249,115,22,0.22)",
  border: "#e8eaf2",
  txt: "#64748b",
  txtDark: "#1e2235",
  txtDim: "#a0a8c0",
  white: "#ffffff",
  bg: "#f4f5fb",
};

const S: Record<string, React.CSSProperties> = {
  cellNo: {
    fontFamily: "'Rajdhani', sans-serif",
    fontWeight: 700, fontSize: "14px", color: T.txtDim,
  },
  monobadge: {
    fontFamily: "monospace", fontSize: "12px",
    background: T.aSoft, color: T.accent,
    border: `1px solid ${T.aMid}`,
    padding: "3px 10px", borderRadius: "20px",
    fontWeight: 700, whiteSpace: "nowrap" as const,
  },
  personCell: {
    display: "flex", alignItems: "center", gap: "12px", padding: "4px 0",
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

  cellText: {
    fontSize: "13px", color: T.txt, fontWeight: 500, whiteSpace: "nowrap" as const,
  },
  cellDate: {
    fontSize: "12.5px", color: T.txtDim, fontWeight: 500, whiteSpace: "nowrap" as const,
  },

  badgePurple: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" as const,
    textTransform: "capitalize" as const,
    background: T.aSoft, color: T.accent, border: `1px solid ${T.aMid}`,
  },
  badgeGreen: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" as const,
    background: T.gSoft, color: T.green, border: `1px solid ${T.gMid}`,
  },
  badgeRose: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" as const,
    background: T.rSoft, color: T.rose, border: `1px solid ${T.rMid}`,
  },
  badgeOrange: {
    display: "inline-flex", alignItems: "center",
    padding: "3px 10px", borderRadius: "20px",
    fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap" as const,
    textTransform: "capitalize" as const,
    background: T.orSoft, color: T.orange, border: `1px solid ${T.orMid}`,
  },

  impressionWrap: {
    maxWidth: "240px", fontSize: "13px", color: T.txt, lineHeight: 1.5,
    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
  },

  actionBtn: {
    width: "34px", height: "34px", borderRadius: "9px",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer",
  },
  actionBtnGroup: {
    display: "flex", alignItems: "center", gap: "6px",
  },

  filterBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    gap: "16px",
    background: T.white, border: `1px solid ${T.border}`,
    borderRadius: "14px", padding: "14px 18px", marginBottom: "18px",
    boxShadow: "0 1px 8px rgba(99,102,241,0.05)",
  },
  topBar: {
    display: "flex", alignItems: "center", justifyContent: "flex-end",
    marginBottom: "14px",
  },
  addBtn: {
    display: "inline-flex", alignItems: "center", gap: "8px",
    padding: "10px 20px", borderRadius: "10px", border: "none",
    background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
    color: "#fff",
    fontFamily: "'Outfit', sans-serif",
    fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
    boxShadow: `0 4px 14px ${T.aGlow}`,
  },
  paginationWrap: {
    padding: "16px 20px", borderTop: `1px solid ${T.border}`,
  },
};

/* ── hover helpers ── */
const hoverIn = (e: any, bg: string, border: string) => {
  e.currentTarget.style.background = bg;
  e.currentTarget.style.borderColor = border;
  e.currentTarget.style.transform = "scale(1.08)";
};
const hoverOut = (e: any) => {
  e.currentTarget.style.background = T.bg;
  e.currentTarget.style.borderColor = T.border;
  e.currentTarget.style.transform = "scale(1)";
};

/* ════════════════════════════════════════════ */

export const FakeHost = ({ type }: any) => {
  const dispatch = useDispatch();
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { fakeHost, totalFakeHost }: any = useSelector((state: RootStore) => state.host);
  const router = useRouter();

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any[]>([]);
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<any>(null);

  useEffect(() => {
    if (type === "fake_host") {
      dispatch(getRealOrFakeHost({ start: page, limit: rowsPerPage, startDate, endDate, search, type: 2 }));
    }
  }, [dispatch, page, rowsPerPage, startDate, endDate, search, type]);

  const handleChangePage = (_: any, p: any) => setPage(p);
  const handleChangeRowsPerPage = (e: any) => { setRowsPerPage(parseInt(e, 10)); setPage(1); };
  const handleFilterData = (f: any) => { if (typeof f === "string") setSearch(f); else setData(f); };

  const handleInfo = (row: any) => {
    router.push({ pathname: "/Host/HostInfoPage", query: { id: row?._id, type: "fakeHost" } });
    typeof window !== "undefined" && localStorage.setItem("hostData", JSON.stringify(row));
  };
  const handleDelete = (id: any) => { setSelectedId(id); setShowDialog(true); };
  const confirmDelete = () => { if (selectedId) { dispatch(deleteHost(selectedId)); setShowDialog(false); } };

  /* ── columns ── */
  const agencyTable = [
    {
      Header: "No",
      Cell: ({ index }: any) => (
        <span style={S.cellNo}>{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },

    {
      Header: "Unique ID",
      Cell: ({ row }: any) => (
        <span style={S.monobage ?? S.monobage}>{row?.uniqueId || "—"}</span>
      ),
    },

    {
      Header: "Host",
      Cell: ({ row }: any) => {
        const src = row?.image ? baseURL + row.image.replace(/\\/g, "/") : male.src;
        return (
          <div style={S.personCell}>
            <div style={S.avatarWrap}>
              <img src={src} alt="host" style={S.avatar}
                onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }} />
              <span style={S.statusDot} />
            </div>
            <div style={S.personInfo}>
              <p style={S.personName}>{row?.name || "—"}</p>
            </div>
          </div>
        );
      },
    },

    {
      Header: "Email",
      Cell: ({ row }: any) => (
        <span style={S.cellText}>{row?.email || "—"}</span>
      ),
    },

    {
      Header: "Gender",
      Cell: ({ row }: any) => {
        const g = row?.gender?.toLowerCase();
        return (
          <span style={g === "female" ? S.badgeOrange : S.badgePurple}>
            {row?.gender || "—"}
          </span>
        );
      },
    },

    {
      Header: "Impression",
      Cell: ({ row }: any) => {
        const text = String(row?.impression || "");
        return <div style={S.impressionWrap}>{text.substring(0, 30) || "—"}</div>;
      },
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
          onClick={() => dispatch(blockonlinebusyHost({ hostId: row?._id, type: "isBlock" }))}
        />
      ),
    },

    {
      Header: "Info",
      Cell: ({ row }: any) => (
        <button style={S.actionBtn} title="View Info"
          onClick={() => handleInfo(row)}
          onMouseEnter={(e) => hoverIn(e, T.blSoft, T.blue)}
          onMouseLeave={hoverOut}>
          <img src={info.src} height={18} width={18} alt="Info" />
        </button>
      ),
    },

    {
      Header: "Action",
      Cell: ({ row }: any) => (
        <div style={S.actionBtnGroup}>
          {/* Edit */}
          <button style={S.actionBtn} title="Edit"
            onClick={() => dispatch(openDialog({ type: "fakeHost", data: row }))}
            onMouseEnter={(e) => hoverIn(e, T.blSoft, T.blue)}
            onMouseLeave={hoverOut}>
            <img src={EditIcon.src} alt="Edit" width={16} height={16} />
          </button>
          {/* Delete */}
          <button style={S.actionBtn} title="Delete"
            onClick={() => handleDelete(row?._id)}
            onMouseEnter={(e) => hoverIn(e, T.rSoft, T.rose)}
            onMouseLeave={hoverOut}>
            <img src={TrashIcon.src} alt="Delete" width={16} height={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text="Delete"
      />

      {dialogueType === "fakeHost" && <HostDialog />}

      {/* ── Add button ── */}
      <div style={S.topBar}>
        <button
          style={S.addBtn}
          onClick={() => dispatch(openDialog({ type: "fakeHost" }))}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
            stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Add Fake Host
        </button>
      </div>

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
          data={fakeHost}
          setData={setData}
          column={agencyTable}
          serverSearching={handleFilterData}
          placeholder="Search by Host Name / Unique ID"
        />
      </div>

      {/* ── Table ── */}
      <Table
        data={fakeHost}
        mapData={agencyTable}
        PerPage={rowsPerPage}
        Page={page}
        type="server"
        shimmer={<FakeHostShimmer />}
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
          totalData={totalFakeHost}
        />
      </div>
    </>
  );
};