/* src/AdminPanel.tsx */
import { useEffect, useState } from "react";
import "./App.css"; // Reuse the same styling





interface Winner {
  nominee: string;
  votes: number;
  rank: number;
}

interface WinnerReport {
  [category: string]: {
    monthly: {
      [month: string]: Winner[];
    };
    overall: Winner[];
  };
}



export default function AdminPanel() {

  const [winnerReport, setWinnerReport] = useState<WinnerReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [totalVotes, setTotalVotes] = useState(0);


  useEffect(() => {
    Promise.all([
      fetch("http://localhost:5000/api/votes/summary").then(res => res.json()),
      fetch("http://localhost:5000/api/votes").then(res => res.json())
    ])
      .then(([detailedData, votesData]) => {
        setTotalVotes(votesData.count);
        
        // Calculate winners
        const winners: WinnerReport = {};
        
        Object.keys(detailedData.categories).forEach(category => {
        winners[category] = {
          monthly: {},
          overall: []
        };          // Calculate monthly winners (top 2)
          detailedData.months.forEach((month: string) => {
            const monthVotes = Object.entries(detailedData.categories[category][month])
              .map(([nominee, votes]) => ({ nominee, votes: votes as number }))
              .filter(item => item.votes > 0)
              .sort((a, b) => b.votes - a.votes)
              .slice(0, 2)
              .map((item, index) => ({ ...item, rank: index + 1 }));
            
            winners[category].monthly[month] = monthVotes;
          });
          
          let overallCounts: { [nominee: string]: number } = {};
          detailedData.months.forEach((month: string) => {
            Object.entries(detailedData.categories[category][month]).forEach(([nominee, votes]) => {
              const voteCount = votes as number;
              if (voteCount > 0) {
                overallCounts[nominee] = (overallCounts[nominee] || 0) + voteCount;
              }
            });
          });
          
          const overallWinners = Object.entries(overallCounts)
            .map(([nominee, votes]) => ({ nominee, votes }))
            .sort((a, b) => b.votes - a.votes)
            .slice(0, 2)
            .map((item, index) => ({ ...item, rank: index + 1 }));
          
          winners[category].overall = overallWinners;
        });
        
        setWinnerReport(winners);
        console.log('Winner report:', winners);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching data:', err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="form-container">Loading results...</div>;

  const renderWinnersList = (winners: Winner[], isOverall = false) => {
    if (!winners || winners.length === 0) {
      return <span style={{ color: "#6b7280" }}>No votes</span>;
    }
    
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {winners.map((winner) => {
          const isFirst = winner.rank === 1;
          const isSecond = winner.rank === 2;
          
          return (
            <div key={winner.nominee} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ 
                fontSize: isOverall && isFirst ? '1.1em' : '1em', 
                fontWeight: isOverall && isFirst ? 600 : 500,
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {isFirst ? '👑' : '🥈'} {winner.nominee}
              </span>
              <span
                style={{
                  background: isFirst ? (isOverall ? "#dc2626" : "#0f766e") : "#6b7280",
                  color: "white",
                  padding: "2px 8px",
                  borderRadius: "12px",
                  fontSize: "0.8em",
                  fontWeight: 500
                }}
              >
                {winner.votes} votes
              </span>
              {isFirst && (
                <span
                  style={{
                    background: isOverall ? "#fbbf24" : "#10b981",
                    color: isOverall ? "#92400e" : "white",
                    padding: "2px 6px",
                    borderRadius: "8px",
                    fontSize: "0.7em",
                    fontWeight: 600
                  }}
                >
                  {isOverall ? '🏆 WINNER' : '1ST'}
                </span>
              )}
              {isSecond && (
                <span
                  style={{
                    background: "#f59e0b",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "8px",
                    fontSize: "0.7em",
                    fontWeight: 600
                  }}
                >
                  2ND
                </span>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="form-container" style={{ maxWidth: "900px" }}>
      <div className="header-card">
        <h1 className="header-title">Voting Results Dashboard</h1>
        <p className="header-desc">
          Winner reports showing monthly and overall champions. Total submissions: {totalVotes}
        </p>

      </div>

      {/* Winner Report */}
      {winnerReport && (
        <div>
          {Object.keys(winnerReport).map((category) => (
            <div key={category} className="card">
              <h2 className="section-title">{category}</h2>
              
              {/* Overall Winners */}
              <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                background: 'linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%)',
                borderRadius: '8px',
                border: '2px solid #f59e0b'
              }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#92400e', fontSize: '1.1em' }}>
                  🏆 Overall Rankings (All Months Combined)
                </h3>
                {renderWinnersList(winnerReport[category].overall, true)}
              </div>
              
              {/* Monthly Rankings */}
              <h3 style={{ marginBottom: '15px', color: '#374151' }}>Monthly Rankings</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '15px' }}>
                {Object.entries(winnerReport[category].monthly).map(([month, winners]) => (
                  <div key={month} style={{
                    padding: '12px',
                    background: '#f8fafc',
                    borderRadius: '6px',
                    border: '1px solid #e2e8f0'
                  }}>
                    <h4 style={{ margin: '0 0 12px 0', color: '#475569', fontSize: '0.9em', fontWeight: 600 }}>{month}</h4>
                    {renderWinnersList(winners)}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
