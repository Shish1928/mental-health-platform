import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Mic, MicOff, Volume2, VolumeX, Play, Square, AlertTriangle, Check } from 'lucide-react';

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [language, setLanguage] = useState('en');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [microphonePermission, setMicrophonePermission] = useState<'granted' | 'denied' | 'prompt' | 'checking'>('checking');
  const [hasCheckedPermissions, setHasCheckedPermissions] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    checkMicrophonePermissions();
  }, []);

  const checkMicrophonePermissions = async () => {
    try {
      // Check if browser supports navigator.permissions
      if ('permissions' in navigator) {
        const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        setMicrophonePermission(permission.state as 'granted' | 'denied' | 'prompt');
        
        // Listen for permission changes
        permission.onchange = () => {
          setMicrophonePermission(permission.state as 'granted' | 'denied' | 'prompt');
        };
      } else {
        // Fallback for browsers that don't support permissions API
        setMicrophonePermission('prompt');
      }
      setHasCheckedPermissions(true);
    } catch (error) {
      console.error('Error checking microphone permissions:', error);
      setMicrophonePermission('prompt');
      setHasCheckedPermissions(true);
    }
  };

  const requestMicrophonePermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Permission granted, stop the stream immediately
      stream.getTracks().forEach(track => track.stop());
      setMicrophonePermission('granted');
      
      toast({
        title: 'Microphone access granted',
        description: 'You can now use the voice assistant.',
      });
    } catch (error) {
      console.error('Microphone permission denied:', error);
      setMicrophonePermission('denied');
      
      toast({
        title: 'Microphone access denied',
        description: 'Please enable microphone access in your browser settings to use the voice assistant.',
        variant: 'destructive',
      });
    }
  };

  const startRecording = async () => {
    if (microphonePermission !== 'granted') {
      await requestMicrophonePermission();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        processAudio(audioBlob);
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: 'Recording error',
          description: 'There was an error with the recording. Please try again.',
          variant: 'destructive',
        });
        setStatus('idle');
        setIsRecording(false);
      };

      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setStatus('listening');
      
      toast({
        title: 'Recording started',
        description: 'Speak now. Click stop when you\'re finished.',
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      
      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          setMicrophonePermission('denied');
          toast({
            title: 'Microphone access denied',
            description: 'Please allow microphone access and try again.',
            variant: 'destructive',
          });
        } else if (error.name === 'NotFoundError') {
          toast({
            title: 'No microphone found',
            description: 'Please connect a microphone and try again.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Recording error',
            description: 'Failed to start recording. Please check your microphone.',
            variant: 'destructive',
          });
        }
      }
      
      setStatus('idle');
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setStatus('processing');
      
      toast({
        title: 'Processing...',
        description: 'Converting your speech to text.',
      });
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      setStatus('processing');
      
      // In a real implementation, this would send audio to speech-to-text service
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const demoTranscripts = [
        "Hello, I've been feeling a bit anxious lately and could use some support.",
        "I'm having trouble sleeping and my mind keeps racing at night.",
        "I feel overwhelmed with my studies and don't know how to manage my stress.",
        "Can you help me with some breathing exercises or relaxation techniques?",
        "I've been feeling isolated and would like someone to talk to."
      ];
      
      const randomTranscript = demoTranscripts[Math.floor(Math.random() * demoTranscripts.length)];
      setTranscript(randomTranscript);
      
      // Simulate AI response generation
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const demoResponses = [
        "I understand that you're feeling anxious, and I want you to know that it's completely normal to feel this way sometimes. Can you tell me more about what's been causing you to feel anxious? Sometimes talking about it can help us understand it better.",
        "I hear that you're having trouble sleeping and your mind is racing. This is a common experience when we're stressed or anxious. Let's try a simple breathing exercise together that might help calm your mind.",
        "Feeling overwhelmed with studies is something many students experience. You're not alone in this. Let's break this down - what specific aspects of your studies are causing you the most stress right now?",
        "Of course! I'd be happy to guide you through some relaxation techniques. Let's start with a simple 4-7-8 breathing exercise. Breathe in for 4 counts, hold for 7, and exhale for 8. This can help activate your body's relaxation response.",
        "I'm here to listen and talk with you. Feeling isolated can be really difficult, especially as a student. Remember that reaching out, like you're doing now, is a brave and important step. What's been going on that's made you feel this way?"
      ];
      
      const randomResponse = demoResponses[Math.floor(Math.random() * demoResponses.length)];
      setResponse(randomResponse);
      
      // Simulate text-to-speech
      if (!isMuted && 'speechSynthesis' in window) {
        setIsPlaying(true);
        setStatus('speaking');
        
        const utterance = new SpeechSynthesisUtterance(randomResponse);
        utterance.lang = language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 0.8;
        
        utterance.onend = () => {
          setIsPlaying(false);
          setStatus('idle');
        };
        
        utterance.onerror = (event) => {
          console.error('Speech synthesis error:', event);
          setIsPlaying(false);
          setStatus('idle');
        };
        
        speechSynthesis.speak(utterance);
      } else {
        setStatus('idle');
      }
      
      toast({
        title: 'Response ready',
        description: 'AI has processed your message and provided a response.',
      });
    } catch (error) {
      console.error('Error processing audio:', error);
      setStatus('idle');
      
      toast({
        title: 'Processing error',
        description: 'Failed to process your audio. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      setStatus('idle');
    }
  };

  const speakResponse = () => {
    if (response && 'speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(response);
      utterance.lang = language === 'hi' ? 'hi-IN' : language === 'es' ? 'es-ES' : 'en-US';
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'es', name: 'Español' },
  ];

  const getStatusColor = () => {
    switch (status) {
      case 'listening': return 'bg-blue-500';
      case 'processing': return 'bg-yellow-500';
      case 'speaking': return 'bg-green-500';
      default: return 'bg-muted';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'listening': return 'Listening...';
      case 'processing': return 'Processing...';
      case 'speaking': return 'Speaking...';
      default: return 'Ready to listen';
    }
  };

  if (!hasCheckedPermissions) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-foreground">Voice Assistant</h1>
          <p className="text-muted-foreground">Checking microphone permissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Voice Assistant</h1>
        <p className="text-muted-foreground">
          Talk naturally with our empathetic AI voice assistant. 
          Express your feelings and get real-time support through voice conversation.
        </p>
      </div>

      {/* Permission Status Alert */}
      {microphonePermission === 'denied' && (
        <Alert className="border-red-500 bg-red-50 dark:bg-red-950/20">
          <AlertTriangle className="h-4 w-4 text-red-500" />
          <AlertDescription className="text-red-700 dark:text-red-300">
            Microphone access is required to use the voice assistant. Please enable microphone permissions in your browser settings and refresh the page.
          </AlertDescription>
        </Alert>
      )}

      {microphonePermission === 'granted' && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-950/20">
          <Check className="h-4 w-4 text-green-500" />
          <AlertDescription className="text-green-700 dark:text-green-300">
            Microphone access granted. You can now use the voice assistant.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Voice Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Voice Controls
              <Badge variant="outline" className={`${getStatusColor()} text-white`}>
                {getStatusText()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <div className="w-32 h-32 mx-auto bg-muted rounded-full flex items-center justify-center">
                <div className={`w-24 h-24 rounded-full flex items-center justify-center transition-colors ${
                  status === 'listening' ? 'bg-blue-500 animate-pulse' : 
                  microphonePermission === 'granted' ? 'bg-primary' : 'bg-muted-foreground'
                }`}>
                  {isRecording ? (
                    <MicOff className="w-12 h-12 text-white" />
                  ) : (
                    <Mic className="w-12 h-12 text-white" />
                  )}
                </div>
              </div>

              <div className="space-y-2">
                {!isRecording ? (
                  <Button 
                    onClick={startRecording} 
                    size="lg" 
                    className="w-full"
                    disabled={status !== 'idle' || microphonePermission === 'denied'}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    {microphonePermission === 'granted' ? 'Start Speaking' : 'Enable Microphone'}
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecording} 
                    size="lg" 
                    variant="destructive" 
                    className="w-full"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop Recording
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground">Language</label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full mt-1 p-2 border border-border rounded-md bg-background text-foreground"
                  disabled={status !== 'idle'}
                >
                  {languageOptions.map(lang => (
                    <option key={lang.code} value={lang.code}>
                      {lang.name}
                    </option>
                  ))}
                </select>
              </div>

              <Button 
                onClick={toggleMute} 
                variant="outline" 
                className="w-full"
              >
                {isMuted ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Unmute Responses
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Mute Responses
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Conversation Display */}
        <Card>
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {transcript && (
              <div className="p-3 bg-primary/10 rounded-lg">
                <div className="text-sm font-medium text-foreground mb-1">You said:</div>
                <div className="text-sm text-muted-foreground">{transcript}</div>
              </div>
            )}

            {response && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-medium text-foreground">Assistant:</div>
                  {!isMuted && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={speakResponse}
                    >
                      <Play className="w-3 h-3" />
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">{response}</div>
              </div>
            )}

            {!transcript && !response && (
              <div className="text-center text-muted-foreground py-8">
                {microphonePermission === 'granted' 
                  ? 'Start speaking to begin your conversation with the AI assistant'
                  : 'Please enable microphone access to start a conversation'
                }
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Tips for Better Voice Interaction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
            <div>
              <h4 className="font-medium text-foreground mb-2">Speaking Tips:</h4>
              <ul className="space-y-1">
                <li>• Speak clearly and at a normal pace</li>
                <li>• Find a quiet environment</li>
                <li>• Express your feelings naturally</li>
                <li>• Take pauses between thoughts</li>
                <li>• Hold the record button while speaking</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Privacy & Safety:</h4>
              <ul className="space-y-1">
                <li>• All conversations are confidential</li>
                <li>• Audio is processed securely</li>
                <li>• No recordings are permanently stored</li>
                <li>• You can stop anytime</li>
                <li>• Microphone access is only used during recording</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Browser Compatibility Note */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Note:</strong> Voice assistant works best in modern browsers with microphone support.
            </p>
            <p>
              If you're experiencing issues, try using Chrome, Firefox, or Safari with HTTPS enabled.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
