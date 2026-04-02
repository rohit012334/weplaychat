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
import { getTags, deleteTag, updateTagStatus } from "@/store/tagSlice";
import TagDialog from "@/component/tag/TagDialog";
import RootLayout from "@/component/layout/Layout";

const TagContent = () => {
  const dispatch = useDispatch();

  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { tags, total, isSkeleton } = useSelector((state: RootStore) => state.tag);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(getTags({ start: page, limit: rowsPerPage }));
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
      dispatch(deleteTag(selectedId));
      setShowDeleteDialog(false);
    }
  };

  const tagTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="tc-cell-num">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Tag Name",
      Cell: ({ row }: { row: any }) => (
        <span className="tc-tag-pill">
          <svg width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
            <path d="M2 1a1 1 0 0 0-1 1v4.586a1 1 0 0 0 .293.707l7 7a1 1 0 0 0 1.414 0l4.586-4.586a1 1 0 0 0 0-1.414l-7-7A1 1 0 0 0 6.586 1zm4 3.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0" />
          </svg>
          {row?.name || "-"}
        </span>
      ),
    },
    {
      Header: "Status",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={row?.isActive}
          onClick={() => dispatch(updateTagStatus(row?._id))}
        />
      ),
    },
    {
      Header: "Actions",
      Cell: ({ row }: { row: any }) => (
        <div className="tc-actions">
          <button className="tc-btn-edit"
            onClick={() => dispatch(openDialog({ type: "tag", data: row }))}>
            <img src={EditIcon.src} alt="Edit" width={18} height={18} />
          </button>
          <button className="tc-btn-delete" onClick={() => handleDelete(row?._id)}>
            <img src={TrashIcon.src} alt="Delete" width={18} height={18} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <style>{`
        .tc-wrap { padding: 20px 24px 32px; }

        .tc-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .tc-topbar-left { display: flex; align-items: center; gap: 10px; }
        .tc-topbar-pill {
          width: 3px; height: 22px; border-radius: 3px;
          background: linear-gradient(180deg, #6366f1, #a855f7);
        }
        .tc-topbar-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px; font-weight: 700; color: #1e2235; margin: 0;
        }
        .tc-topbar-count {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 20px;
          font-size: 12px; font-weight: 700;
          background: rgba(99,102,241,0.09);
          color: #6366f1; border: 1px solid rgba(99,102,241,0.18);
        }
        .tc-add-btn {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 10px 20px; border-radius: 10px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          color: #fff; border: none; cursor: pointer;
          font-family: 'Outfit', sans-serif;
          font-size: 14px; font-weight: 600;
          box-shadow: 0 4px 16px rgba(99,102,241,0.30);
          transition: box-shadow .18s, transform .12s;
        }
        .tc-add-btn:hover {
          box-shadow: 0 6px 22px rgba(99,102,241,0.40);
          transform: translateY(-1px);
        }
        .tc-table-card {
          background: #fff; border: 1px solid #e8eaf2;
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 1px 10px rgba(99,102,241,0.05);
        }
        .tc-cell-num { font-weight: 700; color: #6366f1; }
        .tc-tag-pill {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 12px; border-radius: 20px;
          background: rgba(99,102,241,0.09);
          color: #6366f1; font-size: 13px; font-weight: 600;
          border: 1px solid rgba(99,102,241,0.20);
        }
        .tc-actions { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .tc-btn-edit, .tc-btn-delete {
          width: 36px; height: 36px; border-radius: 9px;
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform .12s, box-shadow .15s;
        }
        .tc-btn-edit {
          background: rgba(99,102,241,0.10);
          border: 1px solid rgba(99,102,241,0.18);
        }
        .tc-btn-edit:hover {
          background: rgba(99,102,241,0.18); transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(99,102,241,0.15);
        }
        .tc-btn-delete {
          background: rgba(244,63,94,0.09);
          border: 1px solid rgba(244,63,94,0.18);
        }
        .tc-btn-delete:hover {
          background: rgba(244,63,94,0.16); transform: translateY(-1px);
          box-shadow: 0 3px 10px rgba(244,63,94,0.15);
        }
      `}</style>

      {dialogue && dialogueType === "tag" && <TagDialog />}
      <CommonDialog
        open={showDeleteDialog}
        onCancel={() => setShowDeleteDialog(false)}
        onConfirm={confirmDelete}
        text="Delete"
      />

      <div className="tc-wrap">
        <div className="tc-topbar">
          <div className="tc-topbar-left">
            <div className="tc-topbar-pill" />
            <h4 className="tc-topbar-title">Tags</h4>
            <span className="tc-topbar-count">{total ?? 0} total</span>
          </div>
          <button className="tc-add-btn"
            onClick={() => dispatch(openDialog({ type: "tag" }))}>
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5"
              strokeLinecap="round" viewBox="0 0 24 24">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Tag
          </button>
        </div>

        <div className="tc-table-card">
          <Table
            data={tags}
            mapData={tagTable}
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

TagContent.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default TagContent;