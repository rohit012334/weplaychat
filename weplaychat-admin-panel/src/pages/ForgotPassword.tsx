"use client";
import React, { useState } from "react";
import { useAppDispatch } from "@/store/store";
import { sendEmailandForgotPassword } from "@/store/adminSlice";
import Link from "next/link";

// ── Same logo as Sidebar ──
import LogoNew from "@/assets/images/unnamed__2_..-removebg-preview.png";

const loginImageUrl =
  "https://plus.unsplash.com/premium_photo-1681487916420-8f50a06eb60e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function ForgotPassword() {
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [error, setError] = useState({ email: "" });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email) {
      return setError({ email: "Email Is Required!" });
    }
    setLoading(true);
    await dispatch(sendEmailandForgotPassword(email));
    setLoading(false);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@700;800;900&family=Outfit:wght@300;400;500;600;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .lg-root {
          display: flex;
          height: 100vh;
          width: 100vw;
          font-family: 'Outfit', sans-serif;
          overflow: hidden;
        }

        .lg-left {
          position: relative;
          flex: 1;
          overflow: hidden;
        }

        .lg-left-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
          transform: scale(1.03);
          transition: transform 8s ease;
        }

        .lg-left::after {
          content: '';
          position: absolute;
          inset: 0;
          background:
            linear-gradient(to top, rgba(10,10,30,0.85) 0%, rgba(10,10,30,0.30) 50%, transparent 100%),
            linear-gradient(135deg, rgba(99,102,241,0.25) 0%, rgba(168,85,247,0.15) 100%);
        }

        .lg-left-content {
          position: absolute;
          inset: 0;
          z-index: 2;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 52px;
        }

        .lg-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: rgba(255,255,255,0.10);
          border: 1px solid rgba(255,255,255,0.20);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          border-radius: 30px;
          padding: 7px 16px;
          font-size: 11px;
          font-weight: 700;
          color: rgba(255,255,255,0.92);
          letter-spacing: 1.4px;
          text-transform: uppercase;
          margin-bottom: 22px;
          width: fit-content;
        }

        .lg-badge-dot {
          width: 7px; height: 7px;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          border-radius: 50%;
          animation: bdot 2.2s ease-in-out infinite;
          flex-shrink: 0;
        }

        @keyframes bdot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:0.5; transform:scale(1.6); }
        }

        .lg-left-content h1 {
          font-family: 'Nunito', sans-serif;
          font-size: 40px;
          font-weight: 900;
          color: #ffffff;
          line-height: 1.18;
          margin-bottom: 14px;
          text-shadow: 0 2px 20px rgba(0,0,0,0.35);
          letter-spacing: -0.5px;
        }

        .lg-left-content h1 .hl {
          background: linear-gradient(135deg, #a78bfa 0%, #f0abfc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lg-left-content p {
          font-size: 15px;
          font-weight: 400;
          color: rgba(255,255,255,0.68);
          max-width: 360px;
          line-height: 1.7;
        }

        .lg-orb {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }
        .lg-orb-1 {
          width: 300px; height: 300px;
          top: -80px; left: -80px;
          background: radial-gradient(circle, rgba(99,102,241,0.25) 0%, transparent 70%);
        }
        .lg-orb-2 {
          width: 200px; height: 200px;
          top: 40%; right: 10%;
          background: radial-gradient(circle, rgba(168,85,247,0.20) 0%, transparent 70%);
        }

        .lg-right {
          width: 460px;
          min-width: 460px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 48px;
          position: relative;
          overflow-y: auto;
          box-shadow: -10px 0 50px rgba(99,102,241,0.09);
        }

        .lg-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
          border-radius: 0 0 4px 4px;
        }

        .lg-right::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image: radial-gradient(circle, rgba(99,102,241,0.04) 1px, transparent 1px);
          background-size: 28px 28px;
          pointer-events: none;
          z-index: 0;
        }

        .lg-right > * { position: relative; z-index: 1; }

        .lg-logo-card {
          width: 72px;
          height: 72px;
          border-radius: 20px;
          background: linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(168,85,247,0.10) 100%);
          border: 1.5px solid rgba(99,102,241,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(99,102,241,0.15);
          margin-bottom: 28px;
        }

        .lg-logo-card img {
          height: 50px;
          width: 50px;
          object-fit: contain;
        }

        .lg-brand-name {
          font-family: 'Nunito', sans-serif;
          font-size: 28px;
          font-weight: 900;
          line-height: 1;
          letter-spacing: -0.4px;
          margin-bottom: 6px;
          display: flex;
          gap: 4px;
        }

        .lg-brand-name .part1 { color: #1e2235; }
        .lg-brand-name .part2 {
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lg-admin-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: linear-gradient(135deg, rgba(99,102,241,0.09) 0%, rgba(168,85,247,0.07) 100%);
          border: 1px solid rgba(99,102,241,0.18);
          border-radius: 20px;
          padding: 3px 11px 3px 8px;
          margin-bottom: 28px;
        }

        .lg-admin-pill-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          background: linear-gradient(135deg, #6366f1, #a855f7);
          animation: bdot 2.2s ease-in-out infinite;
        }

        .lg-admin-pill-text {
          font-family: 'Outfit', sans-serif;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .lg-title {
          font-family: 'Nunito', sans-serif;
          font-size: 22px;
          font-weight: 800;
          color: #1e2235;
          margin-bottom: 6px;
          text-align: center;
        }

        .lg-subtitle {
          font-size: 13px;
          color: #94a3b8;
          text-align: center;
          line-height: 1.65;
          margin-bottom: 32px;
          max-width: 320px;
        }

        .lg-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .lg-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lg-field label {
          font-size: 12.5px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .lg-field input {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 14.5px;
          color: #1e2235;
          background: #f8fafc;
          outline: none;
          transition: all 0.18s;
        }

        .lg-field input:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
        }

        .lg-error {
          font-size: 11.5px;
          color: #f43f5e;
          margin-top: 1px;
        }

        .lg-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: #ffffff;
          font-family: 'Nunito', sans-serif;
          font-size: 16px;
          font-weight: 800;
          cursor: pointer;
          letter-spacing: 0.4px;
          box-shadow: 0 6px 20px rgba(99,102,241,0.32);
          margin-top: 4px;
          transition: all 0.18s;
        }

        .lg-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .lg-left { display: none; }
          .lg-right { width: 100%; min-width: unset; padding: 40px 28px; }
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-left">
          <div className="lg-orb lg-orb-1" />
          <div className="lg-orb lg-orb-2" />
          <img src={loginImageUrl} alt="Forgot Password" className="lg-left-img" />
          <div className="lg-left-content">
            <div className="lg-badge">
              <span className="lg-badge-dot" />
              Security
            </div>
            <h1>
              Forgot your<br />
              <span className="hl">Password?</span>
            </h1>
            <p>
              Don't worry! It happens. Enter your email address and we'll send you instructions to reset your password.
            </p>
          </div>
        </div>

        <div className="lg-right">
          <div className="lg-logo-card">
            <img src={LogoNew.src} alt="Logo" />
          </div>
          <div className="lg-brand-name">
            <span className="part1">WePlay</span>
            <span className="part2">Chat</span>
          </div>
          <div className="lg-admin-pill">
            <span className="lg-admin-pill-dot" />
            <span className="lg-admin-pill-text">Recovery</span>
          </div>

          <h2 className="lg-title">Reset Password</h2>
          <p className="lg-subtitle">
            Please enter your registered email address to receive a reset link.
          </p>

          <div className="lg-form">
            <div className="lg-field">
              <label>Email Address</label>
              <input
                type="text"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError({ email: e.target.value ? "" : "Email is required" });
                }}
              />
              {error.email && <span className="lg-error">{error.email}</span>}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="lg-btn"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link →"}
            </button>

            <p style={{ textAlign: "center", marginTop: "16px", fontSize: "13px", color: "#94a3b8" }}>
              Remember your password?{" "}
              <Link href="/Login" style={{ color: "#6366f1", fontWeight: "700", textDecoration: "none" }}>
                Log In →
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}



