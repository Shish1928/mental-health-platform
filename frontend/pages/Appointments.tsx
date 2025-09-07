import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { 
  Calendar, 
  Clock, 
  User, 
  Star, 
  Video, 
  Phone, 
  MessageCircle,
  Plus,
  Search
} from 'lucide-react';
import backend from '~backend/client';

export default function Appointments() {
  const [selectedCounselor, setSelectedCounselor] = useState<string | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [sessionType, setSessionType] = useState<'video' | 'audio' | 'chat'>('video');
  const [notes, setNotes] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Mock user ID - in real app, get from auth context
  const userId = 'current-user-id';

  const { data: counselorsData, isLoading: counselorsLoading } = useQuery({
    queryKey: ['counselors'],
    queryFn: () => backend.appointments.listCounselors({}),
  });

  const { data: appointmentsData } = useQuery({
    queryKey: ['appointments', userId],
    queryFn: () => backend.appointments.listAppointments({
      userId,
      userType: 'student',
    }),
  });

  const bookAppointmentMutation = useMutation({
    mutationFn: (appointmentData: {
      counselorId: string;
      appointmentDate: string;
      startTime: string;
      endTime: string;
      sessionType: 'video' | 'audio' | 'chat';
      notes?: string;
    }) =>
      backend.appointments.bookAppointment({
        studentId: userId,
        ...appointmentData,
      }),
    onSuccess: () => {
      toast({
        title: 'Appointment booked successfully',
        description: 'Your appointment request has been sent to the counselor.',
      });
      setSelectedCounselor(null);
      setAppointmentDate('');
      setAppointmentTime('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
    },
    onError: (error) => {
      console.error('Error booking appointment:', error);
      toast({
        title: 'Error',
        description: 'Failed to book appointment. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const filteredCounselors = counselorsData?.counselors.filter(counselor =>
    searchQuery === '' || 
    counselor.specializations.some(spec => 
      spec.toLowerCase().includes(searchQuery.toLowerCase())
    )
  ) || [];

  const handleBookAppointment = () => {
    if (!selectedCounselor || !appointmentDate || !appointmentTime) {
      toast({
        title: 'Missing information',
        description: 'Please select a counselor, date, and time.',
        variant: 'destructive',
      });
      return;
    }

    const startTime = appointmentTime;
    const endTime = new Date(`1970-01-01T${appointmentTime}:00`);
    endTime.setHours(endTime.getHours() + 1);
    const endTimeString = endTime.toTimeString().slice(0, 5);

    bookAppointmentMutation.mutate({
      counselorId: selectedCounselor,
      appointmentDate,
      startTime,
      endTime: endTimeString,
      sessionType,
      notes: notes || undefined,
    });
  };

  const getSessionIcon = (type: string) => {
    switch (type) {
      case 'video': return Video;
      case 'audio': return Phone;
      case 'chat': return MessageCircle;
      default: return Video;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'cancelled': return 'bg-red-500';
      case 'completed': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold text-foreground">Appointments</h1>
        <p className="text-muted-foreground">
          Book sessions with qualified counselors and manage your appointments.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Book New Appointment */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Book New Appointment</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search Counselors */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Counselor Selection */}
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {counselorsLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                filteredCounselors.map((counselor) => (
                  <div
                    key={counselor.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedCounselor === counselor.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    }`}
                    onClick={() => setSelectedCounselor(counselor.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">Counselor #{counselor.id.slice(-4)}</span>
                          <div className="flex items-center space-x-1">
                            <Star className="w-3 h-3 text-yellow-500" />
                            <span className="text-xs">{counselor.rating.toFixed(1)}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {counselor.experienceYears} years experience
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {counselor.specializations.slice(0, 3).map(spec => (
                            <Badge key={spec} variant="outline" className="text-xs">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {selectedCounselor && (
              <div className="space-y-3 pt-3 border-t">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Date</label>
                    <Input
                      type="date"
                      value={appointmentDate}
                      onChange={(e) => setAppointmentDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Time</label>
                    <Input
                      type="time"
                      value={appointmentTime}
                      onChange={(e) => setAppointmentTime(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Session Type</label>
                  <div className="flex space-x-2 mt-1">
                    {['video', 'audio', 'chat'].map(type => {
                      const Icon = getSessionIcon(type);
                      return (
                        <Button
                          key={type}
                          variant={sessionType === type ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSessionType(type as any)}
                          className="flex-1"
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Briefly describe what you'd like to discuss..."
                    className="w-full mt-1 p-2 border border-border rounded-md bg-background text-foreground text-sm resize-none"
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleBookAppointment}
                  disabled={bookAppointmentMutation.isPending}
                  className="w-full"
                >
                  {bookAppointmentMutation.isPending ? 'Booking...' : 'Book Appointment'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Your Appointments</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointmentsData?.appointments && appointmentsData.appointments.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {appointmentsData.appointments.map((appointment) => {
                  const SessionIcon = getSessionIcon(appointment.sessionType);
                  return (
                    <div key={appointment.id} className="p-3 border border-border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center space-x-2">
                          <SessionIcon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">
                            {appointment.sessionType.charAt(0).toUpperCase() + appointment.sessionType.slice(1)} Session
                          </span>
                        </div>
                        <Badge className={`text-white ${getStatusColor(appointment.status)}`}>
                          {appointment.status}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-3 h-3" />
                          <span>{new Date(appointment.appointmentDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-3 h-3" />
                          <span>{appointment.startTime} - {appointment.endTime}</span>
                        </div>
                        {appointment.notes && (
                          <p className="text-xs mt-2 p-2 bg-muted rounded">
                            {appointment.notes}
                          </p>
                        )}
                      </div>
                      
                      {appointment.status === 'confirmed' && (
                        <Button variant="outline" size="sm" className="w-full mt-3">
                          Join Session
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium text-foreground mb-2">No appointments yet</h3>
                <p>Book your first session with a counselor to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
