import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiInstanceFetch } from "@/utils/ApiInstance";

interface ResellerRechargeState {
  searchedUser: any | null;
  history: any[];
  loading: boolean;
  error: string | null;
}

const initialState: ResellerRechargeState = {
  searchedUser: null,
  history: [],
  loading: false,
  error: null,
};

/* ================================
   Find User
================================ */
export const findUser = createAsyncThunk(
  "reseller/findUser",
  async (userId: string) => {
    const res = await apiInstanceFetch.post(
      "api/admin/reseller/findUser",
      { userId }
    );
    return res;
  }
);

/* ================================
   Create Recharge
================================ */
export const createRecharge = createAsyncThunk(
  "reseller/createRecharge",
  async (payload: { userId: string; amount: number }) => {
    const res = await apiInstanceFetch.post(
      "api/admin/reseller/rechargeHistory",
      payload
    );
    return res.data;
  }
);

/* ================================
   Get Recharge History
================================ */
export const getRechargeHistory = createAsyncThunk(
  "reseller/getRechargeHistory",
  async () => {
    const res = await apiInstanceFetch.get(
      "api/admin/reseller/rechargeHistory"
    );
    return res.data;
  }
);

/* ================================
   Update Recharge Status
================================ */
export const updateRechargeStatus = createAsyncThunk(
  "reseller/updateRechargeStatus",
  async (params: { id: string; status: string }) => {
    const res = await apiInstanceFetch.patch(
      `api/admin/reseller/recharge/${params.id}/status`,
      { status: params.status }
    );
    return res.data;
  }
);

/* ================================
   Slice
================================ */
const resellerRechargeSlice = createSlice({
  name: "resellerRecharge",
  initialState,
  reducers: {},

  extraReducers: (builder) => {
    /* ================================
       Find User
    ================================= */
    builder.addCase(findUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(findUser.fulfilled, (state, action: PayloadAction<any>) => {
      state.loading = false;
       console.log("findUser response:", action.payload);
      if (action.payload?.status) {
        state.searchedUser = action.payload.user;
      } else {
        state.error = action.payload?.message || "User not found";
      }
    });

    builder.addCase(findUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Failed to find user";
    });

    /* ================================
       Create Recharge
    ================================= */
    builder.addCase(createRecharge.pending, (state) => {
      state.loading = true;
      state.error = null;
    });

    builder.addCase(
      createRecharge.fulfilled,
      (state, action: PayloadAction<any>) => {
        state.loading = false;

        if (!action.payload?.status) {
          state.error = action.payload?.message || "Recharge failed";
        }
      }
    );

    builder.addCase(createRecharge.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || "Recharge failed";
    });

    /* ================================
       Get Recharge History
    ================================= */
builder.addCase(getRechargeHistory.pending, (state) => {
  state.loading = true;
  state.error = null;
});

builder.addCase(
  getRechargeHistory.fulfilled,
  (state, action: PayloadAction<any>) => {
    state.loading = false;

    console.log("API RESPONSE:", action.payload);

    state.history = action.payload?.recharges || [];
  }
);

builder.addCase(getRechargeHistory.rejected, (state, action) => {
  state.loading = false;
  state.error = action.error.message || "Failed to fetch history";
});

    /* ================================
       Update Recharge Status
    ================================= */
    builder.addCase(
      updateRechargeStatus.fulfilled,
      (state, action: PayloadAction<any>) => {
        if (action.payload?.status) {
          const updatedRecharge = action.payload?.data;

          const index = state.history.findIndex(
            (r) => r._id === updatedRecharge?._id
          );

          if (index !== -1) {
            state.history[index] = updatedRecharge;
          }
        }
      }
    );
  },
});

export default resellerRechargeSlice.reducer;