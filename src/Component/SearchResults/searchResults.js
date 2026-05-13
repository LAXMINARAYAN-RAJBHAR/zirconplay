import React, { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";

const API_KEYS = [
  process.env.REACT_APP_YOUTUBE_KEY_1,
  process.env.REACT_APP_YOUTUBE_KEY_2,
  process.env.REACT_APP_YOUTUBE_KEY_3,
  process.env.REACT_APP_YOUTUBE_KEY_4,
  process.env.REACT_APP_YOUTUBE_KEY_5,
  process.env.REACT_APP_YOUTUBE_KEY_6,
];

let currentKeyIndex = 0;

const getQueryFromHash = () => {
  const hash = window.location.hash;
  const qIndex = hash.indexOf("?");
  if (qIndex === -1) return "";
  const params = new URLSearchParams(hash.slice(qIndex + 1));
  return params.get("q") || "";
};

const SearchResults = () => {
  const location = useLocation();

  const [query, setQuery]                     = useState("");
  const [youtubeResults, setYoutubeResults]   = useState([]);
  const [postResults, setPostResults]         = useState([]);
  const [loading, setLoading]                 = useState(false);
  const [activeTab, setActiveTab]             = useState("all");

  const [selectedVideo, setSelectedVideo]           = useState(null);
  const [selectedVideoIndex, setSelectedVideoIndex] = useState(null);
  const [autoplay, setAutoplay]     = useState(true);
  const [liked, setLiked]           = useState(false);
  const [disliked, setDisliked]     = useState(false);
  const [subscribedChannels, setSubscribedChannels] = useState(new Set());
  const [comment, setComment]       = useState("");
  const [showFullDesc, setShowFullDesc] = useState(false);
  const [comments, setComments]     = useState([
    { id: 1, user: "Rahul", text: "Amazing video! 🔥",        time: "2 days ago",  likes: 24 },
    { id: 2, user: "Priya", text: "Loved this content!",       time: "1 day ago",   likes: 12 },
    { id: 3, user: "Amit",  text: "Very informative, thanks!", time: "5 hours ago", likes: 5  },
  ]);

  // ✅ All refs
  const autoplayRef  = useRef(autoplay);
  const playerRef    = useRef(null);
  const resultsRef   = useRef(youtubeResults);
  const indexRef     = useRef(selectedVideoIndex);

  // ✅ Keep refs in sync
  useEffect(() => { autoplayRef.current = autoplay; }, [autoplay]);
  useEffect(() => { resultsRef.current = youtubeResults; }, [youtubeResults]);
  useEffect(() => { indexRef.current = selectedVideoIndex; }, [selectedVideoIndex]);

  // ✅ Load YouTube IFrame API script once
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
  }, []);

  // ✅ Init/reinit YT Player with polling whenever selectedVideo changes
  useEffect(() => {
    if (!selectedVideo) return;

    let pollInterval = null;

    const initPlayer = () => {
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = null;
      }

      // Recreate fresh mount point
      const container = document.getElementById("yt-player-container");
      if (container) {
        container.innerHTML = "";
        const div = document.createElement("div");
        div.id = "yt-player";
        container.appendChild(div);
      }

      playerRef.current = new window.YT.Player("yt-player", {
        height: window.innerWidth < 768 ? "220" : "500",
        width: "100%",
        videoId: selectedVideo,
        playerVars: { autoplay: 1, rel: 0, enablejsapi: 1 },
        events: {
          onReady: () => {
            // ✅ Polling — checks every second if video ended
            pollInterval = setInterval(() => {
              if (!playerRef.current) return;
              try {
                const state = playerRef.current.getPlayerState();
                if (state === 0 && autoplayRef.current) {
                  clearInterval(pollInterval);
                  const currentResults = resultsRef.current;
                  const currentIndex   = indexRef.current;
                  const n = currentIndex + 1;
                  if (n < currentResults.length) {
                    openVideo(currentResults[n], n);
                  }
                }
              } catch (e) {}
            }, 1000);
          },
          // ✅ Backup — works in some browsers
          onStateChange: (event) => {
            if (event.data === 0 && autoplayRef.current) {
              clearInterval(pollInterval);
              const n = indexRef.current + 1;
              if (n < resultsRef.current.length) {
                openVideo(resultsRef.current[n], n);
              }
            }
          },
        },
      });
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      window.onYouTubeIframeAPIReady = initPlayer;
    }

    return () => {
      clearInterval(pollInterval);
      if (playerRef.current) {
        try { playerRef.current.destroy(); } catch (e) {}
        playerRef.current = null;
      }
    };
  }, [selectedVideo]);

  // ✅ Re-run on every hash/location change
  useEffect(() => {
    const q = getQueryFromHash();
    if (!q) return;
    setQuery(q);
    setSelectedVideo(null);
    setSelectedVideoIndex(null);
    fetchAll(q);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.key, location.hash]);

  const fetchAll = async (q) => {
    setLoading(true);
    setYoutubeResults([]);
    setPostResults([]);
    await Promise.all([fetchYoutube(q), fetchPosts(q)]);
    setLoading(false);
  };

  const fetchYoutube = async (q) => {
    for (let i = 0; i < API_KEYS.length; i++) {
      const keyIndex = (currentKeyIndex + i) % API_KEYS.length;
      try {
        const res = await axios.get("https://www.googleapis.com/youtube/v3/search", {
          params: { part: "snippet", q, type: "video", maxResults: 50, order: "relevance", key: API_KEYS[keyIndex] },
        });
        currentKeyIndex = keyIndex;
        setYoutubeResults(res.data.items || []);
        return;
      } catch (err) {
        if (err.response?.status === 403) { currentKeyIndex = (keyIndex + 1) % API_KEYS.length; continue; }
        console.error("YouTube API error:", err.response?.data?.error?.message || err.message);
        break;
      }
    }
  };

  const fetchPosts = async (q) => {
    try {
      const res = await axios.get(`/api/posts?search=${encodeURIComponent(q)}`);
      setPostResults(Array.isArray(res.data) ? res.data : []);
    } catch {
      setPostResults([]);
    }
  };

  const openVideo = (item, index) => {
    setSelectedVideo(item.id.videoId);
    setSelectedVideoIndex(index);
    setLiked(false);
    setDisliked(false);
    setComment("");
    setShowFullDesc(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ✅ Per-channel subscribe
  const handleSubscribe = (channelTitle) => {
    setSubscribedChannels((prev) => {
      const next = new Set(prev);
      next.has(channelTitle) ? next.delete(channelTitle) : next.add(channelTitle);
      return next;
    });
  };

  const goNext = () => {
    const n = selectedVideoIndex + 1;
    if (n < youtubeResults.length) openVideo(youtubeResults[n], n);
  };

  const goPrev = () => {
    const p = selectedVideoIndex - 1;
    if (p >= 0) openVideo(youtubeResults[p], p);
  };

  const currentItem   = selectedVideo ? youtubeResults[selectedVideoIndex] : null;
  const relatedVideos = selectedVideo ? youtubeResults.filter((_, i) => i !== selectedVideoIndex) : [];
  const showVideos    = activeTab === "all" || activeTab === "videos";
  const showPosts     = activeTab === "all" || activeTab === "posts";
  const isMobile      = window.innerWidth < 768;

  return (
    <div style={{ background: "#0f0f0f", minHeight: "100vh", paddingTop: "70px", fontFamily: "Roboto, Arial, sans-serif", color: "white" }}>

      {/* ── LOADING SKELETONS ── */}
      {loading && (
        <div style={{ padding: "20px" }}>
          <div style={{ color: "#aaa", fontSize: "14px", marginBottom: "16px", textAlign: "center" }}>
            🔍 Searching for "<strong style={{ color: "white" }}>{query}</strong>"...
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{ background: "#272727", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ width: "100%", paddingTop: "56.25%", background: "#3a3a3a", animation: "pulse 1.5s infinite" }} />
                <div style={{ padding: "12px", display: "flex", gap: "10px" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#3a3a3a", flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: "14px", background: "#3a3a3a", borderRadius: "4px", marginBottom: "8px" }} />
                    <div style={{ height: "12px", background: "#3a3a3a", borderRadius: "4px", width: "60%" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!loading && (
        <>
          {/* ── WATCH PAGE ── */}
          {selectedVideo ? (
            <div style={{ display: "flex", gap: "24px", padding: "20px 24px", maxWidth: "1600px", margin: "0 auto", flexWrap: "wrap" }}>

              {/* LEFT: Player */}
              <div style={{ flex: "1 1 0", minWidth: 0, width: "100%" }}>

                {/* ✅ YT Player container */}
                <div style={{ borderRadius: "12px", overflow: "hidden", background: "#000" }}>
                  <div
                    id="yt-player-container"
                    style={{ width: "100%", height: isMobile ? "220px" : "500px" }}
                  >
                    <div id="yt-player" />
                  </div>
                </div>

                {/* Prev / Autoplay / Next */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "#181818", borderRadius: "10px", padding: "10px 16px", marginTop: "10px" }}>
                  <button onClick={goPrev} disabled={selectedVideoIndex === 0}
                    style={{ display: "flex", alignItems: "center", gap: "6px", background: selectedVideoIndex === 0 ? "#2a2a2a" : "#272727", border: "none", color: selectedVideoIndex === 0 ? "#555" : "white", borderRadius: "20px", padding: "8px 18px", cursor: selectedVideoIndex === 0 ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600" }}
                    onMouseEnter={e => { if (selectedVideoIndex !== 0) e.currentTarget.style.background = "#3a3a3a"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selectedVideoIndex === 0 ? "#2a2a2a" : "#272727"; }}
                  >⏮ Previous</button>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#aaa", fontSize: "13px" }}>Autoplay</span>
                    <div onClick={() => setAutoplay(!autoplay)}
                      style={{ width: "44px", height: "24px", background: autoplay ? "#ff0000" : "#555", borderRadius: "12px", cursor: "pointer", position: "relative", transition: "background 0.3s", flexShrink: 0 }}>
                      <div style={{ width: "18px", height: "18px", background: "white", borderRadius: "50%", position: "absolute", top: "3px", left: autoplay ? "23px" : "3px", transition: "left 0.3s", boxShadow: "0 1px 3px rgba(0,0,0,0.4)" }} />
                    </div>
                    <span style={{ color: autoplay ? "#ff0000" : "#555", fontSize: "12px", fontWeight: "600" }}>{autoplay ? "ON" : "OFF"}</span>
                  </div>

                  <button onClick={goNext} disabled={selectedVideoIndex === youtubeResults.length - 1}
                    style={{ display: "flex", alignItems: "center", gap: "6px", background: selectedVideoIndex === youtubeResults.length - 1 ? "#2a2a2a" : "#ff0000", border: "none", color: selectedVideoIndex === youtubeResults.length - 1 ? "#555" : "white", borderRadius: "20px", padding: "8px 18px", cursor: selectedVideoIndex === youtubeResults.length - 1 ? "not-allowed" : "pointer", fontSize: "14px", fontWeight: "600" }}
                    onMouseEnter={e => { if (selectedVideoIndex !== youtubeResults.length - 1) e.currentTarget.style.background = "#cc0000"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = selectedVideoIndex === youtubeResults.length - 1 ? "#2a2a2a" : "#ff0000"; }}
                  >Next ⏭</button>
                </div>

                {currentItem && (
                  <>
                    <div style={{ color: "white", fontWeight: "700", fontSize: "18px", lineHeight: "1.4", marginTop: "14px" }}>
                      {currentItem.snippet.title}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", marginTop: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(currentItem.snippet.channelTitle)}&background=random&size=40`}
                          alt="ch" style={{ width: "40px", height: "40px", borderRadius: "50%" }} />
                        <div>
                          <div style={{ color: "white", fontWeight: "600", fontSize: "15px" }}>{currentItem.snippet.channelTitle}</div>
                          <div style={{ color: "#aaa", fontSize: "12px" }}>1.2M subscribers</div>
                        </div>
                        {/* ✅ Per-channel subscribe */}
                        <button
                          onClick={() => handleSubscribe(currentItem.snippet.channelTitle)}
                          style={{ background: subscribedChannels.has(currentItem.snippet.channelTitle) ? "#272727" : "white", color: subscribedChannels.has(currentItem.snippet.channelTitle) ? "white" : "black", border: "none", borderRadius: "20px", padding: "8px 18px", fontWeight: "700", cursor: "pointer", fontSize: "14px", marginLeft: "8px" }}
                        >
                          {subscribedChannels.has(currentItem.snippet.channelTitle) ? "✓ Subscribed" : "Subscribe"}
                        </button>
                      </div>

                      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                        <div style={{ display: "flex", background: "#272727", borderRadius: "20px", overflow: "hidden" }}>
                          <button onClick={() => { setLiked(!liked); if (disliked) setDisliked(false); }}
                            style={{ background: liked ? "#3ea6ff22" : "transparent", border: "none", color: liked ? "#3ea6ff" : "white", padding: "8px 16px", cursor: "pointer", fontSize: "14px", borderRight: "1px solid #3a3a3a" }}>
                            👍 1.1K</button>
                          <button onClick={() => { setDisliked(!disliked); if (liked) setLiked(false); }}
                            style={{ background: disliked ? "#ff444422" : "transparent", border: "none", color: disliked ? "#ff4444" : "white", padding: "8px 16px", cursor: "pointer", fontSize: "14px" }}>
                            👎</button>
                        </div>
                        <button onClick={() => { navigator.clipboard.writeText(`https://www.youtube.com/watch?v=${selectedVideo}`); alert("Link copied!"); }}
                          style={{ background: "#272727", border: "none", color: "white", borderRadius: "20px", padding: "8px 16px", cursor: "pointer", fontSize: "14px" }}>
                          🔗 Share</button>
                        <button onClick={() => { setSelectedVideo(null); setSelectedVideoIndex(null); }}
                          style={{ background: "#272727", border: "none", color: "#aaa", borderRadius: "20px", padding: "8px 16px", cursor: "pointer", fontSize: "13px" }}>
                          ✕ Close</button>
                      </div>
                    </div>

                    {/* Description */}
                    <div style={{ background: "#272727", borderRadius: "12px", padding: "14px 16px", marginTop: "14px", color: "#ccc", fontSize: "14px", lineHeight: "1.6", cursor: "pointer" }}
                      onClick={() => setShowFullDesc(!showFullDesc)}>
                      <div style={{ color: "#aaa", fontSize: "13px", marginBottom: "6px" }}>
                        {new Date(currentItem.snippet.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </div>
                      <p style={{ margin: 0, display: showFullDesc ? "block" : "-webkit-box", WebkitLineClamp: showFullDesc ? "unset" : 2, WebkitBoxOrient: "vertical", overflow: showFullDesc ? "visible" : "hidden" }}>
                        {currentItem.snippet.description || "No description available."}
                      </p>
                      <span style={{ color: "white", fontWeight: "600", fontSize: "13px", marginTop: "6px", display: "block" }}>
                        {showFullDesc ? "Show less" : "...more"}
                      </span>
                    </div>

                    {/* Comments */}
                    <div style={{ marginTop: "28px" }}>
                      <div style={{ color: "white", fontWeight: "600", fontSize: "16px", marginBottom: "20px" }}>{comments.length} Comments</div>
                      <div style={{ display: "flex", gap: "12px", marginBottom: "24px" }}>
                        <img src="https://athenabpo.com/wp-content/uploads/2016/09/Headshot-Blank-Person-Circle-300x300.gif"
                          alt="user" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <input type="text" value={comment} onChange={e => setComment(e.target.value)}
                            onKeyDown={e => { if (e.key === "Enter" && comment.trim()) { setComments([{ id: Date.now(), text: comment, user: "You", time: "Just now", likes: 0 }, ...comments]); setComment(""); } }}
                            placeholder="Add a comment..."
                            style={{ width: "100%", background: "transparent", border: "none", borderBottom: "1px solid #555", color: "white", fontSize: "14px", padding: "8px 0", outline: "none", boxSizing: "border-box" }} />
                          {comment.trim() && (
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "8px" }}>
                              <button onClick={() => setComment("")} style={{ background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: "14px" }}>Cancel</button>
                              <button onClick={() => { setComments([{ id: Date.now(), text: comment, user: "You", time: "Just now", likes: 0 }, ...comments]); setComment(""); }}
                                style={{ background: "#3ea6ff", border: "none", color: "black", borderRadius: "20px", padding: "6px 16px", cursor: "pointer", fontWeight: "700", fontSize: "14px" }}>Comment</button>
                            </div>
                          )}
                        </div>
                      </div>
                      {comments.map(c => (
                        <div key={c.id} style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(c.user)}&background=random&size=36`}
                            alt={c.user} style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                          <div>
                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                              <span style={{ color: "white", fontWeight: "600", fontSize: "13px" }}>{c.user}</span>
                              <span style={{ color: "#aaa", fontSize: "12px" }}>{c.time}</span>
                            </div>
                            <div style={{ color: "#ccc", fontSize: "14px", marginTop: "4px" }}>{c.text}</div>
                            <div style={{ display: "flex", gap: "12px", marginTop: "6px" }}>
                              <span style={{ color: "#aaa", fontSize: "13px", cursor: "pointer" }}>👍 {c.likes}</span>
                              <span style={{ color: "#aaa", fontSize: "13px", cursor: "pointer" }}>👎</span>
                              <span style={{ color: "#aaa", fontSize: "13px", cursor: "pointer" }}>Reply</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* RIGHT: Related sidebar */}
              <div style={{ width: isMobile ? "100%" : "402px", flexShrink: 0, position: isMobile ? "relative" : "sticky", top: "70px", height: isMobile ? "auto" : "calc(100vh - 90px)", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#555 transparent" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "8px", marginBottom: "12px" }}>
                  <span style={{ color: "#aaa", fontSize: "13px" }}>Autoplay</span>
                  <div onClick={() => setAutoplay(!autoplay)}
                    style={{ width: "42px", height: "24px", background: autoplay ? "#ff0000" : "#555", borderRadius: "12px", cursor: "pointer", position: "relative", transition: "background 0.3s" }}>
                    <div style={{ width: "18px", height: "18px", background: "white", borderRadius: "50%", position: "absolute", top: "3px", left: autoplay ? "21px" : "3px", transition: "left 0.3s" }} />
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {relatedVideos.map(item => {
                    const realIndex = youtubeResults.indexOf(item);
                    return (
                      <div key={item.id.videoId} onClick={() => openVideo(item, realIndex)}
                        style={{ display: "flex", gap: "8px", cursor: "pointer", borderRadius: "8px", padding: "4px", transition: "background 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#1e1e1e"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                        <div style={{ position: "relative", flexShrink: 0, width: "168px", height: "94px", borderRadius: "8px", overflow: "hidden" }}>
                          <img src={item.snippet.thumbnails.medium.url} alt={item.snippet.title}
                            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0, paddingTop: "2px" }}>
                          <div style={{ color: "white", fontSize: "13px", fontWeight: "600", lineHeight: "1.4", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "4px" }}>
                            {item.snippet.title}
                          </div>
                          <div style={{ color: "#aaa", fontSize: "12px", marginBottom: "2px" }}>{item.snippet.channelTitle}</div>
                          <div style={{ color: "#aaa", fontSize: "12px" }}>
                            {new Date(item.snippet.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          ) : (
            /* ── SEARCH RESULTS GRID ── */
            <div style={{ padding: "20px" }}>
              <div style={{ marginBottom: "20px" }}>
                <div style={{ fontSize: "15px", color: "#aaa", marginBottom: "14px" }}>
                  Results for <strong style={{ color: "white" }}>"{query}"</strong>
                  {youtubeResults.length > 0 && (
                    <span style={{ marginLeft: "8px", color: "#555", fontSize: "13px" }}>
                      — {youtubeResults.length} videos{postResults.length > 0 ? `, ${postResults.length} posts` : ""}
                    </span>
                  )}
                </div>

                {youtubeResults.length > 0 && postResults.length > 0 && (
                  <div style={{ display: "flex", gap: "8px" }}>
                    {["all", "videos", "posts"].map(tab => (
                      <button key={tab} onClick={() => setActiveTab(tab)}
                        style={{ padding: "6px 16px", borderRadius: "20px", border: "none", cursor: "pointer", fontSize: "13px", fontWeight: "600", textTransform: "capitalize", background: activeTab === tab ? "white" : "#272727", color: activeTab === tab ? "black" : "white", transition: "background 0.15s" }}>
                        {tab === "all" ? "🔍 All" : tab === "videos" ? "▶ Videos" : "📱 Posts"}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {showPosts && postResults.length > 0 && (
                <div style={{ marginBottom: "40px" }}>
                  <h2 style={{ fontSize: "15px", color: "#aaa", marginBottom: "12px", fontWeight: "600" }}>📱 Posts</h2>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                    {postResults.map((post, i) => (
                      <div key={i} style={{ background: "#272727", borderRadius: "12px", overflow: "hidden", cursor: "pointer", transition: "transform 0.2s" }}
                        onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
                        onMouseLeave={e => e.currentTarget.style.transform = "translateY(0)"}>
                        {post.image && <img src={post.image} alt={post.title} style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover" }} />}
                        <div style={{ padding: "12px" }}>
                          <div style={{ fontWeight: "600", fontSize: "14px", color: "white", marginBottom: "4px" }}>{post.title}</div>
                          <div style={{ color: "#aaa", fontSize: "12px" }}>{post.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {showVideos && youtubeResults.length > 0 && (
                <div>
                  {postResults.length > 0 && showPosts && (
                    <h2 style={{ fontSize: "15px", color: "#aaa", marginBottom: "12px", fontWeight: "600" }}>▶ YouTube Videos</h2>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
                    {youtubeResults.map((item, index) => (
                      <div key={item.id.videoId} onClick={() => openVideo(item, index)} style={{ cursor: "pointer" }}
                        onMouseEnter={e => e.currentTarget.querySelector(".thumb").style.transform = "scale(1.03)"}
                        onMouseLeave={e => e.currentTarget.querySelector(".thumb").style.transform = "scale(1)"}>
                        <div style={{ borderRadius: "12px", overflow: "hidden" }}>
                          <img className="thumb" src={item.snippet.thumbnails.medium.url} alt={item.snippet.title}
                            style={{ width: "100%", aspectRatio: "16/9", objectFit: "cover", display: "block", transition: "transform 0.3s" }} />
                        </div>
                        <div style={{ display: "flex", gap: "10px", padding: "10px 4px" }}>
                          <img src={`https://ui-avatars.com/api/?name=${encodeURIComponent(item.snippet.channelTitle)}&background=random&size=36`}
                            alt="ch" style={{ width: "36px", height: "36px", borderRadius: "50%", flexShrink: 0 }} />
                          <div style={{ flex: 1 }}>
                            <div style={{ color: "white", fontWeight: "600", fontSize: "13px", lineHeight: "1.4", marginBottom: "4px", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                              {item.snippet.title}
                            </div>
                            <div style={{ color: "#aaa", fontSize: "12px", marginBottom: "2px" }}>{item.snippet.channelTitle}</div>
                            <div style={{ color: "#aaa", fontSize: "12px" }}>
                              {new Date(item.snippet.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {youtubeResults.length === 0 && postResults.length === 0 && (
                <div style={{ textAlign: "center", marginTop: "80px" }}>
                  <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔍</div>
                  <p style={{ color: "#555", fontSize: "16px" }}>No results found for "<span style={{ color: "#aaa" }}>{query}</span>"</p>
                  <p style={{ color: "#444", fontSize: "13px", marginTop: "8px" }}>Try different keywords or check your spelling</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
        ::-webkit-scrollbar { height: 4px; width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #555; border-radius: 4px; }
      `}</style>
    </div>
  );
};

export default SearchResults;