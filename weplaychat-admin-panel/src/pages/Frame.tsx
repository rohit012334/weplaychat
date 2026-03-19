import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/images/delete.svg";
import EditIcon from "@/assets/images/edit.svg";
import ToggleSwitch from "@/extra/TogggleSwitch";
import CommonDialog from "@/utils/CommonDialog";
import { getFrames, deleteFrame, updateFrameStatus } from "@/store/frameSlice";
import FrameDialog from "@/component/frame/FrameDialog";
import { baseURL, getStorageUrl } from "@/utils/config";
import SvgaPlayer from "@/extra/SvgaPlayer";

const FrameContent = () => {
  const dispatch = useDispatch();

  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { frames, total, isSkeleton } = useSelector((state: RootStore) => state.frame);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getFrames({ start: page, limit: rowsPerPage }));
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
      dispatch(deleteFrame(selectedId));
      setShowDeleteDialog(false);
    }
  };

  const getFileUrl = (filePath: string) => getStorageUrl(filePath);

  const renderPreview = (row: any) => {
    const src = getFileUrl(row.file);
    if (!src) return <span className="fc-no-file">No file</span>;
    const type = (row.type || "").toLowerCase().trim();
    if (type === "mp4") {
      return (
        <video src={src} autoPlay loop muted
          style={{ width: "70px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e8eaf2" }}
        />
      );
    }
    if (type === "svga") {
      return (
        <div style={{ width: "70px", height: "50px", overflow: "hidden", borderRadius: "8px", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <SvgaPlayer url={src} id={`table-frame-${row._id}`} key={src} />
        </div>
      );
    }
    return (
      <img src={src} alt="Frame"
        style={{ width: "70px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e8eaf2" }}
      />
    );
  };

  const frameTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="fc-cell-num">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Preview",
      Cell: ({ row }: { row: any }) => renderPreview(row),
    },
    {
      Header: "Type",
      Cell: ({ row }: { row: any }) => {
        const type = row?.type || "-";
        const styles: Record<string, { bg: string; color: string }> = {
          gif:  { bg: "#dcfce7", color: "#166534" },
          mp4:  { bg: "#dbeafe", color: "#1e40af" },
          svga: { bg: "rgba(99,102,241,0.10)", color: "#6366f1" },
        };
        const s = styles[type] || { bg: "#f4f5fb", color: "#64748b" };
        return (
          <span style={{
            display: "inline-block", padding: "3px 12px", borderRadius: "20px",
            fontSize: "12px", fontWeight: 700,
            background: s.bg, color: s.color, textTransform: "uppercase",
          }}>
            {type}
          </span>
        );
      },
    },
    {
      Header: "Status",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={row?.isActive}
          onClick={() => dispatch(updateFrameStatus(row?._id))}
        />
      ),
    },
    {
      Header: "Actions",
      Cell: ({ row }: { row: any }) => (
        <div className="fc-actions">
          <button className="fc-btn-edit"
            onClick={() => dispatch(openDialog({ type: "frame", data: row }))}>
            <img src={EditIcon.src} alt="Edit" width={18} height={18} />
          </button>
          <button className="fc-btn-delete" onClick={() => handleDelete(row?._id)}>
            <img src={TrashIcon.src} alt="Delete" width={18} height={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        .fc-wrap { padding: 20px 24px 32px; }

        .fc-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .fc-topbar-left { display: flex; align-items: center; gap: 10px; }
        .fc-topbar-pill {
          width: 3px; height: 22px; border-radius: 3px;
          background: linear-gradient(180deg, #6366f1, #a855f7);
        }
        .fc-topbar-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px; font-weight: 700; color: #1e2235; margin: 0;
        }
        .fc-topbar-count {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
          background: rgba(99,102,241,0.09);
          color: #6366f1; border: 1px solid rgba(99,102,241,0.18);
        }
        .fc-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          box-shadow: 0 4px 16px rgba(99,102,241,0.30);
          transition: box-shadow .18s, transform .12s;
        }
        .fc-add-btn:hover {
          box-shadow: 0 6px 22px rgba(99,102,241,0.40);
          transform: translateY(-1px);
        }
        .fc-table-card {
          background: #fff; border: 1px solid #e8eaf2;
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 1px 10px rgba(99,102,241,0.05);
        }
        .fc-cell-num { font-weight: 700; color: #6366f1; }
        .fc-no-file { color: #a0a8c0; font-size: 12px; }
        .fc-svga-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 70px; height: 50px;
          background: rgba(99,102,241,0.10); border-radius: 8px;
          font-size: 11px; color: #6366f1; font-weight: 700;
        }
        .fc-actions { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .fc-btn-edit, .fc-btn-delete {
          width: 36px; height: 36px; border-radius: 9px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform .12s, box-shadow .15s;
        }
        .fc-btn-edit {
          background: rgba(99,102,241,0.10);
          border: 1px solid rgba(99,102,241,0.18);
        }
        .fc-btn-edit:hover {
          background: rgba(99,102,241,0.18); transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(99,102,241,0.15);
        }
        .fc-btn-delete {
          background: rgba(244,63,94,0.09);
          border: 1px solid rgba(244,63,94,0.18);
        }
        .fc-btn-delete:hover {
          background: rgba(244,63,94,0.16); transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(244,63,94,0.15);
        }
      `}</style>

      {dialogue && dialogueType === "frame" && <FrameDialog />}
      <CommonDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        text="Delete"
      />

      <div className="fc-wrap">
        <div className="fc-topbar">
          <div className="fc-topbar-left">
            <div className="fc-topbar-pill" />
            <h4 className="fc-topbar-title">Frames</h4>
            <span className="fc-topbar-count">{total ?? 0} total</span>
          </div>
          <button className="fc-add-btn"
            onClick={() => dispatch(openDialog({ type: "frame" }))}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Frame
          </button>
        </div>

        <div className="fc-table-card">
          <Table
            data={frames}
            mapData={frameTable}
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

export default FrameContent;