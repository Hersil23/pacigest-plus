'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/contexts/LanguageContext';
import { FaArrowLeft, FaUsers, FaCalendarCheck, FaClock, FaFileAlt, FaPrescription, FaDollarSign } from 'react-icons/fa';

interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  pendingAppointments: number;
  medicalRecordsThisMonth: number;
  prescriptionsThisMonth: number;
  monthlyRevenue: number;
  currentMonth: string;
}

export default function StatisticsPage() {
  const router = useRouter();
  const { t } = useLanguage();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const doctorId = user._id || user.id;

      const response = await fetch(`http://localhost:5000/api/stats/doctor/${doctorId}/dashboard`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Error fetching statistics');

      const data = await response.json();
      setStats(data.data);
    } catch (err) {
      console.error('Error loading statistics:', err);
      setError(t('statistics.error'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <p style={{ color: 'rgb(var(--foreground))' }}>{t('statistics.loading')}</p>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
        <div className="max-w-6xl mx-auto">
          <div className="p-4 rounded-lg mb-4" style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderWidth: '1px',
            borderColor: 'rgb(var(--error))'
          }}>
            <p style={{ color: 'rgb(var(--error))' }}>{error || t('statistics.error')}</p>
          </div>
          <button
            onClick={() => router.push('/panel')}
            className="px-4 py-2 rounded-lg transition-all hover:opacity-80"
            style={{ backgroundColor: 'rgb(var(--primary))', color: 'white' }}
          >
            {t('common.back')}
          </button>
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: t('statistics.totalPatients'),
      value: stats.totalPatients,
      icon: FaUsers,
      color: '#3b82f6',
      bgColor: 'rgba(59, 130, 246, 0.1)'
    },
    {
      title: t('statistics.todayAppointments'),
      value: stats.todayAppointments,
      icon: FaCalendarCheck,
      color: '#10b981',
      bgColor: 'rgba(16, 185, 129, 0.1)'
    },
    {
      title: t('statistics.pendingAppointments'),
      value: stats.pendingAppointments,
      icon: FaClock,
      color: '#f59e0b',
      bgColor: 'rgba(245, 158, 11, 0.1)'
    },
    {
      title: t('statistics.medicalRecordsThisMonth'),
      value: stats.medicalRecordsThisMonth,
      icon: FaFileAlt,
      color: '#8b5cf6',
      bgColor: 'rgba(139, 92, 246, 0.1)'
    },
    {
      title: t('statistics.prescriptionsThisMonth'),
      value: stats.prescriptionsThisMonth,
      icon: FaPrescription,
      color: '#ec4899',
      bgColor: 'rgba(236, 72, 153, 0.1)'
    },
    {
      title: t('statistics.monthlyRevenue'),
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: FaDollarSign,
      color: '#14b8a6',
      bgColor: 'rgba(20, 184, 166, 0.1)'
    }
  ];

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'rgb(var(--background))' }}>
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/panel')}
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

          <h1 className="text-3xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
            {t('statistics.title')}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'rgb(var(--gray-medium))' }}>
            {t('statistics.subtitle')} - {stats.currentMonth}
          </p>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <div
                key={index}
                className="rounded-lg shadow-sm p-6 transition-all hover:shadow-md"
                style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="text-sm mb-1" style={{ color: 'rgb(var(--gray-medium))' }}>
                      {card.title}
                    </p>
                    <p className="text-3xl font-bold" style={{ color: 'rgb(var(--foreground))' }}>
                      {card.value}
                    </p>
                  </div>
                  <div
                    className="p-3 rounded-lg"
                    style={{ backgroundColor: card.bgColor }}
                  >
                    <Icon size={24} style={{ color: card.color }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Additional Info */}
        <div className="mt-8 rounded-lg shadow-sm p-6" style={{ backgroundColor: 'rgb(var(--card))', borderWidth: '1px', borderColor: 'rgb(var(--border))' }}>
          <h2 className="text-xl font-semibold mb-4" style={{ color: 'rgb(var(--foreground))' }}>
            {t('statistics.overview')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('statistics.currentMonth')}
              </p>
              <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                {stats.currentMonth}
              </p>
            </div>
            <div>
              <p className="text-sm mb-2" style={{ color: 'rgb(var(--gray-medium))' }}>
                {t('statistics.thisMonth')}
              </p>
              <p className="text-lg font-semibold" style={{ color: 'rgb(var(--foreground))' }}>
                {stats.medicalRecordsThisMonth} {t('statistics.medicalRecordsThisMonth').toLowerCase()} • {stats.prescriptionsThisMonth} {t('statistics.prescriptionsThisMonth').toLowerCase()}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
