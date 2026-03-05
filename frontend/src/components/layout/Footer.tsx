import Link from 'next/link';
import { t } from '@/i18n';
import { Heart, Mail, MapPin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="relative border-t border-white/40 bg-gradient-to-b from-white/60 to-[#fdfcfb]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Heart size={28} fill="#9333ea" className="text-[#9333ea]" />
              <p className="text-xl font-black tracking-tight text-slate-900">
                {t('common.appName')}
              </p>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {t('home.footerDesc')}
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9333ea] mb-4">
              {t('common.explore')}
            </p>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/missions" 
                  className="text-sm text-slate-700 hover:text-[#9333ea] transition-colors font-semibold"
                >
                  {t('nav.besoins')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/offers" 
                  className="text-sm text-slate-700 hover:text-[#9333ea] transition-colors font-semibold"
                >
                  {t('nav.propositions')}
                </Link>
              </li>
              <li>
                <Link 
                  href="/faq" 
                  className="text-sm text-slate-700 hover:text-[#9333ea] transition-colors font-semibold"
                >
                  {t('nav.faq')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9333ea] mb-4">
              Informations
            </p>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about" 
                  className="text-sm text-slate-700 hover:text-[#9333ea] transition-colors font-semibold"
                >
                  À propos
                </Link>
              </li>
              <li>
                <Link 
                  href="/terms" 
                  className="text-sm text-slate-700 hover:text-[#9333ea] transition-colors font-semibold"
                >
                  Conditions
                </Link>
              </li>
              <li>
                <Link 
                  href="/privacy" 
                  className="text-sm text-slate-700 hover:text-[#9333ea] transition-colors font-semibold"
                >
                  Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#9333ea] mb-4">
              Contact
            </p>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-slate-700 font-semibold">
                <Mail size={16} className="text-[#9333ea]" />
                <a href="mailto:contact@entraidance.fr" className="hover:text-[#9333ea] transition-colors">
                  contact@entraidance.fr
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-slate-700 font-semibold">
                <MapPin size={16} className="text-[#9333ea]" />
                <span>Marseille, France</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-slate-300/60 to-transparent mb-6" />

        {/* Copyright */}
        <div className="text-center">
          <p className="text-sm text-slate-600 font-medium">
            &copy; {new Date().getFullYear()} {t('common.appName')} — {t('common.tagline')}
          </p>
        </div>
      </div>
    </footer>
  );
}
