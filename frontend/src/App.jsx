import { useState } from "react";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Auth state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);
  
  const handleSubscribe = async (creditsToAdd) => {
  const res = await fetch("https://guvi-ai-engineer-hackathon.onrender.com/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: user.email,
      credits: creditsToAdd,
    }),
  });

  if (!res.ok) {
    alert("Subscription failed");
    return;
  }

  const data = await res.json();

  setUser({
    ...user,
    credits: data.credits,
  });

  setShowSubscribe(false);
  alert("Subscription successful! Credits added.");
};


  // ---------------- REGISTER ----------------
  const handleRegister = async () => {
    if (!email || !password || !businessName) {
      alert("Please fill all fields");
      return;
    }

    const res = await fetch("https://guvi-ai-engineer-hackathon.onrender.com/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        business_name: businessName,
      }),
    });

    if (!res.ok) {
      alert("User already exists");
      return;
    }

    alert("Registered successfully! You received 5 free credits.");
    setIsRegister(false);
  };

  // ---------------- LOGIN ----------------
  const handleLogin = async () => {
    const res = await fetch("https://guvi-ai-engineer-hackathon.onrender.com/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      alert("Invalid login");
      return;
    }

    const data = await res.json();
    setUser(data);
  };

  // ---------------- ANALYZE ----------------
  const handleUpload = async () => {
    if (!file) {
      alert("Please upload a CSV file");
      return;
    }

    if (!user || user.credits <= 0) {
  setShowSubscribe(true);
  return;
}


    setLoading(true);
    setResult(null);

    const formData = new FormData();
    formData.append("email", user.email);
    formData.append("file", file);

    try {
      const response = await fetch("https://guvi-ai-engineer-hackathon.onrender.com/analyze", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        alert("Analysis failed");
        setLoading(false);
        return;
      }

      const data = await response.json();
      setResult(data);

      setUser({
        ...user,
        credits: data.credits_left,
      });
    } catch {
      alert("Error connecting to backend");
    }

    setLoading(false);
  };

  const score = result?.metrics.financial_health_score || 0;
  const scoreClass =
    score >= 70 ? "green" : score >= 40 ? "orange" : "red";
  const maxValue = result
  ? Math.max(
      result.metrics.total_revenue,
      result.metrics.total_expenses,
      Math.abs(result.metrics.profit),
      Math.abs(result.metrics.cash_flow)
    )
  : 1;

  return (
    <div className="app">
      <div className="wrapper">
        <h1>SME Financial Health Assessment</h1>

        {/* LOGIN / REGISTER */}
        {!user && (
          <div className="login-box">
            <h2>{isRegister ? "Business Registration" : "Business Login"}</h2>

            {isRegister && (
              <input
                placeholder="Business Name"
                onChange={(e) => setBusinessName(e.target.value)}
              />
            )}

            <input
              placeholder="Email"
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              placeholder="Password"
              onChange={(e) => setPassword(e.target.value)}
            />

            {isRegister ? (
              <button onClick={handleRegister}>Register</button>
            ) : (
              <button onClick={handleLogin}>Login</button>
            )}

            <p
              style={{ marginTop: "10px", fontSize: "14px", cursor: "pointer" }}
              onClick={() => setIsRegister(!isRegister)}
            >
              {isRegister
                ? "Already have an account? Login"
                : "New user? Register here"}
            </p>
          </div>
        )}

        {/* DASHBOARD */}
        {user && (
          <>
            <p style={{ marginBottom: "10px" }}>
              <b>Logged in as:</b> {user.email} |{" "}
              <b>Credits:</b> {user.credits}
            </p>

            <div className="upload">
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files[0])}
              />
              <button onClick={handleUpload} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze"}
              </button>
            </div>
          </>
        )}
        {/* SUBSCRIPTION PAGE */}
{showSubscribe && (
  <div className="subscribe-box">
    <h2>Choose a Subscription Plan</h2>

    <div className="plans">
      <div className="plan">
        <h3>Starter</h3>
        <p>₹199</p>
        <p>20 Credits</p>
        <button onClick={() => handleSubscribe(20)}>
          Subscribe
        </button>
      </div>

      <div className="plan popular">
        <h3>Pro</h3>
        <p>₹499</p>
        <p>100 Credits</p>
        <button onClick={() => handleSubscribe(100)}>
          Subscribe
        </button>
      </div>

      <div className="plan">
        <h3>Enterprise</h3>
        <p>Custom</p>
        <p>Unlimited Credits</p>
        <button onClick={() => handleSubscribe(500)}>
          Contact Sales
        </button>
      </div>
    </div>
  </div>
)}

        {/* RESULTS */}
        {result && (
          <>
            {/* METRIC CARDS */}
            <div className="cards">
              <div className="card blue">
                <h3>Total Revenue</h3>
                <p>₹ {result.metrics.total_revenue}</p>
              </div>

              <div className="card red">
                <h3>Total Expenses</h3>
                <p>₹ {result.metrics.total_expenses}</p>
              </div>

              <div className="card green">
                <h3>Profit</h3>
                <p>₹ {result.metrics.profit}</p>
              </div>

              <div className="card cyan">
                <h3>Cash Flow</h3>
                <p>₹ {result.metrics.cash_flow}</p>
              </div>
            </div>

            {/* SCORE */}
            <div className="score-center">
              <div className={`card score-card ${scoreClass}`}>
                <h3>Financial Health Score</h3>
                <p>{score}/100</p>
              </div>
            </div>

            {/* BAR CHART */}
            <div className="chart">
  <h2>Financial Overview</h2>

  <div
    className="bar revenue"
    style={{
      width: `${(result.metrics.total_revenue / maxValue) * 100}%`,
    }}
  >
    Revenue: ₹ {result.metrics.total_revenue}
  </div>

  <div
    className="bar expenses"
    style={{
      width: `${(result.metrics.total_expenses / maxValue) * 100}%`,
    }}
  >
    Expenses: ₹ {result.metrics.total_expenses}
  </div>

  <div
    className="bar profit"
    style={{
      width: `${(Math.abs(result.metrics.profit) / maxValue) * 100}%`,
    }}
  >
    Profit: ₹ {result.metrics.profit}
  </div>

  <div
    className="bar cashflow"
    style={{
      width: `${(Math.abs(result.metrics.cash_flow) / maxValue) * 100}%`,
    }}
  >
    Cash Flow: ₹ {result.metrics.cash_flow}
  </div>
</div>


            {/* INSIGHTS */}
            <div className="insights">
              <h2>Insights</h2>
              <p><b>Risk:</b> {result.insights.risk}</p>
              <p><b>Suggestion:</b> {result.insights.suggestion}</p>
              <p><b>Creditworthiness:</b> {result.insights.creditworthiness}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default App;
