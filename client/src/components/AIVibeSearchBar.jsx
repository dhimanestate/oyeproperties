import React, { useState } from 'react';
import { API_BASE, getMediaUrl } from '../config';
import { Sparkles, Search, X, Zap } from 'lucide-react';

export default function AIVibeSearchBar({
  isOpen,
  onClose,
  onOpenDetail,
  onWatchReel
}) {
  if (!isOpen) return null;

  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [searched, setSearched] = useState(false);

  const EXAMPLE_PROMPTS = [
    'Sea facing penthouse with private infinity pool in Mumbai under 20 Cr',
    'Golf course greens duplex in Gurgaon Camellias',
    'Portuguese restored heritage villa with pool in Goa',
    'Palm Jumeirah beachfront villa in Dubai with private yacht access'
  ];

  const handleSearch = async (text) => {
    const q = text || prompt;
    if (!q.trim()) return;

    setLoading(true);
    setSearched(true);
    if (text) setPrompt(text);

    try {
      const res = await fetch(`${API_BASE}/api/ai/vibe-search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q })
      });
      const data = await res.json();
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '740px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '24px 20px',
          position: 'relative',
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #E71D2B 0%, #C41523 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
              flexShrink: 0
            }}>
              <Sparkles size={18} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                AI Vibe & Architectural Matchmaker
              </h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Search residences by locality, builder, price, or lifestyle vibe
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
            title="Close"
          >
            <X size={16} />
          </button>
        </div>

        {/* Input Bar */}
        <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} style={{ marginBottom: '16px' }}>
          <div style={{
            position: 'relative',
            background: 'var(--bg-secondary)',
            border: '1.5px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '4px 6px 4px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)'
          }}>
            <Search size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
            <input
              id="ai-prompt-input"
              type="text"
              placeholder="e.g. Sea facing penthouse in Mumbai under 25 Cr..."
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              style={{
                flex: 1,
                minWidth: 0,
                background: 'transparent',
                border: 'none',
                color: 'var(--text-primary)',
                fontSize: '13.5px',
                outline: 'none',
                padding: '8px 0'
              }}
            />
            {prompt && (
              <button
                type="button"
                onClick={() => setPrompt('')}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={14} />
              </button>
            )}
            <button
              id="btn-ai-search-submit"
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{ 
                padding: '8px 16px', 
                fontSize: '12.5px', 
                borderRadius: 'var(--radius-full)',
                whiteSpace: 'nowrap',
                flexShrink: 0 
              }}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
        </form>

        {/* Suggested Quick Prompts */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
            Popular Lifestyles & Areas:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {EXAMPLE_PROMPTS.map((ex, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSearch(ex)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-full)',
                  padding: '5px 11px',
                  color: 'var(--text-secondary)',
                  fontSize: '11.5px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'var(--accent-primary)';
                  e.currentTarget.style.color = 'var(--accent-primary)';
                  e.currentTarget.style.background = '#FFF0F1';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.background = 'var(--bg-secondary)';
                }}
              >
                ✨ {ex}
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        {searched && (
          <div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span>Matches Found ({results.length})</span>
            </div>

            {results.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '24px 12px', color: 'var(--text-muted)', fontSize: '13px' }}>
                No direct match found. Try searching with terms like "penthouse", "sea view", "Worli", "Bandra", or "pool".
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {results.map(res => (
                  <div
                    key={res.id}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: '12px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      alignItems: 'center',
                      gap: '12px',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={getMediaUrl(res.images?.[0])}
                      alt={res.title}
                      style={{ width: '74px', height: '74px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: '160px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '10.5px', color: 'var(--accent-primary)', fontWeight: 700 }}>
                          {res.propertyType}
                        </span>
                        <span style={{ fontSize: '10.5px', color: 'var(--text-muted)' }}>
                          • {res.location.locality}, {res.location.city}
                        </span>
                      </div>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', margin: '2px 0' }}>
                        {res.title}
                      </h4>
                      <div style={{
                        fontFamily: 'var(--font-display)',
                        fontSize: '15px',
                        fontWeight: 800,
                        color: 'var(--accent-primary)'
                      }}>
                        {res.priceFormatted}
                      </div>

                      {/* AI Vibe Reasons Tags */}
                      {res.matchReasons && res.matchReasons.length > 0 && (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                          {res.matchReasons.map((reason, idx) => (
                            <span
                              key={idx}
                              style={{
                                background: '#FFF0F1',
                                color: '#E71D2B',
                                border: '1px solid rgba(231, 29, 43, 0.25)',
                                fontSize: '9.5px',
                                padding: '2px 6px',
                                borderRadius: '4px',
                                fontWeight: 600
                              }}
                            >
                              ✓ {reason}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '6px', marginLeft: 'auto', flexShrink: 0 }}>
                      {res.reelVideo && (
                        <button
                          onClick={() => {
                            onClose();
                            onWatchReel(res);
                          }}
                          className="btn-secondary"
                          style={{ fontSize: '11px', padding: '6px 10px', height: '32px' }}
                        >
                          <Zap size={13} />
                          Instant
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onClose();
                          onOpenDetail(res);
                        }}
                        className="btn-primary"
                        style={{ fontSize: '11px', padding: '6px 12px', height: '32px' }}
                      >
                        Details
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
