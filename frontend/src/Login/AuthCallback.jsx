import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token  = params.get("token");
    const user   = params.get("user");
    const error  = params.get("error");

    if (error || !token) {
      navigate("/auth?error=google_failed", { replace: true });
      return;
    }

    try {
      localStorage.setItem("token", token);
      localStorage.setItem("user", user);
      navigate("/interview", { replace: true });
    } catch {
      navigate("/auth", { replace: true });
    }
  }, [navigate]);

  return (
    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", minHeight:"100vh", flexDirection:"column", gap:16, background:"#f8fafc" }}>
      <div style={{ width:44, height:44, border:"3.5px solid #e0e7ff", borderTopColor:"#4f46e5", borderRadius:"50%", animation:"spin 0.7s linear infinite" }} />
      <p style={{ color:"#64748b", fontSize:15, fontWeight:500 }}>Signing you in with Google...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

export default AuthCallback;
