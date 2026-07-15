import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router';
import { motion } from 'motion/react';
import axios from 'axios';
import {
  AlertCircle,
  Bot,
  Loader2,
  Mic,
  MicOff,
  Send,
  ShieldCheck,
  Sparkles,
  User,
  Video
} from 'lucide-react';
import { BrandMark } from '../../components/BrandMark';
import { ProctoringPanel } from '../../components/interview/ProctoringPanel';
import { useInterviewProctoring } from '../../hooks/useInterviewProctoring';

export function InterviewRoom() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [candidateName, setCandidateName] = useState('');

  const videoRef = useRef(null);
  const [mediaStream, setMediaStream] = useState(null);

  const [chatHistory, setChatHistory] = useState([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  const chatEndRef = useRef(null);

  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef(null);

  const [finalScore, setFinalScore] = useState(null);
  const [scoreFeedback, setScoreFeedback] = useState('');
  const [scoreLoading, setScoreLoading] = useState(false);
  const [questionFeedback, setQuestionFeedback] = useState([]);
  const [strengths, setStrengths] = useState([]);
  const [weaknesses, setWeaknesses] = useState([]);
  const [finalRecommendation, setFinalRecommendation] = useState('');

  const savedTranscript = useRef('');
  const currentTranscript = useRef('');
  const submitInProgress = useRef(false);
  const proctoring = useInterviewProctoring({
    token,
    videoRef,
    enabled: !loading && !error && !isInterviewComplete,
    interviewComplete: isInterviewComplete
  });

  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/interview/verify/${token}`);
        if (response.data.isValid) {
          setCandidateName(response.data.candidateName);
          initWebcam();
          initSpeechRecognition();

          const greeting = `Hello ${response.data.candidateName}. I am your AI interviewer. We will begin with a short introduction and then move into resume-based technical questions. Can you briefly introduce your background?`;
          setChatHistory([{ role: 'assistant', content: greeting }]);

          setTimeout(() => speakText(greeting), 1000);
        } else {
          setError(true);
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    verifyToken();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (window.speechSynthesis) window.speechSynthesis.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isThinking, transcript]);

  useEffect(() => {
    if (isInterviewComplete) {
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    }
  }, [isInterviewComplete, mediaStream]);

  useEffect(() => {
    if (!isInterviewComplete) return;
    setScoreLoading(true);

    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`http://localhost:8000/api/interview/score/${token}`);
        if (res.data.status === 'complete') {
          setFinalScore(res.data.score);
          setScoreFeedback(res.data.overallSummary || res.data.feedback || '');
          setQuestionFeedback(res.data.questionFeedback || []);
          setStrengths(res.data.strengths || []);
          setWeaknesses(res.data.weaknesses || []);
          setFinalRecommendation(res.data.finalRecommendation || '');
          setScoreLoading(false);
          clearInterval(interval);
        }
      } catch (err) {
        console.error('Score polling error:', err);
      }
    }, 3000);

    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isInterviewComplete]);

  const initWebcam = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        setMediaStream(stream);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      }
    } catch (err) {
      console.error('Failed to access webcam:', err);
    }
  };

  const initSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn('Speech recognition is not supported in this browser.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      if (submitInProgress.current) return;
      let current = '';
      for (let i = 0; i < event.results.length; ++i) {
        current += event.results[i][0].transcript;
      }
      currentTranscript.current = current;
      setTranscript((savedTranscript.current + ' ' + current).trim());
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      if (!submitInProgress.current) {
        if (currentTranscript.current) {
          savedTranscript.current = (savedTranscript.current + ' ' + currentTranscript.current).trim();
          currentTranscript.current = '';
        }
      }
      setIsListening(false);
    };

    recognitionRef.current = recognition;
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      try {
        submitInProgress.current = false;
        recognitionRef.current?.start();
        setIsListening(true);
        window.speechSynthesis.cancel();
      } catch (e) {
        console.error('Failed to start recognition', e);
      }
    }
  };

  const submitAnswer = async () => {
    const candidateMessage = (savedTranscript.current + ' ' + currentTranscript.current).trim();
    if (!candidateMessage) return;

    submitInProgress.current = true;

    if (isListening) {
      recognitionRef.current?.abort();
      setIsListening(false);
    }

    savedTranscript.current = '';
    currentTranscript.current = '';
    setTranscript('');

    const updatedHistory = [...chatHistory, { role: 'user', content: candidateMessage }];
    setChatHistory(updatedHistory);
    setIsThinking(true);

    try {
      const response = await axios.post('http://localhost:8000/api/interview/chat', {
        candidateMessage,
        chatHistory: chatHistory,
        token: token
      });

      const aiResponseText = response.data.nextQuestion;

      setChatHistory((prev) => [...prev, { role: 'assistant', content: aiResponseText }]);
      speakText(aiResponseText);

      if (response.data.isInterviewComplete) {
        setIsInterviewComplete(true);
      }
    } catch (err) {
      console.error('Gemini API Error', err);
      setChatHistory((prev) => [...prev, { role: 'assistant', content: 'I could not reach the interview service just now. Please submit your answer again.' }]);
    } finally {
      setIsThinking(false);
    }
  };

  const speakText = (text) => {
    if (!window.speechSynthesis) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);

    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find((v) => v.lang.includes('en-') && (v.name.includes('Google') || v.name.includes('Samantha')));
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.rate = 1.05;

    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="page-shell bg-hero flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel rounded-[2rem] px-10 py-10 text-center">
          <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-[var(--primary)]" />
          <h2 className="text-xl font-semibold text-foreground">Verifying secure interview access...</h2>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-shell bg-hero flex min-h-screen items-center justify-center px-4">
        <div className="surface-panel w-full max-w-xl rounded-[2rem] p-10 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-[rgba(239,82,95,0.12)]">
            <AlertCircle className="h-10 w-10 text-[var(--destructive)]" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Invalid or expired link</h1>
          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            This interview link is invalid, expired, or has already been used. If you believe this is a mistake, please contact the recruiter who sent it.
          </p>
        </div>
      </div>
    );
  }

  if (isInterviewComplete) {
    return (
      <div className="page-shell bg-hero min-h-screen px-4 py-6 sm:px-6 lg:px-0">
        <div className="page-container">
          <div className="topbar-surface mb-6 flex flex-wrap items-center justify-between gap-4 rounded-[1.7rem] px-5 py-4 sm:px-6">
            <BrandMark subtitle="AI Interview Report" />
            <div className="section-kicker">
              <ShieldCheck className="h-3.5 w-3.5" />
              Interview Session Closed
            </div>
          </div>

          <div className="surface-panel mx-auto max-w-5xl rounded-[2rem] p-8 sm:p-10">
            <div className="mx-auto max-w-4xl space-y-6">
              <div className="text-center">
                <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-full border border-[rgba(var(--primary-rgb),0.22)] bg-[rgba(var(--primary-rgb),0.1)]">
                  <Bot className="h-11 w-11 text-[var(--primary)]" />
                </div>
                <span className="section-kicker mb-4">
                  <Sparkles className="h-3.5 w-3.5" />
                  Interview Complete
                </span>
                <h2 className="text-4xl font-bold text-foreground">Assessment report for {candidateName}</h2>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">
                  Your responses have been saved. The final Gemini evaluation is shown below as soon as processing finishes.
                </p>
              </div>

              {scoreLoading ? (
                <div className="surface-panel-soft rounded-[1.8rem] py-12 text-center">
                  <Loader2 className="mx-auto mb-4 h-8 w-8 animate-spin text-[var(--primary)]" />
                  <p className="text-sm text-muted-foreground">Your transcript has been submitted. Gemini is preparing the final interview evaluation...</p>
                </div>
              ) : finalScore !== null && (
                <>
                  <div className="grid gap-4 lg:grid-cols-[0.62fr_0.38fr]">
                    <div className="surface-panel-soft rounded-[1.8rem] p-6 sm:p-7">
                      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Overall Interview Score</p>
                      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
                        <div>
                          <span
                            className="metric-value"
                            style={{ color: finalScore >= 75 ? 'var(--success)' : finalScore >= 50 ? 'var(--warning)' : 'var(--destructive)' }}
                          >
                            {finalScore}
                          </span>
                          <span className="ml-1 text-xl font-semibold text-muted-foreground">/100</span>
                        </div>

                        <div
                          className="rounded-full border px-4 py-2 text-sm font-semibold"
                          style={{
                            color: finalScore >= 75 ? 'var(--success)' : finalScore >= 50 ? 'var(--warning)' : 'var(--destructive)',
                            borderColor: finalScore >= 75 ? 'rgba(var(--success-rgb),0.22)' : finalScore >= 50 ? 'rgba(var(--warning-rgb),0.24)' : 'rgba(239,82,95,0.22)',
                            background: finalScore >= 75 ? 'rgba(var(--success-rgb),0.1)' : finalScore >= 50 ? 'rgba(var(--warning-rgb),0.1)' : 'rgba(239,82,95,0.1)'
                          }}
                        >
                          {finalScore >= 75 ? 'Strong performance' : finalScore >= 50 ? 'Moderate performance' : 'Needs improvement'}
                        </div>
                      </div>

                      <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/8">
                        <div
                          className="h-full rounded-full transition-all duration-1000"
                          style={{
                            width: `${finalScore}%`,
                            background: finalScore >= 75 ? 'var(--success)' : finalScore >= 50 ? 'var(--warning)' : 'var(--destructive)'
                          }}
                        />
                      </div>

                      {scoreFeedback && (
                        <p className="mt-5 text-sm leading-7 text-foreground">{scoreFeedback}</p>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <div className="metric-tile rounded-[1.5rem] p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Candidate</p>
                        <p className="mt-3 text-lg font-semibold text-foreground">{candidateName}</p>
                      </div>
                      <div className="metric-tile rounded-[1.5rem] p-5">
                        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Evaluation Status</p>
                        <p className="mt-3 text-lg font-semibold text-foreground">AI evaluation ready</p>
                      </div>
                    </div>
                  </div>

                  {(strengths.length > 0 || weaknesses.length > 0) && (
                    <div className="grid gap-4 md:grid-cols-2">
                      {strengths.length > 0 && (
                        <div className="rounded-[1.6rem] border p-6" style={{ borderColor: 'rgba(var(--success-rgb),0.22)', background: 'rgba(var(--success-rgb),0.08)' }}>
                          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--success)]">Strengths</p>
                          <ul className="space-y-2">
                            {strengths.map((s, i) => (
                              <li key={i} className="text-sm leading-7 text-foreground">• {s}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {weaknesses.length > 0 && (
                        <div className="rounded-[1.6rem] border p-6" style={{ borderColor: 'rgba(var(--warning-rgb),0.22)', background: 'rgba(var(--warning-rgb),0.08)' }}>
                          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--warning)]">Areas to Improve</p>
                          <ul className="space-y-2">
                            {weaknesses.map((w, i) => (
                              <li key={i} className="text-sm leading-7 text-foreground">• {w}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {questionFeedback.length > 0 && (
                    <div className="surface-panel-soft rounded-[1.8rem] p-6 sm:p-7">
                      <p className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Answer-by-answer evaluation</p>
                      <div className="space-y-4">
                        {questionFeedback.map((item, idx) => (
                          <div key={idx} className="rounded-[1.4rem] border border-white/8 bg-white/4 p-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Q{idx + 1}</p>
                            <p className="mt-2 text-sm font-semibold text-foreground">{item.question}</p>
                            <p className="mt-3 text-sm italic leading-7 text-muted-foreground">&ldquo;{item.candidateAnswer}&rdquo;</p>
                            <p className="mt-4 text-sm leading-7 text-foreground">{item.feedback}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {finalRecommendation && (
                    <div className="rounded-[1.8rem] border p-6 sm:p-7" style={{ borderColor: 'rgba(var(--primary-rgb),0.24)', background: 'rgba(var(--primary-rgb),0.08)' }}>
                      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--primary)]">Hiring Recommendation</p>
                      <p className="text-sm leading-7 text-foreground">{finalRecommendation}</p>
                    </div>
                  )}
                </>
              )}

              <div className="flex justify-center pt-2">
                <button
                  onClick={() => { window.location.href = '/'; }}
                  className="btn-gradient rounded-2xl px-8 py-3.5 text-sm font-semibold"
                >
                  Back to Open Roles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell bg-hero h-screen overflow-hidden px-4 pb-6 pt-4 sm:px-6 lg:px-0">
      <div className="page-container flex h-full flex-col">
        <header className="topbar-surface mb-5 flex flex-wrap items-center justify-between gap-4 rounded-[1.7rem] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-4">
            <BrandMark subtitle="AI Interview Session" />
            <div>
              <p className="text-sm font-semibold text-foreground">AI Interview in Progress</p>
              <p className="text-sm text-muted-foreground">{candidateName}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="section-kicker">
              <ShieldCheck className="h-3.5 w-3.5" />
              Secure Session
            </span>
            <span className="control-button control-button-ghost rounded-2xl px-3 py-2 text-xs">
              Live interview in progress
            </span>
            <span
              className="rounded-2xl border px-3 py-2 text-xs font-semibold"
              style={{
                color: proctoring.modelStatus === 'active' ? 'var(--success)' : proctoring.modelStatus === 'error' ? 'var(--destructive)' : 'var(--warning)',
                borderColor: proctoring.modelStatus === 'active' ? 'rgba(var(--success-rgb),0.24)' : proctoring.modelStatus === 'error' ? 'rgba(239,82,95,0.22)' : 'rgba(var(--warning-rgb),0.24)',
                background: proctoring.modelStatus === 'active' ? 'rgba(var(--success-rgb),0.12)' : proctoring.modelStatus === 'error' ? 'rgba(239,82,95,0.12)' : 'rgba(var(--warning-rgb),0.12)'
              }}
            >
              {proctoring.modelStatus === 'active' ? 'Proctoring active' : proctoring.modelStatus === 'error' ? 'Proctoring degraded' : 'Proctoring loading'}
            </span>
          </div>
        </header>

        <div className="grid min-h-0 flex-1 gap-5 xl:grid-cols-[1.02fr_0.98fr]">
          <div className="surface-panel relative min-h-[340px] overflow-hidden rounded-[2rem] xl:min-h-0">
            <div className="absolute left-5 top-5 z-10 flex items-center gap-2 rounded-full border border-white/10 bg-black/35 px-3 py-1.5 backdrop-blur-md">
              <span className={`h-2.5 w-2.5 rounded-full ${mediaStream ? 'animate-pulse bg-[var(--success)]' : 'bg-[var(--destructive)]'}`} />
              <span className="text-xs font-semibold uppercase tracking-[0.18em] text-white/90">Live Camera</span>
            </div>

            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className="h-full w-full bg-black object-cover"
            />

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[rgba(4,8,16,0.95)] via-[rgba(4,8,16,0.72)] to-transparent p-5 sm:p-6">
              <div
                className={`mb-5 rounded-[1.5rem] border px-5 py-4 backdrop-blur-md transition-all duration-300 ${
                  transcript ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'
                }`}
                style={{
                  background: isListening ? 'rgba(var(--primary-rgb),0.16)' : 'rgba(var(--foreground-rgb),0.06)',
                  borderColor: isListening ? 'rgba(var(--primary-rgb),0.26)' : 'rgba(var(--foreground-rgb),0.08)'
                }}
              >
                <p className="max-h-32 overflow-y-auto text-sm leading-7 text-white/90">
                  {transcript || 'Turn on the mic and start speaking when you are ready.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="rounded-[1.3rem] border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-white/50">Response status</p>
                  <p className="mt-1 text-sm font-semibold text-white">
                    {isListening ? 'Listening for your answer' : 'Turn on the mic, speak, then submit your response'}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleListening}
                    disabled={isThinking}
                    className={`flex h-14 w-14 items-center justify-center rounded-full transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-60 ${
                      isListening
                        ? 'scale-105 bg-[var(--destructive)] shadow-[0_0_30px_rgba(239,82,95,0.42)]'
                        : 'bg-white/12 hover:bg-white/18'
                    }`}
                  >
                    {isListening ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
                  </button>

                  {isListening && (
                    <button
                      onClick={submitAnswer}
                      className="btn-gradient flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
                    >
                      <Send className="h-4 w-4" />
                      Submit Answer
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid h-full min-h-0 gap-5 xl:grid-rows-[minmax(280px,1.08fr)_minmax(240px,0.92fr)]">
            <div className="interview-transcript flex min-h-[280px] flex-col overflow-hidden rounded-[2rem]">
              <div className="flex items-center justify-between gap-4 border-b border-border/70 px-6 py-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Conversation Transcript</p>
                  <p className="mt-1 text-sm text-muted-foreground">Live transcript of interviewer prompts and your submitted answers.</p>
                </div>
                <div className="flex items-center gap-2 rounded-full border border-white/8 bg-white/4 px-3 py-1.5">
                  <Video className="h-3.5 w-3.5 text-[var(--success)]" />
                  <span className="text-xs font-semibold text-foreground">Secure interview live</span>
                </div>
              </div>

              <div className="flex-1 space-y-5 overflow-y-auto px-6 py-6">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`flex max-w-[88%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                      <div
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-2xl ${
                          msg.role === 'user'
                            ? 'bg-[rgba(var(--info-rgb),0.16)] text-[var(--info)]'
                            : 'bg-[rgba(var(--primary-rgb),0.14)] text-[var(--primary)]'
                        }`}
                      >
                        {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                      </div>

                      <div
                        className="rounded-[1.45rem] border px-4 py-3.5 text-sm leading-7"
                        style={msg.role === 'user'
                          ? {
                              background: 'linear-gradient(135deg, rgba(var(--primary-rgb),1) 0%, rgba(var(--info-rgb),0.88) 100%)',
                              color: '#fff',
                              borderColor: 'rgba(var(--primary-rgb),0.24)',
                              borderRadius: '1.4rem 1.4rem 0.45rem 1.4rem'
                            }
                          : {
                              background: 'rgba(var(--card-rgb),0.7)',
                              color: 'var(--foreground)',
                              borderColor: 'var(--panel-border)',
                              borderRadius: '1.4rem 1.4rem 1.4rem 0.45rem'
                            }}
                      >
                        {msg.content}
                      </div>
                    </div>
                  </div>
                ))}

                {isThinking && (
                  <div className="flex justify-start">
                    <div className="flex max-w-[88%] gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[rgba(var(--primary-rgb),0.14)] text-[var(--primary)]">
                        <Bot className="h-4 w-4" />
                      </div>
                      <div className="rounded-[1.4rem] border border-border px-4 py-3.5">
                        <div className="flex items-center gap-3">
                          <Loader2 className="h-4 w-4 animate-spin text-[var(--primary)]" />
                          <p className="text-sm text-muted-foreground">Preparing next question...</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={chatEndRef} className="h-3" />
              </div>
            </div>

            <div className="min-h-[240px] overflow-hidden">
              <ProctoringPanel
                modelStatus={proctoring.modelStatus}
                analysis={proctoring.analysis}
                recentEvents={proctoring.recentEvents}
                counts={proctoring.counts}
                queueStats={proctoring.queueStats}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
