'use client';

import { cn } from '../../utils/cn';

export type TaavApprovalUser = {
  id: string;
  name: string;
  avatarUrl?: string;
};

export type TaavApprovalUserFormProps = {
  users: TaavApprovalUser[];
  selectedUserId?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onUserSelect?: (userId: string) => void;
  onAddUser?: () => void;
  addUserLabel?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  disabled?: boolean;
  className?: string;
};

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[21px] w-[21px]" fill="none">
      <circle cx="10.5" cy="10.5" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="m15.5 15.5 5 5" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-[26px] w-[26px]" fill="none">
      <circle cx="12" cy="8" r="3.4" stroke="currentColor" strokeWidth="1.35" />
      <path d="M5.8 19c.5-3.3 2.7-5.2 6.2-5.2s5.7 1.9 6.2 5.2" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" />
    </svg>
  );
}

export function TaavApprovalUserForm({
  users,
  selectedUserId,
  searchValue = '',
  onSearchChange,
  onUserSelect,
  onAddUser,
  addUserLabel = 'ثبت کاربر',
  searchPlaceholder = 'جستجوی کاربر...',
  emptyText = 'کاربری برای نمایش وجود ندارد.',
  disabled = false,
  className,
}: TaavApprovalUserFormProps) {
  const normalizedSearch = searchValue.trim();
  const visibleUsers = normalizedSearch
    ? users.filter((user) => user.name.includes(normalizedSearch))
    : users;

  return (
    <div className={cn('grid gap-[12px]', className)}>
      <div dir="rtl" className="flex items-center gap-[8px]">
        <button
          type="button"
          onClick={onAddUser}
          disabled={disabled || !onAddUser}
          className="inline-flex h-[40px] shrink-0 items-center gap-[8px] rounded-full border-0 bg-[#009b9f] px-[15px] text-[15px] font-bold text-white transition-colors hover:bg-[#00878b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#80cfd2] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span aria-hidden="true" className="text-[25px] font-light leading-none">+</span>
          <span>{addUserLabel}</span>
        </button>
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            type="search"
            value={searchValue}
            onChange={(event) => onSearchChange?.(event.target.value)}
            placeholder={searchPlaceholder}
            disabled={disabled}
            className="h-[40px] w-full appearance-none rounded-full border-0 bg-[#e3e8ee] pb-0 pl-[39px] pr-[14px] pt-0 text-right text-[12px] font-normal text-[#55585b] outline-none placeholder:text-[#767b80] focus:ring-2 focus:ring-[#80cfd2] disabled:opacity-60"
          />
          <span className="pointer-events-none absolute left-[11px] top-1/2 -translate-y-1/2 text-[#92999e]">
            <SearchIcon />
          </span>
        </label>
      </div>

      <div className="grid">
        {visibleUsers.length ? (
          visibleUsers.map((user, index) => {
            const selected = selectedUserId === user.id;
            return (
              <button
                key={user.id}
                type="button"
                onClick={() => onUserSelect?.(user.id)}
                disabled={disabled || !onUserSelect}
                aria-pressed={selected}
                className={cn(
                  'flex min-h-[48px] w-full items-center gap-[10px] border-0 bg-transparent px-[8px] py-[5px] text-right text-[13px] font-normal text-[#55585b] transition-colors hover:bg-[#eceeef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#aeb4b8] disabled:cursor-default',
                  selected && 'bg-[#eceeef]',
                  index > 0 && 'border-t border-solid border-[#d9dcde]',
                )}
              >
                <span className="flex h-[40px] w-[40px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#d2edf0] text-white">
                  {user.avatarUrl ? (
                    <img src={user.avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserIcon />
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">{user.name}</span>
              </button>
            );
          })
        ) : (
          <p className="m-0 py-[72px] text-center text-[14px] font-semibold text-[#666a6d]">{emptyText}</p>
        )}
      </div>
    </div>
  );
}
