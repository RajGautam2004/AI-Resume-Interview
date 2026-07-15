import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import { api } from '../../services/api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart2,
  CalendarDays,
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Loader2,
  MailCheck,
  MapPin,
  MessageSquare,
  Shield,
  Star,
  Target,
  Trash2,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  XCircle
} from 'lucide-react';
import { HrLayout } from '../../components/HrLayout';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { toast } from 'sonner';

const rankMeta = [
  { icon: Trophy, color: '#f5b94c', bg: 'rgba(var(--warning-rgb),0.14)', border: 'rgba(var(--warning-rgb),0.24)' },
  { icon: Star, color: 'var(--info)', bg: 'rgba(var(--info-rgb),0.14)', border: 'rgba(var(--info-rgb),0.24)' },
  { icon: TrendingUp, color: 'var(--success)', bg: 'rgba(var(--success-rgb),0.14)', border: 'rgba(var(--success-rgb),0.24)' }
];
const TECHNICAL_ROUND_THRESHOLD = 15;

function formatInvitationDate(dateValue) {
  if (!dateValue) return 'Not scheduled';
  return new Date(dateValue).toLocaleString('en-US', {
    dateStyle: 'full',
    timeStyle: 'short'
  });
}

function toDateTimeLocalValue(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '';

  const pad = (value) => String(value).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getStatusBadgeMeta(status) {
  switch (status) {
    case 'Shortlisted':
      return {
        background: 'rgba(var(--warning-rgb),0.12)',
        color: 'var(--warning)'
      };
    case 'Technical Interview Scheduled':
      return {
        background: 'rgba(var(--success-rgb),0.12)',
        color: 'var(--success)'
      };
    case 'Rejected':
      return {
        background: 'rgba(239,82,95,0.12)',
        color: 'var(--destructive)'
      };
    case 'Applied':
    default:
      return {
        background: 'rgba(var(--info-rgb),0.12)',
        color: 'var(--info)'
      };
  }
}

function ScorePill({ score, label }) {
  if (score === null || score === undefined) return null;
  const color = score >= 75 ? 'var(--success)' : score >= 50 ? 'var(--warning)' : 'var(--destructive)';
  const tone = score >= 75 ? 'rgba(var(--success-rgb),0.12)' : score >= 50 ? 'rgba(var(--warning-rgb),0.12)' : 'rgba(239,82,95,0.12)';
  const border = score >= 75 ? 'rgba(var(--success-rgb),0.24)' : score >= 50 ? 'rgba(var(--warning-rgb),0.24)' : 'rgba(239,82,95,0.22)';

  return (
    <div className="text-right">
      {label && <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>}
      <span
        className="mt-2 inline-flex rounded-full border px-3 py-1 text-sm font-semibold tabular-nums"
        style={{ background: tone, color, borderColor: border }}
      >
        {score}<span className="ml-0.5 text-xs opacity-70">/100</span>
      </span>
    </div>
  );
}

function getProctoringMetrics(candidate) {
  const events = Array.isArray(candidate.proctoringEvents) ? candidate.proctoringEvents : [];
  const summary = candidate.proctoringSummary || {};

  return {
    events,
    faceDetectionCount: Number(summary.faceDetectionCount) || 0,
    warningCount:
      Number(summary.warningCount) ||
      events.filter((event) => event.severity === 'warning').length,
    alertCount:
      Number(summary.alertCount) ||
      events.length,
    criticalCount:
      Number(summary.criticalCount) ||
      events.filter((event) => event.severity === 'critical').length
  };
}

function ProctoringReview({ candidate }) {
  const {
    events,
    faceDetectionCount,
    warningCount,
    alertCount,
    criticalCount
  } = getProctoringMetrics(candidate);
  const recentEvents = [...events].slice(-6).reverse();

  return (
    <div className="surface-panel-soft rounded-[1.5rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Shield className="h-3.5 w-3.5" />
            Proctoring Summary
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            Browser and webcam signals captured during the candidate&apos;s interview session.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Faces', value: faceDetectionCount, color: 'var(--info)', bg: 'rgba(var(--info-rgb),0.12)', border: 'rgba(var(--info-rgb),0.24)' },
            { label: 'Warnings', value: warningCount, color: 'var(--warning)', bg: 'rgba(var(--warning-rgb),0.12)', border: 'rgba(var(--warning-rgb),0.24)' },
            { label: 'Alerts', value: alertCount, color: 'var(--destructive)', bg: 'rgba(239,82,95,0.12)', border: 'rgba(239,82,95,0.24)' }
          ].map((item) => (
            <span
              key={item.label}
              className="inline-flex rounded-full border px-3 py-1.5 text-xs font-semibold"
              style={{ color: item.color, background: item.bg, borderColor: item.border }}
            >
              {item.label}: {item.value}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Eye className="h-3.5 w-3.5" />
            Latest Signals
          </p>

          {recentEvents.length === 0 ? (
            <p className="mt-4 text-sm leading-7 text-muted-foreground">
              No proctoring events were stored for this interview session.
            </p>
          ) : (
            <div className="mt-4 space-y-3">
              {recentEvents.map((event, index) => (
                <div key={`${event.eventType}-${event.timestamp}-${index}`} className="rounded-[1rem] border border-white/8 bg-black/10 px-3 py-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-sm font-semibold text-foreground">
                      {(event.eventType || 'UNKNOWN').replaceAll('_', ' ')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {event.timestamp ? new Date(event.timestamp).toLocaleString() : 'Unknown time'}
                    </span>
                  </div>
                  {event.message && (
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{event.message}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="rounded-[1.2rem] border p-4"
          style={{
            borderColor: criticalCount > 0 ? 'rgba(239,82,95,0.24)' : 'rgba(var(--success-rgb),0.22)',
            background: criticalCount > 0 ? 'rgba(239,82,95,0.08)' : 'rgba(var(--success-rgb),0.07)'
          }}
        >
          <p
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em]"
            style={{ color: criticalCount > 0 ? 'var(--destructive)' : 'var(--success)' }}
          >
            <AlertTriangle className="h-3.5 w-3.5" />
            Recruiter Review Note
          </p>
          <p className="mt-4 text-sm leading-7 text-foreground">
            {criticalCount > 0
              ? 'Critical proctoring events were detected during the interview. Review them alongside the transcript and score before making a final decision.'
              : warningCount > 0
                ? 'Only warning-level proctoring signals were stored. Review them for context, but the interview completed without a critical interruption.'
                : 'No suspicious proctoring activity was stored for this interview session.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function InterviewSnapshotPanel({ candidate }) {
  const snapshot = candidate.interviewSnapshot?.imageData;
  const capturedAt = candidate.interviewSnapshot?.capturedAt;

  return (
    <div className="surface-panel-soft rounded-[1.5rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Camera className="h-3.5 w-3.5" />
            Interview Snapshot
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            Still image saved from the live interview webcam for recruiter review.
          </p>
        </div>

        {capturedAt && (
          <span className="inline-flex rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Captured {new Date(capturedAt).toLocaleString()}
          </span>
        )}
      </div>

      {snapshot ? (
        <div className="mt-5 overflow-hidden rounded-[1.35rem] border border-white/8 bg-black/10">
          <img
            src={snapshot}
            alt={`${candidate.name} interview snapshot`}
            className="h-[280px] w-full object-cover md:h-[320px]"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="mt-5 rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5">
          <p className="text-sm leading-7 text-muted-foreground">
            No interview snapshot was saved for this session.
          </p>
        </div>
      )}
    </div>
  );
}

function SuspiciousEvidencePanel({ candidate }) {
  const evidenceItems = Array.isArray(candidate.proctoringEvidenceSnapshots)
    ? [...candidate.proctoringEvidenceSnapshots]
        .sort((left, right) => new Date(right.capturedAt || 0) - new Date(left.capturedAt || 0))
    : [];
  const lastHrAlertAt = candidate.proctoringAlertState?.lastMultipleFacesEmailAt;

  return (
    <div className="surface-panel-soft rounded-[1.5rem] p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Users className="h-3.5 w-3.5" />
            Suspicious Evidence
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            Snapshots captured specifically when suspicious face activity was detected.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="inline-flex rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
            Captures: {evidenceItems.length}
          </span>
          {lastHrAlertAt && (
            <span className="inline-flex rounded-full border border-white/8 bg-white/4 px-3 py-1.5 text-xs font-semibold text-muted-foreground">
              HR alerted {new Date(lastHrAlertAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {evidenceItems.length > 0 ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {evidenceItems.map((item, index) => (
            <div key={`${item.eventType || 'EVENT'}-${item.capturedAt || index}-${index}`} className="overflow-hidden rounded-[1.2rem] border border-white/8 bg-black/10">
              <img
                src={item.imageData}
                alt={`${candidate.name} suspicious evidence ${index + 1}`}
                className="h-44 w-full object-cover"
                loading="lazy"
              />
              <div className="space-y-2 px-4 py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-semibold text-foreground">
                    {(item.eventType || 'UNKNOWN').replaceAll('_', ' ')}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {item.capturedAt ? new Date(item.capturedAt).toLocaleString() : 'Unknown time'}
                  </span>
                </div>
                {item.message && (
                  <p className="text-sm leading-6 text-muted-foreground">{item.message}</p>
                )}
                {Number(item.details?.faceCount) > 0 && (
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Faces detected: {Number(item.details.faceCount)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.2rem] border border-dashed border-white/10 bg-white/[0.03] px-4 py-5">
          <p className="text-sm leading-7 text-muted-foreground">
            No suspicious evidence snapshots were stored for this session.
          </p>
        </div>
      )}
    </div>
  );
}

function EvaluationPanel({ candidate, job, onOpenInviteDialog, technicalRoundThreshold }) {
  const hasEval = candidate.evaluationStatus === 'complete' || candidate.interviewScore !== null;
  const hasTranscript = Array.isArray(candidate.interviewTranscript) && candidate.interviewTranscript.length > 0;
  const hasProctoring = Array.isArray(candidate.proctoringEvents) && candidate.proctoringEvents.length > 0;
  const hasSnapshot = Boolean(candidate.interviewSnapshot?.imageData);
  const hasEvidence = Array.isArray(candidate.proctoringEvidenceSnapshots) && candidate.proctoringEvidenceSnapshots.length > 0;
  const hasInterviewScore = typeof candidate.interviewScore === 'number';
  const isEligibleForTechnicalRound = hasInterviewScore && candidate.interviewScore >= technicalRoundThreshold;
  const technicalInvitation = candidate.technicalInterviewInvitation || {};
  const hasTechnicalInvite = Boolean(technicalInvitation?.scheduledAt && technicalInvitation?.location);

  if (!hasEval && !hasTranscript && !hasProctoring && !hasSnapshot && !hasEvidence) {
    return (
      <div className="px-6 pb-6 pt-2">
        <div className="empty-state rounded-[1.4rem] p-5 text-center">
          <p className="text-sm text-muted-foreground">
            This candidate has not completed the interview yet. Transcript, evaluation, and proctoring evidence will appear here after the session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 pb-6 pt-2 space-y-5">
      <InterviewSnapshotPanel candidate={candidate} />
      <SuspiciousEvidencePanel candidate={candidate} />

      <div className="surface-panel-soft rounded-[1.5rem] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <MailCheck className="h-3.5 w-3.5" />
              Company Technical Round
            </p>
            <p className="text-sm leading-7 text-muted-foreground">
              Recruiters can accept candidates for the next company technical round only when the HireAI interview score is {technicalRoundThreshold} or higher.
            </p>
          </div>

          {(hasEval && isEligibleForTechnicalRound) && (
            <button
              type="button"
              onClick={() => onOpenInviteDialog(candidate)}
              className="control-button control-button-secondary rounded-2xl px-4 py-3 text-sm"
            >
              <MailCheck className="h-4 w-4" />
              {hasTechnicalInvite ? 'Update Invite' : 'Accept for Technical Round'}
            </button>
          )}
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Eligibility</p>
            <p className="mt-3 text-sm font-semibold text-foreground">
              {hasInterviewScore
                ? candidate.interviewScore >= technicalRoundThreshold
                  ? `Eligible with ${candidate.interviewScore}/100`
                  : `Below threshold with ${candidate.interviewScore}/100`
                : 'Awaiting completed interview evaluation'}
            </p>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {hasInterviewScore
                ? candidate.interviewScore >= technicalRoundThreshold
                  ? `This candidate can be moved to the company technical round for ${job.companyName || 'the hiring team'}.`
                  : `This candidate is below the acceptance threshold of ${technicalRoundThreshold}/100 for the next round.`
                : 'Once the interview score is available, recruiter action will unlock automatically.'}
            </p>
          </div>

          <div className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Invite Status</p>
            {hasTechnicalInvite ? (
              <div className="mt-3 space-y-2 text-sm leading-6 text-foreground">
                <p><span className="font-semibold">Scheduled:</span> {formatInvitationDate(technicalInvitation.scheduledAt)}</p>
                <p><span className="font-semibold">Place:</span> {technicalInvitation.location}</p>
                <p><span className="font-semibold">Company:</span> {technicalInvitation.companyName || job.companyName || 'Hiring Team'}</p>
              </div>
            ) : (
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                No company technical round invitation has been sent for this candidate yet.
              </p>
            )}
          </div>
        </div>
      </div>

      {!hasEval && hasTranscript && (
        <div className="surface-panel-soft rounded-[1.5rem] p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Evaluation In Progress
          </p>
          <p className="text-sm leading-7 text-foreground">
            The interview transcript is already stored below. Gemini is still preparing the final evaluation and it will appear here automatically after refresh.
          </p>
        </div>
      )}

      {candidate.overallSummary && (
        <div className="surface-panel-soft rounded-[1.5rem] p-5">
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            AI Evaluation Summary
          </p>
          <p className="text-sm leading-7 text-foreground">{candidate.overallSummary}</p>
        </div>
      )}

      {((candidate.strengths?.length > 0) || (candidate.weaknesses?.length > 0)) && (
        <div className="grid gap-4 md:grid-cols-2">
          {candidate.strengths?.length > 0 && (
            <div className="rounded-[1.5rem] border p-5" style={{ borderColor: 'rgba(var(--success-rgb),0.22)', background: 'rgba(var(--success-rgb),0.07)' }}>
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--success)]">
                <TrendingUp className="h-3.5 w-3.5" />
                Strengths
              </p>
              <ul className="space-y-2">
                {candidate.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-7 text-foreground">
                    <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--success)]" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {candidate.weaknesses?.length > 0 && (
            <div className="rounded-[1.5rem] border p-5" style={{ borderColor: 'rgba(var(--warning-rgb),0.22)', background: 'rgba(var(--warning-rgb),0.07)' }}>
              <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--warning)]">
                <TrendingDown className="h-3.5 w-3.5" />
                Areas to Improve
              </p>
              <ul className="space-y-2">
                {candidate.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm leading-7 text-foreground">
                    <XCircle className="mt-1 h-4 w-4 flex-shrink-0 text-[var(--warning)]" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {candidate.questionFeedback?.length > 0 && (
        <div className="surface-panel-soft rounded-[1.5rem] p-5">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <BarChart2 className="h-3.5 w-3.5" />
            Answer-by-Answer Review
          </p>
          <div className="space-y-4">
            {candidate.questionFeedback.map((item, idx) => (
              <div key={idx} className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Q{idx + 1}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{item.question}</p>
                {item.candidateAnswer && (
                  <p className="mt-2 text-sm italic leading-7 text-muted-foreground">
                    &ldquo;{item.candidateAnswer}&rdquo;
                  </p>
                )}
                <p className="mt-3 text-sm leading-7 text-foreground">{item.feedback}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasTranscript && (
        <div className="surface-panel-soft rounded-[1.5rem] p-5">
          <p className="mb-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            <MessageSquare className="h-3.5 w-3.5" />
            Stored Interview Transcript
          </p>
          <div className="space-y-4">
            {candidate.interviewTranscript.map((entry, idx) => (
              <div key={`${entry.question}-${idx}`} className="rounded-[1.2rem] border border-white/8 bg-white/4 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Q{idx + 1}</p>
                <p className="mt-2 text-sm font-semibold text-foreground">{entry.question}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  {entry.candidateAnswer || 'No answer was stored for this question.'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {candidate.finalRecommendation && (
        <div className="rounded-[1.5rem] border p-5" style={{ borderColor: 'rgba(var(--primary-rgb),0.22)', background: 'rgba(var(--primary-rgb),0.08)' }}>
          <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">
            <Target className="h-3.5 w-3.5" />
            Recruiter Recommendation
          </p>
          <p className="text-sm leading-7 text-foreground">{candidate.finalRecommendation}</p>
        </div>
      )}

      {(hasProctoring || hasTranscript) && <ProctoringReview candidate={candidate} />}
    </div>
  );
}

export function HrCandidates() {
  const navigate = useNavigate();
  const { jobId } = useParams();
  const [job, setJob] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [deletingId, setDeletingId] = useState(null);
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [inviteSubmitting, setInviteSubmitting] = useState(false);
  const [inviteForm, setInviteForm] = useState({ scheduledAt: '', location: '' });

  useEffect(() => { loadData(); }, [jobId]);

  useEffect(() => {
    const hasPendingInterviewWork = candidates.some((candidate) => (
      candidate.evaluationStatus === 'pending' ||
      ((candidate.interviewTranscript?.length || 0) > 0 && candidate.interviewScore === null)
    ));

    if (!jobId || !hasPendingInterviewWork) {
      return undefined;
    }

    const intervalId = window.setInterval(async () => {
      if (document.hidden) {
        return;
      }

      try {
        const refreshedCandidates = await api.getCandidatesByJob(jobId);
        setCandidates(refreshedCandidates);
      } catch (error) {
        console.error('Background candidate refresh failed:', error);
      }
    }, 8000);

    return () => window.clearInterval(intervalId);
  }, [jobId, candidates]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [jobData, candidatesData] = await Promise.all([
        api.getJobById(jobId),
        api.getCandidatesByJob(jobId)
      ]);
      setJob(jobData);
      setCandidates(candidatesData);
    } catch (e) {
      console.error('Failed to load candidates:', e);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const openInviteDialog = (candidate) => {
    setSelectedCandidate(candidate);
    setInviteForm({
      scheduledAt: toDateTimeLocalValue(candidate.technicalInterviewInvitation?.scheduledAt),
      location: candidate.technicalInterviewInvitation?.location || ''
    });
    setInviteDialogOpen(true);
  };

  const closeInviteDialog = () => {
    setInviteDialogOpen(false);
    setSelectedCandidate(null);
    setInviteForm({ scheduledAt: '', location: '' });
  };

  const handleInviteSubmit = async (event) => {
    event.preventDefault();

    if (!selectedCandidate) return;

    setInviteSubmitting(true);
    try {
      const payload = {
        scheduledAt: new Date(inviteForm.scheduledAt).toISOString(),
        location: inviteForm.location.trim()
      };

      const response = await api.sendTechnicalInterviewInvite(jobId, selectedCandidate._id, payload);
      setCandidates((prev) => prev.map((candidate) => (
        candidate._id === response.candidate._id ? response.candidate : candidate
      )));
      toast.success('Technical round invitation sent successfully.');
      closeInviteDialog();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Unable to send the technical round invitation.');
    } finally {
      setInviteSubmitting(false);
    }
  };

  const handleDelete = async (candidate) => {
    const confirmed = window.confirm(
      `Delete candidate "${candidate.name}"?\n\nThis will permanently remove all their interview data and cannot be undone.`
    );
    if (!confirmed) return;

    setDeletingId(candidate._id);
    try {
      await api.deleteCandidate(jobId, candidate._id);
      setCandidates((prev) => prev.filter((c) => c._id !== candidate._id));
      setExpandedIds((prev) => {
        const next = new Set(prev);
        next.delete(candidate._id);
        return next;
      });
    } catch (err) {
      console.error('Delete failed:', err);
      alert(err.response?.data?.error || 'Unable to delete the candidate. Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return <LoadingSpinner message="Loading candidate pipeline..." />;
  }

  if (!job) {
    return (
      <LoadingSpinner message="Unable to load the selected job pipeline." />
    );
  }

  const avgAts = candidates.length
    ? Math.round(candidates.reduce((s, c) => s + (c.atsMatchScore || 0), 0) / candidates.length)
    : 0;
  const interviewedCount = candidates.filter((c) => c.interviewScore !== null).length;

  const overviewStats = [
    { label: 'Total Applicants', value: candidates.length, icon: Users, color: 'var(--primary)', tone: 'rgba(var(--primary-rgb),0.12)' },
    { label: 'Interviewed', value: interviewedCount, icon: CheckCircle2, color: 'var(--success)', tone: 'rgba(var(--success-rgb),0.12)' },
    { label: 'Avg ATS Score', value: `${avgAts}%`, icon: BarChart2, color: 'var(--info)', tone: 'rgba(var(--info-rgb),0.12)' }
  ];

  return (
    <>
      <HrLayout
        active="jobs"
        eyebrow="Candidate Review"
        title={job.title}
        subtitle={`Review applicants for ${job.companyName || 'this role'} by ATS match score, interview evaluation, transcript, and proctoring evidence.`}
        actions={(
          <button
            type="button"
            onClick={() => navigate('/hr/jobs')}
            className="control-button control-button-ghost px-4 py-2.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Jobs
          </button>
        )}
      >
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            {overviewStats.map(({ label, value, icon: Icon, color, tone }) => (
              <div key={label} className="surface-panel rounded-[1.7rem] p-5">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</span>
                  <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl" style={{ background: tone }}>
                    <Icon className="h-4 w-4" style={{ color }} />
                  </div>
                </div>
                <p className="metric-value text-foreground">{value}</p>
              </div>
            ))}
          </div>

          <div className="surface-panel overflow-hidden rounded-[1.9rem]">
            <div className="flex flex-col gap-2 border-b border-border/70 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="section-kicker mb-3">Applicant Ranking</span>
                <h2 className="text-2xl font-bold text-foreground">Candidate pipeline for this role</h2>
              </div>
              <p className="text-sm text-muted-foreground">
                Sorted by ATS match score. Expand any applicant to inspect transcript, Gemini evaluation, and proctoring evidence.
              </p>
            </div>

            {candidates.length === 0 ? (
              <div className="empty-state m-6 flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
                <Users className="mb-4 h-10 w-10 text-muted-foreground" />
                <p className="text-xl font-bold text-foreground">No applications have been submitted yet</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Applicants will appear here as soon as candidates submit resumes for this job.
                </p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {candidates.map((c, i) => {
                const rm = rankMeta[i] || { icon: Users, color: 'var(--muted-foreground)', bg: 'rgba(var(--foreground-rgb),0.06)', border: 'rgba(var(--foreground-rgb),0.08)' };
                const RankIcon = rm.icon;
                const isExpanded = expandedIds.has(c._id);
                const isDeleting = deletingId === c._id;
                const hasInterview = c.interviewScore !== null;
                const hasTranscript = (c.interviewTranscript?.length || 0) > 0;
                const isEvaluationPending = c.evaluationStatus === 'pending' || (hasTranscript && c.interviewScore === null);
                const proctoringMetrics = getProctoringMetrics(c);
                const statusMeta = getStatusBadgeMeta(c.status);
                const hasTechnicalInvite = Boolean(c.technicalInterviewInvitation?.scheduledAt && c.technicalInterviewInvitation?.location);

                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.28 }}
                  >
                    <div
                      className="cursor-pointer px-6 py-5 transition-colors hover:bg-white/[0.025]"
                      onClick={() => toggleExpand(c._id)}
                    >
                      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
                        <div className="flex min-w-0 items-center gap-4">
                          <div className="flex w-8 flex-shrink-0 flex-col items-center">
                            <RankIcon className="mb-1 h-4 w-4" style={{ color: rm.color }} />
                            <span className="text-xs font-semibold text-muted-foreground">#{i + 1}</span>
                          </div>

                          <div
                            className="inline-flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border font-semibold"
                            style={{ background: rm.bg, borderColor: rm.border, color: rm.color }}
                          >
                            {c.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <div className="mb-2 flex flex-wrap items-center gap-2">
                              <span className="text-base font-semibold text-foreground">{c.name}</span>
                              <span
                                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                style={{
                                  background: statusMeta.background,
                                  color: statusMeta.color
                                }}
                              >
                                {c.status}
                              </span>
                              {hasInterview && (
                                <span className="badge-interviewed rounded-full px-2.5 py-1 text-xs font-semibold">
                                  Interview completed
                                </span>
                              )}
                              {isEvaluationPending && (
                                <span
                                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                  style={{
                                    background: 'rgba(var(--warning-rgb),0.12)',
                                    color: 'var(--warning)'
                                  }}
                                >
                                  AI evaluation pending
                                </span>
                              )}
                              {hasInterview && c.interviewScore >= TECHNICAL_ROUND_THRESHOLD && !hasTechnicalInvite && !isEvaluationPending && (
                                <span
                                  className="rounded-full px-2.5 py-1 text-xs font-semibold"
                                  style={{
                                    background: 'rgba(var(--success-rgb),0.12)',
                                    color: 'var(--success)'
                                  }}
                                >
                                  Eligible for technical round
                                </span>
                              )}
                            </div>
                            <p className="truncate text-sm text-muted-foreground">{c.email}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                              Applied {new Date(c.appliedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 xl:justify-end">
                          <ScorePill score={c.atsMatchScore} label="ATS" />
                          {hasInterview && <ScorePill score={c.interviewScore} label="Interview" />}
                          {hasInterview && (
                            <div className="flex flex-wrap justify-end gap-2">
                              {[
                                { label: 'Faces', value: proctoringMetrics.faceDetectionCount, color: 'var(--info)', bg: 'rgba(var(--info-rgb),0.12)', border: 'rgba(var(--info-rgb),0.22)' },
                                { label: 'Warnings', value: proctoringMetrics.warningCount, color: 'var(--warning)', bg: 'rgba(var(--warning-rgb),0.12)', border: 'rgba(var(--warning-rgb),0.22)' },
                                { label: 'Alerts', value: proctoringMetrics.alertCount, color: 'var(--destructive)', bg: 'rgba(239,82,95,0.12)', border: 'rgba(239,82,95,0.22)' }
                              ].map((item) => (
                                <span
                                  key={`${c._id}-${item.label}`}
                                  className="inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold"
                                  style={{ color: item.color, background: item.bg, borderColor: item.border }}
                                >
                                  {item.label}: {item.value}
                                </span>
                              ))}
                            </div>
                          )}

                          <div className="flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
                            {hasInterview && c.interviewScore >= TECHNICAL_ROUND_THRESHOLD && !isEvaluationPending && (
                              <button
                                type="button"
                                onClick={() => openInviteDialog(c)}
                                className="control-button control-button-secondary rounded-2xl px-3.5 py-3 text-sm"
                                title={hasTechnicalInvite ? 'Update technical round invite' : 'Accept for technical round'}
                              >
                                <MailCheck className="h-4 w-4" />
                                {hasTechnicalInvite ? 'Update Invite' : 'Accept Candidate'}
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(c)}
                              disabled={isDeleting}
                              className="control-button justify-center rounded-2xl px-3 py-3 text-sm text-[var(--destructive)] disabled:opacity-40"
                              title="Delete candidate"
                            >
                              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </button>
                            <button
                              onClick={() => toggleExpand(c._id)}
                              className="control-button justify-center rounded-2xl px-3 py-3 text-sm"
                            >
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.24, ease: 'easeInOut' }}
                          style={{ overflow: 'hidden', borderTop: '1px solid var(--border)' }}
                        >
                          <EvaluationPanel
                            candidate={c}
                            job={job}
                            onOpenInviteDialog={openInviteDialog}
                            technicalRoundThreshold={TECHNICAL_ROUND_THRESHOLD}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
                })}
              </div>
            )}
          </div>
        </div>
      </HrLayout>

      <Dialog
        open={inviteDialogOpen}
        onOpenChange={(open) => {
          if (inviteSubmitting) return;
          if (open) {
            setInviteDialogOpen(true);
          } else {
            closeInviteDialog();
          }
        }}
      >
        <DialogContent
          className="max-h-[90vh] max-w-xl overflow-y-auto rounded-[1.8rem] border"
          style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-foreground">
              Schedule Company Technical Round
            </DialogTitle>
            <DialogDescription className="text-sm leading-6 text-muted-foreground">
              Send the next-round technical interview invitation to {selectedCandidate?.name || 'this candidate'} only after confirming the company date, time, and place.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleInviteSubmit} className="mt-3 space-y-5">
            <div className="rounded-[1.4rem] border border-white/8 bg-white/4 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Eligibility Check</p>
              <p className="mt-3 text-sm leading-6 text-foreground">
                HireAI interview score: <span className="font-semibold">{selectedCandidate?.interviewScore ?? 'Not available'}</span>
              </p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Minimum required score for this action: {TECHNICAL_ROUND_THRESHOLD}/100
              </p>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Interview Date and Time
              </label>
              <div className="relative">
                <CalendarDays className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="datetime-local"
                  value={inviteForm.scheduledAt}
                  onChange={(event) => setInviteForm((prev) => ({ ...prev, scheduledAt: event.target.value }))}
                  required
                  className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm transition-all"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Interview Place
              </label>
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={inviteForm.location}
                  onChange={(event) => setInviteForm((prev) => ({ ...prev, location: event.target.value }))}
                  placeholder="Head office, meeting room name, or campus venue"
                  required
                  className="w-full rounded-2xl border py-3 pl-11 pr-4 text-sm transition-all"
                  style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={closeInviteDialog}
                className="control-button control-button-ghost rounded-2xl px-5 py-3 text-sm"
                disabled={inviteSubmitting}
              >
                Cancel
              </button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={inviteSubmitting}
                className="btn-gradient rounded-2xl px-5 py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-60"
              >
                {inviteSubmitting ? 'Sending Invite...' : 'Send Technical Round Invite'}
              </motion.button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
