import React, { useState, useRef, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { Send, Bot, User, Globe, Shield } from 'lucide-react';
import backend from '~backend/client';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  message: string;
  timestamp: string;
  sentimentScore?: number;
  riskLevel?: 'low' | 'medium' | 'high';
}

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [language, setLanguage] = useState('en');
  const [isAnonymous, setIsAnonymous] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const userId = isAnonymous ? crypto.randomUUID() : 'current-user-id';
      return backend.chat.startSession({
        userId,
        sessionType: 'text',
        language,
        isAnonymous,
      });
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setMessages([{
        id: crypto.randomUUID(),
        sender: 'ai',
        message: data.message,
        timestamp: new Date().toISOString(),
      }]);
    },
    onError: (error) => {
      console.error('Error starting session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start chat session. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      if (!sessionId) throw new Error('No active session');
      return backend.chat.sendMessage({
        sessionId,
        message,
      });
    },
    onSuccess: (data, sentMessage) => {
      setMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          sender: 'user',
          message: sentMessage,
          timestamp: new Date().toISOString(),
        },
        {
          id: crypto.randomUUID(),
          sender: 'ai',
          message: data.aiResponse,
          timestamp: new Date().toISOString(),
          sentimentScore: data.sentimentScore,
          riskLevel: data.riskLevel,
        }
      ]);

      if (data.riskLevel === 'high') {
        toast({
          title: 'Support Resources',
          description: 'We noticed you might need additional support. Please consider reaching out to our counselors.',
          variant: 'default',
        });
      }
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const handleStartSession = () => {
    startSessionMutation.mutate();
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !sessionId) return;

    sendMessageMutation.mutate(inputMessage);
    setInputMessage('');
  };

  const languageOptions = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'हिन्दी' },
    { code: 'es', name: 'Español' },
  ];

  const getRiskColor = (riskLevel?: string) => {
    switch (riskLevel) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-green-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">AI Chat Support</h1>
        <p className="text-muted-foreground">
          Chat with our compassionate AI assistant in your preferred language. 
          All conversations are confidential and anonymous.
        </p>
        
        <div className="flex items-center justify-center space-x-4">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm text-muted-foreground">Anonymous & Secure</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-muted-foreground">Multilingual Support</span>
          </div>
        </div>
      </div>

      {!sessionId ? (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Start Your Session</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground">Language</label>
              <select 
                value={language} 
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full mt-1 p-2 border border-border rounded-md bg-background text-foreground"
              >
                {languageOptions.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="anonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="rounded"
              />
              <label htmlFor="anonymous" className="text-sm text-foreground">
                Stay anonymous (recommended)
              </label>
            </div>

            <Button 
              onClick={handleStartSession} 
              className="w-full"
              disabled={startSessionMutation.isPending}
            >
              {startSessionMutation.isPending ? 'Starting...' : 'Start Chat'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="h-[600px] flex flex-col">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>MindCare Assistant</span>
              </CardTitle>
              <Badge variant="outline" className="text-xs">
                {languageOptions.find(l => l.code === language)?.name}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent className="flex-1 flex flex-col space-y-4">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted text-foreground'
                    }`}>
                      <div className="flex items-start space-x-2">
                        {message.sender === 'ai' && <Bot className="w-4 h-4 mt-0.5 text-muted-foreground" />}
                        {message.sender === 'user' && <User className="w-4 h-4 mt-0.5" />}
                        <div className="flex-1">
                          <p className="text-sm">{message.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs opacity-70">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </span>
                            {message.riskLevel && (
                              <div className={`w-2 h-2 rounded-full ${getRiskColor(message.riskLevel)}`} />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            <form onSubmit={handleSendMessage} className="flex space-x-2">
              <Input
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1"
                disabled={sendMessageMutation.isPending}
              />
              <Button 
                type="submit" 
                size="icon"
                disabled={sendMessageMutation.isPending || !inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
