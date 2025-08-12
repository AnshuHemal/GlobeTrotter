import React, { useMemo } from 'react';

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function parseDurationDays(durationStr) {
  if (!durationStr) return 0;
  const match = durationStr.match(/(\d+)\s*Day/i);
  return match ? parseInt(match[1], 10) : 0;
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
};
const modalStyle = {
  background: '#fff', borderRadius: '12px', width: '100%', maxWidth: 520, boxShadow: '0 10px 30px rgba(0,0,0,0.15)'
};

export default function BookingModal({ open, onClose, onConfirm, trip }) {
  const [startDate, setStartDate] = React.useState('');

  React.useEffect(() => {
    if (open) setStartDate('');
  }, [open]);

  const { endDate, days } = useMemo(() => {
    try {
      const d = parseDurationDays(trip?.duration);
      if (!startDate || !d) return { endDate: null, days: d };
      // end date inclusive (6 days trip ends 5 days after start)
      const end = addDays(new Date(startDate), Math.max(d - 1, 0));
      return { endDate: end, days: d };
    } catch {
      return { endDate: null, days: 0 };
    }
  }, [startDate, trip?.duration]);

  if (!open) return null;

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={{ padding: 20, borderBottom: '1px solid #eee' }}>
          <h3 style={{ margin: 0 }}>Book {trip?.title}</h3>
          <p style={{ margin: '6px 0 0', color: '#64748b' }}>{trip?.duration}</p>
        </div>

        <div style={{ padding: 20, display: 'grid', gap: 14 }}>
          <label style={{ display: 'grid', gap: 8 }}>
            <span style={{ fontSize: 14, color: '#334155' }}>Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #cbd5e1' }}
            />
          </label>

          <div>
            <div style={{ fontSize: 14, color: '#334155', marginBottom: 6 }}>End Date</div>
            <div style={{ padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#f8fafc' }}>
              {endDate ? endDate.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'Select a start date'}
            </div>
            <div style={{ marginTop: 6, fontSize: 12, color: '#64748b' }}>
              {days ? `${days} day${days>1?'s':''} trip` : 'Duration unavailable'}
            </div>
          </div>
        </div>

        <div style={{ padding: 20, borderTop: '1px solid #eee', display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <button onClick={onClose} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid #e2e8f0', background: '#fff' }}>Cancel</button>
          <button
            onClick={() => {
              if (!startDate || !endDate) return;
              onConfirm({
                start_date: new Date(startDate).toISOString(),
                end_date: endDate.toISOString(),
              });
            }}
            disabled={!startDate || !endDate}
            style={{ padding: '10px 14px', borderRadius: 8, background: '#0ea5e9', color: '#fff', border: 'none' }}
          >
            Book Trip
          </button>
        </div>
      </div>
    </div>
  );
}
