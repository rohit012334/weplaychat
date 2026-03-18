import { ExInput, Textarea } from "@/extra/Input";
import { closeDialog } from "@/store/dialogSlice";
import { RootStore, useAppDispatch } from "@/store/store";
import React, { useEffect, useState } from "react";
import ReactSelect from "react-select";
import { useSelector } from "react-redux";
import { genderData } from "@/utils/extra";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import ReactDropzone, { FileWithPath } from "react-dropzone";
import moment from "moment";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { IconButton } from "@mui/material";
import { baseURL } from "@/utils/config";
import { createHost, getImpression, updateHost } from "@/store/hostSlice";
import Select from "react-select";
import countriesData from "@/api/countries.json";

/* ── Design tokens ── */
const T = {
  accent: "#6366f1",
  accent2: "#a855f7",
  aSoft: "rgba(99,102,241,0.09)",
  aMid: "rgba(99,102,241,0.16)",
  aGlow: "rgba(99,102,241,0.20)",
  green: "#10b981",
  rose: "#f43f5e",
  rSoft: "rgba(244,63,94,0.09)",
  border: "#e8eaf2",
  txt: "#64748b",
  txtDark: "#1e2235",
  txtDim: "#a0a8c0",
  white: "#ffffff",
  bg: "#f4f5fb",
};

/* ── Shared styles ── */
const S: Record<string, React.CSSProperties> = {
  overlay: {
    position: "fixed", inset: 0, zIndex: 1050,
    background: "rgba(15,17,35,0.55)",
    backdropFilter: "blur(4px)",
    display: "flex", alignItems: "center", justifyContent: "center",
    padding: "20px",
  },
  modal: {
    background: T.white,
    borderRadius: "20px",
    width: "100%", maxWidth: "760px",
    maxHeight: "90vh", overflowY: "auto",
    boxShadow: "0 24px 80px rgba(99,102,241,0.18)",
    fontFamily: "'Outfit', sans-serif",
  },
  modalHeader: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "20px 28px",
    borderBottom: `1px solid ${T.border}`,
    background: "linear-gradient(135deg, rgba(99,102,241,0.05), rgba(168,85,247,0.02))",
    position: "sticky" as const, top: 0, zIndex: 10,
    borderRadius: "20px 20px 0 0",
  },
  modalHeaderLeft: { display: "flex", alignItems: "center", gap: "12px" },
  headerPill: {
    width: "4px", height: "26px", borderRadius: "4px", flexShrink: 0,
    background: `linear-gradient(180deg, ${T.accent}, ${T.accent2})`,
  },
  modalTitle: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: "20px", fontWeight: 700, color: T.txtDark, margin: 0,
  },
  modalSubtitle: { fontSize: "12px", color: T.txtDim, margin: 0 },
  closeBtn: {
    width: "34px", height: "34px", borderRadius: "9px",
    display: "flex", alignItems: "center", justifyContent: "center",
    border: `1.5px solid ${T.border}`, background: T.bg,
    cursor: "pointer", fontSize: "16px", color: T.txtDim,
    transition: "all .14s",
  },
  modalBody: { padding: "24px 28px" },

  /* grid */
  grid2: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px",
  },
  grid1: {
    display: "grid", gridTemplateColumns: "1fr", gap: "16px",
  },

  /* section label */
  sectionLabel: {
    fontFamily: "'Rajdhani', sans-serif",
    fontSize: "13px", fontWeight: 700,
    color: T.accent, textTransform: "uppercase" as const,
    letterSpacing: "0.06em", marginBottom: "14px", marginTop: "6px",
    display: "flex", alignItems: "center", gap: "8px",
  },
  sectionDivider: {
    height: "1px", background: T.border, margin: "20px 0",
  },

  /* field label */
  label: {
    display: "block", fontSize: "12.5px", fontWeight: 600,
    color: T.txt, marginBottom: "6px",
  },
  fieldWrap: { display: "flex", flexDirection: "column" as const },

  /* dropzone */
  dropzone: {
    height: "110px", width: "110px", borderRadius: "12px",
    border: `2px dashed ${T.aMid}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    cursor: "pointer", background: T.aSoft,
    transition: "border-color .14s, background .14s",
    flexShrink: 0,
  },
  mediaGrid: {
    display: "flex", flexWrap: "wrap" as const, gap: "10px",
    marginTop: "12px",
  },
  mediaItem: {
    position: "relative" as const, borderRadius: "10px", overflow: "hidden",
    border: `1.5px solid ${T.border}`,
  },
  mediaRemoveBtn: {
    position: "absolute" as const, top: "4px", right: "4px",
    background: T.rose, color: "#fff",
    width: "22px", height: "22px",
    borderRadius: "50%",
  },

  /* profile image preview */
  profilePreview: {
    width: "90px", height: "90px", borderRadius: "12px",
    objectFit: "cover" as const,
    border: `2px solid ${T.border}`,
    marginTop: "8px", display: "block",
  },

  /* error */
  errorMsg: { fontSize: "11.5px", color: T.rose, marginTop: "4px" },

  /* footer */
  modalFooter: {
    display: "flex", justifyContent: "flex-end", gap: "10px",
    padding: "16px 28px",
    borderTop: `1px solid ${T.border}`,
    background: "linear-gradient(135deg, rgba(99,102,241,0.03), rgba(168,85,247,0.01))",
    borderRadius: "0 0 20px 20px",
    position: "sticky" as const, bottom: 0,
  },
  cancelBtn: {
    padding: "10px 22px", borderRadius: "10px",
    border: `1.5px solid ${T.border}`, background: T.bg,
    fontFamily: "'Outfit', sans-serif", fontSize: "13.5px", fontWeight: 600,
    color: T.txt, cursor: "pointer",
    transition: "all .14s",
  },
  submitBtn: {
    padding: "10px 28px", borderRadius: "10px", border: "none",
    background: `linear-gradient(135deg, ${T.accent}, ${T.accent2})`,
    color: "#fff",
    fontFamily: "'Outfit', sans-serif", fontSize: "13.5px", fontWeight: 600,
    cursor: "pointer", boxShadow: `0 4px 14px ${T.aGlow}`,
    transition: "opacity .14s, transform .12s",
  },
};

interface ErrorState {
  name: string; email: string; Dob: string; language: string;
  impression: string; country: string; countryFlagImage: string;
  image: string; bio: string; gender: string; images: string;
  video: string; videocall: string; videolive: string; profilevideo: string;
  privateCallRate: string; randomCallFemaleRate: string;
  randomCallMaleRate: string; randomCallRate: string;
}

interface FileOperations {
  add: { images: File[]; videocall: File[]; videolive: File[]; profilevideo: File[] };
  remove: { images: number[]; videocall: number[]; videolive: number[]; profilevideo: number[] };
}

const HostDialog = () => {
  const dispatch = useAppDispatch();
  const { impressionList, isLoading } = useSelector((state: RootStore) => state.host);
  const { dialogue, dialogueData } = useSelector((state: RootStore) => state.dialogue);

  const [startDate, setStartDate] = useState(moment().format("DD/MM/YYYY"));
  const [countryOptions, setCountryOptions] = useState<any[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [loadingCountries, setLoadingCountries] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [language, setLanguage] = useState("");
  const [imagePath, setImagePath] = useState<string>();
  const [impression, setImpression] = useState<string[]>([]);
  const [image, setImage] = useState<any>();
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");

  const [privateCallRate, setPrivateCallRate] = useState(0);
  const [randomCallFemaleRate, setRandomCallFemaleRate] = useState(0);
  const [randomCallMaleRate, setRandomCallMaleRate] = useState(0);
  const [randomCallRate, setRandomCallRate] = useState(0);

  const [images, setImages] = useState<any[]>([]);
  const [videocall, setVideocall] = useState<any[]>([]);
  const [videolive, setVideolive] = useState<any[]>([]);
  const [profilevideo, setProfilevideo] = useState<any[]>([]);

  const [fileOperations, setFileOperations] = useState<FileOperations>({
    add: { images: [], videocall: [], videolive: [], profilevideo: [] },
    remove: { images: [], videocall: [], videolive: [], profilevideo: [] },
  });
  const [originalFiles, setOriginalFiles] = useState({
    images: [], videocall: [], videolive: [], profilevideo: []
  });
  const [originalData, setOriginalData] = useState<any>({});

  const [error, setError] = useState<ErrorState>({
    name: "", email: "", Dob: "", language: "", impression: "",
    country: "", countryFlagImage: "", image: "", bio: "", gender: "",
    images: "", video: "", videocall: "", videolive: "", profilevideo: "",
    privateCallRate: "", randomCallFemaleRate: "", randomCallMaleRate: "", randomCallRate: "",
  });

  /* ── Effects ── */
  useEffect(() => {
    if (dialogueData?.dob) {
      const p = moment(dialogueData.dob, "DD/MM/YYYY", true);
      setStartDate(p.isValid() ? p.format("DD/MM/YYYY") : "");
    }
  }, [dialogueData]);

  useEffect(() => {
    if (dialogueData) {
      setOriginalFiles({
        images: dialogueData?.photoGallery || [],
        videocall: dialogueData?.video || [],
        videolive: dialogueData?.liveVideo || [],
        profilevideo: dialogueData?.profileVideo || [],
      });
      setOriginalData({
        name: dialogueData.name || "", email: dialogueData.email || "",
        dob: dialogueData.dob || "", language: dialogueData.language || "",
        impression: dialogueData.impression || [], bio: dialogueData.bio || "",
        gender: dialogueData.gender || "", country: dialogueData.country || "",
        countryFlagImage: dialogueData.countryFlagImage || "",
        privateCallRate: dialogueData.privateCallRate || 0,
        randomCallFemaleRate: dialogueData.randomCallFemaleRate || 0,
        randomCallMaleRate: dialogueData.randomCallMaleRate || 0,
        randomCallRate: dialogueData.randomCallRate || 0,
        image: dialogueData.image || "",
      });
      setFileOperations({
        add: { images: [], videocall: [], videolive: [], profilevideo: [] },
        remove: { images: [], videocall: [], videolive: [], profilevideo: [] },
      });
      setPrivateCallRate(dialogueData?.privateCallRate);
      setRandomCallFemaleRate(dialogueData?.randomCallFemaleRate);
      setRandomCallMaleRate(dialogueData?.randomCallMaleRate);
      setRandomCallRate(dialogueData?.randomCallRate);
      setEmail(dialogueData?.email);
      setGender(dialogueData?.gender);
      setBio(dialogueData?.bio);
      setImagePath(baseURL + dialogueData?.image);
      setImages(dialogueData?.photoGallery?.map((i: any) => i) || []);
      setVideocall(dialogueData?.video?.map((i: any) => i) || []);
      setVideolive(dialogueData?.liveVideo?.map((i: any) => i) || []);
      setProfilevideo(dialogueData?.profileVideo?.map((i: any) => i) || []);
      setLanguage(dialogueData?.language);

      let arr: string[] = [];
      if (Array.isArray(dialogueData?.impression)) {
        arr = dialogueData.impression.flatMap((i: string) => i.split(",").map((n: string) => n.trim()));
      } else if (typeof dialogueData?.impression === "string") {
        arr = dialogueData.impression.split(",").map((n: string) => n.trim());
      }
      const matched = impressionList?.map((i: any) => i?.name?.trim()).filter((n: string) => arr.includes(n));
      setImpression(matched || []);
    }
  }, [dialogueData, impressionList]);

  useEffect(() => { setName(dialogueData?.name); }, [dialogueData]);

  useEffect(() => {
    setLoadingCountries(true);
    try {
      const opts = (countriesData as any[])
        .filter((c) => c.name?.common && c.cca2 && c.flags?.png)
        .map((c) => ({
          value: c.cca2, label: c.name.common, name: c.name.common,
          code: c.cca2, flagUrl: c.flags.png || c.flags.svg,
          flag: c.flags.png || c.flags.svg,
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
      setCountryOptions(opts);
      if (dialogueData?.country) {
        setSelectedCountry(opts.find((c: any) => c.name.toLowerCase() === dialogueData.country.toLowerCase()) || null);
      } else {
        setSelectedCountry(opts.find((c: any) => c.name === "India") || opts[0] || null);
      }
    } catch (_) { }
    setLoadingCountries(false);
  }, [dialogueData]);

  useEffect(() => { dispatch(getImpression()); }, [dispatch]);

  /* ── Helpers ── */
  const findOriginalIndex = (file: any, orig: any[]) =>
    orig.findIndex((o) => (typeof o === "string" ? o : o.url) === (typeof file === "string" ? file : file.url));

  const handleInputImage = (e: any) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      setImagePath(URL.createObjectURL(e.target.files[0]));
      setError((p) => ({ ...p, image: "" }));
    }
  };

  const makeDropHandler = (
    type: "image" | "video",
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    addKey: keyof FileOperations["add"],
    errKey: keyof ErrorState
  ) => (files: FileWithPath[]) => {
    const valid = files.filter((f) => f.type.startsWith(type + "/"));
    if (valid.length !== files.length) { alert(`Only ${type} files allowed!`); return; }
    setter((p) => [...p, ...files]);
    setFileOperations((p) => ({ ...p, add: { ...p.add, [addKey]: [...p.add[addKey], ...files] } }));
    setError((p) => ({ ...p, [errKey]: "" }));
  };

  const makeRemover = (
    setter: React.Dispatch<React.SetStateAction<any[]>>,
    addKey: keyof FileOperations["add"],
    removeKey: keyof FileOperations["remove"],
    origArr: any[]
  ) => (file: any, idx: number) => {
    setter((p) => p.filter((_, i) => i !== idx));
    if (file instanceof File) {
      setFileOperations((p) => ({ ...p, add: { ...p.add, [addKey]: (p.add[addKey] as File[]).filter((f) => f !== file) } }));
    } else {
      const oi = findOriginalIndex(file, origArr);
      if (oi !== -1) setFileOperations((p) => ({ ...p, remove: { ...p.remove, [removeKey]: [...p.remove[removeKey], oi] } }));
    }
  };

  const removeImage = makeRemover(setImages, "images", "images", originalFiles.images);
  const removeVideo = makeRemover(setVideocall, "videocall", "videocall", originalFiles.videocall);
  const removeVideoLive = makeRemover(setVideolive, "videolive", "videolive", originalFiles.videolive);
  const removeProfile = makeRemover(setProfilevideo, "profilevideo", "profilevideo", originalFiles.profilevideo);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!name || !email || !startDate || !language || !impression?.length ||
      !gender || !bio || !imagePath || !images?.length ||
      !videocall?.length || !videolive?.length || !profilevideo?.length) {
      const err = {} as ErrorState;
      if (!name) err.name = "Name is required!";
      if (!email) err.email = "Email is required!";
      if (!startDate) err.Dob = "DOB is required!";
      if (!language) err.language = "Language is required!";
      if (!impression?.length) err.impression = "Impression is required!";
      if (!gender) err.gender = "Gender is required!";
      if (!bio) err.bio = "Bio is required!";
      if (!imagePath) err.image = "Image is required!";
      if (!images?.length) err.images = "Photo Gallery is required!";
      if (!videocall?.length) err.videocall = "Video is required!";
      if (!videolive?.length) err.videolive = "Live Video is required!";
      if (!profilevideo?.length) err.profilevideo = "Profile Video is required!";
      return setError({ ...error, ...err });
    }

    const fd: any = new FormData();
    const maybeAppend = (k: string, v: any, o: any) => {
      if (v !== o && v !== undefined && v !== null && v !== "") fd.append(k, v ?? "");
    };

    if (dialogueData) {
      fd.append("hostId", dialogueData._id);
      maybeAppend("name", name, originalData.name);
      maybeAppend("email", email, originalData.email);
      maybeAppend("dob", startDate, originalData.dob);
      maybeAppend("language", language, originalData.language);
      if (JSON.stringify(impression) !== JSON.stringify(originalData.impression))
        fd.append("impression", impression.join(","));
      maybeAppend("bio", bio, originalData.bio);
      maybeAppend("gender", gender, originalData.gender);
      if (selectedCountry?.name?.toLowerCase() !== originalData.country?.toLowerCase())
        fd.append("country", selectedCountry.name);
      if (selectedCountry?.flag !== originalData.countryFlagImage)
        fd.append("countryFlagImage", selectedCountry.flag);
      maybeAppend("privateCallRate", privateCallRate, originalData.privateCallRate);
      maybeAppend("randomCallFemaleRate", randomCallFemaleRate, originalData.randomCallFemaleRate);
      maybeAppend("randomCallMaleRate", randomCallMaleRate, originalData.randomCallMaleRate);
      maybeAppend("randomCallRate", randomCallRate, originalData.randomCallRate);
      if (image && imagePath !== baseURL + originalData.image) fd.append("image", image);
      fileOperations.add.images.forEach((f) => fd.append("photoGallery", f));
      fileOperations.add.videocall.forEach((f) => fd.append("video", f));
      fileOperations.add.videolive.forEach((f) => fd.append("liveVideo", f));
      fileOperations.add.profilevideo.forEach((f) => fd.append("profileVideo", f));
      if (fileOperations.remove.images.length) fd.append("removePhotoGalleryIndex", JSON.stringify(fileOperations.remove.images));
      if (fileOperations.remove.videocall.length) fd.append("removeVideoIndexes", JSON.stringify(fileOperations.remove.videocall));
      if (fileOperations.remove.videolive.length) fd.append("removeLiveVideoIndex", JSON.stringify(fileOperations.remove.videolive));
      if (fileOperations.remove.profilevideo.length) fd.append("removeProfileVideoIndex", JSON.stringify(fileOperations.remove.profilevideo));
      await dispatch(updateHost(fd));
    } else {
      fd.append("name", name);
      fd.append("email", email);
      const p = moment(startDate, "DD/MM/YYYY", true);
      if (p.isValid()) fd.append("dob", p.format("DD/MM/YYYY"));
      fd.append("language", language);
      fd.append("impression", impression.join(","));
      fd.append("image", image);
      fd.append("country", selectedCountry?.name);
      fd.append("countryFlagImage", selectedCountry?.flag);
      fd.append("bio", bio);
      fd.append("gender", gender);
      fd.append("privateCallRate", String(privateCallRate));
      fd.append("randomCallFemaleRate", String(randomCallFemaleRate));
      fd.append("randomCallMaleRate", String(randomCallMaleRate));
      fd.append("randomCallRate", String(randomCallRate));
      images.forEach((f) => f instanceof File && fd.append("photoGallery", f));
      videocall.forEach((f) => f instanceof File && fd.append("video", f));
      videolive.forEach((f) => f instanceof File && fd.append("liveVideo", f));
      profilevideo.forEach((f) => f instanceof File && fd.append("profileVideo", f));
      await dispatch(createHost(fd));
    }
    dispatch(closeDialog());
  };

  const impressionOptions = impressionList.map((i: any) => ({ label: i.name, value: i.name }));

  const selectStyles = {
    control: (b: any, s: any) => ({
      ...b,
      borderColor: s.isFocused ? T.accent : T.border,
      boxShadow: s.isFocused ? `0 0 0 2px ${T.aSoft}` : "none",
      borderRadius: "10px", fontSize: "13px",
      "&:hover": { borderColor: T.accent },
    }),
    menu: (b: any) => ({ ...b, borderRadius: "10px", border: `1px solid ${T.border}`, boxShadow: "0 8px 24px rgba(99,102,241,0.12)", zIndex: 9999 }),
    option: (b: any, s: any) => ({ ...b, backgroundColor: s.isFocused ? T.aSoft : "white", color: T.txtDark, cursor: "pointer", fontSize: "13px" }),
    multiValue: (b: any) => ({ ...b, backgroundColor: T.aSoft, borderRadius: "6px" }),
    multiValueLabel: (b: any) => ({ ...b, color: T.accent, fontWeight: 600 }),
    multiValueRemove: (b: any) => ({ ...b, color: T.accent, "&:hover": { background: T.aMid, color: T.accent } }),
    placeholder: (b: any) => ({ ...b, color: T.txtDim, fontSize: "13px" }),
  };

  /* ── Dropzone section renderer ── */
  const MediaSection = ({
    label, error: err, onDrop, accept, files, isVideo, onRemove
  }: {
    label: string; error: string;
    onDrop: (f: FileWithPath[]) => void;
    accept: Record<string, string[]>;
    files: any[]; isVideo: boolean;
    onRemove: (file: any, idx: number) => void;
  }) => (
    <div>
      <span style={S.label}>{label}</span>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", flexWrap: "wrap" }}>
        <ReactDropzone onDrop={onDrop} accept={accept}>
          {({ getRootProps, getInputProps }) => (
            <div {...getRootProps()} style={S.dropzone}>
              <input {...getInputProps()} />
              <AddIcon sx={{ fontSize: "32px", color: T.accent }} />
            </div>
          )}
        </ReactDropzone>
        <div style={S.mediaGrid}>
          {files?.map((file: any, idx: number) => {
            const isFile = file instanceof File;
            const src = isFile ? URL.createObjectURL(file)
              : file?.url ? baseURL + file.url : file ? baseURL + file : "";
            return (
              <div key={idx} style={S.mediaItem}>
                {isVideo ? (
                  <video src={src} style={{ width: "90px", height: "90px", objectFit: "cover", display: "block" }} />
                ) : (
                  <img src={src} alt="" style={{ width: "90px", height: "90px", objectFit: "cover", display: "block" }} />
                )}
                <IconButton onClick={() => onRemove(file, idx)} style={S.mediaRemoveBtn}>
                  <CloseIcon sx={{ fontSize: "14px" }} />
                </IconButton>
              </div>
            );
          })}
        </div>
      </div>
      {err && <p style={S.errorMsg}>{err}</p>}
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Outfit:wght@400;500;600;700&display=swap');
        .hd-input { width:100%; padding:9px 13px; border-radius:10px; border:1.5px solid #e8eaf2; font-family:'Outfit',sans-serif; font-size:13px; color:#1e2235; outline:none; transition:border-color .14s, box-shadow .14s; background:#fff; }
        .hd-input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.09); }
        .hd-select { width:100%; padding:9px 13px; border-radius:10px; border:1.5px solid #e8eaf2; font-family:'Outfit',sans-serif; font-size:13px; color:#1e2235; outline:none; background:#fff; cursor:pointer; }
        .hd-select:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.09); }
        .react-datepicker-wrapper { width:100%; }
        .react-datepicker__input-container input { width:100%; padding:9px 13px; border-radius:10px; border:1.5px solid #e8eaf2; font-family:'Outfit',sans-serif; font-size:13px; color:#1e2235; outline:none; }
        .react-datepicker__input-container input:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.09); }
        .hd-textarea { width:100%; padding:9px 13px; border-radius:10px; border:1.5px solid #e8eaf2; font-family:'Outfit',sans-serif; font-size:13px; color:#1e2235; outline:none; resize:vertical; min-height:80px; }
        .hd-textarea:focus { border-color:#6366f1; box-shadow:0 0 0 3px rgba(99,102,241,0.09); }
      `}</style>

      <div style={S.overlay}>
        <div style={S.modal}>

          {/* ── Header ── */}
          <div style={S.modalHeader}>
            <div style={S.modalHeaderLeft}>
              <div style={S.headerPill} />
              <div>
                <h2 style={S.modalTitle}>{dialogueData ? "Edit Host" : "Add Fake Host"}</h2>
                <p style={S.modalSubtitle}>{dialogueData ? "Update host information" : "Fill in the details to create a new host"}</p>
              </div>
            </div>
            <button style={S.closeBtn} onClick={() => dispatch(closeDialog())}>✕</button>
          </div>

          {/* ── Body ── */}
          <div style={S.modalBody}>

            {/* Section: Basic Info */}
            <div style={S.sectionLabel}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
              Basic Information
            </div>
            <div style={S.grid2}>
              <div style={S.fieldWrap}>
                <label style={S.label}>Name</label>
                <input className="hd-input" type="text" value={name} placeholder="Full name"
                  onChange={(e) => { setName(e.target.value); setError((p) => ({ ...p, name: e.target.value ? "" : "Name is required" })); }} />
                {error.name && <p style={S.errorMsg}>{error.name}</p>}
              </div>
              <div style={S.fieldWrap}>
                <label style={S.label}>Email</label>
                <input className="hd-input" type="email" value={email} placeholder="Email address"
                  onChange={(e) => { setEmail(e.target.value); setError((p) => ({ ...p, email: !e.target.value ? "Email is required" : !e.target.value.includes("@") ? "Must include @" : "" })); }} />
                {error.email && <p style={S.errorMsg}>{error.email}</p>}
              </div>
              <div style={S.fieldWrap}>
                <label style={S.label}>Date of Birth</label>
                <DatePicker
                  selected={startDate ? moment(startDate, "DD/MM/YYYY").toDate() : null}
                  onChange={(d: Date) => setStartDate(moment(d).format("DD/MM/YYYY"))}
                  dateFormat="dd/MM/yyyy"
                />
                {error.Dob && <p style={S.errorMsg}>{error.Dob}</p>}
              </div>
              <div style={S.fieldWrap}>
                <label style={S.label}>Gender</label>
                <select className="hd-select" value={gender}
                  onChange={(e) => { setGender(e.target.value); setError((p) => ({ ...p, gender: e.target.value ? "" : "Gender is required" })); }}>
                  <option value="">-- Select Gender --</option>
                  {genderData?.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
                {error.gender && <p style={S.errorMsg}>{error.gender}</p>}
              </div>
              <div style={S.fieldWrap}>
                <label style={S.label}>Language</label>
                <input className="hd-input" type="text" value={language} placeholder="e.g. Hindi, English"
                  onChange={(e) => { setLanguage(e.target.value); setError((p) => ({ ...p, language: e.target.value ? "" : "Language is required" })); }} />
                {error.language && <p style={S.errorMsg}>{error.language}</p>}
              </div>
              <div style={S.fieldWrap}>
                <label style={S.label}>Country</label>
                <ReactSelect
                  options={countryOptions}
                  value={selectedCountry}
                  isClearable
                  isLoading={loadingCountries}
                  placeholder="Select a country..."
                  onChange={(v) => { setSelectedCountry(v); setError((p) => ({ ...p, country: v ? "" : "Country is required" })); }}
                  styles={selectStyles}
                  formatOptionLabel={(o: any) => (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <img height={16} width={22} src={o.flagUrl} alt={o.name} style={{ objectFit: "cover", borderRadius: "2px" }} />
                      <span>{o.label}</span>
                    </div>
                  )}
                />
                {error.country && <p style={S.errorMsg}>{error.country}</p>}
              </div>
            </div>

            <div style={S.sectionDivider} />

            {/* Section: Profile */}
            <div style={S.sectionLabel}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
              Profile Details
            </div>
            <div style={S.grid2}>
              <div style={S.fieldWrap}>
                <label style={S.label}>Impression</label>
                <Select
                  isMulti
                  options={impressionOptions}
                  value={impressionOptions.filter((o: any) => impression?.includes(o.label))}
                  onChange={(sel: any) => {
                    const labels = sel.map((o: any) => o.label);
                    setImpression(labels);
                    setError((p) => ({ ...p, impression: labels.length ? "" : "Impression is required" }));
                  }}
                  placeholder="-- Select Impressions --"
                  styles={selectStyles}
                />
                {error.impression && <p style={S.errorMsg}>{error.impression}</p>}
              </div>
              <div style={S.fieldWrap}>
                <label style={S.label}>Bio</label>
                <textarea className="hd-textarea" value={bio} placeholder="Short bio..."
                  onChange={(e) => { setBio(e.target.value); setError((p) => ({ ...p, bio: e.target.value ? "" : "Bio is required" })); }} />
                {error.bio && <p style={S.errorMsg}>{error.bio}</p>}
              </div>
              <div style={S.fieldWrap}>
                <label style={S.label}>Profile Image</label>
                <input className="hd-input" type="file" accept="image/png,image/jpeg" onChange={handleInputImage} />
                {error.image && <p style={S.errorMsg}>{error.image}</p>}
                {imagePath && <img src={imagePath} alt="preview" style={S.profilePreview} />}
              </div>
            </div>

            <div style={S.sectionDivider} />

            {/* Section: Call Rates */}
            <div style={S.sectionLabel}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13 19.79 19.79 0 0 1 1.61 4.38 2 2 0 0 1 3.6 2.18h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.16 6.16l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              Call Rates
            </div>
            <div style={S.grid2}>
              {[
                { label: "Private Call Rate", val: privateCallRate, set: setPrivateCallRate, key: "privateCallRate" },
                { label: "Random Female Call Rate", val: randomCallFemaleRate, set: setRandomCallFemaleRate, key: "randomCallFemaleRate" },
                { label: "Random Male Call Rate", val: randomCallMaleRate, set: setRandomCallMaleRate, key: "randomCallMaleRate" },
                { label: "Random Call Rate", val: randomCallRate, set: setRandomCallRate, key: "randomCallRate" },
              ].map(({ label, val, set, key }) => (
                <div key={key} style={S.fieldWrap}>
                  <label style={S.label}>{label}</label>
                  <input className="hd-input" type="number" value={val} placeholder="0"
                    onChange={(e) => { set(Number(e.target.value)); setError((p) => ({ ...p, [key]: e.target.value ? "" : `${label} is required` })); }} />
                  {(error as any)[key] && <p style={S.errorMsg}>{(error as any)[key]}</p>}
                </div>
              ))}
            </div>

            <div style={S.sectionDivider} />

            {/* Section: Media */}
            <div style={S.sectionLabel}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
              Media
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <MediaSection label="Photo Gallery" error={error.images}
                onDrop={makeDropHandler("image", setImages, "images", "images")}
                accept={{ "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"] }}
                files={images} isVideo={false} onRemove={removeImage} />
              <MediaSection label="Video (Call)" error={error.videocall}
                onDrop={makeDropHandler("video", setVideocall, "videocall", "videocall")}
                accept={{ "video/*": [] }}
                files={videocall} isVideo={true} onRemove={removeVideo} />
              <MediaSection label="Live Video" error={error.videolive}
                onDrop={makeDropHandler("video", setVideolive, "videolive", "videolive")}
                accept={{ "video/*": [] }}
                files={videolive} isVideo={true} onRemove={removeVideoLive} />
              <MediaSection label="Profile Video" error={error.profilevideo}
                onDrop={makeDropHandler("video", setProfilevideo, "profilevideo", "profilevideo")}
                accept={{ "video/*": [] }}
                files={profilevideo} isVideo={true} onRemove={removeProfile} />
            </div>

          </div>

          {/* ── Footer ── */}
          <div style={S.modalFooter}>
            <button style={S.cancelBtn} onClick={() => dispatch(closeDialog())}>Cancel</button>
            <button
              style={{ ...S.submitBtn, opacity: isLoading ? 0.7 : 1 }}
              disabled={isLoading}
              onClick={handleSubmit}
            >
              {isLoading ? "Saving..." : dialogueData ? "Update Host" : "Create Host"}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default HostDialog;