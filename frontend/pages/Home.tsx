import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  MessageCircle, 
  Mic, 
  PlayCircle, 
  TrendingUp, 
  Calendar, 
  Phone,
  Heart,
  Shield,
  Users
} from 'lucide-react';

const features = [
  {
    title: 'AI Chat Support',
    description: 'Get instant support through our multilingual AI chatbot available 24/7',
    icon: MessageCircle,
    href: '/chat',
    color: 'bg-blue-500'
  },
  {
    title: 'Voice Assistant',
    description: 'Talk to our empathetic AI voice assistant for natural conversations',
    icon: Mic,
    href: '/voice',
    color: 'bg-green-500'
  },
  {
    title: 'Media Library',
    description: 'Access guided meditations, relaxation videos, and wellness content',
    icon: PlayCircle,
    href: '/media',
    color: 'bg-purple-500'
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your mental health journey with mood logs and wellness metrics',
    icon: TrendingUp,
    href: '/progress',
    color: 'bg-orange-500'
  },
  {
    title: 'Appointments',
    description: 'Book sessions with qualified counselors and mental health professionals',
    icon: Calendar,
    href: '/appointments',
    color: 'bg-indigo-500'
  },
  {
    title: 'Emergency Support',
    description: 'Quick access to crisis helplines and emergency mental health resources',
    icon: Phone,
    href: '/emergency',
    color: 'bg-red-500'
  }
];

const stats = [
  { label: 'Students Supported', value: '10,000+', icon: Users },
  { label: 'Anonymous Sessions', value: '25,000+', icon: Shield },
  { label: 'Wellness Score Improvement', value: '85%', icon: Heart }
];

export default function Home() {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center space-y-6">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            Your Mental Health
            <span className="text-primary block">Matters</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A comprehensive digital mental health platform designed specifically for students. 
            Get support, track progress, and access resources - all in one place.
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="text-lg">
            <Link to="/chat">Start Chat Support</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="text-lg">
            <Link to="/voice">Try Voice Assistant</Link>
          </Button>
        </div>
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="text-center">
              <CardContent className="pt-6">
                <div className="flex justify-center mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-foreground">{stat.value}</div>
                <div className="text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Comprehensive Mental Health Support
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Access a complete suite of tools and resources designed to support your mental health journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="group hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${feature.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base mb-4">
                    {feature.description}
                  </CardDescription>
                  <Button asChild variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                    <Link to={feature.href}>Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-muted rounded-lg p-8 text-center">
        <h3 className="text-2xl font-bold text-foreground mb-4">
          Need Immediate Support?
        </h3>
        <p className="text-muted-foreground mb-6">
          Our platform provides anonymous, confidential support whenever you need it. 
          Start your journey to better mental health today.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/emergency">Emergency Resources</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/appointments">Book Counselor</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
