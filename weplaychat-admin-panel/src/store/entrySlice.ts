import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface EntryState {
    entries: any[];
    total: number;
    isLoading: boolean;
    isSkeleton: boolean;
}

const initialState: EntryState = {
    entries: [],
    total: 0,
    isLoading: false,
    isSkeleton: false,
};

// GET all entries (paginated)
export const getEntries: any = createAsyncThunk(
    "entry/getEntries",
    async (payload: { start: number; limit: number } | undefined) => {
        return apiInstanceFetch.get(
            `api/admin/entry/listEntries?start=${payload?.start}&limit=${payload?.limit}`
        );
    }
);

// CREATE entry
export const createEntry: any = createAsyncThunk(
    "entry/createEntry",
    async (payload: FormData) => {
        return apiInstanceFetch.post(`api/admin/entry/createEntry`, payload);
    }
);

// UPDATE entry
export const updateEntry: any = createAsyncThunk(
    "entry/updateEntry",
    async (payload: { formData: FormData; entryId: string }) => {
        return apiInstanceFetch.patch(
            `api/admin/entry/updateEntry?entryId=${payload.entryId}`,
            payload.formData
        );
    }
);

// TOGGLE isActive
export const updateEntryStatus: any = createAsyncThunk(
    "entry/updateEntryStatus",
    async (entryId: string) => {
        return apiInstanceFetch.patch(
            `api/admin/entry/updateEntryStatus?entryId=${entryId}`,
            {}
        );
    }
);

// DELETE entry
export const deleteEntry: any = createAsyncThunk(
    "entry/deleteEntry",
    async (entryId: string) => {
        return apiInstanceFetch.delete(
            `api/admin/entry/deleteEntry?entryId=${entryId}`
        );
    }
);

const entrySlice = createSlice({
    name: "entry",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // GET entries
        builder.addCase(getEntries.pending, (state) => {
            state.isSkeleton = true;
        });
        builder.addCase(getEntries.fulfilled, (state, action: PayloadAction<any>) => {
            state.isSkeleton = false;
            state.entries = action.payload.data;
            state.total = action.payload.total;
        });
        builder.addCase(getEntries.rejected, (state) => {
            state.isSkeleton = false;
        });

        // CREATE entry
        builder.addCase(createEntry.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(createEntry.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.entries.unshift(action.payload.data);
                state.total += 1;
                Success("Entry Created Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(createEntry.rejected, (state) => {
            state.isLoading = false;
        });

        // UPDATE entry
        builder.addCase(updateEntry.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateEntry.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                const idx = state.entries.findIndex(
                    (e) => e._id === action.payload.data?._id
                );
                if (idx !== -1) {
                    state.entries[idx] = { ...state.entries[idx], ...action.payload.data };
                }
                Success("Entry Updated Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(updateEntry.rejected, (state) => {
            state.isLoading = false;
        });

        // TOGGLE STATUS
        builder.addCase(updateEntryStatus.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateEntryStatus.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                const idx = state.entries.findIndex(
                    (e) => e._id === action.payload.data?._id
                );
                if (idx !== -1) {
                    state.entries[idx].isActive = action.payload.data.isActive;
                }
                action.payload.data.isActive
                    ? Success("Entry Activated")
                    : Success("Entry Deactivated");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(updateEntryStatus.rejected, (state) => {
            state.isLoading = false;
        });

        // DELETE entry
        builder.addCase(deleteEntry.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(deleteEntry.fulfilled, (state, action: any) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.entries = state.entries.filter(
                    (e) => e._id !== action.meta.arg
                );
                state.total -= 1;
                Success("Entry Deleted Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(deleteEntry.rejected, (state) => {
            state.isLoading = false;
        });
    },
});

export default entrySlice.reducer;
