/**
 * pages/Settings.jsx — Admin settings: password change, API key display
 */
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { admin } = useAuth();
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const apiKey = import.meta.env.VITE_API_KEY_HINT || 'Set in backend .env as API_KEY';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const changePwMutation = useMutation({
    mutationFn: (data) => authService.changePassword(data),
    onSuccess: (res) => {
      // Update token if new one returned
      if (res.data.data?.token) {
        localStorage.setItem('qbank_token', res.data.data.token);
      }
      toast.success('Password changed successfully!');
      reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to change password'),
  });

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="page-header">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-subtitle">Manage your account and API configuration</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* Admin Profile */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Admin Profile</h3>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shrink-0">
              {admin?.username?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <p className="font-medium text-zinc-100 capitalize">{admin?.username}</p>
              <p className="text-sm text-zinc-500 capitalize">{admin?.role}</p>
              <p className="text-xs text-zinc-600 mt-0.5">
                Member since {new Date(admin?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-200 mb-4">Change Password</h3>
          <form onSubmit={handleSubmit((d) => changePwMutation.mutate(d))} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                id="current-password"
                type="password"
                placeholder="••••••••"
                className={`input ${errors.currentPassword ? 'input-error' : ''}`}
                {...register('currentPassword', { required: 'Current password is required' })}
              />
              {errors.currentPassword && (
                <p className="text-xs text-red-400 mt-1.5">{errors.currentPassword.message}</p>
              )}
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                id="new-password"
                type="password"
                placeholder="••••••••"
                className={`input ${errors.newPassword ? 'input-error' : ''}`}
                {...register('newPassword', {
                  required: 'New password is required',
                  minLength: { value: 6, message: 'At least 6 characters' },
                })}
              />
              {errors.newPassword && (
                <p className="text-xs text-red-400 mt-1.5">{errors.newPassword.message}</p>
              )}
            </div>
            <button
              type="submit"
              disabled={changePwMutation.isPending}
              className="btn-primary"
              id="change-password-btn"
            >
              {changePwMutation.isPending ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* API Key */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-200 mb-1">Public API Key</h3>
          <p className="text-xs text-zinc-500 mb-4">
            This key must be sent as <code className="text-brand-400 bg-brand-600/10 px-1 rounded">x-api-key</code> header from your AI Mock Interview project.
          </p>
          <div className="flex items-center gap-2">
            <div className="flex-1 bg-surface-3 border border-zinc-700 rounded-lg px-3.5 py-2.5 text-sm font-mono text-zinc-300 truncate">
              {apiKeyVisible ? apiKey : '•'.repeat(32)}
            </div>
            <button
              onClick={() => setApiKeyVisible((v) => !v)}
              className="btn-secondary btn-sm"
              id="toggle-api-key"
            >
              {apiKeyVisible ? 'Hide' : 'Show'}
            </button>
            <button
              onClick={() => { navigator.clipboard.writeText(apiKey); toast.success('Copied!'); }}
              className="btn-secondary btn-sm"
              id="copy-api-key"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            Set <code className="text-zinc-400">API_KEY</code> in your backend <code className="text-zinc-400">.env</code> to change this key.
          </p>
        </div>

        {/* Public API Reference */}
        <div className="card">
          <h3 className="text-sm font-semibold text-zinc-200 mb-3">Public API Reference</h3>
          <div className="space-y-3">
            <div className="bg-surface-3 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded font-mono font-bold">POST</span>
                <code className="text-xs text-zinc-300">/api/public/questions/random</code>
              </div>
              <pre className="text-xs text-zinc-500 overflow-x-auto">{`{
  "skills": ["java", "react"],
  "difficulty": "Medium",  // or "Mixed"
  "limit": 5
}`}</pre>
            </div>
            <div className="bg-surface-3 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded font-mono font-bold">GET</span>
                <code className="text-xs text-zinc-300">/api/public/skills</code>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
