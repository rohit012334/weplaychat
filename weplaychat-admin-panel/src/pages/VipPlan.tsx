import RootLayout from "@/component/layout/Layout";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/images/delete.svg";
import EditIcon from "@/assets/images/edit.svg";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { useRouter } from "next/router";
import { activeVipPlan, deleteVipPlan, getVipPlan } from "@/store/vipPlanSlice";
import { getDefaultCurrency } from "@/store/settingSlice";
import coin from "@/assets/images/coin.png";
import CommonDialog from "@/utils/CommonDialog";
import VipPlanShimmer from "@/component/Shimmer/VipPlanShimmer";

const VipPlan = ({ type }: any) => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { vipPlan, total } = useSelector((state: RootStore) => state.vipPlan);
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    dispatch(getDefaultCurrency());
  }, [dispatch, type]);

  useEffect(() => {
    if (type) dispatch(getVipPlan({ start: page, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage, type]);

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  const handleDelete = (id: any) => { setSelectedId(id); setShowDialog(true); };
  const confirmDelete = async () => {
    if (selectedId) { dispatch(deleteVipPlan(selectedId)); setShowDialog(false); }
  };

  const vipPlanTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="vp-cell-no">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Validity",
      Cell: ({ row }: { row: any }) => (
        <div className="vp-validity-cell">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          <span>{row?.validity || 0}</span>
        </div>
      ),
    },
    {
      Header: "Validity Type",
      Cell: ({ row }: { row: any }) => (
        <span className="vp-badge vp-badge-purple">
          {row?.validityType || "—"}
        </span>
      ),
    },
    {
      Header: `Price (${defaultCurrency?.symbol})`,
      Cell: ({ row }: { row: any }) => (
        <span className="vp-badge vp-badge-blue">
          {defaultCurrency?.symbol}{row?.price || 0}
        </span>
      ),
    },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="vp-coin-cell">
          <div className="vp-coin-img-wrap">
            <img src={coin.src} height={22} width={22} alt="Coin" />
          </div>
          <span className="vp-coin-val">{row?.coin || 0}</span>
        </div>
      ),
    },
    {
      Header: "Active",
      body: "isActive",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={row?.isActive}
          onClick={() => dispatch(activeVipPlan(row?._id))}
        />
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }: { row: any }) => (
        <div className="vp-action-group">
          <button
            className="vp-action-btn vp-action-edit"
            title="Edit VIP Plan"
            onClick={() => dispatch(openDialog({ type: "vipPlan", data: row }))}
          >
            <img src={EditIcon.src} alt="Edit" width={15} height={15} />
          </button>
          <button
            className="vp-action-btn vp-action-delete"
            title="Delete VIP Plan"
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

        .vp-wrap {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --blue:     #3b82f6;
          --bl-soft:  rgba(59,130,246,0.10);
          --bl-mid:   rgba(59,130,246,0.20);
          --amber:    #f59e0b;
          --am-soft:  rgba(245,158,11,0.10);
          --am-mid:   rgba(245,158,11,0.22);
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

        /* ── No ── */
        .vp-wrap .vp-cell-no {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700; font-size: 14px; color: var(--txt-dim);
        }

        /* ── Validity cell ── */
        .vp-wrap .vp-validity-cell {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 13px; font-weight: 600; color: var(--txt-dark);
        }
        .vp-wrap .vp-validity-cell svg { color: var(--txt-dim); flex-shrink: 0; }

        /* ── Badges ── */
        .vp-wrap .vp-badge {
          display: inline-flex; align-items: center;
          padding: 3px 11px; border-radius: 20px;
          font-size: 12.5px; font-weight: 700; white-space: nowrap;
          text-transform: capitalize;
        }
        .vp-wrap .vp-badge-purple {
          background: var(--a-soft); color: var(--accent);
          border: 1px solid var(--a-mid);
        }
        .vp-wrap .vp-badge-blue {
          background: var(--bl-soft); color: var(--blue);
          border: 1px solid var(--bl-mid);
        }

        /* ── Coin cell ── */
        .vp-wrap .vp-coin-cell {
          display: inline-flex; align-items: center; gap: 8px;
          background: var(--am-soft);
          border: 1px solid var(--am-mid);
          padding: 4px 12px; border-radius: 20px;
        }
        .vp-wrap .vp-coin-img-wrap {
          display: flex; align-items: center; justify-content: center;
        }
        .vp-wrap .vp-coin-val {
          font-size: 13px; font-weight: 700; color: var(--amber);
        }

        /* ── Action buttons ── */
        .vp-wrap .vp-action-group { display: flex; align-items: center; gap: 8px; }
        .vp-wrap .vp-action-btn {
          width: 34px; height: 34px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer;
          transition: background .14s, border-color .14s, transform .12s;
        }
        .vp-wrap .vp-action-edit:hover {
          background: var(--a-soft); border-color: var(--accent); transform: scale(1.08);
        }
        .vp-wrap .vp-action-delete:hover {
          background: var(--r-soft); border-color: var(--rose); transform: scale(1.08);
        }

        /* ── Pagination ── */
        .vp-wrap .vp-pagination {
          padding: 16px 0 0; border-top: 1px solid var(--border); margin-top: 4px;
        }
      `}</style>

      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={confirmDelete}
        text={"Delete"}
      />

      <div className="vp-wrap">
        <Table
          data={vipPlan}
          mapData={vipPlanTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<VipPlanShimmer />}
        />
        <div className="vp-pagination">
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

VipPlan.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default VipPlan;