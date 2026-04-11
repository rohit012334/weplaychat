import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface LevelState {
    levels: any[];
    isLoading: boolean;
    isSkeleton: boolean;
}

const initialState: LevelState = {
    levels: [],
    isLoading: false,
    isSkeleton: false,
};

// GET all levels
export const getLevels: any = createAsyncThunk(
    "level/getLevels",
    async () => {
        return apiInstanceFetch.get(`api/admin/level`);
    }
);

// UPDATE level
export const updateLevel: any = createAsyncThunk(
    "level/updateLevel",
    async (payload: { formData: FormData; levelId: string }) => {
        return apiInstanceFetch.patch(
            `api/admin/level/update?levelId=${payload.levelId}`,
            payload.formData
        );
    }
);

// INITIALIZE levels
export const initLevels: any = createAsyncThunk(
    "level/initLevels",
    async () => {
        return apiInstanceFetch.post(`api/admin/level/init`);
    }
);

const levelSlice = createSlice({
    name: "level",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // GET levels
        builder.addCase(getLevels.pending, (state) => {
            state.isSkeleton = true;
        });
        builder.addCase(getLevels.fulfilled, (state, action: PayloadAction<any>) => {
            state.isSkeleton = false;
            state.levels = action.payload.data || [];
        });
        builder.addCase(getLevels.rejected, (state) => {
            state.isSkeleton = false;
        });

        // UPDATE level
        builder.addCase(updateLevel.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateLevel.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                const idx = state.levels.findIndex(
                    (l) => l._id === action.payload.data?._id
                );
                if (idx !== -1) {
                    state.levels[idx] = { ...state.levels[idx], ...action.payload.data };
                }
                Success("Level Updated Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(updateLevel.rejected, (state) => {
            state.isLoading = false;
        });

        // INIT levels
        builder.addCase(initLevels.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(initLevels.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                Success("Levels Initialized Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(initLevels.rejected, (state) => {
            state.isLoading = false;
        });
    },
});

export default levelSlice.reducer;
