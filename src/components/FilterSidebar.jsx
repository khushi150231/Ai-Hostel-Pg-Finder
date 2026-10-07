import { useState } from 'react';
import { SlidersHorizontal, X, RotateCcw, ChevronDown, ChevronUp } from 'lucide-react';

const AMENITY_OPTIONS = [
  { id: 'wifi', label: 'Wi-Fi' },
  { id: 'food', label: 'Food / Mess' },
  { id: 'ac', label: 'AC' },
  { id: 'laundry', label: 'Laundry' },
  { id: 'parking', label: 'Parking' },
  { id: 'cctv', label: 'CCTV' },
  { id: 'security', label: 'Security Guard' },
  { id: 'powerBackup', label: 'Power Backup' },
  { id: 'housekeeping', label: 'Housekeeping' },
  { id: 'studyTable', label: 'Study Table' },
];

const COLLEGE_OPTIONS = [
  { id: '', label: 'All of Vadodara' },
  { id: 'parul', label: 'Parul University' },
  { id: 'ms', label: 'MS University (MSU)' },
  { id: 'itm', label: 'ITM SLS Baroda University' },
  { id: 'navrachana', label: 'Navrachana University' },
  { id: 'sigma', label: 'Sigma University' },
  { id: 'gsfc', label: 'GSFC University' },
];

const Section = ({ title, children, defaultOpen = true }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-white/6 pb-5 mb-5 last:border-0 last:mb-0">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-between w-full mb-3 group"
      >
        <span className="text-white font-semibold text-sm">{title}</span>
        {open ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
      </button>
      {open && children}
    </div>
  );
};

const FilterSidebar = ({ filters = {}, onChange, onReset }) => {
  const toggle = (key, value) => {
    const arr = filters[key] || [];
    onChange({ [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value] });
  };

  return (
    <div className="bg-dark-800/80 backdrop-blur-sm border border-white/8 rounded-2xl p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-primary-400" />
          <h2 className="font-display font-bold text-white text-lg">Filters</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-primary-400 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      {/* Target College */}
      <Section title="Target College">
        <select
          value={filters.college || ''}
          onChange={(e) => onChange({ college: e.target.value })}
          className="input-field text-sm mb-3 bg-dark-900 text-white"
        >
          {COLLEGE_OPTIONS.map(({ id, label }) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>
      </Section>

      {/* Location / Area */}
      <Section title="Location Area">
        <input
          type="text"
          placeholder="e.g. Fatehgunj, Waghodia, Alkapuri..."
          value={filters.area || ''}
          onChange={(e) => onChange({ area: e.target.value })}
          className="input-field text-sm"
        />
      </Section>

      {/* Budget */}
      <Section title="Budget (₹/month)">
        <div className="space-y-3">
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Min Budget</label>
            <input
              type="number"
              placeholder="₹ 2,000"
              value={filters.minBudget || ''}
              onChange={(e) => onChange({ minBudget: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          <div>
            <label className="text-gray-500 text-xs mb-1 block">Max Budget</label>
            <input
              type="number"
              placeholder="₹ 15,000"
              value={filters.maxBudget || ''}
              onChange={(e) => onChange({ maxBudget: e.target.value })}
              className="input-field text-sm"
            />
          </div>
          {/* Quick budget presets */}
          <div className="flex flex-wrap gap-1.5">
            {['4000', '5000', '7000', '10000'].map((b) => (
              <button
                key={b}
                onClick={() => onChange({ maxBudget: b })}
                className={`text-xs px-2.5 py-1 rounded-lg border transition-all ${
                  String(filters.maxBudget) === b
                    ? 'bg-primary-500/20 border-primary-500/40 text-primary-400'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                }`}
              >
                ≤₹{parseInt(b).toLocaleString('en-IN')}
              </button>
            ))}
          </div>
        </div>
      </Section>

      {/* Gender */}
      <Section title="Gender">
        <div className="space-y-2">
          {[
            { value: '', label: 'All Genders' },
            { value: 'boys', label: 'Boys Only' },
            { value: 'girls', label: 'Girls Only' },
            { value: 'co-living', label: 'Co-living / Both' },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => onChange({ gender: value })}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  (filters.gender || '') === value
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-white/25 group-hover:border-white/50'
                }`}
              >
                {(filters.gender || '') === value && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <span className="text-sm text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Room Type */}
      <Section title="Room Type">
        <div className="space-y-2">
          {[
            { value: '', label: 'Any Room' },
            { value: 'single', label: 'Single Room' },
            { value: 'double', label: 'Double Sharing' },
            { value: 'triple', label: 'Triple Sharing' },
            { value: 'fourSharing', label: '4 Sharing' },
          ].map(({ value, label }) => (
            <label key={value} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => onChange({ roomType: value })}
                className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                  (filters.roomType || '') === value
                    ? 'bg-primary-500 border-primary-500'
                    : 'border-white/25 group-hover:border-white/50'
                }`}
              >
                {(filters.roomType || '') === value && <div className="w-2 h-2 bg-white rounded-sm" />}
              </div>
              <span className="text-sm text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      {/* Amenities */}
      <Section title="Amenities">
        <div className="space-y-2">
          {AMENITY_OPTIONS.map(({ id, label }) => {
            const checked = (filters.amenities || []).includes(id);
            return (
              <label key={id} className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  onClick={() => toggle('amenities', id)}
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all cursor-pointer ${
                    checked ? 'bg-primary-500 border-primary-500' : 'border-white/25 group-hover:border-white/50'
                  }`}
                >
                  {checked && (
                    <svg className="w-2.5 h-2.5 text-white" viewBox="0 0 10 10" fill="none">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            );
          })}
        </div>
      </Section>

      {/* Food */}
      <Section title="Food & Mess">
        <div className="space-y-2">
          {[
            { value: null, label: 'Any' },
            { value: true, label: 'Mess Meals Included' },
            { value: false, label: 'Without Food' },
          ].map(({ value, label }) => (
            <label key={String(value)} className="flex items-center gap-2.5 cursor-pointer group">
              <div
                onClick={() => onChange({ food: value })}
                className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all cursor-pointer ${
                  filters.food === value
                    ? 'border-primary-500'
                    : 'border-white/25 group-hover:border-white/50'
                }`}
              >
                {filters.food === value && <div className="w-2 h-2 bg-primary-500 rounded-full" />}
              </div>
              <span className="text-sm text-gray-300">{label}</span>
            </label>
          ))}
        </div>
      </Section>

      <button onClick={onReset} className="btn-outline w-full justify-center text-sm mt-2">
        <RotateCcw className="w-4 h-4" /> Clear All Filters
      </button>
    </div>
  );
};

export default FilterSidebar;
