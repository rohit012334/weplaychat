import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { getLevels } from "@/store/levelSlice";
import { openDialog } from "@/store/dialogSlice";
import RootLayout from "@/component/layout/Layout";
import Pagination from "@/extra/Pagination";
import GiftIcon from "@/assets/images/gift";
import { getStorageUrl } from "@/utils/config";
import LevelDialog from "@/component/level/LevelDialog";
import SvgaPlayer from "@/extra/SvgaPlayer";
import { getFrames } from "@/store/frameSlice";
import { getEntries } from "@/store/entrySlice";
import { getEntryTags } from "@/store/entryTagSlice";
import { getBackgrounds } from "@/store/backgroundSlice";
import { getTags } from "@/store/tagSlice";
import { allGiftApi } from "@/store/giftSlice";

const LevelGiftContent = () => {
  const dispatch = useAppDispatch();
  const { levels, isSkeleton } = useSelector((state: RootStore) => state.level);
  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);

  // For asset resolution
  const { frames } = useSelector((state: RootStore) => state.frame);
  const { entries } = useSelector((state: RootStore) => state.entry);
  const { entryTags } = useSelector((state: RootStore) => state.entryTag);
  const { backgrounds } = useSelector((state: RootStore) => state.background);
  const { tags } = useSelector((state: RootStore) => state.tag);
  const { allGift } = useSelector((state: RootStore) => state.gift);

  // Flatten gifts as they are grouped by category
  const gifts = allGift.flatMap((category: any) => category.gifts || []);

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);

  useEffect(() => {
    dispatch(getLevels());
    // Load assets for display
    dispatch(getFrames({ start: 1, limit: 1000 }));
    dispatch(getEntries({ start: 1, limit: 1000 }));
    dispatch(getEntryTags({ start: 1, limit: 1000 }));
    dispatch(getBackgrounds({ start: 1, limit: 1000 }));
    dispatch(getTags({ start: 1, limit: 1000 }));
    dispatch(allGiftApi());
  }, [dispatch]);

  const renderRewardInfo = (reward: any) => {
    let previewUrl = "";
    let itemName = "";

    // If it has a custom file (uploaded directly for this level)
    if (reward.customFile) {
      previewUrl = getStorageUrl(reward.customFile);
      itemName = reward.customName || reward.itemType;
    } else {
      // Find in global assets by itemId
      let items = [];
      switch (reward.itemType) {
        case "frame": items = frames; break;
        case "entry": items = entries; break;
        case "entryTag": items = entryTags; break;
        case "background": items = backgrounds; break;
        case "tag": items = tags; break;
        case "gift": items = gifts; break;
        default: items = [];
      }
      const item = items.find((i: any) => i._id === reward.itemId);
      if (item) {
        previewUrl = getStorageUrl(item.file || item.image || item.svgaImage || item.webpImage);
        itemName = item.name || item.title || reward.itemType;
      } else {
        itemName = reward.itemType;
      }
    }

    const isSvga = previewUrl.toLowerCase().endsWith(".svga");

    return (
      <div className="reward-item-box" title={itemName}>
        <div className="reward-icon-wrap">
          {previewUrl ? (
            isSvga ? (
              <SvgaPlayer url={previewUrl} id={`reward-${reward._id || Math.random()}`} />
            ) : (
              <img src={previewUrl} alt={itemName} />
            )
          ) : (
             <div className="reward-icon-placeholder">{reward.itemType.charAt(0).toUpperCase()}</div>
          )}
        </div>
        <span className="reward-name-text">{itemName}</span>
      </div>
    );
  };

  const handleChangePage = (_event: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
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
        .lc-table-card {
          background: #fff; border: 1px solid #e8eaf2;
          border-radius: 14px; overflow: hidden;
          box-shadow: 0 1px 10px rgba(99,102,241,0.05);
        }
        .lc-actions { display: flex; align-items: center; justify-content: center; gap: 8px; }
        .lc-btn-gift {
          width: 36px; height: 36px; border-radius: 9px;
          background: rgba(168, 85, 247, 0.10); border: 1px solid rgba(168, 85, 247, 0.18);
          cursor: pointer; display: flex; align-items: center; justify-content: center;
          transition: all .15s;
        }
        .lc-btn-gift:hover { background: rgba(168, 85, 247, 0.18); transform: translateY(-1px); }
        
        /* Reward item styles */
        .reward-grid {
          display: flex; flex-wrap: wrap; gap: 10px; justify-content: center;
        }
        .reward-item-box {
          display: flex; flex-direction: column; align-items: center;
          width: 80px; gap: 4px;
        }
        .reward-icon-wrap {
          width: 48px; height: 48px; border-radius: 10px;
          background: #f8fafc; border: 1px solid #e2e8f0;
          display: flex; align-items: center; justify-content: center;
          overflow: hidden; padding: 4px;
        }
        .reward-icon-wrap img { width: 100%; height: 100%; object-fit: contain; }
        .reward-icon-placeholder {
          font-size: 18px; font-weight: 800; color: #cbd5e1;
        }
        .reward-name-text {
          font-size: 10px; font-weight: 600; color: #64748b;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: 100%;
        }
      `}</style>

      {dialogue && dialogueType === "levelGift" && <LevelDialog />}

      <div className="lc-wrap">
        <div className="lc-topbar">
          <div className="lc-topbar-left">
            <div className="lc-topbar-pill" />
            <h4 className="lc-topbar-title">Manage Level Gifts</h4>
          </div>
        </div>

        <div className="lc-table-card">
          <div className="mainTable">
            <table width="100%" className="primeTable">
              <thead>
                <tr>
                  <th style={{ textAlign: "center", padding: "16px" }}>LEVEL</th>
                  <th style={{ textAlign: "center", padding: "16px" }}>THRESHOLD</th>
                  <th style={{ textAlign: "center", padding: "16px" }}>CURRENT GIFTS</th>
                  <th style={{ textAlign: "center", padding: "16px" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLevels.length > 0 ? (
                  paginatedLevels.map((row: any) => (
                    <tr key={row._id}>
                      <td style={{ textAlign: "center", fontWeight: 700, color: "#6366f1" }}>
                        Level {row.level}
                      </td>
                      <td style={{ textAlign: "center" }}>
                        {row.threshold.toLocaleString()} Coins
                      </td>
                      <td style={{ textAlign: "center", padding: "12px" }}>
                        <div className="reward-grid">
                          {row.rewards?.length > 0 ? (
                             row.rewards.map((r: any, idx: number) => (
                               <div key={idx}>
                                {renderRewardInfo(r)}
                               </div>
                             ))
                          ) : (
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>No Gifts</span>
                          )}
                        </div>
                      </td>
                      <td style={{ textAlign: "center" }}>
                        <div className="lc-actions">
                          <button className="lc-btn-gift" onClick={() => dispatch(openDialog({ type: "levelGift", data: row }))}>
                            <GiftIcon />
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

LevelGiftContent.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default LevelGiftContent;
