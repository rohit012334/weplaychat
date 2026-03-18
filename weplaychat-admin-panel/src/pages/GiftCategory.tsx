import GiftCategoryDialog from "@/component/giftCategory/GiftCategoryDialog";
import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { deleteGiftCategory, getGiftCategory } from "@/store/giftSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import EditIcon from "@/assets/images/edit.svg";
import TrashIcon from "@/assets/images/delete.svg";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import CommonDialog from "@/utils/CommonDialog";
import ImpressionShimmer from "@/component/Shimmer/ImpressionShimmer";

interface BannerData {
  _id: string;
  image: string;
  isActive: false;
}

const GiftCategory = () => {
  const { dialogue, dialogueType } = useSelector(
    (state: RootStore) => state.dialogue
  );

  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const { giftCategory, totalGiftCategory } = useSelector(
    (state: RootStore) => state.gift
  );

  const dispatch = useAppDispatch();

  const [data, setData] = useState<any[]>([]);
  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page, setPage] = useState<any>(1);

  useEffect(() => {
    const payload: any = { start: page, limit: rowsPerPage };
    dispatch(getGiftCategory(payload));
  }, [dispatch, page, rowsPerPage]);

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  const handleDelete = (id: any) => {
    setSelectedId(id);
    setShowDialog(true);
  };

  const confirmDelete = async () => {
    if (selectedId) {
      dispatch(deleteGiftCategory(selectedId));
      setShowDialog(false);
    }
  };

  const bannerTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="gc-cell-no">
          {(page - 1) * rowsPerPage + parseInt(index) + 1}
        </span>
      ),
    },
    {
      Header: "Name",
      Cell: ({ row }: { row: any }) => (
        <div className="gc-name-cell">
          <div className="gc-name-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <polyline points="20 12 20 22 4 22 4 12"/>
              <rect x="2" y="7" width="20" height="5"/>
              <line x1="12" y1="22" x2="12" y2="7"/>
              <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
              <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
            </svg>
          </div>
          <span className="gc-name-text">{row?.name || "—"}</span>
        </div>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        return (
          <span className="gc-cell-date">
            {isNaN(date.getTime())
              ? "—"
              : date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
          </span>
        );
      },
    },
    {
      Header: "Updated At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.updatedAt);
        return (
          <span className="gc-cell-date">
            {isNaN(date.getTime())
              ? "—"
              : date.toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
          </span>
        );
      },
    },
    {
      Header: "Action",
      Cell: ({ row }: { row: BannerData }) => (
        <div className="gc-action-group">
          <button
            className="gc-action-btn gc-action-edit"
            title="Edit Category"
            onClick={() =>
              dispatch(openDialog({ type: "giftCategory", data: row }))
            }
          >
            <img src={EditIcon.src} alt="Edit" width={15} height={15} />
          </button>
          <button
            className="gc-action-btn gc-action-delete"
            title="Delete Category"
            onClick={() => handleDelete(row?._id)}
          >
            <img src={TrashIcon.src} alt="Delete" width={15} height={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .gc-page {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.20);
          --green:    #10b981;
          --g-soft:   rgba(16,185,129,0.10);
          --amber:    #f59e0b;
          --am-soft:  rgba(245,158,11,0.10);
          --blue:     #3b82f6;
          --bl-soft:  rgba(59,130,246,0.10);
          --rose:     #f43f5e;
          --r-soft:   rgba(244,63,94,0.09);
          --r-mid:    rgba(244,63,94,0.18);
          --border:   #e8eaf2;
          --txt:      #64748b;
          --txt-dark: #1e2235;
          --txt-dim:  #a0a8c0;
          --white:    #ffffff;
          --bg:       #f4f5fb;

          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── Page Header ── */
        .gc-page .gc-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .gc-page .gc-header-left { display: flex; align-items: center; gap: 12px; }
        .gc-page .gc-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          flex-shrink: 0;
        }
        .gc-page .gc-title {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1; margin: 0;
        }
        .gc-page .gc-sub { font-size: 12px; color: var(--txt-dim); margin-top: 2px; }

        .gc-page .gc-add-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--a-glow);
          transition: box-shadow .15s, transform .13s;
        }
        .gc-page .gc-add-btn:hover {
          box-shadow: 0 6px 20px var(--a-glow); transform: translateY(-1px);
        }

        /* ── Stats Strip ── */
        .gc-page .gc-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 14px;
          margin-bottom: 18px;
        }
        .gc-page .gc-stat {
          background: var(--white); border: 1.5px solid var(--border);
          border-radius: 14px; padding: 16px;
          display: flex; align-items: center; gap: 12px;
          transition: box-shadow .18s, transform .15s; cursor: default;
        }
        .gc-page .gc-stat:hover {
          box-shadow: 0 4px 18px var(--a-soft); transform: translateY(-2px);
        }
        .gc-page .gc-stat-icon {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .gc-page .si-p { background: var(--a-soft);  color: var(--accent); }
        .gc-page .si-g { background: var(--g-soft);  color: var(--green); }
        .gc-page .si-a { background: var(--am-soft); color: var(--amber); }
        .gc-page .gc-stat-val {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1;
        }
        .gc-page .gc-stat-lbl {
          font-size: 11.5px; color: var(--txt-dim); font-weight: 500;
        }

        /* ── Table Card ── */
        .gc-page .gc-table-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }
        .gc-page .gc-table-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
        }
        .gc-page .gc-table-title {
          font-family: 'Rajdhani', sans-serif; font-size: 16px;
          font-weight: 700; color: var(--txt-dark);
        }
        .gc-page .gc-count {
          background: var(--a-soft); color: var(--accent);
          font-size: 12px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid var(--a-mid);
        }

        /* ── Cell Styles ── */
        .gc-page .gc-cell-no {
          font-family: 'Rajdhani', sans-serif; font-weight: 700;
          color: var(--txt-dim); font-size: 14px;
        }
        .gc-page .gc-cell-date {
          font-size: 12.5px; color: var(--txt-dim);
          font-weight: 500; white-space: nowrap;
        }

        .gc-page .gc-name-cell {
          display: flex; align-items: center; gap: 10px;
        }
        .gc-page .gc-name-icon {
          width: 32px; height: 32px; border-radius: 9px;
          background: var(--a-soft); color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }
        .gc-page .gc-name-text {
          font-size: 13.5px; font-weight: 600; color: var(--txt-dark);
          text-transform: capitalize;
        }

        /* ── Action Buttons ── */
        .gc-page .gc-action-group {
          display: flex; align-items: center; gap: 8px;
        }
        .gc-page .gc-action-btn {
          width: 34px; height: 34px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer;
          transition: background .14s, border-color .14s, transform .12s;
        }
        .gc-page .gc-action-edit:hover {
          background: rgba(99,102,241,0.09);
          border-color: var(--accent);
          transform: scale(1.08);
        }
        .gc-page .gc-action-delete:hover {
          background: var(--r-soft);
          border-color: var(--rose);
          transform: scale(1.08);
        }

        /* ── Pagination ── */
        .gc-page .gc-pagination {
          padding: 16px 20px; border-top: 1px solid var(--border);
        }
      `}</style>

      {dialogueType === "giftCategory" && <GiftCategoryDialog />}
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <div className="gc-page">

        {/* ── Page Header ── */}
        <div className="gc-header">
          <div className="gc-header-left">
            <div className="gc-header-pill" />
            <div>
              <h1 className="gc-title">Gift Category</h1>
              <p className="gc-sub">Manage and organise all gift categories</p>
            </div>
          </div>
          <button
            className="gc-add-btn"
            onClick={() => dispatch(openDialog({ type: "giftCategory" }))}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Category
          </button>
        </div>

        {/* ── Stats Strip ── */}
        <div className="gc-stats">
          {[
            {
              label: "Total Categories",
              val: totalGiftCategory || 0,
              cls: "si-p",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polyline points="20 12 20 22 4 22 4 12"/>
                  <rect x="2" y="7" width="20" height="5"/>
                  <line x1="12" y1="22" x2="12" y2="7"/>
                  <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/>
                  <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>
                </svg>
              ),
            },
            {
              label: "This Page",
              val: giftCategory?.length || 0,
              cls: "si-g",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              ),
            },
            {
              label: "Per Page",
              val: rowsPerPage,
              cls: "si-a",
              icon: (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
              ),
            },
          ].map((s, i) => (
            <div className="gc-stat" key={i}>
              <div className={`gc-stat-icon ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="gc-stat-val">{s.val.toLocaleString()}</div>
                <div className="gc-stat-lbl">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Table Card ── */}
        <div className="gc-table-card">
          <div className="gc-table-head">
            <span className="gc-table-title">All Gift Categories</span>
            <span className="gc-count">{totalGiftCategory || 0} total</span>
          </div>

          <Table
            data={giftCategory}
            mapData={bannerTable}
            PerPage={rowsPerPage}
            Page={page}
            type="server"
            shimmer={<ImpressionShimmer />}
          />

          <div className="gc-pagination">
            <Pagination
              type="server"
              serverPage={page}
              setServerPage={setPage}
              serverPerPage={rowsPerPage}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
              totalData={totalGiftCategory}
            />
          </div>
        </div>

      </div>
    </>
  );
};

GiftCategory.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default GiftCategory;