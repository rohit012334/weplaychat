import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { getLevels, initLevels } from "@/store/levelSlice";
import { openDialog } from "@/store/dialogSlice";
import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import EditIcon from "@/assets/images/edit.svg";
import { getStorageUrl } from "@/utils/config";
import LevelDialog from "@/component/level/LevelDialog";
import SvgaPlayer from "@/extra/SvgaPlayer";

const LevelContent = () => {
  const dispatch = useDispatch();
  const { levels, isSkeleton } = useSelector((state: RootStore) => state.level);
  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    dispatch(getLevels());
  }, [dispatch]);

  const handleChangePage = (_event: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  const handleInit = () => {
    if (window.confirm("Initialize levels? This will populate 100 levels if none exist.")) {
      dispatch(initLevels());
    }
  };

  const renderMedia = (path: string, id: string) => {
    if (!path) return <div className="lc-no-img">No Image</div>;
    const url = getStorageUrl(path);
    if (path.toLowerCase().endsWith(".svga")) {
      return (
        <div style={{ width: "50px", height: "50px", overflow: "hidden" }}>
          <SvgaPlayer url={url} id={id} />
        </div>
      );
    }
    return <img src={url} className="lc-img-preview" alt="Level" />;
  };
  const paginatedLevels = levels.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  return (
    <>
      <style>{`
        .lc-wrap { padding: 20px 24px 32px; }
        .lc-topbar {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .lc-topbar-left { display: flex; align-items: center; gap: 10px; }
        .lc-topbar-pill {
          width: 3px; height: 22px; border-radius: 3px;
          background: linear-gradient(180deg, #6366f1, #a855f7);
        }
        .lc-topbar-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px; font-weight: 700; color: #1e2235; margin: 0;
        }
        .lc-init-btn {
          padding: 8px 16px; border-radius: 8px;
          background: #f1f5f9; color: #64748b; border: 1px solid #e2e8f0;
          cursor: pointer; font-size: 13px; font-weight: 600;
          transition: all .2s;
        }
        .lc-init-btn:hover { background: #e2e8f0; color: #1e293b; }
        .lc-table-card {
          background: #fff; border: 1px solid #e8eaf2;
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 1px 10px rgba(99,102,241,0.05);
        }
        .lc-actions { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .lc-btn-edit {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(99,102,241,0.10); border: 1px solid rgba(99,102,241,0.18);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all .15s;
        }
        .lc-btn-edit:hover { background: rgba(99,102,241,0.18); transform: translateY(-1px); }
        .lc-img-preview {
          width: 50px; height: 50px; object-fit: contain;
          border-radius: 6px; border: 1px solid #eee;
        }
        .lc-no-img {
          width: 50px; height: 50px; background: #fafafa;
          border-radius: 6px; border: 1px dashed #ddd;
          display: flex; alignItems: center; justifyContent: center;
          font-size: 10px; color: #aaa;
        }
      `}</style>

      {dialogue && dialogueType === "level" && <LevelDialog />}

      <div className="lc-wrap">
        <div className="lc-topbar">
          <div className="lc-topbar-left">
            <div className="lc-topbar-pill" />
            <h4 className="lc-topbar-title">Manage Levels</h4>
          </div>
          {levels.length === 0 && (
            <button className="lc-init-btn" onClick={handleInit}>
              Initialize 100 Levels
            </button>
          )}
        </div>

        <div className="lc-table-card">
          <div className="mainTable">
            <table width="100%" className="primeTable">
              <thead>
                <tr>
                  <th style={{ textAlign: "center", padding: "16px" }}>LEVEL</th>
                  <th style={{ textAlign: "center", padding: "16px" }}>USER Level</th>
                  <th style={{ textAlign: "center", padding: "16px" }}>HOST Level</th>
                  <th style={{ textAlign: "center", padding: "16px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLevels.length > 0 ? (
                  paginatedLevels.map((row: any) => (
                    <tr key={row._id}>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "#6366f1" }}>
                        {row.level}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {renderMedia(row.userImage, `user-lvl-${row.level}`)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {renderMedia(row.hostImage, `host-lvl-${row.level}`)}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="lc-actions">
                          <button className="lc-btn-edit" onClick={() => dispatch(openDialog({ type: "level", data: row }))}>
                            <img src={EditIcon.src} width={18} height={18} alt="Edit" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                      {isSkeleton ? "Loading..." : "No Levels Found!"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <Pagination
            type="server"
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={levels.length}
          />
        </div>
      </div>
    </>
  );
};

LevelContent.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default LevelContent;
