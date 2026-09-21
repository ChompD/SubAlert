import {
  BookOpen,
  Briefcase,
  Car,
  Cloud,
  Code,
  Dumbbell,
  Gamepad2,
  HeartPulse,
  Music,
  Newspaper,
  Palette,
  ShoppingBag,
  Smartphone,
  Tv,
  Utensils,
  Wifi,
} from 'lucide-react'

// The icons a subscription can have. Generic pictures of what the service is
// FOR, not brand logos, so there are no copyright questions and they all look
// like one family. "letter" is the first letter of the name, the default.
// The key is what gets saved; the label is what screen readers say.
export const SERVICE_ICONS = [
  { key: 'letter', label: 'First letter' },
  { key: 'video', label: 'Video', Icon: Tv },
  { key: 'music', label: 'Music', Icon: Music },
  { key: 'cloud', label: 'Cloud storage', Icon: Cloud },
  { key: 'games', label: 'Games', Icon: Gamepad2 },
  { key: 'news', label: 'News', Icon: Newspaper },
  { key: 'fitness', label: 'Fitness', Icon: Dumbbell },
  { key: 'study', label: 'Study', Icon: BookOpen },
  { key: 'shopping', label: 'Shopping', Icon: ShoppingBag },
  { key: 'work', label: 'Work', Icon: Briefcase },
  { key: 'code', label: 'Developer tools', Icon: Code },
  { key: 'design', label: 'Design', Icon: Palette },
  { key: 'phone', label: 'Phone plan', Icon: Smartphone },
  { key: 'internet', label: 'Internet', Icon: Wifi },
  { key: 'food', label: 'Food', Icon: Utensils },
  { key: 'transport', label: 'Transport', Icon: Car },
  { key: 'health', label: 'Health', Icon: HeartPulse },
]

// Each one maps to a pair of tokens in tokens.css (--icon-blue-bg and -fg).
export const SERVICE_COLORS = [
  { key: 'blue', label: 'Blue' },
  { key: 'green', label: 'Green' },
  { key: 'orange', label: 'Orange' },
  { key: 'red', label: 'Red' },
  { key: 'purple', label: 'Purple' },
  { key: 'gray', label: 'Grey' },
]

export const ICON_KEYS = SERVICE_ICONS.map((icon) => icon.key)
export const COLOR_KEYS = SERVICE_COLORS.map((color) => color.key)

// New subscriptions, and ones saved before icons existed, get these.
export const DEFAULT_ICON = 'letter'
export const DEFAULT_COLOR = 'gray'
