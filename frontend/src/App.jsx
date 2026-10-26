
import { useEffect, useState } from "react";
import {
  Clapperboard, LayoutDashboard, BriefcaseBusiness, CircleCheck,
  Clock3, IndianRupee, Plus, Search, Pencil, Trash2, X,
  Video, Film, RefreshCw, AlertCircle, CheckCircle2
} from "lucide-react";
import api from "./services/api";
import "./App.css";

const emptyForm = {
  clientName: "",
  videoType: "",
  fee: "",
  completed: false,
};

function App() {
  const [jobs, setJobs] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadJobs = async () => {
    setLoading(true);
    try {
      const response = await api.get("/displayall");
      setJobs(response.data);
      setError("");
    } catch {
      setError(
        "Could not connect to the backend. Make sure Spring Boot is running on port 2007."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const notify = (text) => {
    setMessage(text);
    setError("");
    window.setTimeout(() => setMessage(""), 3000);
  };

  const openAddForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (job) => {
    setForm({
      clientName: job.clientName,
      videoType: job.videoType,
      fee: String(job.fee),
      completed: job.completed,
    });
    setEditingId(job.id);
    setShowForm(true);
  };

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError("");

    try {
      const payload = {
        clientName: form.clientName.trim(),
        videoType: form.videoType.trim(),
        fee: Number(form.fee),
        completed: form.completed,
      };

      if (editingId !== null) {
        await api.put(`/update/${editingId}`, payload);
        notify("Job updated successfully!");
      } else {
        await api.post("/add", payload);
        notify("New job added successfully!");
      }

      setShowForm(false);
      setForm(emptyForm);
      setEditingId(null);
      await loadJobs();
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Unable to save the job. Please check your input and backend."
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteJob = async (id) => {
    if (!window.confirm(`Are you sure you want to delete job #${id}?`)) {
      return;
    }

    try {
      await api.delete(`/delete/${id}`);
      setJobs((previous) => previous.filter((job) => job.id !== id));
      notify("Job deleted successfully!");
    } catch {
      setError("Unable to delete this job. Please try again.");
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const query = search.trim().toLowerCase();
    return (
      String(job.id).includes(query) ||
      job.clientName.toLowerCase().includes(query) ||
      job.videoType.toLowerCase().includes(query)
    );
  });

  const completed = jobs.filter((job) => job.completed).length;
  const pending = jobs.length - completed;
  const totalFees = jobs.reduce((sum, job) => sum + Number(job.fee || 0), 0);

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon"><Clapperboard size={25} /></div>
          <div>
            <h2>FrameFlow</h2>
            <span>VIDEO STUDIO</span>
          </div>
        </div>

        <div className="menu-label">WORKSPACE</div>
        <div className="nav-item active">
          <LayoutDashboard size={19} />
          <span>Dashboard</span>
        </div>
        <div className="nav-item" onClick={() =>
          document.getElementById("jobs-section")?.scrollIntoView({
            behavior: "smooth"
          })
        }>
          <BriefcaseBusiness size={19} />
          <span>Editing Jobs</span>
        </div>

        <div className="sidebar-bottom">
          <div className="sidebar-art"><Video size={25} /></div>
          <strong>Your creative workspace</strong>
          <p>Keep every editing project organized in one place.</p>
          <div className="connection"><span /> Local workspace</div>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <div className="breadcrumb">Workspace / Dashboard</div>
            <h1>Video Editing Dashboard</h1>
          </div>
          <button className="primary-btn" onClick={openAddForm}>
            <Plus size={18} /> Add New Job
          </button>
        </header>

        {message && (
          <div className="notice success"><CheckCircle2 size={18} />{message}</div>
        )}
        {error && (
          <div className="notice error">
            <AlertCircle size={18} /><span>{error}</span>
            <button className="icon-btn" onClick={() => setError("")}><X size={17}/></button>
          </div>
        )}

        <section className="welcome">
          <div>
            <span className="eyebrow">YOUR STUDIO OVERVIEW</span>
            <h2>Make every frame count.</h2>
            <p>Manage your clients, track projects, and stay on top of every edit.</p>
          </div>
          <div className="welcome-icon"><Clapperboard size={70} strokeWidth={1.2}/></div>
        </section>

        <section className="stats-grid">
          <StatCard title="Total Jobs" value={jobs.length} subtitle="All editing projects"
            icon={<BriefcaseBusiness />} color="blue" />
          <StatCard title="Completed" value={completed} subtitle="Successfully finished"
            icon={<CircleCheck />} color="green" />
          <StatCard title="Pending" value={pending} subtitle="Still in progress"
            icon={<Clock3 />} color="orange" />
          <StatCard title="Total Fees" value={totalFees.toLocaleString("en-IN", {
            style: "currency", currency: "INR", maximumFractionDigits: 2
          })} subtitle="Across all jobs"
            icon={<IndianRupee />} color="purple" />
        </section>

        <section className="jobs-panel" id="jobs-section">
          <div className="panel-header">
            <div>
              <h2>Editing Jobs</h2>
              <p>View and manage all your video projects.</p>
            </div>
            <button className="secondary-btn" onClick={loadJobs} disabled={loading}>
              <RefreshCw size={16} className={loading ? "spin" : ""}/> Refresh
            </button>
          </div>

          <div className="table-toolbar">
            <div className="search-box">
              <Search size={18}/>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search by ID, client or video type..."
              />
              {search && <button className="clear-search" onClick={() => setSearch("")}><X size={15}/></button>}
            </div>
            <span className="result-count">{filteredJobs.length} jobs found</span>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>JOB ID</th>
                  <th>CLIENT</th>
                  <th>VIDEO TYPE</th>
                  <th>FEE</th>
                  <th>STATUS</th>
                  <th>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" className="empty-state">Loading jobs...</td></tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      <Film size={34}/>
                      <strong>{search ? "No matching jobs" : "No jobs added yet"}</strong>
                      <span>{search ? "Try another search." : "Add your first video editing job to get started."}</span>
                      {!search && <button className="primary-btn" onClick={openAddForm}><Plus size={16}/> Add Job</button>}
                    </td>
                  </tr>
                ) : filteredJobs.map((job) => (
                  <tr key={job.id}>
                    <td><span className="job-id">#{job.id}</span></td>
                    <td>
                      <div className="client-cell">
                        <div className="client-avatar">{job.clientName.charAt(0).toUpperCase()}</div>
                        <span>{job.clientName}</span>
                      </div>
                    </td>
                    <td><span className="video-type"><Film size={15}/>{job.videoType}</span></td>
                    <td className="fee-cell">{Number(job.fee).toLocaleString("en-IN", {
                      style: "currency", currency: "INR", maximumFractionDigits: 2
                    })}</td>
                    <td>
                      <span className={`status ${job.completed ? "completed" : "pending"}`}>
                        <span/>{job.completed ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="actions">
                        <button className="action-btn edit" title="Edit job" onClick={() => openEditForm(job)}><Pencil size={16}/></button>
                        <button className="action-btn delete" title="Delete job" onClick={() => deleteJob(job.id)}><Trash2 size={16}/></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="table-footer">FrameFlow · Video Editing Job Management</div>
        </section>

        <footer className="page-footer">Made for your creative workflow <span>♥</span></footer>
      </main>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="job-modal" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="eyebrow">{editingId !== null ? "EDIT PROJECT" : "NEW PROJECT"}</span>
                <h2>{editingId !== null ? "Update editing job" : "Add editing job"}</h2>
                <p>Enter the details of your video editing project.</p>
              </div>
              <button className="icon-btn" onClick={() => setShowForm(false)}><X size={21}/></button>
            </div>

            <form onSubmit={handleSubmit}>
              <label>Client name
                <input name="clientName" value={form.clientName} onChange={handleChange}
                  placeholder="e.g. Rahul Sharma" required maxLength={100}/>
              </label>
              <label>Video type
                <select name="videoType" value={form.videoType} onChange={handleChange} required>
                  <option value="">Select video type</option>
                  <option>Wedding Video</option>
                  <option>YouTube Video</option>
                  <option>Birthday Video</option>
                  <option>Instagram Reel</option>
                  <option>Corporate Video</option>
                  <option>Travel Video</option>
                  <option>Music Video</option>
                  <option>Product Advertisement</option>
                  <option>Educational Video</option>
                  <option>Documentary Video</option>
                  <option>Other</option>
                </select>
              </label>
              <label>Editing fee (₹)
                <input name="fee" type="number" min="0" step="0.01"
                  value={form.fee} onChange={handleChange} placeholder="Enter fee" required/>
              </label>
              <label className="checkbox-label">
                <input name="completed" type="checkbox" checked={form.completed}
                  onChange={handleChange}/>
                <span>Mark this job as completed</span>
              </label>

              <div className="modal-actions">
                <button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="primary-btn" disabled={saving}>
                  {saving ? "Saving..." : editingId !== null ? "Save Changes" : "Add Job"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, subtitle, icon, color }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${color}`}>{icon}</div>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-subtitle">{subtitle}</div>
    </div>
  );
}

export default App;
