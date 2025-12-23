"use client";

import Link from 'next/link';
import { useLanguage } from '@/contexts/LanguageContext';
import NotificationDropdown from '@/components/NotificationDropdown';
import SettingsDropdown from '@/components/SettingsDropdown';
import UserDropdown from '@/components/UserDropdown';

export default function Header() {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-40 bg-[rgb(var(--sidebar))] border-b border-[rgb(var(--border))] shadow-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          
          {/* Logo / App Name */}
          <Link 
            href="/" 
            className="flex items-center gap-2 text-[rgb(var(--foreground))] hover:opacity-80 transition-opacity"
          >
            <div className="w-10 h-10 rounded-lg bg-[rgb(var(--primary))] flex items-center justify-center text-white text-xl font-bold">
              🏥
            </div>
            <h1 className="hidden sm:block text-xl lg:text-2xl font-bold">
              {t('common.appName')}
            </h1>
          </Link>

          {/* Right Side - Actions */}
          <div className="flex items-center gap-2 lg:gap-3">
            <NotificationDropdown />
            <SettingsDropdown />
            <UserDropdown />
          </div>
        </div>
      </div>
    </header>
  );
}