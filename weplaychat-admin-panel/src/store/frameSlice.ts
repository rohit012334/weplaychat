import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface FrameState {
    frames: any[];
    total: number;
    isLoading: boolean;
    isSkeleton: boolean;
}

const initialState: FrameState = {
    frames: [],
    total: 0,
    isLoading: false,
    isSkeleton: false,
};

// GET all frames (paginated)
export const getFrames: any = createAsyncThunk(
    "frame/getFrames",
    async (payload: { start: number; limit: number } | undefined) => {
        return apiInstanceFetch.get(
            `api/admin/frame/listFrames?start=${payload?.start}&limit=${payload?.limit}`
        );
    }
);

// CREATE frame
export const createFrame: any = createAsyncThunk(
    "frame/createFrame",
    async (payload: FormData) => {
        return apiInstanceFetch.post(`api/admin/frame/createFrame`, payload);
    }
);

// UPDATE frame
export const updateFrame: any = createAsyncThunk(
    "frame/updateFrame",
    async (payload: { formData: FormData; frameId: string }) => {
        return apiInstanceFetch.patch(
            `api/admin/frame/updateFrame?frameId=${payload.frameId}`,
            payload.formData
        );
    }
);

// TOGGLE isActive
export const updateFrameStatus: any = createAsyncThunk(
    "frame/updateFrameStatus",
    async (frameId: string) => {
        return apiInstanceFetch.patch(
            `api/admin/frame/updateFrameStatus?frameId=${frameId}`,
            {}
        );
    }
);

// DELETE frame
export const deleteFrame: any = createAsyncThunk(
    "frame/deleteFrame",
    async (frameId: string) => {
        return apiInstanceFetch.delete(
            `api/admin/frame/deleteFrame?frameId=${frameId}`
        );
    }
);

const frameSlice = createSlice({
    name: "frame",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // GET frames
        builder.addCase(getFrames.pending, (state) => {
            state.isSkeleton = true;
        });
        builder.addCase(getFrames.fulfilled, (state, action: PayloadAction<any>) => {
            state.isSkeleton = false;
            state.frames = action.payload.data;
            state.total = action.payload.total;
        });
        builder.addCase(getFrames.rejected, (state) => {
            state.isSkeleton = false;
        });

        // CREATE frame
        builder.addCase(createFrame.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(createFrame.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.frames.unshift(action.payload.data);
                state.total += 1;
                Success("Frame Created Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(createFrame.rejected, (state) => {
            state.isLoading = false;
        });

        // UPDATE frame
        builder.addCase(updateFrame.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateFrame.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                const idx = state.frames.findIndex(
                    (f) => f._id === action.payload.data?._id
                );
                if (idx !== -1) {
                    state.frames[idx] = { ...state.frames[idx], ...action.payload.data };
                }
                Success("Frame Updated Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(updateFrame.rejected, (state) => {
            state.isLoading = false;
        });

        // TOGGLE STATUS
        builder.addCase(updateFrameStatus.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateFrameStatus.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                const idx = state.frames.findIndex(
                    (f) => f._id === action.payload.data?._id
                );
                if (idx !== -1) {
                    state.frames[idx].isActive = action.payload.data.isActive;
                }
                action.payload.data.isActive
                    ? Success("Frame Activated")
                    : Success("Frame Deactivated");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(updateFrameStatus.rejected, (state) => {
            state.isLoading = false;
        });

        // DELETE frame
        builder.addCase(deleteFrame.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(deleteFrame.fulfilled, (state, action: any) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.frames = state.frames.filter(
                    (f) => f._id !== action.meta.arg
                );
                state.total -= 1;
                Success("Frame Deleted Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(deleteFrame.rejected, (state) => {
            state.isLoading = false;
        });
    },
});

export default frameSlice.reducer;
