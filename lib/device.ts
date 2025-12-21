export const isIOS = () => {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent;

  if (/iPhone|iPad|iPod/.test(ua)) {
    return true;
  }

  if (ua.includes('Mac') && 'ontouchend' in document) {
    return true;
  }

  if (typeof navigator.platform === 'string') {
    return /iPhone|iPad|iPod/.test(navigator.platform);
  }

  return false;
};

export const isAndroid = () => {
  if (typeof navigator === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
};

export const isIPhone = () => {
  if (typeof navigator === 'undefined') return false;
  return /iPhone/.test(navigator.userAgent) || navigator.platform === 'iPhone';
};

export const isMobileDevice = () => {
  return isIOS() || isAndroid();
};
