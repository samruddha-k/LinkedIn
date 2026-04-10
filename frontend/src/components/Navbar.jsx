import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div style={{
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 20px",
      background: "#0a66c2",
      color: "white"
    }}>
      <div style={{ fontWeight: "bold" }}>Sam's LinkedIn </div>

      <div style={{ display: "flex", gap: 20 }}>
        <Link style={{ color: "white" }} to="/feed">Feed</Link>
        <Link style={{ color: "white" }} to="/members">Members</Link>
        <Link style={{ color: "white" }} to="/profile">My Profile</Link>
        <Link style={{ color: "white" }} to="/graph">Network</Link>
      </div>

      <button onClick={logout} style={{
        background: "white",
        color: "#0a66c2",
        border: "none",
        padding: "6px 10px",
        borderRadius: 5
      }}>
        Logout
      </button>
    </div>
  );
}