import { Link } from 'react-router-dom';

const Navigation = () => {
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Studios', path: '/studios' },
    { name: 'Rate Card', path: '/rates' },
    { name: 'Services', path: '/services' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'How to Book', path: '/how-to-book' },
    { name: 'Guidelines', path: '/guidelines' },
    { name: 'About', path: '/about' },
    { name: 'FAQ', path: '/faq' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <nav className="hidden lg:flex items-center gap-1">
      {navLinks.map((link) => (
        <Link
          key={link.path}
          to={link.path}
          className="px-3 py-2 rounded-lg text-sm font-medium text-secondary-700 dark:text-secondary-300 hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-colors"
        >
          {link.name}
        </Link>
      ))}
    </nav>
  );
};

export default Navigation;