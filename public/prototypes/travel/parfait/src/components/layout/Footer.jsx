import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { staggerContainer, staggerItem } from '../../animations/variants'

const footerLinks = {
  Destinations: [
    { label: 'Istanbul',    path: '/destinations/1' },
    { label: 'Dubaï',       path: '/destinations/2' },
    { label: 'Paris',       path: '/destinations/3' },
    { label: 'Maldives',   path: '/destinations/4' },
    { label: 'Barcelone',  path: '/destinations/6' },
  ],
  Services: [
    { label: 'Voyages sur mesure', path: '/destinations' },
    { label: 'Lune de miel',       path: '/destinations?cat=Romantique' },
    { label: 'Voyages d\'affaires', path: '/destinations' },
    { label: 'Groupes & Familles', path: '/destinations' },
    { label: 'Excursions locales', path: '/destinations' },
  ],
  Agence: [
    { label: 'À propos',    path: '/' },
    { label: 'Contact',     path: '/' },
    { label: 'Blog voyage', path: '/' },
    { label: 'FAQ',         path: '/' },
    { label: 'Partenaires', path: '/' },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#0A0A0F] text-white">
      {/* Top accent stripe — Alibi Voyage colors */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-primary-light" />

      <div className="container-custom py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                </svg>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-display font-semibold text-white text-lg">Alibi</span>
                <span className="font-display text-accent text-xs tracking-[0.2em] uppercase">Voyage</span>
              </div>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-6 max-w-xs font-body">
              Agence de voyage basée à Chéraga, Alger. Spécialisée dans les circuits organisés vers Istanbul, Zanzibar, Malaisie, Bali et Dubaï.
            </p>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-accent text-lg font-arabic">عليبي فويـاج</span>
            </div>
            <p className="text-white/40 text-xs font-body">Agrément ONAT N° 2024-0847</p>

            {/* Social */}
            <div className="flex items-center gap-3 mt-6">
              {['facebook', 'instagram', 'whatsapp', 'linkedin'].map((social) => (
                <a
                  key={social}
                  href="#"
                  className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary/20 hover:border-primary transition-all duration-200"
                  data-cursor="pointer"
                >
                  <span className="sr-only">{social}</span>
                  <SocialIcon name={social} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h3 className="font-semibold text-white text-sm uppercase tracking-wider mb-5 font-body">
                {title}
              </h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.path}
                      className="text-white/50 hover:text-[#C9A96E] text-sm font-body transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div className="mt-12 pt-10 border-t border-white/8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-xl font-semibold text-white mb-1">
                Nos offres exclusives dans votre boîte mail
              </h3>
              <p className="text-white/50 text-sm font-body">
                Inscrivez-vous pour recevoir nos meilleures offres en avant-première.
              </p>
            </div>
            <form
              onSubmit={(e) => e.preventDefault()}
              className="flex items-center gap-2 w-full md:w-auto"
            >
              <input
                type="email"
                placeholder="votre@email.com"
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm placeholder:text-white/30 focus:outline-none focus:border-primary flex-1 md:w-64 font-body"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-primary text-white rounded-xl text-sm font-medium hover:bg-primary-light transition-colors"
              >
                S'inscrire
              </button>
            </form>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-8 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-xs font-body">
            © {new Date().getFullYear()} Alibi Voyage. Tous droits réservés. Chéraga, Alger.
          </p>
          <div className="flex items-center gap-6">
            {['Politique de confidentialité', 'CGV', 'Mentions légales'].map((item) => (
              <a key={item} href="#" className="text-white/30 hover:text-white/60 text-xs font-body transition-colors">
                {item}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ name }) {
  const icons = {
    facebook:  <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z"/>,
    instagram: <><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></>,
    whatsapp:  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/>,
    linkedin:  <><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></>,
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-white/60">
      {icons[name]}
    </svg>
  )
}
