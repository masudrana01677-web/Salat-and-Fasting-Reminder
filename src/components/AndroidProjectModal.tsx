import React, { useState } from 'react';
import { X, Download, FileCode, CheckCircle2, Copy, Check, Terminal } from 'lucide-react';
import { ANDROID_PROJECT_FILES, downloadAndroidProjectZip } from '../utils/androidProjectFiles';

interface AndroidProjectModalProps {
  onClose: () => void;
}

export const AndroidProjectModal: React.FC<AndroidProjectModalProps> = ({ onClose }) => {
  const [selectedFileIdx, setSelectedFileIdx] = useState<number>(3); // Default to app/build.gradle.kts
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);

  const activeFile = ANDROID_PROJECT_FILES[selectedFileIdx] || ANDROID_PROJECT_FILES[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeFile.content);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadZip = async () => {
    try {
      setIsDownloading(true);
      await downloadAndroidProjectZip();
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-white">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCode className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">
                Android Studio Project Explorer
              </h2>
              <span className="text-xs text-emerald-400">
                Stage 1 Architecture · Kotlin 2.0 · Jetpack Compose · Material 3
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadZip}
              disabled={isDownloading}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-emerald-950 transition-colors disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? 'Packaging ZIP...' : 'Download Project (.zip)'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Instructions banner for beginners */}
        <div className="px-5 py-2.5 bg-emerald-950/40 border-b border-emerald-900/50 flex items-center gap-3 text-xs text-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Beginner Guide:</strong> Download the ZIP &rarr; Extract it &rarr; In Android Studio select <em>Open</em> &rarr; Pick the folder &rarr; Click the green <em>Run</em> button.
          </span>
        </div>

        {/* Content Layout: File Sidebar + Code Preview */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[420px]">
          {/* File Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/40 overflow-y-auto p-2 space-y-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-2 py-1 block">
              Project Files
            </span>
            {ANDROID_PROJECT_FILES.map((file, idx) => (
              <button
                key={file.path}
                onClick={() => setSelectedFileIdx(idx)}
                className={`w-full px-2.5 py-1.5 rounded-lg text-left text-xs font-mono truncate transition-colors flex items-center justify-between ${
                  selectedFileIdx === idx
                    ? 'bg-emerald-600/20 text-emerald-300 font-semibold border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span className="truncate">{file.path}</span>
                <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-slate-800 text-slate-400 ml-1 shrink-0">
                  {file.language}
                </span>
              </button>
            ))}
          </div>

          {/* Code Viewer */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* File info bar */}
            <div className="px-4 py-2 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono text-emerald-400 font-medium">
                  {activeFile.path}
                </span>
              </div>
              <button
                onClick={handleCopy}
                className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] flex items-center gap-1 transition-colors"
              >
                {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                <span>{isCopied ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>

            {/* Purpose description */}
            <div className="px-4 py-1.5 bg-slate-900/30 border-b border-slate-800/50 text-[11px] text-slate-400">
              <strong>Purpose:</strong> {activeFile.purpose}
            </div>

            {/* Scrollable code block */}
            <div className="flex-1 p-4 overflow-auto font-mono text-xs text-slate-200 leading-relaxed whitespace-pre selection:bg-emerald-700 selection:text-white">
              {activeFile.content}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
