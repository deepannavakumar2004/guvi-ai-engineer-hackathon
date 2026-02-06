import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [business, setBusiness] = useState("");
  const navigate = useNavigate();

  const register = async () => {
    const res = await fetch("http://127.0.0.1:8000/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        business_name: business
      })
    });

    if (res.ok) {
      alert("Registered successfully! You got 5 free credits.");
      navigate("/login");
    } else {
      alert("User already exists");
    }
  };

  return (
    <div className="center">
      <h2>Register Business</h2>
      <input placeholder="Business Name" onChange={e => setBusiness(e.target.value)} />
      <input placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input placeholder="Password" type="password" onChange={e => setPassword(e.target.value)} />
      <button onClick={register}>Register</button>
    </div>
  );
}
