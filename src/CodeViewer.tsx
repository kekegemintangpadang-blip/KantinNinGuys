import React, { useState } from 'react';
import { PROJECT_FILES, ProjectFile, KANTIN_SQL } from '../data/projectFiles';
import { Copy, Check, Download, FileCode, Database, Folder, ExternalLink } from 'lucide-react';
import JSZip from 'jszip';

export function CodeViewer() {
  const [selectedFile, setSelectedFile] = useState<ProjectFile>(PROJECT_FILES[1]); // Default to cart.php
  const [isSqlSelected, setIsSqlSelected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [downloadingZip, setDownloadingZip] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setDownloadingZip(true);
      const zip = new JSZip();

      const root = zip.folder('kantinninguys');
      if (!root) return;

      PROJECT_FILES.forEach(file => {
        root.file(file.path, file.code);
      });

      root.file('database_orang3.sql', KANTIN_SQL);

      const readmeContent = `# Proyek KantinNinGuys - Modul Orang 3
Fitur: Keranjang Belanja, Checkout, dan Pembayaran (PDO Transaction)

## Cara Pasang di XAMPP:
1. Pindahkan folder 'kantinninguys' ini ke dalam direktori: C:/xampp/htdocs/
2. Buka XAMPP Control Panel, nyalakan Apache dan MySQL.
3. Buka browser: http://localhost/phpmyadmin/
4. Import file 'database_orang3.sql' untuk membuat database 'kantinninguys' beserta tabel orders, order_details, payments, dan data dummy.
5. Akses di browser: http://localhost/kantinninguys/cart.php
`;
      root.file('README.txt', readmeContent);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'kantinninguys_orang3_files.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error generating zip:', err);
    } finally {
      setDownloadingZip(false);
    }
  };

  const currentContent = isSqlSelected ? KANTIN_SQL : selectedFile.code;
  const currentTitle = isSqlSelected ? 'database_orang3.sql' : selectedFile.path;
  const currentDesc = isSqlSelected
    ? 'Skrip DDL SQL untuk membuat database kantinninguys, tabel orders, order_details, payments, dan tabel relasi pendukung.'
    : selectedFile.description;

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-red-600 uppercase tracking-wider">Repository Source Code Lengkap</span>
          <h2 className="text-lg font-bold text-slate-900 mt-0.5">Daftar File Tanggung Jawab Orang 3</h2>
          <p className="text-xs text-slate-500">
            Semua file siap di-copy atau diunduh sebagai paket .ZIP langsung ke folder XAMPP <code className="font-mono text-slate-700 bg-slate-100 px-1 py-0.5 rounded">htdocs/kantinninguys/</code>.
          </p>
        </div>

        <button
          onClick={handleDownloadZip}
          disabled={downloadingZip}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-sm transition-colors"
        >
          <Download className="w-4 h-4" />
          {downloadingZip ? 'Menyiapkan ZIP...' : 'Download Semua File (.ZIP)'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {}
        <div className="lg:col-span-1 space-y-3">
          <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-sm">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1.5 flex items-center gap-1.5 border-b border-slate-100 mb-2">
              <Folder className="w-3.5 h-3.5 text-slate-400" /> kantinninguys/
            </div>

            <div className="space-y-1 text-xs">
              {PROJECT_FILES.map(file => (
                <button
                  key={file.path}
                  onClick={() => {
                    setSelectedFile(file);
                    setIsSqlSelected(false);
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                    !isSqlSelected && selectedFile.path === file.path
                      ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <FileCode className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{file.path}</span>
                </button>
              ))}

              <button
                onClick={() => setIsSqlSelected(true)}
                className={`w-full text-left px-2.5 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                  isSqlSelected
                    ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Database className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                <span className="truncate">database_orang3.sql</span>
              </button>
            </div>
          </div>

          {}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-2">
            <span className="font-bold text-slate-800 block">Keterangan Peran:</span>
            <p>
              • <strong>Orang 3:</strong> Mengelola <code className="bg-white px-1 border rounded">cart.php</code>, <code className="bg-white px-1 border rounded">checkout.php</code>, <code className="bg-white px-1 border rounded">proses_checkout.php</code>, <code className="bg-white px-1 border rounded">order_success.php</code>, serta API & JS.
            </p>
            <p>
              • <strong>Orang 1:</strong> Mengelola database umum & konfigurasi koneksi <code className="bg-white px-1 border rounded">database.php</code>.
            </p>
          </div>
        </div>

        {}
        <div className="lg:col-span-3 space-y-4">
          {}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-slate-900">{currentTitle}</span>
                  {!isSqlSelected && (
                    <span className="text-[10px] font-semibold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                      {selectedFile.role}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 mt-1">{currentDesc}</p>
              </div>

              <button
                onClick={() => handleCopy(currentContent)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-slate-300 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Kode Lengkap</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {}
          <div className="relative border border-slate-200 rounded-xl overflow-hidden bg-slate-950 text-slate-200 text-xs shadow-inner font-mono">
            <div className="bg-slate-900 border-b border-slate-800 px-4 py-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>{currentTitle}</span>
              <span>{isSqlSelected ? 'SQL (MySQL InnoDB)' : selectedFile.language.toUpperCase()}</span>
            </div>
            <pre className="p-4 overflow-x-auto max-h-[580px] leading-relaxed select-text">
              <code>{currentContent}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
