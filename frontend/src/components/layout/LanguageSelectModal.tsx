import React, { useState } from 'react';
import { X, Search, Check, Globe } from 'lucide-react';
import { useLanguage, ALL_WORLD_LANGUAGES, LanguageCode } from '../../context/LanguageContext.js';

export interface LanguageSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LanguageSelectModal: React.FC<LanguageSelectModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage } = useLanguage();
  const [searchQuery, setSearchQuery] = useState('');

  if (!isOpen) return null;

  const filtered = ALL_WORLD_LANGUAGES.filter(
    l =>
      l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.native.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelect = (code: string) => {
    setLanguage(code as LanguageCode);
    onClose();
  };

  return (
    <div className="lang-modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="lang-modal-card" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="lang-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color="var(--color-primary-blue)" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: 'var(--color-text-primary)' }}>
              Select Your Language
            </h3>
          </div>
          <button type="button" onClick={onClose} className="lang-close-btn" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="lang-search-box">
          <Search size={16} color="#94A3B8" />
          <input
            type="text"
            placeholder="Search language or country..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            autoFocus
          />
        </div>

        {/* Language Grid */}
        <div className="lang-grid-container">
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#64748B' }}>
              No languages matching &quot;{searchQuery}&quot;
            </div>
          ) : (
            filtered.map(l => {
              const isSelected = currentLanguage === l.code;
              return (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => handleSelect(l.code)}
                  className={`lang-option-btn ${isSelected ? 'selected' : ''}`}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: isSelected ? 700 : 500, fontSize: '14px', color: isSelected ? 'var(--color-primary-blue)' : 'var(--color-text-primary)' }}>
                      {l.native}
                    </span>
                    <span style={{ fontSize: '12px', color: '#64748B' }}>{l.name}</span>
                  </div>
                  {isSelected && <Check size={16} color="var(--color-primary-blue)" />}
                </button>
              );
            })
          )}
        </div>
      </div>

      <style>{`
        .lang-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          backdrop-filter: blur(6px);
          -webkit-backdrop-filter: blur(6px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }

        .lang-modal-card {
          width: 100%;
          max-width: 540px;
          max-height: 80vh;
          background: #FFFFFF;
          border-radius: 14px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          border: 1px solid #E2E8F0;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          animation: langModalIn 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes langModalIn {
          from { opacity: 0; transform: scale(0.96) translateY(8px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }

        .lang-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #E2E8F0;
        }

        .lang-close-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: #64748B;
          padding: 4px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 150ms ease, color 150ms ease;
        }
        .lang-close-btn:hover {
          background: #F1F5F9;
          color: #0F172A;
        }

        .lang-search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 12px 20px;
          padding: 8px 12px;
          background: #F8FAFC;
          border: 1px solid #CBD5E1;
          border-radius: 8px;
        }
        .lang-search-box input {
          border: none;
          background: none;
          outline: none;
          width: 100%;
          font-size: 14px;
          color: #1E293B;
        }

        .lang-grid-container {
          overflow-y: auto;
          padding: 8px 20px 20px;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          max-height: 420px;
        }

        .lang-option-btn {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          background: #FFFFFF;
          cursor: pointer;
          transition: all 120ms ease;
          text-align: left;
        }
        .lang-option-btn:hover {
          background: #F8FAFC;
          border-color: #94A3B8;
        }
        .lang-option-btn.selected {
          background: #EFF6FF;
          border-color: #3B82F6;
        }

        @media (max-width: 520px) {
          .lang-grid-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};
