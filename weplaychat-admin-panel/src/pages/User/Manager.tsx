import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import image from "@/assets/images/user.png";
import { RootStore } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { openDialog } from "@/store/dialogSlice";
import { useEffect, useState } from "react";
import { deleteManagerUser, getManagerUser } from "@/store/userSlice";
import Pagination from "@/extra/Pagination";
import edit from "@/assets/images/edit.svg";
import deleteIcon from "@/assets/images/delete.svg";
import UserShimmer from "@/component/Shimmer/UserShimmer";
import Table from "@/extra/Table";
import ManagerDialog from "@/component/manager/ManagerDialog";
import { baseURL } from "@/utils/config";

const Manager = (props: any) => {
  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const dispatch = useDispatch();
  const { managers } = useSelector((state: RootStore) => state.user);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [zoomImg, setZoomImg] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getManagerUser({}));
  }, [dispatch]);

  const handleDelete = (row: any) => dispatch(deleteManagerUser(row._id));

  const userTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="mg-idx">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }: { row: any }) => (
        <div className="mg-name-cell">
          <div className="mg-avatar">
            {row?.name ? row.name.charAt(0).toUpperCase() : "M"}
          </div>
          <div className="mg-name-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span className="mg-name-txt">{row?.name || "—"}</span>
            <span className="mg-uid-sm" style={{ fontSize: '11px', color: 'var(--ac)', fontWeight: '600' }}>
              {row?.uniqueId ? row.uniqueId : ''}
            </span>
          </div>
        </div>
      ),
    },
    {
      Header: "Email",
      Cell: ({ row }: { row: any }) => (
        <span className="mg-email">{row?.email || "—"}</span>
      ),
    },
    {
      Header: "Country",
      Cell: ({ row }: { row: any }) => (
        <div className="mg-country">
          <span className="mg-country-dot" />
          <span>{row?.country || "—"}</span>
        </div>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        const formatted = isNaN(date.getTime())
          ? "—"
          : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        return <span className="mg-date">{formatted}</span>;
      },
    },
    {
      Header: "ID Type",
      Cell: ({ row }: { row: any }) => (
        <span className="mg-id-type">{row?.nationalIdType || "—"}</span>
      ),
    },
    {
      Header: "ID Front",
      Cell: ({ row }: { row: any }) => {
        const img = row?.nationalIdImage?.front;
        const src = img ? (img.startsWith("http") ? img : baseURL + img) : null;
        return src ? (
          <img src={src} className="mg-id-img" alt="front" onClick={() => setZoomImg(src)} />
        ) : <span className="mg-dim">—</span>;
      },
    },
    {
      Header: "ID Back",
      Cell: ({ row }: { row: any }) => {
        const img = row?.nationalIdImage?.back;
        const src = img ? (img.startsWith("http") ? img : baseURL + img) : null;
        return src ? (
          <img src={src} className="mg-id-img" alt="back" onClick={() => setZoomImg(src)} />
        ) : <span className="mg-dim">—</span>;
      },
    },
    {
      Header: "Actions",
      Cell: ({ row }: { row: any }) => (
        <div className="mg-acts">
          <button
            className="mg-ab edit"
            title="Edit Manager"
            onClick={() => dispatch(openDialog({ type: "manager-form", data: row }))}
          >
            <img src={edit.src} height={16} width={16} alt="edit" />
          </button>
          <button
            className="mg-ab del"
            title="Delete Manager"
            onClick={() => handleDelete(row)}
          >
            <img src={deleteIcon.src} height={16} width={16} alt="delete" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .mg-page {
          --ac:  #6366f1; --ac2: #a855f7;
          --as:  rgba(99,102,241,0.09); --am: rgba(99,102,241,0.16); --ag: rgba(99,102,241,0.20);
          --bd:  #e8eaf2; --tx: #64748b; --td: #1e2235; --dim: #a0a8c0;
          --wh:  #ffffff; --bg: #f4f5fb; --gn: #10b981; --rd: #f43f5e;
          font-family: 'Outfit', sans-serif;
          padding: 24px 24px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── TOP BAR ── */
        .mg-page .mg-hero {
          background: var(--wh);
          border: 1px solid var(--bd);
          border-radius: 18px;
          padding: 16px 22px;
          margin-bottom: 18px;
          box-shadow: 0 2px 16px rgba(99,102,241,.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        .mg-page .mg-hero::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: linear-gradient(180deg, var(--ac), var(--ac2));
          border-radius: 0 3px 3px 0;
        }
        .mg-page .mg-hero-l {
          display: flex; align-items: center; gap: 10px; padding-left: 10px;
        }
        .mg-page .mg-pill {
          width: 4px; height: 22px; border-radius: 4px; flex-shrink: 0;
          background: linear-gradient(180deg, var(--ac), var(--ac2));
        }
        .mg-page .mg-hero-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px; font-weight: 700; color: var(--td); margin: 0;
        }
        .mg-page .mg-hero-badge {
          background: var(--as); color: var(--ac);
          font-size: 11.5px; font-weight: 700;
          padding: 3px 11px; border-radius: 20px;
          border: 1px solid var(--am); white-space: nowrap;
        }

        /* create button override */
        .mg-page .mg-create-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, var(--ac), var(--ac2));
          border: none; border-radius: 12px;
          padding: 10px 20px;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 700; color: #fff;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 3px 12px rgba(99,102,241,.28);
          transition: transform .13s, box-shadow .13s;
        }
        .mg-page .mg-create-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99,102,241,.36);
        }
        .mg-page .mg-create-btn svg { flex-shrink: 0; }

        /* ── TABLE CARD ── */
        .mg-page .mg-card {
          background: var(--wh);
          border: 1px solid var(--bd);
          border-radius: 18px;
          box-shadow: 0 2px 18px rgba(99,102,241,.06);
          overflow: hidden;
        }
        .mg-page .mg-card-head {
          padding: 13px 22px;
          border-bottom: 1px solid var(--bd);
          background: linear-gradient(135deg, rgba(99,102,241,.04), rgba(168,85,247,.02));
          display: flex; align-items: center; justify-content: space-between;
        }
        .mg-page .mg-card-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 700; color: var(--td);
        }

        /* ── THEAD ── */
        .mg-page .mg-tbody table { width: 100% !important; border-collapse: collapse !important; }
        .mg-page .mg-tbody thead th,
        .mg-page .mg-tbody thead td {
          background: #f8f8fc !important;
          color: var(--dim) !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 10.5px !important; font-weight: 700 !important;
          text-transform: uppercase !important; letter-spacing: .7px !important;
          padding: 11px 16px !important;
          border-bottom: 1.5px solid var(--bd) !important;
          border-top: none !important; white-space: nowrap !important;
        }
        .mg-page .mg-tbody tbody tr {
          border-bottom: 1px solid #f1f3f9 !important;
          transition: background .12s !important;
        }
        .mg-page .mg-tbody tbody tr:hover { background: rgba(99,102,241,.025) !important; }
        .mg-page .mg-tbody tbody tr:last-child { border-bottom: none !important; }
        .mg-page .mg-tbody tbody td {
          padding: 10px 16px !important;
          font-family: 'Outfit', sans-serif !important;
          font-size: 13px !important; color: var(--td) !important;
          vertical-align: middle !important; border: none !important;
        }

        /* ── CELL STYLES ── */
        .mg-idx {
          font-size: 12px; font-weight: 700; color: var(--dim);
          background: var(--bg); border-radius: 7px;
          padding: 4px 9px; display: inline-block;
        }

        .mg-name-cell {
          display: flex; align-items: center; gap: 10px; min-width: 140px;
        }
        .mg-avatar {
          width: 34px; height: 34px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--ac), var(--ac2));
          color: #fff; font-size: 13px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 2px 8px rgba(99,102,241,.22);
          text-transform: uppercase;
        }
        .mg-name-txt {
          font-size: 13.5px; font-weight: 600; color: var(--td);
          white-space: nowrap;
        }

        .mg-email {
          font-size: 12.5px; color: var(--tx);
          max-width: 200px; display: inline-block;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .mg-country {
          display: flex; align-items: center; gap: 7px;
          font-size: 13px; color: var(--td); font-weight: 500;
        }
        .mg-country-dot {
          width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0;
          background: linear-gradient(135deg, var(--ac), var(--ac2));
        }

        .mg-date { font-size: 12px; color: var(--tx); white-space: nowrap; }

        /* action buttons */
        .mg-acts { display: flex; align-items: center; gap: 6px; }
        .mg-ab {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer; flex-shrink: 0;
          transition: transform .12s, box-shadow .12s;
        }
        .mg-ab:hover { transform: translateY(-2px); }
        .mg-ab.edit { background: #e0e7ff; }
        .mg-ab.edit:hover { box-shadow: 0 3px 10px rgba(99,102,241,.28); }
        .mg-ab.del  { background: #ffe4e6; }
        .mg-ab.del:hover  { box-shadow: 0 3px 10px rgba(244,63,94,.24); }

        /* empty state */
        .mg-page .mg-empty {
          text-align: center; padding: 52px 20px;
          display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .mg-page .mg-empty-icon {
          width: 52px; height: 52px; border-radius: 16px;
          background: var(--as); display: flex; align-items: center; justify-content: center;
          font-size: 24px;
        }
        .mg-page .mg-empty-title {
          font-family: 'Rajdhani', sans-serif; font-size: 17px; font-weight: 700; color: var(--td);
        }
        .mg-page .mg-empty-sub { font-size: 13px; color: var(--dim); }

        /* ID Styles */
        .mg-id-type { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--ac); background: var(--as); padding: 3px 8px; border-radius: 6px; }
        .mg-id-img { width: 45px; height: 32px; border-radius: 6px; object-fit: cover; border: 1.5px solid var(--bd); cursor: pointer; transition: transform .2s; }
        .mg-id-img:hover { transform: scale(1.1); border-color: var(--ac); }
        .mg-dim { color: var(--dim); font-size: 12px; }

        /* Zoom Overlay */
        .mg-zoom-ov {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(0,0,0,0.80); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 40px; cursor: zoom-out; animation: mg-zoom-in .2s ease;
        }
        @keyframes mg-zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .mg-zoom-img { max-width: 90%; max-height: 90%; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); object-fit: contain; }
        .mg-zoom-close { position: absolute; top: 20px; right: 24px; color: #fff; font-size: 30px; font-weight: 300; cursor: pointer; }
      `}</style>

      <div className="mg-page">
        {dialogueType === "manager-form" && <ManagerDialog />}

        {zoomImg && (
          <div className="mg-zoom-ov" onClick={() => setZoomImg(null)}>
            <span className="mg-zoom-close">&times;</span>
            <img src={zoomImg} className="mg-zoom-img" alt="zoomed" />
          </div>
        )}

        {/* ── HERO BAR ── */}
        <div className="mg-hero">
          <div className="mg-hero-l">
            <div className="mg-pill" />
            <h1 className="mg-hero-title">Manager</h1>
            <span className="mg-hero-badge">
              {(managers?.length || 0)} Managers
            </span>
          </div>

          {/* Custom create button */}
          <button
            className="mg-create-btn"
            onClick={() => dispatch(openDialog({ type: "manager-form", data: null }))}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Create Manager
          </button>
        </div>

        {/* ── TABLE CARD ── */}
        <div className="mg-card">
          <div className="mg-card-head">
            <span className="mg-card-title">All Managers</span>
          </div>

          <div className="mg-tbody">
            {managers?.length === 0 ? (
              <div className="mg-empty">
                <div className="mg-empty-icon">👤</div>
                <p className="mg-empty-title">No Managers Yet</p>
                <p className="mg-empty-sub">Create your first manager using the button above.</p>
              </div>
            ) : (
              <Table
                data={managers}
                mapData={userTable}
                PerPage={rowsPerPage}
                Page={page}
                type="server"
                shimmer={<UserShimmer />}
              />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

Manager.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Manager;