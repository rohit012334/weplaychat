import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import TrashIcon from "@/assets/images/delete.svg";
import EditIcon from "@/assets/images/edit.svg";
import CommonDialog from "@/utils/CommonDialog";
import { getEvents, deleteEvent } from "@/store/eventSlice";
import EventDialog from "@/component/event/EventDialog";
import RootLayout from "@/component/layout/Layout";
import { baseURL, getStorageUrl } from "@/utils/config";
import SvgaPlayer from "@/extra/SvgaPlayer";

const EventContent = () => {
    const dispatch = useDispatch();
    const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
    const { events, total, isSkeleton } = useSelector((state: RootStore) => state.event);

    const [rowsPerPage, setRowsPerPage] = useState<number>(10);
    const [page, setPage] = useState<number>(1);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [previewSrc, setPreviewSrc] = useState<string>("");

    useEffect(() => {
        dispatch(getEvents({ start: page, limit: rowsPerPage }));
    }, [dispatch, page, rowsPerPage]);

    const getImageUrl = (p: string) => getStorageUrl(p);

    const eventTable = [
        { Header: "No", Cell: ({ index }: { index: any }) => <span className="bc-cell-num">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span> },
        {
            Header: "Image",
            Cell: ({ row }: { row: any }) => {
                const src = row?.image ? getImageUrl(row.image) : "";
                if (!src) return <span className="bc-no-img">No Image</span>;
                if (src.toLowerCase().endsWith(".svga")) {
                    return (
                        <div style={{ width: "90px", height: "50px", overflow: "hidden", borderRadius: "8px", background: "#f8f9fa", display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-in" }} onClick={() => setPreviewSrc(src)}>
                            <SvgaPlayer url={src} id={`table-event-${row._id}`} key={src} />
                        </div>
                    );
                }
                return (
                    <img
                        src={src}
                        onClick={() => setPreviewSrc(src)}
                        style={{ width: "90px", height: "50px", objectFit: "cover", borderRadius: "8px", border: "1px solid #e8eaf2", cursor: "zoom-in" }}
                        alt="Event"
                    />
                );
            }
        },
        { Header: "Link", Cell: ({ row }: { row: any }) => row?.link ? <a href={row.link} target="_blank" rel="noreferrer" style={{ fontWeight: 700, color: "#6366f1" }}>{row.link}</a> : <span className="bc-title">-</span> },
        {
            Header: "Actions",
            Cell: ({ row }: { row: any }) => (
                <div className="bc-actions">
                    <button className="bc-btn-edit" onClick={() => dispatch(openDialog({ type: "event", data: row }))}>
                        <img src={EditIcon.src} alt="Edit" width={18} height={18} />
                    </button>
                    <button className="bc-btn-delete" onClick={() => { setSelectedId(row?._id); setShowDeleteDialog(true); }}>
                        <img src={TrashIcon.src} alt="Delete" width={18} height={18} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <>
            <style>{`
                .bc-wrap { padding: 20px 24px 32px; }
                .bc-topbar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
                .bc-topbar-left { display: flex; align-items: center; gap: 10px; }
                .bc-topbar-pill { width: 3px; height: 22px; border-radius: 3px; background: linear-gradient(180deg, #6366f1, #a855f7); }
                .bc-topbar-title { font-family: 'Rajdhani', sans-serif; font-size: 18px; font-weight: 700; color: #1e2235; margin: 0; }
                .bc-add-btn { display: inline-flex; align-items: center; gap: 7px; padding: 10px 20px; border-radius: 10px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; border: none; cursor: pointer; font-family: 'Outfit', sans-serif; font-size: 14px; font-weight: 600; box-shadow: 0 4px 16px rgba(99,102,241,0.30); }
                .bc-table-card { background: #fff; border: 1px solid #e8eaf2; border-radius: 14px; overflow: hidden; }
                .bc-cell-num { font-weight: 700; color: #6366f1; }
                .bc-title { font-weight: 600; color: #1e2235; } 
                .bc-actions { display: flex; align-items: center; justify-content: center; gap: 8px; }
                .bc-no-img { color: #a0a8c0; font-weight: 700; }

                .img-preview-overlay {
                  position: fixed;
                  inset: 0;
                  background: rgba(2,6,23,0.66);
                  z-index: 9999;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  padding: 18px;
                }
                .img-preview-card {
                  width: min(920px, 96vw);
                  background: #fff;
                  border-radius: 16px;
                  overflow: hidden;
                  border: 1px solid rgba(255,255,255,0.12);
                  box-shadow: 0 24px 60px rgba(0,0,0,0.35);
                }
                .img-preview-head {
                  display: flex;
                  align-items: center;
                  justify-content: space-between;
                  padding: 12px 14px;
                  border-bottom: 1px solid #e8eaf2;
                  background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.04));
                }
                .img-preview-title {
                  font-weight: 900;
                  color: #1e2235;
                  font-family: 'Outfit', sans-serif;
                }
                .img-preview-close {
                  width: 34px;
                  height: 34px;
                  border-radius: 10px;
                  border: 1px solid #e8eaf2;
                  background: #fff;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  color: #64748b;
                }
                .img-preview-close:hover { color: #1e2235; border-color: rgba(99,102,241,0.25); }
                .img-preview-body { background: #0b1020; }
                .img-preview-body img {
                  width: 100%;
                  height: auto;
                  max-height: min(76vh, 720px);
                  object-fit: contain;
                  display: block;
                }
            `}</style>
            {dialogue && dialogueType === "event" && <EventDialog />}
            <CommonDialog open={showDeleteDialog} onCancel={() => setShowDeleteDialog(false)} onConfirm={() => { dispatch(deleteEvent(selectedId)); setShowDeleteDialog(false); }} text="Delete" />

            {!!previewSrc && (
              <div className="img-preview-overlay" onClick={() => setPreviewSrc("")}>
                <div className="img-preview-card" onClick={(e) => e.stopPropagation()}>
                  <div className="img-preview-head">
                    <div className="img-preview-title">Preview</div>
                    <button className="img-preview-close" type="button" aria-label="Close preview" onClick={() => setPreviewSrc("")}>
                      ✖
                    </button>
                  </div>
                  <div className="img-preview-body">
                    {previewSrc.toLowerCase().endsWith(".svga") ? (
                        <div style={{ width: "100%", height: "min(76vh, 720px)", display: "flex", justifyContent: "center", background: "#f8f9fa" }}>
                            <SvgaPlayer url={previewSrc} id="preview-event-zoom" key={previewSrc} />
                        </div>
                    ) : (
                        <img src={previewSrc} alt="Event preview" />
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="bc-wrap">
                <div className="bc-topbar">
                    <div className="bc-topbar-left">
                        <div className="bc-topbar-pill" />
                        <h4 className="bc-topbar-title">Events</h4>
                    </div>
                    <button className="bc-add-btn" onClick={() => dispatch(openDialog({ type: "event" }))}>Add Event</button>
                </div>
                <div className="bc-table-card">
                    <Table data={events} mapData={eventTable} PerPage={rowsPerPage} Page={page} type="server" />
                    <Pagination type="server" serverPage={page} setServerPage={setPage} serverPerPage={rowsPerPage} onPageChange={(_, p) => setPage(p)} onRowsPerPageChange={(v) => { setRowsPerPage(parseInt(v)); setPage(1); }} totalData={total} />
                </div>
            </div>
        </>
    );
};

EventContent.getLayout = (page: React.ReactNode) => <RootLayout>{page}</RootLayout>;

export default EventContent;
