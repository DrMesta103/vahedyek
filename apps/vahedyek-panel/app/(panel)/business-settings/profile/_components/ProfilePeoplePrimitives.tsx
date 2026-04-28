'use client';

import type { ReactNode } from 'react';
import { Building2, Mail, MoreVertical, Phone, UserRound } from 'lucide-react';

type PersonAvatarProps = {
  avatarMode: 'image' | 'badge' | 'ghost';
  avatarText: string;
  avatarImage?: string;
  kind?: 'person' | 'company';
  size?: 'default' | 'large';
};

export function PersonAvatar({ avatarMode, avatarText, avatarImage, kind = 'person', size = 'default' }: PersonAvatarProps) {
  const sizeClass = size === 'large' ? 'representative-avatar is-large' : 'representative-avatar';

  if (avatarMode === 'image' && avatarImage) {
    return (
      <div className={`${sizeClass} is-photo`} aria-hidden="true">
        <img src={avatarImage} alt="" className="representative-avatar-image" />
      </div>
    );
  }

  if (avatarMode === 'ghost') {
    return (
      <div className={`${sizeClass} is-ghost`} aria-hidden="true">
        {kind === 'company' ? <Building2 /> : <UserRound />}
      </div>
    );
  }

  const toneClass = kind === 'company' ? 'is-badge-company' : avatarMode === 'image' ? 'is-image' : 'is-badge';

  return (
    <div className={`${sizeClass} ${toneClass}`} aria-hidden="true">
      <span>{avatarText}</span>
    </div>
  );
}

type PersonRowCardProps = {
  name: string;
  subtitle?: string;
  avatar: ReactNode;
  email?: string;
  footer?: ReactNode;
  className?: string;
  onMoreClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  showMore?: boolean;
  showPhone?: boolean;
  showEmail?: boolean;
};

export function PersonRowCard({
  name,
  subtitle,
  avatar,
  email,
  footer,
  className = '',
  onMoreClick,
  showMore = true,
  showPhone = true,
  showEmail = true,
}: PersonRowCardProps) {
  return (
    <article className={`person-row-card ${className}`.trim()}>
      <div className="person-row-card-actions">
        {showMore ? (
          <button type="button" aria-label="گزینه ها" onClick={onMoreClick}>
            <MoreVertical />
          </button>
        ) : null}
        {showPhone ? (
          <button type="button" aria-label="تماس">
            <Phone />
          </button>
        ) : null}
        {showEmail && email ? (
          <button type="button" aria-label="ایمیل">
            <Mail />
          </button>
        ) : null}
      </div>

      <div className="person-row-card-main">
        <strong>{name}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
        {footer ? <div className="person-row-card-footer">{footer}</div> : null}
      </div>

      <div className="person-row-card-avatar">{avatar}</div>
    </article>
  );
}
