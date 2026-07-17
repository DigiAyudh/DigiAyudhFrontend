import { Link } from 'react-router-dom';

import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { APP_CONFIG } from '../../config/navigation';
import { footerLinks } from '@/constants/landing.data';

export function PublicFooter() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg">
            <img
              src="/digiayudh-logo.jpeg"
              alt="DigiAyudh Logo"
              className="h-8 w-8 rounded-lg object-cover"
            />
          </div>
              <span className="text-lg font-bold">{APP_CONFIG.name}</span>
            </Link>
            <p className="mt-4 text-sm text-muted-foreground">{APP_CONFIG.description}</p>
            <p className="mt-2 text-xs font-medium text-purple-400">{APP_CONFIG.tagline}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Services</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link}>
                  <a
                    href="#services"
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link}>
                  <a href="#contact" className="text-sm text-muted-foreground hover:text-foreground">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Resources</h4>
            <ul className="mt-4 space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {APP_CONFIG.name}. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://x.com/DidiAyudh" aria-label="Twitter" className="text-muted-foreground hover:text-foreground">
              <FaTwitter className="size-5" />
            </a>
            <a href="https://www.linkedin.com/company/135225527" aria-label="LinkedIn" className="text-muted-foreground hover:text-foreground">
              <FaLinkedin className="size-5" />
            </a>
            <a href="https://github.com/orgs/DigiAyudh" aria-label="GitHub" className="text-muted-foreground hover:text-foreground">
              <FaGithub className="size-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
