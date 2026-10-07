import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, Star, MessageSquare, Plus, Edit,
  Trash2, Check, X, Shield, Search, ArrowRight, Eye, Phone, MapPin
} from 'lucide-react';
import { MOCK_HOSTELS, MOCK_REVIEWS } from '../data/mockData';
import { formatPrice } from '../utils/formatPrice';

export const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('hostels');
  const [hostelList, setHostelList] = useState(MOCK_HOSTELS);
  const [reviewList, setReviewList] = useState(MOCK_REVIEWS);
  const [searchQuery, setSearchQuery] = useState('');

  // Add/Edit Hostel Modal
  const [hostelModalOpen, setHostelModalOpen] = useState(false);
  const [editingHostel, setEditingHostel] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'PG',
    gender: 'boys',
    area: '',
    startingPrice: 5000,
    deposit: 10000,
    address: '',
    verified: true,
  });

  // Students list mock
  const [students, setStudents] = useState([
    { id: 1, name: 'Arjun Patel', college: 'Parul University', course: 'B.Tech CSE', email: 'arjun@parul.ac.in', phone: '9876543210' },
    { id: 2, name: 'Priya Mehta', college: 'MS University', course: 'B.Com', email: 'priya@msu.ac.in', phone: '9888776655' },
    { id: 3, name: 'Rohan Sharma', college: 'ITM Universe', course: 'B.Tech Mech', email: 'rohan@itm.ac.in', phone: '9765432109' },
  ]);

  // Owners list mock
  const [owners, setOwners] = useState([
    { id: 1, name: 'Rameshbhai Patel', properties: 'Sunrise Boys PG', phone: '9876543210', email: 'sunrise.pg@email.com', verified: true },
    { id: 2, name: 'Priyaben Shah', properties: 'Serenity Girls Hostel', phone: '9988776655', email: 'serenity.hostel@email.com', verified: true },
    { id: 3, name: 'Manojbhai Desai', properties: 'Green Valley PG', phone: '9765432109', email: 'greenvalley@email.com', verified: true },
  ]);

  // Enquiries list mock
  const [enquiries, setEnquiries] = useState([
    { id: 1, studentName: 'Arjun Patel', hostelName: 'Sunrise Boys PG', date: '2026-10-01', status: 'Pending', phone: '9876543210', message: 'Looking for single AC room.' },
    { id: 2, studentName: 'Neha Rao', hostelName: 'Serenity Girls Hostel', date: '2026-09-29', status: 'Replied', phone: '9988112233', message: 'Is food vegetarian or Jain available?' },
    { id: 3, studentName: 'Karan Shah', hostelName: 'Parul Heights', date: '2026-09-28', status: 'Pending', phone: '9123456789', message: 'What is distance to Pharmacy faculty?' },
  ]);

  // CRUD actions
  const handleDeleteHostel = (id) => {
    if (window.confirm('Are you sure you want to delete this hostel?')) {
      setHostelList((prev) => prev.filter((h) => h.id !== id));
    }
  };

  const handleOpenAddModal = () => {
    setEditingHostel(null);
    setFormData({
      name: '',
      type: 'PG',
      gender: 'boys',
      area: '',
      startingPrice: 5000,
      deposit: 10000,
      address: '',
      verified: true,
    });
    setHostelModalOpen(true);
  };

  const handleOpenEditModal = (hostel) => {
    setEditingHostel(hostel);
    setFormData({
      name: hostel.name,
      type: hostel.type,
      gender: hostel.gender,
      area: hostel.area,
      startingPrice: hostel.startingPrice,
      deposit: hostel.deposit || 10000,
      address: hostel.address,
      verified: hostel.verified,
    });
    setHostelModalOpen(true);
  };

  const handleSaveHostel = (e) => {
    e.preventDefault();
    if (editingHostel) {
      setHostelList((prev) =>
        prev.map((h) =>
          h.id === editingHostel.id
            ? { ...h, ...formData, slug: formData.name.toLowerCase().replace(/\s+/g, '-') }
            : h
        )
      );
    } else {
      const newHostel = {
        id: Date.now(),
        slug: formData.name.toLowerCase().replace(/\s+/g, '-'),
        ...formData,
        city: 'Vadodara',
        rating: 4.5,
        reviewCount: 0,
        images: ['https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80'],
        amenities: ['wifi', 'food', 'security'],
        food: { included: true, type: 'Veg' },
        roomTypes: ['single', 'double'],
        distanceFromColleges: { parul: 2.0, ms: 8.0, itm: 6.0 },
      };
      setHostelList((prev) => [newHostel, ...prev]);
    }
    setHostelModalOpen(false);
  };

  const handleDeleteReview = (id) => {
    setReviewList((prev) => prev.filter((r) => r.id !== id));
  };

  const handleToggleEnquiryStatus = (id) => {
    setEnquiries((prev) =>
      prev.map((enq) =>
        enq.id === id
          ? { ...enq, status: enq.status === 'Pending' ? 'Replied' : 'Pending' }
          : enq
      )
    );
  };

  const filteredHostels = hostelList.filter(
    (h) =>
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.area.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-dark-900 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Admin Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
                  Owner & Admin Operations
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Control Center
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Manage hostels, review inquiries, moderate student feedback and owners
              </p>
            </div>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add New Hostel
          </button>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Active Hostels', value: hostelList.length, icon: Building2, color: 'text-primary-400' },
            { label: 'Registered Students', value: students.length, icon: Users, color: 'text-emerald-400' },
            { label: 'Total Inquiries', value: enquiries.length, icon: MessageSquare, color: 'text-accent-400' },
            { label: 'Reviews Posted', value: reviewList.length, icon: Star, color: 'text-amber-400' },
          ].map((stat, i) => {
            const Icon = stat.icon;
            return (
              <div key={i} className="card p-5 flex items-center gap-4">
                <div className={`p-3 rounded-2xl bg-white/5 border border-white/10 ${stat.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-display font-bold text-2xl text-white">{stat.value}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{stat.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar">
          {[
            { id: 'hostels', label: `Hostels (${hostelList.length})`, icon: Building2 },
            { id: 'enquiries', label: `Enquiries (${enquiries.length})`, icon: MessageSquare },
            { id: 'students', label: `Students (${students.length})`, icon: Users },
            { id: 'owners', label: `Owners (${owners.length})`, icon: Shield },
            { id: 'reviews', label: `Reviews (${reviewList.length})`, icon: Star },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-primary-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: HOSTEL MANAGEMENT */}
        {activeTab === 'hostels' && (
          <div className="card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h3 className="font-display font-bold text-xl text-white">All Hostel Listings</h3>
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search hostel or area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="input-field pl-9 text-xs py-2"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Hostel Name</th>
                    <th className="py-3 px-4">Area</th>
                    <th className="py-3 px-4">Gender</th>
                    <th className="py-3 px-4">Starting Price</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {filteredHostels.map((h) => (
                    <tr key={h.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={h.images?.[0]}
                            alt={h.name}
                            className="w-10 h-10 rounded-xl object-cover"
                          />
                          <div>
                            <div>{h.name}</div>
                            <div className="text-[11px] text-gray-400">{h.type}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-gray-300">{h.area}</td>
                      <td className="py-3.5 px-4 capitalize text-gray-300">{h.gender}</td>
                      <td className="py-3.5 px-4 font-semibold text-primary-400">
                        {formatPrice(h.startingPrice)}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            h.verified
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          }`}
                        >
                          {h.verified ? 'Verified' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/hostel/${h.slug}`}
                            className="p-1.5 rounded-lg bg-white/5 text-gray-300 hover:text-white"
                            title="View"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(h)}
                            className="p-1.5 rounded-lg bg-white/5 text-primary-400 hover:bg-primary-500/20"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteHostel(h.id)}
                            className="p-1.5 rounded-lg bg-white/5 text-rose-400 hover:bg-rose-500/20"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: ENQUIRIES */}
        {activeTab === 'enquiries' && (
          <div className="card p-6 space-y-4">
            <h3 className="font-display font-bold text-xl text-white">Student Inquiries</h3>
            <div className="space-y-3">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{enq.studentName}</span>
                      <span className="text-gray-500">→</span>
                      <span className="text-primary-400 text-sm font-semibold">{enq.hostelName}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          enq.status === 'Replied'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {enq.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300">"{enq.message}"</p>
                    <p className="text-[11px] text-gray-500">
                      Phone: +91 {enq.phone} • Date: {enq.date}
                    </p>
                  </div>

                  <button
                    onClick={() => handleToggleEnquiryStatus(enq.id)}
                    className="btn-secondary text-xs py-1.5 px-3 flex items-center gap-1.5"
                  >
                    <Check className="w-3.5 h-3.5" />
                    Mark as {enq.status === 'Pending' ? 'Replied' : 'Pending'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: STUDENTS */}
        {activeTab === 'students' && (
          <div className="card p-6 space-y-4">
            <h3 className="font-display font-bold text-xl text-white">Registered Students</h3>
            <div className="divide-y divide-white/5">
              {students.map((std) => (
                <div key={std.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{std.name}</h4>
                    <p className="text-xs text-gray-400">{std.college} • {std.course}</p>
                    <p className="text-[11px] text-gray-500">{std.email} • {std.phone}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-primary-500/10 text-primary-300">
                    Active Student
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: OWNERS */}
        {activeTab === 'owners' && (
          <div className="card p-6 space-y-4">
            <h3 className="font-display font-bold text-xl text-white">Hostel Owners & Wardens</h3>
            <div className="divide-y divide-white/5">
              {owners.map((own) => (
                <div key={own.id} className="py-3.5 flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-white text-sm">{own.name}</h4>
                    <p className="text-xs text-gray-400">Managing: {own.properties}</p>
                    <p className="text-[11px] text-gray-500">{own.phone} • {own.email}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                    Verified Partner
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: REVIEWS */}
        {activeTab === 'reviews' && (
          <div className="card p-6 space-y-4">
            <h3 className="font-display font-bold text-xl text-white">Student Review Moderation</h3>
            <div className="space-y-3">
              {reviewList.map((rev) => (
                <div
                  key={rev.id}
                  className="p-4 rounded-2xl bg-white/5 border border-white/8 flex items-start justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{rev.studentName}</span>
                      <span className="text-xs text-amber-400">★ {rev.rating}</span>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">"{rev.comment}"</p>
                    <p className="text-[10px] text-gray-500 mt-1">{rev.college} • {rev.date}</p>
                  </div>

                  <button
                    onClick={() => handleDeleteReview(rev.id)}
                    className="p-2 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20"
                    title="Delete Review"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ADD / EDIT HOSTEL MODAL */}
      {hostelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-dark-900 border border-white/15 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-xl text-white">
                {editingHostel ? 'Edit Hostel Listing' : 'Add New Hostel'}
              </h3>
              <button
                onClick={() => setHostelModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveHostel} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="text-gray-400 mb-1 block">Hostel Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  className="input-field"
                  placeholder="e.g. Vadodara Royal PG"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 mb-1 block">Property Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
                    className="input-field cursor-pointer [&>option]:bg-dark-900"
                  >
                    <option value="PG">PG</option>
                    <option value="Hostel">Hostel</option>
                    <option value="Co-living">Co-living</option>
                  </select>
                </div>

                <div>
                  <label className="text-gray-400 mb-1 block">Gender Category</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData((p) => ({ ...p, gender: e.target.value }))}
                    className="input-field cursor-pointer [&>option]:bg-dark-900"
                  >
                    <option value="boys">Boys</option>
                    <option value="girls">Girls</option>
                    <option value="co-living">Co-living</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-400 mb-1 block">Area in Vadodara *</label>
                  <input
                    type="text"
                    value={formData.area}
                    onChange={(e) => setFormData((p) => ({ ...p, area: e.target.value }))}
                    className="input-field"
                    placeholder="e.g. Gotri"
                    required
                  />
                </div>

                <div>
                  <label className="text-gray-400 mb-1 block">Starting Monthly Rent (₹) *</label>
                  <input
                    type="number"
                    value={formData.startingPrice}
                    onChange={(e) => setFormData((p) => ({ ...p, startingPrice: Number(e.target.value) }))}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-gray-400 mb-1 block">Full Street Address</label>
                <textarea
                  rows={2}
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                  className="input-field resize-none"
                  placeholder="e.g. Plot 15, Near Parul University Gate"
                />
              </div>

              <div className="flex gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setHostelModalOpen(false)}
                  className="btn-secondary flex-1 justify-center text-xs py-2.5"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary flex-1 justify-center text-xs py-2.5"
                >
                  {editingHostel ? 'Save Changes' : 'Create Listing'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
