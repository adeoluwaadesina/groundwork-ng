import Image from 'next/image';
import Link from 'next/link';

export const BRAND = {
  tagline: 'Policy. Infrastructure. Reality-checked frameworks for Nigeria.',
  icon: '/brand/icon.png',
  wordmark: '/brand/wordmark.png',
  logoPrimary: '/brand/logo-primary.png',
} as const;

type BrandVariant = 'header' | 'footer' | 'admin' | 'compact';

type Props = {
  variant?: BrandVariant;
  href?: string;
  className?: string;
};

function LogoContent({ variant }: { variant: BrandVariant }) {
  if (variant === 'footer') {
    return (
      <div className="brand brand--footer">
        <Image
          src={BRAND.wordmark}
          alt="Ground Work / NR"
          width={200}
          height={48}
          className="brand-wordmark brand-wordmark--footer"
          priority
        />
        <p className="brand-tagline">{BRAND.tagline}</p>
      </div>
    );
  }

  if (variant === 'admin') {
    return (
      <div className="brand brand--admin">
        <Image
          src={BRAND.icon}
          alt=""
          width={36}
          height={36}
          className="brand-icon brand-icon--admin"
          aria-hidden
        />
        <span className="brand-admin-text">
          Ground Work <span className="brand-admin-slash">/</span> NR
        </span>
        <span className="brand-admin-badge">Admin</span>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <Image
        src={BRAND.icon}
        alt="Ground Work"
        width={32}
        height={32}
        className="brand-icon brand-icon--compact"
      />
    );
  }

  return (
    <div className="brand brand--header">
      <Image
        src={BRAND.icon}
        alt=""
        width={40}
        height={40}
        className="brand-icon"
        aria-hidden
        priority
      />
      <Image
        src={BRAND.wordmark}
        alt="Ground Work / NR"
        width={168}
        height={40}
        className="brand-wordmark"
        priority
      />
    </div>
  );
}

export function BrandLogo({ variant = 'header', href = '/', className = '' }: Props) {
  const content = <LogoContent variant={variant} />;

  if (!href) {
    return <div className={className}>{content}</div>;
  }

  return (
    <Link href={href} className={`brand-link ${className}`.trim()} aria-label="Ground Work home">
      {content}
    </Link>
  );
}
