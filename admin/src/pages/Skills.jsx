/**
 * pages/Skills.jsx — Create, rename, delete skills
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { skillsService } from '../services/skills';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCard } from '../components/SkeletonLoader';

export default function Skills() {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [renameTarget, setRenameTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [search, setSearch] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillsService.getAll(),
  });

  const skillsData = data?.data?.data;
  const skills = skillsData?.skills || [];

  const filtered = skills.filter((s) =>
    s.skill.toLowerCase().includes(search.toLowerCase())
  );

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: (d) => skillsService.create(d),
    onSuccess: () => {
      queryClient.invalidateQueries(['skills']);
      toast.success('Skill created!');
      setCreateOpen(false);
      createForm.reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to create skill'),
  });

  const renameMutation = useMutation({
    mutationFn: ({ skill, data }) => skillsService.rename(skill, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['skills']);
      toast.success('Skill renamed!');
      setRenameTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to rename skill'),
  });

  const deleteMutation = useMutation({
    mutationFn: (skill) => skillsService.delete(skill),
    onSuccess: () => {
      queryClient.invalidateQueries(['skills']);
      toast.success('Skill deleted');
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete skill'),
  });

  const createForm = useForm();
  const renameForm = useForm();

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="page-title">Skills</h2>
          <p className="page-subtitle">{skills.length} technology categories</p>
        </div>
        <button onClick={() => setCreateOpen(true)} className="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Skill
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-5">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
          <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          placeholder="Search skills..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-10"
          id="skills-search"
        />
      </div>

      {/* Skills Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((skill) => (
            <div key={skill.skill} className="card hover:border-zinc-700 transition-all duration-200 group">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center">
                  <span className="text-sm font-bold text-brand-400 uppercase">
                    {skill.skill.slice(0, 2)}
                  </span>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => { setRenameTarget(skill); renameForm.setValue('newName', skill.displayName); }}
                    className="btn-icon btn-ghost btn-sm"
                    title="Rename"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-3.5 h-3.5">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setDeleteTarget(skill.skill)}
                    className="btn-icon btn-sm text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    title="Delete"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-3.5 h-3.5">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      <path d="M10 11v6M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>

              <Link to={`/questions/${skill.skill}`}>
                <h3 className="text-sm font-semibold text-zinc-200 capitalize mb-1 hover:text-brand-400 transition-colors">
                  {skill.displayName}
                </h3>
              </Link>
              <p className="text-2xl font-bold text-white">{skill.totalQuestions}</p>
              <p className="text-xs text-zinc-500">questions</p>

              <div className="flex gap-3 mt-3 pt-3 border-t border-zinc-800/50">
                <span className="text-xs text-emerald-400">{skill.easy} Easy</span>
                <span className="text-xs text-amber-400">{skill.medium} Med</span>
                <span className="text-xs text-red-400">{skill.hard} Hard</span>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-zinc-500 text-sm">No skills found</p>
            </div>
          )}
        </div>
      )}

      {/* Create Skill Modal */}
      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create New Skill">
        <form onSubmit={createForm.handleSubmit((d) => createMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Skill Name</label>
            <input
              id="new-skill-name"
              placeholder="e.g. Rust, Kotlin, GraphQL"
              className={`input ${createForm.formState.errors.name ? 'input-error' : ''}`}
              {...createForm.register('name', { required: 'Skill name is required' })}
            />
            {createForm.formState.errors.name && (
              <p className="text-xs text-red-400 mt-1.5">{createForm.formState.errors.name.message}</p>
            )}
            <p className="text-xs text-zinc-500 mt-1.5">
              A new <code className="text-brand-400">.json</code> file will be created automatically.
            </p>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setCreateOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={createMutation.isPending} className="btn-primary flex-1 justify-center">
              {createMutation.isPending ? 'Creating...' : 'Create Skill'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Rename Skill Modal */}
      <Modal isOpen={!!renameTarget} onClose={() => setRenameTarget(null)} title="Rename Skill">
        <form
          onSubmit={renameForm.handleSubmit((d) =>
            renameMutation.mutate({ skill: renameTarget?.skill, data: d })
          )}
          className="space-y-4"
        >
          <div>
            <label className="label">New Skill Name</label>
            <input
              id="rename-skill-name"
              placeholder="New name"
              className={`input ${renameForm.formState.errors.newName ? 'input-error' : ''}`}
              {...renameForm.register('newName', { required: 'New name is required' })}
            />
            {renameForm.formState.errors.newName && (
              <p className="text-xs text-red-400 mt-1.5">{renameForm.formState.errors.newName.message}</p>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setRenameTarget(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={renameMutation.isPending} className="btn-primary flex-1 justify-center">
              {renameMutation.isPending ? 'Renaming...' : 'Rename'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Skill"
        message={`Are you sure you want to delete "${deleteTarget}"? This will permanently delete all its questions.`}
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
