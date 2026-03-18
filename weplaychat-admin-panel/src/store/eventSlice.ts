import { apiInstanceFetch } from "@/utils/ApiInstance";
import { PayloadAction, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { DangerRight, Success } from "@/api/toastServices";

interface EventState {
    events: any[];
    total: number;
    isLoading: boolean;
    isSkeleton: boolean;
}

const initialState: EventState = {
    events: [],
    total: 0,
    isLoading: false,
    isSkeleton: false,
};

export const getEvents: any = createAsyncThunk(
    "event/getEvents",
    async (payload: { start: number; limit: number } | undefined) => {
        const start = payload?.start ?? 1;
        const limit = payload?.limit ?? 10;
        const res: any = await apiInstanceFetch.get(`api/admin/event/listEvents?start=${start}&limit=${limit}`);
        if (!res?.status) throw new Error(res?.message || "Failed to fetch events.");
        return { data: res?.data || [], total: res?.total || 0 };
    }
);

export const createEvent: any = createAsyncThunk(
    "event/createEvent",
    async (payload: FormData) => {
        const res: any = await apiInstanceFetch.post("api/admin/event/createEvent", payload);
        return res;
    }
);

export const updateEvent: any = createAsyncThunk(
    "event/updateEvent",
    async (payload: FormData) => {
        const eventId = payload.get("eventId") as string | null;
        if (!eventId) throw new Error("eventId is required.");
        payload.delete("eventId");
        const res: any = await apiInstanceFetch.patch(`api/admin/event/updateEvent?eventId=${eventId}`, payload);
        return res;
    }
);

export const deleteEvent: any = createAsyncThunk(
    "event/deleteEvent",
    async (id: string) => {
        const res: any = await apiInstanceFetch.delete(`api/admin/event/deleteEvent?eventId=${id}`);
        return res;
    }
);

const eventSlice = createSlice({
    name: "event",
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder.addCase(getEvents.pending, (state) => { state.isSkeleton = true; });
        builder.addCase(getEvents.fulfilled, (state, action: any) => {
            state.isSkeleton = false;
            state.events = action.payload.data;
            state.total = action.payload.total;
        });
        builder.addCase(getEvents.rejected, (state) => { state.isSkeleton = false; });

        builder.addCase(createEvent.fulfilled, (state, action: any) => {
            if (action?.payload?.status) Success(action.payload.message || "Event created.");
            else DangerRight(action?.payload?.message || "Failed to create event.");
        });
        builder.addCase(updateEvent.fulfilled, (state, action: any) => {
            if (action?.payload?.status) Success(action.payload.message || "Event updated.");
            else DangerRight(action?.payload?.message || "Failed to update event.");
        });
        builder.addCase(deleteEvent.fulfilled, (state, action: any) => {
            if (action?.payload?.status) Success(action.payload.message || "Event deleted.");
            else DangerRight(action?.payload?.message || "Failed to delete event.");
        });
    },
});

export default eventSlice.reducer;
