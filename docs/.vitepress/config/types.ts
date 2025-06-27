export interface NavItem {
  text: string;
  link?: string;
  items?: NavItem[];
  activeMatch?: string;
}

export interface SidebarItem {
  text: string;
  link?: string;
  items?: SidebarItem[];
  collapsed?: boolean;
  collapsible?: boolean;
}

export interface SidebarConfig {
  [path: string]: SidebarItem[];
}

export interface SearchConfig {
  provider: 'local' | 'algolia';
  options?: {
    locales?: {
      [locale: string]: {
        translations: {
          button: {
            buttonText: string;
            buttonAriaLabel: string;
          };
          modal: {
            noResultsText: string;
            resetButtonTitle: string;
            footer: {
              selectText: string;
              navigateText: string;
            };
          };
        };
      };
    };
  };
}

export interface SocialLink {
  icon: 'discord' | 'facebook' | 'github' | 'instagram' | 'linkedin' | 'mastodon' | 'slack' | 'twitter' | 'youtube' | { svg: string };
  link: string;
  ariaLabel?: string;
}

export interface FooterConfig {
  message?: string;
  copyright?: string;
}

export interface EditLinkConfig {
  pattern: string;
  text: string;
}

export interface LastUpdatedConfig {
  text: string;
  formatOptions?: Intl.DateTimeFormatOptions;
}

export interface DocFooterConfig {
  prev?: string | false;
  next?: string | false;
}

export interface OutlineConfig {
  level?: number | [number, number] | 'deep';
  label?: string;
}

export interface ThemeConfig {
  siteTitle?: string | false;
  logo?: string | { src: string; width?: number; height?: number; alt?: string };
  nav?: NavItem[];
  sidebar?: SidebarConfig;
  search?: SearchConfig;
  socialLinks?: SocialLink[];
  footer?: FooterConfig;
  editLink?: EditLinkConfig;
  lastUpdated?: LastUpdatedConfig;
  docFooter?: DocFooterConfig;
  outline?: OutlineConfig;
  returnToTopLabel?: string;
  externalLinkIcon?: boolean;
  darkModeSwitchLabel?: string;
  lightModeSwitchTitle?: string;
  darkModeSwitchTitle?: string;
  sidebarMenuLabel?: string;
  mobileBreakpoint?: number;
}

export interface VitePressConfig {
  title: string;
  description: string;
  lang?: string;
  base?: string;
  head?: Array<[string, Record<string, string>]>;
  themeConfig: ThemeConfig;
  markdown?: {
    lineNumbers?: boolean;
    theme?: string | { light: string; dark: string };
    toc?: { level?: [number, number] };
  };
  vite?: {
    plugins?: any[];
    css?: {
      preprocessorOptions?: any;
    };
  };
  sitemap?: {
    hostname: string;
  };
}