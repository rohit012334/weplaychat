import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import Button from "@/extra/Button";
import { createEntryTag, updateEntryTag } from "@/store/entryTagSlice";
import { baseURL, getStorageUrl } from "@/utils/config";
import { DangerRight } from "@/api/toastServices";
import SvgaPlayer from "@/extra/SvgaPlayer";

type FileType = "mp4" | "svga";

const getFileType = (file: File): FileType | null => {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext === "mp4") return "mp4";
    if (ext === "svga") return "svga";
    return null;
};

const normalizeType = (value: any): FileType | "" => {
    const type = String(value ?? "").toLowerCase().trim();
    if (type === "svga" || type === "3") return "svga";
    if (type === "mp4" || type === "4") return "mp4";
    return "";
};

const MAX_MP4_DURATION = 30;

const getMp4Duration = (file: File): Promise<number> =>
    new Promise((resolve) => {
        const video = document.createElement("video");
        video.preload = "metadata";
        video.onloadedmetadata = () => { URL.revokeObjectURL(video.src); resolve(video.duration); };
        video.onerror = () => resolve(0);
        video.src = URL.createObjectURL(file);
    });

const EntryTagDialog = () => {
    const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
    const { isLoading } = useSelector((state: RootStore) => state.entryTag);
    const dispatch = useAppDispatch();

    const [mongoId, setMongoId] = useState<string>("");
    const [file, setFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>("");
    const [fileType, setFileType] = useState<FileType | "">("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (dialogueData) {
            setMongoId(dialogueData._id || "");
            setFileType(normalizeType(dialogueData.type));
            if (dialogueData.file) {
                setFilePreview(getStorageUrl(dialogueData.file));
            }
        }
    }, [dialogueData]);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;
        const type = getFileType(selected);
        if (!type) { DangerRight("Only MP4 and SVGA files are allowed."); return; }
        if (type === "mp4") {
            const duration = await getMp4Duration(selected);
            if (duration > MAX_MP4_DURATION) {
                DangerRight(`MP4 must be ${MAX_MP4_DURATION}s or less.`);
                if (fileInputRef.current) fileInputRef.current.value = "";
                return;
            }
        }
        setFile(selected);
        setFileType(type);
        setFilePreview(URL.createObjectURL(selected));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!mongoId && !file) { DangerRight("Please select a file."); return; }
        const formData = new FormData();
        if (file) { formData.append("file", file); formData.append("type", fileType); }
        else if (fileType) { formData.append("type", fileType); }
        
        if (mongoId) { dispatch(updateEntryTag({ formData, entryTagId: mongoId })); }
        else { dispatch(createEntryTag(formData)); }
        dispatch(closeDialog());
    };

    return (
        <div className="dialog">
            <div className="w-100">
                <div className="row justify-content-center">
                    <div className="col-xl-4 col-md-6 col-11">
                        <div className="mainDiaogBox">
                            <div className="row justify-content-between align-items-center formHead">
                                <div className="col-8"><h4 className="text-theme m0">{mongoId ? "Edit Entry Effect" : "Add Entry Effect"}</h4></div>
                                <div className="col-4"><div className="closeButton" onClick={() => dispatch(closeDialog())} style={{ fontSize: "20px" }}>✖</div></div>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="row align-items-start formBody">
                                    <div className="col-12">
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: "14px", color: "#555" }}>
                                            Entry Effect File
                                            <span style={{ color: "#8F6DFF", fontSize: "12px", fontWeight: 400, marginLeft: "8px" }}>(MP4, SVGA)</span>
                                        </label>
                                        <div onClick={() => fileInputRef.current?.click()} style={{ border: "2px dashed #8F6DFF", borderRadius: "16px", padding: "20px", cursor: "pointer", textAlign: "center", background: "#faf8ff", minHeight: "280px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px", position: "relative", overflow: "hidden" }}>
                                            {filePreview ? (
                                                fileType === "mp4" ? (
                                                    <video src={filePreview} autoPlay loop muted style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "12px", objectFit: "contain" }} />
                                                ) : (
                                                    <div style={{ width: "100%", height: "250px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                        <SvgaPlayer url={filePreview} id="preview-svga" key={filePreview} />
                                                    </div>
                                                )
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#8F6DFF" viewBox="0 0 16 16"><path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" /><path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" /></svg>
                                                    <span style={{ color: "#8F6DFF", fontSize: "13px", fontWeight: 500 }}>Click to upload MP4 / SVGA</span>
                                                </>
                                            )}
                                        </div>
                                        <input ref={fileInputRef} type="file" accept=".mp4,.svga" style={{ display: "none" }} onChange={handleFileChange} />
                                        {filePreview && (
                                            <button type="button" onClick={() => { setFile(null); setFilePreview(""); setFileType(""); if (fileInputRef.current) fileInputRef.current.value = ""; }} style={{ marginTop: "6px", background: "none", border: "none", color: "#dc3545", fontSize: "12px", cursor: "pointer", padding: 0 }}>
                                                ✕ Remove file
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-4 d-flex justify-content-end gap-1">
                                        <Button className="text-light cancelButton" text="Cancel" type="button" onClick={() => dispatch(closeDialog())} />
                                        <Button type="submit" className="text-white m10-left submitButton" text={isLoading ? "Uploading..." : "Submit"} disabled={isLoading} />
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

export default EntryTagDialog;
