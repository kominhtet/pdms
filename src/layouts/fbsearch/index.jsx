// src/layouts/overview/index.jsx
import React from "react";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import { ThumbsUp, MessageCircle, Share2 } from "lucide-react";
/* eslint-disable react/prop-types */

// ---- INLINE SocialSearchUI (compact) ----
function SocialSearchUI() {
  const [query, setQuery] = React.useState("Poe Mamhe Thar");
  const people = MOCK_PEOPLE;
  const posts = MOCK_POSTS;

  return (
    <div style={{ minHeight: "100vh", color: "#e2e8f0", position: "relative" }}>
      {/* Aura bg */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.3,
          background:
            "radial-gradient(70vmax 70vmax at 20% 20%, #38bdf8 0%, transparent 45%), radial-gradient(60vmax 50vmax at 90% 10%, #8b5cf6 0%, transparent 50%)",
          zIndex: -1,
        }}
      />
      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "24px 16px" }}>
        {/* Search */}
        <div
          style={{
            position: "sticky",
            top: 16,
            zIndex: 10,
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: 12,
            borderRadius: 16,
            background: "rgba(255, 255, 255, 0.1)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            backdropFilter: "blur(15px)",
          }}
        >
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: 8,
              alignItems: "center",
              padding: "10px 12px",
              borderRadius: 12,
              background: "rgba(0, 0, 0, 0.35)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              backdropFilter: "blur(12px)",
            }}
          >
            <span style={{ opacity: 0.7 }}>🔎</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              style={{
                width: "100%",
                background: "transparent",
                border: "none",
                outline: "none",
                color: "inherit",
              }}
            />
          </div>
          <button
            style={{
              padding: "8px 14px",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.3)",
              background: "rgba(255, 255, 255, 0.1)",
              backdropFilter: "blur(10px)",
              color: "#e2e8f0",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
              e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
              e.currentTarget.style.border = "1px solid rgba(255, 255, 255, 0.3)";
            }}
          >
            Search
          </button>
        </div>

        {/* Body grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: 24,
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "280px 1fr",
              gap: 24,
            }}
          >
            {/* People */}
            <aside>
              <div
                style={{
                  position: "sticky",
                  top: 96,
                  borderRadius: 16,
                  background: "rgba(255, 255, 255, 0.1)",
                  border: "1px solid rgba(255, 255, 255, 0.2)",
                  boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
                  backdropFilter: "blur(15px)",
                  padding: 16,
                }}
              >
                <h4
                  style={{
                    margin: 0,
                    marginBottom: 12,
                    fontSize: 12,
                    letterSpacing: 0.6,
                    color: "#cbd5e1",
                  }}
                >
                  People
                </h4>
                <ul
                  style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    maxHeight: "70vh",
                    overflow: "auto",
                  }}
                >
                  {people.map((p) => (
                    <li
                      key={p.id}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        padding: "8px 10px",
                        borderRadius: 12,
                        cursor: "pointer",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")
                      }
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <Avatar name={p.name} src={p.photo} />
                      <span style={{ fontSize: 14, color: "#e2e8f0" }}>{p.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Posts */}
            <main>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 24,
                }}
              >
                {posts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {/* Pagination */}
              <div style={{ marginTop: 24, display: "flex", justifyContent: "center", gap: 8 }}>
                <PageButton>{"‹"}</PageButton>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <PageNumber key={n} number={n} active={n === 1} />
                ))}
                <PageButton>{"›"}</PageButton>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}

function Avatar({ name, src }) {
  const initials = name
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("");
  return (
    <div style={{ position: "relative" }}>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "9999px",
          border: "2px solid rgba(255,255,255,.2)",
          overflow: "hidden",
          background: "#334155",
          display: "grid",
          placeItems: "center",
          fontWeight: 600,
          fontSize: 12,
        }}
      >
        {src ? (
          <img alt={name} src={src} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : (
          initials
        )}
      </div>
      <span
        style={{
          position: "absolute",
          right: -2,
          bottom: -2,
          width: 10,
          height: 10,
          background: "#34d399",
          borderRadius: "9999px",
          border: "2px solid #0f172a",
          display: "block",
        }}
      />
    </div>
  );
}

function PostCard({ post }) {
  return (
    <article
      style={{
        background: "rgba(255, 255, 255, 0.1)",
        color: "#e2e8f0",
        border: "1px solid rgba(255, 255, 255, 0.2)",
        borderRadius: 16,
        overflow: "hidden",
        boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)",
        backdropFilter: "blur(15px)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", gap: 12, alignItems: "center", padding: 16 }}>
        <Avatar name={post.author} src={post.authorPhoto} />
        <div style={{ lineHeight: 1.2 }}>
          <div style={{ fontWeight: 700, color: "#e2e8f0" }}>{post.author}</div>
          <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.7)" }}>{post.time}</div>
        </div>
      </div>

      {/* Text */}
      {post.text && (
        <p style={{ padding: "0 16px 12px", color: "rgba(255, 255, 255, 0.9)", fontSize: 14 }}>
          {post.text}
        </p>
      )}

      {/* Media */}
      {post.media?.length > 0 && <MediaGrid items={post.media} />}

      {/* Action bar with icons + numbers */}
      <div
        style={{
          marginTop: "auto",
          borderTop: "1px solid rgba(255, 255, 255, 0.2)",
          background: "rgba(0, 0, 0, 0.2)",
          backdropFilter: "blur(10px)",
          padding: "10px 16px",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <ActionStat
          icon={<ThumbsUp size={18} />}
          label="Like"
          count={post.reactions}
          color="#2563eb"
        />
        <ActionStat
          icon={<MessageCircle size={18} />}
          label="Comment"
          count={post.comments}
          color="#16a34a"
        />
        <ActionStat icon={<Share2 size={18} />} label="Share" count={post.shares} color="#7c3aed" />
      </div>
    </article>
  );
}

function MediaGrid({ items }) {
  // 1 image → full video-style block
  if (items.length === 1) {
    return (
      <div style={{ padding: "0 16px 16px" }}>
        <MediaItem item={items[0]} ratio="56.25%" />
      </div>
    );
  }

  // 2 images → simple two-column
  if (items.length === 2) {
    return (
      <div style={{ padding: "0 16px 16px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          <MediaItem item={items[0]} ratio="100%" />
          <MediaItem item={items[1]} ratio="100%" />
        </div>
      </div>
    );
  }

  // 3 or more → show first three; put "+N" overlay on the 3rd tile
  const extra = items.length - 3;
  const visible = items.slice(0, 3);

  return (
    <div style={{ padding: "0 16px 16px" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gridTemplateRows: "1fr 1fr",
          gap: 8,
        }}
      >
        {/* Left: big first image spanning two rows */}
        <div style={{ gridRow: "1 / span 2" }}>
          <MediaItem item={visible[0]} ratio="100%" />
        </div>

        {/* Top-right: second image */}
        <MediaItem item={visible[1]} ratio="49%" />

        {/* Bottom-right: third image with +N overlay if extra > 0 */}
        <div style={{ position: "relative" }}>
          <MediaItem item={visible[2]} ratio="49%" />
          {extra > 0 && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontWeight: 700,
                fontSize: 20,
                background: "rgba(0,0,0,.45)",
                borderRadius: 12,
              }}
            >
              +{extra}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MediaItem({ item, ratio }) {
  return (
    <div style={{ width: "100%", borderRadius: 12, overflow: "hidden", background: "#e2e8f0" }}>
      <div style={{ position: "relative", paddingTop: ratio }}>
        <img
          src={item.src}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />
      </div>
    </div>
  );
}

function Bubble({ children, color = "#0ea5e9", offset = false }) {
  return (
    <span
      style={{
        display: "inline-grid",
        placeItems: "center",
        width: 20,
        height: 20,
        fontSize: 12,
        color: "white",
        background: color,
        borderRadius: "9999px",
        border: "2px solid white",
        marginLeft: offset ? -6 : 0,
      }}
    >
      {children}
    </span>
  );
}

function ActionStat({ icon, label, count, color }) {
  return (
    <button
      style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        background: "transparent",
        border: "none",
        borderRadius: 10,
        color: "rgba(255, 255, 255, 0.8)",
        fontWeight: 600,
        cursor: "pointer",
        padding: "8px 0",
        transition: "0.2s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
        e.currentTarget.style.color = color;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "rgba(255, 255, 255, 0.8)";
      }}
    >
      {icon}
      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
        {formatNumber(count)} <span>{label}</span>
      </span>
    </button>
  );
}

function PageNumber({ number, active }) {
  return (
    <button
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        fontWeight: 700,
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: active
          ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          : "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        color: active ? "#fff" : "rgba(255, 255, 255, 0.9)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
        }
      }}
      onMouseLeave={(e) => {
        if (!active) {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
        }
      }}
    >
      {number}
    </button>
  );
}
function PageButton({ children }) {
  return (
    <button
      style={{
        width: 36,
        height: 36,
        borderRadius: 10,
        border: "1px solid rgba(255, 255, 255, 0.2)",
        background: "rgba(255, 255, 255, 0.1)",
        backdropFilter: "blur(10px)",
        color: "rgba(255, 255, 255, 0.9)",
        transition: "all 0.3s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.15)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
      }}
    >
      {children}
    </button>
  );
}

function formatNumber(n) {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(n);
}

// ---- Mock data (replace with API) ----
const PIC = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=800&q=60`;
const MOCK_PEOPLE = [
  { id: 1, name: "Poe Mamhe Thar", photo: PIC("1507003211169-0a1dd7228f2d") },
  { id: 2, name: "Poe Mamhe Thar", photo: PIC("1527980965255-d3b416303d12") },
  { id: 3, name: "Poe Mamhe Thar", photo: PIC("1527980965255-d3b416303d13") },
  { id: 4, name: "Poe Mamhe", photo: PIC("1527980965255-d3b416303d14") },
  { id: 5, name: "Poe Mamhe Thaw", photo: PIC("1527980965255-d3b416303d15") },
  { id: 6, name: "Poe Mamhe Tharr", photo: PIC("1527980965255-d3b416303d16") },
  { id: 7, name: "Poe Ma mhe Thar", photo: PIC("1527980965255-d3b416303d17") },
  { id: 8, name: "Poe Ma mhee Thar", photo: PIC("1527980965255-d3b416303d18") },
  { id: 9, name: "Poe Mamhe Thar fan", photo: PIC("1527980965255-d3b416303d19") },
  { id: 10, name: "Poe Mamhe Thar fan", photo: PIC("1527980965255-d3b416303d20") },
];

const MOCK_POSTS = [
  {
    id: 101,
    author: "Poe Mamhe Thar",
    authorPhoto: PIC("1519345182560-3f2917c472ef"),
    time: "2h • Mandalay",
    text: "fine golden hours in Mandalay",
    media: [
      { src: PIC("1516734212186-a967f20dcb6a") },
      { src: PIC("1460353581641-37baddab0fa2") },
      { src: PIC("1520975979642-6453be3f7070") },
      { src: PIC("1520975614159-2f51f1f5a9f9") },
    ],
    reactions: 3800,
    comments: 71,
    shares: 17,
  },
  {
    id: 102,
    author: "Poe Mamhe Thar",
    authorPhoto: PIC("1519345182560-3f2917c472ef"),
    time: "5h • Yangon",
    text: "At the moment when everything in life comes to a standstill…",
    media: [{ src: PIC("1524504388940-b1c1722653e1") }],
    reactions: 3800,
    comments: 71,
    shares: 17,
  },
  {
    id: 103,
    author: "Poe Mamhe Thar",
    authorPhoto: PIC("1519345182560-3f2917c472ef"),
    time: "Yesterday • Nay Pyi Taw",
    text: "Poem",
    media: [{ src: PIC("1506086679524-493c64fdfaa6") }],
    reactions: 3800,
    comments: 71,
    shares: 17,
  },
  {
    id: 104,
    author: "Poe Mamhe Thar",
    authorPhoto: PIC("1519345182560-3f2917c472ef"),
    time: "Yesterday • Cinema",
    text: "Moments at the movie premiere",
    media: [
      { src: PIC("1515378791036-0648a3ef77b2") },
      { src: PIC("1517841905240-472988babdf9") },
      { src: PIC("1494790108377-be9c29b29330") },
    ],
    reactions: 3800,
    comments: 71,
    shares: 17,
  },
];

// ---- Overview: wrap inside your DashboardLayout ----
export default function Overview() {
  return (
    <DashboardLayout>
      <div style={{ height: "96vh", overflow: "hidden", background: "transparent" }}>
        <div style={{ height: "100%", padding: 0 }}>
          <SocialSearchUI />
        </div>
      </div>
    </DashboardLayout>
  );
}
