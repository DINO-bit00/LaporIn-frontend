import { useState, useEffect, useCallback } from 'react';
import { X, MapPin, Search } from 'lucide-react';
import { getLaporan } from '../services/api';
import ReportCard from '../components/ReportCard';
import CategoryChip from '../components/CategoryChip';
import LoadingSpinner from '../components/LoadingSpinner';

const URGENSI_LABELS = { 2: '🔴 Tinggi', 1: '🟡 Sedang', 0: '🟢 Rendah' };
const STATUS_LABELS = {
  'Baru': '📥 Baru', 'Diproses': '⏳ Diproses',
  'Selesai': '✅ Selesai', 'Ditolak': '❌ Ditolak',
};
const STATUS_COLORS = {
  'Baru': 'text-blue-700', 'Diproses': 'text-amber-700',
  'Selesai': 'text-emerald-700', 'Ditolak': 'text-red-600',
};

const CATEGORIES = ['Semua', 'Infrastruktur', 'Lingkungan', 'Kesehatan', 'Pendidikan', 'Keamanan', 'Administrasi'];

const STATUS_FILTERS = [
  { key: 'Semua', label: 'Semua', emoji: '📋' },
  { key: 'Baru', label: 'Baru', emoji: '📥' },
  { key: 'Diproses', label: 'Diproses', emoji: '⏳' },
  { key: 'Selesai', label: 'Selesai', emoji: '✅' },
  { key: 'Ditolak', label: 'Ditolak', emoji: '❌' },
];

export default function FeedPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeFilter, setActiveFilter] = useState('Semua');
  const [activeStatus, setActiveStatus] = useState('Semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  useEffect(() => {
    fetchReports();
  }, [activeFilter, activeStatus, searchQuery]);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchReports = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getLaporan({
        kategori: activeFilter === 'Semua' ? 'all' : activeFilter,
        status: activeStatus === 'Semua' ? 'all' : activeStatus,
        search: searchQuery || undefined,
      });
      setReports(data.data || []);
    } catch (err) {
      console.error(err);
      setError('Gagal memuat laporan. Pastikan backend berjalan.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSearchQuery(searchInput);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-6 animate-fade-in-up">
          <span className="inline-block bg-gradient-to-r from-navy-100/60 to-teal-100/60 text-navy-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
            Feed Publik
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Laporan <span className="gradient-text">Terbaru</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Laporan warga yang baru masuk dan sedang dalam proses penanganan.
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 hide-scrollbar animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          {CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              kategori={cat}
              active={activeFilter === cat}
              onClick={() => setActiveFilter(cat)}
              showEmoji={cat !== 'Semua'}
            />
          ))}
        </div>

        {/* Status Filter + Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-6 animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar shrink-0">
            {STATUS_FILTERS.map((s) => (
              <button
                key={s.key}
                onClick={() => setActiveStatus(s.key)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 border ${
                  activeStatus === s.key
                    ? 'bg-navy-700 text-white border-navy-700 shadow-md shadow-navy-700/20'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-navy-300 hover:text-navy-700'
                }`}
              >
                <span>{s.emoji}</span>
                {s.label}
              </button>
            ))}
          </div>
          <div className="relative sm:ml-auto w-full sm:w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="Cari ID atau teks..."
              className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-full bg-white outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-all"
            />
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <LoadingSpinner message="Memuat laporan..." />
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-sm mb-4">⚠️ {error}</p>
            <button
              onClick={fetchReports}
              className="text-sm font-semibold text-navy-700 hover:underline"
            >
              Coba lagi
            </button>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-4">📭</p>
            <p className="text-sm text-slate-500">Belum ada laporan{activeFilter !== 'Semua' ? ` di kategori ${activeFilter}` : ''}{activeStatus !== 'Semua' ? ` dengan status ${activeStatus}` : ''}.</p>
          </div>
        ) : (
          <div className="space-y-4 stagger-children">
            {reports.map((report) => (
              <ReportCard key={report.id} report={report} onClick={() => setSelectedReport(report)} />
            ))}
          </div>
        )}

        {/* Report count */}
        {!loading && reports.length > 0 && (
          <p className="text-center text-xs text-slate-400 mt-8">
            Menampilkan {reports.length} laporan
          </p>
        )}
      </div>

      {/* ===== DETAIL MODAL (Public) ===== */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedReport(null)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-3 flex items-center justify-between rounded-t-2xl">
              <h3 className="text-sm font-extrabold text-slate-900">Detail Laporan</h3>
              <button onClick={() => setSelectedReport(null)} className="text-slate-400 hover:text-slate-600 transition-colors"><X size={18} /></button>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedReport.teks_asli}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Kategori</p>
                  <p className="text-xs font-bold text-slate-800 mt-1">{selectedReport.kategori || '-'}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Sentimen</p>
                  <p className="text-xs font-bold mt-1">{selectedReport.sentimen === 'Positif' || selectedReport.sentimen === 'positif' ? '😊 Positif' : '😠 Negatif'}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Urgensi</p>
                  <p className="text-xs font-bold mt-1">{URGENSI_LABELS[selectedReport.skor_urgensi] || '⚪'}</p>
                </div>
                <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                  <p className="text-[10px] font-bold text-slate-400 uppercase">Status</p>
                  <p className={`text-xs font-bold mt-1 ${STATUS_COLORS[selectedReport.status] || 'text-blue-700'}`}>{STATUS_LABELS[selectedReport.status] || '📥 Baru'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-100">
                {selectedReport.lokasi && <div className="flex items-start gap-1"><MapPin size={14} className="text-slate-400 shrink-0" /> <span className="font-medium text-slate-700">{selectedReport.lokasi}</span></div>}
                <div><span className="text-slate-400">📅 Tanggal:</span> <span className="font-medium text-slate-700 ml-1">{new Date(selectedReport.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
              </div>

              {selectedReport.catatan_admin && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <label className="text-[10px] font-bold text-teal-600 uppercase tracking-wider mb-1.5 block">Tanggapan Admin</label>
                  <p className="text-sm text-slate-700 bg-teal-50 border border-teal-100 p-3 rounded-xl italic">
                    "{selectedReport.catatan_admin}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
