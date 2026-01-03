'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaChevronLeft, FaChevronRight, FaPlus, FaArrowLeft } from 'react-icons/fa';

interface Appointment {
  _id: string;
  appointmentNumber: string;
  appointmentDate: string;
  appointmentTime: string;
  reasonForVisit: string;
  status: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

export default function CalendarPage() {
  const router = useRouter();
  const { t, language } = useLanguage();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchMonthAppointments();
  }, [currentDate]);

  const fetchMonthAppointments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/appointments', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching appointments');

      const data = await response.json();
      setAppointments(data.data || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError(t('appointments.error'));
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getAppointmentsForDay = (day: number) => {
    const { year, month } = getDaysInMonth(currentDate);
    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    return appointments.filter(apt => {
      const aptDate = new Date(apt.appointmentDate);
      const aptDateString = `${aptDate.getFullYear()}-${String(aptDate.getMonth() + 1).padStart(2, '0')}-${String(aptDate.getDate()).padStart(2, '0')}`;
      return aptDateString === dateString;
    });
  };

  const isToday = (day: number) => {
    const today = new Date();
    const { year, month } = getDaysInMonth(currentDate);
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'rgb(234, 179, 8)',
      'confirmed': 'rgb(34, 197, 94)',
      'in-progress': 'rgb(59, 130, 246)',
      'completed': 'rgb(156, 163, 175)',
      'cancelled': 'rgb(239, 68, 68)',
      'no-show': 'rgb(249, 115, 22)'
    };
    return colors[status as keyof typeof colors] || 'rgb(156, 163, 175)';
  };

  const renderCalendar = () => {
    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(
        <div key={`empty-${i}`} className="min-h-32 p-2" style={{ backgroundColor: 'rgb(var(--background))' }} />
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dayAppointments = getAppointmentsForDay(day);
      const today = isToday(day);

      days.push(
        <div
          key={day}
          className="min-h-32 p-2 transition-all hover:shadow-md cursor-pointer relative"
          style={{
            backgroundColor: 'rgb(var(--card))',
            borderWidth: '1px',
            borderColor: today ? 'rgb(var(--primary))' : 'rgb(var(--border))',
            borderWidth: today ? '2px' : '1px'
          }}
          onClick={() => dayAppointments.length > 0 && router.push(`/appointments?date=${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)}
        >
          {/* Day number */}
          <div className="flex items-center justify-between mb-2">
            <span
              className={`text-sm font-semibold ${today ? 'text-lg' : ''}`}
              style={{
                color: today ? 'rgb(var(--primary))' : 'rgb(var(--foreground))'
              }}
            >
              {day}
            </span>
            {dayAppointments.length > 0 && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: 'rgb(var(--primary))',
                  color: 'white'
                }}
              >
                {dayAppointments.length}
              </span>
            )}
          </div>

          {/* Appointments */}
          <div className="space-y-1">
            {dayAppointments.slice(0, 3).map((apt) => (
              <div
                key={apt._id}
                className="text-xs p-1 rounded truncate"
                style={{
                  backgroundColor: 'rgb(var(--background))',
                  borderLeftWidth: '3px',
                  borderLeftColor: getStatusColor(apt.status)
                }}
                title={`${apt.appointmentTime} - ${apt.patientId.firstName} ${apt.patientId.lastName}`}
              >
                <div className="font-medium" style={{ color: 'rgb(var(--foreground))' }}>
                  {apt.appointmentTime}
                </div>
                <div className="truncate" style={{ color: 'rgb(var(--gray-medium))' }}>
                  {apt.patientId.firstName} {apt.patientId.lastName}
                </div>
              </div>
            ))}
            {dayAppointments.length > 3 && (
              <div
                className="text-xs p-1 text-center rounded"
                style={{
                  color: 'rgb(var(--primary))',
                  backgroundColor: 'rgb(var(--background))'
                }}
              >
                +{dayAppointments.length - 3} {t('common.more')}
              </div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <p style={{ color: 'rgb(var(--foreground))' }}>{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          {/* Back Button */}
          <button
            onClick={() => router.push('/appointments')}
            className="flex items-center gap-2 mb-4 px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{
              backgroundColor: 'rgb(var(--card))',
              color: 'rgb(var(--foreground))',
              borderWidth: '1px',
              borderColor: 'rgb(var(--border))'
            }}
          >
            <FaArrowLeft />
            {t('common.back')}
          </button>

          {/* Title and Actions */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
                {t('appointments.calendarView.title')}
              </h1>
              <p className="mt-1" style={{ color: 'rgb(var(--foreground))', opacity: 0.7 }}>
                {t('appointments.calendarView.subtitle')}
              </p>
            </div>

            <button
              onClick={() => router.push('/appointments/new')}
              className="px-6 py-3 rounded-lg font-medium text-white transition-all hover:opacity-90 flex items-center gap-2"
              style={{ backgroundColor: 'rgb(var(--primary))' }}
            >
              <FaPlus />
              {t('appointments.new')}
            </button>
          </div>
        </div>

        {/* Calendar Controls */}
        <div className="rounded-lg shadow-md p-4 mb-6" style={{ backgroundColor: 'rgb(var(--card))' }}>
          <div className="flex items-center justify-between">
            <button
              onClick={goToPreviousMonth}
              className="p-2 rounded-lg transition-all hover:opacity-80"
              style={{
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))'
              }}
            >
              <FaChevronLeft />
            </button>

            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
                {t(`appointments.calendarView.months.${currentDate.getMonth()}`)} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToToday}
                className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'rgb(var(--primary))',
                  color: 'white'
                }}
              >
                {t('appointments.calendarView.today')}
              </button>
            </div>

            <button
              onClick={goToNextMonth}
              className="p-2 rounded-lg transition-all hover:opacity-80"
              style={{
                backgroundColor: 'rgb(var(--background))',
                color: 'rgb(var(--foreground))'
              }}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 rounded-lg" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: '1px',
            borderColor: 'rgb(var(--error))'
          }}>
            <p style={{ color: 'rgb(var(--error))' }}>{error}</p>
          </div>
        )}

        {/* Calendar Grid */}
        <div className="rounded-lg shadow-md overflow-hidden" style={{ backgroundColor: 'rgb(var(--card))' }}>
          {/* Day Headers */}
          <div className="grid grid-cols-7 gap-0" style={{ backgroundColor: 'rgb(var(--background))' }}>
            {[0, 1, 2, 3, 4, 5, 6].map((day) => (
              <div
                key={day}
                className="p-4 text-center font-semibold"
                style={{ color: 'rgb(var(--foreground))' }}
              >
                {t(`appointments.calendarView.days.${day}`)}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-0">
            {renderCalendar()}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 rounded-lg shadow-md p-4" style={{ backgroundColor: 'rgb(var(--card))' }}>
          <p className="font-semibold mb-3" style={{ color: 'rgb(var(--foreground))' }}>
            {t('appointments.status.all')}:
          </p>
          <div className="flex flex-wrap gap-4">
            {['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'].map((status) => (
              <div key={status} className="flex items-center gap-2">
                <div
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: getStatusColor(status) }}
                />
                <span className="text-sm" style={{ color: 'rgb(var(--foreground))' }}>
                  {t(`appointments.status.${status}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}