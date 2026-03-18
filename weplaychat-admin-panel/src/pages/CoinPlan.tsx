import RootLayout from "@/component/layout/Layout";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/images/delete.svg";
import EditIcon from "@/assets/images/edit.svg";
import { activeCoinPlan, deleteCoinPlan, getCoinPlan } from "@/store/coinPlanSlice";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { getDefaultCurrency } from "@/store/settingSlice";
import coin from "@/assets/images/coin.png";
import CommonDialog from "@/utils/CommonDialog";
import CoinPlanShimmer from "@/component/Shimmer/CoinPlanShimmer";

const CoinPlan = ({ type }: any) => {
  const dispatch = useDispatch();
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);
  const { coinPlan, total } = useSelector((state: RootStore) => state.coinPlan);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (type) dispatch(getCoinPlan({ start: page, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage, type]);

  useEffect(() => {
    dispatch(getDefaultCurrency());
  }, [dispatch]);

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  const handleDelete = (id: any) => { setSelectedId(id); setShowDialog(true); };
  const confirmDelete = async () => {
    if (selectedId) { dispatch(deleteCoinPlan(selectedId)); setShowDialog(false); }
  };

  const coinPlanTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="cp-cell-no">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="cp-coin-cell">
          <div className="cp-coin-img-wrap">
            <img src={coin.src} height={22} width={22} alt="Coin" />
          </div>
          <span className="cp-coin-val">{row?.coins || 0}</span>
        </div>
      ),
    },
    {
      Header: "Bonus Coin",
      Cell: ({ row }: { row: any }) => (
        <span className="cp-badge cp-badge-green">
          +{row?.bonusCoins || 0}
        </span>
      ),
    },
    {
      Header: `Price (${defaultCurrency?.symbol})`,
      Cell: ({ row }: { row: any }) => (
        <span className="cp-badge cp-badge-blue">
          {defaultCurrency?.symbol}{row?.price || 0}
        </span>
      ),
    },
    {
      Header: "Product Id",
      Cell: ({ row }: { row: any }) => (
        <span className="cp-cell-mono">{row?.productId || "—"}</span>
      ),
    },
    {
      Header: "Active",
      body: "isActive",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={row?.isActive}
          onClick={() => dispatch(activeCoinPlan({ id: row?._id, type: "isActive" }))}
        />
      ),
    },
    {
      Header: "Popular",
      body: "IsPopular",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={row?.isFeatured}
          onClick={() => dispatch(activeCoinPlan({ id: row?._id, type: "isFeatured" }))}
        />
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }: { row: any }) => (
        <div className="cp-action-group">
          <button
            className="cp-action-btn cp-action-edit"
            title="Edit Plan"
            onClick={() => dispatch(openDialog({ type: "coinplan", data: row }))}
          >
            <img src={EditIcon.src} alt="Edit" width={15} height={15} />
          </button>
          <button
            className="cp-action-btn cp-action-delete"
            title="Delete Plan"
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

        .cp-wrap {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --green:    #10b981;
          --g-soft:   rgba(16,185,129,0.10);
          --g-mid:    rgba(16,185,129,0.20);
          --blue:     #3b82f6;
          --bl-soft:  rgba(59,130,246,0.10);
          --bl-mid:   rgba(59,130,246,0.20);
          --amber:    #f59e0b;
          --am-soft:  rgba(245,158,11,0.10);
          --am-mid:   rgba(245,158,11,0.20);
          --rose:     #f43f5e;
          --r-soft:   rgba(244,63,94,0.08);
          --border:   #e8eaf2;
          --txt:      #64748b;
          --txt-dark: #1e2235;
          --txt-dim:  #a0a8c0;
          --white:    #ffffff;
          --bg:       #f4f5fb;
          font-family: 'Outfit', sans-serif;
        }

        /* ── Cell: No ── */
        .cp-wrap .cp-cell-no {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700; font-size: 14px; color: var(--txt-dim);
        }

        /* ── Cell: Coin ── */
        .cp-wrap .cp-coin-cell {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--am-soft);
          border: 1px solid var(--am-mid);
          padding: 4px 12px; border-radius: 20px;
        }
        .cp-wrap .cp-coin-img-wrap {
          display: flex; align-items: center; justify-content: center;
        }
        .cp-wrap .cp-coin-val {
          font-size: 13px; font-weight: 700; color: var(--amber);
        }

        /* ── Badges ── */
        .cp-wrap .cp-badge {
          display: inline-flex; align-items: center;
          padding: 3px 11px; border-radius: 20px;
          font-size: 12.5px; font-weight: 700; white-space: nowrap;
        }
        .cp-wrap .cp-badge-green {
          background: var(--g-soft); color: var(--green);
          border: 1px solid var(--g-mid);
        }
        .cp-wrap .cp-badge-blue {
          background: var(--bl-soft); color: var(--blue);
          border: 1px solid var(--bl-mid);
        }

        /* ── Cell: Mono ── */
        .cp-wrap .cp-cell-mono {
          font-family: monospace; font-size: 12px;
          color: var(--txt); background: var(--bg);
          padding: 3px 8px; border-radius: 6px;
          border: 1px solid var(--border);
          white-space: nowrap;
        }

        /* ── Action buttons ── */
        .cp-wrap .cp-action-group { display: flex; align-items: center; gap: 8px; }
        .cp-wrap .cp-action-btn {
          width: 34px; height: 34px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer;
          transition: background .14s, border-color .14s, transform .12s;
        }
        .cp-wrap .cp-action-edit:hover {
          background: var(--a-soft); border-color: var(--accent); transform: scale(1.08);
        }
        .cp-wrap .cp-action-delete:hover {
          background: var(--r-soft); border-color: var(--rose); transform: scale(1.08);
        }

        /* ── Pagination ── */
        .cp-wrap .cp-pagination {
          padding: 16px 0 0; border-top: 1px solid var(--border); margin-top: 4px;
        }
      `}</style>

      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <div className="cp-wrap">
        <Table
          data={coinPlan}
          mapData={coinPlanTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<CoinPlanShimmer />}
        />
        <div className="cp-pagination">
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
    </>
  );
};

CoinPlan.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default CoinPlan;