import { PrimaryColorTheme, COLOR_THEMES } from '@/types/studyflow';

/**
 * CSS 변수를 업데이트하여 색상 테마를 적용합니다.
 */
export const applyColorTheme = (theme: PrimaryColorTheme): void => {
  const config = COLOR_THEMES[theme];
  const root = document.documentElement;
  const isDark = root.classList.contains('dark');
  
  // Light mode 값
  const lightPrimary = `${config.hue} ${config.saturation}% ${config.lightness}%`;
  const lightSoft = `${config.hue} ${config.saturation}% 95%`;
  const lightGlow = `${config.hue} ${config.saturation}% ${config.lightness + 10}%`;
  const lightShadow = `0 0 40px -8px hsl(${config.hue} ${config.saturation}% ${config.lightness}% / 0.4)`;
  
  // Dark mode 값
  const darkLightness = config.lightness + 10;
  const darkPrimary = `${config.hue} ${config.saturation}% ${darkLightness}%`;
  const darkSoft = `${config.hue} ${config.saturation}% 15%`;
  const darkGlow = `${config.hue} ${config.saturation}% ${darkLightness + 10}%`;
  const darkShadow = `0 0 50px -8px hsl(${config.hue} ${config.saturation}% ${darkLightness}% / 0.5)`;
  
  // 현재 모드에 따라 CSS 변수 업데이트
  if (isDark) {
    root.style.setProperty('--primary', darkPrimary);
    root.style.setProperty('--primary-soft', darkSoft);
    root.style.setProperty('--primary-glow', darkGlow);
    root.style.setProperty('--ring', darkPrimary);
    root.style.setProperty('--shadow-glow-primary', darkShadow);
  } else {
    root.style.setProperty('--primary', lightPrimary);
    root.style.setProperty('--primary-soft', lightSoft);
    root.style.setProperty('--primary-glow', lightGlow);
    root.style.setProperty('--ring', lightPrimary);
    root.style.setProperty('--shadow-glow-primary', lightShadow);
  }
};

/**
 * 저장된 색상 테마를 적용합니다.
 */
export const loadColorTheme = (theme?: PrimaryColorTheme): void => {
  if (theme && COLOR_THEMES[theme]) {
    applyColorTheme(theme);
  }
};

