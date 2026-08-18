/**
 * pages/Upload.jsx — Bulk JSON upload for any skill
 */
import { useState, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { questionsService } from '../services/questions';
import { skillsService } from '../services/skills';

export default function Upload() {
  const [selectedSkill, setSelectedSkill] = useState('');
  const [mode, setMode] = useState('replace');
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const fileRef = useRef();

  const { data: skillsRes } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillsService.getAll(),
  });

  const skills = skillsRes?.data?.data?.skills || [];

  const handleFileSelect = (f) => {
    if (!f) return;
    if (!f.name.endsWith('.json')) {
      toast.error('Only .json files are allowed');
      return;
    }
    setFile(f);

    // Preview
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target.result);
        setPreview({ count: parsed.length, sample: parsed.slice(0, 3) });
      } catch {
        toast.error('Invalid JSON file');
        setFile(null);
        setPreview(null);
      }
    };
    reader.readAsText(f);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    handleFileSelect(f);
  };

  const handleUpload = async () => {
    if (!selectedSkill) { toast.error('Please select a skill'); return; }
    if (!file) { toast.error('Please select a JSON file'); return; }

    setUploading(true);
    try {
      const res = await questionsService.bulkUpload(selectedSkill, file, mode);
      const { uploaded, total } = res.data.data;
      toast.success(`Uploaded ${uploaded} questions. Total: ${total}`);
      setFile(null);
      setPreview(null);
      fileRef.current.value = '';
    } catch (error) {
      toast.error(error.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="page-header">
        <div>
          <h2 className="page-title">Bulk Upload</h2>
          <p className="page-subtitle">Upload a JSON file to populate questions for a skill</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Skill Selector */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Select Skill</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Skill</label>
              <select
                id="upload-skill"
                value={selectedSkill}
                onChange={(e) => setSelectedSkill(e.target.value)}
                className="select"
              >
                <option value="">Choose a skill...</option>
                {skills.map((s) => (
                  <option key={s.skill} value={s.skill}>{s.displayName}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Upload Mode</label>
              <select
                id="upload-mode"
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className="select"
              >
                <option value="replace">Replace (overwrite existing)</option>
                <option value="merge">Merge (append to existing)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Drop Zone */}
        <div
          className={`card cursor-pointer border-dashed transition-all duration-200 ${
            dragOver ? 'border-brand-500 bg-brand-600/5' : 'border-zinc-700 hover:border-zinc-600'
          }`}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            id="file-input"
            onChange={(e) => handleFileSelect(e.target.files[0])}
          />
          <div className="flex flex-col items-center justify-center py-6 text-center">
            {file ? (
              <>
                <div className="w-12 h-12 rounded-xl bg-emerald-600/10 flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#34d399" strokeWidth={1.7} className="w-6 h-6">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-200">{file.name}</p>
                <p className="text-xs text-zinc-500 mt-1">
                  {(file.size / 1024).toFixed(1)} KB • Click to change
                </p>
              </>
            ) : (
              <>
                <div className="w-12 h-12 rounded-xl bg-surface-3 flex items-center justify-center mb-3">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-6 h-6 text-zinc-500">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-zinc-300">Drop your JSON file here</p>
                <p className="text-xs text-zinc-500 mt-1">or click to browse</p>
              </>
            )}
          </div>
        </div>

        {/* Preview */}
        {preview && (
          <div className="card border-brand-700/30 bg-brand-600/5">
            <h3 className="text-sm font-semibold text-zinc-200 mb-3">
              File Preview — {preview.count} questions detected
            </h3>
            <div className="space-y-2">
              {preview.sample.map((q, i) => (
                <div key={i} className="flex items-start gap-3 text-sm">
                  <span className={`mt-0.5 px-1.5 py-0.5 rounded text-xs font-medium ${
                    q.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400'
                    : q.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-red-500/10 text-red-400'
                  }`}>{q.difficulty}</span>
                  <p className="text-zinc-400 line-clamp-1">{q.question}</p>
                </div>
              ))}
              {preview.count > 3 && (
                <p className="text-xs text-zinc-600">...and {preview.count - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <button
          onClick={handleUpload}
          disabled={!file || !selectedSkill || uploading}
          className="btn-primary w-full justify-center"
          id="upload-btn"
        >
          {uploading ? (
            <>
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              Upload Questions
            </>
          )}
        </button>

        {/* Format Reference */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-200 mb-2">Required JSON Format</h3>
          <pre className="bg-surface-3 rounded-lg p-3 text-xs text-zinc-400 overflow-x-auto">
{`[
  { "difficulty": "Easy", "question": "What is JVM?" },
  { "difficulty": "Medium", "question": "Explain HashMap." },
  { "difficulty": "Hard", "question": "Explain Java Memory Model." }
]`}
          </pre>
          <p className="text-xs text-zinc-600 mt-2">
            Difficulty must be exactly: <span className="text-emerald-400">Easy</span>,{' '}
            <span className="text-amber-400">Medium</span>, or{' '}
            <span className="text-red-400">Hard</span>
          </p>
        </div>
      </div>
    </div>
  );
}
