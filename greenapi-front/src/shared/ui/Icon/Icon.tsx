import { icons, type IconName } from './icons';

type IconProps = {
  name: IconName;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 24, className }: IconProps) {
  const Svg = icons[name];
  return <Svg width={size} height={size} className={className} aria-hidden />;
}
