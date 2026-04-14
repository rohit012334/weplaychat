import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootStore } from "@/store/store";
import { searchUserForLevel, manualUpdateLevels } from "@/store/levelSlice";
import RootLayout from "@/component/layout/Layout";
import { getStorageUrl } from "@/utils/config";
import EditIcon from "@/assets/images/edit.svg";
import UserPlaceholder from "@/assets/images/user.png";
import { DangerRight, Success } from "@/api/toastServices";

const LevelEditContent = () => {
  const dispatch = useDispatch();
  const { isLoading } = useSelector((state: RootStore) => state.level);

  const [searchId, setSearchId] = useState("");
  const [userData, setUserData] = useState<any>(null);
  const [showModals, setShowModals] = useState(false);
  
  // Levels in modal
  const [userLevel, setUserLevel] = useState(0);
  const [hostLevel, setHostLevel] = useState(0);

  const handleSearch = async () => {
    if (!searchId) return DangerRight("Please enter a Unique ID");
    
    const response = await dispatch(searchUserForLevel(searchId));
    if (response.payload.status) {
      setUserData(response.payload.data);
      setUserLevel(response.payload.data.user.level || 0);
      setHostLevel(response.payload.data.host?.level || 0);
    } else {
      setUserData(null);
      DangerRight(response.payload.message || "User not found");
    }
  };

  const handleUpdate = async () => {
    if (!userData) return;
    
    const payload = {
        userId: userData.user._id,
        userLevel: userLevel,
        hostLevel: userData.user.isHost ? hostLevel : undefined
    };

    const response = await dispatch(manualUpdateLevels(payload));
    if (response.payload.status) {
        setShowModals(false);
        // Refresh local data
        setUserData({
            ...userData,
            user: { ...userData.user, level: userLevel },
            host: userData.host ? { ...userData.host, level: hostLevel } : userData.host
        });
    }
  };

  return (
    <>
      <style>{`
        .le-wrap { padding: 30px; max-width: 1000px; margin: 0 auto; }
        .le-title-row { margin-bottom: 30px; display: flex; align-items: center; gap: 12px; }
        .le-pill { width: 4px; height: 24px; background: linear-gradient(180deg, #6366f1, #a855f7); border-radius: 4px; }
        .le-title { font-size: 22px; font-weight: 700; color: #1e293b; margin: 0; }
        
        .le-search-box {
          background: #fff; padding: 10px; border-radius: 16px;
          display: flex; align-items: center; gap: 10px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.05);
          border: 1px solid #e2e8f0; margin-bottom: 40px;
          transition: all 0.3s;
        }
        .le-search-box:focus-within { border-color: #6366f1; box-shadow: 0 4px 25px rgba(99, 102, 241, 0.15); }
        .le-search-input {
          flex: 1; border: none; outline: none; padding: 10px 15px;
          font-size: 15px; color: #334155;
        }
        .le-search-btn {
          background: #6366f1; color: #fff; border: none; padding: 12px 24px;
          border-radius: 12px; font-weight: 600; cursor: pointer;
          display: flex; align-items: center; gap: 8px; transition: all 0.2s;
        }
        .le-search-btn:hover { background: #4f46e5; transform: translateY(-1px); }

        .le-user-card {
           background: #fff; border-radius: 24px; overflow: hidden;
           box-shadow: 0 10px 30px rgba(0,0,0,0.04);
           border: 1px solid #f1f5f9; display: flex; flex-direction: column;
           animation: slideUp 0.4s ease-out;
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        
        .le-user-header { height: 120px; background: linear-gradient(135deg, #6366f1, #a855f7); position: relative; }
        .le-user-body { padding: 0 30px 30px; margin-top: -50px; display: flex; flex-direction: column; align-items: center; }
        .le-user-img {
          width: 100px; height: 100px; border-radius: 50%; border: 4px solid #fff;
          object-fit: cover; box-shadow: 0 4px 15px rgba(0,0,0,0.1); background: #eee;
        }
        .le-user-name { font-size: 20px; font-weight: 700; color: #1e293b; margin: 15px 0 5px; }
        .le-user-id { font-size: 14px; color: #64748b; font-weight: 500; }
        
        .le-user-stats {
          display: grid; grid-template-columns: 1fr 1fr; gap: 20px; width: 100%;
          margin-top: 30px; padding: 20px; background: #f8fafc; border-radius: 20px;
        }
        .le-stat-item { display: flex; flex-direction: column; align-items: center; }
        .le-stat-val { font-size: 24px; font-weight: 800; color: #6366f1; }
        .le-stat-label { font-size: 12px; font-weight: 600; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.5px; }

        .le-edit-btn {
          margin-top: 30px; background: #1e293b; color: #fff; border: none;
          padding: 14px 40px; border-radius: 14px; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 10px;
          transition: all 0.2s;
        }
        .le-edit-btn:hover { background: #0f172a; transform: scale(1.02); }

        /* Multi-Modal UI */
        .le-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.4);
          backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .le-modal-container {
          background: #fff; border-radius: 32px; width: 100%; max-width: 800px;
          overflow: hidden; display: flex; flex-direction: column;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }
        .le-modal-header {
          padding: 24px 32px; border-bottom: 1px solid #f1f5f9;
          display: flex; align-items: center; justify-content: space-between;
        }
        .le-modal-title { font-size: 20px; font-weight: 700; color: #1e293b; margin: 0; }
        .le-close-btn {
          width: 36px; height: 36px; border-radius: 12px; border: none;
          background: #f1f5f9; display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s;
        }
        .le-close-btn:hover { background: #e2e8f0; }

        .le-modal-body { display: grid; grid-template-columns: 1fr 1fr; gap: 1px; background: #f1f5f9; }
        .le-modal-side { background: #fff; padding: 40px 30px; display: flex; flex-direction: column; align-items: center; }
        .le-side-disabled { opacity: 0.5; pointer-events: none; filter: grayscale(0.8); }
        
        .le-side-title { font-size: 16px; font-weight: 700; color: #64748b; margin-bottom: 25px; }
        .le-level-display {
           width: 120px; height: 120px; border-radius: 50%;
           background: linear-gradient(135deg, #f8fafc, #edf2f7);
           display: flex; flex-direction: column; align-items: center; justify-content: center;
           margin-bottom: 30px; border: 2px solid #e2e8f0;
        }
        .le-level-num { font-size: 42px; font-weight: 900; color: #6366f1; line-height: 1; }
        .le-level-txt { font-size: 12px; font-weight: 700; color: #94a3b8; margin-top: 4px; }

        .le-controls { display: flex; align-items: center; gap: 15px; }
        .le-ctrl-btn {
          width: 40px; height: 40px; border-radius: 12px; border: 1px solid #e2e8f0;
          background: #fff; font-size: 20px; font-weight: 600; color: #1e293b;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .le-ctrl-btn:hover { border-color: #6366f1; color: #6366f1; background: #f5f3ff; }
        .le-ctrl-btn:active { transform: scale(0.95); }

        .le-level-input {
          width: 70px; height: 44px; border-radius: 12px; border: 2px solid #edf2f7;
          text-align: center; font-size: 18px; font-weight: 700; color: #6366f1;
          outline: none; transition: all 0.2s;
        }
        .le-level-input:focus { border-color: #6366f1; background: #f8fafc; }
        .le-level-input::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }

        .le-modal-footer { padding: 24px 32px; border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end; }
        .le-save-btn {
          background: linear-gradient(90deg, #6366f1, #a855f7); color: #fff;
          border: none; padding: 14px 40px; border-radius: 14px; font-weight: 700;
          cursor: pointer; box-shadow: 0 4px 15px rgba(99, 102, 241, 0.3);
          transition: all 0.2s;
        }
        .le-save-btn:hover { transform: scale(1.05); box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4); }
      `}</style>

      <div className="le-wrap">
        <div className="le-title-row">
          <div className="le-pill" />
          <h2 className="le-title">Edit Levels</h2>
        </div>

        <div className="le-search-box">
          <span style={{ fontSize: 18, marginLeft: 15, opacity: 0.6 }}>🔍</span>
          <input
            type="text"
            className="le-search-input"
            placeholder="Search by User Unique ID (e.g. 123456)"
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button className="le-search-btn" onClick={handleSearch} disabled={isLoading}>
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {userData && (
          <div className="le-user-card">
            <div className="le-user-header" />
            <div className="le-user-body">
              <img
                src={userData.user.image ? getStorageUrl(userData.user.image) : UserPlaceholder.src}
                className="le-user-img"
                alt="Profile"
              />
              <h3 className="le-user-name">{userData.user.name || "Unknown User"}</h3>
              <p className="le-user-id">ID: {userData.user.uniqueId}</p>
              
              <div className="le-user-stats">
                <div className="le-stat-item">
                  <span className="le-stat-val">{userData.user.level || 0}</span>
                  <span className="le-stat-label">User Level</span>
                </div>
                <div className="le-stat-item" style={{ opacity: userData.user.isHost ? 1 : 0.4 }}>
                  <span className="le-stat-val">{userData.host?.level || 0}</span>
                  <span className="le-stat-label">Host Level</span>
                </div>
              </div>

              <button className="le-edit-btn" onClick={() => setShowModals(true)}>
                <img src={EditIcon.src} width={18} alt="Edit" />
                Edit Levels
              </button>
            </div>
          </div>
        )}
      </div>

      {showModals && (
        <div className="le-overlay">
          <div className="le-modal-container">
            <div className="le-modal-header">
              <h3 className="le-modal-title">Level Management</h3>
              <button className="le-close-btn" onClick={() => setShowModals(false)}>
                <span style={{ fontSize: 18 }}>✖</span>
              </button>
            </div>

            <div className="le-modal-body">
              {/* User Level Modal Side */}
              <div className="le-modal-side">
                <span className="le-side-title">USER LEVEL</span>
                <div className="le-level-display">
                  <span className="le-level-num">{userLevel}</span>
                  <span className="le-level-txt">LEVEL</span>
                </div>
                <div className="le-controls">
                  <button className="le-ctrl-btn" onClick={() => setUserLevel(prev => Math.max(0, prev - 1))}>−</button>
                  <input
                    type="number"
                    className="le-level-input"
                    value={userLevel}
                    onChange={(e) => setUserLevel(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <button className="le-ctrl-btn" onClick={() => setUserLevel(prev => prev + 1)}>+</button>
                </div>
              </div>

              {/* Host Level Modal Side */}
              <div className={`le-modal-side ${!userData?.user?.isHost ? 'le-side-disabled' : ''}`}>
                <span className="le-side-title">HOST LEVEL</span>
                <div className="le-level-display">
                  <span className="le-level-num">{hostLevel}</span>
                  <span className="le-level-txt">LEVEL</span>
                </div>
                <div className="le-controls">
                  <button className="le-ctrl-btn" onClick={() => setHostLevel(prev => Math.max(0, prev - 1))}>−</button>
                  <input
                    type="number"
                    className="le-level-input"
                    value={hostLevel}
                    onChange={(e) => setHostLevel(Math.max(0, parseInt(e.target.value) || 0))}
                  />
                  <button className="le-ctrl-btn" onClick={() => setHostLevel(prev => prev + 1)}>+</button>
                </div>
                {!userData?.user?.isHost && (
                  <span style={{ marginTop: 15, fontSize: 11, color: '#ef4444', fontWeight: 600 }}>Not a Host</span>
                )}
              </div>
            </div>

            <div className="le-modal-footer">
              <button className="le-save-btn" onClick={handleUpdate} disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

LevelEditContent.getLayout = function getLayout(page: any) {
  return <RootLayout>{page}</RootLayout>;
};

export default LevelEditContent;
