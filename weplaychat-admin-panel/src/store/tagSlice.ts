import { DangerRight, Success } from "@/api/toastServices";
import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";

interface TagState {
    tags: any[];
    total: number;
    isLoading: boolean;
    isSkeleton: boolean;
}

const initialState: TagState = {
    tags: [],
    total: 0,
    isLoading: false,
    isSkeleton: false,
};

// GET all tags (paginated)
export const getTags: any = createAsyncThunk(
    "tag/getTags",
    async (payload: { start: number; limit: number } | undefined) => {
        return apiInstanceFetch.get(
            `api/admin/tag/listTags?start=${payload?.start}&limit=${payload?.limit}`
        );
    }
);

// CREATE tag
export const createTag: any = createAsyncThunk(
    "tag/createTag",
    async (payload: FormData) => {
        return apiInstanceFetch.post(`api/admin/tag/createTag`, payload);
    }
);

// UPDATE tag
export const updateTag: any = createAsyncThunk(
    "tag/updateTag",
    async (payload: { tagId: string; formData: FormData }) => {
        return apiInstanceFetch.patch(
            `api/admin/tag/updateTag?tagId=${payload.tagId}`,
            payload.formData
        );
    }
);

// TOGGLE isActive
export const updateTagStatus: any = createAsyncThunk(
    "tag/updateTagStatus",
    async (tagId: string) => {
        return apiInstanceFetch.patch(
            `api/admin/tag/updateTagStatus?tagId=${tagId}`,
            {}
        );
    }
);

// DELETE tag
export const deleteTag: any = createAsyncThunk(
    "tag/deleteTag",
    async (tagId: string) => {
        return apiInstanceFetch.delete(
            `api/admin/tag/deleteTag?tagId=${tagId}`
        );
    }
);

const tagSlice = createSlice({
    name: "tag",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // GET tags
        builder.addCase(getTags.pending, (state) => {
            state.isSkeleton = true;
        });
        builder.addCase(getTags.fulfilled, (state, action: PayloadAction<any>) => {
            state.isSkeleton = false;
            state.tags = action.payload.data;
            state.total = action.payload.total;
        });
        builder.addCase(getTags.rejected, (state) => {
            state.isSkeleton = false;
        });

        // CREATE tag
        builder.addCase(createTag.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(createTag.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.tags.unshift(action.payload.data);
                state.total += 1;
                Success("Tag Created Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(createTag.rejected, (state) => {
            state.isLoading = false;
        });

        // UPDATE tag
        builder.addCase(updateTag.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateTag.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                const idx = state.tags.findIndex(
                    (t) => t._id === action.payload.data?._id
                );
                if (idx !== -1) {
                    state.tags[idx] = { ...state.tags[idx], ...action.payload.data };
                }
                Success("Tag Updated Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(updateTag.rejected, (state) => {
            state.isLoading = false;
        });

        // TOGGLE STATUS
        builder.addCase(updateTagStatus.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(updateTagStatus.fulfilled, (state, action: PayloadAction<any>) => {
            state.isLoading = false;
            if (action.payload.status) {
                const idx = state.tags.findIndex(
                    (t) => t._id === action.payload.data?._id
                );
                if (idx !== -1) {
                    state.tags[idx].isActive = action.payload.data.isActive;
                }
                action.payload.data.isActive
                    ? Success("Tag Activated")
                    : Success("Tag Deactivated");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(updateTagStatus.rejected, (state) => {
            state.isLoading = false;
        });

        // DELETE tag
        builder.addCase(deleteTag.pending, (state) => {
            state.isLoading = true;
        });
        builder.addCase(deleteTag.fulfilled, (state, action: any) => {
            state.isLoading = false;
            if (action.payload.status) {
                state.tags = state.tags.filter(
                    (t) => t._id !== action.meta.arg
                );
                state.total -= 1;
                Success("Tag Deleted Successfully");
            } else {
                DangerRight(action.payload.message);
            }
        });
        builder.addCase(deleteTag.rejected, (state) => {
            state.isLoading = false;
        });
    },
});

export default tagSlice.reducer;
