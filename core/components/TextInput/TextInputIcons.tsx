export const EyeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width={22}
    height={22}
    data-testid="eye-icon"
  >
    <circle
      cx="12"
      cy="12"
      r="3"
      style={{
        strokeDasharray: 24,
        strokeDashoffset: 'var(--eye, 24)',
        transition: 'stroke-dashoffset 0.6s ease var(--eye-delay, 0s)',
      }}
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
    <line
      x1="4"
      y1="4"
      x2="20"
      y2="20"
      style={{
        strokeDasharray: 24,
        strokeDashoffset: 'var(--strike, 0)',
        transition: 'stroke-dashoffset 0.45s ease var(--strike-delay, 0s)',
      }}
    />
  </svg>
);

export const AtSignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width={20}
    height={20}
    data-testid="at-sign-icon"
  >
    <path
      style={{
        strokeDasharray: 107,
        strokeDashoffset: 'var(--at-sign, 227)',
        transition: 'stroke-dashoffset 0.8s ease var(--at-sign-delay, 0.3s)',
      }}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
    />
  </svg>
);

export const Tick = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    width={20}
    height={20}
    data-testid="tick-icon"
  >
    <path
      style={{
        strokeDasharray: 30,
        strokeDashoffset: 'var(--tick, 30)',
        transition: 'stroke-dashoffset 0.6s ease var(--tick-delay, 0s)',
      }}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 13l4 4L19 7"
    />
  </svg>
);
