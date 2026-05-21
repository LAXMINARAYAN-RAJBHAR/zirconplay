import React, { useState, useRef, useEffect } from "react";
import "./navbar.css";
import ListIcon from "@mui/icons-material/List";
import PublicIcon from "@mui/icons-material/Public";
import SearchIcon from "@mui/icons-material/Search";
import KeyboardVoiceIcon from "@mui/icons-material/KeyboardVoice";
import VideoCameraFrontIcon from "@mui/icons-material/VideoCameraFront";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import HistoryIcon from "@mui/icons-material/History";
import { Link, useNavigate, useLocation } from "react-router-dom";
import Login from "../Login/login";
import YouTubeIcon from "@mui/icons-material/YouTube";

// ─── Country Code Hook ─────────────────────────────────────────────────────────
const useCountry = () => {
  const [countryCode, setCountryCode] = useState("IN");
  useEffect(() => {
    const fetchCountry = async () => {
      const apis = [
        { url: "https://ipapi.co/json/", parse: (d) => d.country_code },
        { url: "https://ipwho.is/", parse: (d) => d.country_code },
        { url: "https://api.country.is/", parse: (d) => d.country },
      ];
      for (const api of apis) {
        try {
          const res = await fetch(api.url);
          if (!res.ok) continue;
          const data = await res.json();
          const code = api.parse(data);
          if (code && code.length === 2) {
            setCountryCode(code);
            return;
          }
        } catch {}
      }
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        if (tz.includes("Calcutta") || tz.includes("Kolkata"))
          setCountryCode("IN");
        else if (tz.includes("America")) setCountryCode("US");
        else if (tz.includes("London")) setCountryCode("GB");
        else if (tz.includes("Dubai")) setCountryCode("AE");
        else if (tz.includes("Tokyo")) setCountryCode("JP");
        else if (tz.includes("Sydney")) setCountryCode("AU");
      } catch {
        setCountryCode("IN");
      }
    };
    fetchCountry();
  }, []);
  return countryCode;
};

// ─── Category detection ────────────────────────────────────────────────────────
const CATEGORY_PATTERNS = {
  music: /song|music|album|playlist|remix|beat|audio|singer|artist|band/i,
  gaming: /game|gameplay|minecraft|roblox|gta|valorant|pubg|fortnite|esport/i,
  sports: /match|highlights|cricket|football|nba|ipl|goal|fifa|tennis|boxing/i,
  tech: /phone|laptop|review|unbox|tech|ai|coding|tutorial|programming|vs\s/i,
  news: /news|breaking|update|today|latest|2024|2025/i,
  comedy: /funny|meme|comedy|prank|roast|fail|try not to laugh/i,
  cooking: /recipe|cook|food|bake|chef|how to make|easy meal/i,
  travel: /travel|vlog|trip|tour|explore|city|country|place/i,
};

const CATEGORY_SUFFIXES = {
  music: [
    { suffix: "official music video", tag: "music" },
    { suffix: "2025", tag: "new" },
    { suffix: "full album", tag: null },
    { suffix: "live performance", tag: "live" },
    { suffix: "lyrics", tag: null },
    { suffix: "remix", tag: null },
  ],
  gaming: [
    { suffix: "gameplay 2025", tag: "new" },
    { suffix: "speedrun", tag: "trend" },
    { suffix: "tips and tricks", tag: null },
    { suffix: "walkthrough", tag: null },
    { suffix: "best moments", tag: null },
    { suffix: "live stream", tag: "live" },
  ],
  sports: [
    { suffix: "highlights 2025", tag: "new" },
    { suffix: "full match", tag: null },
    { suffix: "best moments", tag: "trend" },
    { suffix: "live", tag: "live" },
    { suffix: "analysis", tag: null },
    { suffix: "reaction", tag: null },
  ],
  tech: [
    { suffix: "review 2025", tag: "new" },
    { suffix: "unboxing", tag: null },
    { suffix: "vs comparison", tag: null },
    { suffix: "best settings", tag: null },
    { suffix: "explained", tag: null },
    { suffix: "shorts", tag: null },
  ],
  news: [
    { suffix: "today", tag: "live" },
    { suffix: "breaking news", tag: "trend" },
    { suffix: "explained", tag: null },
    { suffix: "live update", tag: "live" },
    { suffix: "2025", tag: "new" },
    { suffix: "documentary", tag: null },
  ],
  comedy: [
    { suffix: "compilation", tag: "trend" },
    { suffix: "best moments", tag: null },
    { suffix: "reaction", tag: null },
    { suffix: "shorts", tag: null },
    { suffix: "try not to laugh", tag: null },
    { suffix: "roast", tag: null },
  ],
  cooking: [
    { suffix: "easy recipe", tag: null },
    { suffix: "step by step", tag: null },
    { suffix: "5 minute recipe", tag: "trend" },
    { suffix: "for beginners", tag: null },
    { suffix: "restaurant style", tag: null },
    { suffix: "shorts", tag: null },
  ],
  travel: [
    { suffix: "travel vlog 2025", tag: "new" },
    { suffix: "best places", tag: "trend" },
    { suffix: "travel guide", tag: null },
    { suffix: "hidden gems", tag: null },
    { suffix: "budget travel", tag: null },
    { suffix: "4K", tag: null },
  ],
  default: [
    { suffix: "2025", tag: "new" },
    { suffix: "explained", tag: null },
    { suffix: "tutorial", tag: null },
    { suffix: "review", tag: null },
    { suffix: "highlights", tag: "trend" },
    { suffix: "shorts", tag: null },
  ],
};

const TRENDING_GLOBAL = [
  "minecraft survival series",
  "ipl highlights today",
  "lo fi hip hop beats",
  "iphone 17 review",
  "one piece episode 2025",
  "india vs australia",
  "best coding tips",
  "viral street food",
];

const CATEGORY_LABELS = {
  music: "🎵 Music",
  gaming: "🎮 Gaming",
  sports: "🏆 Sports",
  tech: "💻 Tech",
  news: "📰 News",
  comedy: "😂 Comedy",
  cooking: "🍳 Cooking",
  travel: "✈️ Travel",
  default: null,
};

let _searchHistory = [];

const getSuggestions = (q) => {
  if (!q.trim())
    return {
      items: [],
      category: null,
      trending: [],
      history: _searchHistory.slice(0, 3),
    };
  let category = "default";
  for (const [cat, pattern] of Object.entries(CATEGORY_PATTERNS)) {
    if (pattern.test(q)) {
      category = cat;
      break;
    }
  }
  const suffixes = CATEGORY_SUFFIXES[category];
  const items = suffixes.slice(0, 5).map(({ suffix, tag }) => ({
    text: `${q} ${suffix}`,
    displayQuery: q,
    displaySuffix: suffix,
    tag,
    type: "suggestion",
  }));
  const trending = TRENDING_GLOBAL.filter(
    (t) => !t.toLowerCase().includes(q.toLowerCase()) && t !== q,
  ).slice(0, 3);
  const historyMatches = _searchHistory
    .filter((h) => h.toLowerCase().includes(q.toLowerCase()) && h !== q)
    .slice(0, 2);
  return { items, category, trending, history: historyMatches };
};

const addToHistory = (q) => {
  if (!q.trim()) return;
  _searchHistory = [q, ..._searchHistory.filter((h) => h !== q)].slice(0, 10);
};

// ─── Tag badge ─────────────────────────────────────────────────────────────────
const TagBadge = ({ tag }) => {
  if (!tag) return null;
  const styles = {
    live: {
      bg: "rgba(251,146,60,0.15)",
      color: "#fb923c",
      border: "1px solid rgba(124,51,0,0.4)",
      text: "🔴 LIVE",
    },
    new: {
      bg: "rgba(74,222,128,0.12)",
      color: "#4ade80",
      border: "none",
      text: "NEW",
    },
    trend: {
      bg: "rgba(255,112,102,0.12)",
      color: "#ff7066",
      border: "none",
      text: "↑ TRENDING",
    },
    music: {
      bg: "rgba(167,139,250,0.12)",
      color: "#a78bfa",
      border: "none",
      text: "♪ MUSIC",
    },
  };
  const s = styles[tag];
  if (!s) return null;
  return (
    <span
      style={{
        marginLeft: "auto",
        flexShrink: 0,
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "0.04em",
        padding: "2px 7px",
        borderRadius: "10px",
        background: s.bg,
        color: s.color,
        border: s.border || "none",
      }}
    >
      {s.text}
    </span>
  );
};

// ─── Notification helpers ──────────────────────────────────────────────────────
const getNotifStyle = (type) => {
  switch (type) {
    case "upload":
      return { color: "#ff4444", icon: "🎬" };
    case "like":
      return { color: "#ff9800", icon: "❤️" };
    case "comment":
      return { color: "#2196f3", icon: "💬" };
    case "subscriber":
      return { color: "#4caf50", icon: "🔔" };
    default:
      return { color: "#aaa", icon: "📢" };
  }
};

// ─── Main Navbar ───────────────────────────────────────────────────────────────
const Navbar = ({
  currentUser,
  setSideNavbarFunc,
  sideNavbar,
  notifications,
  setNotifications,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const countryCode = useCountry();

  const [userPic] = useState(
    "https://athenabpo.com/wp-content/uploads/2016/09/Headshot-Blank-Person-Circle-300x300.gif",
  );
  const [navbarModal, setNavbarModal] = useState(false);
  const [login, setLogin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestionData, setSuggestionData] = useState({
    items: [],
    category: null,
    trending: [],
    history: [],
  });
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [isListening, setIsListening] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [logoKey, setLogoKey] = useState(0);
  const [searchBarActive, setSearchBarActive] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  const dropdownRef = useRef(null);
  const notifRef = useRef(null);
  const recognitionRef = useRef(null);
  const inputRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const markOneRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  useEffect(() => {
    setShowNotifications(false);
    setNavbarModal(false);
  }, [location.pathname]);

  useEffect(() => {
    const h = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
        setSearchBarActive(false);
      }
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setShowNotifications(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setLogoKey((prev) => prev + 1), 3000);
    return () => clearInterval(interval);
  }, []);

  const sideNavbarFunc = () => setSideNavbarFunc(!sideNavbar);

  const handleprofile = () => {
    if (currentUser) navigate(`/user/${currentUser}`);
    else setLogin(true);
    setNavbarModal(false);
  };

  const setLoginModal = () => setLogin(false);
  const onclickOfPopUpOption = (button) => {
    setNavbarModal(false);
    if (button === "login") setLogin(true);
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setActiveIndex(-1);
    if (val.trim()) {
      setSuggestionData(getSuggestions(val));
      setShowDropdown(true);
    } else {
      setSuggestionData({
        items: [],
        category: null,
        trending: TRENDING_GLOBAL.slice(0, 4),
        history: _searchHistory.slice(0, 3),
      });
      setShowDropdown(true);
    }
  };

  // ✅ Fixed doSearch for HashRouter
  const doSearch = (q) => {
    if (!q.trim()) return;
    addToHistory(q);
    setShowDropdown(false);
    setSearchBarActive(false);
    setSearchQuery(q);
    setIsSearchFocused(true);
    navigate({ pathname: "/search", search: `?q=${encodeURIComponent(q)}` });
    setTimeout(() => setIsSearchFocused(false), 1500);
  };

  const allNavItems = [
    ...suggestionData.history.map((h) => ({ text: h, type: "history" })),
    ...suggestionData.items,
    ...suggestionData.trending.map((t) => ({ text: t, type: "trending" })),
  ];

  const handleKeyDown = (e) => {
    if (!showDropdown) {
      if (e.key === "Enter") doSearch(searchQuery);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((p) => Math.min(p + 1, allNavItems.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((p) => Math.max(p - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && allNavItems[activeIndex])
        doSearch(allNavItems[activeIndex].text);
      else doSearch(searchQuery);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setSearchBarActive(false);
      inputRef.current?.blur();
    } else if (
      e.key === "Tab" &&
      activeIndex >= 0 &&
      allNavItems[activeIndex]
    ) {
      e.preventDefault();
      setSearchQuery(allNavItems[activeIndex].text);
      setSuggestionData(getSuggestions(allNavItems[activeIndex].text));
    }
  };

  const speak = (text, callback) => {
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "en-IN";
    utter.rate = 1.1;
    utter.onend = callback;
    window.speechSynthesis.speak(utter);
  };

  const startVoiceSearch = async () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("Voice search not supported. Please use Chrome or Edge.");
      return;
    }

    // ✅ Step 1: Request system microphone permission explicitly
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted — stop the stream immediately, we just needed permission
      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      if (
        err.name === "NotAllowedError" ||
        err.name === "PermissionDeniedError"
      ) {
        alert(
          "🎤 Microphone access denied!\n\n" +
            "To fix this:\n" +
            "1. Click the 🔒 lock icon in your browser address bar\n" +
            "2. Set Microphone to 'Allow'\n" +
            "3. Refresh the page and try again",
        );
        return;
      }
      if (err.name === "NotFoundError") {
        alert(
          "🎤 No microphone found!\n\n" +
            "Please connect a microphone to your device and try again.",
        );
        return;
      }
      // Other errors — still try to proceed
      console.warn("Mic permission warning:", err.message);
    }

    setIsListening(true);
    let gotResult = false;
    let silenceTimer = null;

    // ✅ Step 2: Start speech recognition
    const recognition = new SR();
    recognitionRef.current = recognition;

    recognition.lang = "en-IN";
    recognition.interimResults = true; // ✅ show live results
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    // ✅ Step 3: Speak prompt
    const speakPrompt = () => {
      if (window.speechSynthesis) {
        const utter = new SpeechSynthesisUtterance("Please speak now");
        utter.lang = "en-IN";
        utter.rate = 1.1;
        utter.volume = 0.7;
        window.speechSynthesis.speak(utter);
      }
    };
    speakPrompt();

    // ✅ Step 4: Handle results
    recognition.onresult = (event) => {
      gotResult = true;
      clearTimeout(silenceTimer);

      let interimTranscript = "";
      let finalTranscript = "";

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) finalTranscript += transcript;
        else interimTranscript += transcript;
      }

      // Update search box live with interim results
      if (interimTranscript) setSearchQuery(interimTranscript);

      // When final result comes — search immediately
      if (finalTranscript) {
        recognition.stop();
        setIsListening(false);
        doSearch(finalTranscript.trim());
      }
    };

    // ✅ Step 5: Handle errors with clear messages
    recognition.onerror = (e) => {
      setIsListening(false);
      clearTimeout(silenceTimer);
      switch (e.error) {
        case "not-allowed":
          alert(
            "🎤 Microphone blocked!\n\n" +
              "Click the 🔒 lock icon → set Microphone to Allow → refresh page",
          );
          break;
        case "no-speech":
          alert("No speech detected. Please try again and speak clearly.");
          break;
        case "audio-capture":
          alert(
            "🎤 No microphone detected!\n\n" +
              "Please connect a microphone and try again.",
          );
          break;
        case "network":
          alert("Network error. Please check your internet connection.");
          break;
        case "aborted":
          // User cancelled — do nothing
          break;
        default:
          alert(`Voice search error: ${e.error}. Please try again.`);
      }
    };

    // ✅ Step 6: Auto-stop after 8 seconds of silence
    recognition.onstart = () => {
      silenceTimer = setTimeout(() => {
        if (!gotResult) {
          recognition.stop();
          setIsListening(false);
        }
      }, 8000);
    };

    recognition.onend = () => {
      clearTimeout(silenceTimer);
      if (!gotResult) setIsListening(false);
    };

    try {
      recognition.start();
    } catch (e) {
      setIsListening(false);
      alert("Could not start voice search. Please try again.");
    }
  };

  const stopVoiceSearch = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onend = null;
        recognitionRef.current.abort(); // ✅ abort() is more reliable than stop()
      } catch (e) {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  };

  const historyCount = suggestionData.history.length;
  const suggCount = suggestionData.items.length;

  return (
    <div className="navbar">
      {/* ── LEFT ── */}
      <div className="navbar-left">
        <div className="navbarHamberger" onClick={sideNavbarFunc}>
          <ListIcon sx={{ color: "white" }} />
        </div>

        {/* ✅ Logo with border + IN badge */}
        <Link
          to="/"
          className="navbar-logo-link"
          style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            textDecoration: "none",
            padding: "5px 5px 5px 5px",
            borderRadius: "12px",
            border: logoHovered
              ? "2px solid rgba(255, 0, 0, 1)"
              : "2px solid rgba(255, 255, 255, 0.6)",
            background: logoHovered
              ? "rgba(255, 0, 0, 0.12)"
              : "rgba(255, 255, 255, 0.05)",
            transition:
              "border-color 0.25s, background 0.25s, box-shadow 0.25s",
            boxShadow: logoHovered
              ? "0 0 12px rgba(255, 0, 0, 0.7), 0 0 24px rgba(255, 0, 0, 0.3)"
              : "0 0 8px rgba(255, 255, 255, 0.25), 0 0 2px rgba(255, 255, 255, 0.4)",
          }}
          onMouseEnter={() => setLogoHovered(true)}
          onMouseLeave={() => setLogoHovered(false)}
        >
          {/* SVG Logo icon */}
          <svg
            width="38"
            height="38"
            viewBox="0 0 42 42"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="42" height="42" rx="8" fill="#ff0000" />

            {/* Z letter */}
            <text
              x="50%"
              y="42%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="white"
              fontSize="22"
              fontWeight="bold"
              fontFamily="Arial"
            >
              Z
              <animate
                attributeName="opacity"
                values="1;0.2;1;0.5;1"
                dur="2s"
                repeatCount="indefinite"
              />
            </text>

            {/* ZIRCON text — bigger, brighter, better positioned */}
            <text
              x="50%"
              y="79%"
              dominantBaseline="middle"
              textAnchor="middle"
              fill="white"
              fontSize="8.3"
              fontWeight="700"
              fontFamily="Arial"
              letterSpacing="1.2"
              opacity="1"
            >
              ZIRCON
            </text>
          </svg>

          {/* Text + Country badge */}
          <div
            style={{
              display: "flex",
              alignItems: "flex-start",
              position: "relative",
            }}
          >
            <span
              key={logoKey}
              className="logoText"
              onClick={(e) => {
                e.preventDefault();
                const base =
                  window.location.origin + window.location.pathname + "#/";
                if (window.location.href === base) window.location.reload();
                else window.location.href = base;
              }}
              style={{ display: "inline-flex", alignItems: "center" }}
            >
              {"ZirconPlay".split("").map((char, i) => (
                <span
                  key={i}
                  className="logoChar"
                  style={{ animationDelay: `${i * 0.08}s` }}
                >
                  {char}
                </span>
              ))}
            </span>

            {/* ✅ Country badge — exactly like YouTube IN */}
            {countryCode && (
              <span
                style={{
                  fontSize: "9px",
                  fontWeight: "800",
                  color: "#ffffff",
                  background: "#cc0000",
                  border: "1.5px solid rgba(255,255,255,0.7)",
                  borderRadius: "3px",
                  padding: "1px 3px",
                  marginLeft: "2px",
                  marginTop: "1px",
                  letterSpacing: "0.04em",
                  lineHeight: 1.2,
                  flexShrink: 0,
                }}
              >
                {countryCode}
              </span>
            )}
          </div>
        </Link>
      </div>

      {/* ── MIDDLE ── */}
      <div
        className="navbar-middle"
        ref={dropdownRef}
        style={{ position: "relative" }}
      >
        <div
          className="navbar_searchBox"
          style={{
            position: "relative",
            transition: "box-shadow 0.2s",
            boxShadow: searchBarActive
              ? "0 0 0 2px rgba(62,166,255,0.35)"
              : "none",
            borderRadius:
              searchBarActive && showDropdown ? "20px 20px 0 0" : "20px",
          }}
        >
          <input
            ref={inputRef}
            type="text"
            placeholder="Search"
            className="navbar_searchBoxInput"
            value={searchQuery}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setSearchBarActive(true);
              if (searchQuery.trim())
                setSuggestionData(getSuggestions(searchQuery));
              else
                setSuggestionData({
                  items: [],
                  category: null,
                  trending: TRENDING_GLOBAL.slice(0, 4),
                  history: _searchHistory.slice(0, 3),
                });
              setShowDropdown(true);
            }}
            onBlur={() => setIsSearchFocused(false)}
            autoComplete="off"
          />

          {/* Clear button */}
          {searchQuery && (
            <div
              onMouseDown={(e) => {
                e.preventDefault();
                setSearchQuery("");
                setSuggestionData({
                  items: [],
                  category: null,
                  trending: TRENDING_GLOBAL.slice(0, 4),
                  history: _searchHistory.slice(0, 3),
                });
                setShowDropdown(true);
                inputRef.current?.focus();
              }}
              title="Clear search"
              style={{
                position: "absolute",
                right: "64px",
                top: "50%",
                transform: "translateY(-50%)",
                cursor: "pointer",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                background: "#444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 0.2s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "#666";
                e.currentTarget.style.transform =
                  "translateY(-50%) scale(1.15)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "#444";
                e.currentTarget.style.transform = "translateY(-50%) scale(1)";
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1 1L9 9M9 1L1 9"
                  stroke="white"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          {/* Search icon */}
          <div
            className="navbar_searchIconBox"
            onClick={() => doSearch(searchQuery)}
          >
            <PublicIcon
              sx={{
                fontSize: "28px",
                animation: isSearchFocused
                  ? "spinIcon 0.8s linear infinite"
                  : "none",
              }}
            />
          </div>
        </div>

        {/* Voice search */}
        <div
          className="navbar_mike"
          onClick={startVoiceSearch}
          title="Voice Search"
          style={{ cursor: "pointer" }}
        >
          <KeyboardVoiceIcon
            sx={{
              color: isListening ? "red" : "white",
              transition: "color 0.2s",
            }}
          />
        </div>

        {/* Suggestions Dropdown */}
        {showDropdown &&
          (suggestionData.history.length > 0 ||
            suggestionData.items.length > 0 ||
            suggestionData.trending.length > 0) && (
            <div
              style={{
                position: "absolute",
                top: "48px",
                left: 0,
                width: "calc(100% - 52px)",
                background: "#1e1e1e",
                borderRadius: "0 0 14px 14px",
                boxShadow: "0 12px 32px rgba(0,0,0,0.7)",
                zIndex: 9999,
                overflow: "hidden",
                border: "1px solid #333",
                borderTop: "none",
              }}
            >
              {suggestionData.category &&
                CATEGORY_LABELS[suggestionData.category] && (
                  <div
                    style={{
                      padding: "8px 14px 4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "11px",
                        color: "#aaa",
                        background: "#2a2a2a",
                        border: "1px solid #3a3a3a",
                        borderRadius: "12px",
                        padding: "2px 10px",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      {CATEGORY_LABELS[suggestionData.category]}
                      <span style={{ color: "#666" }}>suggestions</span>
                    </span>
                    <span style={{ fontSize: "11px", color: "#555" }}>
                      Tab → to autocomplete
                    </span>
                  </div>
                )}

              {suggestionData.history.length > 0 && (
                <>
                  <div
                    style={{
                      fontSize: "11px",
                      color: "#555",
                      padding: "8px 14px 4px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Recent
                  </div>
                  {suggestionData.history.map((h, i) => (
                    <div
                      key={`hist-${i}`}
                      onMouseDown={() => doSearch(h)}
                      onMouseEnter={() => setActiveIndex(i)}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        padding: "9px 14px",
                        cursor: "pointer",
                        background:
                          activeIndex === i ? "#2a2a2a" : "transparent",
                        transition: "background 0.15s",
                        color: "#ccc",
                        fontSize: "14px",
                      }}
                    >
                      <HistoryIcon sx={{ fontSize: "17px", color: "#555" }} />
                      <span>{h}</span>
                      <span
                        onMouseDown={(e) => {
                          e.stopPropagation();
                          _searchHistory = _searchHistory.filter(
                            (x) => x !== h,
                          );
                          setSuggestionData(getSuggestions(searchQuery));
                        }}
                        style={{
                          marginLeft: "auto",
                          color: "#444",
                          fontSize: "16px",
                          lineHeight: 1,
                          cursor: "pointer",
                          padding: "0 4px",
                        }}
                        title="Remove"
                      >
                        ×
                      </span>
                    </div>
                  ))}
                  {(suggestionData.items.length > 0 ||
                    suggestionData.trending.length > 0) && (
                    <div
                      style={{
                        height: "0.5px",
                        background: "#2a2a2a",
                        margin: "2px 0",
                      }}
                    />
                  )}
                </>
              )}

              {suggestionData.items.length > 0 && (
                <>
                  {!suggestionData.category && (
                    <div
                      style={{
                        fontSize: "11px",
                        color: "#555",
                        padding: "8px 14px 4px",
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                      }}
                    >
                      Suggestions
                    </div>
                  )}
                  {suggestionData.items.map((item, i) => {
                    const flatIdx = historyCount + i;
                    return (
                      <div
                        key={`sugg-${i}`}
                        onMouseDown={() => doSearch(item.text)}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "9px 14px",
                          cursor: "pointer",
                          background:
                            activeIndex === flatIdx ? "#2a2a2a" : "transparent",
                          transition: "background 0.15s",
                          color: "#ccc",
                          fontSize: "14px",
                        }}
                      >
                        <SearchIcon sx={{ fontSize: "17px", color: "#555" }} />
                        <span>
                          <span style={{ color: "white", fontWeight: "500" }}>
                            {item.displayQuery}
                          </span>{" "}
                          <span style={{ color: "#aaa" }}>
                            {item.displaySuffix}
                          </span>
                        </span>
                        <TagBadge tag={item.tag} />
                      </div>
                    );
                  })}
                </>
              )}

              {suggestionData.trending.length > 0 && (
                <>
                  <div
                    style={{
                      height: "0.5px",
                      background: "#2a2a2a",
                      margin: "4px 0",
                    }}
                  />
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "8px 14px 4px",
                      fontSize: "11px",
                      color: "#555",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    <WhatshotIcon sx={{ fontSize: "13px", color: "#ff7066" }} />
                    Trending now
                  </div>
                  {suggestionData.trending.map((t, i) => {
                    const flatIdx = historyCount + suggCount + i;
                    return (
                      <div
                        key={`trend-${i}`}
                        onMouseDown={() => doSearch(t)}
                        onMouseEnter={() => setActiveIndex(flatIdx)}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                          padding: "9px 14px",
                          cursor: "pointer",
                          background:
                            activeIndex === flatIdx ? "#2a2a2a" : "transparent",
                          transition: "background 0.15s",
                          color: "#ccc",
                          fontSize: "14px",
                        }}
                      >
                        <TrendingUpIcon
                          sx={{ fontSize: "17px", color: "#ff7066" }}
                        />
                        <span>{t}</span>
                        <span style={{ marginLeft: "auto", fontSize: "12px" }}>
                          🔥
                        </span>
                      </div>
                    );
                  })}
                </>
              )}

              {searchQuery.trim() && (
                <>
                  <div style={{ height: "0.5px", background: "#2a2a2a" }} />
                  <div
                    onMouseDown={() => doSearch(searchQuery)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "10px 14px",
                      cursor: "pointer",
                      color: "#3ea6ff",
                      fontSize: "13px",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#2a2a2a")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "transparent")
                    }
                  >
                    <PublicIcon sx={{ fontSize: "17px" }} />
                    Search for&nbsp;<strong>"{searchQuery}"</strong>&nbsp;across
                    all categories
                  </div>
                </>
              )}
            </div>
          )}
      </div>

      {/* ── RIGHT ── */}
      <div className="navbar-right">
        <span
          onClick={() => navigate("/local-player")}
          title="Local Player"
          style={{ cursor: "pointer" }}
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M18 4l2 4h-3l-2-4h-2l2 4h-3l-2-4H8l2 4H7L5 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V4h-4z" />
          </svg>
        </span>

        <span
          onClick={() =>
            navigate("/youtube", { state: { reload: Date.now() } })
          }
          style={{ cursor: "pointer" }}
        >
          <YouTubeIcon sx={{ fontSize: "30px", color: "red" }} />
        </span>

        <span
          onClick={() => navigate("/763/upload")}
          style={{ cursor: "pointer" }}
        >
          <VideoCameraFrontIcon sx={{ fontSize: "30px", color: "white" }} />
        </span>

        {/* Notifications */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <div
            onClick={() => setShowNotifications((prev) => !prev)}
            style={{ position: "relative", cursor: "pointer", display: "flex" }}
          >
            <NotificationsActiveIcon
              sx={{
                fontSize: "30px",
                color: showNotifications ? "#ff4444" : "white",
                transition: "color 0.2s",
                animation: unreadCount > 0 ? "bellShake 1.5s infinite" : "none",
              }}
            />
            {unreadCount > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  background: "red",
                  color: "white",
                  borderRadius: "50%",
                  fontSize: "10px",
                  fontWeight: "700",
                  width: "18px",
                  height: "18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px solid #0f0f0f",
                  animation: "badgePop 0.3s ease",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </div>

          {showNotifications && (
            <div
              style={{
                position: "absolute",
                top: "42px",
                right: "-10px",
                width: "360px",
                background: "#212121",
                borderRadius: "12px",
                boxShadow: "0 8px 32px rgba(0,0,0,0.8)",
                zIndex: 99999,
                border: "1px solid #333",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "14px 16px",
                  borderBottom: "1px solid #333",
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: "600",
                    fontSize: "16px",
                  }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span
                    onClick={markAllRead}
                    style={{
                      color: "#3ea6ff",
                      fontSize: "13px",
                      cursor: "pointer",
                      fontWeight: "500",
                    }}
                  >
                    Mark all as read
                  </span>
                )}
              </div>
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {notifications.map((n) => {
                  const { color, icon } = getNotifStyle(n.type);
                  return (
                    <div
                      key={n.id}
                      onClick={() => markOneRead(n.id)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: "12px",
                        padding: "12px 16px",
                        background: n.read
                          ? "transparent"
                          : "rgba(255,255,255,0.05)",
                        borderBottom: "1px solid #2a2a2a",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#2a2a2a")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = n.read
                          ? "transparent"
                          : "rgba(255,255,255,0.05)")
                      }
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "50%",
                          background: color,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: "700",
                          fontSize: "15px",
                          color: "white",
                          flexShrink: 0,
                        }}
                      >
                        {n.avatar}
                      </div>
                      <div style={{ flex: 1 }}>
                        <p
                          style={{
                            margin: 0,
                            color: n.read ? "#aaa" : "white",
                            fontSize: "13px",
                            lineHeight: "1.4",
                          }}
                        >
                          <span style={{ marginRight: "5px" }}>{icon}</span>
                          {n.message}
                        </p>
                        <span style={{ color: "#666", fontSize: "11px" }}>
                          {n.time}
                        </span>
                      </div>
                      {!n.read && (
                        <div
                          style={{
                            width: "8px",
                            height: "8px",
                            borderRadius: "50%",
                            background: "#3ea6ff",
                            flexShrink: 0,
                            marginTop: "4px",
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
              <div
                style={{
                  padding: "12px",
                  textAlign: "center",
                  borderTop: "1px solid #333",
                }}
              >
                <span
                  style={{
                    color: "#3ea6ff",
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setShowNotifications(false);
                    navigate("/notifications");
                  }}
                >
                  See all notifications
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Profile */}
        <img
          onClick={() => setNavbarModal((prev) => !prev)}
          src={userPic}
          alt="User"
          className="navbar-right-logo"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src =
              "https://ui-avatars.com/api/?name=User&background=444&color=fff&size=40";
          }}
        />
        {navbarModal && (
          <div className="navbar-modal">
            {currentUser && (
              <div
                style={{
                  padding: "10px 16px",
                  color: "#aaa",
                  fontSize: "12px",
                  borderBottom: "1px solid #333",
                  pointerEvents: "none",
                }}
              >
                @{currentUser}
              </div>
            )}
            <div className="navbar-modal-option" onClick={handleprofile}>
              Profile
            </div>
            <div
              className="navbar-modal-option"
              onClick={() => onclickOfPopUpOption("logout")}
            >
              Logout
            </div>
            <div
              className="navbar-modal-option"
              onClick={() => onclickOfPopUpOption("login")}
            >
              Login
            </div>
          </div>
        )}
      </div>

      {login && <Login setLoginModal={setLoginModal} />}

      {/* Voice overlay */}
      {isListening && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.75)",
            zIndex: 99999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "20px",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) stopVoiceSearch();
          }}
        >
          <div
            style={{
              background: "#212121",
              borderRadius: "20px",
              padding: "40px 60px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.9)",
              minWidth: "300px",
              maxWidth: "480px",
              width: "90%",
            }}
          >
            {/* Animated mic */}
            <div style={{ position: "relative" }}>
              <div
                style={{
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  background: "red",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  animation: "pulse 1.2s infinite",
                  zIndex: 1,
                  position: "relative",
                }}
              >
                <KeyboardVoiceIcon sx={{ fontSize: "40px", color: "white" }} />
              </div>
              {/* Ripple rings */}
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,0,0,0.4)",
                  animation: "ripple 1.5s infinite",
                  zIndex: 0,
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  width: "80px",
                  height: "80px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,0,0,0.2)",
                  animation: "ripple 1.5s infinite 0.5s",
                  zIndex: 0,
                }}
              />
            </div>

            <p
              style={{
                color: "white",
                fontSize: "20px",
                fontWeight: "600",
                margin: 0,
              }}
            >
              Listening...
            </p>
            <p style={{ color: "#aaa", fontSize: "13px", margin: 0 }}>
              Speak now — say what you want to search
            </p>

            {/* Live transcript */}
            {searchQuery && (
              <div
                style={{
                  background: "#2a2a2a",
                  borderRadius: "10px",
                  padding: "10px 16px",
                  width: "100%",
                  textAlign: "center",
                  color: "#3ea6ff",
                  fontSize: "15px",
                  fontWeight: "500",
                  minHeight: "40px",
                  border: "1px solid #3a3a3a",
                }}
              >
                "{searchQuery}"
              </div>
            )}

            {/* Language selector */}
            <select
              onChange={(e) => {
                if (recognitionRef.current)
                  recognitionRef.current.lang = e.target.value;
              }}
              defaultValue="en-IN"
              style={{
                background: "#2a2a2a",
                border: "1px solid #444",
                color: "#aaa",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                cursor: "pointer",
                width: "100%",
              }}
            >
              <option value="en-IN">🇮🇳 English (India)</option>
              <option value="en-US">🇺🇸 English (US)</option>
              <option value="hi-IN">🇮🇳 Hindi</option>
              <option value="en-GB">🇬🇧 English (UK)</option>
              <option value="mr-IN">🇮🇳 Marathi</option>
              <option value="ta-IN">🇮🇳 Tamil</option>
              <option value="te-IN">🇮🇳 Telugu</option>
              <option value="bn-IN">🇮🇳 Bengali</option>
            </select>

            <button
              onClick={stopVoiceSearch}
              style={{
                marginTop: "4px",
                padding: "10px 32px",
                borderRadius: "10px",
                border: "1px solid #555",
                background: "#333",
                color: "white",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
                width: "100%",
                transition: "background 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#444")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "#333")}
            >
              ✕ Cancel
            </button>
          </div>

          {/* Ripple animation */}
          <style>{`
      @keyframes ripple {
        0%   { transform: translate(-50%,-50%) scale(1); opacity: 1; }
        100% { transform: translate(-50%,-50%) scale(2.5); opacity: 0; }
      }
    `}</style>
        </div>
      )}
    </div>
  );
};

export default Navbar;
