import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface EntryTagState {
    entryTags: any[];
    total: number;
    isLoading: boolean;
    isSkeleton: boolean;
}

const initialState: EntryTagState = {
    entryTags: [],
    total: 0,
    isLoading: false,
    isSkeleton: false,
};

export const getEntryTags: any = createAsyncThunk(
    "entryTag/getEntryTags",
    async (payload: { start: number; limit: number } | undefined) => {
        return apiInstanceFetch.get(`api/admin/entryTag/list?start=${payload?.start}&limit=${payload?.limit}`);
    }
);

export const createEntryTag: any = createAsyncThunk(
    "entryTag/create",
    async (payload: FormData) => {
        return apiInstanceFetch.post(`api/admin/entryTag/create`, payload);
    }
);

export const updateEntryTag: any = createAsyncThunk(
    "entryTag/update",
    async (payload: { formData: FormData; entryTagId: string }) => {
        return apiInstanceFetch.patch(`api/admin/entryTag/update?entryTagId=${payload.entryTagId}`, payload.formData);
    }
);

export const updateEntryTagStatus: any = createAsyncThunk(
    "entryTag/updateStatus",
    async (entryTagId: string) => {
        return apiInstanceFetch.patch(`api/admin/entryTag/updateStatus?entryTagId=${entryTagId}`, {});
    }
);

export const deleteEntryTag: any = createAsyncThunk(
    "entryTag/delete",
    async (entryTagId: string) => {
        return apiInstanceFetch.delete(`api/admin/entryTag/delete?entryTagId=${entryTagId}`);
    }
);

const entryTagSlice = createSlice({
    name: "entryTag",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getEntryTags.pending, (state) => {
            state.isSkeleton = true;
        });
        builder.addCase(getEntryTags.fulfilled, (state, action: PayloadAction<any>) => {
            state.isSkeleton = false;
            state.entryTags = action.payload.data;
            state.total = action.payload.total;
        });
        builder.addCase(getEntryTags.rejected, (state) => {
            state.isSkeleton = false;
        });

        builder.addCase(createEntryTag.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(createEntryTag.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.entryTags.unshift(action.payload.data);
                state.total += 1;
                Success("Created Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(createEntryTag.rejected, (state) => {
            state.isLoading = false;
        });

        // UPDATE entry tag
        builder.addCase(updateEntryTag.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateEntryTag.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                const idx = state.entryTags.findIndex(e => e._id === action.payload.data?._id);
                if (idx !== -1) {
                    state.entryTags[idx] = { ...state.entryTags[idx], ...action.payload.data };
                }
                Success("Updated Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(updateEntryTag.rejected, (state) => {
            state.isLoading = false;
        });

        // TOGGLE status
        builder.addCase(updateEntryTagStatus.fulfilled, (state, action: PayloadAction<any>) => {
            if (action.payload.status) {
                const idx = state.entryTags.findIndex(e => e._id === action.payload.data?._id);
                if (idx !== -1) {
                    state.entryTags[idx].isActive = action.payload.data.isActive;
                }
            }
        });

        builder.addCase(deleteEntryTag.fulfilled, (state, action: any) => {
            if (action.payload.status) {
                state.entryTags = state.entryTags.filter(e => e._id !== action.meta.arg);
                state.total -= 1;
                Success("Deleted Successfully");
            }
        });
    },
});

export default entryTagSlice.reducer;
