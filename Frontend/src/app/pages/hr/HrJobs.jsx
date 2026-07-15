import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'motion/react';
import { api } from '../../services/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  Briefcase,
  CalendarDays,
  Edit2,
  Plus,
  Tag,
  Trash2,
  Users,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { HrLayout } from '../../components/HrLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';

const emptyForm = { title: '', description: '', requiredSkills: '', interviewTopics: '' };

export function HrJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => { loadJobs(); }, []);

  const loadJobs = async () => {
    setLoading(true);
    try { setJobs(await api.getMyJobs()); }
    catch (error) { toast.error(error.response?.data?.error || 'Unable to load the jobs in this HR workspace.'); }
    finally { setLoading(false); }
  };

  const openDialog = (job = null) => {
    if (job) {
      setEditingJob(job);
      setFormData({
        title: job.title,
        description: job.description,
        requiredSkills: job.requiredSkills.join(', '),
        interviewTopics: job.interviewTopics.join(', ')
      });
    } else {
      setEditingJob(null);
      setFormData(emptyForm);
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        requiredSkills: formData.requiredSkills.split(',').map((s) => s.trim()).filter(Boolean),
        interviewTopics: formData.interviewTopics.split(',').map((s) => s.trim()).filter(Boolean)
      };
      if (editingJob) {
        await api.updateJob(editingJob._id, payload);
        toast.success('Job post updated successfully.');
      } else {
        await api.createJob(payload);
        toast.success('Job post published successfully.');
      }
      setDialogOpen(false);
      loadJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to save the job post. Please review the details and try again.');
    }
  };

  const handleDelete = async (job) => {
    if (!confirm(`Delete "${job.title}"?\n\nThis will remove the public job post from your HR workspace.`)) return;
    try {
      await api.deleteJob(job._id);
      toast.success('Job post deleted.');
      loadJobs();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to delete the selected job post.');
    }
  };

  const f = (k) => (e) => setFormData({ ...formData, [k]: e.target.value });

  if (loading) {
    return <LoadingSpinner message="Loading your job posts..." />;
  }

  return (
    <>
      <HrLayout
        active="jobs"
        eyebrow="Job Management"
      title="Open roles"
        subtitle="Create and manage the public job posts owned by your HR account. Candidate review and interview data remain private to this workspace."
        actions={(
          <motion.button
            type="button"
            onClick={() => openDialog()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="btn-gradient flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold"
          >
            <Plus className="h-4 w-4" />
            Create Job Post
          </motion.button>
        )}
      >
        {jobs.length === 0 ? (
          <div className="empty-state flex min-h-[420px] flex-col items-center justify-center px-6 text-center">
            <Briefcase className="mb-4 h-12 w-12 text-muted-foreground" />
            <p className="text-2xl font-bold text-foreground">No job posts created yet</p>
            <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">
              Publish your first role to start collecting applications, ATS scores, interviews, and recruiter review data in this workspace.
            </p>
            <button
              type="button"
              onClick={() => openDialog()}
              className="btn-gradient mt-7 rounded-2xl px-5 py-3 text-sm font-semibold"
            >
              Create Job Post
            </button>
          </div>
        ) : (
          <motion.div
            variants={{ hidden: {}, show: { transition: { staggerChildren: 0.08 } } }}
            initial="hidden"
            animate="show"
            className="grid gap-5"
          >
            {jobs.map((job) => (
              <motion.div
                key={job._id}
                variants={{ hidden: { opacity: 0, y: 18 }, show: { opacity: 1, y: 0, transition: { duration: 0.34 } } }}
                className="surface-panel rounded-[1.8rem] p-6 sm:p-7"
              >
                <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-5 flex flex-wrap items-start gap-4">
                      <div className="inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.12)] text-[var(--primary)]">
                        <Briefcase className="h-5 w-5" />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
                          <span className="section-kicker">Live Job Post</span>
                          <span className="chip-sky">
                            <CalendarDays className="h-3 w-3" />
                            Posted {new Date(job.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                          </span>
                        </div>
                        <h2 className="text-2xl font-bold text-foreground">{job.title}</h2>
                      </div>
                    </div>

                    <p className="text-sm leading-8 text-muted-foreground">
                      {job.description}
                    </p>

                    <div className="mt-6 space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {job.requiredSkills.map((skill, index) => (
                          <span key={index} className="chip-violet">
                            <Tag className="h-3 w-3" />
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {job.interviewTopics.map((topic, index) => (
                          <span key={index} className="chip-sky">
                            <Zap className="h-3 w-3" />
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[270px] xl:grid-cols-1">
                    <button
                      onClick={() => navigate(`/hr/jobs/${job._id}/candidates`)}
                      className="control-button control-button-secondary justify-center rounded-2xl px-4 py-3 text-sm"
                    >
                      <Users className="h-4 w-4" />
                      View Candidates
                    </button>
                    <button
                      onClick={() => openDialog(job)}
                      className="control-button justify-center rounded-2xl px-4 py-3 text-sm"
                    >
                      <Edit2 className="h-4 w-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job)}
                      className="control-button justify-center rounded-2xl px-4 py-3 text-sm text-[var(--destructive)]"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </HrLayout>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="max-h-[90vh] max-w-2xl overflow-y-auto rounded-[1.8rem] border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              {editingJob ? 'Edit Job Post' : 'Create Job Post'}
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              {editingJob
                ? 'Update the role details below. Company name and recruiter email continue to come from your HR account.'
                : 'Add the role details below. Company name and recruiter email are pulled automatically from your HR account and shown on the public role page.'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="mt-3 space-y-5">
            {[
              { key: 'title', label: 'Job Title', placeholder: 'e.g., Full-Stack Web Developer Intern', type: 'input' },
              { key: 'description', label: 'Job Description', placeholder: 'Describe responsibilities, required experience, and what success looks like in this role.', type: 'textarea' },
              { key: 'requiredSkills', label: 'Required Skills (comma-separated)', placeholder: 'React.js, Node.js, Express, MongoDB', type: 'input' },
              { key: 'interviewTopics', label: 'Interview Focus Areas (comma-separated)', placeholder: 'REST APIs, State Management, Authentication', type: 'input' }
            ].map(({ key, label, placeholder, type }) => (
              <div key={key}>
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {label}
                </label>
                {type === 'textarea' ? (
                  <textarea
                    value={formData[key]}
                    onChange={f(key)}
                    placeholder={placeholder}
                    rows={5}
                    required
                    className="w-full resize-none rounded-2xl border px-4 py-3 text-sm transition-all"
                    style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                ) : (
                  <input
                    type="text"
                    value={formData[key]}
                    onChange={f(key)}
                    placeholder={placeholder}
                    required
                    className="w-full rounded-2xl border px-4 py-3 text-sm transition-all"
                    style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                  />
                )}
              </div>
            ))}

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDialogOpen(false)}
                className="control-button control-button-ghost rounded-2xl px-5 py-3 text-sm"
              >
                Close
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                className="btn-gradient rounded-2xl px-5 py-3 text-sm font-semibold"
              >
                {editingJob ? 'Save Changes' : 'Publish Job Post'}
              </motion.button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
