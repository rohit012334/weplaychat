import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootStore, useAppDispatch } from "@/store/store";
import { closeDialog } from "@/store/dialogSlice";
import { ExInput } from "@/extra/Input";
import Button from "@/extra/Button";
import { createTag, updateTag } from "@/store/tagSlice";
import { DangerRight } from "@/api/toastServices";

const TagDialog = () => {
    const { dialogueData } = useSelector((state: RootStore) => state.dialogue);
    const dispatch = useAppDispatch();

    const [mongoId, setMongoId] = useState<string>("");
    const [name, setName] = useState<string>("");

    useEffect(() => {
        if (dialogueData) {
            setMongoId(dialogueData._id || "");
            setName(dialogueData.name || "");
        }
    }, [dialogueData]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (!name.trim()) {
            DangerRight("Tag name is required.");
            return;
        }

        if (mongoId) {
            dispatch(updateTag({ tagId: mongoId, name: name.trim() }));
        } else {
            dispatch(createTag({ name: name.trim() }));
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
