// MyDiary Desktop 테마 프리셋 및 테마 관리 시스템

export const THEME_PRESETS = [
  {
    id: 'ocean',
    name: '오션 블루',
    subtitle: '기본 테마',
    description: '맑고 신뢰감 있는 클래식 스카이 블루',
    primary: '#0284c7',
    primaryHover: '#0369a1',
    primaryLight: '#e0f2fe',
    primaryDark: '#075985',
    secondary: '#0d9488',
    previewBg: '#f8fafc',
    previewHeader: '#ffffff',
    badgeColor: '#0284c7',
    isDark: false,
  },
  {
    id: 'sage',
    name: '포레스트 세이지',
    subtitle: '눈이 편안한 그린',
    description: '차분하고 편안한 에메랄드 & 세이지 그린',
    primary: '#0d9488',
    primaryHover: '#0f766e',
    primaryLight: '#ccfbf1',
    primaryDark: '#115e59',
    secondary: '#0284c7',
    previewBg: '#f6faf9',
    previewHeader: '#ffffff',
    badgeColor: '#0d9488',
    isDark: false,
  },
  {
    id: 'lavender',
    name: '로열 라벤더',
    subtitle: '세련된 퍼플',
    description: '우아하고 모던한 바이올렛 & 라벤더',
    primary: '#7c3aed',
    primaryHover: '#6d28d9',
    primaryLight: '#ede9fe',
    primaryDark: '#5b21b6',
    secondary: '#2563eb',
    previewBg: '#faf9fd',
    previewHeader: '#ffffff',
    badgeColor: '#7c3aed',
    isDark: false,
  },
  {
    id: 'sunset',
    name: '웜 선셋',
    subtitle: '따뜻한 코랄',
    description: '포근하고 생동감 있는 앰버 & 오렌지',
    primary: '#ea580c',
    primaryHover: '#c2410c',
    primaryLight: '#ffedd5',
    primaryDark: '#9a3412',
    secondary: '#d97706',
    previewBg: '#fffbf7',
    previewHeader: '#ffffff',
    badgeColor: '#ea580c',
    isDark: false,
  },
  {
    id: 'dark',
    name: '미드나잇 다크',
    subtitle: '야간 다크 모드',
    description: '야간 일지 작성 시 눈부심을 줄여주는 다크 모드',
    primary: '#38bdf8',
    primaryHover: '#7dd3fc',
    primaryLight: '#082f49',
    primaryDark: '#0284c7',
    secondary: '#2dd4bf',
    previewBg: '#0f172a',
    previewHeader: '#1e293b',
    badgeColor: '#38bdf8',
    isDark: true,
  },
];

const THEME_STORAGE_KEY = 'mydiary_theme_id';

/**
 * 로컬 스토리지에서 저장된 테마 ID를 가져옵니다. (기본값: 'ocean')
 */
export function getStoredTheme() {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved && THEME_PRESETS.some((t) => t.id === saved)) {
      return saved;
    }
  } catch (e) {
    console.warn('Failed to read theme from localStorage:', e);
  }
  return 'ocean';
}

/**
 * HTML root(documentElement)에 data-theme 속성을 설정하고 로컬 스토리지에 저장합니다.
 */
export function applyTheme(themeId) {
  const validTheme = THEME_PRESETS.some((t) => t.id === themeId) ? themeId : 'ocean';
  document.documentElement.setAttribute('data-theme', validTheme);
  try {
    localStorage.setItem(THEME_STORAGE_KEY, validTheme);
  } catch (e) {
    console.warn('Failed to save theme to localStorage:', e);
  }
  return validTheme;
}

// 하위 호환용 레거시 theme 객체 보존
export const theme = {
  colors: {
    primary: '#0284c7',
    secondaryContainer: '#e0f2f1',
    onSecondaryContainer: '#004d40',
    surface: '#f7fafd',
    surfaceVariant: '#f1f4f7',
    outline: '#d7dade',
    textPrimary: '#1a1c1e',
    textSecondary: '#44474e',
    white: '#ffffff',
    accentGreen: '#d1eadd',
    accentOrange: '#fbe9e7',
    error: '#ba1a1a',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
  },
  roundness: 12,
};
