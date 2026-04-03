import Link from 'next/link';

export const AuthShell = ({
  title,
  subtitle,
  children,
  footerText,
  footerLink,
  footerLinkText
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footerText: string;
  footerLink: string;
  footerLinkText: string;
}) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center px-4 py-12">
      {/* Animated mesh background */}
      <div className="bg-mesh" />
      <div className="bg-mesh-orb bg-mesh-orb-1" />
      <div className="bg-mesh-orb bg-mesh-orb-2" />

      <div className="relative w-full max-w-md animate-fade-up">
        {/* Logo mark */}
        <div className="mb-8 flex flex-col items-center">
          <div
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #7c3aed 100%)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.4)'
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                stroke="white"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.875rem',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              color: '#0f172a',
              marginBottom: '0.35rem'
            }}
          >
            {title}
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--gray-500)', textAlign: 'center' }}>
            {subtitle}
          </p>
        </div>

        {/* Card */}
        <div
          className="glass-card"
          style={{ padding: '2rem' }}
        >
          {children}

          <p
            style={{
              marginTop: '1.5rem',
              textAlign: 'center',
              fontSize: '0.875rem',
              color: 'var(--gray-500)'
            }}
          >
            {footerText}{' '}
            <Link
              href={footerLink}
              style={{
                fontWeight: 600,
                background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                textDecoration: 'none'
              }}
            >
              {footerLinkText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};