/* src/App.tsx */
import { useState, type FormEvent } from "react";
import "./App.css";
import digisolLogo from "./assets/DIGISOL LOGO.jpg";
import ErrorModal from "./components/ErrorModal";

// 1. Categories from your image
const categories = [
  "Employee of the Year",
  "Team Spirit & Collaboration",
  "Innovation & Initiative",
];

// 2. Months
const months = ["Sept", "Oct", "Nov"];

// 3. The 11 Names for the Dropdown (Edit these to match your real team)
const colleagues = [
  "Ebeh",
  "Samuel",
  "Elvis",
  "Cecilia",
  "Eugene",
  "Steph",
  "Favour",
  "Gael",
  "Partemus",
  "Marinette",
  "Love",
];

interface VoteData {
  [category: string]: {
    [month: string]: string;
  };
}

function App() {
  const [userName, setUserName] = useState("");
  const [votes, setVotes] = useState<VoteData>({});
  const [nameError, setNameError] = useState(false);
  const [focusedCard, setFocusedCard] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<{ title: string; message: string } | null>(null);

  const handleVoteChange = (category: string, month: string, value: string) => {
    setVotes((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [month]: value,
      },
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setNameError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("https://voting-system-backend-k32s.onrender.com/api/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userName, votes }),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError({
          title: "Failed to Submit Vote",
          message: errorData.message || "There was an issue submitting your vote. Please check your selections and try again."
        });
      }
    } catch (error) {
      console.error("Network error:", error);
      setError({
        title: "Connection Error",
        message: "Could not connect to the server. Please check your internet connection and try again."
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="form-container">
        <div className="success-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <img 
              src={digisolLogo} 
              alt="Digisol Logo" 
              style={{ 
                height: '60px', 
                width: 'auto', 
                objectFit: 'contain'
              }} 
            />
          </div>
          <h1 className="header-title">Vote Received!</h1>
          <p className="header-desc">
            Thanks, {userName}. Your nominations have been secured.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit}>
        {/* Header */}
        <div className="header-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
            <img 
              src={digisolLogo} 
              alt="Digisol Logo" 
              style={{ 
                height: '60px', 
                width: 'auto', 
                objectFit: 'contain'
              }} 
            />
          </div>
          <h1 className="header-title">Quarterly Voting</h1>
          <p className="header-desc">
            Please cast your nominations for Sept, Oct, and Nov below.
          </p>
        </div>

        <div
          className={`card ${focusedCard === "name" ? "focused" : ""}`}
          onClick={() => setFocusedCard("name")}
        >
          <h2 className="section-title">Your Details</h2>
          <div className="input-group">
            <label className="input-label">
              Full Name<span className="required-star">* </span>
              <span style={{ fontSize: "14px", fontWeight: "normal" }}>
                (Your name will remain anonymous).
              </span>
            </label>
            <input
              type="text"
              className={`text-input ${nameError ? "error" : ""}`}
              placeholder="e.g. John Doe"
              value={userName}
              onChange={(e) => {
                setUserName(e.target.value);
                if (e.target.value) setNameError(false);
              }}
              onFocus={() => setFocusedCard("name")}
            />
            {nameError && (
              <div className="error-msg">
                Please enter your name to proceed.
              </div>
            )}
          </div>
        </div>

        {/* 2. Dynamic Categories with Dropdowns */}
        {categories.map((category, index) => (
          <div
            key={category}
            className={`card ${focusedCard === `cat-${index}` ? "focused" : ""}`}
            onClick={() => setFocusedCard(`cat-${index}`)}
          >
            <h2 className="section-title">{category}</h2>

            {months.map((month) => (
              <div key={month} className="input-group">
                <label className="input-label">{month} Nomination</label>

                {/* CHANGED: Input is now a Select */}
                <select
                  className="text-input select-input"
                  value={votes[category]?.[month] || ""}
                  onChange={(e) =>
                    handleVoteChange(category, month, e.target.value)
                  }
                  onFocus={() => setFocusedCard(`cat-${index}`)}
                >
                  <option value="">Select a colleague...</option>
                  {colleagues.map((name) => (
                    <option key={name} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        ))}

        {/* Buttons */}
        <div className="action-bar">
          <button 
            type="submit" 
            className="submit-btn"
            disabled={isLoading}
            style={{
              opacity: isLoading ? 0.7 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              position: 'relative'
            }}
          >
            {isLoading ? (
              <>
                <span style={{ opacity: 0.5 }}>Submit Votes</span>
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <div
                    style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid #ffffff',
                      borderTop: '2px solid transparent',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }}
                  />
                  <span>Submitting...</span>
                </div>
              </>
            ) : (
              'Submit Votes'
            )}
          </button>
          <button
            type="button"
            className="clear-btn"
            disabled={isLoading}
            onClick={() => {
              if (confirm("Are you sure you want to clear the form?")) {
                setVotes({});
                setUserName("");
                window.scrollTo(0, 0);
              }
            }}
            style={{
              opacity: isLoading ? 0.5 : 1,
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            Clear Form
          </button>
        </div>
        
        {/* Add CSS for spinner animation */}
        <style>{`
          @keyframes spin {
            0% { transform: translate(-50%, -50%) rotate(0deg); }
            100% { transform: translate(-50%, -50%) rotate(360deg); }
          }
        `}</style>
      </form>
      
      {/* Error Modal */}
      <ErrorModal
        isOpen={!!error}
        onClose={() => setError(null)}
        title={error?.title}
        message={error?.message || ""}
        onRetry={() => {
          setError(null);
          handleSubmit({ preventDefault: () => {} } as FormEvent);
        }}
      />
    </div>
  );
}

export default App;
