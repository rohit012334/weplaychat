import RootLayout from "@/component/layout/Layout";
import { RootStore } from "@/store/store";
import { useDispatch, useSelector } from "react-redux";
import { openDialog } from "@/store/dialogSlice";
import { useEffect, useState } from "react";
import edit from "@/assets/images/edit.svg";
import deleteIcon from "@/assets/images/delete.svg";
import UserShimmer from "@/component/Shimmer/UserShimmer";
import Table from "@/extra/Table";
import { deleteReseller, getReseller } from "@/store/userSlice";
import { baseURL } from "@/utils/config";
import { useRouter } from "next/router";
import male from "@/assets/images/male.png";
import ResellerDialog from "@/component/reseller/ResellerDialog";

const Reseller = (props: any) => {
    const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
    const router = useRouter();
    const dispatch = useDispatch();
    const { resellers } = useSelector((state: RootStore) => state.user);
    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [zoomImg, setZoomImg] = useState<string | null>(null);

    useEffect(() => { dispatch(getReseller({})); }, [dispatch]);

    const handleDelete = (row: any) => dispatch(deleteReseller(row._id));

    const userTable = [
        {
            Header: "No",
            Cell: ({ index }: { index: any }) => (
                <span className="rs-idx">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
            ),
        },
        {
            Header: "Reseller",
            body: "profilePic",
            Cell: ({ row }: { row: any }) => {
                const norm = (row?.image || "").replace(/\\/g, "/");
                const imageUrl = norm.includes("storage") ? baseURL + norm : norm;
                return (
                    <div className="rs-user-cell">
                        <div className="rs-av-wrap">
                            <img
                                src={row?.image ? imageUrl : male.src}
                                referrerPolicy="no-referrer"
                                alt="avatar"
                                className="rs-av"
                            />
                        </div>
                        <div>
                            <p className="rs-uname">{row?.name || "—"}</p>
                            <p className="rs-uid">#{row?.uid || "—"}</p>
                        </div>
                    </div>
                );
            },
        },
        {
            Header: "Email",
            Cell: ({ row }: { row: any }) => (
                <span className="rs-email">{row?.email || "—"}</span>
            ),
        },
        {
            Header: "Mobile",
            Cell: ({ row }: { row: any }) => (
                <div className="rs-mobile">
                    <span className="rs-mobile-icon">📱</span>
                    <span>{row?.mobile || "—"}</span>
                </div>
            ),
        },
        {
            Header: "Country",
            Cell: ({ row }: { row: any }) => (
                <div className="rs-country">
                    <span className="rs-country-dot" />
                    <span>{row?.country || "—"}</span>
                </div>
            ),
        },
        {
            Header: "Joined",
            Cell: ({ row }: { row: any }) => {
                const d = new Date(row?.createdAt);
                return (
                    <span className="rs-date">
                        {isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                );
            },
        },
        {
            Header: "ID Type",
            Cell: ({ row }: { row: any }) => (
                <span className="rs-id-type">{row?.nationalIdType || "—"}</span>
            ),
        },
        {
            Header: "ID Front",
            Cell: ({ row }: { row: any }) => {
                const img = row?.nationalIdImage?.front;
                const src = img ? (img.startsWith("http") ? img : baseURL + img) : null;
                return src ? (
                    <img src={src} className="rs-id-img" alt="front" onClick={() => setZoomImg(src)} />
                ) : <span className="rs-dim">—</span>;
            },
        },
        {
            Header: "ID Back",
            Cell: ({ row }: { row: any }) => {
                const img = row?.nationalIdImage?.back;
                const src = img ? (img.startsWith("http") ? img : baseURL + img) : null;
                return src ? (
                    <img src={src} className="rs-id-img" alt="back" onClick={() => setZoomImg(src)} />
                ) : <span className="rs-dim">—</span>;
            },
        },
        {
            Header: "Actions",
            Cell: ({ row }: { row: any }) => (
                <div className="rs-acts">
                    <button
                        className="rs-ab edit"
                        title="Edit Reseller"
                        onClick={() => dispatch(openDialog({ type: "reseller-form", data: row }))}
                    >
                        <img src={edit.src} height={16} width={16} alt="edit" />
                    </button>
                    <button
                        className="rs-ab del"
                        title="Delete Reseller"
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

        .rs-page {
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

        /* ── HERO BAR ── */
        .rs-page .rs-hero {
          background: var(--wh); border: 1px solid var(--bd); border-radius: 18px;
          padding: 16px 22px; margin-bottom: 18px;
          box-shadow: 0 2px 16px rgba(99,102,241,.06);
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 12px; position: relative; overflow: hidden;
        }
        .rs-page .rs-hero::before {
          content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: linear-gradient(180deg, var(--ac), var(--ac2));
          border-radius: 0 3px 3px 0;
        }
        .rs-page .rs-hero-l { display: flex; align-items: center; gap: 10px; padding-left: 10px; }
        .rs-page .rs-pill   { width: 4px; height: 22px; border-radius: 4px; flex-shrink: 0; background: linear-gradient(180deg,var(--ac),var(--ac2)); }
        .rs-page .rs-hero-title { font-family:'Rajdhani',sans-serif; font-size:20px; font-weight:700; color:var(--td); margin:0; }
        .rs-page .rs-hero-badge {
          background: var(--as); color: var(--ac); font-size:11.5px; font-weight:700;
          padding: 3px 11px; border-radius: 20px; border: 1px solid var(--am); white-space:nowrap;
        }
        .rs-page .rs-create-btn {
          display: inline-flex; align-items: center; gap: 7px;
          background: linear-gradient(135deg, var(--ac), var(--ac2));
          border: none; border-radius: 12px; padding: 10px 20px;
          font-family:'Outfit',sans-serif; font-size:13.5px; font-weight:700; color:#fff;
          cursor:pointer; white-space:nowrap;
          box-shadow: 0 3px 12px rgba(99,102,241,.28);
          transition: transform .13s, box-shadow .13s;
        }
        .rs-page .rs-create-btn:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(99,102,241,.36); }

        /* ── SUMMARY CARDS ── */
        .rs-page .rs-summary {
          display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; margin-bottom: 18px;
        }
        @media(max-width:640px){ .rs-page .rs-summary { grid-template-columns:1fr; } }

        .rs-page .rs-sum-card {
          background: var(--wh); border: 1.5px solid var(--bd); border-radius: 16px;
          padding: 16px 18px; display: flex; align-items: center; gap: 14px;
          box-shadow: 0 2px 10px rgba(99,102,241,.04);
          transition: box-shadow .15s, transform .13s;
        }
        .rs-page .rs-sum-card:hover { transform:translateY(-2px); box-shadow:0 6px 20px rgba(99,102,241,.10); }
        .rs-page .rs-sum-icon {
          width:44px; height:44px; border-radius:12px; flex-shrink:0;
          display:flex; align-items:center; justify-content:center; font-size:20px;
        }
        .rs-page .rs-sum-label { font-size:11px; font-weight:600; color:var(--dim); text-transform:uppercase; letter-spacing:.5px; margin:0 0 3px; }
        .rs-page .rs-sum-val   { font-family:'Rajdhani',sans-serif; font-size:26px; font-weight:700; color:var(--td); margin:0; line-height:1; }

        /* ── TABLE CARD ── */
        .rs-page .rs-card {
          background:var(--wh); border:1px solid var(--bd); border-radius:18px;
          box-shadow:0 2px 18px rgba(99,102,241,.06); overflow:hidden;
        }
        .rs-page .rs-card-head {
          padding:13px 22px; border-bottom:1px solid var(--bd);
          background:linear-gradient(135deg,rgba(99,102,241,.04),rgba(168,85,247,.02));
          display:flex; align-items:center; justify-content:space-between;
        }
        .rs-page .rs-card-title { font-family:'Rajdhani',sans-serif; font-size:15px; font-weight:700; color:var(--td); }

        /* THEAD */
        .rs-page .rs-tbody table { width:100% !important; border-collapse:collapse !important; }
        .rs-page .rs-tbody thead th,
        .rs-page .rs-tbody thead td {
          background:#f8f8fc !important; color:var(--dim) !important;
          font-family:'Outfit',sans-serif !important; font-size:10.5px !important;
          font-weight:700 !important; text-transform:uppercase !important;
          letter-spacing:.7px !important; padding:11px 16px !important;
          border-bottom:1.5px solid var(--bd) !important; border-top:none !important; white-space:nowrap !important;
        }
        .rs-page .rs-tbody tbody tr { border-bottom:1px solid #f1f3f9 !important; transition:background .12s !important; }
        .rs-page .rs-tbody tbody tr:hover { background:rgba(99,102,241,.025) !important; }
        .rs-page .rs-tbody tbody tr:last-child { border-bottom:none !important; }
        .rs-page .rs-tbody tbody td {
          padding:10px 16px !important; font-family:'Outfit',sans-serif !important;
          font-size:13px !important; color:var(--td) !important;
          vertical-align:middle !important; border:none !important;
        }

        /* CELL STYLES */
        .rs-idx { font-size:12px; font-weight:700; color:var(--dim); background:var(--bg); border-radius:7px; padding:4px 9px; display:inline-block; }

        .rs-user-cell { display:flex; align-items:center; gap:10px; min-width:170px; }
        .rs-av-wrap   { position:relative; flex-shrink:0; }
        .rs-av {
          width:40px; height:40px; border-radius:50%; object-fit:cover;
          border:2px solid var(--bd);
          box-shadow:0 2px 8px rgba(99,102,241,.10);
          transition:box-shadow .15s;
        }
        .rs-user-cell:hover .rs-av { box-shadow:0 0 0 3px var(--am); }
        .rs-uname { font-size:13.5px; font-weight:600; color:var(--td); margin:0 0 2px; white-space:nowrap; }
        .rs-uid   { font-size:11px; color:var(--dim); margin:0; }

        .rs-email  { font-size:12.5px; color:var(--tx); max-width:180px; display:inline-block; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }

        .rs-mobile { display:flex; align-items:center; gap:6px; font-size:13px; color:var(--td); font-weight:500; }
        .rs-mobile-icon { font-size:14px; }

        .rs-country { display:flex; align-items:center; gap:7px; font-size:13px; color:var(--td); font-weight:500; white-space:nowrap; }
        .rs-country-dot { width:8px; height:8px; border-radius:50%; flex-shrink:0; background:linear-gradient(135deg,var(--ac),var(--ac2)); }

        .rs-date { font-size:12px; color:var(--tx); white-space:nowrap; }

        /* ACTIONS */
        .rs-acts { display:flex; align-items:center; gap:6px; }
        .rs-ab   { width:32px; height:32px; border-radius:9px; display:flex; align-items:center; justify-content:center; border:none; cursor:pointer; flex-shrink:0; transition:transform .12s,box-shadow .12s; }
        .rs-ab:hover { transform:translateY(-2px); }
        .rs-ab.edit { background:#e0e7ff; } .rs-ab.edit:hover { box-shadow:0 3px 10px rgba(99,102,241,.28); }
        .rs-ab.del  { background:#ffe4e6; } .rs-ab.del:hover  { box-shadow:0 3px 10px rgba(244,63,94,.24); }

        /* EMPTY */
        .rs-page .rs-empty { text-align:center; padding:52px 20px; display:flex; flex-direction:column; align-items:center; gap:10px; }
        .rs-page .rs-empty-icon { width:52px; height:52px; border-radius:16px; background:var(--as); display:flex; align-items:center; justify-content:center; font-size:24px; }
        .rs-page .rs-empty-title { font-family:'Rajdhani',sans-serif; font-size:17px; font-weight:700; color:var(--td); }
        .rs-page .rs-empty-sub   { font-size:13px; color:var(--dim); }

        /* ID Styles */
        .rs-id-type { font-size: 11px; font-weight: 700; text-transform: uppercase; color: var(--ac); background: var(--as); padding: 3px 8px; border-radius: 6px; }
        .rs-id-img { width: 45px; height: 32px; border-radius: 6px; object-fit: cover; border: 1.5px solid var(--bd); cursor: pointer; transition: transform .2s; }
        .rs-id-img:hover { transform: scale(1.1); border-color: var(--ac); }
        .rs-dim { color: var(--dim); font-size: 12px; }

        /* Zoom Overlay */
        .rs-zoom-ov {
          position: fixed; inset: 0; z-index: 2000;
          background: rgba(0,0,0,0.85); backdrop-filter: blur(8px);
          display: flex; align-items: center; justify-content: center;
          padding: 40px; cursor: zoom-out; animation: rs-zoom-in .2s ease;
        }
        @keyframes rs-zoom-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        .rs-zoom-img { max-width: 90%; max-height: 90%; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); object-fit: contain; }
        .rs-zoom-close { position: absolute; top: 20px; right: 24px; color: #fff; font-size: 30px; font-weight: 300; cursor: pointer; }
      `}</style>

            <div className="rs-page">
                {dialogueType === "reseller-form" && <ResellerDialog />}

                {zoomImg && (
                  <div className="rs-zoom-ov" onClick={() => setZoomImg(null)}>
                    <span className="rs-zoom-close">&times;</span>
                    <img src={zoomImg} className="rs-zoom-img" alt="zoomed" />
                  </div>
                )}

                {/* ── HERO BAR ── */}
                <div className="rs-hero">
                    <div className="rs-hero-l">
                        <div className="rs-pill" />
                        <h1 className="rs-hero-title">Reseller Management</h1>
                        <span className="rs-hero-badge">{resellers?.length || 0} Resellers</span>
                    </div>
                    <button
                        className="rs-create-btn"
                        onClick={() => dispatch(openDialog({ type: "reseller-form", data: null }))}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Create Reseller
                    </button>
                </div>

                {/* ── SUMMARY CARDS ── */}
                <div className="rs-summary">
                    {[
                        {
                            icon: "🏪", label: "Total Resellers", val: resellers?.length || 0,
                            bg: "rgba(99,102,241,.10)"
                        },
                        {
                            icon: "🌍", label: "Countries",
                            val: [...new Set(resellers?.map((r: any) => r?.country).filter(Boolean))].length || 0,
                            bg: "rgba(16,185,129,.10)"
                        },
                        {
                            icon: "📅", label: "This Month",
                            val: resellers?.filter((r: any) => {
                                const d = new Date(r?.createdAt);
                                const now = new Date();
                                return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                            }).length || 0,
                            bg: "rgba(245,158,11,.10)"
                        },
                    ].map((c, i) => (
                        <div className="rs-sum-card" key={i}>
                            <div className="rs-sum-icon" style={{ background: c.bg }}>{c.icon}</div>
                            <div>
                                <p className="rs-sum-label">{c.label}</p>
                                <p className="rs-sum-val">{c.val}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* ── TABLE CARD ── */}
                <div className="rs-card">
                    <div className="rs-card-head">
                        <span className="rs-card-title">All Resellers</span>
                    </div>
                    <div className="rs-tbody">
                        {resellers?.length === 0 ? (
                            <div className="rs-empty">
                                <div className="rs-empty-icon">🏪</div>
                                <p className="rs-empty-title">No Resellers Yet</p>
                                <p className="rs-empty-sub">Create your first reseller using the button above.</p>
                            </div>
                        ) : (
                            <Table
                                data={resellers}
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

Reseller.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};

export default Reseller;