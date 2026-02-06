import { useState } from "react";

export default function Dashboard({ user, setUser }) {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = async () => {
    if (user.credits <= 0) {
      alert("No credits left. Please subscribe.");
      return;
    }

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("file", file);

    const res = await fetch("http://127.0.0.1:8000/analyze", {
      method: "POST",
      body: formData
    });

    if (!res.ok) {
      alert("Analysis failed");
      return;
    }

    const data = await res.json();
    setResult(data);
    setUser({ ...user, credits: data.credits_left });
    localStorage.setItem("user", JSON.stringify({ ...user, credits: data.credits_left }));
  };

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Credits Remaining: {user.credits}</p>

      <input type="file" onChange={e => setFile(e.target.files[0])} />
      <button onClick={analyze}>Analyze</button>

      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}
