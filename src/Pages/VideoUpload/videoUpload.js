import React, { useState, useRef } from "react";
import "./videoUpload.css";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { supabase } from "../../config/supabase";

const VideoUpload = () => {
  const navigate = useNavigate();

  const [inputField, setInputField] = useState({
    title:       "",
    description: "",
    videoLink:   "",
    thumbnail:   "",
    videoType:   "",
  });

  const [loader, setLoader]               = useState(false);
  const [uploadType, setUploadType]       = useState("");
  const [videoUploaded, setVideoUploaded] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);
  const [submitted, setSubmitted]         = useState(false);
  const [error, setError]                 = useState("");
  const [saving, setSaving]               = useState(false);

  // ── Use ref to store duration (avoids state timing issues) ──
  const durationRef = useRef("00:00");

  // ── Get real video duration from file ──
  const getVideoDuration = (file) => {
    return new Promise((resolve) => {
      const videoEl    = document.createElement("video");
      videoEl.preload  = "metadata";
      videoEl.onloadedmetadata = () => {
        window.URL.revokeObjectURL(videoEl.src);
        const totalSec = Math.floor(videoEl.duration);
        const hrs  = Math.floor(totalSec / 3600);
        const mins = Math.floor((totalSec % 3600) / 60);
        const secs = totalSec % 60;
        const duration = hrs > 0
          ? `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`
          : `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
        durationRef.current = duration;
        resolve(duration);
      };
      videoEl.src = URL.createObjectURL(file);
    });
  };

  const handleOnChangeInput = (event, name) => {
    setInputField({ ...inputField, [name]: event.target.value });
    setError("");
  };

  // ── Upload to Cloudinary ──
  const uploadImage = async (e, type) => {
  setLoader(true);
  setUploadType(type);
  setError("");

  const files = e.target.files;
  if (!files || files.length === 0) { setLoader(false); return; }

  if (type === "video") {
    await getVideoDuration(files[0]);
  }

  const data = new FormData();
  data.append("file", files[0]);
  data.append("upload_preset", "youtube-clone");

  // ── Force 16:9 crop for thumbnail images ──
  if (type === "image") {
    data.append("eager", "c_fill,ar_16:9,w_640,h_360");
  }

  try {
    const response = await axios.post(
      `https://api.cloudinary.com/v1_1/dwoqk0yue/${type}/upload`,
      data
    );

    let url = response.data.secure_url;

    // ── Use the 16:9 cropped version for thumbnails ──
    if (type === "image" && response.data.eager?.[0]?.secure_url) {
      url = response.data.eager[0].secure_url;
    }

    const val = type === "image" ? "thumbnail" : "videoLink";
    setInputField((prev) => ({ ...prev, [val]: url }));
    if (type === "image") setImageUploaded(true);
    if (type === "video") setVideoUploaded(true);
    setLoader(false);
  } catch (err) {
    setLoader(false);
    setError("Upload failed. Please try again.");
    console.log(err);
  }
};

  // ── Save to Supabase ──
  const handleSubmit = async () => {
    if (!inputField.title)       return setError("Please enter a video title.");
    if (!inputField.description) return setError("Please enter a description.");
    if (!inputField.videoType)   return setError("Please enter a category.");
    if (!inputField.thumbnail)   return setError("Please upload a thumbnail.");
    if (!inputField.videoLink)   return setError("Please upload a video.");

    console.log("Saving duration:", durationRef.current);

    setSaving(true);
    setError("");

    try {
      const { error: dbError } = await supabase
        .from("videos")
        .insert([{
          title:         inputField.title,
          description:   inputField.description,
          video_url:     inputField.videoLink,
          thumbnail_url: inputField.thumbnail,
          category:      inputField.videoType,
          channel:       localStorage.getItem("username") || "Anonymous",
          duration:      durationRef.current,
        }]);

      if (dbError) throw dbError;

      setSaving(false);
      setSubmitted(true);
    } catch (err) {
      setSaving(false);
      setError("Failed to save video. Please try again.");
      console.log(err);
    }
  };

  // ── Success Screen ──
  if (submitted) return (
    <div className="videoUpload">
      <div className="uploadBox">
        <div className="upload_success_screen">
          <CheckCircleOutlineIcon sx={{ fontSize: "64px", color: "#4caf50" }} />
          <h2>Video Uploaded Successfully!</h2>
          <p>Your video is now live on ZIXPLON&reg;</p>
          <video
            src={inputField.videoLink}
            poster={inputField.thumbnail}
            controls
            className="upload_success_preview"
          />
          <h3>{inputField.title}</h3>
          <p className="upload_success_meta">{inputField.videoType} • {inputField.description}</p>
          <div className="uploadBtns">
            <div className="uploadBtns-form" onClick={() => {
              setSubmitted(false);
              setInputField({ title: "", description: "", videoLink: "", thumbnail: "", videoType: "" });
              setVideoUploaded(false);
              setImageUploaded(false);
              durationRef.current = "00:00";
            }}>
              Upload Another
            </div>
            <div className="uploadBtns-form" onClick={() => navigate("/")}>
              Go Home
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="videoUpload">
      <div className="uploadBox">

        {/* ── Title ── */}
        <div className="uploadVideoTitle">
          <CloudUploadIcon sx={{ fontSize: "54px", color: "orange" }} />
          Upload Video
        </div>

        {/* ── Form ── */}
        <div className="uploadForm">
          <input
            type="text"
            value={inputField.title}
            onChange={(e) => handleOnChangeInput(e, "title")}
            placeholder="Title of Video"
            className="uploadFormInputs"
          />
          <input
            type="text"
            value={inputField.description}
            onChange={(e) => handleOnChangeInput(e, "description")}
            placeholder="Description"
            className="uploadFormInputs"
          />
          <input
            type="text"
            value={inputField.videoType}
            onChange={(e) => handleOnChangeInput(e, "videoType")}
            placeholder="Category (e.g. Music, Gaming, News)"
            className="uploadFormInputs"
          />

          {/* ── Thumbnail Upload ── */}
          <div className="upload_file_row">
            <span className="upload_file_label">Thumbnail</span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => uploadImage(e, "image")}
              style={{ display: "none" }}
              id="thumbnailInput"
            />
            <span
              className="upload_file_btn"
              onClick={() => document.getElementById("thumbnailInput").click()}
            >
              {imageUploaded ? "✅ Change Thumbnail" : "📷 Choose Image"}
            </span>
            {inputField.thumbnail && (
              <img
                src={inputField.thumbnail}
                alt="thumbnail preview"
                className="upload_thumb_preview"
              />
            )}
          </div>

          {/* ── Video Upload ── */}
          <div className="upload_file_row">
            <span className="upload_file_label">Video</span>
            <input
              type="file"
              accept="video/mp4,video/webm,video/*"
              onChange={(e) => uploadImage(e, "video")}
              style={{ display: "none" }}
              id="videoInput"
            />
            <span
              className="upload_file_btn"
              onClick={() => document.getElementById("videoInput").click()}
            >
              {videoUploaded ? "✅ Change Video" : "🎬 Choose Video"}
            </span>
            {inputField.videoLink && (
              <span className="upload_video_ready">🎥 Video ready</span>
            )}
          </div>

          {/* ── Loader ── */}
          {loader && (
            <Box sx={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <CircularProgress size={28} sx={{ color: "orange" }} aria-label="Loading…" />
              <span style={{ color: "#aaa", fontSize: "0.9rem" }}>
                {uploadType === "image" ? "Uploading thumbnail..." : "Uploading video..."}
              </span>
            </Box>
          )}

          {/* ── Error ── */}
          {error && <p className="upload_error_msg">{error}</p>}
        </div>

        {/* ── Buttons ── */}
        <div className="uploadBtns">
          <div
            className={`uploadBtns-form ${(loader || saving) ? "uploadBtns-disabled" : ""}`}
            onClick={!loader && !saving ? handleSubmit : undefined}
          >
            {saving ? "Saving..." : loader ? "Uploading..." : "Upload"}
          </div>
          <Link to={"/"} className="uploadBtns-form">Home</Link>
        </div>

      </div>
    </div>
  );
};

export default VideoUpload;