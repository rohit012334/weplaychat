import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface BackgroundState {
    backgrounds: any[];
    total: number;
    isLoading: boolean;
    isSkeleton: boolean;
}

const initialState: BackgroundState = {
    backgrounds: [],
    total: 0,
    isLoading: false,
    isSkeleton: false,
};

export const getBackgrounds: any = createAsyncThunk(
    "background/getBackgrounds",
    async (payload: { start: number; limit: number } | undefined) => {
        return apiInstanceFetch.get(
            `api/admin/background/listBackgrounds?start=${payload?.start}&limit=${payload?.limit}`
        );
    }
);

export const createBackground: any = createAsyncThunk(
    "background/createBackground",
    async (payload: FormData) => {
        return apiInstanceFetch.post(`api/admin/background/createBackground`, payload);
    }
);

export const updateBackground: any = createAsyncThunk(
    "background/updateBackground",
    async (payload: { formData: FormData; backgroundId: string }) => {
        return apiInstanceFetch.patch(
            `api/admin/background/updateBackground?backgroundId=${payload.backgroundId}`,
            payload.formData
        );
    }
);

export const updateBackgroundStatus: any = createAsyncThunk(
    "background/updateBackgroundStatus",
    async (backgroundId: string) => {
        return apiInstanceFetch.patch(
            `api/admin/background/updateBackgroundStatus?backgroundId=${backgroundId}`,
            {}
        );
    }
);

export const deleteBackground: any = createAsyncThunk(
    "background/deleteBackground",
    async (backgroundId: string) => {
        return apiInstanceFetch.delete(
            `api/admin/background/deleteBackground?backgroundId=${backgroundId}`
        );
    }
);

const backgroundSlice = createSlice({
    name: "background",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getBackgrounds.pending, (state) => {
            state.isSkeleton = true;
        });
        builder.addCase(getBackgrounds.fulfilled, (state, action: PayloadAction<any>) => {
            state.isSkeleton = false;
            state.backgrounds = action.payload.data;
            state.total = action.payload.total;
        });
        builder.addCase(getBackgrounds.rejected, (state) => {
            state.isSkeleton = false;
        });

        builder.addCase(createBackground.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(createBackground.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.backgrounds.unshift(action.payload.data);
                state.total += 1;
                Success("Background Created Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(createBackground.rejected, (state) => {
            state.isLoading = false;
        });

        builder.addCase(updateBackground.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateBackground.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                const idx = state.backgrounds.findIndex(e => e._id === action.payload.data?._id);
                if (idx !== -1) state.backgrounds[idx] = action.payload.data;
                Success("Background Updated Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(updateBackground.rejected, (state) => {
            state.isLoading = false;
        });
        builder.addCase(updateBackgroundStatus.fulfilled, (state, action: PayloadAction<any>) => {
            if (action.payload.status) {
                const idx = state.backgrounds.findIndex(e => e._id === action.payload.data?._id);
                if (idx !== -1) state.backgrounds[idx].isActive = action.payload.data.isActive;
            }
        });
        builder.addCase(deleteBackground.fulfilled, (state, action: any) => {
            if (action.payload.status) {
                state.backgrounds = state.backgrounds.filter(e => e._id !== action.meta.arg);
                state.total -= 1;
                Success("Background Deleted Successfully");
            }
        });
    },
});

export default backgroundSlice.reducer;
