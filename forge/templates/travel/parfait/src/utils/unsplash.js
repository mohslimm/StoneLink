// ─── Unsplash Image Utility ───────────────────
// Uses curated static Unsplash photo IDs for reliability
// (source.unsplash.com/featured/ was deprecated in 2022)

const PHOTO_MAP = {
  'istanbul,turkey,travel':       'photo-1520250497591-112f2f40a3f4', // Istanbul Grand Bazaar
  'dubai,skyline,luxury':         'photo-1512453979798-5ea266f8880c', // Dubai Burj Khalifa
  'paris,eiffel,travel':          'photo-1502602898657-3e91760cbb34', // Paris Eiffel
  'maldives,ocean,luxury':        'photo-1514282401047-d79a71a590e8', // Maldives overwater
  'rome,colosseum,italy':         'photo-1552832230-c0197dd311b5', // Rome Colosseum
  'barcelona,spain,travel':       'photo-1539037116277-4db20889f2d4', // Barcelona
  'london,big-ben,england':       'photo-1513635269975-59663e0ac1ad', // London
  'new-york,manhattan,city':      'photo-1485871981521-5b1fd3805eee', // New York
  'tokyo,japan,city':             'photo-1540959733332-eab4deabeeaf', // Tokyo
  'santorini,greece,island':      'photo-1570077188670-e3a8d69ac5ff', // Santorini
  'bali,indonesia,temple':        'photo-1537996194471-e657df975ab4', // Bali
  'marrakech,morocco,souk':       'photo-1539020140153-e479b8c27aa6', // Marrakech
  'cairo,egypt,pyramid':          'photo-1553913861-c0fddf2619ee', // Cairo Pyramids
  'madrid,spain,travel':          'photo-1543785734-4b6e564642f8', // Madrid
  'amsterdam,netherlands,canal':  'photo-1534351590666-13e3e96b5902', // Amsterdam
  'hero,travel,aerial':           'photo-1469854523086-cc02fe5d8800', // Hero aerial travel
  'travel,luxury,vacation':       'photo-1476514525535-07fb3b4ae5f1', // Luxury vacation
}

const BASE_URL = 'https://images.unsplash.com'

/**
 * Get an Unsplash image URL for a given query keyword
 * @param {string} query - A key from PHOTO_MAP or a fallback
 * @param {number} w - Width
 * @param {number} h - Height
 */
export function getImg(query, w = 800, h = 600) {
  const photoId = PHOTO_MAP[query]
  if (photoId) {
    return `${BASE_URL}/${photoId}?auto=format&fit=crop&w=${w}&h=${h}&q=80`
  }
  // Fallback: use a random travel image
  return `${BASE_URL}/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=${w}&h=${h}&q=80`
}

export default getImg
