import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants'
import { getImg } from '../utils/unsplash'
import { WaveDivider } from '../components/ui/WaveDivider'

export default function About() {
  return (
    <div className="bg-[#FAF7F2] pt-24">
      {/* Hero */}
      <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-[#0A0A0F]">
        <img
          src={getImg('algiers,casbah,travel', 1600, 900)}
          className="absolute inset-0 w-full h-full object-cover opacity-50 kenburns"
          alt="Notre Histoire"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0F]/60 via-transparent to-[#0A0A0F]/90" />
        
        <div className="container-custom relative z-10 text-center">
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest font-body mb-4"
          >
            Qui sommes-nous ?
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-7xl font-bold text-white mb-6"
          >
            Notre Passion,<br />Votre Destination.
          </motion.h1>
        </div>
      </section>

      {/* Intro Story */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="font-display text-4xl font-bold text-[#0A0A0F] mb-6">
                Une vision née à Alger, pour explorer le monde.
              </h2>
              <div className="space-y-4 text-[#0A0A0F]/70 font-body text-lg leading-relaxed">
                <p>
                  Fondée en 2012, <span className="font-semibold text-primary">Alibi Voyage</span> est née d'une volonté simple : offrir aux voyageurs algériens une expérience de voyage premium, sans compromis sur la qualité et la transparence.
                </p>
                <p>
                  Nous ne sommes pas juste une agence de voyage. Nous sommes des architectes d'expériences. De la Casbah d'Alger aux gratte-ciels de Dubaï, des plages de Turquie aux temples de Bali, nous sélectionnons chaque destination avec une attention méticuleuse.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-8 mt-10">
                <div>
                  <p className="font-display text-4xl font-bold text-primary">12+</p>
                  <p className="text-sm font-body text-[#0A0A0F]/50">Années d'excellence</p>
                </div>
                <div>
                  <p className="font-display text-4xl font-bold text-primary">50k+</p>
                  <p className="text-sm font-body text-[#0A0A0F]/50">Rêves réalisés</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[40px] overflow-hidden shadow-premium">
                <img
                  src={getImg('travel,team,office', 800, 1000)}
                  className="w-full h-full object-cover"
                  alt="L'équipe Parfait Voyage"
                />
              </div>
              {/* Floating element */}
              <div className="absolute -bottom-10 -left-10 bg-white p-8 rounded-3xl shadow-premium max-w-xs hidden sm:block">
                <p className="font-body text-[#0A0A0F]/70 italic">
                  "Notre mission est de rendre le monde accessible à chaque algérien, avec le confort et la sérénité qu'il mérite."
                </p>
                <p className="mt-4 font-display font-bold text-[#0A0A0F]">Directeur Général</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="bg-[#0A0A0F] py-24 relative overflow-hidden">
        {/* Background shapes */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#006233]/10 rounded-full blur-3xl -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#C9A96E]/5 rounded-full blur-3xl -ml-48 -mb-48" />

        <div className="container-custom relative z-10">
          <div className="text-center mb-16">
            <p className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest font-body mb-3">
              Nos Valeurs
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white">
              L'ADN de Alibi Voyage
            </h2>
          </div>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                title: 'Transparence',
                desc: 'Des prix clairs en Dinars Algériens, sans frais cachés ni mauvaises surprises au moment du départ.',
                icon: '👁️',
              },
              {
                title: 'Excellence',
                desc: 'Hébergements 4* et 5*, guides experts et vols réguliers : nous ne transigeons jamais sur votre confort.',
                icon: '💎',
              },
              {
                title: 'Proximité',
                desc: 'Que vous soyez à Alger, Oran ou Constantine, nos conseillers sont à votre écoute 24h/24 et 7j/7.',
                icon: '🤝',
              },
            ].map((value, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="bg-white/5 backdrop-blur-sm border border-white/10 p-10 rounded-[32px] hover:bg-white/10 transition-colors"
              >
                <span className="text-5xl mb-6 block">{value.icon}</span>
                <h3 className="font-display text-2xl font-bold text-white mb-4">{value.title}</h3>
                <p className="text-white/60 font-body leading-relaxed">{value.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-24 text-center">
        <div className="container-custom">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="font-display text-4xl font-bold text-[#0A0A0F] mb-6">
              Rejoignez l'aventure
            </h2>
            <p className="text-[#0A0A0F]/60 font-body text-lg mb-10">
              Découvrez pourquoi des milliers d'algériens nous choisissent pour leurs moments les plus précieux.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="/destinations"
                className="px-8 py-4 bg-primary text-white rounded-2xl font-bold font-body text-lg hover:bg-primary-light transition-all shadow-premium"
              >
                Explorer nos offres
              </a>
              <a
                href="/contact"
                className="px-8 py-4 border-2 border-[#0A0A0F] text-[#0A0A0F] rounded-2xl font-bold font-body text-lg hover:bg-[#0A0A0F] hover:text-white transition-all"
              >
                Nous contacter
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
