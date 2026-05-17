import { useState } from 'react';
import { MapPin, Send, CheckCircle, Sparkles, Loader2, Copy, Check } from 'lucide-react';
import { submitLaporan } from '../services/api';

const MAX_CHARS = 2500;

export default function LaporPage() {
  const [form, setForm] = useState({ nama: '', lokasi: '', teks: '' });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const charCount = form.teks.length;
  const wordCount = form.teks.trim().split(/\s+/).filter(Boolean).length;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'teks' && value.length > MAX_CHARS) return;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.teks.trim()) {
      setError('Deskripsi laporan tidak boleh kosong.');
      return;
    }
    if (wordCount < 5) {
      setError('Deskripsi terlalu singkat. Minimal 5 kata agar AI bisa menganalisis dengan baik.');
      return;
    }

    setLoading(true);
    setAiLoading(true);

    try {
      const data = await submitLaporan({
        teks: form.teks,
        lokasi: form.lokasi || undefined,
        nama: form.nama || undefined,
      });
      setResult(data);
      setAiLoading(false);
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.error || 'Gagal mengirim laporan. Coba lagi nanti.';
      setError(msg);
      setAiLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({ nama: '', lokasi: '', teks: '' });
    setResult(null);
    setError('');
    setCopied(false);
  };

  const copyId = () => {
    const id = result?.data?.id;
    if (id) {
      navigator.clipboard.writeText(String(id));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const urgencyLabel = (score) => {
    if (score >= 2) return { text: 'Tinggi', cls: 'bg-red-50 text-red-600' };
    if (score >= 1) return { text: 'Sedang', cls: 'bg-amber-50 text-amber-700' };
    return { text: 'Rendah', cls: 'bg-emerald-50 text-emerald-700' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white pt-24 pb-16">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 rounded-2xl gradient-bg flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Send size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            Buat <span className="gradient-text">Laporan</span>
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            Isi form di bawah. AI akan menganalisis laporan kamu secara otomatis.
          </p>
        </div>

        {!result ? (
          <form onSubmit={handleSubmit} className="animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 space-y-5">
              {/* Nama */}
              <div>
                <label htmlFor="nama-pelapor" className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Nama (Opsional)
                </label>
                <input
                  type="text"
                  id="nama-pelapor"
                  name="nama"
                  value={form.nama}
                  onChange={handleChange}
                  placeholder="Anonim diperbolehkan..."
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-all"
                />
              </div>

              {/* Lokasi */}
              <div>
                <label htmlFor="lokasi-laporan" className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Lokasi Kejadian
                </label>
                <div className="relative">
                  <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    id="lokasi-laporan"
                    name="lokasi"
                    value={form.lokasi}
                    onChange={handleChange}
                    placeholder="Contoh: Jl. Sudirman No. 5, Jakarta Pusat"
                    className="w-full border border-slate-200 rounded-xl pl-10 pr-4 py-3 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">Semakin spesifik, semakin cepat ditangani.</p>
              </div>

              {/* Teks */}
              <div>
                <label htmlFor="teks-laporan" className="text-xs font-bold text-slate-700 mb-1.5 block">
                  Deskripsi Laporan <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="teks-laporan"
                  name="teks"
                  rows={5}
                  value={form.teks}
                  onChange={handleChange}
                  placeholder="Ceritakan masalah yang kamu temui... (minimal 5 kata)"
                  className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-navy-400 focus:ring-2 focus:ring-navy-100 transition-all resize-y min-h-[120px]"
                  required
                />
                <div className="flex justify-between mt-1">
                  <span className={`text-[11px] ${wordCount < 5 && form.teks.length > 0 ? 'text-red-500' : 'text-slate-400'}`}>
                    {wordCount} kata
                  </span>
                  <span className={`text-[11px] ${charCount > MAX_CHARS * 0.9 ? 'text-amber-500' : 'text-slate-400'}`}>
                    {charCount} / {MAX_CHARS}
                  </span>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm animate-fade-in">
                  ⚠️ {error}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                id="btn-submit-laporan"
                className="w-full gradient-bg text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    {aiLoading ? 'Menganalisis dengan AI...' : 'Mengirim...'}
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    Kirim Laporan
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          /* ===== SUCCESS STATE ===== */
          <div className="bg-white rounded-3xl border border-slate-200 shadow-lg p-6 sm:p-8 text-center animate-fade-in-up">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-emerald-500" />
            </div>
            <h2 className="text-xl font-extrabold mb-2">Laporan Terkirim!</h2>
            <p className="text-sm text-slate-500 mb-6">
              Laporan kamu telah diterima dan dianalisis oleh AI LaporIn.
            </p>

            {/* AI Result Card */}
            {result.data && (
              <div className="gradient-bg rounded-2xl p-5 text-left mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles size={16} className="text-white/70" />
                  <span className="text-xs font-bold text-white/70 uppercase tracking-wider">Hasil Analisis AI</span>
                </div>
                <div className="space-y-2">
                  {[
                    ['Kategori', result.data.kategori],
                    ['Sentimen', result.data.sentimen],
                    ['Urgensi', urgencyLabel(result.data.skor_urgensi).text],
                    ['Confidence', result.data.confidence != null ? `${(result.data.confidence * 100).toFixed(1)}%` : '-'],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between text-sm text-white/80">
                      <span>{label}</span>
                      <strong className="text-white">{value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="bg-gradient-to-r from-navy-50 to-teal-50 border-2 border-dashed border-navy-200 rounded-2xl p-5 mb-6">
              <p className="text-[10px] font-bold text-navy-500 uppercase tracking-wider mb-2">📌 Simpan ID ini untuk melacak laporan kamu</p>
              <div className="flex items-center justify-center gap-3">
                <span className="text-3xl font-black text-navy-800 tracking-wider">#{result.data?.id || '-'}</span>
                <button
                  onClick={copyId}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    copied
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-white text-navy-700 border border-navy-200 hover:bg-navy-50 hover:border-navy-300'
                  }`}
                >
                  {copied ? <><Check size={12} /> Tersalin!</> : <><Copy size={12} /> Salin ID</>}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-2 text-center">Gunakan ID ini di halaman <strong>Laporan</strong> untuk melihat status terkini.</p>
            </div>

            <button
              onClick={resetForm}
              className="bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-full font-semibold text-sm hover:border-navy-300 hover:text-navy-700 transition-all"
              id="btn-laporan-baru"
            >
              Buat Laporan Baru
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
