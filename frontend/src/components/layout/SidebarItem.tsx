"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NavItem } from '@/types/navigation';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarItemProps {
  item: NavItem;
  collapsed?: boolean;
  onClick?: () => void;
}

export default function SidebarItem({ item, collapsed = false, onClick }: SidebarItemProps) {
  const pathname = usePathname();
  const { t } = useLanguage();
  
  const isActive = pathname === item.href || 
                   (item.href !== '/' && pathname.startsWith(item.href));

  const getBadgeColor = () => {
    switch(item.badgeColor) {
      case 'primary': return 'bg-[rgb(var(--primary))]';
      case 'success': return 'bg-[rgb(var(--success))]';
      case 'warning': return 'bg-[rgb(var(--warning))]';
      case 'error': return 'bg-[rgb(var(--error))]';
      case 'info': return 'bg-[rgb(var(--info))]';
      default: return 'bg-[rgb(var(--primary))]';
    }
  };

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        flex items-center gap-3 px-4 py-3 rounded-lg
        transition-all duration-200
        ${isActive
          ? 'bg-[rgb(var(--primary))] text-white shadow-md'
          : 'text-[rgb(var(--foreground))] hover:bg-[rgb(var(--gray-very-light))]'
        }
        ${collapsed ? 'justify-center' : ''}
      `}
    >
      <span className="text-xl flex-shrink-0">{item.icon}</span>
      
      {!collapsed && (
        <>
          <span className="flex-1 font-medium text-sm">
            {t(item.labelKey)}
          </span>
          
          {item.badge !== undefined && item.badge > 0 && (
            <span className={`
              px-2 py-0.5 rounded-full text-xs font-bold text-white
              ${isActive ? 'bg-white/20' : getBadgeColor()}
            `}>
              {item.badge > 99 ? '99+' : item.badge}
            </span>
          )}
        </>
      )}
      
      {collapsed && item.badge !== undefined && item.badge > 0 && (
        <span className="absolute top-1 right-1 w-2 h-2 bg-[rgb(var(--error))] rounded-full"></span>
      )}
    </Link>
  );
}