import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import { motion, AnimatePresence } from 'motion/react';
import Webcam from 'react-webcam';
import * as faceDetection from '@tensorflow-models/face-detection';
import '@tensorflow/tfjs';
import { api } from '../../services/api';
import { Progress } from '../../components/ui/progress';
import {
  Video, VideoOff, Send, AlertTriangle, Clock,
  CheckCircle2, XCircle, Eye, Users, Focus, Mic, Shield
} from 'lucide-react';

export function InterviewRoom() {
  const { token } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const chatEndRef = useRef(null);
  const detectionIntervalRef = useRef(null);

  const [verifying, setVerifying] = useState(true);
  const [isValid, setIsValid] = useState(false);
  const [candidateInfo, setCandidateInfo] = useState(null);

  const [chatHistory, setChatHistory] = useState([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const [finalResult, setFinalResult] = useState(null);

  const [webcamEnabled, setWebcamEnabled] = useState(false);
  const [detector, setDetector] = useState(null);
  const [strikes, setStrikes] = useState(0);
  const [currentViolation, setCurrentViolation] = useState(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  const [timeRemaining, setTimeRemaining] = useState(60);
  const [timerActive, setTimerActive] = useState(false);
  const [waitingForAI, setWaitingForAI] = useState(false);
  const [questionCount, setQuestionCount] = useState(0);

  useEffect(() => { verifyToken(); }, [token]);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatHistory]);

  const verifyToken = async () => {
    try {
      const res = await api.verifyMagicToken(token);
      if (res.isValid) {
        setIsValid(true);
        setCandidateInfo(res);
        setChatHistory([{ role: 'assistant', content: "Hello. I'm your AI interviewer. We'll begin with a short introduction and then move into technical questions relevant to this role. Can you tell me about your background and experience relevant to this position?" }]);
        setQuestionCount(1);
      }
    } catch (e) { console.error(e); }
    finally { setVerifying(false); }
  };

  useEffect(() => {
    if (!webcamEnabled) return;
    (async () => {
      try {
        const fd = await faceDetection.createDetector(
          faceDetection.SupportedModels.MediaPipeFaceDetector, { runtime: 'tfjs' }
        );
        setDetector(fd);
      } catch (e) { console.error(e); }
    })();
  }, [webcamEnabled]);

  useEffect(() => {
    if (detector && webcamEnabled && webcamRef.current && !isInterviewComplete) {
      detectionIntervalRef.current = setInterval(async () => {
        if (webcamRef.current?.video?.readyState === 4) {
          const faces = await detector.estimateFaces(webcamRef.current.video);
          if (faces.length === 0) handleViolation('no_face', 'No face detected in camera view');
          else if (faces.length > 1) handleViolation('multiple_faces', 'Multiple people detected');
          else setCurrentViolation(null);
        }
      }, 1000);
      return () => clearInterval(detectionIntervalRef.current);
    }
  }, [detector, webcamEnabled, isInterviewComplete]);

  useEffect(() => {
    const h = () => {
      if (document.hidden && !isInterviewComplete) {
        setTabSwitchCount(c => c + 1);
        handleViolation('tab_switch', 'You switched tabs or minimized the window');
      }
    };
    document.addEventListener('visibilitychange', h);
    return () => document.removeEventListener('visibilitychange', h);
  }, [isInterviewComplete]);

  useEffect(() => {
    if (!timerActive || timeRemaining <= 0) return;
    const t = setTimeout(() => setTimeRemaining(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [timerActive, timeRemaining]);

  const handleViolation = (type, message) => {
    setStrikes(s => {
      const ns = s + 1;
      if (ns >= 3) terminateInterview();
      return ns;
    });
    setCurrentViolation({ type, message });
  };

  const terminateInterview = async () => {
    setIsInterviewComplete(true);
    await api.submitInterviewResult(token, 0, true);
    setFinalResult({ malpracticeDetected: true, finalScore: 0, message: 'Interview terminated due to multiple policy violations' });
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim() || waitingForAI) return;
    const msg = currentMessage.trim();
    setCurrentMessage('');
    setTimerActive(false);
    const newHistory = [...chatHistory, { role: 'user', content: msg }];
    setChatHistory(newHistory);
    setWaitingForAI(true);
    try {
      const res = await api.sendChatMessage(token, msg, newHistory);
      if (res.isInterviewComplete) {
        setIsInterviewComplete(true);
        setFinalResult({ finalScore: res.finalScore, strengths: res.strengths, weaknesses: res.weaknesses, message: res.nextQuestion });
        await api.submitInterviewResult(token, res.finalScore, false);
      } else {
        setChatHistory([...newHistory, { role: 'assistant', content: res.nextQuestion }]);
        setQuestionCount(q => q + 1);
        setTimeRemaining(60);
        setTimerActive(true);
      }
    } catch (e) { console.error(e); }
    finally { setWaitingForAI(false); }
  };

  /* ── Loading / invalid states ── */
  if (verifying) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--background)' }}>
      <div className="text-center">
        <div className="inline-block w-10 h-10 rounded-full border-2 animate-spin"
          style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
        <p className="mt-4 text-sm" style={{ color: 'var(--muted-foreground)' }}>Verifying secure interview access...</p>
      </div>
    </div>
  );

  if (!isValid) return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
      <div className="max-w-md w-full text-center p-8 rounded-2xl border"
        style={{ background: 'var(--card)', borderColor: 'rgba(239,70,85,0.3)' }}>
        <XCircle className="h-14 w-14 mx-auto mb-4" style={{ color: '#f87171' }} />
        <h2 className="text-xl font-bold mb-2" style={{ color: '#f87171' }}>Invalid Interview Link</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>
          This interview link is invalid, expired, or has already been used.
        </p>
        <button onClick={() => navigate('/jobs')}
          className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white btn-gradient">
          Back to Job Board
        </button>
      </div>
    </div>
  );

  /* ── Completed state ── */
  if (isInterviewComplete && finalResult) {
    const ok = !finalResult.malpracticeDetected;
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--background)' }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full rounded-2xl border p-8"
          style={{ background: 'var(--card)', borderColor: ok ? 'rgba(52,211,153,0.3)' : 'rgba(239,70,85,0.3)' }}>
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4"
              style={{ background: ok ? 'rgba(52,211,153,0.1)' : 'rgba(239,70,85,0.1)' }}>
              {ok ? <CheckCircle2 className="h-10 w-10" style={{ color: '#34d399' }} />
                  : <XCircle className="h-10 w-10" style={{ color: '#f87171' }} />}
            </div>
            <h2 className="text-2xl font-bold mb-2" style={{ color: ok ? '#34d399' : '#f87171' }}>
              {ok ? 'Interview Complete' : 'Interview Terminated'}
            </h2>
            {ok && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-bold"
                style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                Score: {finalResult.finalScore}%
              </div>
            )}
          </div>

          <div className="p-4 rounded-xl mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{finalResult.message}</p>
          </div>

          {ok && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {finalResult.strengths && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#34d399' }}>✅ Strengths</p>
                  <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'var(--muted-foreground)' }}>
                    {finalResult.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {finalResult.weaknesses && (
                <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
                  <p className="text-xs font-semibold mb-2" style={{ color: '#fbbf24' }}>⚠️ To Improve</p>
                  <ul className="text-sm space-y-1 list-disc list-inside" style={{ color: 'var(--muted-foreground)' }}>
                    {finalResult.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}

          <p className="text-center text-sm mb-4" style={{ color: 'var(--muted-foreground)' }}>
            Recruiters will review your results and contact you using the email provided in your application.
          </p>
          <div className="text-center">
            <button onClick={() => navigate('/jobs')}
              className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white btn-gradient">
              Back to Job Board
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  /* ── Main interview room ── */
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Top bar */}
      <header className="flex-shrink-0 px-6 py-3 border-b flex items-center justify-between"
        style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>
        <div>
          <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>
            AI Interview Session
          </p>
          <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {candidateInfo?.candidateName} · {candidateInfo?.jobTitle}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: strikes > 0 ? 'rgba(239,70,85,0.12)' : 'rgba(52,211,153,0.1)', color: strikes > 0 ? '#f87171' : '#34d399', border: `1px solid ${strikes > 0 ? 'rgba(239,70,85,0.3)' : 'rgba(52,211,153,0.2)'}` }}>
            <Shield className="h-3 w-3" />
            Strikes: {strikes}/3
          </span>
          <span className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{ background: 'rgba(124,111,239,0.1)', color: '#a78bfa', border: '1px solid rgba(124,111,239,0.25)' }}>
            Question {questionCount}
          </span>
        </div>
      </header>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel: video + proctoring */}
        <aside className="w-72 flex-shrink-0 flex flex-col border-r p-4 gap-4 overflow-y-auto"
          style={{ background: 'var(--background)', borderColor: 'var(--border)' }}>

          {/* Webcam */}
          <div className="rounded-2xl overflow-hidden relative border aspect-video"
            style={{ background: '#000', borderColor: 'var(--border)' }}>
            {webcamEnabled
              ? <Webcam ref={webcamRef} audio={false} screenshotFormat="image/jpeg"
                  className="w-full h-full object-cover" mirrored />
              : <div className="absolute inset-0 flex items-center justify-center">
                  <VideoOff className="h-8 w-8" style={{ color: 'var(--muted-foreground)' }} />
                </div>}
            <AnimatePresence>
              {currentViolation && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="absolute inset-0 flex flex-col items-center justify-center p-4"
                  style={{ background: 'rgba(239,70,85,0.85)' }}>
                  <AlertTriangle className="h-8 w-8 text-white animate-pulse mb-2" />
                  <p className="text-white text-xs font-bold text-center">Warning {strikes}/3</p>
                  <p className="text-white/80 text-xs text-center mt-1">{currentViolation.message}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <button
            onClick={() => setWebcamEnabled(v => !v)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all border"
            style={webcamEnabled
              ? { background: 'rgba(239,70,85,0.1)', color: '#f87171', borderColor: 'rgba(239,70,85,0.3)' }
              : { background: 'rgba(124,111,239,0.1)', color: '#a78bfa', borderColor: 'rgba(124,111,239,0.3)' }}
          >
            {webcamEnabled ? <><VideoOff className="h-4 w-4" /> Disable Camera</>
                           : <><Video className="h-4 w-4" /> Enable Camera</>}
          </button>

          {/* Rules */}
          <div className="rounded-xl border p-3 space-y-2" style={{ background: 'var(--muted)', borderColor: 'var(--border)' }}>
            <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)' }}>Interview Rules</p>
            {[
              { Icon: Eye,    text: 'Keep face visible' },
              { Icon: Users,  text: 'No other people' },
              { Icon: Focus,  text: 'Stay on this tab' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-2 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                <Icon className="h-3.5 w-3.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
                {text}
              </div>
            ))}
          </div>

          {/* Timer */}
          {timerActive && (
            <div className="rounded-xl border p-3" style={{ background: 'rgba(245,158,11,0.06)', borderColor: 'rgba(245,158,11,0.25)' }}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold" style={{ color: '#fbbf24' }}>Time Remaining</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" style={{ color: '#fbbf24' }} />
                  <span className="text-xl font-extrabold" style={{ color: '#fbbf24' }}>{timeRemaining}s</span>
                </div>
              </div>
              <Progress value={(timeRemaining / 60) * 100} className="h-1.5" />
            </div>
          )}
        </aside>

        {/* Right panel: chat */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Chat header */}
          <div className="px-6 py-3 border-b flex-shrink-0"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--foreground)' }}>Interview Conversation</p>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Answer naturally and submit each response when ready. Paste is disabled.</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
            {chatHistory.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className="max-w-[75%] px-5 py-3.5 rounded-2xl text-sm leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: 'linear-gradient(135deg,#7c6fef,#6055d4)', color: '#fff', borderRadius: '18px 18px 4px 18px' }
                    : { background: 'var(--card)', color: 'var(--foreground)', border: '1px solid var(--border)', borderRadius: '18px 18px 18px 4px' }}
                >
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {waitingForAI && (
              <div className="flex justify-start">
                <div className="px-5 py-3.5 rounded-2xl"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      {[0,1,2].map(i => (
                        <motion.div key={i} className="w-2 h-2 rounded-full"
                          style={{ background: 'var(--primary)' }}
                          animate={{ y: [0, -6, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay: i * 0.15 }} />
                      ))}
                    </div>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Preparing next question...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input row */}
          <div className="px-6 py-4 border-t flex-shrink-0 flex gap-3"
            style={{ borderColor: 'var(--border)', background: 'var(--background)' }}>
            <input
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onPaste={(e) => { e.preventDefault(); }}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); } }}
              placeholder="Type your response here... (paste disabled)"
              disabled={waitingForAI || isInterviewComplete}
              className="flex-1 px-4 py-3 rounded-xl border text-sm transition-all disabled:opacity-50"
              style={{ background: 'var(--input-background)', borderColor: 'var(--border)', color: 'var(--foreground)' }}
            />
            <motion.button
              onClick={handleSendMessage}
              disabled={!currentMessage.trim() || waitingForAI || isInterviewComplete}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white btn-gradient disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
            >
              <Send className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
}
