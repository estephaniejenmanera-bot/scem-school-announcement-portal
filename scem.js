import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

import { useState } from "react";
import { supabase } from "./supabaseClient";

export default function Login({ setUser }) {
  const [email, setEmail] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email.endsWith("@gfis.edu.ph")) {
      alert("Please use your @gfis.edu.ph email!");
      return;
    }

    const { data, error } = await supabase.auth.signInWithOtp({ email });

    if (error) {
      alert("Login error: " + error.message);
    } else {
      setUser({ email, role: email === "admin@gfis.edu.ph" ? "admin" : "student" });
      alert("Check your email for login link!");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Enter your @gfis.edu.ph email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <button type="submit">Login</button>
    </form>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function AdminDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("General");
  const [audience, setAudience] = useState("All");

  const fetchAnnouncements = async () => {
    let { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const addAnnouncement = async () => {
    await supabase.from("announcements").insert([{ title, content, category, audience }]);
    fetchAnnouncements();
    setTitle(""); setContent("");
  };

  const deleteAnnouncement = async (id) => {
    await supabase.from("announcements").delete().eq("id", id);
    fetchAnnouncements();
  };

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <textarea placeholder="Content" value={content} onChange={(e) => setContent(e.target.value)} />
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option>General</option>
        <option>Event</option>
        <option>Academic</option>
        <option>Urgent</option>
      </select>
      <select value={audience} onChange={(e) => setAudience(e.target.value)}>
        <option>All</option>
        <option>Students</option>
        <option>Faculty</option>
      </select>
      <button onClick={addAnnouncement}>Add Announcement</button>

      <h2>Existing Announcements</h2>
      {announcements.map((a) => (
        <div key={a.id}>
          <h3>{a.title} ({a.category})</h3>
          <p>{a.content}</p>
          <p>Audience: {a.audience}</p>
          <button onClick={() => deleteAnnouncement(a.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export default function StudentDashboard() {
  const [announcements, setAnnouncements] = useState([]);
  const [search, setSearch] = useState("");

  const fetchAnnouncements = async () => {
    let { data } = await supabase.from("announcements").select("*").order("created_at", { ascending: false });
    setAnnouncements(data);
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const filtered = announcements.filter(a => a.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <h1>Student Dashboard</h1>
      <input placeholder="Search announcements..." value={search} onChange={(e) => setSearch(e.target.value)} />
      {filtered.map(a => (
        <div key={a.id} style={{ border: "1px solid gray", margin: "10px", padding: "10px" }}>
          <h3>{a.title} ({a.category})</h3>
          <p>{a.content}</p>
        </div>
      ))}
    </div>
  );
}
import { useState } from "react";
import Login from "./Login";
import AdminDashboard from "./AdminDashboard";
import StudentDashboard from "./StudentDashboard";

function App() {
  const [user, setUser] = useState(null);

  if (!user) return <Login setUser={setUser} />;

  return user.role === "admin" ? <AdminDashboard /> : <StudentDashboard />;
}

