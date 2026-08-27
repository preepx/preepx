import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { companyPrepService } from '../services/companyPrep';
import ConfirmDialog from '../components/ConfirmDialog';
import { SkeletonCard } from '../components/SkeletonLoader';

// We can define some top companies to get logo paths or badge colors, 
// or simply rely on the unique slugs from the database.
const COMPANY_META = {
  google: { logo: "/company/google-2015-logo-svgrepo-com.svg", color: "#a855f7" },
  amazon: { logo: "/company/amazon-2-logo-svgrepo-com.svg", color: "#f59e0b" },
  facebook: { logo: "/company/facebook-1-logo-svgrepo-com.svg", color: "#8b5cf6" },
  netflix: { logo: "/company/netflix-2-logo-svgrepo-com.svg", color: "#ef4444" },
  linkedin: { logo: "/company/linkedin-logo-svgrepo-com.svg", color: "#3b82f6" },
  flipkart: { logo: "/company/flipkart-logo-svgrepo-com.svg", color: "#f59e0b" },
  walmart: { logo: "/company/walmart-logo-svgrepo-com.svg", color: "#0ea5e9" },
  oracle: { logo: "/company/oracle-6-logo-svgrepo-com.svg", color: "#ef4444" },
  ibm: { logo: "/company/ibm-logo-svgrepo-com.svg", color: "#6366f1" },
  cisco: { logo: "/company/cisco-2-logo-svgrepo-com.svg", color: "#10b981" },
  paypal: { logo: "/company/paypal-logo-svgrepo-com.svg", color: "#3b82f6" },
  salesforce: { logo: "/company/salesforce-2-logo-svgrepo-com.svg", color: "#0ea5e9" },
  mastercard: { logo: "/company/mastercard-2-logo-svgrepo-com.svg", color: "#f59e0b" },
  visa: { logo: "/company/visa-logo-svgrepo-com.svg", color: "#1d4ed8" },
  booking: { logo: "/company/bookingcom-logo-svgrepo-com.svg", color: "#0284c7" },
  dhl: { logo: "/company/dhl-express-logo-svgrepo-com.svg", color: "#dc2626" },
  hyundai: { logo: "/company/hyundai-automobiles-1-logo-svgrepo-com.svg", color: "#64748b" },
};

export default function CompanyPrep() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['company-prep-questions'],
    queryFn: () => companyPrepService.getAllQuestions(),
  });

  // Group questions by company for the main view
  const companiesData = useMemo(() => {
    if (!Array.isArray(questions)) return [];
    const grouped = {};
    questions.forEach((q) => {
      if (!grouped[q.slug]) {
        grouped[q.slug] = {
          slug: q.slug,
          name: q.company_name,
          questions: [],
          mcqCount: 0,
          codingCount: 0,
          theoryCount: 0,
        };
      }
      grouped[q.slug].questions.push(q);
      if (q.type === 'mcq') grouped[q.slug].mcqCount++;
      else if (q.type === 'coding') grouped[q.slug].codingCount++;
      else if (q.type === 'theory') grouped[q.slug].theoryCount++;
    });
    
    return Object.values(grouped).sort((a, b) => b.questions.length - a.questions.length);
  }, [questions]);

  // Filter companies by search
  const filteredCompanies = companiesData.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  // If a company is selected, prepare its grouped questions
  const selectedCompanyData = selectedCompany ? companiesData.find(c => c.slug === selectedCompany) : null;
  const companyQuestions = selectedCompanyData?.questions || [];
  
  const mcqQuestions = companyQuestions.filter(q => q.type === 'mcq');
  const codingQuestions = companyQuestions.filter(q => q.type === 'coding');
  const theoryQuestions = companyQuestions.filter(q => q.type === 'theory');

  const deleteMutation = useMutation({
    mutationFn: (id) => companyPrepService.deleteQuestion(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['company-prep-questions']);
      toast.success('Question deleted successfully');
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to delete question'),
  });

  const renderQuestionCard = (q) => (
    <div key={q._id} className="card flex flex-col justify-between hover:border-zinc-700 transition-colors">
      <div>
        <div className="flex justify-between items-start mb-2">
          <span className={`text-xs font-semibold px-2 py-1 rounded capitalize
            ${q.difficulty?.toLowerCase() === 'easy' ? 'bg-emerald-500/20 text-emerald-400' :
              q.difficulty?.toLowerCase() === 'hard' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            }`}>
            {q.difficulty || 'Medium'}
          </span>
          <button
            onClick={() => setDeleteTarget(q._id)}
            className="btn-icon btn-sm text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            title="Delete"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} className="w-4 h-4">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
            </svg>
          </button>
        </div>
        <h3 className="text-sm font-semibold text-zinc-200 mb-1">{q.title}</h3>
        {q.topic && <p className="text-xs text-brand-400 mb-3">{q.topic}</p>}
        
        {/* Specific fields based on type */}
        {q.type === 'mcq' && (
          <div className="mt-2 space-y-1">
            {q.options?.slice(0, 2).map((opt, i) => (
              <p key={i} className="text-xs text-zinc-500 truncate">• {opt}</p>
            ))}
            {q.options?.length > 2 && <p className="text-xs text-zinc-500 italic">+{q.options.length - 2} more options</p>}
          </div>
        )}
        {q.type === 'coding' && (
          <p className="text-xs text-zinc-500 line-clamp-2 mt-2">{q.statement}</p>
        )}
        {q.type === 'theory' && (
          <p className="text-xs text-zinc-500 line-clamp-2 mt-2">{q.prompt}</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="animate-fade-in pb-10">
      {/* Detail View */}
      {selectedCompany ? (
        <div>
          {/* Header */}
          <div className="flex items-center gap-4 mb-6">
            <button 
              onClick={() => setSelectedCompany(null)}
              className="btn-icon btn-secondary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
                <line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" />
              </svg>
            </button>
            <div className="flex items-center gap-3">
              {COMPANY_META[selectedCompany]?.logo ? (
                <img src={COMPANY_META[selectedCompany].logo} alt={selectedCompany} className="w-10 h-10 object-contain bg-white rounded-lg p-1" />
              ) : (
                <div className="w-10 h-10 rounded-lg bg-brand-500/20 text-brand-400 flex items-center justify-center font-bold text-xl uppercase">
                  {selectedCompany.charAt(0)}
                </div>
              )}
              <div>
                <h2 className="text-xl font-bold text-white">{selectedCompanyData?.name} Questions</h2>
                <p className="text-sm text-zinc-400">{selectedCompanyData?.questions.length} total questions</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-10">
            {/* Objective / MCQ Section */}
            {mcqQuestions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                  <h3 className="text-lg font-semibold text-white">Objective (MCQ)</h3>
                  <span className="badge bg-zinc-800 text-zinc-300">{mcqQuestions.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {mcqQuestions.map(renderQuestionCard)}
                </div>
              </section>
            )}

            {/* Coding Section */}
            {codingQuestions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                  <h3 className="text-lg font-semibold text-white">Coding</h3>
                  <span className="badge bg-zinc-800 text-zinc-300">{codingQuestions.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {codingQuestions.map(renderQuestionCard)}
                </div>
              </section>
            )}

            {/* Theory Section */}
            {theoryQuestions.length > 0 && (
              <section>
                <div className="flex items-center gap-2 mb-4 border-b border-zinc-800 pb-2">
                  <h3 className="text-lg font-semibold text-white">Theory</h3>
                  <span className="badge bg-zinc-800 text-zinc-300">{theoryQuestions.length}</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {theoryQuestions.map(renderQuestionCard)}
                </div>
              </section>
            )}
          </div>
        </div>
      ) : (
        /* Companies List View */
        <div>
          <div className="page-header">
            <div>
              <h2 className="page-title">Company Prep</h2>
              <p className="page-subtitle">Manage questions sorted by companies</p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
              className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search companies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input pl-10"
            />
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
              {filteredCompanies.map((c) => {
                const meta = COMPANY_META[c.slug];
                return (
                  <button
                    key={c.slug}
                    onClick={() => setSelectedCompany(c.slug)}
                    className="card group hover:border-brand-500/50 hover:bg-surface-2 transition-all duration-300 text-left flex flex-col items-center justify-center p-6 relative overflow-hidden"
                  >
                    {/* Background glow based on company color (simulated) */}
                    {meta?.color && (
                      <div 
                        className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity" 
                        style={{ backgroundColor: meta.color }} 
                      />
                    )}

                    <div className="w-16 h-16 mb-4 flex items-center justify-center rounded-2xl bg-surface-1 shadow-xl border border-zinc-800/50 p-2 group-hover:scale-110 transition-transform duration-300">
                      {meta?.logo ? (
                        <img src={meta.logo} alt={c.name} className="w-full h-full object-contain" />
                      ) : (
                        <span className="text-2xl font-bold text-zinc-300 uppercase">{c.name.charAt(0)}</span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{c.name}</h3>
                    <p className="text-sm text-zinc-400 mb-4">{c.questions.length} Questions</p>

                    <div className="flex items-center gap-2 mt-auto w-full justify-center">
                      {c.mcqCount > 0 && <span className="text-[10px] uppercase font-bold text-brand-400 bg-brand-500/10 px-2 py-1 rounded">MCQ: {c.mcqCount}</span>}
                      {c.codingCount > 0 && <span className="text-[10px] uppercase font-bold text-purple-400 bg-purple-500/10 px-2 py-1 rounded">Code: {c.codingCount}</span>}
                      {c.theoryCount > 0 && <span className="text-[10px] uppercase font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">Theory: {c.theoryCount}</span>}
                    </div>
                  </button>
                );
              })}
              {filteredCompanies.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <p className="text-zinc-500">No companies found.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Delete Question"
        message="Are you sure you want to delete this question? This action cannot be undone."
        onConfirm={() => deleteMutation.mutate(deleteTarget)}
        onCancel={() => setDeleteTarget(null)}
        loading={deleteMutation.isPending}
      />
    </div>
  );
}
