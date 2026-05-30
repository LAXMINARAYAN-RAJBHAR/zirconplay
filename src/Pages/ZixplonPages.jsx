// ─────────────────────────────────────────────────────────────
// Zixplon Legal & Info Pages
// Usage: Add each component to your React Router routes
// All pages match your existing dark theme (black bg, red accent)
// ─────────────────────────────────────────────────────────────

import React, { useEffect } from "react";
import { Link } from "react-router-dom";

// ── Shared styles ──────────────────────────────────────────────
const pageStyle = {
  minHeight: "100vh",
  background: "#0f0f0f",
  color: "#e0e0e0",
  fontFamily: "'Segoe UI', sans-serif",
  padding: "80px 20px 60px",
};

const containerStyle = {
  maxWidth: "860px",
  margin: "0 auto",
};

const headingStyle = {
  fontSize: "32px",
  fontWeight: "800",
  color: "#ffffff",
  marginBottom: "6px",
  letterSpacing: "-0.5px",
};

const redBar = {
  width: "48px",
  height: "4px",
  background: "#ff0000",
  borderRadius: "2px",
  marginBottom: "32px",
};

const sectionTitle = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#ffffff",
  marginTop: "36px",
  marginBottom: "10px",
};

const para = {
  fontSize: "15px",
  lineHeight: "1.8",
  color: "#b0b0b0",
  marginBottom: "14px",
};

const card = {
  background: "#1a1a1a",
  border: "1px solid #2a2a2a",
  borderRadius: "12px",
  padding: "20px 24px",
  marginBottom: "16px",
};

const metaLine = {
  fontSize: "13px",
  color: "#555",
  marginBottom: "28px",
};

const BackBtn = () => (
  <Link
    to="/"
    style={{
      display: "inline-flex",
      alignItems: "center",
      gap: "6px",
      color: "#ff4444",
      fontSize: "13px",
      textDecoration: "none",
      marginBottom: "28px",
      fontWeight: "600",
    }}
  >
    ← Back to Zixplon
  </Link>
);

// ══════════════════════════════════════════════════════════════
// 1. ABOUT US
// Route: /about
// ══════════════════════════════════════════════════════════════
export const AboutPage = () => {
  useEffect(() => {
    document.title = "About Us — Zixplon";
  }, []);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <BackBtn />
        <h1 style={headingStyle}>About Zixplon</h1>
        <div style={redBar} />
        <p style={para}>
          Zixplon is an Indian video-sharing platform built for creators and
          viewers who want a free, open, and community-driven space to share
          stories, skills, entertainment, and ideas — without barriers.
        </p>

        <div style={card}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🎯</div>
          <div style={{ ...sectionTitle, marginTop: 0 }}>Our Mission</div>
          <p style={para}>
            To give every creator — big or small — a powerful platform to
            upload, share, and grow their audience, while giving viewers a rich
            library of content from across India and the world.
          </p>
        </div>

        <div style={card}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🚀</div>
          <div style={{ ...sectionTitle, marginTop: 0 }}>What We Offer</div>
          <ul style={{ ...para, paddingLeft: "20px" }}>
            <li>Upload and stream videos & reels (Shorts)</li>
            <li>Subscribe to your favourite creators</li>
            <li>Like, comment, and share content</li>
            <li>Voice search and smart suggestions</li>
            <li>Notifications for new uploads and interactions</li>
            <li>Local video player for offline files</li>
          </ul>
        </div>

        <div style={card}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>🇮🇳</div>
          <div style={{ ...sectionTitle, marginTop: 0 }}>Made in India</div>
          <p style={para}>
            Zixplon is proudly built and operated in India. We are committed to
            supporting Indian creators, regional languages, and local content
            that reflects the diversity of our country.
          </p>
        </div>

        <div style={card}>
          <div style={{ fontSize: "28px", marginBottom: "8px" }}>📬</div>
          <div style={{ ...sectionTitle, marginTop: 0 }}>Get in Touch</div>
          <p style={{ ...para, marginBottom: 0 }}>
            Have questions or want to partner with us?{" "}
            <Link to="/contact" style={{ color: "#ff4444" }}>
              Contact our support team
            </Link>{" "}
            or visit our{" "}
            <Link to="/help" style={{ color: "#ff4444" }}>
              Help & FAQ
            </Link>{" "}
            page.
          </p>
        </div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// 2. PRIVACY POLICY
// Route: /privacy-policy
// ══════════════════════════════════════════════════════════════
export const PrivacyPolicyPage = () => {
  useEffect(() => {
    document.title = "Privacy Policy — Zixplon";
  }, []);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <BackBtn />
        <h1 style={headingStyle}>Privacy Policy</h1>
        <div style={redBar} />
        <p style={metaLine}>Last updated: June 2025 · Effective immediately</p>

        <p style={para}>
          At Zixplon, we take your privacy seriously. This Privacy Policy
          explains what data we collect, how we use it, and your rights
          regarding your personal information.
        </p>

        <div style={sectionTitle}>1. Information We Collect</div>
        <p style={para}>We collect the following types of information:</p>
        <ul style={{ ...para, paddingLeft: "20px" }}>
          <li>
            <strong style={{ color: "#fff" }}>Account information:</strong>{" "}
            Username, email address, and profile picture when you register.
          </li>
          <li>
            <strong style={{ color: "#fff" }}>Content you upload:</strong>{" "}
            Videos, thumbnails, titles, descriptions, and comments.
          </li>
          <li>
            <strong style={{ color: "#fff" }}>Usage data:</strong> Pages
            visited, videos watched, search queries, likes, and subscriptions.
          </li>
          <li>
            <strong style={{ color: "#fff" }}>Device information:</strong>{" "}
            Browser type, operating system, IP address, and approximate
            location (country).
          </li>
        </ul>

        <div style={sectionTitle}>2. How We Use Your Information</div>
        <ul style={{ ...para, paddingLeft: "20px" }}>
          <li>To provide and improve our platform services</li>
          <li>To personalise your content recommendations</li>
          <li>To send notifications about your account and activity</li>
          <li>To detect and prevent abuse, spam, and illegal content</li>
          <li>To comply with legal obligations under Indian law</li>
        </ul>

        <div style={sectionTitle}>3. Data Storage</div>
        <p style={para}>
          Your data is stored securely using Supabase (PostgreSQL). We do not
          sell your personal data to third parties. Data may be stored on
          servers outside India but is protected under equivalent data
          protection standards.
        </p>

        <div style={sectionTitle}>4. Cookies</div>
        <p style={para}>
          We use browser localStorage to keep you logged in and remember your
          preferences. We may use analytics cookies in the future, which will
          be disclosed in an updated policy.
        </p>

        <div style={sectionTitle}>5. Third-Party Services</div>
        <p style={para}>
          We use the following third-party services that may access your data:
        </p>
        <ul style={{ ...para, paddingLeft: "20px" }}>
          <li>Supabase — database and authentication</li>
          <li>Vercel — hosting and deployment</li>
          <li>DiceBear / UI Avatars — profile picture generation</li>
          <li>ipapi.co / ipwho.is — country detection (no data stored)</li>
        </ul>

        <div style={sectionTitle}>6. Your Rights</div>
        <ul style={{ ...para, paddingLeft: "20px" }}>
          <li>Request access to the data we hold about you</li>
          <li>Request correction or deletion of your account data</li>
          <li>Withdraw consent at any time by deleting your account</li>
          <li>
            Lodge a complaint with India's data protection authority if needed
          </li>
        </ul>

        <div style={sectionTitle}>7. Children's Privacy</div>
        <p style={para}>
          Zixplon is not intended for users under the age of 13. We do not
          knowingly collect data from children. If you believe a child has
          registered, please contact us immediately.
        </p>

        <div style={sectionTitle}>8. Changes to This Policy</div>
        <p style={para}>
          We may update this Privacy Policy from time to time. We will notify
          registered users of significant changes via the notifications system.
          Continued use of Zixplon after changes means you accept the updated
          policy.
        </p>

        <div style={sectionTitle}>9. Contact</div>
        <p style={para}>
          For privacy-related concerns, please use our{" "}
          <Link to="/contact" style={{ color: "#ff4444" }}>
            Contact Support
          </Link>{" "}
          page.
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// 3. DMCA / COPYRIGHT POLICY
// Route: /dmca
// ══════════════════════════════════════════════════════════════
export const DmcaPage = () => {
  useEffect(() => {
    document.title = "DMCA & Copyright Policy — Zixplon";
  }, []);

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <BackBtn />
        <h1 style={headingStyle}>DMCA & Copyright Policy</h1>
        <div style={redBar} />
        <p style={metaLine}>Last updated: June 2025</p>

        <p style={para}>
          Zixplon respects the intellectual property rights of others and
          expects users of our platform to do the same. We comply with the
          Digital Millennium Copyright Act (DMCA) and Indian copyright law
          under the Copyright Act, 1957.
        </p>

        <div style={sectionTitle}>1. Prohibited Content</div>
        <p style={para}>
          You may not upload content that you do not own or have explicit
          permission to share, including:
        </p>
        <ul style={{ ...para, paddingLeft: "20px" }}>
          <li>Movies, TV shows, or web series clips without authorisation</li>
          <li>Copyrighted music used without a licence</li>
          <li>
            Content belonging to other YouTube/Zixplon creators without credit
            or permission
          </li>
          <li>News broadcast clips, sports footage, or live event recordings</li>
        </ul>

        <div style={sectionTitle}>2. How to File a Copyright Complaint</div>
        <p style={para}>
          If you believe your copyrighted work has been uploaded to Zixplon
          without your permission, please submit a takedown request with the
          following information:
        </p>
        <div style={card}>
          <ul style={{ ...para, marginBottom: 0, paddingLeft: "20px" }}>
            <li>Your full legal name and contact details</li>
            <li>
              A description of the copyrighted work you claim has been infringed
            </li>
            <li>The URL of the infringing content on Zixplon</li>
            <li>
              A statement that you have a good faith belief the use is not
              authorised
            </li>
            <li>
              A statement that the information in your notice is accurate and
              that you are the copyright owner or authorised to act on their
              behalf
            </li>
            <li>Your physical or electronic signature</li>
          </ul>
        </div>
        <p style={para}>
          Send takedown requests via our{" "}
          <Link to="/contact" style={{ color: "#ff4444" }}>
            Contact Support
          </Link>{" "}
          page with the subject line <strong>"DMCA Takedown Request"</strong>.
        </p>

        <div style={sectionTitle}>3. Counter-Notification</div>
        <p style={para}>
          If you believe your content was removed in error, you may file a
          counter-notification. We will restore the content within 10–14
          business days unless the complainant files a court action.
        </p>

        <div style={sectionTitle}>4. Repeat Infringers</div>
        <p style={para}>
          Zixplon has a strict repeat-infringer policy. Accounts that repeatedly
          upload infringing content will be permanently suspended without
          warning.
        </p>

        <div style={sectionTitle}>5. Fair Use</div>
        <p style={para}>
          Commentary, criticism, education, and parody may qualify as fair use
          under applicable law. We evaluate such claims on a case-by-case basis
          and do not automatically remove content flagged by rights holders
          without review.
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// 4. COMMUNITY GUIDELINES
// Route: /community-guidelines
// ══════════════════════════════════════════════════════════════
export const CommunityGuidelinesPage = () => {
  useEffect(() => {
    document.title = "Community Guidelines — Zixplon";
  }, []);

  const rule = (emoji, title, desc) => (
    <div style={card} key={title}>
      <div style={{ display: "flex", alignItems: "flex-start", gap: "14px" }}>
        <span style={{ fontSize: "26px", flexShrink: 0 }}>{emoji}</span>
        <div>
          <div
            style={{ fontWeight: "700", color: "#fff", marginBottom: "6px" }}
          >
            {title}
          </div>
          <p style={{ ...para, marginBottom: 0 }}>{desc}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <BackBtn />
        <h1 style={headingStyle}>Community Guidelines</h1>
        <div style={redBar} />
        <p style={para}>
          Zixplon is a place for everyone. To keep it safe, respectful, and
          enjoyable, all users and creators must follow these guidelines. Violations
          may result in content removal, account suspension, or a permanent ban.
        </p>

        <div style={sectionTitle}>✅ What's Allowed</div>
        {rule(
          "🎬",
          "Original Content",
          "Upload videos, reels, and shorts that you created or have full rights to share.",
        )}
        {rule(
          "💬",
          "Constructive Discussion",
          "Comment, debate, and engage — as long as it's respectful and on-topic.",
        )}
        {rule(
          "🎵",
          "Creative Expression",
          "Music, comedy, education, gaming, travel, cooking — all genres are welcome.",
        )}

        <div style={sectionTitle}>❌ What's Not Allowed</div>
        {rule(
          "🚫",
          "Hate Speech & Harassment",
          "Content that attacks people based on religion, caste, gender, race, or sexual orientation is strictly prohibited.",
        )}
        {rule(
          "🔞",
          "Adult or Explicit Content",
          "No pornographic, sexually explicit, or nudity-based content. This is a platform for all ages.",
        )}
        {rule(
          "💀",
          "Violence & Dangerous Acts",
          "Do not upload graphic violence, self-harm, terrorism, or content that encourages dangerous behaviour.",
        )}
        {rule(
          "📋",
          "Misinformation & Fake News",
          "Do not spread false medical, political, or factual information that could cause harm to individuals or communities.",
        )}
        {rule(
          "©️",
          "Copyright Infringement",
          "Do not upload content you do not own. See our DMCA Policy for details.",
        )}
        {rule(
          "🤖",
          "Spam & Fake Engagement",
          "No bots, fake views, fake subscribers, or comment spam. We actively detect and remove artificial engagement.",
        )}
        {rule(
          "👶",
          "Child Safety",
          "Any content that exploits, endangers, or is inappropriate for minors will result in an immediate permanent ban and may be reported to authorities.",
        )}

        <div style={sectionTitle}>Enforcement</div>
        <p style={para}>
          Our team reviews reported content manually. Strikes work as follows:
        </p>
        <ul style={{ ...para, paddingLeft: "20px" }}>
          <li>
            <strong style={{ color: "#fff" }}>1st strike:</strong> Content
            removed, warning issued
          </li>
          <li>
            <strong style={{ color: "#fff" }}>2nd strike:</strong> Upload
            privileges suspended for 7 days
          </li>
          <li>
            <strong style={{ color: "#fff" }}>3rd strike:</strong> Permanent
            account ban
          </li>
        </ul>
        <p style={para}>
          Use the{" "}
          <Link to="/report" style={{ color: "#ff4444" }}>
            Report a Problem
          </Link>{" "}
          feature to flag content that violates these guidelines.
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// 5. ADVERTISE WITH US
// Route: /advertise
// ══════════════════════════════════════════════════════════════
export const AdvertisePage = () => {
  useEffect(() => {
    document.title = "Advertise With Us — Zixplon";
  }, []);

  const adOption = (icon, title, desc, price) => (
    <div
      style={{
        ...card,
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        borderLeft: "3px solid #ff0000",
      }}
      key={title}
    >
      <div style={{ fontSize: "24px" }}>{icon}</div>
      <div style={{ fontWeight: "700", color: "#fff", fontSize: "16px" }}>
        {title}
      </div>
      <p style={{ ...para, marginBottom: "4px" }}>{desc}</p>
      {price && (
        <span
          style={{
            fontSize: "12px",
            color: "#ff7066",
            fontWeight: "600",
            background: "rgba(255,112,102,0.1)",
            padding: "3px 10px",
            borderRadius: "20px",
            width: "fit-content",
          }}
        >
          {price}
        </span>
      )}
    </div>
  );

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <BackBtn />
        <h1 style={headingStyle}>Advertise With Us</h1>
        <div style={redBar} />
        <p style={para}>
          Reach a growing audience of engaged Indian viewers and content
          creators on Zixplon. We offer flexible advertising options for brands
          of all sizes — from local businesses to national campaigns.
        </p>

        <div
          style={{
            ...card,
            background: "rgba(255,0,0,0.07)",
            border: "1px solid rgba(255,0,0,0.2)",
            marginBottom: "32px",
          }}
        >
          <p style={{ ...para, marginBottom: 0, color: "#ffaaaa" }}>
            🚀 <strong>Early Partner Advantage:</strong> Brands that partner
            with Zixplon now get premium placement at introductory rates before
            we launch our full ad platform.
          </p>
        </div>

        <div style={sectionTitle}>Advertising Options</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          {adOption(
            "🎬",
            "Pre-Roll Video Ads",
            "5–15 second ads that play before videos start. High visibility, high recall.",
            "Contact for pricing",
          )}
          {adOption(
            "🖼️",
            "Banner Display Ads",
            "Static or animated banners shown across the homepage, video pages, and reels.",
            "Contact for pricing",
          )}
          {adOption(
            "📌",
            "Sponsored Content",
            "Your brand's video promoted at the top of search results and the homepage feed.",
            "Contact for pricing",
          )}
          {adOption(
            "🎙️",
            "Creator Partnerships",
            "We connect you directly with Zixplon creators for product integrations and shoutouts.",
            "Contact for pricing",
          )}
        </div>

        <div style={sectionTitle}>Why Advertise on Zixplon?</div>
        <ul style={{ ...para, paddingLeft: "20px" }}>
          <li>Growing Indian audience with high engagement</li>
          <li>Targeted by category: Music, Gaming, Sports, Tech, News & more</li>
          <li>Real viewers — no bot traffic</li>
          <li>Affordable rates compared to established platforms</li>
          <li>Direct communication with our team — no middlemen</li>
        </ul>

        <div style={sectionTitle}>Get Started</div>
        <p style={para}>
          To discuss advertising opportunities, please reach out via our{" "}
          <Link to="/contact" style={{ color: "#ff4444" }}>
            Contact Support
          </Link>{" "}
          page with the subject line{" "}
          <strong>"Advertising Enquiry"</strong> and include your brand name,
          budget range, and target audience.
        </p>
        <p style={{ ...para, color: "#555" }}>
          We typically respond within 48 hours on business days.
        </p>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════
// 6. REPORT A PROBLEM  (enhanced version of your existing page)
// Route: /report
// ══════════════════════════════════════════════════════════════
export const ReportPage = () => {
  useEffect(() => {
    document.title = "Report a Problem — Zixplon";
  }, []);

  const [type, setType] = React.useState("");
  const [url, setUrl] = React.useState("");
  const [desc, setDesc] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  const inputStyle = {
    width: "100%",
    background: "#1a1a1a",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#e0e0e0",
    fontSize: "14px",
    padding: "12px 14px",
    marginBottom: "16px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "'Segoe UI', sans-serif",
  };

  const handleSubmit = () => {
    if (!type || !desc.trim()) return;
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div style={pageStyle}>
        <div style={{ ...containerStyle, textAlign: "center", paddingTop: "60px" }}>
          <div style={{ fontSize: "56px", marginBottom: "16px" }}>✅</div>
          <h2 style={{ color: "#fff", fontSize: "24px", marginBottom: "10px" }}>
            Report Submitted
          </h2>
          <p style={{ ...para, maxWidth: "400px", margin: "0 auto 24px" }}>
            Thank you for helping keep Zixplon safe. Our team will review your
            report within 24–48 hours.
          </p>
          <Link
            to="/"
            style={{
              background: "#ff0000",
              color: "#fff",
              padding: "10px 28px",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={pageStyle}>
      <div style={containerStyle}>
        <BackBtn />
        <h1 style={headingStyle}>Report a Problem</h1>
        <div style={redBar} />
        <p style={para}>
          See something that violates our{" "}
          <Link to="/community-guidelines" style={{ color: "#ff4444" }}>
            Community Guidelines
          </Link>
          ? Report it here and our team will review it promptly.
        </p>

        <div style={card}>
          <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "6px" }}>
            Report Type *
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            style={{ ...inputStyle, cursor: "pointer" }}
          >
            <option value="">Select a category...</option>
            <option value="spam">Spam or misleading content</option>
            <option value="hate">Hate speech or harassment</option>
            <option value="violence">Violence or dangerous acts</option>
            <option value="adult">Adult or explicit content</option>
            <option value="copyright">Copyright infringement</option>
            <option value="misinformation">Misinformation / Fake news</option>
            <option value="child">Child safety concern</option>
            <option value="bug">Technical bug or error</option>
            <option value="other">Other</option>
          </select>

          <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "6px" }}>
            URL of the content (optional)
          </label>
          <input
            type="text"
            placeholder="https://zixplon-tawny.vercel.app/..."
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={inputStyle}
          />

          <label style={{ color: "#aaa", fontSize: "13px", display: "block", marginBottom: "6px" }}>
            Describe the problem *
          </label>
          <textarea
            placeholder="Please describe the issue in detail..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={5}
            style={{ ...inputStyle, resize: "vertical", marginBottom: "20px" }}
          />

          <button
            onClick={handleSubmit}
            disabled={!type || !desc.trim()}
            style={{
              background: type && desc.trim() ? "#ff0000" : "#333",
              color: type && desc.trim() ? "#fff" : "#666",
              border: "none",
              borderRadius: "8px",
              padding: "12px 32px",
              fontSize: "14px",
              fontWeight: "700",
              cursor: type && desc.trim() ? "pointer" : "not-allowed",
              transition: "background 0.2s",
            }}
          >
            Submit Report
          </button>
        </div>

        <p style={{ ...para, color: "#444", fontSize: "13px", marginTop: "16px" }}>
          For urgent copyright issues, please visit our{" "}
          <Link to="/dmca" style={{ color: "#ff4444" }}>
            DMCA page
          </Link>
          .
        </p>
      </div>
    </div>
  );
};