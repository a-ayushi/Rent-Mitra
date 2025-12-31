import React from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook as FacebookIcon,
  Twitter as TwitterIcon,
  Instagram as InstagramIcon,
  LinkedIn as LinkedInIcon
} from '@mui/icons-material';

const FooterLink = ({ to, children }) => (
  <Link to={to} className="text-gray-400 hover:text-white transition-colors duration-300">
    {children}
  </Link>
);

const SocialIcon = ({ children }) => (
  <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
    {children}
  </a>
);

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: 'For Renters',
      links: [
        { text: 'Browse Items', path: '/search' },
        { text: 'How It Works', path: '/how-it-works' },
        { text: 'Safety Guidelines', path: '/safety' },
        { text: 'Rental Insurance', path: '/insurance' },
      ]
    },
    {
      title: 'For Owners',
      links: [
        { text: 'List Your Item', path: '/add-item' },
        { text: 'Pricing Guide', path: '/pricing' },
        { text: 'Owner Protection', path: '/owner-protection' },
        { text: 'Success Stories', path: '/success-stories' },
      ]
    },
    {
      title: 'Support',
      links: [
        { text: 'Help Center', path: '/help' },
        { text: 'Contact Us', path: '/contact' },
        { text: 'Terms of Service', path: '/terms' },
        { text: 'Privacy Policy', path: '/privacy' },
      ]
    }
  ];

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">RENT MITRA</h2>
            <p className="text-gray-400">
              What's yours, share together. Find and rent anything you need.
            </p>
            <div className="flex space-x-4">
              <SocialIcon><FacebookIcon /></SocialIcon>
              <SocialIcon><TwitterIcon /></SocialIcon>
              <SocialIcon><InstagramIcon /></SocialIcon>
              <SocialIcon><LinkedInIcon /></SocialIcon>
            </div>
          </div>
          {footerSections.map(section => (
            <div key={section.title}>
              <h3 className="text-lg font-semibold uppercase tracking-wider">{section.title}</h3>
              <ul className="mt-4 space-y-2">
                {section.links.map(link => (
                  <li key={link.text}>
                    <FooterLink to={link.path}>{link.text}</FooterLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-6 border-t border-gray-800 pt-4 text-center">
          <p className="text-base text-gray-400">
            &copy; {currentYear} Rent Mitra. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
