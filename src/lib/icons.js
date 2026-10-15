import {
  Sparkles, FileText, Image, Share2, PanelTop, Palette, Layers, Printer, BookOpen,
  Camera, Megaphone, Package, Shirt, Star, Gift, Briefcase,
} from 'lucide-react'

export const ICONS = {
  Sparkles, FileText, Image, Share2, PanelTop, Palette, Layers, Printer, BookOpen,
  Camera, Megaphone, Package, Shirt, Star, Gift, Briefcase,
}
export const ICON_NAMES = Object.keys(ICONS)
export const getIcon = (name) => ICONS[name] || Sparkles
