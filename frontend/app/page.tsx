"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import SettingsDropdown from '@/components/SettingsDropdown';
import Footer from '@/components/layout/Footer';
import { FaUsers, FaCalendarAlt, FaFileMedical, FaPrescription, FaChartLine, FaGlobe, FaClock, FaShieldAlt, FaMobile, FaCheck } from 'react-icons/fa';
import { motion } from 'framer-motion';

type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export default function LandingPage() {
  const { t } = useLanguage();
  const [billingCycle, setBillingCycle] = useState<BillingCycle>('monthly');

  const features = [
    {
      icon: FaUsers,
      title: t('landing.features.patients.title'),
      description: t('landing.features.patients.description')
    },
    {
      icon: FaCalendarAlt,
      title: t('landing.features.appointments.title'),
      description: t('landing.features.appointments.description')
    },
    {
      icon: FaFileMedical,
      title: t('landing.features.records.title'),
      description: t('landing.features.records.description')
    },
    {
      icon: FaPrescription,
      title: t('landing.features.prescriptions.title'),
      description: t('landing.features.prescriptions.description')
    },
    {
      icon: FaChartLine,
      title: t('landing.features.reports.title'),
      description: t('landing.features.reports.description')
    },
    {
      icon: FaGlobe,
      title: t('landing.features.bilingual.title'),
      description: t('landing.features.bilingual.description')
    }
  ];

  const benefits = [
    {
      icon: FaClock,
      title: t('landing.benefits.time.title'),
      description: t('landing.benefits.time.description')
    },
    {
      icon: FaChartLine,
      title: t('landing.benefits.productivity.title'),
      description: t('landing.benefits.productivity.description')
    },
    {
      icon: FaShieldAlt,
      title: t('landing.benefits.security.title'),
      description: t('landing.benefits.security.description')
    },
    {
      icon: FaMobile,
      title: t('landing.benefits.access.title'),
      description: t('landing.benefits.access.description')
    }
  ];

  const getDiscount = () => {
    switch(billingCycle) {
      case 'quarterly': return 0.9;
      case 'yearly': return 0.8;
      default: return 1;
    }
  };

  const getPricing = (basePrice: number, doctors: number) => {
    const multiplier = getDiscount();
    const pricePerDoctor = Math.round(basePrice * multiplier);
    const monthlyTotal = pricePerDoctor * doctors;
    
    const months = billingCycle === 'quarterly' ? 3 : billingCycle === 'yearly' ? 12 : 1;
    const totalCharge = monthlyTotal * months;
    const savings = billingCycle !== 'monthly' ? (basePrice * doctors - pricePerDoctor * doctors) * months : 0;
    
    return {
      pricePerDoctor,
      monthlyTotal,
      totalCharge,
      savings,
      discount: billingCycle === 'quarterly' ? 10 : billingCycle === 'yearly' ? 20 : 0
    };
  };

  const plans = [
    {
      id: 'trial',
      name: t('landing.pricing.trial.name'),
      description: t('landing.pricing.trial.description') || 'Prueba completa',
      basePrice: 0,
      doctors: 1,
      doctorRange: '1 ' + t('landing.pricing.doctor'),
      isFree: true,
      features: [
        t('landing.pricing.trial.feature1'),
        t('landing.pricing.trial.feature2'),
        t('landing.pricing.trial.feature3'),
        t('landing.pricing.trial.feature4')
      ],
      cta: t('landing.pricing.trial.cta'),
      highlight: false
    },
    {
      id: 'individual',
      name: t('landing.pricing.individual.name'),
      description: t('landing.pricing.individual.description'),
      basePrice: 30,
      doctors: 3,
      doctorRange: '1-5 ' + t('landing.pricing.doctors'),
      features: [
        t('landing.pricing.individual.feature1'),
        t('landing.pricing.individual.feature2'),
        t('landing.pricing.individual.feature3'),
        t('landing.pricing.individual.feature4'),
        t('landing.pricing.individual.feature5')
      ],
      cta: t('landing.pricing.individual.cta'),
      highlight: true
    },
    {
      id: 'clinic',
      name: t('landing.pricing.clinic.name'),
      description: t('landing.pricing.clinic.description2') || 'Para clínicas medianas',
      basePrice: 25,
      doctors: 12,
      doctorRange: '6-25 ' + t('landing.pricing.doctors'),
      features: [
        t('landing.pricing.clinic.feature1'),
        t('landing.pricing.clinic.feature2'),
        t('landing.pricing.clinic.feature3'),
        t('landing.pricing.clinic.feature4'),
        t('landing.pricing.clinic.feature5')
      ],
      cta: t('landing.pricing.clinic.cta'),
      highlight: false
    },
    {
      id: 'hospital',
      name: t('landing.pricing.hospital.name'),
      description: t('landing.pricing.hospital.description2') || 'Para hospitales pequeños',
      basePrice: 22,
      doctors: 30,
      doctorRange: '26-50 ' + t('landing.pricing.doctors'),
      features: [
        t('landing.pricing.hospital.feature1'),
        t('landing.pricing.hospital.feature2'),
        t('landing.pricing.hospital.feature3'),
        t('landing.pricing.hospital.feature4'),
        t('landing.pricing.hospital.feature5')
      ],
      cta: t('landing.pricing.hospital.cta'),
      highlight: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: t('landing.pricing.enterprise') || 'Soluciones personalizadas',
      basePrice: 0,
      doctors: 0,
      doctorRange: '51+ ' + t('landing.pricing.doctors'),
      isEnterprise: true,
      features: [
        '51+ ' + t('landing.pricing.doctors'),
        t('landing.pricing.customSolution') || 'Solución personalizada',
        t('landing.pricing.dedicatedIntegration') || 'Integración dedicada',
        t('landing.pricing.accountManager') || 'Gerente de cuenta',
        'SLA ' + (t('landing.pricing.guaranteed') || 'garantizado')
      ],
      cta: t('landing.pricing.contactSales') || 'Contactar Ventas',
      highlight: false
    }
  ];

  const testimonials = [
    {
      name: t('landing.testimonials.doctor1.name'),
      specialty: t('landing.testimonials.doctor1.specialty'),
      text: t('landing.testimonials.doctor1.text'),
      avatar: '👨‍⚕️'
    },
    {
      name: t('landing.testimonials.doctor2.name'),
      specialty: t('landing.testimonials.doctor2.specialty'),
      text: t('landing.testimonials.doctor2.text'),
      avatar: '👩‍⚕️'
    },
    {
      name: t('landing.testimonials.doctor3.name'),
      specialty: t('landing.testimonials.doctor3.specialty'),
      text: t('landing.testimonials.doctor3.text'),
      avatar: '👨‍⚕️'
    }
  ];

  return (
    <div className="min-h-screen bg-[rgb(var(--background))]">
      {/* Header Público */}
      <header className="sticky top-0 z-50 bg-[rgb(var(--sidebar))] border-b border-[rgb(var(--border))] shadow-sm backdrop-blur-lg bg-opacity-90">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary))] flex items-center justify-center text-white text-xl font-bold">
                🏥
              </div>
              <h1 className="text-xl lg:text-2xl font-bold text-[rgb(var(--foreground))]">
                {t('common.appName')}
              </h1>
            </Link>

            <div className="flex items-center gap-3">
              <SettingsDropdown />
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium text-[rgb(var(--foreground))] hover:text-[rgb(var(--primary))] transition-colors"
              >
                {t('auth.login')}
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] font-medium transition-colors shadow-md hover:shadow-lg"
              >
                {t('auth.register')}
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section className="relative py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          >
            <source src="/videos/hero-video.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-[rgb(var(--background))]"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-4xl lg:text-6xl font-bold text-white mb-6 drop-shadow-lg">
              {t('landing.hero.title')}{' '}
              <span className="text-[rgb(var(--primary))]">{t('landing.hero.titleHighlight')}</span>
            </h2>
            <p className="text-xl text-white/90 mb-8 drop-shadow-md">
              {t('landing.hero.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/register"
                  className="px-8 py-4 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] font-medium text-lg shadow-lg hover:shadow-xl transition-all inline-block"
                >
                  {t('landing.hero.cta1')}
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white border-2 border-white/30 rounded-lg hover:bg-white/20 font-medium text-lg transition-all inline-block"
                >
                  {t('landing.hero.cta2')}
                </Link>
              </motion.div>
            </div>
            <p className="text-sm text-white/80 mt-4 drop-shadow-md">
              ✓ {t('landing.hero.benefit1')}  ✓ {t('landing.hero.benefit2')}  ✓ {t('landing.hero.benefit3')}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-[rgb(var(--background))]">
        <div className="container mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h3 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--foreground))] mb-4">
              {t('landing.features.title')}
            </h3>
            <p className="text-lg text-[rgb(var(--gray-medium))]">
              {t('landing.features.subtitle')}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="bg-[rgb(var(--card))] rounded-lg p-6 border border-[rgb(var(--border))] hover:shadow-lg transition-all"
                >
                  <div className="w-12 h-12 rounded-lg bg-[rgb(var(--primary)/0.1)] flex items-center justify-center text-[rgb(var(--primary))] text-2xl mb-4">
                    <Icon />
                  </div>
                  <h4 className="text-xl font-semibold text-[rgb(var(--foreground))] mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-[rgb(var(--gray-medium))]">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-[rgb(var(--card))]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--foreground))] mb-4">
              {t('landing.benefits.title')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-16 h-16 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-3xl mx-auto mb-4">
                    <Icon />
                  </div>
                  <h4 className="text-lg font-semibold text-[rgb(var(--foreground))] mb-2">
                    {benefit.title}
                  </h4>
                  <p className="text-[rgb(var(--gray-medium))]">
                    {benefit.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-[rgb(var(--background))]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--foreground))] mb-4">
              {t('landing.pricing.title')}
            </h3>
            <p className="text-lg text-[rgb(var(--gray-medium))] mb-8">
              {t('landing.pricing.subtitle')}
            </p>

            {/* Billing Cycle Toggle */}
            <div className="inline-flex bg-[rgb(var(--card))] rounded-lg p-1 border border-[rgb(var(--border))] shadow-md">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-3 rounded-md font-medium transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[rgb(var(--primary))] text-white shadow-md'
                    : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))]'
                }`}
              >
                {t('landing.pricing.monthly')}
              </button>
              <button
                onClick={() => setBillingCycle('quarterly')}
                className={`px-6 py-3 rounded-md font-medium transition-all relative ${
                  billingCycle === 'quarterly'
                    ? 'bg-[rgb(var(--primary))] text-white shadow-md'
                    : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))]'
                }`}
              >
                {t('landing.pricing.quarterly')}
                <span className="absolute -top-2 -right-2 bg-[rgb(var(--success))] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  -10%
                </span>
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-6 py-3 rounded-md font-medium transition-all relative ${
                  billingCycle === 'yearly'
                    ? 'bg-[rgb(var(--primary))] text-white shadow-md'
                    : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))]'
                }`}
              >
                {t('landing.pricing.yearly')}
                <span className="absolute -top-2 -right-2 bg-[rgb(var(--success))] text-white text-xs px-2 py-0.5 rounded-full font-bold">
                  -20%
                </span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 max-w-[1600px] mx-auto">
            {plans.map((plan, index) => {
              const pricing = plan.isFree || plan.isEnterprise ? null : getPricing(plan.basePrice, plan.doctors);
              
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ scale: plan.highlight ? 1.05 : 1.02 }}
                  className={`bg-[rgb(var(--card))] rounded-lg p-6 border-2 ${
                    plan.highlight
                      ? 'border-[rgb(var(--primary))] shadow-xl'
                      : 'border-[rgb(var(--border))]'
                  } transition-all relative`}
                >
                  {plan.highlight && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <div className="bg-[rgb(var(--primary))] text-white text-xs font-bold py-1 px-3 rounded-full uppercase">
                        {t('landing.pricing.popular')}
                      </div>
                    </div>
                  )}
                  
                  <h4 className="text-2xl font-bold text-[rgb(var(--foreground))] mb-2">
                    {plan.name}
                  </h4>
                  
                  <p className="text-sm text-[rgb(var(--gray-medium))] mb-4 h-10">
                    {plan.description}
                  </p>

                  <div className="mb-6">
                    {plan.isFree ? (
                      <>
                        <span className="text-4xl font-bold text-[rgb(var(--primary))]">
                          {t('landing.pricing.free')}
                        </span>
                        <span className="text-[rgb(var(--gray-medium))]"> 7 {t('landing.pricing.days')}</span>
                      </>
                    ) : plan.isEnterprise ? (
                      <>
                        <span className="text-2xl font-bold text-[rgb(var(--primary))]">
                          {t('landing.pricing.custom') || 'Personalizado'}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="text-sm text-[rgb(var(--gray-medium))] mb-2">
                          {t('landing.pricing.example')}: {plan.doctors} {plan.doctors === 1 ? t('landing.pricing.doctor') : t('landing.pricing.doctors')}
                        </div>
                        {pricing && pricing.discount > 0 && (
                          <div className="text-sm text-[rgb(var(--gray-medium))] line-through mb-1">
                            ${plan.basePrice}/{t('landing.pricing.doctor')}/{t('landing.pricing.perMonth').replace('/', '')}
                          </div>
                        )}
                        <div>
                          <span className="text-4xl font-bold text-[rgb(var(--primary))]">
                            ${pricing?.pricePerDoctor}
                          </span>
                          <span className="text-[rgb(var(--gray-medium))]">/{t('landing.pricing.doctor')}{t('landing.pricing.perMonth')}</span>
                        </div>
                        {pricing && pricing.discount > 0 && (
                          <div className="text-xs text-[rgb(var(--success))] mt-2 font-medium">
                            💰 {t('landing.pricing.savings')} ${pricing.savings} {billingCycle === 'quarterly' ? t('landing.pricing.everyMonths') : t('landing.pricing.annually')}
                          </div>
                        )}
                        <div className="text-xs text-[rgb(var(--gray-medium))] mt-2">
                          {billingCycle === 'monthly' && (t('landing.pricing.billedMonthly') || 'Facturado mensualmente')}
                          {billingCycle === 'quarterly' && `Total: $${pricing?.totalCharge} ${t('landing.pricing.everyMonths')}`}
                          {billingCycle === 'yearly' && `Total: $${pricing?.totalCharge} ${t('landing.pricing.annually')}`}
                        </div>
                      </>
                    )}
                  </div>

                  <div className="text-sm text-[rgb(var(--gray-medium))] mb-4 font-medium">
                    {plan.doctorRange}
                  </div>

                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-[rgb(var(--gray-medium))]">
                        <FaCheck className="text-[rgb(var(--success))] mt-1 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={plan.isEnterprise ? "/contact-sales" : "/register"}
                    className={`block w-full py-3 rounded-lg font-medium text-center transition-all ${
                      plan.highlight
                        ? 'bg-[rgb(var(--primary))] text-white hover:bg-[rgb(var(--primary-hover))] shadow-md'
                        : 'bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] hover:bg-[rgb(var(--gray-very-light))]'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          <div className="text-center mt-8 text-sm text-[rgb(var(--gray-medium))]">
            <p>💡 {t('landing.pricing.priceNote')}</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-[rgb(var(--card))]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h3 className="text-3xl lg:text-4xl font-bold text-[rgb(var(--foreground))] mb-4">
              {t('landing.testimonials.title')}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-[rgb(var(--background))] rounded-lg p-6 border border-[rgb(var(--border))]"
              >
                <p className="text-[rgb(var(--foreground))] mb-4 italic">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[rgb(var(--primary))] flex items-center justify-center text-white text-2xl">
                    {testimonial.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-[rgb(var(--foreground))]">
                      {testimonial.name}
                    </p>
                    <p className="text-sm text-[rgb(var(--gray-medium))]">
                      {testimonial.specialty}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-gradient-to-r from-[rgb(var(--primary)/0.1)] to-[rgb(var(--accent)/0.1)]">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <h3 className="text-3xl lg:text-5xl font-bold text-[rgb(var(--foreground))] mb-6">
              {t('landing.cta.title')}
            </h3>
            <p className="text-xl text-[rgb(var(--gray-medium))] mb-8 max-w-2xl mx-auto">
              {t('landing.cta.subtitle')}
            </p>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="inline-block px-8 py-4 bg-[rgb(var(--primary))] text-white rounded-lg hover:bg-[rgb(var(--primary-hover))] font-medium text-lg shadow-lg hover:shadow-xl transition-all"
              >
                {t('landing.cta.button')}
              </Link>
            </motion.div>
            <p className="text-sm text-[rgb(var(--gray-medium))] mt-4">
              {t('landing.cta.noCommitment')} · {t('landing.cta.cancelAnytime')}
            </p>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}