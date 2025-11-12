import { Link } from 'react-router-dom';
import { Music, Phone, Mail, MapPin, Facebook, Instagram, Youtube } from 'lucide-react';
import { contactInfo } from '../../data/content';

const Footer = () => {
  const quickLinks = [
    { name: 'Home', path: '/' },
    { name: 'Studios', path: '/studios' },
    { name: 'Services', path: '/services' },
    { name: 'Rate Card', path: '/rates' },
    { name: 'How to Book', path: '/how-to-book' },
    { name: 'Contact', path: '/contact' },
  ];

  const legalLinks = [
    { name: 'Guidelines', path: '/guidelines' },
    { name: 'FAQ', path: '/faq' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <footer className="bg-secondary-900 text-secondary-300">
      <div className="container-custom py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                <Music className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Resonance</h3>
                <p className="text-xs text-secondary-400">Sinhgad Road, Pune</p>
              </div>
            </div>
            <p className="text-sm">
              Professional recording and rehearsal studios in Pune. Book your studio session today!
            </p>

            {/* Social Links */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-secondary-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>

              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-secondary-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Instagram className="w-4 h-4" />
              </a>

              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-secondary-800 hover:bg-primary-600 flex items-center justify-center transition-colors"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Information</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-sm hover:text-primary-400 transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-5 h-5 flex-shrink-0 mt-0.5 text-primary-400" />
                <span>
                  {contactInfo.address.line1}, {contactInfo.address.line2}, {contactInfo.address.city} - {contactInfo.address.pincode}
                </span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-5 h-5 flex-shrink-0 text-primary-400" />
                <a href={`tel:${contactInfo.phone[0].number}`} className="hover:text-primary-400 transition-colors">
                  {contactInfo.phone[0].number}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-5 h-5 flex-shrink-0 text-primary-400" />
                <a href={`mailto:${contactInfo.email}`} className="hover:text-primary-400 transition-colors">
                  {contactInfo.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-secondary-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-center md:text-left">
            © {new Date().getFullYear()} Resonance Studio. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm">
            <Link to="/guidelines" className="hover:text-primary-400 transition-colors">
              Privacy Policy
            </Link>
            <Link to="/guidelines" className="hover:text-primary-400 transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
