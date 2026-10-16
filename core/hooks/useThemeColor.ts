import { HERO_THEME_COLOR, PAGE_THEME_COLOR } from 'lib/browserTheme';
import { useEffect, useState } from 'react';

const THEME_SWITCH_OFFSET = 196;

export const useThemeColor = (isHomePage: boolean) => {
  const [homeColor, setHomeColor] = useState(HERO_THEME_COLOR);
  const themeColor = isHomePage ? homeColor : PAGE_THEME_COLOR;

  useEffect(() => {
    const meta = document.querySelector('meta[name="theme-color"]');
    const previousThemeColor = meta?.getAttribute('content');
    const previousHtmlBackground =
      document.documentElement.style.backgroundColor;
    const previousBodyBackground = document.body.style.backgroundColor;
    const previousTheme = document.documentElement.dataset.browserTheme;

    return () => {
      document.documentElement.style.backgroundColor = previousHtmlBackground;
      document.body.style.backgroundColor = previousBodyBackground;

      if (previousThemeColor != null) {
        meta?.setAttribute('content', previousThemeColor);
      } else {
        meta?.removeAttribute('content');
      }

      if (previousTheme != null) {
        document.documentElement.dataset.browserTheme = previousTheme;
      } else {
        delete document.documentElement.dataset.browserTheme;
      }
    };
  }, []);

  useEffect(() => {
    if (!isHomePage) {
      return;
    }

    let frame = 0;

    const updateColor = () => {
      frame = 0;

      const articles = document.getElementById('articles');
      const viewportTop = window.visualViewport?.offsetTop ?? 0;
      const showHero =
        articles !== null &&
        articles.getBoundingClientRect().top >
          viewportTop + THEME_SWITCH_OFFSET;

      setHomeColor(showHero ? HERO_THEME_COLOR : PAGE_THEME_COLOR);
    };

    const scheduleUpdate = () => {
      if (!frame) {
        frame = requestAnimationFrame(updateColor);
      }
    };

    const observer = new ResizeObserver(scheduleUpdate);

    updateColor();
    observer.observe(document.body);
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate);
    window.addEventListener('pageshow', scheduleUpdate);
    window.visualViewport?.addEventListener('scroll', scheduleUpdate);
    window.visualViewport?.addEventListener('resize', scheduleUpdate);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', scheduleUpdate);
      window.removeEventListener('pageshow', scheduleUpdate);
      window.visualViewport?.removeEventListener('scroll', scheduleUpdate);
      window.visualViewport?.removeEventListener('resize', scheduleUpdate);
    };
  }, [isHomePage]);

  useEffect(() => {
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', themeColor);

    document.documentElement.style.backgroundColor = themeColor;
    document.body.style.backgroundColor = themeColor;
    document.documentElement.dataset.browserTheme =
      themeColor === HERO_THEME_COLOR ? 'hero' : 'page';
  }, [themeColor]);

  return themeColor;
};
