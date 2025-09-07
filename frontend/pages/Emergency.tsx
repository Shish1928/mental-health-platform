import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageCircle, Globe, Clock, Heart, AlertTriangle } from 'lucide-react';

const emergencyContacts = [
  {
    name: 'National Suicide Prevention Lifeline',
    number: '988',
    description: '24/7 crisis support for those in suicidal crisis or emotional distress',
    country: 'US',
    available: '24/7',
    languages: ['English', 'Spanish'],
  },
  {
    name: 'Crisis Text Line',
    number: 'Text HOME to 741741',
    description: 'Free 24/7 support for those in crisis',
    country: 'US',
    available: '24/7',
    languages: ['English'],
  },
  {
    name: 'SAMHSA Helpline',
    number: '1-800-662-4357',
    description: 'Treatment referral and information service',
    country: 'US',
    available: '24/7',
    languages: ['English', 'Spanish'],
  },
  {
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    description: '24x7 mental health support and suicide prevention',
    country: 'India',
    available: '24/7',
    languages: ['Hindi', 'English'],
  },
  {
    name: 'Samaritans India',
    number: '91-80-25497777',
    description: 'Emotional support for those in distress',
    country: 'India',
    available: '24/7',
    languages: ['English'],
  },
];

const copingStrategies = [
  {
    title: 'Breathing Exercise',
    description: 'Take slow, deep breaths. Inhale for 4 counts, hold for 4, exhale for 4.',
    icon: '🫁',
  },
  {
    title: 'Grounding Technique',
    description: 'Name 5 things you can see, 4 you can touch, 3 you can hear, 2 you can smell, 1 you can taste.',
    icon: '🌱',
  },
  {
    title: 'Call Someone',
    description: 'Reach out to a trusted friend, family member, or counselor.',
    icon: '📞',
  },
  {
    title: 'Safe Space',
    description: 'Go to a safe, comfortable place where you feel secure.',
    icon: '🏠',
  },
];

const warningSigns = [
  'Persistent feelings of hopelessness',
  'Talking about wanting to die or hurt oneself',
  'Withdrawal from friends and activities',
  'Extreme mood swings',
  'Increased use of alcohol or drugs',
  'Feeling trapped or in unbearable pain',
  'Talking about being a burden to others',
  'Giving away prized possessions',
];

export default function Emergency() {
  const handleCall = (number: string) => {
    if (number.startsWith('Text')) {
      // Handle text instructions
      alert('Open your messaging app and text HOME to 741741');
    } else {
      window.open(`tel:${number.replace(/[^0-9+]/g, '')}`);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-2 text-red-500">
          <AlertTriangle className="w-8 h-8" />
          <h1 className="text-3xl font-bold text-foreground">Emergency Resources</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          If you're having thoughts of suicide or self-harm, please reach out for help immediately. 
          You are not alone, and there are people who want to help.
        </p>
      </div>

      {/* Crisis Alert */}
      <Card className="border-red-500 bg-red-50 dark:bg-red-950/20">
        <CardContent className="pt-6">
          <div className="flex items-start space-x-3">
            <Heart className="w-6 h-6 text-red-500 mt-1" />
            <div>
              <h3 className="font-bold text-red-700 dark:text-red-300 mb-2">
                If you're in immediate danger
              </h3>
              <p className="text-red-600 dark:text-red-400 mb-4">
                Call emergency services (911 in US, 112 in India) or go to your nearest emergency room.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button 
                  onClick={() => handleCall('911')} 
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call 911 (US)
                </Button>
                <Button 
                  onClick={() => handleCall('112')} 
                  className="bg-red-500 hover:bg-red-600"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Call 112 (India)
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Emergency Hotlines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Phone className="w-5 h-5" />
              <span>Crisis Hotlines</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {emergencyContacts.map((contact, index) => (
              <div key={index} className="p-4 border border-border rounded-lg space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{contact.name}</h4>
                    <p className="text-sm text-muted-foreground">{contact.description}</p>
                  </div>
                  <Badge variant="outline">{contact.country}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-3 h-3" />
                      <span>{contact.available}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Globe className="w-3 h-3" />
                      <span>{contact.languages.join(', ')}</span>
                    </div>
                  </div>
                </div>
                
                <Button 
                  onClick={() => handleCall(contact.number)}
                  className="w-full"
                  variant={contact.number.includes('988') ? 'default' : 'outline'}
                >
                  {contact.number.startsWith('Text') ? (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      {contact.number}
                    </>
                  ) : (
                    <>
                      <Phone className="w-4 h-4 mr-2" />
                      {contact.number}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Immediate Coping Strategies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5" />
              <span>Immediate Coping Strategies</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground mb-4">
              These techniques can help you manage intense emotions right now:
            </p>
            
            {copingStrategies.map((strategy, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <div className="flex items-start space-x-3">
                  <span className="text-2xl">{strategy.icon}</span>
                  <div>
                    <h4 className="font-medium text-foreground mb-1">{strategy.title}</h4>
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  </div>
                </div>
              </div>
            ))}
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <h4 className="font-medium text-blue-700 dark:text-blue-300 mb-2">
                Remember: This feeling is temporary
              </h4>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                Suicidal thoughts and intense emotional pain can feel overwhelming, 
                but they do pass. Reaching out for help is a sign of strength, not weakness.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Warning Signs */}
      <Card>
        <CardHeader>
          <CardTitle>Warning Signs to Watch For</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            If you or someone you know is experiencing these signs, it's important to seek help:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {warningSignes.map((sign, index) => (
              <div key={index} className="flex items-center space-x-2 p-2">
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                <span className="text-sm">{sign}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Additional Resources */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Support</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-auto p-4 flex-col">
              <MessageCircle className="w-6 h-6 mb-2" />
              <span className="font-medium">Chat Support</span>
              <span className="text-xs text-muted-foreground">Talk to our AI assistant</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Phone className="w-6 h-6 mb-2" />
              <span className="font-medium">Book Counselor</span>
              <span className="text-xs text-muted-foreground">Schedule professional help</span>
            </Button>
            
            <Button variant="outline" className="h-auto p-4 flex-col">
              <Heart className="w-6 h-6 mb-2" />
              <span className="font-medium">Wellness Content</span>
              <span className="text-xs text-muted-foreground">Guided meditations & resources</span>
            </Button>
          </div>
          
          <div className="text-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              Remember: You matter. Your life has value. Help is available, and recovery is possible.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
