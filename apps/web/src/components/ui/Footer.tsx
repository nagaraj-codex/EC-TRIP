import React from 'react';

export const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-(--qc-surface) border-t border-(--qc-border) pt-12 pb-8 mt-auto">
      <div className="max-w-300 mx-auto px-4 md:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <h4 className="text-[14px] font-bold text-(--qc-ink) mb-4 uppercase tracking-wider">Product</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="/plan" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">Planner</a></li>
              <li><a href="/forecast" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">Crowd Forecast</a></li>
              <li><a href="/pricing" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">FastTrack Check</a></li>
              <li><a href="/trips" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">My Trips</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-(--qc-ink) mb-4 uppercase tracking-wider">Parks</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="/parks" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">All Parks</a></li>
              <li><a href="/parks?type=thrill" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">Thrill Parks</a></li>
              <li><a href="/parks?type=family" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">Family Parks</a></li>
              <li><a href="/parks?type=water" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">Water Parks</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-(--qc-ink) mb-4 uppercase tracking-wider">Help</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="/help" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">FAQ & Support</a></li>
              <li><a href="/about" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">About QueueCut</a></li>
              <li><a href="/chat" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">AI Assistant</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[14px] font-bold text-(--qc-ink) mb-4 uppercase tracking-wider">Legal</h4>
            <ul className="flex flex-col gap-3">
              <li><a href="/terms" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">Terms of Service</a></li>
              <li><a href="/privacy" className="text-[14px] text-(--qc-ink-2) hover:text-(--qc-primary) transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-(--qc-border) flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-1">
            <p className="text-[12px] font-medium text-(--qc-muted)">
              Predictions are estimates, not live wait times.
            </p>
            <p className="text-[12px] text-(--qc-muted)">
              Source data last updated: Not verified
            </p>
          </div>
          <p className="text-[12px] text-(--qc-muted)">
            &copy; {currentYear} QueueCut.
          </p>
        </div>
      </div>
    </footer>
  );
};
