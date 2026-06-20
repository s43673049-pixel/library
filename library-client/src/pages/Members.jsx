import { useEffect, useState } from "react";
import { addMember, getMembers } from "../services/api";
import MainLayout from "../layout/Mainlayout";

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  const loadMembers = async () => {
    try {
      setError("");
      setLoading(true);
      const res = await getMembers();
      setMembers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load members.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMembers();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();
    const cleanPhone = phone.trim();

    if (!cleanName) {
      setAddError("Member name is required.");
      return;
    }

    try {
      setAdding(true);
      await addMember({
        name: cleanName,
        email: cleanEmail || null,
        phone: cleanPhone || null,
      });
      setName("");
      setEmail("");
      setPhone("");
      await loadMembers();
    } catch (err) {
      console.error(err);
      setAddError(err?.response?.data?.message || "Failed to add member.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <MainLayout>
      <div className="page-header">
        <h1>Members</h1>
        <p>Add and manage library members.</p>
      </div>

      <div className="card" style={{ marginBottom: "1.25rem" }}>
        <h2 className="card__title" style={{ marginBottom: "0.9rem" }}>
          Add a member
        </h2>

        {addError ? (
          <div className="status status--error" style={{ marginBottom: "1rem" }}>
            {addError}
          </div>
        ) : null}

        <form onSubmit={handleAdd}>
          <div className="form-row">
            <div className="field">
              <label htmlFor="m-name">Name</label>
              <input
                id="m-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Member name"
              />
            </div>
            <div className="field">
              <label htmlFor="m-email">Email (optional)</label>
              <input
                id="m-email"
                className="input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
              />
            </div>
            <div className="field">
              <label htmlFor="m-phone">Phone (optional)</label>
              <input
                id="m-phone"
                className="input"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555..."
              />
            </div>
            <button className="btn btn--primary" type="submit" disabled={adding}>
              {adding ? "Adding..." : "Add member"}
            </button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="status" role="status">
          <span className="spinner" aria-hidden /> Loading members...
        </div>
      ) : error ? (
        <div className="status status--error">{error}</div>
      ) : (
        <div className="card">
          <h2 className="card__title" style={{ marginBottom: "0.9rem" }}>
            Member list
          </h2>

          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>{m.email || "—"}</td>
                    <td>{m.phone || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </MainLayout>
  );
}

