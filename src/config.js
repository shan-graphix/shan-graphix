// The only account allowed into the admin area.
// (Also enforced in firestore.rules and storage.rules, which is what really protects your data.)
export const ADMIN_EMAIL = 'vimukthih55@gmail.com'

// Sign the admin out after this much inactivity.
export const IDLE_LOGOUT_MS = 30 * 60 * 1000

export const CATEGORIES = ['Logo', 'Flyer', 'Poster', 'Social media', 'Banner', 'Other']

export const STATUSES = [
  { id: 'new', label: 'New', color: '#B90D0D' },
  { id: 'progress', label: 'In progress', color: '#D98A00' },
  { id: 'review', label: 'In review', color: '#2F6FE4' },
  { id: 'delivered', label: 'Delivered', color: '#1F9D55' },
]

// Shown until you save your own details in Admin > Settings.
export const DEFAULT_SETTINGS = {
  tagline: 'Designs that get you noticed.',
  intro: 'Logos, flyers, posters and social media designs, made to look sharp and ready to print or post.',
  about:
    'Shan Graphix is a graphic design studio in Sri Lanka. We design logos, flyers, posters and social media posts for businesses, schools and events, and we deliver files ready to print or share.',
  phone: '',
  whatsapp: '',
  email: '',
  location: 'Sri Lanka',
  hours: '',
  instagram: '',
  facebook: '',
  tiktok: '',
  services: [
    { id: 's1', icon: 'Sparkles', title: 'Logo design', desc: 'A clean, memorable logo with files for print and web.', price: '' },
    { id: 's2', icon: 'FileText', title: 'Flyer design', desc: 'Eye-catching flyers and leaflets for events and offers.', price: '' },
    { id: 's3', icon: 'Image', title: 'Poster design', desc: 'Posters that stand out, sized for print.', price: '' },
    { id: 's4', icon: 'Share2', title: 'Social media posts', desc: 'Matching post and story designs for your page.', price: '' },
    { id: 's5', icon: 'PanelTop', title: 'Banner and cover', desc: 'Banners, covers and thumbnails for every platform.', price: '' },
  ],
}
