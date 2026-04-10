import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { ExInput } from "@/extra/Input";
import Button from "@/extra/Button";
import { createTag, updateTag } from "@/store/tagSlice";
import { DangerRight } from "@/api/toastServices";
import { getStorageUrl } from "@/utils/config";
import SvgaPlayer from "@/extra/SvgaPlayer";

const TagDialog = () => {
    const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
    const dispatch = useAppDispatch();

    const [mongoId, setMongoId] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [tagFile, setTagFile] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string>("");
    const [existingFilePreview, setExistingFilePreview] = useState<string>("");
    const [fileType, setFileType] = useState<string>("");
    const [existingFileType, setExistingFileType] = useState<string>("");
    const [price, setPrice] = useState<number>(0);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const inferTagTypeFromFile = (file: File): string => {
        const ext = file.name.split(".").pop()?.toLowerCase();
        if (!ext) return "";
        if (ext === "svga") return "svga";
        if (ext === "png") return "png";
        if (ext === "jpg" || ext === "jpeg") return "jpg";
        return "";
    };

    const inferTagTypeFromPath = (filePath?: string): string => {
        const ext = (filePath || "").split(".").pop()?.toLowerCase();
        if (!ext) return "";
        if (ext === "svga") return "svga";
        if (ext === "png") return "png";
        if (ext === "jpg" || ext === "jpeg") return "jpg";
        return "";
    };

    useEffect(() => {
        if (dialogueData) {
            setMongoId(dialogueData._id || "");
            setName(dialogueData.name || "");

            const existingUrl = getStorageUrl(dialogueData.file);
            setExistingFilePreview(existingUrl);
            setFilePreview(existingUrl);

            const typeFromDb = String(dialogueData.type ?? "").toLowerCase().trim();
            const inferredType = inferTagTypeFromPath(dialogueData.file);
            const existingType = typeFromDb || inferredType;
            setExistingFileType(existingType);
            setFileType(existingType);
            setPrice(dialogueData.price || 0);
        }
    }, [dialogueData]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (!selected) return;

        const type = inferTagTypeFromFile(selected);
        if (!type) {
            DangerRight("Only SVGA, PNG, JPG/JPEG files are allowed.");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setTagFile(selected);
        setFileType(type);
        setFilePreview(URL.createObjectURL(selected));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            DangerRight("Tag name is required.");
            return;
        }

        // Create mode: file required as per requirement.
        if (!mongoId && !tagFile) {
            DangerRight("Please upload tag file (SVGA, PNG, JPG/JPEG).");
            return;
        }

        const formData = new FormData();
        formData.append("name", name.trim());
        formData.append("price", price.toString());

        // Update mode: file will replace only if user selected a new one.
        if (tagFile) {
            formData.append("file", tagFile);
            formData.append("type", fileType);
        }

        if (mongoId) {
            dispatch(updateTag({ tagId: mongoId, formData }));
        } else {
            dispatch(createTag(formData));
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
                                    <h4 className="text-theme m0">
                                        {mongoId ? "Edit Tag" : "Add Tag"}
                                    </h4>
                                </div>
                                <div className="col-4">
                                    <div
                                        className="closeButton"
                                        onClick={() => dispatch(closeDialog())}
                                        style={{ fontSize: "20px" }}
                                    >
                                        ✖
                                    </div>
                                </div>
                            </div>

                            <form onSubmit={handleSubmit}>
                                <div className="row align-items-start formBody">
                                    <div className="col-12">
                                        <ExInput
                                            type="text"
                                            id="tagName"
                                            name="name"
                                            value={name}
                                            label="Tag Name"
                                            placeholder="Enter tag name"
                                            onChange={(e: any) => setName(e.target.value)}
                                        />
                                    </div>
                                    <div className="col-12 mt-3">
                                        <ExInput
                                            type="number"
                                            id="tagPrice"
                                            name="price"
                                            value={price}
                                            label="Price"
                                            placeholder="Enter Price"
                                            onChange={(e: any) => setPrice(Number(e.target.value))}
                                        />
                                    </div>

                                    <div className="col-12 mt-4">
                                        <label className="form-label" style={{ fontWeight: 600, fontSize: "14px", color: "#555" }}>
                                            Tag File
                                            <span style={{ color: "#8F6DFF", fontSize: "12px", fontWeight: 400, marginLeft: "8px" }}>
                                                (SVGA, PNG, JPG/JPEG)
                                            </span>
                                        </label>
                                        <div
                                            onClick={() => fileInputRef.current?.click()}
                                            style={{
                                                border: "2px dashed #8F6DFF",
                                                borderRadius: "16px",
                                                padding: "20px",
                                                cursor: "pointer",
                                                textAlign: "center",
                                                background: "#faf8ff",
                                                minHeight: "280px",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexDirection: "column",
                                                gap: "8px",
                                                position: "relative",
                                                overflow: "hidden",
                                            }}
                                        >
                                            {filePreview ? (
                                                fileType === "svga" ? (
                                                    <div style={{ width: "100%", height: "250px", display: "flex", justifyContent: "center", alignItems: "center" }}>
                                                        <SvgaPlayer url={filePreview} id="preview-svga" key={filePreview} />
                                                    </div>
                                                ) : (
                                                    <img
                                                        src={filePreview}
                                                        alt="Tag file preview"
                                                        style={{ maxWidth: "100%", maxHeight: "250px", borderRadius: "12px", objectFit: "contain" }}
                                                    />
                                                )
                                            ) : (
                                                <>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#8F6DFF" viewBox="0 0 16 16">
                                                        <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5" />
                                                        <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708z" />
                                                    </svg>
                                                    <span style={{ color: "#8F6DFF", fontSize: "13px", fontWeight: 500 }}>
                                                        Click to upload SVGA / PNG / JPG
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept=".svga,.png,.jpg,.jpeg"
                                            style={{ display: "none" }}
                                            onChange={handleFileChange}
                                        />

                                        {tagFile && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setTagFile(null);
                                                    setFileType(existingFileType);
                                                    setFilePreview(existingFilePreview);
                                                    if (fileInputRef.current) fileInputRef.current.value = "";
                                                }}
                                                style={{ marginTop: "8px", background: "none", border: "none", color: "#dc3545", fontSize: "12px", cursor: "pointer", padding: 0 }}
                                            >
                                                ✕ Remove selected file
                                            </button>
                                        )}
                                    </div>

                                    <div className="mt-4 d-flex justify-content-end gap-1">
                                        <Button
                                            className="text-light cancelButton"
                                            text="Cancel"
                                            type="button"
                                            onClick={() => dispatch(closeDialog())}
                                        />
                                        <Button
                                            type="submit"
                                            className="text-white m10-left submitButton"
                                            text="Submit"
                                        />
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

export default TagDialog;
