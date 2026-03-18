/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";
import { Textarea } from "../extra/Input";
import PasswordInput from "../extra/PasswordInput";
import { useAppDispatch } from "@/store/store";
import { signUpAdmin } from "@/store/adminSlice";
const loginImageUrl = "https://plus.unsplash.com/premium_photo-1681487916420-8f50a06eb60e?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/component/lib/firebaseConfig";
import { setToast } from "@/utils/toastServices";

import Tooltip from "@mui/material/Tooltip";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import Link from "next/link";

// ── Same logo as Sidebar ──
import LogoNew from "@/assets/images/unnamed__2_..-removebg-preview.png";

type ErrorState = {
  name: string;
  email: string;
  password: string;
  newPassword: string;
  code: string;
  privateKey: string;
};
type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  code: string;
  uid: string;
  token: string;
  privateKey: unknown;
};

export default function Registration() {
  const dispatch = useAppDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [code, setCode] = useState("");
  const [privateKeyInput, setPrivateKeyInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<ErrorState>({
    name: "",
    email: "",
    password: "",
    newPassword: "",
    code: "",
    privateKey: "",
  });

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setPrivateKeyInput(value);

    if (!value.trim()) {
      setJsonError("Firebase JSON key is required!");
      return;
    }

    try {
      JSON.parse(value);
      setJsonError(""); // clear error if valid
    } catch {
      setJsonError("Invalid JSON format!");
    }
  };

  const validateForm = () => {
    const errorObj: any = {};

    if (!name.trim()) {
      errorObj.name = "Name is required!";
    }

    if (!email) {
      errorObj.email = "Email is required!";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errorObj.email = "Please enter a valid email address!";
    }

    if (!password) {
      errorObj.password = "Password is required!";
    } else if (password.length < 6) {
      errorObj.password = "Password must be at least 6 characters long!";
    }

    if (!newPassword) {
      errorObj.newPassword = "Confirm password is required!";
    } else if (newPassword !== password) {
      errorObj.newPassword = "Passwords do not match!";
    }

    if (!privateKeyInput) {
      errorObj.privateKey = "Private key JSON is required!";
    } else {
      try {
        JSON.parse(privateKeyInput);
      } catch {
        errorObj.privateKey = "Invalid JSON format!";
      }
    }

    setError({
      name: errorObj.name || "",
      email: errorObj.email || "",
      password: errorObj.password || "",
      newPassword: errorObj.newPassword || "",
      code: errorObj.code || "",
      privateKey: errorObj.privateKey || "",
    });
    return Object.keys(errorObj).length === 0;
  };

  const handleSubmit = async () => {
    setError({
      name: "",
      email: "",
      password: "",
      newPassword: "",
      code: "",
      privateKey: "",
    });

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const parsedKey = JSON.parse(privateKeyInput);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const uid = userCredential.user.uid;
      const token = await userCredential.user.getIdToken(true);

      const payload: RegisterPayload = {
        name,
        email,
        password,
        code,
        uid,
        token,
        privateKey: parsedKey,
      };

      await dispatch(signUpAdmin(payload));
      setLoading(false);
    } catch (firebaseError: unknown) {
      const errorWithCode = firebaseError as { code?: string };
      if (errorWithCode?.code) {
        switch (errorWithCode.code) {
          case "auth/email-already-in-use":
            setError((prev: ErrorState) => ({
              ...prev,
              email: "This email is already registered.",
            }));
            break;
          case "auth/weak-password":
            setError((prev: ErrorState) => ({
              ...prev,
              password: "Password is too weak.",
            }));
            break;
          case "auth/invalid-email":
            setError((prev: ErrorState) => ({ ...prev, email: "Invalid email format." }));
            break;
        }
      } else {
        setToast(
          "error",
          "An unexpected error occurred. Please try again later."
        );
      }
      setLoading(false);
    }
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

        /* ══════════════════════════
           LEFT — image panel
        ══════════════════════════ */
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

        /* ══════════════════════════
           RIGHT — form panel
        ══════════════════════════ */
        .lg-right {
          width: 500px;
          min-width: 500px;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 48px 48px;
          position: relative;
          overflow-y: auto;
          box-shadow: -10px 0 50px rgba(99,102,241,0.09);
        }

        .lg-right::-webkit-scrollbar {
          width: 6px;
        }
        .lg-right::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }

        .lg-right::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 4px;
          background: linear-gradient(90deg, #6366f1 0%, #a855f7 50%, #ec4899 100%);
          border-radius: 0 0 4px 4px;
          z-index: 10;
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
          width: 64px;
          height: 64px;
          border-radius: 18px;
          background: linear-gradient(135deg, rgba(99,102,241,0.10) 0%, rgba(168,85,247,0.10) 100%);
          border: 1.5px solid rgba(99,102,241,0.18);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 6px 20px rgba(99,102,241,0.12);
          margin-bottom: 24px;
        }

        .lg-logo-card img {
          height: 44px;
          width: 44px;
          object-fit: contain;
        }

        .lg-brand-name {
          font-family: 'Nunito', sans-serif;
          font-size: 24px;
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
          margin-bottom: 24px;
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
          max-width: 360px;
        }

        .lg-form {
          width: 100%;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .lg-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .lg-field label {
          font-size: 12px;
          font-weight: 700;
          color: #475569;
          letter-spacing: 0.3px;
          text-transform: uppercase;
        }

        .lg-field input, .lg-field textarea {
          width: 100%;
          padding: 12px 16px;
          border: 1.5px solid #e2e8f0;
          border-radius: 12px;
          font-family: 'Outfit', sans-serif;
          font-size: 14px;
          color: #1e2235;
          background: #f8fafc;
          outline: none;
          transition: all 0.18s;
        }

        .lg-field input:focus, .lg-field textarea:focus {
          border-color: #6366f1;
          background: #ffffff;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.10);
        }

        .lg-error {
          font-size: 11px;
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
          box-shadow: 0 6px 20px rgba(99,102,241,0.25);
          margin-top: 8px;
          transition: all 0.18s;
        }

        .lg-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(99,102,241,0.35);
        }

        .lg-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 900px) {
          .lg-left { display: none; }
          .lg-right { width: 100%; min-width: unset; padding: 40px 24px; }
        }
      `}</style>

      <div className="lg-root">
        <div className="lg-left">
          <div className="lg-orb lg-orb-1" />
          <div className="lg-orb lg-orb-2" />
          <img src={loginImageUrl} alt="Registration" className="lg-left-img" />
          <div className="lg-left-content">
            <div className="lg-badge">
              <span className="lg-badge-dot" />
              Registration
            </div>
            <h1>
              Join<br />
              <span className="hl">WePlay Chat</span>
            </h1>
            <p>
              Create your account to start managing your platform. Experience the most powerful admin tools in the market.
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
            <span className="lg-admin-pill-text">New Account</span>
          </div>

          <h2 className="lg-title">Create Account</h2>
          <p className="lg-subtitle">
            Fill in the details below to register your administrator account.
          </p>

          <div className="lg-form">
            <div className="lg-field">
              <label>Full Name</label>
              <input
                type="text"
                value={name}
                placeholder="Enter your name"
                onChange={(e) => {
                  setName(e.target.value);
                  setError((prev: ErrorState) => ({ ...prev, name: e.target.value ? "" : "Name is required" }));
                }}
              />
              {error.name && <span className="lg-error">{error.name}</span>}
            </div>

            <div className="lg-field">
              <label>Email Address</label>
              <input
                type="text"
                value={email}
                placeholder="Enter your email"
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError((prev: ErrorState) => ({ ...prev, email: e.target.value ? "" : "Email is required" }));
                }}
              />
              {error.email && <span className="lg-error">{error.email}</span>}
            </div>

            <PasswordInput
              label="Password"
              value={password}
              placeholder="Min. 6 characters"
              onChange={(e: any) => {
                setPassword(e.target.value);
                setError({ ...error, password: e.target.value ? "" : "Password is Required" });
              }}
              error={error.password}
            />

            <PasswordInput
              label="Confirm Password"
              value={newPassword}
              placeholder="Repeat your password"
              onChange={(e: any) => {
                setNewPassword(e.target.value);
                setError({ ...error, newPassword: e.target.value === password ? "" : "Passwords do not match" });
              }}
              error={error.newPassword}
            />

            <div className="lg-field">
              <label>Purchase Code</label>
              <input
                type="text"
                value={code}
                placeholder="Enter your purchase code"
                onChange={(e) => {
                  setCode(e.target.value);
                  setError((prev: ErrorState) => ({ ...prev, code: e.target.value ? "" : "Purchase code is required" }));
                }}
              />
              {error.code && <span className="lg-error">{error.code}</span>}
            </div>

            <div className="lg-field">
              <label style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                Firebase Private Key JSON
                <Tooltip title="Firebase Cloud Messaging (FCM) configuration.">
                  <Link href="https://docs.codderlab.com/Figgy/" target="_blank">
                    <InfoOutlinedIcon sx={{ fontSize: 16, color: "#6c757d", cursor: "pointer" }} />
                  </Link>
                </Tooltip>
              </label>
              <Textarea
                rows={4}
                value={privateKeyInput}
                placeholder="Paste JSON here..."
                onChange={handleJsonChange}
                style={{ fontSize: '13px' }}
              />
              {(jsonError || error.privateKey) && <span className="lg-error">{jsonError || error.privateKey}</span>}
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              className="lg-btn"
              disabled={loading}
            >
              {loading ? "Creating account..." : "Register Now →"}
            </button>

            <p style={{ textAlign: "center", marginTop: "12px", fontSize: "13px", color: "#94a3b8" }}>
              Already have an account?{" "}
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

