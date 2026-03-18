import { RootStore, useAppDispatch } from "@/store/store";
import { baseURL } from "@/utils/config";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import ReasonDialog from "@/component/hostRequest/HostReasonDialog";
import { getWithdrawalRequest } from "@/store/withdrawalSlice";
import { getDefaultCurrency } from "@/store/settingSlice";
import male from "@/assets/images/male.png";
import infoImage from "@/assets/images/info.svg";
import coin from "@/assets/images/coin.png";
import { useRouter } from "next/router";
import WithdrawerShimmer from "../Shimmer/WithdrawerShimmer";

const DeclineWithdrawRequest = (props: any) => {
  const { statusType, type, startDate, endDate } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const person = type === "user" ? 3 : type === "host" ? 2 : type === "agency" ? 1 : null;
  const status = statusType === "pending_Request" ? 1
    : statusType === "accepted_Request" ? 2
    : statusType === "declined_Request" ? 3 : null;

  const { declinedWIthdrawal, totalDeclinedWithdrawal } = useSelector((state: RootStore) => state.withdrawal);
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);

  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page,        setPage]        = useState<number>(1);
  const [search,      setSearch]      = useState<string | undefined>("All");
  const [openInfo,    setOpenInfo]    = useState(false);
  const [infoData,    setInfoData]    = useState<any>(null);

  useEffect(() => { dispatch(getDefaultCurrency()); }, [dispatch]);

  useEffect(() => {
    const payload: any = { start: page, limit: rowsPerPage, search, startDate, endDate, person, status };
    if (status && person) dispatch(getWithdrawalRequest(payload));
  }, [dispatch, page, rowsPerPage, search, person, status, startDate, endDate]);

  const handleChangePage        = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => { setRowsPerPage(parseInt(event, 10)); setPage(1); };

  const withdrawDeclinedTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span className="dw-cell-no">{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },
    {
      Header: "Unique ID",
      Cell: ({ row }: { row: any }) => (
        <span className="dw-cell-mono">{row?.uniqueId || "—"}</span>
      ),
    },
    type === "agency"
      ? {
          Header: "Agency",
          Cell: ({ row }: { row: any }) => {
            const imgPath = row?.agencyId?.image?.replace(/\\/g, "/") || "";
            return (
              <div className="dw-person-cell">
                <img
                  src={row?.agencyId?.image ? baseURL + imgPath : male.src}
                  alt={row?.agencyId?.name}
                  className="dw-avatar"
                  onError={(e: any) => { e.target.src = male.src; }}
                />
                <span className="dw-person-name">{row?.agencyId?.name || "—"}</span>
              </div>
            );
          },
        }
      : {
          Header: "Host",
          Cell: ({ row }: { row: any }) => {
            const imgPath = row?.hostId?.image?.replace(/\\/g, "/") || "";
            return (
              <div className="dw-person-cell" style={{ cursor: "pointer" }}
                onClick={() => router.push("/Host/HostInfoPage")}>
                <img
                  src={row?.hostId?.image ? baseURL + imgPath : male.src}
                  alt={row?.hostId?.name}
                  className="dw-avatar"
                  onError={(e: any) => { e.target.src = male.src; }}
                />
                <span className="dw-person-name">{row?.hostId?.name || "—"}</span>
              </div>
            );
          },
        },
    {
      Header: "Reason",
      Cell: ({ row }: { row: any }) => (
        <span className="dw-reason-cell">
          {row?.reason
            ? <><span className="dw-reason-dot" />{row.reason}</>
            : "—"}
        </span>
      ),
    },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="dw-coin-cell">
          <img src={coin.src} height={20} width={20} alt="Coin" />
          <span className="dw-coin-val">{row?.coin || 0}</span>
        </div>
      ),
    },
    {
      Header: `Amount (${defaultCurrency?.symbol})`,
      Cell: ({ row }: { row: any }) => (
        <span className="dw-badge dw-badge-rose">
          {defaultCurrency?.symbol}{row?.amount || 0}
        </span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }: { row: any }) => (
        <span className="dw-cell-date">{row?.acceptOrDeclineDate?.split(",")[0] || "—"}</span>
      ),
    },
    {
      Header: "Info",
      Cell: ({ row }: { row: any }) => (
        <button
          className="dw-action-btn dw-btn-info"
          title="View Payment Info"
          onClick={() => { setInfoData(row); setOpenInfo(true); }}
        >
          <img src={infoImage.src} height={15} width={15} alt="Info" />
        </button>
      ),
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .dw-wrap {
          --rose:    #f43f5e;
          --r-soft:  rgba(244,63,94,0.08);
          --r-mid:   rgba(244,63,94,0.20);
          --r-glow:  rgba(244,63,94,0.16);
          --amber:   #f59e0b;
          --am-soft: rgba(245,158,11,0.10);
          --am-mid:  rgba(245,158,11,0.22);
          --blue:    #3b82f6;
          --bl-soft: rgba(59,130,246,0.10);
          --bl-mid:  rgba(59,130,246,0.22);
          --border:  #e8eaf2;
          --txt:     #64748b;
          --txt-dark:#1e2235;
          --txt-dim: #a0a8c0;
          --white:   #ffffff;
          --bg:      #f4f5fb;
          font-family: 'Outfit', sans-serif;
        }

        /* No */
        .dw-wrap .dw-cell-no {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700; font-size: 14px; color: var(--txt-dim);
        }

        /* Mono ID */
        .dw-wrap .dw-cell-mono {
          font-family: monospace; font-size: 12px; color: var(--txt);
          background: var(--bg); padding: 3px 8px;
          border-radius: 6px; border: 1px solid var(--border); white-space: nowrap;
        }

        /* Person cell */
        .dw-wrap .dw-person-cell { display: flex; align-items: center; gap: 10px; }
        .dw-wrap .dw-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          object-fit: cover; border: 2px solid var(--border); flex-shrink: 0;
        }
        .dw-wrap .dw-person-name {
          font-size: 13.5px; font-weight: 600; color: var(--txt-dark); white-space: nowrap;
        }

        /* Reason cell */
        .dw-wrap .dw-reason-cell {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 500; color: var(--rose);
          background: var(--r-soft); border: 1px solid var(--r-mid);
          padding: 4px 10px; border-radius: 20px;
          max-width: 200px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        .dw-wrap .dw-reason-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: var(--rose); flex-shrink: 0;
        }

        /* Coin cell */
        .dw-wrap .dw-coin-cell {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--am-soft); border: 1px solid var(--am-mid);
          padding: 4px 11px; border-radius: 20px;
        }
        .dw-wrap .dw-coin-val {
          font-size: 13px; font-weight: 700; color: var(--amber);
        }

        /* Badges */
        .dw-wrap .dw-badge {
          display: inline-flex; align-items: center;
          padding: 3px 11px; border-radius: 20px;
          font-size: 12.5px; font-weight: 700; white-space: nowrap;
        }
        .dw-wrap .dw-badge-rose {
          background: var(--r-soft); color: var(--rose); border: 1px solid var(--r-mid);
        }

        /* Date */
        .dw-wrap .dw-cell-date {
          font-size: 12.5px; color: var(--txt-dim); font-weight: 500; white-space: nowrap;
        }

        /* Action buttons */
        .dw-wrap .dw-action-btn {
          width: 34px; height: 34px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer; color: var(--txt-dim);
          transition: background .14s, border-color .14s, transform .12s, color .14s;
        }
        .dw-wrap .dw-btn-info:hover {
          background: var(--bl-soft); border-color: var(--blue);
          color: var(--blue); transform: scale(1.08);
        }

        /* Pagination */
        .dw-wrap .dw-pagination {
          padding: 16px 0 0; border-top: 1px solid var(--border); margin-top: 4px;
        }

        /* ── Info Modal ── */
        .dw-modal-overlay {
          position: fixed; inset: 0; z-index: 1300;
          background: rgba(15,17,35,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .dw-modal-box {
          --rose:    #f43f5e;
          --r-soft:  rgba(244,63,94,0.08);
          --r-mid:   rgba(244,63,94,0.20);
          --r-glow:  rgba(244,63,94,0.18);
          --border:  #e8eaf2;
          --txt:     #64748b;
          --txt-dark:#1e2235;
          --txt-dim: #a0a8c0;
          --white:   #ffffff;
          --bg:      #f7f8fc;
          --error:   #f43f5e;
          --e-soft:  rgba(244,63,94,0.08);

          font-family: 'Outfit', sans-serif;
          background: var(--white); border-radius: 20px;
          width: 100%; max-width: 460px;
          box-shadow: 0 24px 64px rgba(15,17,35,0.18), 0 0 0 1px var(--border);
          overflow: hidden;
          animation: dw-modal-in .22s cubic-bezier(.4,0,.2,1);
          max-height: 90vh; display: flex; flex-direction: column;
        }
        @keyframes dw-modal-in {
          from { opacity:0; transform:translateY(14px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }

        .dw-modal-box .dw-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 18px;
          background: linear-gradient(135deg, var(--r-soft), rgba(244,63,94,0.02));
          border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .dw-modal-box .dw-modal-left { display: flex; align-items: center; gap: 10px; }
        .dw-modal-box .dw-modal-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: var(--r-soft); color: var(--rose);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--r-mid); flex-shrink: 0;
        }
        .dw-modal-box .dw-modal-title {
          font-family: 'Rajdhani', sans-serif; font-size: 18px;
          font-weight: 700; color: var(--txt-dark); margin: 0; line-height: 1.1;
        }
        .dw-modal-box .dw-modal-sub { font-size: 11.5px; color: var(--txt-dim); margin-top: 1px; }
        .dw-modal-box .dw-modal-close {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer; color: var(--txt-dim);
          transition: background .14s, color .14s, border-color .14s;
        }
        .dw-modal-box .dw-modal-close:hover {
          background: var(--e-soft); border-color: var(--error); color: var(--error);
        }
        .dw-modal-box .dw-modal-body {
          padding: 20px 24px; overflow-y: auto;
          display: flex; flex-direction: column; gap: 12px;
        }
        .dw-modal-box .dw-info-row { display: flex; flex-direction: column; gap: 5px; }
        .dw-modal-box .dw-info-label {
          font-size: 11.5px; font-weight: 600; color: var(--txt-dim);
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .dw-modal-box .dw-info-val {
          font-size: 13.5px; font-weight: 600; color: var(--txt-dark);
          background: var(--bg); padding: 9px 14px;
          border-radius: 10px; border: 1.5px solid var(--border);
          word-break: break-all;
        }
        .dw-modal-box .dw-modal-footer {
          padding: 14px 24px 20px;
          border-top: 1px solid var(--border); flex-shrink: 0;
          display: flex; justify-content: flex-end;
        }
        .dw-modal-box .dw-modal-close-btn {
          padding: 9px 22px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--rose), #e11d48);
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--r-glow);
          transition: box-shadow .15s, transform .13s;
        }
        .dw-modal-box .dw-modal-close-btn:hover {
          box-shadow: 0 6px 20px var(--r-glow); transform: translateY(-1px);
        }
      `}</style>

      {dialogueType === "reasondialog" && <ReasonDialog />}

      <div className="dw-wrap">
        <Table
          data={declinedWIthdrawal}
          mapData={withdrawDeclinedTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={<WithdrawerShimmer />}
        />
        <div className="dw-pagination">
          <Pagination
            type="server"
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalDeclinedWithdrawal}
          />
        </div>
      </div>

      {/* ── Payment Info Modal ── */}
      {openInfo && (
        <div className="dw-modal-overlay" onClick={() => setOpenInfo(false)}>
          <div className="dw-modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="dw-modal-header">
              <div className="dw-modal-left">
                <div className="dw-modal-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="15" y1="9" x2="9" y2="15"/>
                    <line x1="9" y1="9" x2="15" y2="15"/>
                  </svg>
                </div>
                <div>
                  <h4 className="dw-modal-title">Payment Detail</h4>
                  <p className="dw-modal-sub">Declined withdrawal info</p>
                </div>
              </div>
              <button className="dw-modal-close" onClick={() => setOpenInfo(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="dw-modal-body">
              <div className="dw-info-row">
                <span className="dw-info-label">Payment Gateway</span>
                <span className="dw-info-val">{infoData?.paymentGateway || "—"}</span>
              </div>
              {infoData?.paymentDetails &&
                Object.entries(infoData.paymentDetails).map(([key, value]: [string, any]) => (
                  <div className="dw-info-row" key={key}>
                    <span className="dw-info-label">{key}</span>
                    <span className="dw-info-val">{value || "—"}</span>
                  </div>
                ))}
            </div>

            <div className="dw-modal-footer">
              <button className="dw-modal-close-btn" onClick={() => setOpenInfo(false)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default DeclineWithdrawRequest;