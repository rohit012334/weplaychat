import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { createVipPlan, updateVipPlan } from "@/store/vipPlanSlice";
import { getDefaultCurrency } from "@/store/settingSlice";

interface ErrorState {
  coin: string;
  price: string;
  validity: string;
  validityType: string;
  productId: string;
}

const validityOptions = [
  { name: "days",   value: "Days"   },
  { name: "months", value: "Months" },
  { name: "years",  value: "Years"  },
];

const VipPlanDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);
  const dispatch = useAppDispatch();

  const [coin,         setCoin]         = useState<any>("");
  const [price,        setPrice]        = useState<any>("");
  const [validity,     setValidity]     = useState<any>("");
  const [validityType, setValidityType] = useState<any>("");
  const [productId,    setProductId]    = useState<any>("");

  const [error, setError] = useState<ErrorState>({
    coin: "", price: "", validity: "", validityType: "", productId: "",
  });

  useEffect(() => { dispatch(getDefaultCurrency()); }, [dispatch]);

  useEffect(() => {
    if (dialogueData) {
      setCoin(dialogueData?.coin);
      setPrice(dialogueData?.price);
      setValidity(dialogueData?.validity);
      setValidityType(dialogueData?.validityType);
      setProductId(dialogueData?.productId);
    }
  }, [dialogueData]);

  const validate = () => {
    const err = {} as ErrorState;
    if (!coin)            err.coin         = "Coin is required";
    else if (coin <= 0)   err.coin         = "Coin must be greater than 0";
    if (!price)           err.price        = "Price is required";
    else if (price <= 0)  err.price        = "Price must be greater than 0";
    if (!validity)        err.validity     = "Validity is required";
    if (!validityType)    err.validityType = "Validity type is required";
    if (!productId)       err.productId    = "Product Id is required";
    return err;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) return setError(err);

    const payload: any = { coin, price, validity, validityType, productId };
    if (dialogueData) {
      payload.vipPlanId = dialogueData?._id;
      dispatch(updateVipPlan(payload));
    } else {
      dispatch(createVipPlan(payload));
    }
    dispatch(closeDialog());
  };

  const isEdit = !!dialogueData;

  const inputFields = [
    {
      id: "validity", label: "Validity", type: "number",
      value: validity, placeholder: "e.g. 30",
      error: error.validity,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      ),
      onChange: (e: any) => {
        setValidity(e.target.value);
        setError((p) => ({ ...p, validity: !e.target.value ? "Validity is required" : "" }));
      },
    },
    {
      id: "price", label: `Price (${defaultCurrency?.symbol || "$"})`, type: "number",
      value: price, placeholder: "e.g. 9.99",
      error: error.price,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
      ),
      onChange: (e: any) => {
        setPrice(e.target.value);
        setError((p) => ({ ...p, price: !e.target.value ? "Price is required" : e.target.value <= 0 ? "Must be > 0" : "" }));
      },
    },
    {
      id: "coin", label: "Coin", type: "number",
      value: coin, placeholder: "e.g. 500",
      error: error.coin,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9m0 0h4.5a1.5 1.5 0 0 1 0 3H9"/>
        </svg>
      ),
      onChange: (e: any) => {
        setCoin(e.target.value);
        setError((p) => ({ ...p, coin: !e.target.value ? "Coin is required" : e.target.value <= 0 ? "Must be > 0" : "" }));
      },
    },
    {
      id: "productId", label: "Product Id", type: "text",
      value: productId, placeholder: "e.g. com.app.vip30",
      error: error.productId,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
        </svg>
      ),
      onChange: (e: any) => {
        setProductId(e.target.value);
        setError((p) => ({ ...p, productId: !e.target.value ? "Product Id is required" : "" }));
      },
    },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .vpd-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15, 17, 35, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }

        .vpd-box {
          --accent:   #f59e0b;
          --accent2:  #f97316;
          --a-soft:   rgba(245,158,11,0.09);
          --a-mid:    rgba(245,158,11,0.20);
          --a-glow:   rgba(245,158,11,0.28);
          --indigo:   #6366f1;
          --i-soft:   rgba(99,102,241,0.09);
          --i-mid:    rgba(99,102,241,0.16);
          --border:   #e8eaf2;
          --txt:      #64748b;
          --txt-dark: #1e2235;
          --txt-dim:  #a0a8c0;
          --white:    #ffffff;
          --bg:       #f7f8fc;
          --error:    #f43f5e;
          --e-soft:   rgba(244,63,94,0.08);

          font-family: 'Outfit', sans-serif;
          background: var(--white);
          border-radius: 20px;
          width: 100%;
          max-width: 420px;
          box-shadow: 0 24px 64px rgba(15,17,35,0.18), 0 0 0 1px var(--border);
          overflow: hidden;
          animation: vpd-in .22s cubic-bezier(.4,0,.2,1);
        }

        @keyframes vpd-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* ── Header ── */
        .vpd-box .vpd-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 18px;
          background: linear-gradient(135deg, rgba(245,158,11,0.07), rgba(249,115,22,0.04));
          border-bottom: 1px solid var(--border);
        }
        .vpd-box .vpd-header-left { display: flex; align-items: center; gap: 10px; }
        .vpd-box .vpd-header-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: var(--a-soft); color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--a-mid); flex-shrink: 0;
        }
        .vpd-box .vpd-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px; font-weight: 700;
          color: var(--txt-dark); margin: 0; line-height: 1.1;
        }
        .vpd-box .vpd-subtitle { font-size: 11.5px; color: var(--txt-dim); margin-top: 1px; }

        .vpd-box .vpd-close {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer; color: var(--txt-dim);
          transition: background .14s, color .14s, border-color .14s;
        }
        .vpd-box .vpd-close:hover {
          background: var(--e-soft); border-color: var(--error); color: var(--error);
        }

        /* ── Body ── */
        .vpd-box .vpd-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }

        /* ── Field ── */
        .vpd-box .vpd-field { display: flex; flex-direction: column; gap: 6px; }
        .vpd-box .vpd-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600; color: var(--txt-dark);
        }
        .vpd-box .vpd-label-icon { color: var(--accent); display: flex; }

        /* Input */
        .vpd-box .vpd-input {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          background: var(--bg);
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; color: var(--txt-dark);
          outline: none;
          transition: border-color .15s, box-shadow .15s, background .15s;
        }
        .vpd-box .vpd-input::placeholder { color: var(--txt-dim); }
        .vpd-box .vpd-input:focus {
          border-color: var(--accent);
          background: var(--white);
          box-shadow: 0 0 0 3px var(--a-soft);
        }
        .vpd-box .vpd-input.has-error {
          border-color: var(--error); background: var(--e-soft);
        }
        .vpd-box .vpd-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(244,63,94,0.10);
        }

        /* Select */
        .vpd-box .vpd-select {
          width: 100%; box-sizing: border-box;
          padding: 10px 14px;
          border: 1.5px solid var(--border);
          border-radius: 10px;
          background: var(--bg);
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; color: var(--txt-dark);
          outline: none; appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 7L11 1' stroke='%23a0a8c0' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 14px center;
          padding-right: 36px;
          cursor: pointer;
          transition: border-color .15s, box-shadow .15s, background-color .15s;
        }
        .vpd-box .vpd-select:focus {
          border-color: var(--accent);
          background-color: var(--white);
          box-shadow: 0 0 0 3px var(--a-soft);
        }
        .vpd-box .vpd-select.has-error {
          border-color: var(--error); background-color: var(--e-soft);
        }

        /* Error */
        .vpd-box .vpd-error {
          display: flex; align-items: center; gap: 5px;
          font-size: 11.5px; color: var(--error); font-weight: 500;
        }

        /* ── Footer ── */
        .vpd-box .vpd-footer {
          display: flex; align-items: center; justify-content: flex-end; gap: 10px;
          padding: 16px 24px 20px;
          border-top: 1px solid var(--border);
        }
        .vpd-box .vpd-btn-cancel {
          padding: 9px 20px; border-radius: 10px;
          border: 1.5px solid var(--border); background: var(--bg);
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; color: var(--txt); cursor: pointer;
          transition: border-color .14s, color .14s, background .14s;
        }
        .vpd-box .vpd-btn-cancel:hover {
          border-color: var(--txt); color: var(--txt-dark); background: var(--white);
        }
        .vpd-box .vpd-btn-submit {
          padding: 9px 24px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff; font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--a-glow);
          display: flex; align-items: center; gap: 7px;
          transition: box-shadow .15s, transform .13s;
        }
        .vpd-box .vpd-btn-submit:hover {
          box-shadow: 0 6px 20px var(--a-glow); transform: translateY(-1px);
        }
      `}</style>

      <div className="vpd-overlay" onClick={() => dispatch(closeDialog())}>
        <div className="vpd-box" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="vpd-header">
            <div className="vpd-header-left">
              <div className="vpd-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </div>
              <div>
                <h4 className="vpd-title">{isEdit ? "Edit" : "Add"} VIP Plan</h4>
                <p className="vpd-subtitle">{isEdit ? "Update VIP plan details" : "Create a new VIP plan"}</p>
              </div>
            </div>
            <button className="vpd-close" onClick={() => dispatch(closeDialog())}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="vpd-body">

              {/* Validity + Validity Type side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                {/* Validity */}
                <div className="vpd-field">
                  <label className="vpd-label" htmlFor="validity">
                    <span className="vpd-label-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </span>
                    Validity
                  </label>
                  <input
                    id="validity"
                    className={`vpd-input${error.validity ? " has-error" : ""}`}
                    type="number"
                    value={validity}
                    placeholder="e.g. 30"
                    onChange={(e) => {
                      setValidity(e.target.value);
                      setError((p) => ({ ...p, validity: !e.target.value ? "Required" : "" }));
                    }}
                  />
                  {error.validity && (
                    <span className="vpd-error">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {error.validity}
                    </span>
                  )}
                </div>

                {/* Validity Type */}
                <div className="vpd-field">
                  <label className="vpd-label" htmlFor="validityType">
                    <span className="vpd-label-icon">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                      </svg>
                    </span>
                    Type
                  </label>
                  <select
                    id="validityType"
                    className={`vpd-select${error.validityType ? " has-error" : ""}`}
                    value={validityType}
                    onChange={(e) => {
                      setValidityType(e.target.value);
                      setError((p) => ({ ...p, validityType: !e.target.value ? "Required" : "" }));
                    }}
                  >
                    <option value="">Select</option>
                    {validityOptions.map((opt) => (
                      <option key={opt.name} value={opt.name}>{opt.value}</option>
                    ))}
                  </select>
                  {error.validityType && (
                    <span className="vpd-error">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {error.validityType}
                    </span>
                  )}
                </div>
              </div>

              {/* Remaining fields */}
              {inputFields.slice(1).map((f) => (
                <div className="vpd-field" key={f.id}>
                  <label className="vpd-label" htmlFor={f.id}>
                    <span className="vpd-label-icon">{f.icon}</span>
                    {f.label}
                  </label>
                  <input
                    id={f.id}
                    className={`vpd-input${f.error ? " has-error" : ""}`}
                    type={f.type}
                    value={f.value}
                    placeholder={f.placeholder}
                    onChange={f.onChange}
                  />
                  {f.error && (
                    <span className="vpd-error">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="12" y1="8" x2="12" y2="12"/>
                        <line x1="12" y1="16" x2="12.01" y2="16"/>
                      </svg>
                      {f.error}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* ── Footer ── */}
            <div className="vpd-footer">
              <button type="button" className="vpd-btn-cancel"
                onClick={() => dispatch(closeDialog())}>
                Cancel
              </button>
              <button type="submit" className="vpd-btn-submit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="white" strokeWidth="2.5" strokeLinecap="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                {isEdit ? "Update" : "Create"}
              </button>
            </div>
          </form>

        </div>
      </div>
    </>
  );
};

export default VipPlanDialog;