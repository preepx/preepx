import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Briefcase, CreditCard, IndianRupee, Shield, Search, Eye } from "lucide-react";
import api from "../utils/api";
import Pagination from "../components/Pagination";
import "./Dashboard.css";

const RecruiterPlans = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [payments, setPayments] = useState({ payments: [], revenue: 0 });
  const perPage = 10;

  useEffect(() => {
    api.get("/recruiter-plans")
      .then((res) => setData(res.data))
      .catch(() => setError("Failed to load recruiter plans"))
      .finally(() => setLoading(false));
    api.get("/recruiter-payments").then((res) => setPayments(res.data)).catch(() => {});
  }, []);

  if (loading) return <div className="loading">Loading recruiter plans...</div>;
  if (error) return <div className="error-alert">{error}</div>;

  const stats = data?.stats || {};
  const rows = (data?.subscriptions || []).filter((s) => {
    const q = search.toLowerCase();
    if (!q) return true;
    return (
      s.recruiterId?.fullName?.toLowerCase().includes(q) ||
      s.recruiterId?.email?.toLowerCase().includes(q) ||
      s.companyId?.name?.toLowerCase().includes(q) ||
      s.planName?.toLowerCase().includes(q)
    );
  });
  const slice = rows.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="users-page animate-fade-in">
      <div className="page-header">
        <h1>Recruiter Plans</h1>
        <p className="text-secondary">Track subscriptions, monthly job usage, revenue, and Enterprise inquiries.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper green"><Shield size={24} /></div>
          <div><h3>{stats.active || 0}</h3><p className="text-secondary">Active / trial plans</p></div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue"><Briefcase size={24} /></div>
          <div><h3>{stats.totalSubscriptions || 0}</h3><p className="text-secondary">Total subscriptions</p></div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper yellow"><IndianRupee size={24} /></div>
          <div><h3>₹{(stats.revenue || 0).toLocaleString("en-IN")}</h3><p className="text-secondary">Recruiter revenue</p></div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper amber"><CreditCard size={24} /></div>
          <div><h3>₹{(stats.monthRevenue || 0).toLocaleString("en-IN")}</h3><p className="text-secondary">This month</p></div>
        </div>
      </div>

      <div className="glass-panel content-card" style={{ marginTop: "1.5rem" }}>
        <div className="card-header" style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Shield size={20} className="accent-icon" color="#10b981" />
            <h3>Subscriptions ({rows.length})</h3>
          </div>
          <div className="search-container" style={{ position: "relative", width: 300, maxWidth: "100%" }}>
            <Search size={18} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", opacity: 0.5 }} />
            <input className="input-field" placeholder="Search recruiter, company, plan..." value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} style={{ paddingLeft: 35 }} />
          </div>
        </div>
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Recruiter</th>
                <th>Company</th>
                <th>Plan</th>
                <th>Status</th>
                <th>Jobs this month</th>
                <th>Expires</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {slice.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: "center", padding: "2rem" }}>No recruiter plans yet</td></tr>
              ) : slice.map((s) => (
                <tr key={s._id}>
                  <td>
                    <strong>{s.recruiterId?.fullName || "—"}</strong>
                    <br /><span className="text-secondary" style={{ fontSize: 12 }}>{s.recruiterId?.email}</span>
                  </td>
                  <td>{s.companyId?.name || s.recruiterId?.companyName || "—"}</td>
                  <td style={{ color: "#10b981", fontWeight: 600 }}>{s.planName || s.planId?.name}</td>
                  <td>
                    <span className={`status-badge badge-${s.status === "active" || s.status === "trial" ? "verified" : "pending"}`}>
                      {s.status}
                    </span>
                  </td>
                  <td>
                    {s.usage?.jobPostsThisMonth ?? 0}
                    {s.usage?.jobPostsLimit < 0 ? " / Unlimited" : ` / ${s.usage?.jobPostsLimit ?? "—"}`}
                  </td>
                  <td>{s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString("en-IN") : "—"}</td>
                  <td>
                    {s.companyId?._id && (
                      <Link to={`/recruiters/${s.companyId._id}`} className="btn-primary" style={{ padding: "0.4rem 0.8rem", display: "inline-flex", gap: 6, alignItems: "center", textDecoration: "none" }}>
                        <Eye size={14} /> View
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length > perPage && (
          <div style={{ padding: "1rem", borderTop: "1px solid var(--border)" }}>
            <Pagination currentPage={page} totalItems={rows.length} itemsPerPage={perPage} onPageChange={setPage} />
          </div>
        )}
      </div>

      {(data?.inquiries || []).length > 0 && (
        <div className="glass-panel content-card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <CreditCard size={20} className="accent-icon" />
            <h3>Enterprise inquiries</h3>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr><th>Date</th><th>Company</th><th>Recruiter</th><th>Notes</th></tr>
              </thead>
              <tbody>
                {data.inquiries.map((inq) => (
                  <tr key={inq._id}>
                    <td>{new Date(inq.createdAt).toLocaleString("en-IN")}</td>
                    <td>{inq.companyId?.name || "—"}</td>
                    <td>{inq.recruiterId?.fullName || inq.recruiterId?.email || "—"}</td>
                    <td>{inq.notes || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {(payments.payments || []).length > 0 && (
        <div className="glass-panel content-card" style={{ marginTop: "1.5rem" }}>
          <div className="card-header">
            <IndianRupee size={20} className="accent-icon" />
            <h3>Recruiter payments (₹{(payments.revenue || 0).toLocaleString("en-IN")})</h3>
          </div>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Recruiter</th>
                  <th>Plan</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Razorpay</th>
                </tr>
              </thead>
              <tbody>
                {payments.payments.slice(0, 50).map((p) => (
                  <tr key={p._id}>
                    <td>{new Date(p.createdAt).toLocaleString("en-IN")}</td>
                    <td>{p.recruiterId?.fullName || p.recruiterId?.email || "—"}</td>
                    <td>{p.planName}</td>
                    <td>{p.amountInr ? `₹${p.amountInr.toLocaleString("en-IN")}` : "—"}</td>
                    <td>{p.status}</td>
                    <td style={{ fontSize: 12 }}>{p.razorpayPaymentId || p.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecruiterPlans;
