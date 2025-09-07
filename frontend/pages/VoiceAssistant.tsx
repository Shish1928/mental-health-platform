import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mic, MicOff, Volume2, VolumeX, Play, Square } from 'lucide-react';

export default function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [language, setLanguage] = useState('en');
  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        processAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus('listening');
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      setStatus('processing');
    }
  };

  const processAudio = async (audioBlob: Blob) => {
    try {
      // In a real implementation, this would send audio to speech-to-text service
      // For demo purposes, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoTranscript = "Hello, I've been feeling a bit anxious lately and could use some support.";
      setTranscript(demoTranscript);
      
      // Simulate AI response generation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const demoResponse = "I understand that you're feeling anxious, and I want you to know that it's completely normal to feel this way sometimes. Can you tell me more about what's been causing you to feel anxious? Sometimes talking about it can help us understand it better.";
      setResponse(demoResponse);
      
      // Simulate text-to-speech
      if (!isMuted) {
        setIsPlaying(true);
        setStatus('speaking');
        
        // In a real implementation, this would use a TTS service
        const utterance = new SpeechSynthesisUtterance(demoResponse);
        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
        utterance.onend = () => {
          setIsPlaying(false);
          setStatus('idle');
        };
        
        speechSynthesis.speak(utterance);
      } else {
        setStatus('idle');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setStatus('idle');
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

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Voice Assistant</h1>
        <p className="text-muted-foreground">
          Talk naturally with our empathetic AI voice assistant. 
          Express your feelings and get real-time support through voice conversation.
        </p>
      </div>

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
                  status === 'listening' ? 'bg-blue-500 animate-pulse' : 'bg-muted-foreground'
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
                    disabled={status !== 'idle'}
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Start Speaking
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
                      onClick={() => {
                        const utterance = new SpeechSynthesisUtterance(response);
                        utterance.lang = language === 'hi' ? 'hi-IN' : 'en-US';
                        speechSynthesis.speak(utterance);
                      }}
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
                Start speaking to begin your conversation with the AI assistant
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
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-foreground mb-2">Privacy & Safety:</h4>
              <ul className="space-y-1">
                <li>• All conversations are confidential</li>
                <li>• Audio is processed securely</li>
                <li>• No recordings are permanently stored</li>
                <li>• You can stop anytime</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
