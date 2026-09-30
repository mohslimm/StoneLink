import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, staggerItem } from '../animations/variants'

export default function Contact() {
  const handleSubmit = (e) => {
    e.preventDefault()
    alert('Message envoyé ! Notre équipe vous contactera sous peu.')
  }

  return (
    <div className="bg-[#FAF7F2] pt-24 pb-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-primary to-primary-dark py-20 text-center">
        <div className="container-custom">
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            className="text-[#C9A96E] text-sm font-semibold uppercase tracking-widest font-body mb-3"
          >
            Contactez-nous
          </motion.p>
          <motion.h1
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.1 }}
            className="font-display text-5xl md:text-6xl font-bold text-white mb-4"
          >
            Parlons de votre projet
          </motion.h1>
          <motion.p
            variants={fadeInUp}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-white/70 font-body text-lg max-w-xl mx-auto"
          >
            Besoin d'un devis sur mesure ou d'une assistance ? Nos conseillers sont à votre disposition.
          </motion.p>
        </div>
      </section>

      <div className="container-custom -mt-16">
        <div className="grid lg:grid-cols-3 gap-10">
          {/* Contact Info */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="lg:col-span-1 space-y-6"
          >
            {[
              {
                icon: '📍',
                title: 'Notre Siège',
                content: 'Villa n°03, rue des freres djenadi, Cheraga, Algeria',
                sub: 'Ouvert du Dimanche au Jeudi, 9h-18h',
              },
              {
                icon: '📞',
                title: 'Téléphone',
                content: '+213 541 055 201',
                sub: 'Assistance 24/7 pour les urgences',
              },
              {
                icon: '📧',
                title: 'Email',
                content: 'alibivoyage@outlook.com',
                sub: 'Réponse sous 2h ouvrées',
              },
              {
                icon: '📱',
                title: 'Réseaux Sociaux',
                content: '@alibi_voyage_dz',
                sub: 'Instagram, Facebook, LinkedIn',
              },
            ].map((info, i) => (
              <motion.div
                key={i}
                variants={staggerItem}
                className="bg-white p-6 rounded-3xl shadow-card border border-[#E8E2D9]/50"
              >
                <div className="flex items-start gap-4">
                  <span className="text-3xl">{info.icon}</span>
                  <div>
                    <h3 className="font-display text-lg font-bold text-[#0A0A0F] mb-1">{info.title}</h3>
                    <p className="font-body text-[#0A0A0F] font-semibold">{info.content}</p>
                    <p className="text-sm font-body text-[#0A0A0F]/50 mt-1">{info.sub}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white p-10 rounded-[40px] shadow-premium"
          >
            <h2 className="font-display text-3xl font-bold text-[#0A0A0F] mb-8">
              Envoyez-nous un message
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">Nom complet</label>
                  <input
                    type="text"
                    required
                    className="w-full px-5 py-4 bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl focus:outline-none focus:border-primary transition-all font-body"
                    placeholder="Votre nom"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">Email</label>
                  <input
                    type="email"
                    required
                    className="w-full px-5 py-4 bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl focus:outline-none focus:border-primary transition-all font-body"
                    placeholder="votre@email.com"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">Téléphone</label>
                  <input
                    type="tel"
                    required
                    className="w-full px-5 py-4 bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl focus:outline-none focus:border-primary transition-all font-body"
                    placeholder="+213 --- -- -- --"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">Sujet</label>
                  <select className="w-full px-5 py-4 bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl focus:outline-none focus:border-primary transition-all font-body appearance-none">
                    <option>Demande de devis</option>
                    <option>Assistance réservation</option>
                    <option>Partenariat</option>
                    <option>Autre</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#0A0A0F]/70 mb-2 font-body">Message</label>
                <textarea
                  required
                  rows="5"
                  className="w-full px-5 py-4 bg-[#FAF7F2] border border-[#E8E2D9] rounded-2xl focus:outline-none focus:border-primary transition-all font-body resize-none"
                  placeholder="Comment pouvons-nous vous aider ?"
                ></textarea>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full py-5 bg-primary text-white rounded-2xl font-bold font-body text-lg hover:bg-primary-dark transition-all shadow-premium"
              >
                Envoyer le message
              </motion.button>
            </form>
          </motion.div>
        </div>
      </div>

      {/* Map Section */}
      <section className="container-custom mt-20">
        <div className="h-[400px] rounded-[40px] overflow-hidden shadow-card border-4 border-white">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d12789.702758414436!2d3.0489!3d36.7723!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x128fb2f768406795%3A0x600f68e0d37e5e!2sAlgiers%20Centre%2C%20Algiers!5e0!3m2!1sen!2sdz!4v1650000000000!5m2!1sen!2sdz"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </section>
    </div>
  )
}
