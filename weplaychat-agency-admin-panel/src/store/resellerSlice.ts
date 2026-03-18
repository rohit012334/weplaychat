"use client";

import { apiInstanceFetch } from "@/utils/ApiInstance";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { setToast } from "@/utils/toastServices";
import { SetDevKey, setToken } from "@/utils/setAuthAxios";
import { key } from "@/utils/config";
import { DangerRight } from "@/api/toastServices";
import CryptoJS from "crypto-js";

interface ResellerState {
  isAuth: boolean;
  reseller: any;
  isLoading: boolean;
  currentRole: string;
}

const initialState: ResellerState = {
  isAuth: false,
  reseller: {},
  isLoading: false,
  currentRole: "",
};

const token = typeof window !== "undefined" && sessionStorage.getItem("token");
const uid = typeof window !== "undefined" && sessionStorage.getItem("uid");

// Reseller Login Thunk
export const loginReseller = createAsyncThunk(
  "api/admin/reseller/validateResellerLogin",
  async (payload: any) => {
    return apiInstanceFetch.post(
      "api/admin/reseller/validateResellerLogin",
      payload
    );
  }
);

// Get Reseller Profile
export const getResellerProfile = createAsyncThunk(
  "api/reseller/getResellerProfile",
  async () => {
    return apiInstanceFetch.get("api/reseller/getResellerProfile");
  }
);

// Update Reseller Profile
export const updateResellerProfile = createAsyncThunk(
  "api/reseller/modifyReseller",
  async (formData: FormData) => {
    return apiInstanceFetch.patch(
      "api/reseller/modifyReseller",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
  }
);

const resellerSlice = createSlice({
  name: "reseller",
  initialState,
  reducers: {
    logoutReseller(state: any) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("uid");
      sessionStorage.removeItem("reseller_");
      sessionStorage.removeItem("isAuth");
      sessionStorage.removeItem("currentRole");

      if (typeof window !== "undefined") {
        localStorage.removeItem("persist:reseller");
      }
    },
    setLoading(state: any, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
  extraReducers: (builder: any) => {
    // Login Reseller
    builder.addCase(loginReseller.pending, (state: any) => {
      state.isLoading = true;
    });
builder.addCase(loginReseller.fulfilled, (state: any, action: any) => {
  state.isLoading = false;

  if (action.payload?.status === true) {
    const reseller = action.payload.reseller;
    
    // Token and UID come from Firebase authentication (already in sessionStorage)
    // They are NOT sent from backend
    const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
    const uid = typeof window !== "undefined" ? sessionStorage.getItem("uid") : null;

    // ✅ Update Redux State
    state.isAuth = true;
    state.currentRole = "reseller";
    state.reseller = reseller;

    // ✅ Save in Session Storage
    sessionStorage.setItem("reseller_", JSON.stringify(reseller));
    sessionStorage.setItem("isAuth", "true");
    sessionStorage.setItem("currentRole", "reseller");

    // ✅ Optional encryption if required
    const encrypted = CryptoJS.AES.encrypt(
      action?.meta?.arg?.password,
      key
    ).toString();
    sessionStorage.setItem("data", encrypted);

    // ✅ Set token in axios header (if it exists)
    if (token) {
      setToken(token);
    }
    SetDevKey(key);

    setToast("success", "Reseller Login Successfully");

    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);

  } else {
    DangerRight(action.payload?.message || "Login failed.");
  }
});
    builder.addCase(loginReseller.rejected, (state: any) => {
      state.isLoading = false;
      setToast("error", "Reseller login failed.");
    });

    // Get Reseller Profile
    builder.addCase(getResellerProfile.pending, (state: any) => {
      state.isLoading = true;
    });
    builder.addCase(
      getResellerProfile.fulfilled,
      (state: any, action: any) => {
        state.isLoading = false;
        if (action.payload?.status === true) {
          state.reseller = action.payload.reseller;
          sessionStorage.setItem("reseller_", JSON.stringify(action.payload.reseller));
        }
      }
    );
    builder.addCase(getResellerProfile.rejected, (state: any) => {
      state.isLoading = false;
    });

    // Update Reseller Profile
    builder.addCase(updateResellerProfile.pending, (state: any) => {
      state.isLoading = true;
    });
    builder.addCase(updateResellerProfile.fulfilled, (state: any, action: any) => {
      state.isLoading = false;
      if (action.payload?.status === true) {
        state.reseller = action.payload.data;
        sessionStorage.setItem("reseller_", JSON.stringify(action.payload.data));
        setToast("success", "Profile updated successfully!");
      } else {
        setToast("error", action.payload?.message || "Failed to update profile");
      }
    });
    builder.addCase(updateResellerProfile.rejected, (state: any) => {
      state.isLoading = false;
      setToast("error", "Failed to update profile");
    });
  },
});

export const { logoutReseller, setLoading } = resellerSlice.actions;
export default resellerSlice.reducer;
