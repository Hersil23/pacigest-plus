export interface NavItem {
  icon: string;
  label: string;
  labelKey: string; // Key para traducción
  href: string;
  badge?: number;
  badgeColor?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export interface NavSection {
  title?: string;
  titleKey?: string; // Key para traducción
  items: NavItem[];
}