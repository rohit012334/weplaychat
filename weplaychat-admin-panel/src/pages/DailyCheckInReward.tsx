import RootLayout from "@/component/layout/Layout";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/images/delete.svg";
import EditIcon from "@/assets/images/edit.svg";
import DailyCheckInRewardDialog from "@/component/dailyCheckInReward/DailyCheckInRewardDialog";
import { deleteDailyReward, getDailyCheckInReward } from "@/store/dailyCheckInRewardSlice";
import CommonDialog from "@/utils/CommonDialog";
import ImpressionShimmer from "@/component/Shimmer/ImpressionShimmer";

const DailyCheckInReward = () => {
  const dispatch = useDispatch();
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { dailyReward, total } = useSelector((state: RootStore) => state.dailyReward);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [selectedId, setSelectedId] = useState(null);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    dispatch(getDailyCheckInReward());
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
      dispatch(deleteDailyReward(selectedId));
      setShowDialog(false);
    }
  };

  const dailyRewardTable = [
    {
      Header: "Day",
      Cell: ({ row }: { row: any }) => (
        <div className="dc-day-cell">
          <div className="dc-day-badge">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
            Day {row?.day || "—"}
          </div>
        </div>
      ),
    },
    {
      Header: "Daily Reward Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="dc-coin-cell">
          <span className="dc-coin-icon">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9m0 0h4.5a1.5 1.5 0 0 1 0 3H9"/>
            </svg>
          </span>
          <span className="dc-coin-val">{row?.dailyRewardCoin ?? "—"}</span>
        </div>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        return (
          <span className="dc-cell-date">
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
          <span className="dc-cell-date">
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
      Cell: ({ row }: { row: any }) => (
        <div className="dc-action-group">
          <button
            className="dc-action-btn dc-action-edit"
            title="Edit Reward"
            onClick={() =>
              dispatch(openDialog({ type: "dailycheckinreward", data: row }))
            }
          >
            <img src={EditIcon.src} alt="Edit" width={15} height={15} />
          </button>
          <button
            className="dc-action-btn dc-action-delete"
            title="Delete Reward"
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

        .dc-page {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.20);
          --green:    #10b981;
          --g-soft:   rgba(16,185,129,0.10);
          --amber:    #f59e0b;
          --am-soft:  rgba(245,158,11,0.10);
          --rose:     #f43f5e;
          --r-soft:   rgba(244,63,94,0.08);
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

        /* ── Header ── */
        .dc-page .dc-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .dc-page .dc-header-left { display: flex; align-items: center; gap: 12px; }
        .dc-page .dc-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          flex-shrink: 0;
        }
        .dc-page .dc-title {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1; margin: 0;
        }
        .dc-page .dc-sub { font-size: 12px; color: var(--txt-dim); margin-top: 2px; }

        .dc-page .dc-add-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--a-glow);
          transition: box-shadow .15s, transform .13s;
        }
        .dc-page .dc-add-btn:hover {
          box-shadow: 0 6px 20px var(--a-glow); transform: translateY(-1px);
        }

        /* ── Table Card ── */
        .dc-page .dc-table-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }
        .dc-page .dc-table-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg,rgba(99,102,241,0.04),rgba(168,85,247,0.02));
        }
        .dc-page .dc-table-title {
          font-family: 'Rajdhani', sans-serif; font-size: 16px;
          font-weight: 700; color: var(--txt-dark);
        }
        .dc-page .dc-count {
          background: var(--a-soft); color: var(--accent);
          font-size: 12px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid var(--a-mid);
        }

        /* ── Cell Styles ── */
        .dc-page .dc-cell-date {
          font-size: 12.5px; color: var(--txt-dim); font-weight: 500; white-space: nowrap;
        }

        /* Day badge */
        .dc-page .dc-day-cell { display: flex; align-items: center; }
        .dc-page .dc-day-badge {
          display: inline-flex; align-items: center; gap: 6px;
          background: var(--a-soft); color: var(--accent);
          font-size: 12.5px; font-weight: 700;
          padding: 4px 11px; border-radius: 20px;
          border: 1px solid var(--a-mid);
        }

        /* Coin cell */
        .dc-page .dc-coin-cell {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--am-soft); color: var(--amber);
          font-size: 13px; font-weight: 700;
          padding: 4px 11px; border-radius: 20px;
          border: 1px solid rgba(245,158,11,0.20);
        }
        .dc-page .dc-coin-icon {
          display: flex; align-items: center; justify-content: center;
        }
        .dc-page .dc-coin-val { line-height: 1; }

        /* Action buttons */
        .dc-page .dc-action-group { display: flex; align-items: center; gap: 8px; }
        .dc-page .dc-action-btn {
          width: 34px; height: 34px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer;
          transition: background .14s, border-color .14s, transform .12s;
        }
        .dc-page .dc-action-edit:hover {
          background: var(--a-soft); border-color: var(--accent); transform: scale(1.08);
        }
        .dc-page .dc-action-delete:hover {
          background: var(--r-soft); border-color: var(--rose); transform: scale(1.08);
        }

        /* Pagination */
        .dc-page .dc-pagination {
          padding: 16px 20px; border-top: 1px solid var(--border);
        }
      `}</style>

      {dialogueType === "dailycheckinreward" && <DailyCheckInRewardDialog />}
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <div className="dc-page">

        {/* ── Header ── */}
        <div className="dc-header">
          <div className="dc-header-left">
            <div className="dc-header-pill" />
            <div>
              <h1 className="dc-title">Daily Check-In Reward</h1>
              <p className="dc-sub">Configure coins awarded for each check-in day</p>
            </div>
          </div>
          <button
            className="dc-add-btn"
            onClick={() => dispatch(openDialog({ type: "dailycheckinreward" }))}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Daily Reward
          </button>
        </div>

        {/* ── Table Card ── */}
        <div className="dc-table-card">
          <div className="dc-table-head">
            <span className="dc-table-title">All Daily Rewards</span>
            <span className="dc-count">{total || 0} total</span>
          </div>

          <Table
            data={dailyReward}
            mapData={dailyRewardTable}
            PerPage={rowsPerPage}
            Page={page}
            type="server"
            shimmer={<ImpressionShimmer />}
          />

          <div className="dc-pagination">
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

DailyCheckInReward.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default DailyCheckInReward;