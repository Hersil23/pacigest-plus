"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { FaGithub, FaInstagram, FaTiktok } from 'react-icons/fa';
import { HiMail } from 'react-icons/hi';
import { TbWorld } from 'react-icons/tb';

export default function Footer() {
  const { t } = useLanguage();
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    {
      name: 'Website',
      icon: TbWorld,
      url: 'https://herasi.dev',
      label: 'herasi.dev',
      color: 'hover:text-blue-500'
    },
    {
      name: 'Email',
      icon: HiMail,
      url: 'mailto:herasidesweb@gmail.com',
      label: 'Email',
      color: 'hover:text-red-500'
    },
    {
      name: 'GitHub',
      icon: FaGithub,
      url: 'https://github.com/Hersil23',
      label: 'GitHub',
      color: 'hover:text-[#333]'
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      url: 'https://www.instagram.com/herasi.dev',
      label: 'Instagram',
      color: 'hover:text-pink-500'
    },
    {
      name: 'TikTok',
      icon: FaTiktok,
      url: 'https://www.tiktok.com/@herasi.dev',
      label: 'TikTok',
      color: 'hover:text-[#000000]'
    }
  ];

  return (
    <footer className="bg-[rgb(var(--card))] border-t border-[rgb(var(--border))] mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          <div className="text-center md:text-left">
            <p className="text-sm text-[rgb(var(--foreground))] font-semibold">
              © {currentYear} PaciGest Plus
            </p>
            <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
              {t('footer.allRightsReserved')}
            </p>
          </div>

          <div className="text-center">
            <p className="text-sm text-[rgb(var(--gray-medium))]">
              {t('footer.developedBy')}{' '}
              <a 
                href="https://herasi.dev" 
                target="_blank" 
                rel="noopener noreferrer"
                className="font-semibold text-[rgb(var(--primary))] hover:text-[rgb(var(--primary-hover))] transition-colors"
              >
                @herasi.dev
              </a>
            </p>
            <p className="text-xs text-[rgb(var(--gray-medium))] mt-1">
              <a 
                href="mailto:herasidesweb@gmail.com"
                className="hover:text-[rgb(var(--primary))] transition-colors"
              >
                herasidesweb@gmail.com
              </a>
            </p>
          </div>

          <div className="flex items-center gap-3">
            {socialLinks.map((link) => {
              const Icon = link.icon;
              return (
                <a
                  key={link.name}
                  href={link.url}
                  target={link.url.startsWith('mailto:') ? '_self' : '_blank'}
                  rel="noopener noreferrer"
                  title={link.label}
                  className={`flex items-center justify-center w-10 h-10 rounded-lg bg-[rgb(var(--background))] text-[rgb(var(--foreground))] border border-[rgb(var(--border))] transition-all hover:scale-110 hover:shadow-lg ${link.color}`}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}