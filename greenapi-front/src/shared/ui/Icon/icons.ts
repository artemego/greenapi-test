import Alert from '@/shared/assets/icons/alert.svg?react';
import ArrowLeft from '@/shared/assets/icons/arrow-left.svg?react';
import CheckDouble from '@/shared/assets/icons/check-double.svg?react';
import Check from '@/shared/assets/icons/check.svg?react';
import ChevronDown from '@/shared/assets/icons/chevron-down.svg?react';
import Clock from '@/shared/assets/icons/clock.svg?react';
import Close from '@/shared/assets/icons/close.svg?react';
import EyeOff from '@/shared/assets/icons/eye-off.svg?react';
import Eye from '@/shared/assets/icons/eye.svg?react';
import Info from '@/shared/assets/icons/info.svg?react';
import Logout from '@/shared/assets/icons/logout.svg?react';
import More from '@/shared/assets/icons/more.svg?react';
import Plus from '@/shared/assets/icons/plus.svg?react';
import Retry from '@/shared/assets/icons/retry.svg?react';
import Search from '@/shared/assets/icons/search.svg?react';
import Send from '@/shared/assets/icons/send.svg?react';
import Trash from '@/shared/assets/icons/trash.svg?react';
import User from '@/shared/assets/icons/user.svg?react';

export const icons = {
  alert: Alert,
  arrowLeft: ArrowLeft,
  check: Check,
  checkDouble: CheckDouble,
  chevronDown: ChevronDown,
  clock: Clock,
  close: Close,
  eye: Eye,
  eyeOff: EyeOff,
  info: Info,
  logout: Logout,
  more: More,
  plus: Plus,
  retry: Retry,
  search: Search,
  send: Send,
  trash: Trash,
  user: User,
};

export type IconName = keyof typeof icons;
