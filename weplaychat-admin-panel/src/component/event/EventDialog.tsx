import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { ExInput } from "@/extra/Input";
import Button from "@/extra/Button";
import { createEvent, updateEvent } from "@/store/eventSlice";
import { baseURL } from "@/utils/config";

const EventDialog = () => {
    const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
    const dispatch = useAppDispatch();

    const [mongoId, setMongoId] = useState<string>("");
    const [link, setLink] = useState<string>("");
    const [image, setImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (dialogueData) {
            setMongoId(dialogueData._id || "");
            setLink(dialogueData.link || "");
            if (dialogueData.image) {
                const norm = String(dialogueData.image).replace(/\\/g, "/");
                setImagePreview(norm.startsWith("http") ? norm : `${baseURL}${norm.startsWith("/") ? norm.slice(1) : norm}`);
            }
        }
    }, [dialogueData]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("link", link);
        if (image) formData.append("image", image);

        if (mongoId) {
            formData.append("eventId", mongoId);
            dispatch(updateEvent(formData));
        } else {
            dispatch(createEvent(formData));
        }
        dispatch(closeDialog());
    };

    return (
        <div className="dialog">
            <div className="w-100">
                <div className="row justify-content-center">
                    <div className="col-xl-4 col-md-6 col-11">
                        <div className="mainDiaogBox">
                            <div className="row justify-content-between align-items-center formHead">
                                <div className="col-8">
                                    <h4 className="text-theme m0">{mongoId ? "Edit Event" : "Add Event"}</h4>
                                </div>
                                <div className="col-4">
                                    <div className="closeButton" onClick={() => dispatch(closeDialog())} style={{ fontSize: "20px" }}>✖</div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row align-items-start formBody">
                                    <div className="col-12">
                                        <ExInput label="Event Link" value={link} onChange={(e: any) => setLink(e.target.value)} placeholder="Enter redirect link (https://...)" />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: "14px", color: "#555" }}>Event Image</label>
                                        <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed #8F6DFF", borderRadius: "12px", padding: "12px", cursor: "pointer", textAlign: "center", background: "#faf8ff", minHeight: "100px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px" }}>
                                            {imagePreview ? <img src={imagePreview} alt="Preview" style={{ maxWidth: "100%", maxHeight: "150px", borderRadius: "8px", objectFit: "cover" }} /> : <span style={{ color: "#8F6DFF" }}>Click to upload image</span>}
                                        </div>
                                        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageChange} />
                                    </div>

                                    <div className="mt-4 d-flex justify-content-end gap-1">
                                        <Button className="cancelButton" text="Cancel" type="button" onClick={() => dispatch(closeDialog())} />
                                        <Button type="submit" className="submitButton text-white" text="Submit" />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EventDialog;
