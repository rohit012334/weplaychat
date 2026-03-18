import RootLayout from "@/component/layout/Layout";
import { RootStore } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { openDialog } from "@/store/dialogSlice";
import AdminFormDialog from "@/component/user/AdminFormDialog";
import { useEffect, useState } from "react";
import { deleteAdminUser, getAdminUser } from "@/store/userSlice";
import edit from "@/assets/images/edit.svg";
import deleteIcon from "@/assets/images/delete.svg";
import UserShimmer from "@/component/Shimmer/UserShimmer";
import Table from "@/extra/Table";
import { baseURL } from "@/utils/config";

const ROLE_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
    superadmin: { label: "Super Admin", color: "#6366f1", bg: "rgba(99,102,241,0.10)" },
    admin: { label: "Admin", color: "#10b981", bg: "rgba(16,185,129,0.10)" },
    manager: { label: "Manager", color: "#f59e0b", bg: "rgba(245,158,11,0.10)" },
};

const Admin = (props: any) => {
    const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
    const dispatch = useDispatch();
    const { admins } = useSelector((state: RootStore) => state.user);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [zoomImg, setZoomImg] = useState<string | null>(null);

    useEffect(() => { dispatch(getAdminUser({})); }, [dispatch]);

    const handleEdit = (row: any) => dispatch(openDialog({ type: "admin-form", data: row }));
    const handleDelete = (row: any) => dispatch(deleteAdminUser(row._id));

    const userTable = [
        {
            Header: "No",
            Cell: ({ index }: { index: any }) => (
                <span className="ad-idx">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
            ),
        },
        {
            Header: "Admin",
            Cell: ({ row }: { row: any }) => {
                const initials = (row?.name || "A").split(" ").map((w: string) => w[0]).slice(0, 2).join("").toUpperCase();
                return (
                    <div className="ad-name-cell">
                        <div className="ad-avatar">{initials}</div>
                        <div>
                            <p className="ad-name">{row?.name || "—"}</p>
                            <p className="ad-email-sm">{row?.email || "—"}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            Header: "Email",
            Cell: ({ row }: { row: any }) => (
                <span className="ad-email">{row?.email || "—"}</span>
            ),
        },
        {
            Header: "Role",
            Cell: ({ row }: { row: any }) => {
                const role = row?.role?.toLowerCase() || "";
                const cfg = ROLE_CONFIG[role] || { label: row?.role || "—", color: "#64748b", bg: "rgba(100,116,139,0.09)" };
                return (
                    <span className="ad-role-pill" style={{ color: cfg.color, background: cfg.bg }}>
                        {cfg.label}
                    </span>
                );
            },
        },
        {
            Header: "Created At",
            Cell: ({ row }: { row: any }) => {
                const d = new Date(row?.createdAt);
                return (
                    <span className="ad-date">
                        {isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                );
            },
        },
        {
            Header: "ID Type",
            Cell: ({ row }: { row: any }) => (
                <span className="ad-id-type">{row?.nationalIdType || "—"}</span>
            ),
        },
        {
            Header: "ID Front",
            Cell: ({ row }: { row: any }) => {
                const img = row?.nationalIdImage?.front;
                const src = img ? (img.startsWith("http") ? img : baseURL + img) : null;
                return src ? (
                    <img src={src} className="ad-id-img" alt="front" onClick={() => setZoomImg(src)} />
                ) : <span className="ad-dim">—</span>;
            },
        },
        {
            Header: "ID Back",
            Cell: ({ row }: { row: any }) => {
                const img = row?.nationalIdImage?.back;
                const src = img ? (img.startsWith("http") ? img : baseURL + img) : null;
                return src ? (
                    <img src={src} className="ad-id-img" alt="back" onClick={() => setZoomImg(src)} />
                ) : <span className="ad-dim">—</span>;
            },
        },
        {
            Header: "Actions",
            Cell: ({ row }: { row: any }) => (
                <div className="ad-acts">
                    <button className="ad-ab edit" title="Edit Admin" onClick={() => handleEdit(row)}>
                        <img src={edit.src} height={16} width={16} alt="edit" />
                    </button>
                    <button className="ad-ab del" title="Delete Admin" onClick={() => handleDelete(row)}>
                        <img src={deleteIcon.src} height={16} width={16} alt="delete" />
                    </button>
                </div>
            ),
        },
    ];

    // Role summary counts
    const superCount = admins?.filter((a: any) => a?.role?.toLowerCase() === "superadmin").length || 0;
    const adminCount = admins?.filter((a: any) => a?.role?.toLowerCase() === "admin").length || 0;
    const managerCount = admins?.filter((a: any) => a?.role?.toLowerCase() === "manager").length || 0;

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .ad-page {
          --ac:  #6366f1; --ac2: #a855f7;
          --as:  rgba(99,102,241,0.09); --am: rgba(99,102,241,0.16); --ag: rgba(99,102,241,0.20);
          --bd:  #e8eaf2; --tx: #64748b; --td: #1e2235; --dim: #a0a8c0;
          --wh:  #ffffff; --bg: #f4f5fb; --gn: #10b981; --rd: #f43f5e; --am2: #f59e0b;
          font-family: 'Outfit', sans-serif;
          padding: 24px 24px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── HERO BAR ── */
        .ad-page .ad-hero {
          background: var(--wh);
          border: 1px solid var(--bd);
          border-radius: 18px;
          padding: 16px 22px;
          margin-bottom: 18px;
          box-shadow: 0 2px 16px rgba(99,102,241,.06);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px;
          position: relative; overflow: hidden;
        }
        .ad-page .ad-hero::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: linear-gradient(180deg, var(--ac), var(--ac2));
          border-radius: 0 3px 3px 0;
        }
        .ad-page .ad-hero-l { display: flex; align-items: center; gap: 10px; padding-left: 10px; }
        .ad-page .ad-pill   { width: 4px; height: 22px; border-radius: 4px; flex-shrink: 0; background: linear-gradient(180deg,var(--ac),var(--ac2)); }
        .ad-page .ad-hero-title { font-family: 'Rajdhani',sans-serif; font-size: 20px; font-weight: 700; color: var(--td); margin: 0; }
        .ad-page .ad-hero-badge {
          background: var(--as); color: var(--ac); font-size: 11.5px; font-weight: 700;
          padding: 3px 11px; border-radius: 20px; border: 1px solid var(--am); white-space: nowrap;
        }
        .ad-page .ad-create-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, var(--ac), var(--ac2));
          border: none; border-radius: 12px; padding: 10px 20px;
          font-family: 'Outfit',sans-serif; font-size: 13.5px; font-weight: 700; color: #fff;
          cursor: pointer; white-space: nowrap;
          box-shadow: 0 3px 12px rgba(99,102,241,.28);
          transition: transform .13s, box-shadow .13s;
        }
        .ad-page .ad-create-btn:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,.36); }

        /* ── SUMMARY CARDS ── */
        .ad-page .ad-summary {
          display: grid; grid-template-columns: repeat(3, 1fr);
          gap: 14px; margin-bottom: 18px;
        }
        @media(max-width:640px){ .ad-page .ad-summary { grid-template-columns: 1fr; } }

        .ad-page .ad-sum-card {
          background: var(--wh); border: 1.5px solid var(--bd);
          border-radius: 16px; padding: 16px 18px;
          display: flex; align-items: center; gap: 14px;
          box-shadow: 0 2px 10px rgba(99,102,241,.04);
          transition: box-shadow .15s, transform .13s;
        }
        .ad-page .ad-sum-card:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(99,102,241,.10); }
        .ad-page .ad-sum-icon {
          width: 44px; height: 44px; border-radius: 12px; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; font-size: 20px;
        }
        .ad-page .ad-sum-label { font-size: 11px; font-weight: 600; color: var(--dim); text-transform: uppercase; letter-spacing: .5px; margin: 0 0 3px; }
        .ad-page .ad-sum-val   { font-family: 'Rajdhani',sans-serif; font-size: 26px; font-weight: 700; color: var(--td); margin: 0; line-height: 1; }

        /* ── TABLE CARD ── */
        .ad-page .ad-card {
          background: var(--wh); border: 1px solid var(--bd);
          border-radius: 18px; box-shadow: 0 2px 18px rgba(99,102,241,.06); overflow: hidden;
        }
        .ad-page .ad-card-head {
          padding: 13px 22px; border-bottom: 1px solid var(--bd);
          background: linear-gradient(135deg, rgba(99,102,241,.04), rgba(168,85,247,.02));
          display: flex; align-items: center; justify-content: space-between;
        }
        .ad-page .ad-card-title { font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:700; color:var(--td); }

        /* THEAD */
        .ad-page .ad-tbody table  { width:100% !important; border-collapse:collapse !important; }
        .ad-page .ad-tbody thead th,
        .ad-page .ad-tbody thead td {
          background: #f8f8fc !important; color: var(--dim) !important;
          font-family: 'Outfit',sans-serif !important; font-size:10.5px !important;
          font-weight:700 !important; text-transform:uppercase !important;
          letter-spacing:.7px !important; padding:11px 16px !important;
          border-bottom:1.5px solid var(--bd) !important; border-top:none !important; white-space:nowrap !important;
        }
        .ad-page .ad-tbody tbody tr { border-bottom:1px solid #f1f3f9 !important; transition:background .12s !important; }
        .ad-page .ad-tbody tbody tr:hover { background:rgba(99,102,241,.025) !important; }
        .ad-page .ad-tbody tbody tr:last-child { border-bottom:none !important; }
        .ad-page .ad-tbody tbody td {
          padding:10px 16px !important; font-family:'Outfit',sans-serif !important;
          font-size:13px !important; color:var(--td) !important;
          vertical-align:middle !important; border:none !important;
        }

        /* CELL STYLES */
        .ad-idx { font-size:12px; font-weight:700; color:var(--dim); background:var(--bg); border-radius:7px; padding:4px 9px; display:inline-block; }

        .ad-name-cell { display:flex; align-items:center; gap:10px; min-width:170px; }
        .ad-avatar {
          width:36px; height:36px; border-radius:50%; flex-shrink:0;
          background:linear-gradient(135deg,var(--ac),var(--ac2));
          color:#fff; font-size:12px; font-weight:700;
          display:flex; align-items:center; justify-content:center;
          box-shadow:0 2px 8px rgba(99,102,241,.22); text-transform:uppercase;
        }
        .ad-name     { font-size:13.5px; font-weight:600; color:var(--td); margin:0 0 1px; white-space:nowrap; }
        .ad-email-sm { font-size:11px; color:var(--dim); margin:0; white-space:nowrap; max-width:160px; overflow:hidden; text-overflow:ellipsis; }
        .ad-email    { font-size:12.5px; color:var(--tx); max-width:180px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .ad-role-pill { display:inline-block; font-size:11px; font-weight:700; padding:4px 11px; border-radius:20px; white-space:nowrap; }
        .ad-date      { font-size:12px; color:var(--tx); white-space:nowrap; }

        /* ACTIONS */
        .ad-acts { display:flex; align-items:center; gap:6px; }
        .ad-ab   { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer; flex-shrink:0; transition:transform .12s,box-shadow .12s; }
        .ad-ab:hover { transform:translateY(-2px); }
        .ad-ab.edit { background:#e0e7ff; } .ad-ab.edit:hover { box-shadow:0 3px 10px rgba(99,102,241,.28); }
        .ad-ab.del  { background:#ffe4e6; } .ad-ab.del:hover  { box-shadow:0 3px 10px rgba(244,63,94,.24); }

        /* EMPTY */
        .ad-page .ad-empty { text-align:center; padding:52px 20px; display:flex; flex-direction:column; align-items:center; gap:10px; }
        .ad-page .ad-empty-icon { width:52px; height:52px; border-radius:16px; background:var(--as); display:flex; align-items:center; justify-content:center; font-size:24px; }
        .ad-page .ad-empty-title { font-family:'Rajdhani',sans-serif; font-size:17px; font-weight:700; color:var(--td); }
        .ad-page .ad-empty-sub   { font-size:13px; color:var(--dim); }

        /* ID Styles */
        .ad-id-type { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--ac); background: var(--as); padding: 3px 8px; border-radius: 6px; }
        .ad-id-img { width: 45px; height: 32px; border-radius: 6px; object-fit: cover; border: 1.5px solid var(--bd); cursor: pointer; transition: transform .2s; }
        .ad-id-img:hover { transform: scale(1.1); border-color: var(--ac); }
        .ad-dim { color: var(--dim); font-size: 12px; }

        /* Zoom Overlay */
        .ad-zoom-ov {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 40px; cursor: zoom-out; animation: ad-zoom-in .2s ease;
        }
        @keyframes ad-zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .ad-zoom-img { max-width: 90%; max-height: 90%; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); object-fit: contain; }
        .ad-zoom-close { position: absolute; top: 20px; right: 24px; color: #fff; font-size: 30px; font-weight: 300; cursor: pointer; }
      `}</style>

            <div className="ad-page">
                {dialogueType === "admin-form" && <AdminFormDialog />}
                
                {zoomImg && (
                  <div className="ad-zoom-ov" onClick={() => setZoomImg(null)}>
                    <span className="ad-zoom-close">&times;</span>
                    <img src={zoomImg} className="ad-zoom-img" alt="zoomed" />
                  </div>
                )}

                {/* ── HERO BAR ── */}
                <div className="ad-hero">
                    <div className="ad-hero-l">
                        <div className="ad-pill" />
                        <h1 className="ad-hero-title">Admin Management</h1>
                        <span className="ad-hero-badge">{admins?.length || 0} Admins</span>
                    </div>
                    <button className="ad-create-btn" onClick={() => dispatch(openDialog({ type: "admin-form", data: null }))}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create Admin
                    </button>
                </div>

                {/* ── SUMMARY CARDS ── */}
                <div className="ad-summary">
                    {[
                        { icon: "🛡️", label: "Super Admins", val: superCount, iconBg: "rgba(99,102,241,.10)" },
                        { icon: "👤", label: "Admins", val: adminCount, iconBg: "rgba(16,185,129,.10)" },
                        { icon: "🏢", label: "Managers", val: managerCount, iconBg: "rgba(245,158,11,.10)" },
                    ].map((c, i) => (
                        <div className="ad-sum-card" key={i}>
                            <div className="ad-sum-icon" style={{ background: c.iconBg }}>{c.icon}</div>
                            <div>
                                <p className="ad-sum-label">{c.label}</p>
                                <p className="ad-sum-val">{c.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── TABLE CARD ── */}
                <div className="ad-card">
                    <div className="ad-card-head">
                        <span className="ad-card-title">All Admins</span>
                    </div>

                    <div className="ad-tbody">
                        {admins?.length === 0 ? (
                            <div className="ad-empty">
                                <div className="ad-empty-icon">🛡️</div>
                                <p className="ad-empty-title">No Admins Yet</p>
                                <p className="ad-empty-sub">Create your first admin using the button above.</p>
                            </div>
                        ) : (
                            <Table
                                data={admins}
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

Admin.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};

export default Admin;