// Neo-Brutalism Design System for ETH Delhi Hackathon
// Bold, high-contrast, modern design with sharp edges and striking visuals

import { Platform } from 'react-native';

export const NeoBrutalismColors = {
  // Primary Brand Colors
  primary: '#0000FF', // Base Blue
  primaryDark: '#0000CC', // Darker shade of Base Blue
  primaryLight: '#3333FF', // Lighter shade of Base Blue

  // Secondary Colors
  secondary: '#0000FF', // Base Blue (reusing for consistency as per request)
  secondaryDark: '#0000CC',
  secondaryLight: '#3333FF',

  // Accent Colors
  accent: '#0000FF', // Base Blue
  accentDark: '#0000CC',
  accentLight: '#3333FF',

  // Warning & Status Colors
  warning: '#FF9500', // Orange (keeping existing)
  error: '#FF3B30', // Red (keeping existing)
  success: '#34C759', // Green (keeping existing)

  // Background Colors - User Palette
  background: '#0A0B0D', // Black
  backgroundAlt: '#32353D', // Gray 80
  surface: '#0A0B0D', // Black (Cards same as background for minimal look, or use Gray 80)
  surfaceAlt: '#32353D', // Gray 80

  // Text Colors
  text: '#FFFFFF', // White
  textPrimary: '#FFFFFF', // White
  textSecondary: '#B1B7C3', // Gray 30
  textTertiary: '#717886', // Gray 50
  textInverse: '#000000', // Black text for primary buttons / light backgrounds

  // Border Colors
  border: '#0000FF', // Base Blue
  borderAlt: '#717886', // Gray 50
  borderSubtle: '#5B616E', // Gray 60

  // Shadow Colors
  shadow: '#0000FF', // Base Blue
  shadowAlt: '#0000FF', // Base Blue
  shadowDark: '#0A0B0D', // Black
};

export const NeoBrutalismTypography = {
  // Font Weights - Bold and Heavy
  weights: {
    regular: '400',
    medium: '600',
    bold: '800', // Extra bold for impact
    heavy: '900', // Maximum weight
  },

  // Font Sizes - Hierarchical Scale
  sizes: {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18,
    xxl: 24,
    xxxl: 32,
    display: 48, // Large display text
    hero: 64, // Hero text for impact
  },

  // Line Heights - Tight for impact
  lineHeights: {
    tight: 1.1,
    normal: 1.2,
    relaxed: 1.4,
  },
};

export const NeoBrutalismSpacing = {
  // Spacing Scale - Bold and Generous
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64,
  huge: 96, // Extra large spacing for impact
};

export const NeoBrutalismBorders = {
  // Border Widths - Thick and Bold
  thin: 1,
  medium: 2,
  thick: 3, // 3px to match web --border-thick
  heavy: 6, // Extra thick for Neo-Brutalism

  // Border Radius - Sharp edges with occasional rounded elements
  none: 0,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
  round: 999, // For pills/circles
};

export const NeoBrutalismShadows = {
  // Dramatic Shadows - Offset and Colored
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    ...Platform.select({
      web: { boxShadow: 'none' },
    }),
  },

  // Neo-Brutalism signature: offset colored shadows
  brutal: {
    shadowColor: '#0000FF', // Base Blue
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0, // Sharp shadows, no blur
    elevation: 8,
    ...Platform.select({
      web: { boxShadow: '6px 6px 0px 0px #0000FF' },
    }),
  },

  // Added for Button Styles
  brutalWhite: {
    shadowColor: '#FFFFFF', // White Shadow
    shadowOffset: { width: 8, height: 8 }, // 8px for buttons
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
    ...Platform.select({
      web: { boxShadow: '8px 8px 0px 0px #FFFFFF' },
    }),
  },

  brutalBlue: {
    shadowColor: '#0000FF', // Base Blue Shadow
    shadowOffset: { width: 8, height: 8 }, // 8px for buttons
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 10,
    ...Platform.select({
      web: { boxShadow: '8px 8px 0px 0px #0000FF' },
    }),
  },

  brutalAlt: {
    shadowColor: NeoBrutalismColors.secondary,
    shadowOffset: { width: 6, height: 6 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 12,
    ...Platform.select({
      web: { boxShadow: `6px 6px 0px 0px ${NeoBrutalismColors.secondary}` },
    }),
  },

  brutalHeavy: {
    shadowColor: NeoBrutalismColors.accent,
    shadowOffset: { width: 8, height: 8 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 16,
    ...Platform.select({
      web: { boxShadow: `8px 8px 0px 0px ${NeoBrutalismColors.accent}` },
    }),
  },

  // Traditional shadows for subtle elements
  soft: {
    shadowColor: NeoBrutalismColors.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    ...Platform.select({
      web: { boxShadow: `0px 2px 4px 0px ${NeoBrutalismColors.shadowDark}` }, // Simplified approx
    }),
  },
};

export const NeoBrutalismAnimations = {
  // Animation Durations - Snappy and Responsive
  fast: 150,
  normal: 250,
  slow: 350,

  // Easing Functions - Sharp and Impactful
  easing: {
    linear: 'linear',
    easeIn: 'ease-in',
    easeOut: 'ease-out',
    easeInOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy effect
  },
};

// Component-specific styles for consistency
export const NeoBrutalismComponents = {
  button: {
    primary: {
      backgroundColor: NeoBrutalismColors.primary,
      borderColor: NeoBrutalismColors.primary,
      borderWidth: NeoBrutalismBorders.thick,
      borderRadius: NeoBrutalismBorders.md,
      ...NeoBrutalismShadows.brutal,
    },
    secondary: {
      backgroundColor: NeoBrutalismColors.secondary,
      borderColor: NeoBrutalismColors.secondary,
      borderWidth: NeoBrutalismBorders.thick,
      borderRadius: NeoBrutalismBorders.md,
      ...NeoBrutalismShadows.brutalAlt,
    },
    outline: {
      backgroundColor: 'transparent',
      borderColor: NeoBrutalismColors.primary,
      borderWidth: NeoBrutalismBorders.thick,
      borderRadius: NeoBrutalismBorders.md,
    },
  },

  card: {
    primary: {
      backgroundColor: NeoBrutalismColors.surface,
      borderColor: NeoBrutalismColors.border,
      borderWidth: NeoBrutalismBorders.thick,
      borderRadius: NeoBrutalismBorders.lg,
      ...NeoBrutalismShadows.brutal,
    },
    accent: {
      backgroundColor: NeoBrutalismColors.surfaceAlt,
      borderColor: NeoBrutalismColors.borderAlt,
      borderWidth: NeoBrutalismBorders.thick,
      borderRadius: NeoBrutalismBorders.lg,
      ...NeoBrutalismShadows.brutalAlt,
    },
  },

  input: {
    primary: {
      backgroundColor: NeoBrutalismColors.surface,
      borderColor: NeoBrutalismColors.border,
      borderWidth: NeoBrutalismBorders.thick,
      borderRadius: NeoBrutalismBorders.md,
      color: NeoBrutalismColors.textPrimary,
    },
  },
};

// Gradient definitions for modern look
export const NeoBrutalismGradients = {
  primary: ['#007AFF', '#0056CC', '#003D99'],
  secondary: ['#5856D6', '#4A4AB8', '#3C3C9A'],
  accent: ['#00C7FF', '#0099CC', '#006B99'],
  cyber: ['#007AFF', '#00C7FF', '#5856D6'], // Multi-color blue gradient
  light: ['#FFFFFF', '#F8F9FA', '#F1F3F4'],
};

export default {
  colors: NeoBrutalismColors,
  typography: NeoBrutalismTypography,
  spacing: NeoBrutalismSpacing,
  borders: NeoBrutalismBorders,
  shadows: NeoBrutalismShadows,
  animations: NeoBrutalismAnimations,
  components: NeoBrutalismComponents,
  gradients: NeoBrutalismGradients,
};
