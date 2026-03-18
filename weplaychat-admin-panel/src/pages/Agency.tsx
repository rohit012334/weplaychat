import RootLayout from "@/component/layout/Layout";
import Button from "@/extra/Button";
import { openDialog } from "@/store/dialogSlice";
import { useDispatch, useSelector } from "react-redux";
import image from "@/assets/images/bannerImage.png";
import { RootStore } from "@/store/store";
import AgencyDialog from "@/component/agency/AgencyDialog";
import { useEffect, useState } from "react";
import { baseURL } from "@/utils/config";
import ToggleSwitch from "@/extra/TogggleSwitch";
import { blockUnblockAgency, getAllAgency } from "@/store/agencySlice";
import { useRouter } from "next/router";
import male from "@/assets/images/male.png";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import Analytics from "@/extra/Analytic";
import Searching from "@/extra/Searching";
import { getDefaultCurrency } from "@/store/settingSlice";
import EditIcon from "@/assets/images/edit.svg";
import agencyWiseHost from "@/assets/images/agencyWiseHost.svg";
import india from "@/assets/images/india.png";
import AgencyShimmer from "@/component/Shimmer/AgencyShimmer";

const Agency = () => {
  const dispatch = useDispatch();
  const { dialogue, dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);
  const { agency, total } = useSelector((state: RootStore) => state.agency);
  const router = useRouter();

  const [rowsPerPage, setRowsPerPage] = useState<number>(10);
  const [page,        setPage]        = useState<number>(1);
  const [search,      setSearch]      = useState("");
  const [data,        setData]        = useState<any[]>([]);
  const [startDate,   setStartDate]   = useState("All");
  const [endDate,     setEndDate]     = useState("All");

  useEffect(() => {
    dispatch(getAllAgency({ search, start: page, limit: rowsPerPage, startDate, endDate }));
  }, [dispatch, search, page, rowsPerPage, startDate, endDate]);

  useEffect(() => { dispatch(getDefaultCurrency()); }, [dispatch]);

  const handleChangePage = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => { setRowsPerPage(parseInt(event, 10)); setPage(1); };
  const handleFilterData = (filteredData: any) => { if (typeof filteredData === "string") setSearch(filteredData); };

  const handleInfo = (row: any) => {
    router.push({ pathname: "/Host/AgencyWiseHost", query: { id: row?._id } });
    typeof window !== "undefined" && localStorage.setItem("agencyData", JSON.stringify(row));
  };

  const agencyTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: any }) => (
        <span className="ag-cell-no">{(page - 1) * rowsPerPage + parseInt(index) + 1}</span>
      ),
    },
    {
      Header: "Agency",
      body: "profilePic",
      Cell: ({ row }: { row: any }) => {
        const updatedImagePath = row?.image ? row.image.replace(/\\/g, "/") : "";
        return (
          <div className="ag-agency-cell">
            <div className="ag-avatar-wrap">
              <img
                src={row?.image ? baseURL + updatedImagePath : male.src}
                alt={row?.name}
                loading="eager"
                draggable="false"
                className="ag-avatar"
                onError={(e: any) => { e.target.onerror = null; e.target.src = male.src; }}
              />
              <span className="ag-avatar-status"/>
            </div>
            <div className="ag-agency-info">
              <p className="ag-agency-name">{row?.name || "—"}</p>
              <p className="ag-agency-code">{row?.agencyCode || "—"}</p>
            </div>
          </div>
        );
      },
    },
    {
      Header: "Comm. / Salary",
      Cell: ({ row }: { row: any }) => (
        <span className="ag-badge ag-badge-purple">
          {row?.commissionType === 2 ? `${row?.commission || 0} (Salary)` : `${row?.commission || 0}%`}
        </span>
      ),
    },
    {
      Header: "Email",
      Cell: ({ row }: { row: any }) => (
        <span className="ag-cell-text">{row?.email || "—"}</span>
      ),
    },
    {
      Header: "Mobile",
      Cell: ({ row }: { row: any }) => (
        <span className="ag-cell-text">
          {row?.countryCode && row?.mobileNumber ? `+${row.countryCode} ${row.mobileNumber}` : "—"}
        </span>
      ),
    },
    {
      Header: "Password",
      Cell: ({ row }: { row: any }) => (
        <span className="ag-cell-text ag-cell-mono">{row?.password || "—"}</span>
      ),
    },
    {
      Header: "Country",
      Cell: ({ row }: { row: any }) => (
        <div className="ag-country-cell">
          <img
            src={row?.countryFlagImage || india.src}
            alt={row?.country || "Flag"}
            className="ag-flag"
          />
          <span className="ag-cell-text">{row?.country || "—"}</span>
        </div>
      ),
    },
    {
      Header: "Host Coins",
      Cell: ({ row }: { row: any }) => (
        <span className="ag-badge ag-badge-amber">{row?.hostCoins?.toFixed(2) || 0}</span>
      ),
    },
    {
      Header: `Earning (${defaultCurrency?.symbol})`,
      Cell: ({ row }: { row: any }) => (
        <span className="ag-badge ag-badge-green">{row?.totalEarnings || 0}</span>
      ),
    },
    {
      Header: "Hosts",
      Cell: ({ row }: { row: any }) => (
        <span className="ag-badge ag-badge-blue">{row?.totalHosts || 0}</span>
      ),
    },
    {
      Header: "Created At",
      Cell: ({ row }: { row: any }) => {
        const date = new Date(row?.createdAt);
        return (
          <span className="ag-cell-date">
            {isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        );
      },
    },
    {
      Header: "Status",
      body: "isBlock",
      Cell: ({ row }: { row: any }) => (
        <ToggleSwitch
          value={row?.isBlock}
          onClick={() => dispatch(blockUnblockAgency(row?._id))}
        />
      ),
    },
    {
      Header: "Hosts",
      Cell: ({ row }: { row: any }) => (
        <button className="ag-action-btn ag-action-view" onClick={() => handleInfo(row)} title="View Hosts">
          <img src={agencyWiseHost.src} height={18} width={18} alt="View Hosts"/>
        </button>
      ),
    },
    {
      Header: "Action",
      Cell: ({ row }: { row: any }) => (
        <button
          className="ag-action-btn ag-action-edit"
          onClick={() => dispatch(openDialog({ type: "agency", data: row }))}
          title="Edit Agency"
        >
          <img src={EditIcon.src} alt="Edit" width={16} height={16}/>
        </button>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .ag-page {
          --accent:    #6366f1;
          --accent2:   #a855f7;
          --a-soft:    rgba(99,102,241,0.09);
          --a-mid:     rgba(99,102,241,0.16);
          --a-glow:    rgba(99,102,241,0.20);
          --green:     #10b981;
          --g-soft:    rgba(16,185,129,0.10);
          --amber:     #f59e0b;
          --am-soft:   rgba(245,158,11,0.10);
          --blue:      #3b82f6;
          --bl-soft:   rgba(59,130,246,0.10);
          --rose:      #f43f5e;
          --r-soft:    rgba(244,63,94,0.09);
          --border:    #e8eaf2;
          --txt:       #64748b;
          --txt-dark:  #1e2235;
          --txt-dim:   #a0a8c0;
          --white:     #ffffff;
          --bg:        #f4f5fb;

          font-family: 'Outfit', sans-serif;
          padding: 28px 28px 48px;
          background: var(--bg);
          min-height: 100vh;
          box-sizing: border-box;
        }

        /* ── Page header ── */
        .ag-page .ag-header {
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 20px;
        }
        .ag-page .ag-header-left { display: flex; align-items: center; gap: 12px; }
        .ag-page .ag-header-pill {
          width: 4px; height: 28px; border-radius: 4px;
          background: linear-gradient(180deg, var(--accent), var(--accent2));
          flex-shrink: 0;
        }
        .ag-page .ag-title {
          font-family: 'Rajdhani', sans-serif; font-size: 22px;
          font-weight: 700; color: var(--txt-dark); line-height: 1.1; margin: 0;
        }
        .ag-page .ag-sub { font-size: 12px; color: var(--txt-dim); margin-top: 2px; }

        /* Add button override */
        .ag-page .ag-add-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--a-glow);
          transition: box-shadow .15s, transform .13s;
        }
        .ag-page .ag-add-btn:hover { box-shadow: 0 6px 20px var(--a-glow); transform: translateY(-1px); }

        /* ── Filter bar ── */
        .ag-page .ag-filters {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px;
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 14px;
          padding: 14px 18px;
          margin-bottom: 18px;
          box-shadow: 0 1px 8px rgba(99,102,241,0.05);
        }

        /* ── Stats strip ── */
        .ag-page .ag-stats {
          display: grid; grid-template-columns: repeat(4,1fr); gap: 14px;
          margin-bottom: 18px;
        }
        .ag-page .ag-stat {
          background: var(--white); border: 1.5px solid var(--border);
          border-radius: 14px; padding: 16px;
          display: flex; align-items: center; gap: 12px;
          transition: box-shadow .18s, transform .15s; cursor: default;
        }
        .ag-page .ag-stat:hover { box-shadow: 0 4px 18px var(--a-soft); transform: translateY(-2px); }
        .ag-page .ag-stat-icon {
          width: 40px; height: 40px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center; flex-shrink: 0;
        }
        .ag-page .si-p { background: var(--a-soft);  color: var(--accent); }
        .ag-page .si-g { background: var(--g-soft);  color: var(--green); }
        .ag-page .si-a { background: var(--am-soft); color: var(--amber); }
        .ag-page .si-b { background: var(--bl-soft); color: var(--blue); }
        .ag-page .ag-stat-val { font-family:'Rajdhani',sans-serif; font-size:22px; font-weight:700; color:var(--txt-dark); line-height:1.1; }
        .ag-page .ag-stat-lbl { font-size:11.5px; color:var(--txt-dim); font-weight:500; }

        /* ── Table card ── */
        .ag-page .ag-table-card {
          background: var(--white);
          border: 1px solid var(--border);
          border-radius: 16px;
          box-shadow: 0 2px 18px rgba(99,102,241,0.06);
          overflow: hidden;
        }

        .ag-page .ag-table-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border);
          background: linear-gradient(135deg, rgba(99,102,241,0.04), rgba(168,85,247,0.02));
        }
        .ag-page .ag-table-title {
          font-family: 'Rajdhani', sans-serif; font-size: 16px; font-weight: 700; color: var(--txt-dark);
        }
        .ag-page .ag-count {
          background: var(--a-soft); color: var(--accent);
          font-size: 12px; font-weight: 700;
          padding: 3px 10px; border-radius: 20px;
          border: 1px solid var(--a-mid);
        }

        /* ── Table cell styles ── */
        .ag-page .ag-cell-no {
          font-family: 'Rajdhani', sans-serif; font-weight: 700;
          color: var(--txt-dim); font-size: 14px;
        }

        .ag-page .ag-agency-cell {
          display: flex; align-items: center; gap: 12px;
          padding: 4px 0;
        }
        .ag-page .ag-avatar-wrap { position: relative; flex-shrink: 0; }
        .ag-page .ag-avatar {
          width: 42px; height: 42px; border-radius: 50%;
          object-fit: cover;
          border: 2px solid var(--border);
          display: block;
        }
        .ag-page .ag-avatar-status {
          position: absolute; bottom: 1px; right: 1px;
          width: 10px; height: 10px; border-radius: 50%;
          background: var(--green);
          border: 2px solid var(--white);
        }
        .ag-page .ag-agency-name {
          font-size: 13.5px; font-weight: 600; color: var(--txt-dark);
          margin: 0; line-height: 1.3;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 140px;
        }
        .ag-page .ag-agency-code {
          font-size: 11px; color: var(--txt-dim); margin: 0; font-weight: 500;
        }

        .ag-page .ag-cell-text {
          font-size: 13px; color: var(--txt); font-weight: 500;
          white-space: nowrap;
        }
        .ag-page .ag-cell-mono { font-family: monospace; font-size: 12px; }
        .ag-page .ag-cell-date { font-size: 12.5px; color: var(--txt-dim); font-weight: 500; white-space: nowrap; }

        /* Country cell */
        .ag-page .ag-country-cell { display: flex; align-items: center; gap: 8px; }
        .ag-page .ag-flag {
          width: 28px; height: 28px; border-radius: 50%;
          object-fit: cover; border: 1.5px solid var(--border); flex-shrink: 0;
        }

        /* Badges */
        .ag-page .ag-badge {
          display: inline-flex; align-items: center;
          padding: 3px 10px; border-radius: 20px;
          font-size: 12px; font-weight: 700; white-space: nowrap;
        }
        .ag-page .ag-badge-purple { background: var(--a-soft);  color: var(--accent); border: 1px solid var(--a-mid); }
        .ag-page .ag-badge-green  { background: var(--g-soft);  color: var(--green);  border: 1px solid rgba(16,185,129,.2); }
        .ag-page .ag-badge-amber  { background: var(--am-soft); color: var(--amber);  border: 1px solid rgba(245,158,11,.2); }
        .ag-page .ag-badge-blue   { background: var(--bl-soft); color: var(--blue);   border: 1px solid rgba(59,130,246,.2); }

        /* Action buttons */
        .ag-page .ag-action-btn {
          width: 34px; height: 34px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer;
          transition: background .14s, border-color .14s, transform .12s;
        }
        .ag-page .ag-action-edit:hover  { background: rgba(99,102,241,0.09); border-color: var(--accent); transform: scale(1.08); }
        .ag-page .ag-action-view:hover  { background: rgba(16,185,129,0.09); border-color: var(--green);  transform: scale(1.08); }

        /* Pagination wrapper */
        .ag-page .ag-pagination { padding: 16px 20px; border-top: 1px solid var(--border); }
      `}</style>

      {dialogueType === "agency" && <AgencyDialog />}

      <div className="ag-page">

        {/* ── Page header ── */}
        <div className="ag-header">
          <div className="ag-header-left">
            <div className="ag-header-pill"/>
            <div>
              <h1 className="ag-title">Agency</h1>
              <p className="ag-sub">Manage and monitor all registered agencies</p>
            </div>
          </div>
          <button
            className="ag-add-btn"
            onClick={() => dispatch(openDialog({ type: "agency" }))}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Agency
          </button>
        </div>

        {/* ── Quick stats ── */}
        <div className="ag-stats">
          {[
            { label: "Total Agencies", val: total || 0, cls: "si-p",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg> },
            { label: "Active Agencies", val: agency?.filter((a: any) => !a.isBlock).length || 0, cls: "si-g",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg> },
            { label: "Blocked", val: agency?.filter((a: any) => a.isBlock).length || 0, cls: "si-a",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/></svg> },
            { label: "Total Hosts", val: agency?.reduce((s: number, a: any) => s + (a.totalHosts || 0), 0) || 0, cls: "si-b",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg> },
          ].map((s, i) => (
            <div className="ag-stat" key={i}>
              <div className={`ag-stat-icon ${s.cls}`}>{s.icon}</div>
              <div>
                <div className="ag-stat-val">{s.val.toLocaleString()}</div>
                <div className="ag-stat-lbl">{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="ag-filters">
          <Analytics
            analyticsStartDate={startDate}
            analyticsStartEnd={endDate}
            analyticsStartDateSet={setStartDate}
            analyticsStartEndSet={setEndDate}
            direction={"start"}
          />
          <Searching
            type="server"
            data={agency}
            setData={setData}
            column={agencyTable}
            serverSearching={handleFilterData}
            placeholder="Search by AgencyCode / Name"
          />
        </div>

        {/* ── Table card ── */}
        <div className="ag-table-card">
          <div className="ag-table-head">
            <span className="ag-table-title">All Agencies</span>
            <span className="ag-count">{total || 0} total</span>
          </div>

          <Table
            data={agency}
            mapData={agencyTable}
            PerPage={rowsPerPage}
            Page={page}
            type="server"
            shimmer={<AgencyShimmer />}
          />

          <div className="ag-pagination">
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

Agency.getLayout = function getLayout(page: React.ReactNode) {
  return <RootLayout>{page}</RootLayout>;
};

export default Agency;