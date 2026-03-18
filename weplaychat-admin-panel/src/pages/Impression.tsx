import TrashIcon from "@/assets/images/delete.svg";
import EditIcon from "@/assets/images/edit.svg";
import ImpressionDialog from "@/component/impression/ImpressionDialog";
import RootLayout from "@/component/layout/Layout";
import ImpressionShimmer from "@/component/Shimmer/ImpressionShimmer";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { deleteImpression, getImpression } from "@/store/impressionSlice";
import { RootStore } from "@/store/store";
import CommonDialog from "@/utils/CommonDialog";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

/* ── Design tokens ── */
const T = {
  accent: "#6366f1",
  accent2: "#a855f7",
  aSoft: "rgba(99,102,241,0.09)",
  aMid: "rgba(99,102,241,0.16)",
  aGlow: "rgba(99,102,241,0.20)",
  amber: "#f59e0b",
  amSoft: "rgba(245,158,11,0.10)",
  amMid: "rgba(245,158,11,0.22)",
  blue: "#3b82f6",
  blSoft: "rgba(59,130,246,0.10)",
  rose: "#f43f5e",
  rSoft: "rgba(244,63,94,0.09)",
  rMid: "rgba(244,63,94,0.20)",
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
  nameBadge: {
    display: "inline-flex", alignItems: "center", gap: "6px",
    padding: "4px 12px", borderRadius: "20px",
    background: T.amSoft, color: T.amber,
    border: `1px solid ${T.amMid}`,
    fontSize: "13px", fontWeight: 700,
    textTransform: "capitalize" as const,
  },
  cellDate: {
    fontSize: "12.5px", color: T.txtDim, fontWeight: 500, whiteSpace: "nowrap" as const,
  },
  actionGroup: { display: "flex", alignItems: "center", gap: "6px" },
  actionBtn: {
    width: "34px", height: "34px", borderRadius: "9px",
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    border: `1.5px solid ${T.border}`, background: T.bg, cursor: "pointer",
  },
  paginationWrap: {
    padding: "16px 20px", borderTop: `1px solid ${T.border}`,
  },
};

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

const Impression = () => {
  const dispatch = useDispatch();
  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { impression, total } = useSelector((state: RootStore) => state.impression);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getImpression({ start: page, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleChangePage = (_: any, p: any) => setPage(p);
  const handleChangeRowsPerPage = (e: any) => { setRowsPerPage(parseInt(e, 10)); setPage(1); };

  const handleDelete = (id: string) => { setSelectedId(id); setShowDialog(true); };
  const confirmDelete = () => {
    if (selectedId) { dispatch(deleteImpression(selectedId)); setShowDialog(false); }
  };

  const formatDate = (d: string) => {
    const date = new Date(d);
    return isNaN(date.getTime()) ? "—"
      : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  };

  /* ── columns ── */
  const impressionTable = [
    {
      Header: "No",
      Cell: ({ index }: any) => (
        <span style={S.cellNo}>{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }: any) => (
        <span style={S.nameBadge}>
          ✦ {row?.name || "—"}
        </span>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: any) => (
        <span style={S.cellDate}>{formatDate(row?.createdAt)}</span>
      ),
    },
    {
      Header: "Updated At",
      Cell: ({ row }: any) => (
        <span style={S.cellDate}>{formatDate(row?.updatedAt)}</span>
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }: any) => (
        <div style={S.actionGroup}>
          <button
            style={S.actionBtn} title="Edit"
            onClick={() => dispatch(openDialog({ type: "impression", data: row }))}
            onMouseEnter={(e) => hoverIn(e, T.blSoft, T.blue)}
            onMouseLeave={hoverOut}
          >
            <img src={EditIcon.src} alt="Edit" width={16} height={16} />
          </button>
          <button
            style={S.actionBtn} title="Delete"
            onClick={() => handleDelete(row?._id)}
            onMouseEnter={(e) => hoverIn(e, T.rSoft, T.rose)}
            onMouseLeave={hoverOut}
          >
            <img src={TrashIcon.src} alt="Delete" width={16} height={16} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');
        .imp-page {
          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: #f4f5fb;
          min-height: 100vh;
          box-sizing: border-box;
        }
      `}</style>

      {dialogueType === "impression" && dialogue && <ImpressionDialog />}
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text="Delete"
      />

      <div className="imp-page">

        {/* ── Page header ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginBottom: "20px",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              width: "4px", height: "28px", borderRadius: "4px", flexShrink: 0,
              background: `linear-gradient(180deg, ${T.accent}, ${T.accent2})`,
            }} />
            <div>
              <h1 style={{
                fontFamily: "'Rajdhani', sans-serif", fontSize: "22px",
                fontWeight: 700, color: T.txtDark, margin: 0, lineHeight: 1.1,
              }}>Host Tags</h1>
              <p style={{ fontSize: "12px", color: T.txtDim, margin: 0, marginTop: "2px" }}>
                Manage all host impression tags
              </p>
            </div>
          </div>

          {/* Add button */}
          <button
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "10px 20px", borderRadius: "10px", border: "none",
              background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
              color: "#fff", fontFamily: "'Outfit', sans-serif",
              fontSize: "13.5px", fontWeight: 600, cursor: "pointer",
              boxShadow: `0 4px 14px ${T.aGlow}`,
            }}
            onClick={() => dispatch(openDialog({ type: "impression" }))}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 6px 20px ${T.aGlow}`;
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 4px 14px ${T.aGlow}`;
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Host Tag
          </button>
        </div>

        {/* ── Stats strip ── */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "14px",
          marginBottom: "18px",
        }}>
          {[
            {
              label: "Total Tags", val: total || 0,
              color: T.accent, soft: T.aSoft, mid: T.aMid,
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
            },
            {
              label: "This Page", val: impression?.length || 0,
              color: "#10b981", soft: "rgba(16,185,129,0.10)", mid: "rgba(16,185,129,0.20)",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>,
            },
            {
              label: "Per Page", val: rowsPerPage,
              color: T.amber, soft: T.amSoft, mid: T.amMid,
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></svg>,
            },
          ].map((s, i) => (
            <div key={i} style={{
              background: T.white, border: `1.5px solid ${T.border}`,
              borderRadius: "14px", padding: "16px",
              display: "flex", alignItems: "center", gap: "12px",
            }}>
              <div style={{
                width: "40px", height: "40px", borderRadius: "11px",
                display: "flex", alignItems: "center", justifyContent: "center",
                background: s.soft, color: s.color, flexShrink: 0,
              }}>
                {s.icon}
              </div>
              <div>
                <div style={{
                  fontFamily: "'Rajdhani', sans-serif", fontSize: "22px",
                  fontWeight: 700, color: T.txtDark, lineHeight: 1.1,
                }}>{s.val.toLocaleString()}</div>
                <div style={{ fontSize: "11.5px", color: T.txtDim, fontWeight: 500 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table card ── */}
        <div style={{
          background: T.white, border: `1px solid ${T.border}`,
          borderRadius: "16px", boxShadow: "0 2px 18px rgba(99,102,241,0.06)",
          overflow: "hidden",
        }}>
          {/* card header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "16px 20px", borderBottom: `1px solid ${T.border}`,
            background: "linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02))",
          }}>
            <span style={{
              fontFamily: "'Rajdhani', sans-serif", fontSize: "16px",
              fontWeight: 700, color: T.txtDark,
            }}>All Tags</span>
            <span style={{
              background: T.aSoft, color: T.accent,
              fontSize: "12px", fontWeight: 700,
              padding: "3px 10px", borderRadius: "20px",
              border: `1px solid ${T.aMid}`,
            }}>{total || 0} total</span>
          </div>

          {/* table */}
          <Table
            data={impression}
            mapData={impressionTable}
            PerPage={rowsPerPage}
            Page={page}
            type="server"
            shimmer={<ImpressionShimmer />}
          />

          {/* pagination */}
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

      </div>
    </>
  );
};

Impression.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Impression;