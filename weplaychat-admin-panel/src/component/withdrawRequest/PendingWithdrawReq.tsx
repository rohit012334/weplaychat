import { openDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { baseURL } from "@/utils/config";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Table from "@/extra/Table";
import Pagination from "@/extra/Pagination";
import ReasonDialog from "@/component/hostRequest/HostReasonDialog";
import { acceptOrDeclineWithdrawRequestForAgency, getWithdrawalRequest } from "@/store/withdrawalSlice";
import infoImage from "@/assets/images/info.svg";
import male from "@/assets/images/male.png";
import { getDefaultCurrency } from "@/store/settingSlice";
import CommonDialog from "@/utils/CommonDialog";
import coin from "@/assets/images/coin.png";
import WithdrawerShimmer from "../Shimmer/WithdrawerShimmer";
import AgencyWithShimmer from "../Shimmer/AgencyWithShimmer";

const PendingWithdrawReq = (props: any) => {
  const { statusType, type, startDate, endDate } = props;
  const router = useRouter();
  const dispatch = useAppDispatch();

  const person = type === "user" ? 3 : type === "host" ? 2 : type === "agency" ? 1 : null;
  const status = statusType === "pending_Request" ? 1
    : statusType === "accepted_Request" ? 2
    : statusType === "declined_Request" ? 3 : null;

  const { withDrawal, totalWithdrawal } = useSelector((state: RootStore) => state.withdrawal);
  const { dialogueType } = useSelector((state: RootStore) => state.dialogue);
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);

  const [rowsPerPage, setRowsPerPage] = useState<number>(20);
  const [page,        setPage]        = useState<number>(1);
  const [search,      setSearch]      = useState<string | undefined>("All");
  const [openInfo,    setOpenInfo]    = useState(false);
  const [infoData,    setInfoData]    = useState<any>(null);
  const [showDialog,  setShowDialog]  = useState(false);
  const [selectedId,  setSelectedId]  = useState<any>(null);

  useEffect(() => { dispatch(getDefaultCurrency()); }, [dispatch]);

  useEffect(() => {
    const payload: any = { start: page, limit: rowsPerPage, search, startDate, endDate, person, status };
    if (status && person && type) dispatch(getWithdrawalRequest(payload));
  }, [dispatch, page, rowsPerPage, search, person, status, startDate, endDate, type]);

  const handleChangePage        = (_: any, newPage: any) => setPage(newPage);
  const handleChangeRowsPerPage = (event: any) => { setRowsPerPage(parseInt(event, 10)); setPage(1); };

  const handleActionAccept   = (row: any) => { setSelectedId(row); setShowDialog(true); };
  const handleActionDeclined = (row: any) => dispatch(openDialog({ type: "reasondialog", data: { _id: row?._id } }));

  const handleAcceptRequest = async () => {
    if (selectedId) {
      dispatch(acceptOrDeclineWithdrawRequestForAgency({
        requestId: selectedId?._id,
        agencyId:  selectedId?.agencyId?._id,
        type:      "approve",
      }));
      setShowDialog(false);
    }
  };

  const withdrawPendingTable = [
    {
      Header: "No",
      Cell: ({ index }: { index: number }) => (
        <span className="pw-cell-no">{(page - 1) * rowsPerPage + index + 1}</span>
      ),
    },
    {
      Header: "Unique ID",
      Cell: ({ row }: { row: any }) => (
        <span className="pw-cell-mono">{row?.uniqueId || "—"}</span>
      ),
    },
    type === "agency"
      ? {
          Header: "Agency",
          Cell: ({ row }: { row: any }) => {
            const imgPath = row?.agencyId?.image?.replace(/\\/g, "/") || "";
            return (
              <div className="pw-person-cell">
                <img
                  src={row?.agencyId?.image ? baseURL + imgPath : male.src}
                  alt={row?.agencyId?.name}
                  className="pw-avatar"
                  onError={(e: any) => { e.target.src = male.src; }}
                />
                <span className="pw-person-name">{row?.agencyId?.name || "—"}</span>
              </div>
            );
          },
        }
      : {
          Header: "Host",
          Cell: ({ row }: { row: any }) => {
            const imgPath = row?.hostId?.image?.replace(/\\/g, "/") || "";
            return (
              <div
                className="pw-person-cell"
                style={{ cursor: "pointer" }}
                onClick={() => router.push({ pathname: "/Host/HostInfoPage", query: { id: row?.hostId?._id } })}
              >
                <img
                  src={row?.hostId?.image ? baseURL + imgPath : male.src}
                  alt={row?.hostId?.name}
                  className="pw-avatar"
                  onError={(e: any) => { e.target.src = male.src; }}
                />
                <div>
                  <p className="pw-person-name" style={{ margin: 0 }}>{row?.hostId?.name || "—"}</p>
                  <p className="pw-person-uid">{row?.hostId?.uniqueId || "—"}</p>
                </div>
              </div>
            );
          },
        },
    {
      Header: "Coin",
      Cell: ({ row }: { row: any }) => (
        <div className="pw-coin-cell">
          <img src={coin.src} height={20} width={20} alt="Coin" />
          <span className="pw-coin-val">{row?.coin || 0}</span>
        </div>
      ),
    },
    {
      Header: `Amount (${defaultCurrency?.symbol})`,
      Cell: ({ row }: { row: any }) => (
        <span className="pw-badge pw-badge-amber">
          {defaultCurrency?.symbol}{row?.amount || 0}
        </span>
      ),
    },
    {
      Header: "Date",
      Cell: ({ row }: { row: any }) => (
        <span className="pw-cell-date">{row?.requestDate?.split(",")[0] || "—"}</span>
      ),
    },
    {
      Header: "Info",
      Cell: ({ row }: { row: any }) => (
        <button
          className="pw-action-btn pw-btn-info"
          title="View Payment Info"
          onClick={() => { setInfoData(row); setOpenInfo(true); }}
        >
          <img src={infoImage.src} height={15} width={15} alt="Info" />
        </button>
      ),
    },
    ...(type === "agency"
      ? [
          {
            Header: "Accept",
            Cell: ({ row }: { row: any }) => (
              <button
                className="pw-action-btn pw-btn-accept"
                title="Accept Request"
                onClick={() => handleActionAccept(row)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </button>
            ),
          },
          {
            Header: "Decline",
            Cell: ({ row }: { row: any }) => (
              <button
                className="pw-action-btn pw-btn-decline"
                title="Decline Request"
                onClick={() => handleActionDeclined(row)}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              </button>
            ),
          },
        ]
      : []),
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .pw-wrap {
          --accent:  #6366f1;
          --a-soft:  rgba(99,102,241,0.09);
          --a-mid:   rgba(99,102,241,0.16);
          --green:   #10b981;
          --g-soft:  rgba(16,185,129,0.10);
          --g-mid:   rgba(16,185,129,0.22);
          --amber:   #f59e0b;
          --am-soft: rgba(245,158,11,0.10);
          --am-mid:  rgba(245,158,11,0.22);
          --blue:    #3b82f6;
          --bl-soft: rgba(59,130,246,0.10);
          --bl-mid:  rgba(59,130,246,0.22);
          --rose:    #f43f5e;
          --r-soft:  rgba(244,63,94,0.08);
          --r-mid:   rgba(244,63,94,0.20);
          --border:  #e8eaf2;
          --txt:     #64748b;
          --txt-dark:#1e2235;
          --txt-dim: #a0a8c0;
          --white:   #ffffff;
          --bg:      #f4f5fb;
          font-family: 'Outfit', sans-serif;
        }

        /* No */
        .pw-wrap .pw-cell-no {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700; font-size: 14px; color: var(--txt-dim);
        }

        /* Mono ID */
        .pw-wrap .pw-cell-mono {
          font-family: monospace; font-size: 12px; color: var(--txt);
          background: var(--bg); padding: 3px 8px;
          border-radius: 6px; border: 1px solid var(--border); white-space: nowrap;
        }

        /* Person cell */
        .pw-wrap .pw-person-cell {
          display: flex; align-items: center; gap: 10px;
        }
        .pw-wrap .pw-avatar {
          width: 38px; height: 38px; border-radius: 50%;
          object-fit: cover; border: 2px solid var(--border); flex-shrink: 0;
        }
        .pw-wrap .pw-person-name {
          font-size: 13.5px; font-weight: 600; color: var(--txt-dark); white-space: nowrap;
        }
        .pw-wrap .pw-person-uid {
          font-size: 11px; color: var(--txt-dim); margin: 2px 0 0; white-space: nowrap;
        }

        /* Coin cell */
        .pw-wrap .pw-coin-cell {
          display: inline-flex; align-items: center; gap: 7px;
          background: var(--am-soft); border: 1px solid var(--am-mid);
          padding: 4px 11px; border-radius: 20px;
        }
        .pw-wrap .pw-coin-val {
          font-size: 13px; font-weight: 700; color: var(--amber);
        }

        /* Badges */
        .pw-wrap .pw-badge {
          display: inline-flex; align-items: center;
          padding: 3px 11px; border-radius: 20px;
          font-size: 12.5px; font-weight: 700; white-space: nowrap;
        }
        .pw-wrap .pw-badge-amber {
          background: var(--am-soft); color: var(--amber); border: 1px solid var(--am-mid);
        }

        /* Date */
        .pw-wrap .pw-cell-date {
          font-size: 12.5px; color: var(--txt-dim); font-weight: 500; white-space: nowrap;
        }

        /* Action buttons */
        .pw-wrap .pw-action-btn {
          width: 34px; height: 34px; border-radius: 9px;
          display: inline-flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer;
          transition: background .14s, border-color .14s, transform .12s, color .14s;
        }
        .pw-wrap .pw-btn-info   { color: var(--txt-dim); }
        .pw-wrap .pw-btn-accept { color: var(--txt-dim); }
        .pw-wrap .pw-btn-decline{ color: var(--txt-dim); }

        .pw-wrap .pw-btn-info:hover    { background: var(--bl-soft); border-color: var(--blue);  color: var(--blue);  transform: scale(1.08); }
        .pw-wrap .pw-btn-accept:hover  { background: var(--g-soft);  border-color: var(--green); color: var(--green); transform: scale(1.08); }
        .pw-wrap .pw-btn-decline:hover { background: var(--r-soft);  border-color: var(--rose);  color: var(--rose);  transform: scale(1.08); }

        /* Pagination */
        .pw-wrap .pw-pagination {
          padding: 16px 0 0; border-top: 1px solid var(--border); margin-top: 4px;
        }

        /* ── Info Modal ── */
        .pw-modal-overlay {
          position: fixed; inset: 0; z-index: 1300;
          background: rgba(15,17,35,0.55); backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center; padding: 16px;
        }
        .pw-modal-box {
          --amber:   #f59e0b;
          --am-soft: rgba(245,158,11,0.09);
          --am-mid:  rgba(245,158,11,0.20);
          --am-glow: rgba(245,158,11,0.22);
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
          animation: pw-modal-in .22s cubic-bezier(.4,0,.2,1);
          max-height: 90vh; display: flex; flex-direction: column;
        }
        @keyframes pw-modal-in {
          from { opacity:0; transform:translateY(14px) scale(0.97); }
          to   { opacity:1; transform:translateY(0)    scale(1);    }
        }
        .pw-modal-box .pw-modal-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 18px;
          background: linear-gradient(135deg, var(--am-soft), rgba(249,115,22,0.03));
          border-bottom: 1px solid var(--border); flex-shrink: 0;
        }
        .pw-modal-box .pw-modal-left { display: flex; align-items: center; gap: 10px; }
        .pw-modal-box .pw-modal-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: var(--am-soft); color: var(--amber);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--am-mid); flex-shrink: 0;
        }
        .pw-modal-box .pw-modal-title {
          font-family: 'Rajdhani', sans-serif; font-size: 18px;
          font-weight: 700; color: var(--txt-dark); margin: 0; line-height: 1.1;
        }
        .pw-modal-box .pw-modal-sub { font-size: 11.5px; color: var(--txt-dim); margin-top: 1px; }
        .pw-modal-box .pw-modal-close {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer; color: var(--txt-dim);
          transition: background .14s, color .14s, border-color .14s;
        }
        .pw-modal-box .pw-modal-close:hover {
          background: var(--e-soft); border-color: var(--error); color: var(--error);
        }
        .pw-modal-box .pw-modal-body {
          padding: 20px 24px; overflow-y: auto;
          display: flex; flex-direction: column; gap: 12px;
        }
        .pw-modal-box .pw-info-row { display: flex; flex-direction: column; gap: 5px; }
        .pw-modal-box .pw-info-label {
          font-size: 11.5px; font-weight: 600; color: var(--txt-dim);
          text-transform: uppercase; letter-spacing: 0.04em;
        }
        .pw-modal-box .pw-info-val {
          font-size: 13.5px; font-weight: 600; color: var(--txt-dark);
          background: var(--bg); padding: 9px 14px;
          border-radius: 10px; border: 1.5px solid var(--border);
          word-break: break-all;
        }
        .pw-modal-box .pw-modal-footer {
          padding: 14px 24px 20px;
          border-top: 1px solid var(--border); flex-shrink: 0;
          display: flex; justify-content: flex-end;
        }
        .pw-modal-box .pw-modal-close-btn {
          padding: 9px 22px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--amber), #f97316);
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--am-glow);
          transition: box-shadow .15s, transform .13s;
        }
        .pw-modal-box .pw-modal-close-btn:hover {
          box-shadow: 0 6px 20px var(--am-glow); transform: translateY(-1px);
        }
      `}</style>

      {dialogueType === "reasondialog" && <ReasonDialog />}
      <CommonDialog
        open={showDialog}
        onCancel={() => setShowDialog(false)}
        onConfirm={handleAcceptRequest}
        text={"Accept"}
      />

      <div className="pw-wrap">
        <Table
          data={withDrawal}
          mapData={withdrawPendingTable}
          PerPage={rowsPerPage}
          Page={page}
          type="server"
          shimmer={type === "agency" ? <AgencyWithShimmer /> : <WithdrawerShimmer />}
        />
        <div className="pw-pagination">
          <Pagination
            type="server"
            serverPage={page}
            setServerPage={setPage}
            serverPerPage={rowsPerPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            totalData={totalWithdrawal}
          />
        </div>
      </div>

      {/* ── Payment Info Modal ── */}
      {openInfo && (
        <div className="pw-modal-overlay" onClick={() => setOpenInfo(false)}>
          <div className="pw-modal-box" onClick={(e) => e.stopPropagation()}>

            <div className="pw-modal-header">
              <div className="pw-modal-left">
                <div className="pw-modal-icon">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10"/>
                    <polyline points="12 6 12 12 16 14"/>
                  </svg>
                </div>
                <div>
                  <h4 className="pw-modal-title">Payment Detail</h4>
                  <p className="pw-modal-sub">Pending withdrawal info</p>
                </div>
              </div>
              <button className="pw-modal-close" onClick={() => setOpenInfo(false)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="pw-modal-body">
              <div className="pw-info-row">
                <span className="pw-info-label">Payment Gateway</span>
                <span className="pw-info-val">{infoData?.paymentGateway || "—"}</span>
              </div>
              {infoData?.paymentDetails &&
                Object.entries(infoData.paymentDetails).map(([key, value]: [string, any]) => (
                  <div className="pw-info-row" key={key}>
                    <span className="pw-info-label">{key}</span>
                    <span className="pw-info-val">{value || "—"}</span>
                  </div>
                ))}
            </div>

            <div className="pw-modal-footer">
              <button className="pw-modal-close-btn" onClick={() => setOpenInfo(false)}>
                Close
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default PendingWithdrawReq;