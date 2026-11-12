import clsx from 'clsx';
import { Icon } from '../Icon';
import styles from './Avatar.module.scss';

const COLORS = ['#ff516a', '#ffa85c', '#665fff', '#54cb68', '#28c9b7', '#2a9ef1', '#d669ed'];

type AvatarProps = {
  name: string;
  seed: string;
  size?: 'medium' | 'large';
  className?: string;
};

function getInitials(name: string) {
  const words = name.split(/\s+/).filter((word) => /^\p{L}/u.test(word));
  return words
    .slice(0, 2)
    .map((word) => Array.from(word)[0])
    .join('')
    .toUpperCase();
}

function getColor(seed: string) {
  let sum = 0;
  for (const char of seed) sum += char.charCodeAt(0);
  return COLORS[sum % COLORS.length];
}

export function Avatar({ name, seed, size = 'large', className }: AvatarProps) {
  const initials = getInitials(name);

  return (
    <div
      className={clsx(styles.avatar, styles[size], className)}
      style={{ backgroundColor: getColor(seed) }}
      aria-hidden
    >
      {initials || <Icon name="user" size={size === 'large' ? 28 : 22} />}
    </div>
  );
}
