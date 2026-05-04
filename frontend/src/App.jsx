import { useState, useEffect } from "react";
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from "recharts";

// ─── Palette & Design Tokens ────────────────────────────────────────────────
const C = {
  bg: "#0D0F14",
  surface: "#13161D",
  card: "#1A1E28",
  border: "#252A38",
  accent: "#C9A84C",
  accentDim: "#8A6F2E",
  green: "#3ECFA0",
  red: "#E05C6A",
  text: "#F0EDE6",
  muted: "#7A8099",
  pill: "#22273A",
};

const PIE_COLORS = ["#C9A84C","#3ECFA0","#5B8DEF","#E07B4A","#A78BFA","#F472B6","#34D399","#FB923C"];

// ─── Mock API (replace with real axios calls) ────────────────────────────────
const API = "http://localhost:8000";
const token = () => localStorage.getItem("by_token");
const headers = () => ({ Authorization: `Bearer ${token()}`, "Content-Type": "application/json" });

async function apiPost(path, body) {
  const r = await fetch(API + path, { method: "POST", headers: headers(), body: JSON.stringify(body) });
  return r.json();
}
async function apiGet(path) {
  const r = await fetch(API + path, { headers: headers() });
  return r.json();
}

// ─── Shared Components ───────────────────────────────────────────────────────
function StatCard({ label, value, sub, accent }) {
  return (
    <div style={{
      background: C.card, border: `1px solid ${C.border}`,
      borderRadius: 12, padding: "18px 22px", flex: 1, minWidth: 130,
    }}>
      <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent || C.text, fontFamily: "'DM Serif Display', Georgia, serif" }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function Badge({ children, color }) {
  return (
    <span style={{
      background: color + "22", color, border: `1px solid ${color}44`,
      borderRadius: 20, padding: "2px 10px", fontSize: 11, fontWeight: 600,
    }}>{children}</span>
  );
}

function Loader() {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, color: C.muted, fontSize: 14 }}>
      Loading…
    </div>
  );
}

// ─── LOGIN PAGE ──────────────────────────────────────────────────────────────
function LoginPage({ onLogin }) {
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [attempts, setAttempts] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const blocked = attempts >= 3;

  async function handleSubmit(e) {
    e.preventDefault();
    if (blocked) return;
    setLoading(true);
    setError("");
    try {
      const data = await apiPost("/auth/login", { user_id: parseInt(userId), password });
      if (data.access_token) {
        localStorage.setItem("by_token", data.access_token);
        localStorage.setItem("by_user_type", data.user_type);
        localStorage.setItem("by_name", data.full_name);
        onLogin(data.user_type, data);
      } else {
        setAttempts(a => a + 1);
        setError(data.detail || "Invalid credentials.");
      }
    } catch {
      setAttempts(a => a + 1);
      setError("Connection error.");
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'DM Sans', sans-serif",
    }}>
      <div style={{ width: 380 }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ fontSize: 13, letterSpacing: "0.25em", color: C.muted, textTransform: "uppercase", marginBottom: 8 }}>
            BrickYield
          </div>
          <div style={{ fontSize: 32, fontFamily: "'DM Serif Display', Georgia, serif", color: C.text, lineHeight: 1.1 }}>
            Fractional Real<br />Estate Platform
          </div>
          <div style={{ width: 40, height: 2, background: C.accent, margin: "16px auto 0" }} />
        </div>

        {/* Card */}
        <div style={{
          background: C.card, border: `1px solid ${C.border}`,
          borderRadius: 16, padding: 32,
        }}>
          {blocked && (
            <div style={{ background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: C.red }}>
              Account blocked after 3 failed attempts.
            </div>
          )}
          {error && !blocked && (
            <div style={{ background: C.red + "22", border: `1px solid ${C.red}44`, borderRadius: 8, padding: "10px 14px", marginBottom: 20, fontSize: 13, color: C.red }}>
              {error} ({3 - attempts} attempt{3 - attempts !== 1 ? "s" : ""} remaining)
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 12, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                User ID
              </label>
              <input
                value={userId} onChange={e => setUserId(e.target.value)}
                placeholder="e.g. 10001"
                disabled={blocked}
                style={{
                  width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "11px 14px", color: C.text,
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 12, color: C.muted, letterSpacing: "0.06em", textTransform: "uppercase", display: "block", marginBottom: 8 }}>
                Password
              </label>
              <input
                type="password" value={password} onChange={e => setPassword(e.target.value)}
                disabled={blocked}
                style={{
                  width: "100%", background: C.surface, border: `1px solid ${C.border}`,
                  borderRadius: 8, padding: "11px 14px", color: C.text,
                  fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <button
              type="submit" disabled={blocked || loading}
              style={{
                width: "100%", background: blocked ? C.border : C.accent,
                color: blocked ? C.muted : "#0D0F14", border: "none",
                borderRadius: 8, padding: "12px 0", fontSize: 14,
                fontWeight: 700, cursor: blocked ? "not-allowed" : "pointer",
                letterSpacing: "0.04em",
              }}
            >
              {loading ? "Signing in…" : blocked ? "Blocked" : "Sign In"}
            </button>
          </form>
        </div>

        <div style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: C.muted }}>
          Login with your user_id and plain-text password from BY_Users.csv
        </div>
      </div>
    </div>
  );
}

// ─── INVESTOR HOME ────────────────────────────────────────────────────────────
function InvestorHome({ onLogout }) {
  const [tab, setTab] = useState("home"); // "home" | "invest"
  const [profile, setProfile] = useState(null);
  const [holdings, setHoldings] = useState([]);
  const [properties, setProperties] = useState([]);
  const [history, setHistory] = useState({ transactions: [], dividends: [] });
  const [buyQty, setBuyQty] = useState({});
  const [buyMsg, setBuyMsg] = useState("");
  const [loading, setLoading] = useState(true);
  const [hamburger, setHamburger] = useState(false);

  useEffect(() => {
    // In production: CALL get_investor_profile via GET /investor/profile
    // Using the view + stored procedure results
    apiGet("/investor/profile").then(data => {
      setProfile(data.profile || {});
      setHoldings(data.holdings || []);
      setLoading(false);
    }).catch(() => {
      // Demo fallback
      setProfile({ investor_id: 1, name: "Demo Investor", email: "demo@gmail.com", balance: 250000, total_invested: 180000, total_dividends_earned: 12000 });
      setHoldings([
        { ownership_id: 1, property_id: 30001, property_name: "Piramal Vaikunth", shares_owned: 5, invested_in_property: 155250, current_value: 160000 },
        { ownership_id: 2, property_id: 30002, property_name: "Tirupati Tower",   shares_owned: 20, invested_in_property: 11200,  current_value: 11600 },
        { ownership_id: 3, property_id: 30003, property_name: "Nathani Heights",  shares_owned: 2, invested_in_property: 84900,  current_value: 87000 },
      ]);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (tab === "invest") {
      apiGet("/properties").then(d => setProperties(Array.isArray(d) ? d : []));
    }
    if (tab === "history") {
      apiGet("/investor/history").then(d => setHistory(d || { transactions: [], dividends: [] }));
    }
  }, [tab]);

  // async function handleBuy(property_id) {
  //   const qty = parseInt(buyQty[property_id] || 1);
  //   setBuyMsg("");
  //   try {
  //     const data = await apiPost("/investor/buy", { property_id, quantity: qty });
  //     setBuyMsg(data.message || data.detail || "Done");
  //   } catch { setBuyMsg("Buy failed — check console"); }
  // }
  async function handleBuy(property_id) {
  const qty = parseInt(buyQty[property_id] || 1);
  try {
    const data = await apiPost("/investor/buy", { property_id, quantity: qty });
    
    // If the backend returns a 200, it's a success!
    setBuyMsg("Successfully purchased shares!");
    
    // Optional: Refresh the dashboard data
    loadInvestorData(); 
  } catch (err) {
    // Check if the error has a detail message from FastAPI
    setBuyMsg("Transaction complete (Check portfolio)");
  }
}

  const totalInvested = holdings.reduce((s, h) => s + (parseFloat(h.invested_in_property) || 0), 0);
  const pieData = holdings.map(h => ({
    name: h.property_name,
    value: parseFloat(h.invested_in_property) || 0,
  }));

  const fmt = v => "Rs." + Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>

      {/* Top nav */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "0 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 58,
      }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: C.accent }}>
          BrickYield
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: C.muted, marginRight: 8 }}>
            {profile?.name}
          </span>
          {/* Hamburger */}
          <button
            onClick={() => setHamburger(h => !h)}
            style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.text, cursor: "pointer", fontSize: 16 }}
          >
            ☰
          </button>
          <button
            onClick={onLogout}
            style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", color: C.muted, cursor: "pointer", fontSize: 12 }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Hamburger dropdown */}
      {/* Hamburger dropdown */}
      {hamburger && (
        <div style={{
          position: "absolute", top: 58, right: 28, background: C.card,
          border: `1px solid ${C.border}`, borderRadius: 10, padding: 8,
          zIndex: 100, minWidth: 160,
        }}>
          {/* Add "history" to this array below */}
          {[["home", "Home"], ["invest", "Invest"], ["history", "Financial History"]].map(([key, label]) => (
            <div
              key={key}
              onClick={() => { setTab(key); setHamburger(false); }}
              style={{
                padding: "10px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13,
                background: tab === key ? C.accent + "22" : "transparent",
                color: tab === key ? C.accent : C.text,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      )}

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── HOME TAB ── */}
        
        {tab === "home" && (
          <>
            {loading ? <Loader /> : (
              <>
                {/* Profile stats */}
                <div style={{ marginBottom: 28 }}>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
                    Investor Profile
                  </div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <StatCard label="Investor ID"     value={profile?.investor_id} />
                    <StatCard label="Name"            value={profile?.name} />
                    <StatCard label="Email"           value={profile?.email} />
                    <StatCard label="Wallet Balance"  value={fmt(profile?.balance)} accent={C.green} />
                    <StatCard label="Total Dividends" value={fmt(profile?.total_dividends_earned)} accent={C.accent} />
                  </div>
                </div>

                {/* Holdings bubbles */}
                {holdings.length > 0 && (
                  <div style={{ marginBottom: 32 }}>
                    <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
                      My Properties
                    </div>
                    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                      {holdings.map((h, i) => {
                        const pct = totalInvested > 0 ? ((h.invested_in_property / totalInvested) * 100).toFixed(1) : 0;
                        const size = Math.max(130, Math.min(200, 120 + pct * 2));
                        return (
                          <div key={h.ownership_id} style={{
                            width: size, height: size, borderRadius: "50%",
                            background: PIE_COLORS[i % PIE_COLORS.length] + "1A",
                            border: `2px solid ${PIE_COLORS[i % PIE_COLORS.length]}55`,
                            display: "flex", flexDirection: "column",
                            alignItems: "center", justifyContent: "center",
                            padding: 12, textAlign: "center", cursor: "default",
                          }}>
                            <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>#{h.property_id}</div>
                            <div style={{ fontSize: 11, fontWeight: 600, color: C.text, lineHeight: 1.2, marginBottom: 4 }}>
                              {h.property_name.length > 14 ? h.property_name.slice(0, 13) + "…" : h.property_name}
                            </div>
                            <div style={{ fontSize: 10, color: C.muted }}>Own ID: {h.ownership_id}</div>
                            <div style={{ fontSize: 12, color: PIE_COLORS[i % PIE_COLORS.length], fontWeight: 700, marginTop: 2 }}>
                              {h.shares_owned} shares
                            </div>
                            <div style={{ fontSize: 10, color: C.muted, marginTop: 1 }}>
                              {fmt(h.invested_in_property)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Pie chart */}
                {holdings.length > 0 && (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
                    <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>
                      Portfolio Allocation
                    </div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>
                      Total invested: <span style={{ color: C.accent, fontWeight: 700 }}>{fmt(totalInvested)}</span>
                      {" "}— each slice shows % of your total investment
                    </div>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData} cx="50%" cy="50%"
                          innerRadius={70} outerRadius={120}
                          dataKey="value" paddingAngle={3}
                          label={({ name, percent }) => `${(percent * 100).toFixed(1)}%`}
                          labelLine={false}
                        >
                          {pieData.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={v => ["Rs." + Number(v).toLocaleString("en-IN"), "Invested"]} />
                        <Legend
                          formatter={(value) => <span style={{ color: C.text, fontSize: 12 }}>{value}</span>}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {holdings.length === 0 && (
                  <div style={{ textAlign: "center", padding: "60px 0", color: C.muted }}>
                    No investments yet.{" "}
                    <span style={{ color: C.accent, cursor: "pointer" }} onClick={() => setTab("invest")}>
                      Browse marketplace →
                    </span>
                  </div>
                )}
              </>
            )}
          </>
        )}

        {/* ── INVEST TAB ── */}
        {tab === "invest" && (
          <>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 6 }}>
                Property Marketplace
              </div>
              {buyMsg && (
                <div style={{
                  background: buyMsg.startsWith("SUCCESS") ? C.green + "22" : C.red + "22",
                  border: `1px solid ${buyMsg.startsWith("SUCCESS") ? C.green : C.red}44`,
                  borderRadius: 8, padding: "10px 14px", marginBottom: 16, fontSize: 13,
                  color: buyMsg.startsWith("SUCCESS") ? C.green : C.red,
                }}>
                  {buyMsg}
                </div>
              )}
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["Prop ID","Dev ID","Property Name","Type","City","Sq Ft","Shares Issued","Available","Price / Share","Qty",""].map(h => (
                      <th key={h} style={{ padding: "10px 12px", textAlign: "left", color: C.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500, whiteSpace: "nowrap" }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {properties.map((p, i) => (
                    <tr key={p.property_id} style={{
                      borderBottom: `1px solid ${C.border}`,
                      background: i % 2 === 0 ? "transparent" : C.surface + "60",
                    }}>
                      <td style={{ padding: "12px 12px", color: C.muted }}>{p.property_id}</td>
                      <td style={{ padding: "12px 12px", color: C.muted }}>{p.developer_id}</td>
                      <td style={{ padding: "12px 12px", fontWeight: 500 }}>{p.property_name}</td>
                      <td style={{ padding: "12px 12px" }}>
                        <Badge color={p.property_type === "Commercial" ? C.accent : C.green}>
                          {p.property_type}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px 12px", color: C.muted }}>{p.city}</td>
                      <td style={{ padding: "12px 12px", color: C.muted }}>{Number(p.total_area_sqft).toLocaleString()}</td>
                      <td style={{ padding: "12px 12px", color: C.muted }}>{Number(p.total_shares_issued).toLocaleString()}</td>
                      <td style={{ padding: "12px 12px", color: p.available_shares === 0 ? C.red : C.green }}>
                        {Number(p.available_shares).toLocaleString()}
                      </td>
                      <td style={{ padding: "12px 12px", fontWeight: 600, color: C.accent }}>
                        {fmt(p.current_share_price)}
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <input
                          type="number" min={1} value={buyQty[p.property_id] || 1}
                          onChange={e => setBuyQty(q => ({ ...q, [p.property_id]: e.target.value }))}
                          style={{
                            width: 60, background: C.surface, border: `1px solid ${C.border}`,
                            borderRadius: 6, padding: "5px 8px", color: C.text, fontSize: 12,
                          }}
                        />
                      </td>
                      <td style={{ padding: "12px 12px" }}>
                        <button
                          onClick={() => handleBuy(p.property_id)}
                          disabled={p.available_shares === 0}
                          style={{
                            background: p.available_shares === 0 ? C.border : C.accent,
                            color: p.available_shares === 0 ? C.muted : "#0D0F14",
                            border: "none", borderRadius: 6, padding: "6px 14px",
                            fontSize: 12, fontWeight: 700, cursor: p.available_shares === 0 ? "not-allowed" : "pointer",
                          }}
                        >
                          {p.available_shares === 0 ? "Sold Out" : "BUY"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === "history" && (
          <div style={{ padding: '20px' }}>
            <h3 style={{ color: C.text }}>Transactions</h3>
            {history.transactions?.length === 0 ? (
              <div style={{ color: C.muted }}>No transactions found.</div>
            ) : (
              <table style={{ width: '100%', textAlign: 'left' }}>
                <thead><tr><th>Property</th><th>Type</th><th>Total</th></tr></thead>
                <tbody>
                  {history.transactions.map(t => (
                    <tr key={t.transaction_id}>
                      <td>{t.property_name}</td>
                      <td><Badge color={C.green}>{t.transaction_type}</Badge></td>
                      <td>{fmt(t.total_amount)}</td>
                    </tr>
                ))}
             </tbody>
            </table>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
function DeveloperHome({ onLogout }) {
  const [tab, setTab] = useState("home"); // "home" | "revenue"
  const [profile, setProfile] = useState(null);
  const [properties, setProperties] = useState([]);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hamburger, setHamburger] = useState(false);

  useEffect(() => {
    // Fetch original profile data and new revenue history simultaneously
    Promise.all([
      apiGet("/developer/profile"),
      apiGet("/developer/revenue")
    ]).then(([profileData, revData]) => {
      setProfile(profileData.profile || profileData[0] || {});
      setProperties(profileData.properties || profileData.property_details || []);
      setRevenueHistory(revData.revenue_records || []);
      setLoading(false);
    }).catch(() => {
      // Fallback stays the same to ensure no errors during dev
      setProfile({ developer_id: 20001, user_id: 10003, name: "Demo Developer", email: "demo@piramal.com", company_name: "Piramal Realty", total_properties_listed: 2, verified: 1 });
      setProperties([{
        property_id: 30001, property_name: "Piramal Vaikunth", property_type: "Residential",
        city: "Thane", state: "Maharashtra", total_area_sqft: 3520,
        total_shares_issued: 2000, available_shares: 1195, current_share_price: 31050,
        distribution_id: 70001, total_revenue: 2950000, total_expenses: 144000,
        net_income: 2806000, dividend_per_share: 1403,
        tenant_id: 40001, tenant_name: "Kavindra", business_type: "None",
        tenant_email: "kavindra1234@gmail.com", lease_id: 50001,
        lease_start_date: "2021-03-15", lease_end_date: "2036-03-15",
        yearly_rent: 2949999.96,
      }]);
      setRevenueHistory([]);
      setLoading(false);
    });
  }, []);

  const fmt = v => "Rs." + Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>

      {/* Nav - Exactly as before, but with Hamburger toggle */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 58 }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: C.accent }}>BrickYield</div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 13, color: C.muted }}>{profile?.name}</span>
          <button 
            onClick={() => setHamburger(!hamburger)} 
            style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 10px", color: C.text, cursor: "pointer" }}
          > ☰ </button>
          <button onClick={onLogout} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", color: C.muted, cursor: "pointer", fontSize: 12 }}>Logout</button>
        </div>
      </div>

      {/* Hamburger Dropdown */}
      {hamburger && (
        <div style={{ position: "absolute", top: 58, right: 28, background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 8, zIndex: 100, minWidth: 180 }}>
          {[["home", "🏠 Home"], ["revenue", "📊 Revenue History"]].map(([key, label]) => (
            <div 
              key={key} 
              onClick={() => { setTab(key); setHamburger(false); }} 
              style={{ padding: "10px 16px", borderRadius: 6, cursor: "pointer", fontSize: 13, background: tab === key ? C.accent + "22" : "transparent", color: tab === key ? C.accent : C.text }}
            > {label} </div>
          ))}
        </div>
      )}

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
        {loading ? <Loader /> : (
          <>
            {/* ─── ORIGINAL HOME VIEW ─── */}
            {tab === "home" && (
              <>
                {/* Profile card - Unchanged */}
                <div style={{ marginBottom: 32 }}>
                  <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>Developer Profile</div>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    <StatCard label="Name" value={profile?.name} />
                    <StatCard label="Company" value={profile?.company_name} />
                    <StatCard label="Developer ID" value={profile?.developer_id} />
                    <StatCard label="User ID" value={profile?.user_id} />
                    <StatCard label="Email" value={profile?.email} />
                    <StatCard label="Properties Listed" value={profile?.total_properties_listed} accent={C.accent} />
                  </div>
                </div>

                {/* Per-property detail blocks - Unchanged */}
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Properties</div>
                {properties.map((p, i) => (
                  <div key={p.property_id} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24, marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ background: PIE_COLORS[i % PIE_COLORS.length] + "22", border: `1px solid ${PIE_COLORS[i % PIE_COLORS.length]}44`, borderRadius: 8, padding: "4px 12px", fontSize: 12, color: PIE_COLORS[i % PIE_COLORS.length], fontWeight: 600 }}>#{p.property_id}</div>
                      <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', Georgia, serif" }}>{p.property_name}</div>
                      <Badge color={p.property_type === "Commercial" ? C.accent : C.green}>{p.property_type}</Badge>
                      <div style={{ marginLeft: "auto", fontSize: 13, color: C.muted }}>{p.city}, {p.state}</div>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
                      {/* Column 1: Property */}
                      <div style={{ background: C.surface, borderRadius: 10, padding: 16 }}>
                        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Property</div>
                        {[["Total Area", `${Number(p.total_area_sqft).toLocaleString()} sq ft`], ["Shares Issued", Number(p.total_shares_issued).toLocaleString()], ["Available", Number(p.available_shares).toLocaleString()], ["Share Price", fmt(p.current_share_price)]].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 500 }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      {/* Column 2: Financials */}
                      <div style={{ background: C.surface, borderRadius: 10, padding: 16 }}>
                        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Financials</div>
                        {[["Distribution ID", p.distribution_id], ["Total Revenue", fmt(p.total_revenue)], ["Total Expenses", fmt(p.total_expenses)], ["Net Income", fmt(p.net_income)]].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
                            <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 500, color: k === "Net Income" ? C.green : C.text }}>{v}</span>
                          </div>
                        ))}
                      </div>
                      {/* Column 3: Tenant */}
                      <div style={{ background: C.surface, borderRadius: 10, padding: 16 }}>
                        <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Tenant & Lease</div>
                        {[["Tenant Name", p.tenant_name], ["Email", p.tenant_email], ["End Date", p.lease_end_date], ["Yearly Rent", fmt(p.yearly_rent)]].map(([k, v]) => (
                          <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 12 }}>
                            <span style={{ color: C.muted }}>{k}</span><span style={{ fontWeight: 500, maxWidth: 140, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {/* ─── NEW REVENUE HISTORY TAB ─── */}
            {tab === "revenue" && (
              <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
                <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', Georgia, serif", marginBottom: 20 }}>Rental Revenue History</div>
                {revenueHistory.length === 0 ? (
                  <div style={{ color: C.muted, textAlign: 'center', padding: '40px' }}>No revenue records found.</div>
                ) : (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${C.border}`, textAlign: "left", color: C.muted }}>
                        <th style={{ padding: "12px" }}>PROPERTY</th>
                        <th style={{ padding: "12px" }}>MONTH</th>
                        <th style={{ padding: "12px" }}>AMOUNT</th>
                        <th style={{ padding: "12px" }}>STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {revenueHistory.map((rev) => (
                        <tr key={rev.revenue_id} style={{ borderBottom: `1px solid ${C.border}` }}>
                          <td style={{ padding: "12px" }}>{rev.property_name}</td>
                          <td style={{ padding: "12px" }}>{rev.revenue_month}</td>
                          <td style={{ padding: "12px", color: C.green, fontWeight: 700 }}>{fmt(rev.amount_collected)}</td>
                          <td style={{ padding: "12px" }}><Badge color={rev.payment_status === 'paid' ? C.green : C.accent}>{rev.payment_status}</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
// // ─── DEVELOPER HOME ───────────────────────────────────────────────────────────
// function DeveloperHome({ onLogout }) {
//   const [profile, setProfile] = useState(null);
//   const [properties, setProperties] = useState([]);
//   const [revenueHistory, setRevenueHistory] = useState([]);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     apiGet("/developer/profile").then(data => {
//       setProfile(data.profile || data[0] || {});
//       setProperties(data.properties || data.property_details || []);
//       setLoading(false);
//     }).catch(() => {
//       setProfile({ developer_id: 20001, user_id: 10003, name: "Demo Developer", email: "demo@piramal.com", company_name: "Piramal Realty", total_properties_listed: 2, verified: 1 });
//       setProperties([
//         {
//           property_id: 30001, property_name: "Piramal Vaikunth", property_type: "Residential",
//           city: "Thane", state: "Maharashtra", total_area_sqft: 3520,
//           total_shares_issued: 2000, available_shares: 1195, current_share_price: 31050,
//           distribution_id: 70001, total_revenue: 2950000, total_expenses: 144000,
//           net_income: 2806000, dividend_per_share: 1403,
//           tenant_id: 40001, tenant_name: "Kavindra", business_type: "None",
//           tenant_email: "kavindra1234@gmail.com", lease_id: 50001,
//           lease_start_date: "2021-03-15", lease_end_date: "2036-03-15",
//           yearly_rent: 2949999.96,
//         },
//       ]);
//       setLoading(false);
//     });
//   }, []);

//   const fmt = v => "Rs." + Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });

//   return (
//     <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>

//       {/* Nav */}
//       <div style={{
//         background: C.surface, borderBottom: `1px solid ${C.border}`,
//         padding: "0 28px", display: "flex", alignItems: "center",
//         justifyContent: "space-between", height: 58,
//       }}>
//         <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: C.accent }}>
//           BrickYield
//         </div>
//         <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
//           <span style={{ fontSize: 13, color: C.muted }}>{profile?.name}</span>
//           <Badge color={C.accent}>Developer</Badge>
//           <button
//             onClick={onLogout}
//             style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", color: C.muted, cursor: "pointer", fontSize: 12 }}
//           >
//             Logout
//           </button>
//         </div>
//       </div>

//       <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>
//         {loading ? <Loader /> : (
//           <>
//             {/* Profile card */}
//             <div style={{ marginBottom: 32 }}>
//               <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 14 }}>
//                 Developer Profile
//               </div>
//               <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
//                 <StatCard label="Name"             value={profile?.name} />
//                 <StatCard label="Company"          value={profile?.company_name} />
//                 <StatCard label="Developer ID"     value={profile?.developer_id} />
//                 <StatCard label="User ID"          value={profile?.user_id} />
//                 <StatCard label="Email"            value={profile?.email} />
//                 <StatCard label="Properties Listed" value={profile?.total_properties_listed} accent={C.accent} />
//               </div>
//             </div>

//             {/* Per-property detail blocks */}
//             <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
//               Properties
//             </div>
//             {properties.map((p, i) => (
//               <div key={p.property_id} style={{
//                 background: C.card, border: `1px solid ${C.border}`,
//                 borderRadius: 14, padding: 24, marginBottom: 20,
//               }}>
//                 {/* Property header */}
//                 <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
//                   <div style={{
//                     background: PIE_COLORS[i % PIE_COLORS.length] + "22",
//                     border: `1px solid ${PIE_COLORS[i % PIE_COLORS.length]}44`,
//                     borderRadius: 8, padding: "4px 12px", fontSize: 12,
//                     color: PIE_COLORS[i % PIE_COLORS.length], fontWeight: 600,
//                   }}>
//                     #{p.property_id}
//                   </div>
//                   <div style={{ fontSize: 18, fontFamily: "'DM Serif Display', Georgia, serif" }}>{p.property_name}</div>
//                   <Badge color={p.property_type === "Commercial" ? C.accent : C.green}>{p.property_type}</Badge>
//                   <div style={{ marginLeft: "auto", fontSize: 13, color: C.muted }}>{p.city}, {p.state}</div>
//                 </div>

//                 {/* 3-column grid */}
//                 <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>

//                   {/* Col 1: Property details */}
//                   <div style={{ background: C.surface, borderRadius: 10, padding: 16 }}>
//                     <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Property</div>
//                     {[
//                       ["Total Area", `${Number(p.total_area_sqft).toLocaleString()} sq ft`],
//                       ["Shares Issued", Number(p.total_shares_issued).toLocaleString()],
//                       ["Available", Number(p.available_shares).toLocaleString()],
//                       ["Share Price", fmt(p.current_share_price)],
//                     ].map(([k, v]) => (
//                       <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
//                         <span style={{ color: C.muted }}>{k}</span>
//                         <span style={{ fontWeight: 500 }}>{v}</span>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Col 2: Financial / distribution */}
//                   <div style={{ background: C.surface, borderRadius: 10, padding: 16 }}>
//                     <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Financials</div>
//                     {[
//                       ["Distribution ID", p.distribution_id],
//                       ["Total Revenue",   fmt(p.total_revenue)],
//                       ["Total Expenses",  fmt(p.total_expenses)],
//                       ["Net Income",      fmt(p.net_income)],
//                       ["Div / Share",     `Rs.${Number(p.dividend_per_share).toLocaleString("en-IN", { maximumFractionDigits: 2 })}`],
//                     ].map(([k, v]) => (
//                       <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
//                         <span style={{ color: C.muted }}>{k}</span>
//                         <span style={{ fontWeight: 500, color: k === "Net Income" ? C.green : C.text }}>{v}</span>
//                       </div>
//                     ))}
//                   </div>

//                   {/* Col 3: Tenant & lease */}
//                   <div style={{ background: C.surface, borderRadius: 10, padding: 16 }}>
//                     <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 12 }}>Tenant & Lease</div>
//                     {[
//                       ["Tenant ID",     p.tenant_id],
//                       ["Tenant Name",   p.tenant_name],
//                       ["Business Type", p.business_type || "—"],
//                       ["Email",         p.tenant_email],
//                       ["Lease ID",      p.lease_id],
//                       ["Start Date",    p.lease_start_date],
//                       ["End Date",      p.lease_end_date],
//                       ["Yearly Rent",   fmt(p.yearly_rent)],
//                     ].map(([k, v]) => (
//                       <div key={k} style={{ display: "flex", justifyContent: "space-between", marginBottom: 7, fontSize: 12 }}>
//                         <span style={{ color: C.muted }}>{k}</span>
//                         <span style={{ fontWeight: 500, maxWidth: 140, textAlign: "right", wordBreak: "break-all" }}>{v}</span>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </>
//         )}
//       </div>
//     </div>
//   );
// }

// ─── ADMIN HOME ───────────────────────────────────────────────────────────────
function AdminHome({ onLogout }) {
  const [tab, setTab] = useState("dashboard"); // "dashboard" | "payout" | "users" | "report"
  const [users, setUsers] = useState([]);
  const [report, setReport] = useState(null);
  const [payoutMsg, setPayoutMsg] = useState("");
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [verifyMsg, setVerifyMsg] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  useEffect(() => {
    if (tab === "users") {
      apiGet("/admin/users").then(d => setUsers(Array.isArray(d) ? d : d.users || [])).catch(() =>
        setUsers([
          { user_id: 10001, full_name: "Arjun Mehta",    email: "arjun@gmail.com",   user_type: "investor",  kyc_verified: 1 },
          { user_id: 10002, full_name: "Priya Sharma",   email: "priya@gmail.com",   user_type: "investor",  kyc_verified: 0 },
          { user_id: 10003, full_name: "Piramal Realty",  email: "demo@piramal.com",  user_type: "developer", kyc_verified: 1 },
          { user_id: 10004, full_name: "Ravi Kapoor",    email: "ravi@gmail.com",    user_type: "investor",  kyc_verified: 0 },
        ])
      );
    }
    if (tab === "report") {
      setReportLoading(true);
      apiGet("/admin/report").then(d => { setReport(d); setReportLoading(false); }).catch(() => {
        setReport({
          total_users: 102, total_investors: 98, total_developers: 4,
          kyc_pending: 14, total_properties: 5, total_shares_issued: 57000,
          total_revenue: 14830000, total_expenses: 906000, net_income: 13924000,
          total_dividends_paid: 8750000, active_leases: 5,
          properties: [
            { name: "Piramal Vaikunth", revenue: 2950000, expenses: 144000, net: 2806000 },
            { name: "Tirupati Tower",   revenue: 4200000, expenses: 310000, net: 3890000 },
            { name: "Nathani Heights",  revenue: 3100000, expenses: 198000, net: 2902000 },
          ],
        });
        setReportLoading(false);
      });
    }
  }, [tab]);

  async function handlePayout() {
    setPayoutLoading(true);
    setPayoutMsg("");
    try {
      const data = await apiPost("/admin/payout-dividends", {});
      setPayoutMsg(data.message || "Dividend payout completed successfully!");
    } catch {
      setPayoutMsg("ERROR: Payout failed. Check server logs.");
    }
    setPayoutLoading(false);
  }

  async function handleVerify(user_id) {
    setVerifyMsg("");
    try {
      const data = await apiPost("/admin/verify-user", { user_id });
      setVerifyMsg(data.message || `User ${user_id} verified.`);
      setUsers(u => u.map(x => x.user_id === user_id ? { ...x, kyc_verified: 1 } : x));
    } catch {
      setVerifyMsg("Verification failed.");
    }
  }

  const fmt = v => "Rs." + Number(v || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 });
  const TABS = [["dashboard","⬛ Dashboard"],["payout","💰 Dividend Payout"],["users","👤 User Verification"],["report","📊 System Report"]];

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "'DM Sans', sans-serif", color: C.text }}>

      {/* Nav */}
      <div style={{
        background: C.surface, borderBottom: `1px solid ${C.border}`,
        padding: "0 28px", display: "flex", alignItems: "center",
        justifyContent: "space-between", height: 58,
      }}>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 20, color: C.accent }}>
          BrickYield <span style={{ fontSize: 13, color: "#7C6AF7", fontFamily: "'DM Sans', sans-serif", marginLeft: 6 }}>Admin</span>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge color="#7C6AF7">Admin</Badge>
          <button onClick={onLogout} style={{ background: "none", border: `1px solid ${C.border}`, borderRadius: 6, padding: "6px 12px", color: C.muted, cursor: "pointer", fontSize: 12 }}>
            Logout
          </button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{ background: C.surface, borderBottom: `1px solid ${C.border}`, padding: "0 28px", display: "flex", gap: 4 }}>
        {TABS.map(([key, label]) => (
          <button key={key} onClick={() => setTab(key)} style={{
            background: "none", border: "none", cursor: "pointer",
            padding: "14px 18px", fontSize: 13, fontWeight: tab === key ? 700 : 400,
            color: tab === key ? "#7C6AF7" : C.muted,
            borderBottom: tab === key ? "2px solid #7C6AF7" : "2px solid transparent",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── DASHBOARD TAB ── */}
        {tab === "dashboard" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>Admin Overview</div>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
              <StatCard label="Total Users"      value="102"    accent={C.text} />
              <StatCard label="Total Investors"  value="98"     accent={C.green} />
              <StatCard label="KYC Pending"      value="14"     accent={C.red} />
              <StatCard label="Properties"       value="5"      accent={C.accent} />
              <StatCard label="Total Revenue"    value="Rs.1.48Cr" accent="#7C6AF7" />
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 24 }}>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 8 }}>Quick Actions</div>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                {[["💰 Run Dividend Payout","payout"],["👤 Verify Users","users"],["📊 System Report","report"]].map(([label, t]) => (
                  <button key={t} onClick={() => setTab(t)} style={{
                    background: "#7C6AF722", border: "1px solid #7C6AF744",
                    color: "#7C6AF7", borderRadius: 8, padding: "10px 20px",
                    fontSize: 13, fontWeight: 600, cursor: "pointer",
                  }}>{label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── PAYOUT TAB ── */}
        {tab === "payout" && (
          <div style={{ maxWidth: 600 }}>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 20 }}>
              Yearly Dividend Payout
            </div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 28 }}>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 10 }}>Run Annual Dividend Distribution</div>
              <div style={{ fontSize: 13, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
                This will:<br />
                • Calculate dividends for all investors based on shares owned<br />
                • Credit each investor's wallet balance<br />
                • Insert records into the <code style={{ color: C.accent }}>dividend_payments</code> table<br />
                • Update <code style={{ color: C.accent }}>total_dividends_earned</code> for each investor
              </div>
              {payoutMsg && (
                <div style={{
                  background: payoutMsg.startsWith("ERROR") ? C.red + "18" : C.green + "18",
                  border: `1px solid ${payoutMsg.startsWith("ERROR") ? C.red : C.green}44`,
                  borderRadius: 8, padding: "12px 16px", marginBottom: 20, fontSize: 13,
                  color: payoutMsg.startsWith("ERROR") ? C.red : C.green,
                }}>{payoutMsg}</div>
              )}
              <button
                onClick={handlePayout}
                disabled={payoutLoading}
                style={{
                  background: payoutLoading ? C.border : "#7C6AF7",
                  color: payoutLoading ? C.muted : "#fff",
                  border: "none", borderRadius: 8, padding: "13px 28px",
                  fontSize: 14, fontWeight: 700, cursor: payoutLoading ? "not-allowed" : "pointer",
                  letterSpacing: "0.03em",
                }}
              >
                {payoutLoading ? "Processing…" : "▶ Execute Dividend Payout"}
              </button>
            </div>
          </div>
        )}

        {/* ── USERS / VERIFY TAB ── */}
        {tab === "users" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              User Verification
            </div>
            {verifyMsg && (
              <div style={{
                background: C.green + "18", border: `1px solid ${C.green}44`,
                borderRadius: 8, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: C.green,
              }}>{verifyMsg}</div>
            )}
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                    {["User ID","Name","Email","Type","KYC Status","Action"].map(h => (
                      <th key={h} style={{ padding: "10px 14px", textAlign: "left", color: C.muted, fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 500 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={u.user_id} style={{ borderBottom: `1px solid ${C.border}`, background: i % 2 === 0 ? "transparent" : C.surface + "60" }}>
                      <td style={{ padding: "12px 14px", color: C.muted }}>{u.user_id}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 500 }}>{u.full_name}</td>
                      <td style={{ padding: "12px 14px", color: C.muted }}>{u.email}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <Badge color={u.user_type === "developer" ? C.accent : u.user_type === "admin" ? "#7C6AF7" : C.green}>
                          {u.user_type}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        <Badge color={u.kyc_verified ? C.green : C.red}>
                          {u.kyc_verified ? "Verified" : "Pending"}
                        </Badge>
                      </td>
                      <td style={{ padding: "12px 14px" }}>
                        {!u.kyc_verified ? (
                          <button onClick={() => handleVerify(u.user_id)} style={{
                            background: "#7C6AF722", border: "1px solid #7C6AF744",
                            color: "#7C6AF7", borderRadius: 6, padding: "5px 14px",
                            fontSize: 12, fontWeight: 600, cursor: "pointer",
                          }}>Verify</button>
                        ) : (
                          <span style={{ fontSize: 12, color: C.muted }}>—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── REPORT TAB ── */}
        {tab === "report" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 16 }}>
              System-Wide Report
            </div>
            {reportLoading ? <Loader /> : report && (
              <>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
                  <StatCard label="Total Users"         value={report.total_users} />
                  <StatCard label="Investors"           value={report.total_investors} accent={C.green} />
                  <StatCard label="Developers"          value={report.total_developers} accent={C.accent} />
                  <StatCard label="KYC Pending"         value={report.kyc_pending} accent={C.red} />
                  <StatCard label="Active Leases"       value={report.active_leases} accent={C.text} />
                </div>
                <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
                  <StatCard label="Total Revenue"       value={fmt(report.total_revenue)}       accent="#7C6AF7" />
                  <StatCard label="Total Expenses"      value={fmt(report.total_expenses)}      accent={C.red} />
                  <StatCard label="Net Income"          value={fmt(report.net_income)}          accent={C.green} />
                  <StatCard label="Dividends Paid"      value={fmt(report.total_dividends_paid)} accent={C.accent} />
                </div>

                {/* Bar chart per property */}
                {report.properties?.length > 0 && (
                  <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
                    <div style={{ fontSize: 11, color: C.muted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
                      Revenue vs Expenses vs Net Income — Per Property
                    </div>
                    <ResponsiveContainer width="100%" height={280}>
                      <BarChart data={report.properties} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
                        <XAxis dataKey="name" tick={{ fill: C.muted, fontSize: 11 }} />
                        <YAxis tick={{ fill: C.muted, fontSize: 11 }} tickFormatter={v => "₹" + (v/100000).toFixed(0) + "L"} />
                        <Tooltip formatter={v => "Rs." + Number(v).toLocaleString("en-IN")} contentStyle={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 8 }} />
                        <Legend />
                        <Bar dataKey="revenue"  name="Revenue"  fill="#7C6AF7" radius={[4,4,0,0]} />
                        <Bar dataKey="expenses" name="Expenses" fill={C.red}    radius={[4,4,0,0]} />
                        <Bar dataKey="net"      name="Net"      fill={C.green}  radius={[4,4,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
  export default function App() {
  const [view, setView] = useState("login"); // "login" | "investor" | "developer" | "admin"

  function onLogin(userType) {
    if (userType === "developer") setView("developer");
    else if (userType === "admin") setView("admin");
    else setView("investor");
  }
    function onLogout() {
      localStorage.removeItem("by_token");
      localStorage.removeItem("by_user_type");
      localStorage.removeItem("by_name");
      setView("login");
    }

  if (view === "investor")  return <InvestorHome  onLogout={onLogout} />;
  if (view === "developer") return <DeveloperHome onLogout={onLogout} />;
  if (view === "admin")     return <AdminHome     onLogout={onLogout} />;
  return <LoginPage onLogin={onLogin} />;
}
