import type { FC } from 'react';
import { HeaderClient } from './header-client';

interface HeaderProps {
  title?: string;
  className?: string;
}

const Header: FC<HeaderProps> = async ({
  title = 'My App',
  className = '',
}) => {
  return <HeaderClient title={title} className={className} />;
};

export default Header;
