import Button from "@/extra/Button";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { openDialog, closeDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/images/delete.svg";
import EditIcon from "@/assets/images/edit.svg";
import ToggleSwitch from "@/extra/TogggleSwitch";
import CommonDialog from "@/utils/CommonDialog";
import { getStorageUrl } from "@/utils/config";
import { getBanners, deleteBanner, updateBannerStatus } from "@/store/bannerSlice";
import BannerDialog from "@/component/banner/BannerDialog";

const BannerContent = () => {
  const dispatch = useDispatch();

  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { banners, total, isSkeleton } = useSelector((state: RootStore) => state.banner);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getBanners({ start: page, limit: rowsPerPage }));
  }, [dispatch, page, rowsPerPage]);

  const handleChangePage = (_event: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };
  const handleDelete = (id: string) => {
    setSelectedId(id);
    setShowDeleteDialog(true);
  };
  const confirmDelete = () => {
    if (selectedId) {
      dispatch(deleteBanner(selectedId));
      setShowDeleteDialog(false);
    }
  };

  const bannerTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="bc-cell-num">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Image",
      Cell: ({ row }: { row: any }) => {
        const src = row?.image ? getStorageUrl(row.image) : "";
        return src ? (
          <img src={src} alt="Banner"
            style={{ width: "90px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e8eaf2" }}
          />
        ) : (
          <span className="bc-no-img">No Image</span>
        );
      },
    },
    {
      Header: "Title",
      Cell: ({ row }: { row: any }) => (
        <span className="bc-title">{row?.title || "-"}</span>
      ),
    },
    {
      Header: "Link",
      Cell: ({ row }: { row: any }) =>
        row?.link ? (
          <a href={row.link} target="_blank" rel="noopener noreferrer" className="bc-link">
            {row.link}
          </a>
        ) : <span className="bc-dash">—</span>,
    },
    {
      Header: "Status",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={row?.isActive}
          onClick={() => dispatch(updateBannerStatus(row?._id))}
        />
      ),
    },
    {
      Header: "Actions",
      Cell: ({ row }: { row: any }) => (
        <div className="bc-actions">
          <button className="bc-btn-edit"
            onClick={() => dispatch(openDialog({ type: "banner", data: row }))}>
            <img src={EditIcon.src} alt="Edit" width={18} height={18} />
          </button>
          <button className="bc-btn-delete" onClick={() => handleDelete(row?._id)}>
            <img src={TrashIcon.src} alt="Delete" width={18} height={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        /* ── Banner Content Styles ── */
        .bc-wrap { padding: 20px 24px 32px; }

        /* top bar */
        .bc-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .bc-topbar-left { display: flex; align-items: center; gap: 10px; }
        .bc-topbar-pill {
          width: 3px; height: 22px; border-radius: 3px;
          background: linear-gradient(180deg, #6366f1, #a855f7);
        }
        .bc-topbar-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px; font-weight: 700; color: #1e2235; margin: 0;
        }
        .bc-topbar-count {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
          background: rgba(99,102,241,0.09);
          color: #6366f1;
          border: 1px solid rgba(99,102,241,0.18);
        }

        /* add button */
        .bc-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          box-shadow: 0 4px 16px rgba(99,102,241,0.30);
          transition: box-shadow .18s, transform .12s;
        }
        .bc-add-btn:hover {
          box-shadow: 0 6px 22px rgba(99,102,241,0.40);
          transform: translateY(-1px);
        }

        /* table card */
        .bc-table-card {
          background: #fff;
          border: 1px solid #e8eaf2;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 1px 10px rgba(99,102,241,0.05);
        }

        /* cell styles */
        .bc-cell-num { font-weight: 700; color: #6366f1; }
        .bc-no-img {
          display: inline-flex; align-items: center; justify-content: center;
          width: 90px; height: 50px; background: #f4f5fb;
          border-radius: 8px; color: #a0a8c0; font-size: 11px;
        }
        .bc-title { font-weight: 600; color: #1e2235; }
        .bc-link {
          color: #6366f1; font-size: 13px;
          max-width: 200px; overflow: hidden;
          text-overflow: ellipsis; white-space: nowrap;
          display: inline-block; text-decoration: none;
        }
        .bc-link:hover { text-decoration: underline; }
        .bc-dash { color: #a0a8c0; }

        /* action buttons */
        .bc-actions { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .bc-btn-edit, .bc-btn-delete {
          width: 36px; height: 36px; border-radius: 9px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform .12s, box-shadow .15s;
        }
        .bc-btn-edit {
          background: rgba(99,102,241,0.10);
          border: 1px solid rgba(99,102,241,0.18);
        }
        .bc-btn-edit:hover {
          background: rgba(99,102,241,0.18);
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(99,102,241,0.15);
        }
        .bc-btn-delete {
          background: rgba(244,63,94,0.09);
          border: 1px solid rgba(244,63,94,0.18);
        }
        .bc-btn-delete:hover {
          background: rgba(244,63,94,0.16);
          transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(244,63,94,0.15);
        }
      `}</style>

      {dialogue && dialogueType === "banner" && <BannerDialog />}
      <CommonDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        text="Delete"
      />

      <div className="bc-wrap">
        {/* Top bar */}
        <div className="bc-topbar">
          <div className="bc-topbar-left">
            <div className="bc-topbar-pill" />
            <h4 className="bc-topbar-title">Banners</h4>
            <span className="bc-topbar-count">{total ?? 0} total</span>
          </div>
          <button className="bc-add-btn"
            onClick={() => dispatch(openDialog({ type: "banner" }))}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Banner
          </button>
        </div>

        {/* Table */}
        <div className="bc-table-card">
          <Table
            data={banners}
            mapData={bannerTable}
            PerPage={rowsPerPage}
            Page={page}
            type="server"
          />
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

export default BannerContent;