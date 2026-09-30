import { create } from 'zustand'

const EXTRAS = [
  { id: 'assurance', label: 'Assurance annulation', price: 8000 },
  { id: 'transfer', label: 'Transferts privés', price: 12000 },
  { id: 'breakfast', label: 'Petit-déjeuner inclus', price: 6000 },
  { id: 'guide', label: 'Guide francophone privé', price: 15000 },
  { id: 'lounge', label: 'Accès salon VIP aéroport', price: 5000 },
]

export const useBookingStore = create((set, get) => ({
  destination: null,
  step: 1,
  stepDirection: 'forward', // 'forward' | 'backward'

  // Step 1: dates & travelers
  departureDate: '',
  returnDate: '',
  adults: 2,
  children: 0,
  departureCity: 'ALG',

  // Step 2: extras
  selectedExtras: [],
  extras: EXTRAS,

  // Step 3: personal info
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  address: '',

  // Step 4: payment (mock)
  paymentMethod: 'card',

  // Computed
  get totalPrice() {
    const dest = get().destination
    const adults = get().adults
    const children = get().children
    const extras = get().selectedExtras
    if (!dest) return 0
    const base = dest.price * (adults + children * 0.5)
    const extraTotal = extras.reduce((acc, id) => {
      const found = EXTRAS.find((e) => e.id === id)
      return acc + (found ? found.price : 0)
    }, 0)
    return base + extraTotal
  },

  // Actions
  setDestination: (destination) => set({ destination }),

  setStep: (step) => {
    const current = get().step
    set({ step, stepDirection: step > current ? 'forward' : 'backward' })
  },

  nextStep: () => {
    const step = get().step
    if (step < 4) set({ step: step + 1, stepDirection: 'forward' })
  },

  prevStep: () => {
    const step = get().step
    if (step > 1) set({ step: step - 1, stepDirection: 'backward' })
  },

  setField: (key, value) => set({ [key]: value }),

  toggleExtra: (id) => {
    const curr = get().selectedExtras
    set({
      selectedExtras: curr.includes(id)
        ? curr.filter((e) => e !== id)
        : [...curr, id],
    })
  },

  reset: () => set({
    step: 1,
    stepDirection: 'forward',
    departureDate: '',
    returnDate: '',
    adults: 2,
    children: 0,
    departureCity: 'ALG',
    selectedExtras: [],
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'card',
  }),
}))
