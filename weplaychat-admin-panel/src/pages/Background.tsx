import Table from "@/extra/Table";
import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/images/delete.svg";
import EditIcon from "@/assets/images/edit.svg";
import ToggleSwitch from "@/extra/TogggleSwitch";
import CommonDialog from "@/utils/CommonDialog";
import { getBackgrounds, deleteBackground, updateBackgroundStatus } from "@/store/backgroundSlice";
import BackgroundDialog from "@/component/background/BackgroundDialog";
import { baseURL, getStorageUrl } from "@/utils/config";

const BackgroundPage = () => {
    const dispatch = useDispatch();
    const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
    const { backgrounds, total } = useSelector((state: RootStore) => state.background);

    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    useEffect(() => {
        dispatch(getBackgrounds({ start: page, limit: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    const getFileUrl = (filePath: string) => getStorageUrl(filePath);

    const backgroundTable = [
        {
            Header: "No",
            Cell: ({ index }: { index: any }) => <span className="ec-cell-num">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>,
        },
        {
            Header: "Preview",
            Cell: ({ row }: { row: any }) => {
                const src = getFileUrl(row.file);
                if (row.type === "mp4") return <video src={src} autoPlay loop muted width="70" height="50" style={{ borderRadius: 8 }} />;
                return <img src={src} alt="bg" width="70" height="50" style={{ borderRadius: 8, objectFit: "cover" }} />;
            },
        },
        {
            Header: "Type",
            Cell: ({ row }: { row: any }) => <span className="store-content-badge" style={{ textTransform: "uppercase" }}>{row.type}</span>,
        },
        {
            Header: "Status",
            Cell: ({ row }: { row: any }) => <ToggleSwitch value={row.isActive} onClick={() => dispatch(updateBackgroundStatus(row._id))} />,
        },
        {
            Header: "Actions",
            Cell: ({ row }: { row: any }) => (
                <div className="ec-actions">
                    <button className="ec-btn-edit" onClick={() => dispatch(openDialog({ type: "background", data: row }))}>
                        <img src={EditIcon.src} alt="edit" width={18} height={18} />
                    </button>
                    <button className="ec-btn-delete" onClick={() => { setSelectedId(row._id); setShowDeleteDialog(true); }}>
                        <img src={TrashIcon.src} alt="delete" width={18} height={18} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <style>{`
                .ec-wrap { padding: 20px 24px 32px; }
                .ec-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                .ec-topbar-left { display: flex; align-items: center; gap: 10px; }
                .ec-topbar-pill { width: 3px; height: 22px; border-radius: 3px; background: linear-gradient(180deg, #6366f1, #a855f7); }
                .ec-topbar-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #1e2235; margin: 0; }
                .ec-topbar-count { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 700; background: rgba(99,102,241,0.09); color: #6366f1; border: 1px solid rgba(99,102,241,0.18); }
                .ec-add-btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; box-shadow: 0 4px 16px rgba(99,102,241,0.30); transition: box-shadow .18s, transform .12s; }
                .ec-add-btn:hover { box-shadow: 0 6px 22px rgba(99,102,241,0.40); transform: translateY(-1px); }
                .ec-table-card { background: #fff; border: 1px solid #e8eaf2; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 10px rgba(99,102,241,0.05); }
                .ec-cell-num { font-weight: 700; color: #6366f1; }
                .ec-actions { display: flex; align-items: center; justify-content: center; gap: 8px; }
                .ec-btn-edit, .ec-btn-delete { width: 36px; height: 36px; border-radius: 9px; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: transform .12s, box-shadow .15s; }
                .ec-btn-edit { background: rgba(99,102,241,0.10); border: 1px solid rgba(99,102,241,0.18); }
                .ec-btn-edit:hover { background: rgba(99,102,241,0.18); transform: translateY(-1px); box-shadow: 0 3px 10px rgba(99,102,241,0.15); }
                .ec-btn-delete { background: rgba(244,63,94,0.09); border: 1px solid rgba(244,63,94,0.18); }
                .ec-btn-delete:hover { background: rgba(244,63,94,0.16); transform: translateY(-1px); box-shadow: 0 3px 10px rgba(244,63,94,0.15); }
            `}</style>
            <div className="ec-wrap">
                {dialogue && dialogueType === "background" && <BackgroundDialog />}
                <CommonDialog open={showDeleteDialog} onCancel={() => setShowDeleteDialog(false)} onConfirm={() => { if (selectedId) dispatch(deleteBackground(selectedId)); setShowDeleteDialog(false); }} text="Delete" />
                <div className="ec-topbar">
                    <div className="ec-topbar-left">
                        <div className="ec-topbar-pill" />
                        <h4 className="ec-topbar-title">Backgrounds</h4>
                        <span className="ec-topbar-count">{total ?? 0} total</span>
                    </div>
                    <button className="ec-add-btn" onClick={() => dispatch(openDialog({ type: "background" }))}>
                        <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" viewBox="0 0 24 24">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add Background
                    </button>
                </div>
                <div className="ec-table-card">
                    <Table data={backgrounds} mapData={backgroundTable} PerPage={rowsPerPage} Page={page} type="server" />
                    <Pagination 
                        type="server" 
                        serverPage={page} 
                        setServerPage={setPage} 
                        serverPerPage={rowsPerPage} 
                        totalData={total} 
                        onPageChange={(_e: any, newPage: any) => setPage(newPage)}
                        onRowsPerPageChange={(val: any) => { setRowsPerPage(parseInt(val)); setPage(1); }}
                    />
                </div>
            </div>
        </>
    );
};

BackgroundPage.getLayout = function getLayout(page: React.ReactNode) {
    return <RootLayout>{page}</RootLayout>;
};

export default BackgroundPage;
