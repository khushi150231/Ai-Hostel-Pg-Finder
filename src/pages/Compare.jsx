import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Scale, Plus, School, ArrowRight } from 'lucide-react';
import { useSearch } from '../context/SearchContext';
import ComparisonTable from '../components/ComparisonTable';
import { MOCK_HOSTELS } from '../data/mockData';

export const Compare = () => {
  const { compareList, removeFromCompare, addToCompare } = useSearch();
  const [selectedCollege, setSelectedCollege] = useState('parul');
  const [pickerOpen, setPickerOpen] = useState(false);

  const availableToAdd = MOCK_HOSTELS.filter(
    (h) => !compareList.some((item) => item.id === h.id)
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-primary-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4" /> Side-by-Side Analysis
            </div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              Compare Student Accommodations
            </h1>
            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Evaluating {compareList.length} of 3 maximum selected hostels
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* College Distance Reference */}
            <div className="flex items-center gap-2 bg-dark-800 px-3 py-2 rounded-xl border border-white/10 text-xs">
              <School className="w-3.5 h-3.5 text-primary-400" />
              <select
                value={selectedCollege}
                onChange={(e) => setSelectedCollege(e.target.value)}
                className="bg-transparent text-white focus:outline-none cursor-pointer [&>option]:bg-dark-900"
              >
                <option value="parul">Near Parul University</option>
                <option value="ms">Near MS University</option>
                <option value="itm">Near ITM Universe</option>
              </select>
            </div>

            {compareList.length < 3 && (
              <button
                onClick={() => setPickerOpen(true)}
                className="btn-primary text-xs py-2 px-3.5 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Add Hostel
              </button>
            )}
          </div>
        </div>

        {/* Comparison Table */}
        <ComparisonTable
          hostels={compareList}
          onRemove={removeFromCompare}
          selectedCollege={selectedCollege}
        />

        {/* Picker Modal to add hostel to comparison */}
        {pickerOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-dark-900 border border-white/15 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white">Add Hostel to Compare</h3>
                <button
                  onClick={() => setPickerOpen(false)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2 max-h-80 overflow-y-auto no-scrollbar">
                {availableToAdd.length === 0 ? (
                  <p className="text-xs text-gray-500 py-4 text-center">
                    All available hostels are already in your compare list.
                  </p>
                ) : (
                  availableToAdd.map((h) => (
                    <div
                      key={h.id}
                      onClick={() => {
                        addToCompare(h);
                        setPickerOpen(false);
                      }}
                      className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/8 hover:border-primary-500/40 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={h.images?.[0]}
                          alt={h.name}
                          className="w-12 h-12 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className="text-white text-sm font-semibold">{h.name}</h4>
                          <p className="text-xs text-gray-400">{h.area} • ₹{h.startingPrice.toLocaleString('en-IN')}/mo</p>
                        </div>
                      </div>
                      <Plus className="w-4 h-4 text-primary-400" />
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
