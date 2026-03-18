import { closeDialog } from "@/store/dialogSlice";
import { getPaymentMethod, updateWithdrawMethod } from "@/store/settingSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import { createWithdrawRequest } from "@/store/withdrawalSlice";
import { Modal } from "@mui/material";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const addWithdrawStyle = `
  @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@400;500;600;700&display=swap');

  /* ── Overlay ── */
  .awd-overlay {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    padding: 20px;
  }

  /* ── Modal box ── */
  .awd-modal {
    background: #fff;
    border-radius: 20px;
    width: 100%;
    max-width: 520px;
    box-shadow: 0 12px 50px rgba(99,102,241,0.18);
    overflow: hidden;
    outline: none;
    animation: awdPop .22s cubic-bezier(.34,1.56,.64,1);
    font-family: 'Outfit', sans-serif;
  }

  @keyframes awdPop {
    from { opacity:0; transform:scale(0.94) translateY(12px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }

  /* ── Header ── */
  .awd-head {
    background: linear-gradient(120deg, #6366f1 0%, #a855f7 100%);
    padding: 20px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    position: relative;
    overflow: hidden;
  }

  .awd-head::before {
    content: '';
    position: absolute;
    top: -25px; right: -25px;
    width: 100px; height: 100px;
    border-radius: 50%;
    background: rgba(255,255,255,0.08);
    pointer-events: none;
  }

  .awd-head-left {
    display: flex;
    align-items: center;
    gap: 11px;
    z-index: 1;
  }

  .awd-head-icon {
    width: 38px; height: 38px;
    border-radius: 10px;
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.28);
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }

  .awd-head h3 {
    font-family: 'Nunito', sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: #fff;
    margin: 0 0 2px;
  }

  .awd-head p {
    font-size: 12px;
    color: rgba(255,255,255,0.70);
    margin: 0;
  }

  .awd-close {
    width: 32px; height: 32px;
    border-radius: 9px;
    display: flex; align-items: center; justify-content: center;
    background: rgba(255,255,255,0.18);
    border: 1.5px solid rgba(255,255,255,0.30);
    color: #fff;
    font-size: 17px;
    cursor: pointer;
    transition: background .14s;
    z-index: 1;
    flex-shrink: 0;
  }
  .awd-close:hover { background: rgba(255,255,255,0.30); }

  /* ── Body ── */
  .awd-body {
    padding: 22px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-height: 60vh;
    overflow-y: auto;
  }

  /* Scrollbar */
  .awd-body::-webkit-scrollbar { width: 4px; }
  .awd-body::-webkit-scrollbar-track { background: #f4f5fb; }
  .awd-body::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.25); border-radius: 4px; }

  /* ── Field group ── */
  .awd-field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .awd-label {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: .5px;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .awd-label-dot {
    width: 5px; height: 5px;
    border-radius: 50%;
    background: #6366f1;
    flex-shrink: 0;
  }

  /* ── Select ── */
  .awd-select {
    width: 100%;
    height: 44px;
    padding: 0 14px;
    border: 1.5px solid #e8eaf2;
    border-radius: 11px;
    background: #f4f5fb;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #1e2235;
    outline: none;
    cursor: pointer;
    transition: border-color .15s, box-shadow .15s;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%236366f1' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 14px center;
    padding-right: 36px;
  }
  .awd-select:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.09);
    background-color: #fff;
  }

  /* ── Text input ── */
  .awd-input {
    width: 100%;
    height: 44px;
    padding: 0 14px;
    border: 1.5px solid #e8eaf2;
    border-radius: 11px;
    background: #f4f5fb;
    font-family: 'Outfit', sans-serif;
    font-size: 13.5px;
    font-weight: 500;
    color: #1e2235;
    outline: none;
    transition: border-color .15s, box-shadow .15s, background .15s;
    box-sizing: border-box;
  }
  .awd-input::placeholder { color: #a0a8c0; }
  .awd-input:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99,102,241,0.09);
    background: #fff;
  }
  .awd-input.awd-input-error {
    border-color: #f43f5e;
    background: rgba(244,63,94,0.03);
  }
  .awd-input.awd-input-error:focus {
    box-shadow: 0 0 0 3px rgba(244,63,94,0.09);
  }

  /* ── Error message ── */
  .awd-error {
    display: flex;
    align-items: center;
    gap: 5px;
    font-size: 11.5px;
    font-weight: 600;
    color: #f43f5e;
  }

  /* ── Min withdraw notice ── */
  .awd-notice {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 9px 13px;
    border-radius: 9px;
    background: rgba(245,158,11,0.08);
    border: 1px solid rgba(245,158,11,0.20);
    font-size: 12px;
    font-weight: 600;
    color: #d97706;
  }

  /* ── Divider ── */
  .awd-divider {
    height: 1px;
    background: #e8eaf2;
    margin: 2px 0;
  }

  /* ── Footer ── */
  .awd-footer {
    padding: 16px 24px;
    border-top: 1px solid #e8eaf2;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 10px;
    background: linear-gradient(0deg, rgba(99,102,241,0.02), transparent);
  }

  .awd-btn-cancel {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 10px 20px; border-radius: 10px;
    background: #f4f5fb; border: 1.5px solid #e8eaf2;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 700; color: #64748b;
    cursor: pointer; transition: background .14s, border-color .14s;
  }
  .awd-btn-cancel:hover { background: #eef0f8; border-color: #d0d4e8; }

  .awd-btn-submit {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 10px 22px; border-radius: 10px;
    background: linear-gradient(135deg, #6366f1, #a855f7);
    border: none;
    font-family: 'Outfit', sans-serif;
    font-size: 13px; font-weight: 700; color: #fff;
    cursor: pointer;
    box-shadow: 0 3px 12px rgba(99,102,241,0.25);
    transition: opacity .15s, transform .12s, box-shadow .15s;
  }
  .awd-btn-submit:hover {
    opacity: .92;
    transform: translateY(-1px);
    box-shadow: 0 5px 18px rgba(99,102,241,0.32);
  }
  .awd-btn-submit:active { transform: translateY(0); }
`;

interface ErrorState {
  paymentGateway: string;
  coin: string;
  dynamicFields: string[];
}

interface DynamicFieldValue {
  label: string;
  value: string;
}

const AddWithdrawDialogue = () => {
  const dispatch = useAppDispatch();
  const { dialogue, dialogueData } = useSelector((state: RootStore) => state.dialogue);
  const { paymentMethod } = useSelector((state: RootStore) => state.setting);

  const [addCategory, setAddCategory] = useState(false);
  const [paymentGateway, setPaymentGateway] = useState<string>("");
  const [coin, setCoin] = useState<number | string>("");
  const [dynamicFields, setDynamicFields] = useState<DynamicFieldValue[]>([]);
  const [error, setError] = useState<ErrorState>({
    paymentGateway: "", coin: "", dynamicFields: [],
  });

  const selectedMethod = paymentMethod.find((item) => item?.name === paymentGateway);

  useEffect(() => { dispatch(getPaymentMethod()); }, [dispatch]);
  useEffect(() => { if (dialogue) setAddCategory(true); }, [dialogue]);

  useEffect(() => {
    if (selectedMethod?.details?.length > 0) {
      let labelsArray: string[] = [];
      if (typeof selectedMethod.details[0] === "string") {
        labelsArray = selectedMethod.details[0].split(",").map((item) => item.trim());
      }
      setDynamicFields(labelsArray.map((label) => ({ label, value: "" })));
      setError((prev) => ({ ...prev, dynamicFields: labelsArray.map(() => "") }));
    }
  }, [paymentGateway]);

  const handleClose = () => { setAddCategory(false); dispatch(closeDialog()); };

  const handleDynamicFieldChange = (index: number, value: string) => {
    const updatedFields = [...dynamicFields];
    updatedFields[index].value = value;
    setDynamicFields(updatedFields);

    const updatedErrors = [...error.dynamicFields];
    const label = updatedFields[index].label.toLowerCase();
    if (!value) updatedErrors[index] = `${updatedFields[index].label} is required.`;
    else if (label.includes("email") && !/\S+@\S+\.\S+/.test(value))
      updatedErrors[index] = `${updatedFields[index].label} must be a valid email.`;
    else if (label.includes("contact") && !/^\d{10}$/.test(value))
      updatedErrors[index] = `${updatedFields[index].label} must be a valid 10-digit number.`;
    else updatedErrors[index] = "";
    setError((prev) => ({ ...prev, dynamicFields: updatedErrors }));
  };

  const validateFields = () => {
    const errors: ErrorState = { paymentGateway: "", coin: "", dynamicFields: [] };
    if (!paymentGateway) errors.paymentGateway = "Payment Gateway is required.";
    if (!coin) errors.coin = "Coin is required.";
    else if (Number(coin) <= 0) errors.coin = "Coin must be greater than 0.";

    dynamicFields.forEach((field, index) => {
      const label = field.label.toLowerCase();
      if (!field.value) errors.dynamicFields[index] = `${field.label} is required.`;
      else if (label.includes("email") && !/\S+@\S+\.\S+/.test(field.value))
        errors.dynamicFields[index] = `${field.label} must be a valid email.`;
      else if (label.includes("contact") && !/^\d{10}$/.test(field.value))
        errors.dynamicFields[index] = `${field.label} must be a valid 10-digit number.`;
      else errors.dynamicFields[index] = "";
    });

    setError(errors);
    return !(errors.paymentGateway || errors.coin || errors.dynamicFields.some((m) => m));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateFields()) return;

    if (dialogueData) {
      const formData = new FormData();
      formData.append("paymentMethodId", dialogueData._id);
      dynamicFields.forEach((field) => formData.append(field.label, field.value));
      formData.append("coin", String(coin));
      dispatch(updateWithdrawMethod({ formData }));
    } else {
      const dynamicFieldsObject = dynamicFields.reduce((acc, item) => {
        acc[item.label] = item.value; return acc;
      }, {} as Record<string, string>);
      dispatch(createWithdrawRequest({ paymentGateway, coin, paymentDetails: dynamicFieldsObject }));
    }
    handleClose();
  };

  return (
    <>
      <style>{addWithdrawStyle}</style>

      <Modal open={addCategory} onClose={handleClose}>
        <div className="awd-overlay">
          <div className="awd-modal">

            {/* ── Header ── */}
            <div className="awd-head">
              <div className="awd-head-left">
                <div className="awd-head-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                    stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <div>
                  <h3>Add Withdraw Request</h3>
                  <p>Fill in payment details to submit</p>
                </div>
              </div>
              <button className="awd-close" onClick={handleClose}>
                <i className="ri-close-line" />
              </button>
            </div>

            {/* ── Body ── */}
            <form onSubmit={handleSubmit}>
              <div className="awd-body">

                {/* Payment Gateway select */}
                <div className="awd-field">
                  <label className="awd-label">
                    <span className="awd-label-dot" />
                    Payment Gateway
                  </label>
                  <select
                    className="awd-select"
                    value={paymentGateway}
                    onChange={(e) => setPaymentGateway(e.target.value)}
                  >
                    <option value="">— Select Payment Gateway —</option>
                    {paymentMethod.map((method) => (
                      <option key={method.name} value={method.name}>
                        {method.name}
                      </option>
                    ))}
                  </select>
                  {error.paymentGateway && (
                    <span className="awd-error">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error.paymentGateway}
                    </span>
                  )}
                </div>

                {/* Dynamic fields */}
                {dynamicFields.map((field, index) => (
                  <div className="awd-field" key={index}>
                    <label className="awd-label">
                      <span className="awd-label-dot" />
                      {field.label}
                    </label>
                    <input
                      className={`awd-input ${error.dynamicFields[index] ? "awd-input-error" : ""}`}
                      type={field.label.toLowerCase().includes("number") ? "number" : "text"}
                      placeholder={`Enter ${field.label}`}
                      value={field.value}
                      onChange={(e) => handleDynamicFieldChange(index, e.target.value)}
                    />
                    {error.dynamicFields[index] && (
                      <span className="awd-error">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                          stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        {error.dynamicFields[index]}
                      </span>
                    )}
                  </div>
                ))}

                {/* Divider before coin */}
                {dynamicFields.length > 0 && <div className="awd-divider" />}

                {/* Coin input */}
                <div className="awd-field">
                  <label className="awd-label">
                    <span className="awd-label-dot" style={{ background: "#f59e0b" }} />
                    Coin Amount
                  </label>
                  <input
                    className={`awd-input ${error.coin ? "awd-input-error" : ""}`}
                    type="number"
                    placeholder="Enter coin amount"
                    value={coin}
                    onChange={(e) => {
                      setCoin(e.target.value);
                      setError((prev) => ({
                        ...prev,
                        coin: !e.target.value ? "Coin is required." : "",
                      }));
                    }}
                  />
                  {error.coin && (
                    <span className="awd-error">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      {error.coin}
                    </span>
                  )}
                </div>

                {/* Min withdrawal notice */}
                <div className="awd-notice">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  Minimum Withdrawal Coin: <strong>10</strong>
                </div>

              </div>

              {/* ── Footer ── */}
              <div className="awd-footer">
                <button
                  type="button"
                  className="awd-btn-cancel"
                  onClick={handleClose}
                >
                  Cancel
                </button>
                <button type="submit" className="awd-btn-submit">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Submit Request
                </button>
              </div>
            </form>

          </div>
        </div>
      </Modal>
    </>
  );
};

export default AddWithdrawDialogue;