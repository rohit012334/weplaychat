import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { ExInput } from "@/extra/Input";
import { createCoinPlan, updateCoinPlan } from "@/store/coinPlanSlice";
import { getDefaultCurrency } from "@/store/settingSlice";

interface ErrorState {
  coin: string;
  bonusCoin: string;
  price: string;
  productId: string;
}

const CoinPlanDialog = () => {
  const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const { defaultCurrency } = useSelector((state: RootStore) => state.setting);
  const dispatch = useAppDispatch();

  const [mongoId, setMongoId]     = useState<any>();
  const [coin, setCoin]           = useState<any>("");
  const [bonusCoin, setBonusCoin] = useState<any>("");
  const [price, setPrice]         = useState<any>("");
  const [productId, setProductId] = useState<any>("");
  const [error, setError] = useState<ErrorState>({
    coin: "", bonusCoin: "", price: "", productId: "",
  });

  useEffect(() => { dispatch(getDefaultCurrency()); }, [dispatch]);

  useEffect(() => {
    if (dialogueData) {
      setMongoId(dialogueData?._id);
      setCoin(dialogueData?.coins);
      setBonusCoin(dialogueData?.bonusCoins);
      setPrice(dialogueData?.price);
      setProductId(dialogueData?.productId);
    }
  }, [dialogueData]);

  const validate = () => {
    const err = {} as ErrorState;
    if (!coin)           err.coin      = "Coin is required";
    else if (coin <= 0)  err.coin      = "Coin must be greater than 0";
    if (!bonusCoin)          err.bonusCoin = "Bonus Coin is required";
    else if (bonusCoin <= 0) err.bonusCoin = "Bonus Coin must be greater than 0";
    if (!price)          err.price     = "Price is required";
    else if (price <= 0) err.price     = "Price must be greater than 0";
    if (!productId)      err.productId = "Product Id is required";
    return err;
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    const err = validate();
    if (Object.keys(err).length) return setError(err);

    const payload: any = {
      coins: coin, bonusCoins: bonusCoin, price, productId,
    };
    if (dialogueData) {
      payload.coinPlanId = dialogueData?._id;
      dispatch(updateCoinPlan(payload));
    } else {
      dispatch(createCoinPlan(payload));
    }
    dispatch(closeDialog());
  };

  const fields = [
    {
      id: "coin", label: "Coin", type: "number",
      value: coin, placeholder: "e.g. 100",
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
        setError((prev) => ({ ...prev, coin: !e.target.value ? "Coin is required" : e.target.value <= 0 ? "Must be > 0" : "" }));
      },
    },
    {
      id: "bonusCoin", label: "Bonus Coin", type: "number",
      value: bonusCoin, placeholder: "e.g. 10",
      error: error.bonusCoin,
      icon: (
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
        </svg>
      ),
      onChange: (e: any) => {
        setBonusCoin(e.target.value);
        setError((prev) => ({ ...prev, bonusCoin: !e.target.value ? "Bonus Coin is required" : e.target.value <= 0 ? "Must be > 0" : "" }));
      },
    },
    {
      id: "price", label: `Price (${defaultCurrency?.symbol || "$"})`, type: "number",
      value: price, placeholder: "e.g. 4.99",
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
        setError((prev) => ({ ...prev, price: !e.target.value ? "Price is required" : e.target.value <= 0 ? "Must be > 0" : "" }));
      },
    },
    {
      id: "productId", label: "Product Id", type: "text",
      value: productId, placeholder: "e.g. com.app.coin100",
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
        setError((prev) => ({ ...prev, productId: !e.target.value ? "Product Id is required" : "" }));
      },
    },
  ];

  const isEdit = !!dialogueData;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');

        .cpd-overlay {
          position: fixed; inset: 0; z-index: 1000;
          background: rgba(15, 17, 35, 0.55);
          backdrop-filter: blur(4px);
          display: flex; align-items: center; justify-content: center;
          padding: 16px;
        }

        .cpd-box {
          --accent:   #6366f1;
          --accent2:  #a855f7;
          --a-soft:   rgba(99,102,241,0.09);
          --a-mid:    rgba(99,102,241,0.18);
          --a-glow:   rgba(99,102,241,0.22);
          --amber:    #f59e0b;
          --am-soft:  rgba(245,158,11,0.08);
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
          animation: cpd-in .22s cubic-bezier(.4,0,.2,1);
        }

        @keyframes cpd-in {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }

        /* ── Header ── */
        .cpd-box .cpd-header {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 24px 18px;
          background: linear-gradient(135deg, rgba(99,102,241,0.06), rgba(168,85,247,0.03));
          border-bottom: 1px solid var(--border);
        }
        .cpd-box .cpd-header-left { display: flex; align-items: center; gap: 10px; }
        .cpd-box .cpd-header-icon {
          width: 38px; height: 38px; border-radius: 11px;
          background: var(--a-soft); color: var(--accent);
          display: flex; align-items: center; justify-content: center;
          border: 1px solid var(--a-mid);
          flex-shrink: 0;
        }
        .cpd-box .cpd-title {
          font-family: 'Rajdhani', sans-serif;
          font-size: 18px; font-weight: 700;
          color: var(--txt-dark); margin: 0; line-height: 1.1;
        }
        .cpd-box .cpd-subtitle {
          font-size: 11.5px; color: var(--txt-dim); margin-top: 1px;
        }
        .cpd-box .cpd-close {
          width: 32px; height: 32px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          border: 1.5px solid var(--border); background: var(--bg);
          cursor: pointer; color: var(--txt-dim);
          transition: background .14s, color .14s, border-color .14s;
        }
        .cpd-box .cpd-close:hover {
          background: rgba(244,63,94,0.08);
          border-color: var(--error);
          color: var(--error);
        }

        /* ── Body ── */
        .cpd-box .cpd-body { padding: 22px 24px; display: flex; flex-direction: column; gap: 16px; }

        /* ── Field ── */
        .cpd-box .cpd-field { display: flex; flex-direction: column; gap: 6px; }
        .cpd-box .cpd-label {
          display: flex; align-items: center; gap: 6px;
          font-size: 12.5px; font-weight: 600; color: var(--txt-dark);
        }
        .cpd-box .cpd-label-icon { color: var(--accent); display: flex; }
        .cpd-box .cpd-input-wrap { position: relative; }
        .cpd-box .cpd-input {
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
        .cpd-box .cpd-input::placeholder { color: var(--txt-dim); }
        .cpd-box .cpd-input:focus {
          border-color: var(--accent);
          background: var(--white);
          box-shadow: 0 0 0 3px var(--a-soft);
        }
        .cpd-box .cpd-input.has-error {
          border-color: var(--error);
          background: var(--e-soft);
        }
        .cpd-box .cpd-input.has-error:focus {
          box-shadow: 0 0 0 3px rgba(244,63,94,0.10);
        }
        .cpd-box .cpd-error {
          display: flex; align-items: center; gap: 5px;
          font-size: 11.5px; color: var(--error); font-weight: 500;
        }

        /* ── Footer ── */
        .cpd-box .cpd-footer {
          display: flex; align-items: center; justify-content: flex-end; gap: 10px;
          padding: 16px 24px 20px;
          border-top: 1px solid var(--border);
        }
        .cpd-box .cpd-btn-cancel {
          padding: 9px 20px; border-radius: 10px;
          border: 1.5px solid var(--border);
          background: var(--bg);
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600;
          color: var(--txt); cursor: pointer;
          transition: border-color .14s, color .14s, background .14s;
        }
        .cpd-box .cpd-btn-cancel:hover {
          border-color: var(--txt); color: var(--txt-dark); background: var(--white);
        }
        .cpd-box .cpd-btn-submit {
          padding: 9px 24px; border-radius: 10px; border: none;
          background: linear-gradient(135deg, var(--accent), var(--accent2));
          color: #fff;
          font-family: 'Outfit', sans-serif;
          font-size: 13.5px; font-weight: 600; cursor: pointer;
          box-shadow: 0 4px 14px var(--a-glow);
          display: flex; align-items: center; gap: 7px;
          transition: box-shadow .15s, transform .13s;
        }
        .cpd-box .cpd-btn-submit:hover {
          box-shadow: 0 6px 20px var(--a-glow); transform: translateY(-1px);
        }
      `}</style>

      <div className="cpd-overlay" onClick={() => dispatch(closeDialog())}>
        <div className="cpd-box" onClick={(e) => e.stopPropagation()}>

          {/* ── Header ── */}
          <div className="cpd-header">
            <div className="cpd-header-left">
              <div className="cpd-header-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 6v12M9 9h4.5a1.5 1.5 0 0 1 0 3H9m0 0h4.5a1.5 1.5 0 0 1 0 3H9"/>
                </svg>
              </div>
              <div>
                <h4 className="cpd-title">{isEdit ? "Edit" : "Add"} Coin Plan</h4>
                <p className="cpd-subtitle">{isEdit ? "Update plan details" : "Create a new coin plan"}</p>
              </div>
            </div>
            <button className="cpd-close" onClick={() => dispatch(closeDialog())}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <form onSubmit={handleSubmit}>
            <div className="cpd-body">
              {fields.map((f) => (
                <div className="cpd-field" key={f.id}>
                  <label className="cpd-label" htmlFor={f.id}>
                    <span className="cpd-label-icon">{f.icon}</span>
                    {f.label}
                  </label>
                  <div className="cpd-input-wrap">
                    <input
                      id={f.id}
                      className={`cpd-input${f.error ? " has-error" : ""}`}
                      type={f.type}
                      value={f.value}
                      placeholder={f.placeholder}
                      onChange={f.onChange}
                    />
                  </div>
                  {f.error && (
                    <span className="cpd-error">
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
            <div className="cpd-footer">
              <button type="button" className="cpd-btn-cancel"
                onClick={() => dispatch(closeDialog())}>
                Cancel
              </button>
              <button type="submit" className="cpd-btn-submit">
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

export default CoinPlanDialog;