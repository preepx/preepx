/**
 * pages/Questions.jsx — Browse and select a skill, then view/manage questions
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { questionsService } from '../services/questions';
import { skillsService } from '../services/skills';
import Badge from '../components/Badge';
import Pagination from '../components/Pagination';
import Modal from '../components/Modal';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonTable } from '../components/SkeletonLoader';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

export default function Questions() {
  const { skill } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [difficulty, setDifficulty] = useState('All');
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ─── Skill selector (when no skill in URL) ──────────────────────────────
  const { data: skillsRes } = useQuery({
    queryKey: ['skills'],
    queryFn: () => skillsService.getAll(),
  });
  const skillsList = skillsRes?.data?.data?.skills || [];

  // ─── Questions query ─────────────────────────────────────────────────────
  const { data, isLoading } = useQuery({
    queryKey: ['questions', skill, page, difficulty, search],
    queryFn: () =>
      questionsService.getAll(skill, { page, limit: 25, difficulty, search }),
    enabled: !!skill,
    keepPreviousData: true,
  });

  const questionsData = data?.data?.data;
  const questions = questionsData?.questions || [];

  // ─── Mutations ─────────────────────────────────────────────────────────
  const addForm = useForm();
  const editForm = useForm();

  const addMutation = useMutation({
    mutationFn: (d) => questionsService.add(skill, d),
    onSuccess: () => {
      queryClient.invalidateQueries(['questions', skill]);
      queryClient.invalidateQueries(['skills']);
      toast.success('Question added!');
      setAddOpen(false);
      addForm.reset();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to add question'),
  });

  const editMutation = useMutation({
    mutationFn: ({ index, data }) => questionsService.edit(skill, index, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['questions', skill]);
      toast.success('Question updated!');
      setEditTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to update question'),
  });

  const deleteMutation = useMutation({
    mutationFn: (index) => questionsService.delete(skill, index),
    onSuccess: () => {
      queryClient.invalidateQueries(['questions', skill]);
      queryClient.invalidateQueries(['skills']);
      toast.success('Question deleted');
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete'),
  });

  const handleExport = async () => {
    try {
      const res = await questionsService.export(skill);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const a = document.createElement('a');
      a.href = url;
      a.download = `${skill}.json`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success(`${skill}.json downloaded!`);
    } catch {
      toast.error('Export failed');
    }
  };

  const openEdit = (q) => {
    setEditTarget(q);
    editForm.setValue('question', q.question);
    editForm.setValue('difficulty', q.difficulty);
  };

  // ─── Skill selector screen ────────────────────────────────────────────────
  if (!skill) {
    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h2 className="page-title">Questions</h2>
            <p className="page-subtitle">Select a skill to manage its questions</p>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {skillsList.map((s) => (
            <Link
              key={s.skill}
              to={`/questions/${s.skill}`}
              className="card hover:border-zinc-600 transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-brand-600/10 flex items-center justify-center mb-3">
                <span className="text-sm font-bold text-brand-400 uppercase">{s.skill.slice(0, 2)}</span>
              </div>
              <p className="text-sm font-semibold text-zinc-200 capitalize group-hover:text-brand-400 transition-colors">{s.displayName}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{s.totalQuestions} questions</p>
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <button onClick={() => navigate('/questions')} className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm">
              Questions
            </button>
            <span className="text-zinc-700">/</span>
            <span className="text-sm font-medium text-zinc-200 capitalize">{skill}</span>
          </div>
          <p className="page-subtitle">
            {questionsData?.pagination?.total ?? '–'} questions total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-4 h-4">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export JSON
          </button>
          <button onClick={() => setAddOpen(true)} className="btn-primary">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-4 h-4">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add Question
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        {/* Search */}
        <div className="relative flex-1">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
            className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search questions..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input pl-10"
            id="questions-search"
          />
        </div>

        {/* Difficulty filter */}
        <div className="flex gap-1.5">
          {DIFFICULTIES.map((d) => (
            <button
              key={d}
              onClick={() => { setDifficulty(d); setPage(1); }}
              className={`btn btn-sm ${
                difficulty === d
                  ? d === 'Easy' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-700/50'
                  : d === 'Medium' ? 'bg-amber-600/20 text-amber-400 border border-amber-700/50'
                  : d === 'Hard' ? 'bg-red-600/20 text-red-400 border border-red-700/50'
                  : 'bg-brand-600/20 text-brand-400 border border-brand-700/50'
                  : 'btn-secondary'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <SkeletonTable rows={8} cols={4} />
      ) : (
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>#</th>
                <th>Question</th>
                <th>Difficulty</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {questions.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-zinc-500 text-sm">
                    No questions found. Add one!
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q.index}>
                    <td className="text-zinc-500 w-12">{q.index + 1}</td>
                    <td className="max-w-md">
                      <p className="text-sm text-zinc-200 line-clamp-2">{q.question}</p>
                    </td>
                    <td><Badge difficulty={q.difficulty} /></td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => openEdit(q)}
                          className="btn btn-ghost btn-sm text-zinc-500 hover:text-zinc-200"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setDeleteTarget(q.index)}
                          className="btn btn-sm text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination pagination={questionsData?.pagination} onPageChange={setPage} />
        </div>
      )}

      {/* Add Question Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Question" size="lg">
        <form onSubmit={addForm.handleSubmit((d) => addMutation.mutate(d))} className="space-y-4">
          <div>
            <label className="label">Question</label>
            <textarea
              id="add-question-text"
              rows={4}
              placeholder="Enter your interview question..."
              className={`input resize-none ${addForm.formState.errors.question ? 'input-error' : ''}`}
              {...addForm.register('question', { required: 'Question is required', minLength: { value: 10, message: 'At least 10 characters' } })}
            />
            {addForm.formState.errors.question && (
              <p className="text-xs text-red-400 mt-1.5">{addForm.formState.errors.question.message}</p>
            )}
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select id="add-difficulty" className={`select ${addForm.formState.errors.difficulty ? 'input-error' : ''}`}
              {...addForm.register('difficulty', { required: 'Difficulty is required' })}>
              <option value="">Select difficulty</option>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setAddOpen(false)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={addMutation.isPending} className="btn-primary flex-1 justify-center">
              {addMutation.isPending ? 'Adding...' : 'Add Question'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Question Modal */}
      <Modal isOpen={!!editTarget} onClose={() => setEditTarget(null)} title="Edit Question" size="lg">
        <form
          onSubmit={editForm.handleSubmit((d) => editMutation.mutate({ index: editTarget?.index, data: d }))}
          className="space-y-4"
        >
          <div>
            <label className="label">Question</label>
            <textarea
              id="edit-question-text"
              rows={4}
              className={`input resize-none ${editForm.formState.errors.question ? 'input-error' : ''}`}
              {...editForm.register('question', { required: 'Question is required', minLength: { value: 10, message: 'At least 10 characters' } })}
            />
          </div>
          <div>
            <label className="label">Difficulty</label>
            <select id="edit-difficulty" className="select"
              {...editForm.register('difficulty', { required: true })}>
              <option>Easy</option><option>Medium</option><option>Hard</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => setEditTarget(null)} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={editMutation.isPending} className="btn-primary flex-1 justify-center">
              {editMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={deleteTarget !== null}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
