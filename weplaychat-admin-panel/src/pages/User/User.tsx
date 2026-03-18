import Pagination from "@/extra/Pagination";
import Table from "@/extra/Table";
import { openDialog } from "@/store/dialogSlice";
import { getHostRequest, hostRequestUpdate } from "@/store/hostRequestSlice";
import { RootStore } from "@/store/store";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useRouter } from "next/router";
import info from "@/assets/images/info.svg";
import edit from "@/assets/images/edit.svg";
import { baseURL } from "@/utils/config";
import male from "@/assets/images/male.png";
import { blockuser, getRealOrFakeUser } from "@/store/userSlice";
import ToggleSwitch from "@/extra/TogggleSwitch";
import RootLayout from "@/component/layout/Layout";
import Analytics from "@/extra/Analytic";
import Searching from "@/extra/Searching";
import historyInfo from "@/assets/images/history1.png";
import coin from "@/assets/images/coin.png";
import notification from "@/assets/images/notification1.svg";
import NotificationDialog from "@/component/user/NotificationDialogue";
import Image from "next/image";
import { getCountryCodeFromEmoji } from "@/utils/Common";
import india from "@/assets/images/india.png";
import { isSkeleton } from "@/utils/allSelector";
import UserShimmer from "@/component/Shimmer/UserShimmer";
import AgencyDialog from "@/component/agency/AgencyDialog";
import CoinUpdateDialog from "@/component/coinPlan/CoinUpdateDialog";

interface SuggestedServiceData {
  _id: string;
  doctor: string;
  name: string;
  gender: string;
  email: string;
  age: number;
  dob: any;
  description: string;
  country: string;
  impression: string;
}

const User = (props: any) => {
  const dispatch = useDispatch();
  const [startDate, setStartDate] = useState("All");
  const [endDate, setEndDate] = useState("All");
  const router = useRouter();

  const roleSkeleton = useSelector(isSkeleton);
  const { currentRole: roleFromStore } = useSelector((state: RootStore) => state?.admin);
  const role =
    roleFromStore ??
    (typeof window !== "undefined" ? sessionStorage.getItem("currentRole") : null);

  const [expanded, setExpanded] = useState<{ [key: number]: boolean }>({});
  const toggleReview = (index: number) => {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page, setPage] = useState<number>(1);
  const { user, total } = useSelector((state: RootStore) => state.user);
  const [data, setData] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  const handleChangePage = (event: any, newPage: any) => setPage(newPage);

  useEffect(() => {
    const payload = { start: page, limit: rowsPerPage, startDate, endDate, search };
    dispatch(getRealOrFakeUser(payload));
  }, [dispatch, page, rowsPerPage, startDate, endDate, search]);

  const handleChangeRowsPerPage = (event: any) => {
    setRowsPerPage(parseInt(event, 10));
    setPage(1);
  };

  const handleFilterData = (filteredData: any) => {
    if (typeof filteredData === "string") setSearch(filteredData);
    else setData(filteredData);
  };

  const handleInfo = (row: any) => {
    router.push({ pathname: "/User/UserInfoPage", query: { id: row?._id } });
    typeof window !== "undefined" && localStorage.setItem("userData", JSON.stringify(row));
  };

  const handleRedirect = (row: any) => {
    router.push({ pathname: "/User/CoinPlanHistoryPage", query: { id: row?._id } });
    typeof window !== "undefined" && localStorage.setItem("userData", JSON.stringify(row));
  };

  const handleNotify = (id: any) => {
    dispatch(openDialog({ type: "notification", data: { id, type: "user" } }));
  };

  const handleEdit = (row: any) => {
    dispatch(openDialog({ type: "Coin", data: { id: row?._id, type: "Coin", coin: row?.coin } }));
  };

  const userTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="u-idx">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "User",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        const rawImagePath = row?.image || "";
        const normalizedImagePath = rawImagePath.replace(/\\/g, "/");
        const imageUrl = normalizedImagePath.includes("storage")
          ? baseURL + normalizedImagePath
          : normalizedImagePath;

        const loginLabel =
          row?.loginType === 1 ? "Apple"
          : row?.loginType === 2 ? "Google"
          : row?.loginType === 3 ? "Quick"
          : null;

        const loginColor =
          row?.loginType === 1 ? "#1c1c1e"
          : row?.loginType === 2 ? "#ea4335"
          : "#6366f1";

        return (
          <div className="u-user-cell" onClick={() => router.push({ pathname: "/User/UserInfoPage", query: { id: row?._id } })}>
            <div className="u-avatar-wrap">
              <img
                src={row?.image ? imageUrl : male.src}
                referrerPolicy="no-referrer"
                alt="avatar"
                className="u-avatar"
              />
              <span className={`u-online-dot ${row?.isOnline ? "online" : ""}`}/>
            </div>
            <div className="u-user-info">
              <p className="u-user-name">{row?.name || "—"}</p>
              <p className="u-user-uid">#{row?.uniqueId || "—"}</p>
              {loginLabel && (
                <span className="u-login-badge" style={{ background: `${loginColor}18`, color: loginColor }}>
                  {loginLabel}
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      Header: "Email",
      Cell: ({ row }: { row: any }) => (
        <span className="u-email">{row?.email || "—"}</span>
      ),
    },
    {
      Header: "Country",
      Cell: ({ row }: { row: any }) => {
        const countryName = row?.country || "—";
        const emoji = row?.countryFlagImage;
        const countryCode = getCountryCodeFromEmoji(emoji);
        const flagImageUrl = countryCode ? `https://flagcdn.com/w80/${countryCode}.png` : null;
        return (
          <div className="u-country">
            <img
              src={flagImageUrl || india.src}
              className="u-flag"
              alt={countryName}
            />
            <span>{countryName}</span>
          </div>
        );
      },
    },
    {
      Header: "Coins",
      Cell: ({ row }: { row: any }) => (
        <div className="u-coin-cell">
          <img src={coin.src} height={18} width={18} alt="coin"/>
          <span>{(row?.coin || 0).toLocaleString()}</span>
        </div>
      ),
    },
    {
      Header: "Recharged",
      Cell: ({ row }: { row: any }) => (
        <span className="u-stat">{(row?.rechargedCoins || 0).toLocaleString()}</span>
      ),
    },
    {
      Header: "Following",
      Cell: ({ row }: { row: any }) => (
        <span className="u-stat">{row?.totalFollowings || 0}</span>
      ),
    },
    {
      Header: "Online",
      Cell: ({ row }: { row: any }) => (
        <span className={`u-status-pill ${row?.isOnline ? "yes" : "no"}`}>
          {row?.isOnline ? "Online" : "Offline"}
        </span>
      ),
    },
    {
      Header: "Host",
      Cell: ({ row }: { row: any }) => (
        <span className={`u-status-pill ${row?.isHost ? "yes" : "no"}`}>
          {row?.isHost ? "Yes" : "No"}
        </span>
      ),
    },
    {
      Header: "VIP",
      Cell: ({ row }: { row: any }) => (
        <span className={`u-status-pill ${row?.isVip ? "vip" : "no"}`}>
          {row?.isVip ? "✦ VIP" : "No"}
        </span>
      ),
    },
    {
      Header: "Joined",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        const formatted = isNaN(date.getTime()) ? "—"
          : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
        return <span className="u-date">{formatted}</span>;
      },
    },
    {
      Header: "Block",
      body: "isBlock",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={row?.isBlock}
          onClick={() => dispatch(blockuser(row?._id))}
        />
      ),
    },
    {
      Header: "Actions",
      Cell: ({ row }: { row: any }) => {
        const isAllowed = role === "superadmin";
        return (
          <div className="u-actions">
            {/* Edit Coin */}
            <button
              className="u-act-btn edit"
              title="Edit Coin"
              onClick={() => { if (isAllowed) handleEdit(row); }}
              disabled={!isAllowed}
              style={{ opacity: isAllowed ? 1 : 0.4 }}
            >
              <img src={edit.src} height={17} width={17} alt="edit"/>
            </button>
            {/* Info */}
            <button className="u-act-btn info" title="User Info" onClick={() => handleInfo(row)}>
              <img src={info.src} height={17} width={17} alt="info"/>
            </button>
            {/* Notify */}
            <button className="u-act-btn notify" title="Send Notification" onClick={() => handleNotify(row?._id)}>
              <img src={notification.src} height={17} width={17} alt="notify"/>
            </button>
            {/* History */}
            <button className="u-act-btn history" title="Coin History" onClick={() => handleRedirect(row)}>
              <img src={historyInfo.src} height={17} width={17} alt="history"/>
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        .u-page {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.16);
          --a-glow:   rgba(99,102,241,0.18);
          --border:   #e8eaf2;
          --txt:      #64748b;
          --txt-dark: #1e2235;
          --txt-dim:  #a0a8c0;
          --white:    #ffffff;
          --bg:       #f4f5fb;
          --green:    #10b981;
          --red:      #f43f5e;
          --amber:    #f59e0b;

          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── Top bar ── */
        .u-page .u-topbar {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 18px;
          padding: 16px 20px;
          margin-bottom: 20px;
          box-shadow: 0 2px 14px rgba(99,102,241,0.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          position: relative;
          overflow: hidden;
        }
        .u-page .u-topbar::before {
          content: '';
          position: absolute; left: 0; top: 0; bottom: 0; width: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          border-radius: 0 3px 3px 0;
        }
        .u-page .u-topbar-left { display: flex; align-items: center; gap: 10px; padding-left: 10px; }
        .u-page .u-topbar-pill {
          width: 4px; height: 22px; border-radius: 4px; flex-shrink: 0;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
        }
        .u-page .u-topbar-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 20px; font-weight: 700; color: var(--txt-dark); margin: 0;
        }
        .u-page .u-topbar-count {
          background: var(--a-soft); color: var(--accent);
          font-size: 12px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid var(--a-mid);
        }
        .u-page .u-topbar-right {
          display: flex; align-items: center; gap: 12px; flex-wrap: wrap;
        }

        /* ── Search box override wrapper ── */
        .u-page .u-search-wrap {
          min-width: 260px;
        }

        /* ── Table card ── */
        .u-page .u-table-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 18px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }
        .u-page .u-table-card .u-table-head {
          padding: 14px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
          display: flex; align-items: center; justify-content: space-between;
        }
        .u-page .u-table-head-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 15px; font-weight: 700; color: var(--txt-dark);
        }
        .u-page .u-table-inner { padding: 0; }
        .u-page .u-pagination { padding: 16px 20px; border-top: 1px solid var(--border); }

        /* ── Table cell styles ── */
        .u-idx {
          font-size: 13px; font-weight: 600; color: var(--txt-dim);
          background: var(--bg); border-radius: 7px;
          padding: 4px 10px; display: inline-block;
        }

        .u-user-cell {
          display: flex; align-items: center; gap: 11px;
          cursor: pointer; padding: 4px 0;
          min-width: 200px;
        }
        .u-avatar-wrap { position: relative; flex-shrink: 0; }
        .u-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border);
          transition: box-shadow .15s;
        }
        .u-user-cell:hover .u-avatar {
          box-shadow: 0 0 0 3px var(--a-mid);
        }
        .u-online-dot {
          position: absolute; bottom: 1px; right: 1px;
          width: 9px; height: 9px; border-radius: 50%;
          background: var(--txt-dim); border: 2px solid #fff;
        }
        .u-online-dot.online { background: var(--green); }

        .u-user-name {
          font-size: 13.5px; font-weight: 600; color: var(--txt-dark);
          margin: 0 0 2px; white-space: nowrap;
        }
        .u-user-uid {
          font-size: 11px; color: var(--txt-dim); margin: 0 0 3px;
        }
        .u-login-badge {
          font-size: 10px; font-weight: 700; letter-spacing: .4px;
          padding: 2px 7px; border-radius: 10px;
          display: inline-block;
        }

        .u-email {
          font-size: 13px; color: var(--txt); max-width: 180px;
          display: inline-block; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }

        .u-country {
          display: flex; align-items: center; gap: 8px;
          font-size: 13px; color: var(--txt-dark); font-weight: 500;
          white-space: nowrap;
        }
        .u-flag {
          width: 28px; height: 28px; border-radius: 50%;
          object-fit: cover; border: 1.5px solid var(--border);
          flex-shrink: 0;
        }

        .u-coin-cell {
          display: flex; align-items: center; gap: 6px;
          font-size: 13.5px; font-weight: 600; color: var(--txt-dark);
        }

        .u-stat {
          font-size: 13.5px; font-weight: 600; color: var(--txt-dark);
        }

        .u-status-pill {
          display: inline-block;
          font-size: 11.5px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          white-space: nowrap;
        }
        .u-status-pill.yes  { background: rgba(16,185,129,0.10); color: var(--green); }
        .u-status-pill.no   { background: rgba(100,116,139,0.09); color: #94a3b8; }
        .u-status-pill.vip  { background: rgba(245,158,11,0.12); color: var(--amber); }

        .u-date {
          font-size: 12.5px; color: var(--txt); white-space: nowrap;
        }

        /* ── Action buttons ── */
        .u-actions {
          display: flex; align-items: center; gap: 6px;
        }
        .u-act-btn {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          border: none; cursor: pointer;
          transition: transform .13s, box-shadow .13s;
          flex-shrink: 0;
        }
        .u-act-btn:hover:not(:disabled) { transform: translateY(-2px); }
        .u-act-btn:disabled { cursor: not-allowed; }

        .u-act-btn.edit    { background: #e0e7ff; }
        .u-act-btn.edit:hover:not(:disabled) { box-shadow: 0 3px 10px rgba(99,102,241,0.25); }

        .u-act-btn.info    { background: #e0f2fe; }
        .u-act-btn.info:hover { box-shadow: 0 3px 10px rgba(14,165,233,0.22); }

        .u-act-btn.notify  { background: #fff7ed; }
        .u-act-btn.notify:hover { box-shadow: 0 3px 10px rgba(249,115,22,0.22); }

        .u-act-btn.history { background: #fce7f3; }
        .u-act-btn.history:hover { box-shadow: 0 3px 10px rgba(236,72,153,0.20); }
      `}</style>

      <div className="u-page">
        {dialogueType === "notification" && <NotificationDialog />}
        {dialogueType === "Coin" && <CoinUpdateDialog />}

        {/* ── Top bar ── */}
        <div className="u-topbar">
          <div className="u-topbar-left">
            <div className="u-topbar-pill"/>
            <h1 className="u-topbar-title">User Management</h1>
            <span className="u-topbar-count">{total?.toLocaleString() || 0} Users</span>
          </div>
          <div className="u-topbar-right">
            <Analytics
              analyticsStartDate={startDate}
              analyticsStartEnd={endDate}
              analyticsStartDateSet={setStartDate}
              analyticsStartEndSet={setEndDate}
              direction={"end"}
            />
            <div className="u-search-wrap">
              <Searching
                type="server"
                data={user}
                setData={setData}
                column={userTable}
                serverSearching={handleFilterData}
                placeholder="Search by Name / Unique ID"
              />
            </div>
          </div>
        </div>

        {/* ── Table card ── */}
        <div className="u-table-card">
          <div className="u-table-head">
            <span className="u-table-head-title">All Users</span>
          </div>
          <div className="u-table-inner">
            <Table
              data={user}
              mapData={userTable}
              PerPage={rowsPerPage}
              Page={page}
              type="server"
              shimmer={<UserShimmer />}
            />
          </div>
          <div className="u-pagination">
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
      </div>
    </>
  );
};

User.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default User;