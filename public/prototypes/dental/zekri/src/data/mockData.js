export const initialServices = [
  { 
    id: 1, 
    title: 'Facettes Zircone', 
    ar: 'قشور الزركون', 
    price: '75,000 DZD', 
    desc: 'Restauration esthétique de haute précision pour un sourire éclatant.',
    category: 'Esthétique',
    image: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&q=80&w=800'
  },
  { 
    id: 2, 
    title: 'Implants Dentaires', 
    ar: 'زراعة الأسنان', 
    price: '90,000 DZD', 
    desc: 'L\'excellence chirurgicale pour remplacer vos dents avec stabilité.',
    category: 'Chirurgie',
    image: 'https://plus.unsplash.com/premium_photo-1661436629100-ba3c5ea70514?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8SW1wbGFudHMlMjBEZW50YWlyZXN8ZW58MHx8MHx8fDA%3D' 
  },
  { 
    id: 3, 
    title: 'Blanchiment Laser', 
    ar: 'تبييض الأسنان بالليزر', 
    price: '35,000 DZD', 
    desc: 'Technologie de pointe pour des résultats immédiats.',
    category: 'Esthétique',
    image: 'https://plus.unsplash.com/premium_photo-1661751807233-bb72a9dd8f15?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fEJsYW5jaGltZW50JTIwTGFzZXJ8ZW58MHx8MHx8fDA%3D'
  },
];

export const initialAppointments = [
  { 
    id: 1, 
    patient: 'Sarah B.', 
    date: '2026-04-20', 
    time: '14:00', 
    status: 'Confirmé', 
    service: 'Facettes Zircone',
    phone: '+213 550 12 34 56',
    motivation: 'Recherche un sourire parfait pour mon mariage.',
    note: 'Patiente anxieuse, prévoir explication détaillée du processus.'
  },
  { 
    id: 2, 
    patient: 'Karim L.', 
    date: '2026-04-21', 
    time: '10:30', 
    status: 'En attente', 
    service: 'Implants Dentaires',
    phone: '+213 661 98 76 54',
    motivation: 'Souhaite remplacer une molaire manquante.',
    note: 'Zone de soin: Molaire inférieure gauche.'
  },
];

export const initialMessages = [
  {
    id: 1,
    name: 'Amine Djazaïri',
    email: 'amine@email.com',
    subject: 'Demande de devis pour implants',
    message: 'Bonjour Docteur, je souhaiterais avoir une estimation de prix pour la pose de deux implants. Merci.',
    date: '2026-04-19T14:30:00Z'
  },
  {
    id: 2,
    name: 'Lina Bouhired',
    email: 'lina.b@pro.dz',
    subject: 'Partenariat Professionnel',
    message: 'Je suis représentante pour une nouvelle gamme de facettes ultra-fines. Seriez-vous intéressé par une présentation ?',
    date: '2026-04-18T09:15:00Z'
  },
  {
    id: 3,
    name: 'Sofiane Mansouri',
    email: 'sofiane.m@outlook.com',
    subject: 'Urgence : Douleur Intense',
    message: 'Bonjour, j\'ai une dent de sagesse qui me fait terriblement souffrir depuis hier soir. Auriez-vous un créneau en urgence aujourd\'hui ?',
    date: '2026-04-20T08:00:00Z'
  },
  {
    id: 4,
    name: 'Sarah Benali',
    email: 's.benali@gmail.com',
    subject: 'Question sur le Blanchiment Laser',
    message: 'Est-ce que le traitement de blanchiment laser est déconseillé pour les dents sensibles ? Merci pour votre retour.',
    date: '2026-04-17T16:45:00Z'
  },
  {
    id: 5,
    name: 'Dr. Reda Kouider',
    email: 'contact@kouider-dental.dz',
    subject: 'Candidature : Dentiste Collaborateur',
    message: 'Cher confrère, je me permets de vous contacter car j\'admire votre travail esthétique. Je serais intéressé par un poste de collaborateur au sein de votre clinique.',
    date: '2026-04-15T11:20:00Z'
  }
];
