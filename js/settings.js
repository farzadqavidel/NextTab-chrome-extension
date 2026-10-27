const SettingsUI = (() => {
  const THEMES = {
    midnight: {
      nameKey: 'themeMidnight',
      accent: '#6366f1',
      dark: {
        '--bg-card': 'rgba(17, 25, 52, 0.5)',
        '--bg-card-hover': 'rgba(26, 38, 74, 0.6)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#eef2ff',
        '--text-secondary': 'rgba(199, 210, 254, 0.6)',
        '--accent': '#6366f1',
        '--accent-hover': '#818cf8',
        '--border': 'rgba(148, 163, 184, 0.16)',
        '--search-bg': 'rgba(13, 20, 45, 0.55)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(12, 17, 36, 0.9)',
        '--cal-today': '#6366f1',
        '--cal-friday': '#fb7185',
        '--cal-holiday': '#fb7185'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#f4f5fb',
        '--text-primary': '#1e293b',
        '--text-secondary': '#64748b',
        '--accent': '#6366f1',
        '--accent-hover': '#818cf8',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#6366f1',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#f8fafc'
      }
    },
    ocean: {
      nameKey: 'themeOcean',
      accent: '#06b6d4',
      dark: {
        '--bg-card': 'rgba(7, 38, 58, 0.5)',
        '--bg-card-hover': 'rgba(10, 52, 78, 0.6)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#ecfeff',
        '--text-secondary': 'rgba(165, 243, 252, 0.55)',
        '--accent': '#06b6d4',
        '--accent-hover': '#22d3ee',
        '--border': 'rgba(125, 211, 252, 0.15)',
        '--search-bg': 'rgba(6, 32, 50, 0.55)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(7, 26, 40, 0.9)',
        '--cal-today': '#06b6d4',
        '--cal-friday': '#fb7185',
        '--cal-holiday': '#fb7185'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#f0fdfa',
        '--text-primary': '#134e4a',
        '--text-secondary': '#64748b',
        '--accent': '#06b6d4',
        '--accent-hover': '#0891b2',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#06b6d4',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#f0fdfa'
      }
    },
    forest: {
      nameKey: 'themeForest',
      accent: '#22c55e',
      dark: {
        '--bg-card': 'rgba(6, 40, 26, 0.48)',
        '--bg-card-hover': 'rgba(10, 56, 36, 0.58)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#ecfdf5',
        '--text-secondary': 'rgba(167, 243, 208, 0.5)',
        '--accent': '#22c55e',
        '--accent-hover': '#4ade80',
        '--border': 'rgba(134, 239, 172, 0.15)',
        '--search-bg': 'rgba(5, 34, 20, 0.55)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(8, 30, 20, 0.9)',
        '--cal-today': '#22c55e',
        '--cal-friday': '#fbbf24',
        '--cal-holiday': '#fbbf24'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#f0fdf4',
        '--text-primary': '#14532d',
        '--text-secondary': '#64748b',
        '--accent': '#22c55e',
        '--accent-hover': '#16a34a',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#22c55e',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#f0fdf4'
      }
    },
    lavender: {
      nameKey: 'themeLavender',
      accent: '#a78bfa',
      dark: {
        '--bg-card': 'rgba(38, 22, 70, 0.5)',
        '--bg-card-hover': 'rgba(54, 34, 96, 0.6)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#f5f3ff',
        '--text-secondary': 'rgba(196, 181, 253, 0.55)',
        '--accent': '#a78bfa',
        '--accent-hover': '#c4b5fd',
        '--border': 'rgba(196, 181, 253, 0.16)',
        '--search-bg': 'rgba(32, 18, 60, 0.55)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(26, 16, 52, 0.9)',
        '--cal-today': '#a78bfa',
        '--cal-friday': '#f472b6',
        '--cal-holiday': '#f472b6'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#faf5ff',
        '--text-primary': '#4c1d95',
        '--text-secondary': '#64748b',
        '--accent': '#a78bfa',
        '--accent-hover': '#8b5cf6',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#a78bfa',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#faf5ff'
      }
    },
    sunset: {
      nameKey: 'themeSunset',
      accent: '#fb7185',
      dark: {
        '--bg-card': 'rgba(60, 16, 26, 0.5)',
        '--bg-card-hover': 'rgba(84, 24, 36, 0.6)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#fff1f2',
        '--text-secondary': 'rgba(254, 205, 211, 0.55)',
        '--accent': '#fb7185',
        '--accent-hover': '#fda4af',
        '--border': 'rgba(253, 164, 175, 0.16)',
        '--search-bg': 'rgba(52, 12, 22, 0.55)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(42, 10, 18, 0.9)',
        '--cal-today': '#fb7185',
        '--cal-friday': '#fbbf24',
        '--cal-holiday': '#fbbf24'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#fff1f2',
        '--text-primary': '#881337',
        '--text-secondary': '#64748b',
        '--accent': '#f43f5e',
        '--accent-hover': '#e11d48',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#f43f5e',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#fff1f2'
      }
    },
    crimson: {
      nameKey: 'themeCrimson',
      accent: '#ef4444',
      dark: {
        '--bg-card': 'rgba(56, 14, 14, 0.5)',
        '--bg-card-hover': 'rgba(78, 20, 20, 0.6)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#fef2f2',
        '--text-secondary': 'rgba(254, 202, 202, 0.55)',
        '--accent': '#ef4444',
        '--accent-hover': '#f87171',
        '--border': 'rgba(252, 165, 165, 0.16)',
        '--search-bg': 'rgba(48, 12, 12, 0.55)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(38, 10, 10, 0.9)',
        '--cal-today': '#ef4444',
        '--cal-friday': '#fbbf24',
        '--cal-holiday': '#fbbf24'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#fef2f2',
        '--text-primary': '#7f1d1d',
        '--text-secondary': '#64748b',
        '--accent': '#dc2626',
        '--accent-hover': '#b91c1c',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#dc2626',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#fef2f2'
      }
    },
    amber: {
      nameKey: 'themeAmber',
      accent: '#f59e0b',
      dark: {
        '--bg-card': 'rgba(56, 34, 6, 0.5)',
        '--bg-card-hover': 'rgba(78, 48, 10, 0.6)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#fffbeb',
        '--text-secondary': 'rgba(253, 230, 138, 0.55)',
        '--accent': '#f59e0b',
        '--accent-hover': '#fbbf24',
        '--border': 'rgba(252, 211, 77, 0.16)',
        '--search-bg': 'rgba(48, 30, 6, 0.55)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(38, 24, 6, 0.9)',
        '--cal-today': '#f59e0b',
        '--cal-friday': '#fb7185',
        '--cal-holiday': '#fb7185'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#fffbeb',
        '--text-primary': '#78350f',
        '--text-secondary': '#64748b',
        '--accent': '#d97706',
        '--accent-hover': '#b45309',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#d97706',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#fffbeb'
      }
    },
    emerald: {
      nameKey: 'themeEmerald',
      accent: '#10b981',
      dark: {
        '--bg-card': 'rgba(4, 46, 38, 0.5)',
        '--bg-card-hover': 'rgba(6, 64, 52, 0.6)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#ecfdf5',
        '--text-secondary': 'rgba(167, 243, 208, 0.55)',
        '--accent': '#10b981',
        '--accent-hover': '#34d399',
        '--border': 'rgba(110, 231, 183, 0.16)',
        '--search-bg': 'rgba(4, 38, 32, 0.55)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(3, 32, 26, 0.9)',
        '--cal-today': '#10b981',
        '--cal-friday': '#fbbf24',
        '--cal-holiday': '#fbbf24'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#ecfdf5',
        '--text-primary': '#065f46',
        '--text-secondary': '#64748b',
        '--accent': '#059669',
        '--accent-hover': '#047857',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#059669',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#ecfdf5'
      }
    },
    rose: {
      nameKey: 'themeRose',
      accent: '#ec4899',
      dark: {
        '--bg-card': 'rgba(58, 12, 40, 0.5)',
        '--bg-card-hover': 'rgba(80, 18, 56, 0.6)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#fdf2f8',
        '--text-secondary': 'rgba(251, 207, 232, 0.55)',
        '--accent': '#ec4899',
        '--accent-hover': '#f472b6',
        '--border': 'rgba(249, 168, 212, 0.16)',
        '--search-bg': 'rgba(50, 10, 34, 0.55)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(40, 8, 28, 0.9)',
        '--cal-today': '#ec4899',
        '--cal-friday': '#fbbf24',
        '--cal-holiday': '#fbbf24'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#fdf2f8',
        '--text-primary': '#831843',
        '--text-secondary': '#64748b',
        '--accent': '#db2777',
        '--accent-hover': '#be185d',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#db2777',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#fdf2f8'
      }
    },
    slate: {
      nameKey: 'themeSlate',
      accent: '#94a3b8',
      dark: {
        '--bg-card': 'rgba(24, 30, 42, 0.55)',
        '--bg-card-hover': 'rgba(34, 42, 58, 0.65)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#f1f5f9',
        '--text-secondary': 'rgba(203, 213, 225, 0.55)',
        '--accent': '#94a3b8',
        '--accent-hover': '#cbd5e1',
        '--border': 'rgba(148, 163, 184, 0.16)',
        '--search-bg': 'rgba(20, 26, 36, 0.6)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(16, 21, 30, 0.92)',
        '--cal-today': '#94a3b8',
        '--cal-friday': '#f87171',
        '--cal-holiday': '#f87171'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#f1f5f9',
        '--text-primary': '#1e293b',
        '--text-secondary': '#64748b',
        '--accent': '#475569',
        '--accent-hover': '#334155',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#475569',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#f1f5f9'
      }
    },
    coffee: {
      nameKey: 'themeCoffee',
      accent: '#c08457',
      dark: {
        '--bg-card': 'rgba(45, 30, 22, 0.52)',
        '--bg-card-hover': 'rgba(62, 42, 30, 0.62)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#faf3ec',
        '--text-secondary': 'rgba(232, 213, 196, 0.55)',
        '--accent': '#c08457',
        '--accent-hover': '#d9a377',
        '--border': 'rgba(192, 132, 87, 0.18)',
        '--search-bg': 'rgba(38, 25, 18, 0.58)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(30, 20, 14, 0.92)',
        '--cal-today': '#c08457',
        '--cal-friday': '#e8a87c',
        '--cal-holiday': '#e8a87c'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#faf3ec',
        '--text-primary': '#4a2f1c',
        '--text-secondary': '#64748b',
        '--accent': '#a56b3d',
        '--accent-hover': '#8a5730',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#a56b3d',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#faf3ec'
      }
    },
    cyberpunk: {
      nameKey: 'themeCyberpunk',
      accent: '#f0f',
      dark: {
        '--bg-card': 'rgba(28, 8, 46, 0.55)',
        '--bg-card-hover': 'rgba(42, 12, 66, 0.65)',
        '--surface-muted': 'rgba(255, 255, 255, 0.05)',
        '--text-primary': '#f5e9ff',
        '--text-secondary': 'rgba(233, 213, 255, 0.6)',
        '--accent': '#f0f',
        '--accent-hover': '#ff6bff',
        '--border': 'rgba(255, 0, 255, 0.2)',
        '--search-bg': 'rgba(22, 6, 38, 0.6)',
        '--tile-bg': 'rgba(255, 255, 255, 0.055)',
        '--input-bg': 'rgba(255, 255, 255, 0.06)',
        '--panel-bg': 'rgba(18, 5, 32, 0.92)',
        '--cal-today': '#f0f',
        '--cal-friday': '#00f0ff',
        '--cal-holiday': '#00f0ff'
      },
      light: {
        '--bg-card': '#ffffff',
        '--bg-card-hover': '#ffffff',
        '--surface-muted': '#faf5ff',
        '--text-primary': '#4a044e',
        '--text-secondary': '#64748b',
        '--accent': '#c026d3',
        '--accent-hover': '#a21caf',
        '--border': 'rgba(0, 0, 0, 0.06)',
        '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)',
        '--search-bg': '#ffffff',
        '--cal-today': '#c026d3',
        '--cal-friday': '#ef4444',
        '--tile-bg': '#ffffff',
        '--input-bg': '#faf5ff'
      }
    },
    glass: {
      nameKey: 'themeGlass',
      accent: '#38bdf8',
      dark: {
        '--bg-card': 'rgba(255, 255, 255, 0.075)',
        '--bg-card-hover': 'rgba(255, 255, 255, 0.13)',
        '--surface-muted': 'rgba(255, 255, 255, 0.06)',
        '--text-primary': '#f8fafc',
        '--text-secondary': 'rgba(226, 232, 240, 0.66)',
        '--accent': '#38bdf8',
        '--accent-hover': '#7dd3fc',
        '--border': 'rgba(255, 255, 255, 0.14)',
        '--search-bg': 'rgba(255, 255, 255, 0.08)',
        '--cal-today': '#38bdf8',
        '--cal-friday': '#fb7185',
        '--cal-holiday': '#fb7185',
        '--tile-bg': 'rgba(255, 255, 255, 0.08)',
        '--input-bg': 'rgba(255, 255, 255, 0.07)',
        '--panel-bg': 'rgba(13, 19, 32, 0.82)'
      },
      light: {
        '--bg-card': 'rgba(255, 255, 255, 0.48)',
        '--bg-card-hover': 'rgba(255, 255, 255, 0.58)',
        '--surface-muted': 'rgba(255, 255, 255, 0.38)',
        '--text-primary': '#0f172a',
        '--text-secondary': '#475569',
        '--accent': '#0ea5e9',
        '--accent-hover': '#0284c7',
        '--border': 'rgba(255, 255, 255, 0.55)',
        '--shadow': '0 8px 32px rgba(0, 0, 0, 0.08)',
        '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.14)',
        '--search-bg': 'rgba(255, 255, 255, 0.58)',
        '--cal-today': '#0ea5e9',
        '--cal-friday': '#ef4444',
        '--tile-bg': 'rgba(255, 255, 255, 0.5)',
        '--input-bg': 'rgba(255, 255, 255, 0.42)'
      }
    }
  };

  const GRADIENTS = {
    midnight: 'radial-gradient(ellipse 120% 100% at 20% 0%, rgba(99, 102, 241, 0.32), transparent 55%), radial-gradient(ellipse 100% 90% at 80% 100%, rgba(49, 46, 129, 0.55), transparent 60%), linear-gradient(160deg, #0b1030 0%, #131a44 55%, #0a0e26 100%)',
    ocean: 'radial-gradient(ellipse 120% 100% at 80% 0%, rgba(34, 211, 238, 0.2), transparent 55%), radial-gradient(ellipse 110% 90% at 15% 100%, rgba(8, 145, 178, 0.25), transparent 60%), linear-gradient(165deg, #041e2e 0%, #083344 55%, #052434 100%)',
    aurora: 'radial-gradient(ellipse 100% 80% at 10% 10%, rgba(167, 139, 250, 0.28), transparent 55%), radial-gradient(ellipse 110% 90% at 90% 20%, rgba(45, 212, 191, 0.18), transparent 55%), radial-gradient(ellipse 120% 100% at 50% 110%, rgba(99, 102, 241, 0.22), transparent 60%), linear-gradient(180deg, #0d0a26 0%, #151032 60%, #0b1626 100%)',
    sunset: 'radial-gradient(ellipse 110% 90% at 80% 0%, rgba(251, 113, 133, 0.2), transparent 55%), radial-gradient(ellipse 120% 100% at 15% 100%, rgba(249, 115, 22, 0.2), transparent 55%), linear-gradient(160deg, #2a0a12 0%, #431407 60%, #1c0a06 100%)',
    forest: 'radial-gradient(ellipse 120% 100% at 20% 0%, rgba(52, 211, 153, 0.16), transparent 55%), radial-gradient(ellipse 100% 90% at 85% 100%, rgba(21, 128, 61, 0.22), transparent 60%), linear-gradient(165deg, #04150d 0%, #0a2b1c 55%, #04150d 100%)',
    lavender: 'radial-gradient(ellipse 120% 100% at 20% 0%, rgba(167, 139, 250, 0.24), transparent 55%), radial-gradient(ellipse 100% 90% at 85% 100%, rgba(217, 70, 239, 0.14), transparent 55%), linear-gradient(160deg, #170b33 0%, #2b1555 55%, #150a2e 100%)',
    crimson: 'radial-gradient(ellipse 110% 90% at 20% 0%, rgba(239, 68, 68, 0.22), transparent 55%), radial-gradient(ellipse 120% 100% at 85% 100%, rgba(190, 18, 60, 0.22), transparent 60%), linear-gradient(160deg, #240609 0%, #3f0d12 55%, #1a0507 100%)',
    amber: 'radial-gradient(ellipse 110% 90% at 80% 0%, rgba(245, 158, 11, 0.2), transparent 55%), radial-gradient(ellipse 120% 100% at 15% 100%, rgba(180, 83, 9, 0.22), transparent 60%), linear-gradient(160deg, #201406 0%, #3a2408 55%, #180f04 100%)',
    emerald: 'radial-gradient(ellipse 110% 90% at 25% 0%, rgba(16, 185, 129, 0.2), transparent 55%), radial-gradient(ellipse 120% 100% at 85% 100%, rgba(5, 150, 105, 0.2), transparent 60%), linear-gradient(165deg, #04231c 0%, #063a2e 55%, #031a15 100%)',
    rose: 'radial-gradient(ellipse 110% 90% at 20% 0%, rgba(236, 72, 153, 0.22), transparent 55%), radial-gradient(ellipse 120% 100% at 85% 100%, rgba(219, 39, 119, 0.2), transparent 60%), linear-gradient(160deg, #250a1c 0%, #3d0f2c 55%, #1a0714 100%)',
    slate: 'radial-gradient(ellipse 120% 90% at 15% 0%, rgba(148, 163, 184, 0.14), transparent 55%), radial-gradient(ellipse 100% 80% at 85% 100%, rgba(100, 116, 139, 0.16), transparent 55%), linear-gradient(170deg, #0f141c 0%, #1b2230 55%, #0c1017 100%)',
    coffee: 'radial-gradient(ellipse 110% 90% at 25% 0%, rgba(192, 132, 87, 0.2), transparent 55%), radial-gradient(ellipse 120% 100% at 85% 100%, rgba(120, 72, 40, 0.24), transparent 60%), linear-gradient(160deg, #1d1310 0%, #33221a 55%, #150e0a 100%)',
    cyberpunk: 'radial-gradient(ellipse 100% 80% at 10% 10%, rgba(255, 0, 255, 0.24), transparent 55%), radial-gradient(ellipse 110% 90% at 90% 20%, rgba(0, 240, 255, 0.18), transparent 55%), radial-gradient(ellipse 120% 100% at 50% 110%, rgba(124, 58, 237, 0.24), transparent 60%), linear-gradient(180deg, #0b0418 0%, #180a2e 60%, #060312 100%)',
    mono: 'radial-gradient(ellipse 120% 90% at 20% 0%, rgba(255, 255, 255, 0.07), transparent 55%), linear-gradient(180deg, #0a0a0a 0%, #151515 55%, #050505 100%)',
    night: 'radial-gradient(ellipse 120% 90% at 15% 0%, rgba(99, 102, 241, 0.16), transparent 55%), radial-gradient(ellipse 100% 80% at 85% 100%, rgba(56, 189, 248, 0.10), transparent 55%), linear-gradient(180deg, #05070f 0%, #0a0f1e 45%, #101527 100%)'
  };

  const WALLPAPERS = {
    nature: [
      { id: '26748', url: 'https://4kwallpapers.com/images/wallpapers/stac-a-phris-arch-1920x1080-26748.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26748.jpg' },
      { id: '26444', url: 'https://4kwallpapers.com/images/wallpapers/lunar-tides-1920x1080-26444.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26444.jpg' },
      { id: '26357', url: 'https://4kwallpapers.com/images/wallpapers/mountain-peaks-teal-1920x1080-26357.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26357.jpg' },
      { id: '26446', url: 'https://4kwallpapers.com/images/wallpapers/black-volcanic-sand-1920x1080-26446.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26446.jpg' }
    ],
    space: [
      { id: '26741', url: 'https://4kwallpapers.com/images/wallpapers/europa-jupiter-moon-1920x1080-26741.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26741.jpg' },
      { id: '26342', url: 'https://4kwallpapers.com/images/wallpapers/planet-earth-dark-1920x1080-26342.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26342.jpg' },
      { id: '26344', url: 'https://4kwallpapers.com/images/wallpapers/moon-dark-1920x1080-26344.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26344.jpg' },
      { id: '26347', url: 'https://4kwallpapers.com/images/wallpapers/mars-red-planet-1920x1080-26347.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26347.jpg' }
    ],
    minimal: [
      { id: '26734', url: 'https://4kwallpapers.com/images/wallpapers/metallic-abstract-1920x1080-26734.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26734.jpg' },
      { id: '26307', url: 'https://4kwallpapers.com/images/wallpapers/lone-tree-1920x1080-26307.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26307.jpg' },
      { id: '26517', url: 'https://4kwallpapers.com/images/wallpapers/zenitsu-agatsuma-1920x1080-26517.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26517.jpg' },
      { id: '26106', url: 'https://4kwallpapers.com/images/wallpapers/marshmello-material-1920x1080-26106.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26106.jpg' }
    ],
    anime: [
      { id: '26719', url: 'https://4kwallpapers.com/images/wallpapers/sakamoto-days-1920x1080-26719.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26719.jpg' },
      { id: '26732', url: 'https://4kwallpapers.com/images/wallpapers/lumine-intertwined-1920x1080-26732.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26732.jpg' },
      { id: '26691', url: 'https://4kwallpapers.com/images/wallpapers/pain-nagato-black-1920x1080-26691.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26691.jpg' },
      { id: '26716', url: 'https://4kwallpapers.com/images/wallpapers/reze-selfie-1920x1080-26716.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26716.jpg' }
    ],
    cars: [
      { id: '26722', url: 'https://4kwallpapers.com/images/wallpapers/genesis-magma-gt3-1920x1080-26722.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26722.jpg' },
      { id: '26727', url: 'https://4kwallpapers.com/images/wallpapers/bugatti-w16-mistral-1920x1080-26727.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26727.jpg' },
      { id: '26704', url: 'https://4kwallpapers.com/images/wallpapers/audi-nuvolari-super-1920x1080-26704.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26704.jpg' },
      { id: '26708', url: 'https://4kwallpapers.com/images/wallpapers/bmw-m-concept-neue-1920x1080-26708.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26708.jpg' }
    ],
    abstract: [
      { id: '26737', url: 'https://4kwallpapers.com/images/wallpapers/microsoft-surface-1920x1080-26737.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26737.jpg' },
      { id: '26735', url: 'https://4kwallpapers.com/images/wallpapers/microsoft-surface-1920x1080-26735.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26735.jpg' },
      { id: '26687', url: 'https://4kwallpapers.com/images/wallpapers/huawei-gradient-1920x1080-26687.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26687.jpg' },
      { id: '26686', url: 'https://4kwallpapers.com/images/wallpapers/huawei-dark-mode-1920x1080-26686.jpg', thumb: 'https://4kwallpapers.com/images/walls/thumbs/26686.jpg' }
    ]
  };

  const WALLPAPER_CATEGORY_KEYS = {
    nature: 'wpNature',
    space: 'wpSpace',
    minimal: 'wpMinimal',
    anime: 'wpAnime',
    cars: 'wpCars',
    abstract: 'wpAbstract'
  };

  const BASE_DARK_VARS = {
    '--surface-muted': 'rgba(255, 255, 255, 0.06)',
    '--tile-bg': 'rgba(255, 255, 255, 0.07)',
    '--input-bg': 'rgba(255, 255, 255, 0.07)',
    '--panel-bg': 'rgba(13, 19, 32, 0.9)',
    '--shadow': '0 1px 2px rgba(2, 6, 23, 0.25), 0 12px 32px -8px rgba(2, 6, 23, 0.45)',
    '--shadow-hover': '0 2px 4px rgba(2, 6, 23, 0.3), 0 20px 48px -12px rgba(2, 6, 23, 0.55)'
  };

  let settingsPanelsRendered = false;

  function ensureSettingsPanels() {
    if (settingsPanelsRendered) return;
    settingsPanelsRendered = true;
    renderThemeGrid();
    renderGradientGrid();
    renderWallpaperGallery();
  }

  function init() {
    document.getElementById('btn-settings').addEventListener('click', openSettings);
    setupTabs();
    setupBackgroundControls();
    setupLanguageToggle();
    setupPerfModeControls();
    setupLocationControls();
    setupGoogleServicesControls();
    setupTopSitesControls();
    setupFeedControls();
    setupExtraControls();
    setupBackupControls();
    setupAboutPanel();
  }

  function setupAboutPanel() {
    const el = document.getElementById('about-version-number');
    if (!el) return;
    try {
      const manifest = chrome.runtime.getManifest();
      el.textContent = manifest.version || '';
    } catch (err) {
      el.textContent = '';
    }
  }

  function openSettings() {
    ensureSettingsPanels();
    syncControlsFromSettings();
    renderGoogleServicesSettings();
    DashboardLayoutUI.renderSettings();
    document.getElementById('modal-settings').classList.remove('hidden');
  }

  function setupTabs() {
    document.querySelectorAll('.settings-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.settings-tab').forEach((t) => t.classList.remove('active'));
        document.querySelectorAll('.settings-panel').forEach((p) => p.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById('panel-' + tab.dataset.tab).classList.add('active');
      });
    });
  }

  function setupLanguageToggle() {
    document.querySelectorAll('.lang-btn:not(.onboarding-lang-btn):not(.perf-mode-btn)').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await I18n.setLanguage(btn.dataset.lang);
        updateLanguageButtons(btn.dataset.lang);
      });
    });
  }

  function updateLanguageButtons(lang) {
    document.querySelectorAll('.lang-btn:not(.onboarding-lang-btn):not(.perf-mode-btn)').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
    });
  }

  function applyPerfMode(mode) {
    const resolved = mode || Storage.getSettings().perfMode || 'auto';
    if (window.TabyarPerf) {
      TabyarPerf.apply(resolved);
    }
  }

  function updatePerfModeButtons(mode) {
    document.querySelectorAll('.perf-mode-btn').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.perfMode === mode);
    });
  }

  function setupPerfModeControls() {
    document.querySelectorAll('.perf-mode-btn').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const mode = btn.dataset.perfMode;
        await Storage.updateSettings({ perfMode: mode });
        applyPerfMode(mode);
        updatePerfModeButtons(mode);
      });
    });
  }

  let settingsLocationPicker = null;
  let settingsLocation2Picker = null;

  function buildLocationLabel(settings) {
    return [settings.city, settings.country].filter(Boolean).join(getSeparator());
  }

  function getSeparator() {
    return I18n.getRegionalLang() === 'fa' ? '، ' : ', ';
  }

  function buildStoredLocationData(s, prefix = '') {
    const city = prefix ? s.secondCity : s.city;
    const country = prefix ? s.secondCountry : s.country;
    const label = prefix ? buildSecondLocationLabel(s) : buildLocationLabel(s);
    if (!label) return null;

    return {
      name: city,
      country,
      countryCode: prefix ? s.secondCountryCode : s.countryCode,
      lat: prefix ? s.secondLocationLat : s.locationLat,
      lon: prefix ? s.secondLocationLon : s.locationLon,
      timezone: prefix ? s.secondTimezone : s.timezone,
      label
    };
  }

  async function refreshLocationLabels() {
    syncLocationDisplay();
    syncSecondLocationDisplay();
  }

  function syncLocationDisplay() {
    const s = Storage.getSettings();
    if (s.locationLat == null || s.locationLon == null) {
      settingsLocationPicker?.clear();
      return;
    }

    settingsLocationPicker?.setDisplay(buildLocationLabel(s), buildStoredLocationData(s));
  }

  function getCalendarTypeLabel(calendarType) {
    const map = {
      jalali: 'calendarJalali',
      gregorian: 'calendarGregorian',
      hijri: 'calendarHijri'
    };
    return I18n.t(map[calendarType] || 'calendarJalali');
  }

  function updateCalendarTypeHint(calendarType) {
    const el = document.getElementById('setting-calendar-type-hint');
    if (!el) return;
    const type = calendarType || Storage.getSettings().calendarType || 'jalali';
    el.textContent = `${I18n.t('calendarType')}: ${getCalendarTypeLabel(type)} — ${I18n.t('calendarTypeAuto')}`;
  }

  function initSettingsLocationPicker() {
    settingsLocationPicker = LocationPicker.attach({
      inputId: 'setting-location-search',
      listId: 'setting-location-suggestions',
      hiddenId: 'setting-location-data',
      onSelect: (item) => updateCalendarTypeHint(RegionHelper.calendarTypeForCountry(item.countryCode))
    });
  }

  function buildSecondLocationLabel(settings) {
    return [settings.secondCity, settings.secondCountry].filter(Boolean).join(getSeparator());
  }

  function syncSecondLocationDisplay() {
    const s = Storage.getSettings();
    if (s.secondLocationLat == null || s.secondLocationLon == null) {
      settingsLocation2Picker?.clear();
      return;
    }

    settingsLocation2Picker?.setDisplay(buildSecondLocationLabel(s), buildStoredLocationData(s, 'second'));
  }

  function initSettingsLocation2Picker() {
    settingsLocation2Picker = LocationPicker.attach({
      inputId: 'setting-location2-search',
      listId: 'setting-location2-suggestions',
      hiddenId: 'setting-location2-data'
    });
  }

  function setupLocationControls() {
    initSettingsLocationPicker();
    initSettingsLocation2Picker();
    document.getElementById('btn-save-location').addEventListener('click', saveLocationSettings);
    document.getElementById('btn-save-location2').addEventListener('click', saveSecondLocationSettings);
    document.getElementById('btn-clear-location2').addEventListener('click', clearSecondLocationSettings);
  }

  async function saveSecondLocationSettings() {
    const selected = settingsLocation2Picker?.getSelected();
    if (!selected) {
      TabyarUI.alert(I18n.t('selectFromSuggestions'), { type: 'warning' });
      return;
    }

    await WeatherUI.applySecondLocation(selected);
    TabyarUI.alert(I18n.t('secondLocationSaved'), { type: 'success' });
  }

  async function clearSecondLocationSettings() {
    await WeatherUI.clearSecondLocation();
    settingsLocation2Picker?.clear();
  }

  async function saveLocationSettings() {
    const input = document.getElementById('setting-location-search');
    if (!input.value.trim()) {
      await Storage.updateSettings({
        country: '',
        city: '',
        countryCode: '',
        timezone: '',
        locationLat: null,
        locationLon: null,
        calendarType: 'jalali'
      });
      settingsLocationPicker?.clear();
      CalendarUI.refresh();
      WeatherUI.reload();
      updateCalendarTypeHint('jalali');
      return;
    }

    const selected = settingsLocationPicker?.getSelected();
    if (!selected) {
      TabyarUI.alert(I18n.t('selectFromSuggestions'), { type: 'warning' });
      return;
    }

    await WeatherUI.applyLocation(selected);
    updateCalendarTypeHint();
    TabyarUI.alert(I18n.t('locationSaved'), { type: 'success' });
  }

  function setupGoogleServicesControls() {
    document.getElementById('toggle-google-services-visible').addEventListener('change', async (e) => {
      await Storage.updateSettings({ googleServicesVisible: e.target.checked });
      GoogleServicesUI.render();
      renderGoogleServicesSettings();
    });
  }

  function setupTopSitesControls() {
    const toggle = document.getElementById('toggle-top-sites-visible');
    if (toggle) {
      toggle.addEventListener('change', async (e) => {
        await Storage.updateSettings({ topSitesVisible: e.target.checked });
        TopSitesUI.render();
      });
    }

    const restoreBtn = document.getElementById('btn-restore-top-sites');
    if (restoreBtn) {
      restoreBtn.addEventListener('click', async () => {
        await TopSitesUI.restoreAll();
        TabyarUI.alert(I18n.t('topSitesRestored'), { type: 'success' });
      });
    }
  }

  function setupFeedControls() {
    const newsToggle = document.getElementById('toggle-news-visible');
    if (newsToggle) {
      newsToggle.addEventListener('change', async (e) => {
        await Storage.updateSettings({ newsVisible: e.target.checked });
        Feeds.applyVisibility();
        if (e.target.checked) NewsUI.load(false);
      });
    }
    const pricesToggle = document.getElementById('toggle-prices-visible');
    if (pricesToggle) {
      pricesToggle.addEventListener('change', async (e) => {
        await Storage.updateSettings({ pricesVisible: e.target.checked });
        Feeds.applyVisibility();
        if (e.target.checked) PricesUI.load();
      });
    }
  }

  function setupExtraControls() {
    const floating = document.getElementById('toggle-floating-bookmark');
    floating?.addEventListener('change', async (event) => {
      await Storage.updateSettings({ floatingBookmarkButton: event.target.checked });
    });

    document.querySelectorAll('.digits-style-btn').forEach((button) => {
      button.addEventListener('click', async () => {
        const style = button.dataset.digitsStyle;
        await Storage.updateSettings({ persianDigits: style });
        document.querySelectorAll('.digits-style-btn').forEach((item) => item.classList.toggle('active', item.dataset.digitsStyle === style));
        CalendarUI.refresh();
        TasksUI.render();
        TasksUI.renderFocus();
        PersonalEventsUI.render();
      });
    });
  }

  function renderGoogleServicesSettings() {
    const container = document.getElementById('google-services-settings');
    if (!container) return;

    const enabled = new Set(GoogleServicesUI.getEnabledServices());
    const visible = Storage.getSettings().googleServicesVisible !== false;
    container.classList.toggle('is-disabled', !visible);

    container.innerHTML = GoogleServicesUI.getServices().map((service) => `
      <label class="service-toggle">
        <input type="checkbox" data-service-id="${service.id}" ${enabled.has(service.id) ? 'checked' : ''} ${visible ? '' : 'disabled'}>
        <span>${I18n.t(service.nameKey)}</span>
      </label>
    `).join('');

    container.querySelectorAll('input[data-service-id]').forEach((checkbox) => {
      checkbox.addEventListener('change', async () => {
        const current = new Set(GoogleServicesUI.getEnabledServices());
        if (checkbox.checked) current.add(checkbox.dataset.serviceId);
        else current.delete(checkbox.dataset.serviceId);
        await Storage.updateSettings({ enabledGoogleServices: [...current] });
        GoogleServicesUI.render();
      });
    });
  }

  function renderThemeGrid() {
    const grid = document.getElementById('theme-grid');
    const settings = Storage.getSettings();

    grid.innerHTML = Object.entries(THEMES).map(([key, theme]) => {
      const preview = key === 'glass'
        ? 'linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(56,189,248,0.35) 100%)'
        : theme.accent;
      return `
        <button class="theme-card ${settings.theme === key ? 'active' : ''}" data-theme="${key}">
          <div class="theme-preview ${key === 'glass' ? 'theme-preview-glass' : ''}" style="background: ${preview}"></div>
          <span>${I18n.t(theme.nameKey)}</span>
        </button>
      `;
    }).join('');

    grid.querySelectorAll('.theme-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const themeKey = card.dataset.theme;
        await Storage.updateSettings({ theme: themeKey });
        grid.querySelectorAll('.theme-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        applyTheme(themeKey);
      });
    });
  }

  function renderGradientGrid() {
    const grid = document.getElementById('gradient-grid');
    const settings = Storage.getSettings();

    grid.innerHTML = Object.entries(GRADIENTS).map(([key, gradient]) => `
      <button class="gradient-card ${settings.bgGradient === key ? 'active' : ''}"
              data-gradient="${key}"
              style="background: ${gradient}"
              title="${key}"></button>
    `).join('');

    grid.querySelectorAll('.gradient-card').forEach((card) => {
      card.addEventListener('click', async () => {
        await Storage.updateSettings({ bgGradient: card.dataset.gradient, bgType: 'gradient' });
        grid.querySelectorAll('.gradient-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        document.querySelector('input[name="bg-type"][value="gradient"]').checked = true;
        showBgOptions('gradient');
        await applyBackground();
      });
    });
  }

  function updateColorPickerUI(color) {
    const normalized = (color || '#000000').toLowerCase();
    const picker = document.getElementById('bg-color-picker');
    const preview = document.getElementById('bg-color-preview');
    const hexEl = document.getElementById('bg-color-hex');
    if (picker) picker.value = normalized;
    if (preview) preview.style.background = normalized;
    if (hexEl) hexEl.textContent = normalized.toUpperCase();
    document.querySelectorAll('.color-preset').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.color.toLowerCase() === normalized);
    });
  }

  function renderWallpaperGallery() {
    const container = document.getElementById('wallpaper-gallery');
    if (!container) return;

    const settings = Storage.getSettings();
    container.innerHTML = Object.entries(WALLPAPERS).map(([category, items]) => `
      <div class="wallpaper-category">
        <h5 class="wallpaper-category-title">${I18n.t(WALLPAPER_CATEGORY_KEYS[category])}</h5>
        <div class="wallpaper-grid">
          ${items.map((wallpaper) => `
            <button type="button"
                    class="wallpaper-card ${settings.bgImage === wallpaper.url ? 'active' : ''}"
                    data-url="${wallpaper.url}"
                    style="background-image:url('${wallpaper.thumb}')"
                    title="${I18n.t(WALLPAPER_CATEGORY_KEYS[category])}"></button>
          `).join('')}
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.wallpaper-card').forEach((card) => {
      card.addEventListener('click', async () => {
        const url = card.dataset.url;
        card.classList.add('loading');
        await Storage.updateSettings({ bgImage: url, bgType: 'image' });
        document.getElementById('bg-image-url').value = url;
        document.querySelector('input[name="bg-type"][value="image"]').checked = true;
        showBgOptions('image');
        container.querySelectorAll('.wallpaper-card').forEach((c) => c.classList.remove('active'));
        card.classList.add('active');
        try {
          await applyBackground();
        } finally {
          card.classList.remove('loading');
        }
      });
    });
  }

  function updateWallpaperSelection(url) {
    document.querySelectorAll('.wallpaper-card').forEach((card) => {
      card.classList.toggle('active', card.dataset.url === url);
    });
  }

  function setupBackgroundControls() {
    document.querySelectorAll('input[name="bg-type"]').forEach((radio) => {
      radio.addEventListener('change', async (e) => {
        await Storage.updateSettings({ bgType: e.target.value });
        showBgOptions(e.target.value);
        await applyBackground();
      });
    });

    document.getElementById('bg-color-picker').addEventListener('input', async (e) => {
      const color = e.target.value;
      updateColorPickerUI(color);
      await Storage.updateSettings({ bgColor: color });
      await applyBackground();
    });

    document.querySelectorAll('.color-preset').forEach((btn) => {
      btn.addEventListener('click', async () => {
        const color = btn.dataset.color;
        updateColorPickerUI(color);
        await Storage.updateSettings({ bgColor: color, bgType: 'color' });
        document.querySelector('input[name="bg-type"][value="color"]').checked = true;
        showBgOptions('color');
        await applyBackground();
      });
    });

    document.getElementById('btn-bg-url-apply').addEventListener('click', applyBgFromUrl);

    document.getElementById('bg-image-upload').addEventListener('change', (e) => {
      const file = e.target.files[0];
      const nameEl = document.getElementById('bg-file-name');
      if (!file) {
        if (nameEl) nameEl.textContent = I18n.t('noFile');
        return;
      }
      if (nameEl) nameEl.textContent = file.name;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        await Storage.updateSettings({ bgImage: ev.target.result, bgType: 'image' });
        document.querySelector('input[name="bg-type"][value="image"]').checked = true;
        showBgOptions('image');
        updateWallpaperSelection('');
        await applyBackground();
      };
      reader.readAsDataURL(file);
    });

    document.getElementById('bg-blur').addEventListener('input', async (e) => {
      const val = e.target.value;
      document.getElementById('bg-blur-value').textContent = val + 'px';
      await Storage.updateSettings({ bgBlur: parseInt(val, 10) });
      await applyBackground();
    });

    document.getElementById('bg-overlay').addEventListener('input', async (e) => {
      const val = e.target.value;
      document.getElementById('bg-overlay-value').textContent = val + '%';
      await Storage.updateSettings({ bgOverlay: parseInt(val, 10) });
      await applyBackground();
    });
  }

  async function applyBgFromUrl() {
    const url = document.getElementById('bg-image-url').value.trim();
    if (!url) {
      TabyarUI.alert(I18n.t('invalidImageUrl'), { type: 'error' });
      return;
    }
    await Storage.updateSettings({ bgImage: url, bgType: 'image' });
    document.querySelector('input[name="bg-type"][value="image"]').checked = true;
    showBgOptions('image');
    updateWallpaperSelection(url);
    await applyBackground();
  }

  function setupBackupControls() {
    document.getElementById('btn-export-data').addEventListener('click', () => {
      const data = Storage.exportAllData();
      const date = new Date().toISOString().slice(0, 10);
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tabyar-backup-${date}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });

    document.getElementById('btn-import-data').addEventListener('click', () => {
      document.getElementById('import-data-file').click();
    });

    document.getElementById('import-data-file').addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = async (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          await Storage.importAllData(data);
          await applyAll();
          I18n.applyDom();
          BookmarksUI.render();
          CalendarUI.refresh();
          NotesUI.render();
          TasksUI.render();
          TasksUI.renderFocus();
          PersonalEventsUI.render();
          DashboardLayoutUI.apply();
          DashboardLayoutUI.renderSettings();
          TabyarUI.alert(I18n.t('importDataSuccess'), { type: 'success' });
        } catch {
          TabyarUI.alert(I18n.t('invalidFile'), { type: 'error' });
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });

    document.getElementById('btn-reset-data').addEventListener('click', async () => {
      if (await TabyarUI.confirm(I18n.t('resetConfirm'), { danger: true })) {
        await Storage.resetAll();
        await applyAll();
        I18n.applyDom();
        BookmarksUI.render();
        CalendarUI.refresh();
        NotesUI.render();
        TasksUI.render();
        TasksUI.renderFocus();
        PersonalEventsUI.render();
        DashboardLayoutUI.apply();
        ensureSettingsPanels();
        syncControlsFromSettings();
      }
    });

    document.getElementById('btn-import-chrome-bookmarks').addEventListener('click', importChromeBookmarks);
    setupChromeBookmarkSyncControls();
  }

  function sendBookmarkSyncMessage(type, extra = {}) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, ...extra }, (response) => {
        const error = chrome.runtime.lastError;
        if (error) reject(new Error(error.message || String(error)));
        else resolve(response);
      });
    });
  }

  function setupChromeBookmarkSyncControls() {
    const toggle = document.getElementById('toggle-follow-chrome-bookmarks');
    const status = document.getElementById('chrome-bookmark-sync-status');
    const importButton = document.getElementById('btn-import-chrome-bookmarks');
    if (!toggle) return;
    toggle.checked = Boolean(Storage.getSettings().followChromeBookmarks);
    if (importButton) importButton.disabled = toggle.checked;

    toggle.addEventListener('change', async () => {
      const enable = toggle.checked;
      toggle.disabled = true;
      status.textContent = '';
      try {
        if (enable) {
          const confirmed = await TabyarUI.confirm(I18n.t('followChromeConfirm'), { danger: true });
          if (!confirmed) {
            toggle.checked = false;
            return;
          }
          const response = await sendBookmarkSyncMessage('TABYAR_ENABLE_CHROME_BOOKMARK_SYNC', { confirmed: true });
          if (!response?.ok) throw new Error(response?.error || 'sync-enable-failed');
          await Storage.load();
          BookmarksUI.render();
          toggle.checked = true;
          status.textContent = I18n.t('chromeSyncEnabled');
          TabyarUI.alert(I18n.t('chromeSyncEnabled'), { type: 'success' });
        } else {
          await Storage.updateSettings({ followChromeBookmarks: false });
          BookmarksUI.render();
          toggle.checked = false;
          status.textContent = I18n.t('chromeSyncDisabled');
          TabyarUI.alert(I18n.t('chromeSyncDisabled'), { type: 'success' });
        }
      } catch (error) {
        console.error('Tabyar: Chrome bookmark sync toggle failed', error);
        toggle.checked = Boolean(Storage.getSettings().followChromeBookmarks);
        status.textContent = I18n.t('chromeSyncFailed');
        TabyarUI.alert(I18n.t('chromeSyncFailed'), { type: 'error' });
      } finally {
        toggle.disabled = false;
        if (importButton) importButton.disabled = Boolean(Storage.getSettings().followChromeBookmarks);
      }
    });
  }

  async function importChromeBookmarks() {
    if (Storage.getSettings().followChromeBookmarks) {
      TabyarUI.alert(I18n.t('chromeSyncImportUnavailable'), { type: 'info' });
      return;
    }
    if (!(await TabyarUI.confirm(I18n.t('importChromeConfirm')))) return;

    try {
      const tree = await new Promise((resolve, reject) => {
        chrome.bookmarks.getTree((nodes) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(nodes);
        });
      });
      await Storage.importBookmarkTree(tree);
      BookmarksUI.render();
      TabyarUI.alert(I18n.t('importSuccess'), { type: 'success' });
    } catch (err) {
      console.error('Tabyar: bookmark import failed', err);
      TabyarUI.alert(I18n.t('importFailed'), { type: 'error' });
    }
  }

  function showBgOptions(type) {
    document.getElementById('bg-gradient-options').classList.toggle('hidden', type !== 'gradient');
    document.getElementById('bg-color-options').classList.toggle('hidden', type !== 'color');
    document.getElementById('bg-image-options').classList.toggle('hidden', type !== 'image');
  }

  function syncControlsFromSettings() {
    const s = Storage.getSettings();
    const chromeSyncToggle = document.getElementById('toggle-follow-chrome-bookmarks');
    if (chromeSyncToggle) chromeSyncToggle.checked = Boolean(s.followChromeBookmarks);
    const importChromeButton = document.getElementById('btn-import-chrome-bookmarks');
    if (importChromeButton) importChromeButton.disabled = Boolean(s.followChromeBookmarks);
    document.querySelector(`input[name="bg-type"][value="${s.bgType}"]`).checked = true;
    showBgOptions(s.bgType);
    document.getElementById('bg-color-picker').value = s.bgColor;
    updateColorPickerUI(s.bgColor);
    document.getElementById('bg-image-url').value = s.bgImage.startsWith('data:') ? '' : s.bgImage;
    document.getElementById('bg-blur').value = s.bgBlur;
    document.getElementById('bg-blur-value').textContent = s.bgBlur + 'px';
    document.getElementById('bg-overlay').value = s.bgOverlay;
    document.getElementById('bg-overlay-value').textContent = s.bgOverlay + '%';
    updateLanguageButtons(s.language || 'fa');
    updatePerfModeButtons(s.perfMode || 'auto');
    syncLocationDisplay();
    syncSecondLocationDisplay();
    updateCalendarTypeHint(s.calendarType);

    const toggleGs = document.getElementById('toggle-google-services-visible');
    if (toggleGs) toggleGs.checked = s.googleServicesVisible !== false;
    const toggleTs = document.getElementById('toggle-top-sites-visible');
    if (toggleTs) toggleTs.checked = s.topSitesVisible !== false;
    const toggleFloating = document.getElementById('toggle-floating-bookmark');
    if (toggleFloating) toggleFloating.checked = s.floatingBookmarkButton !== false;
    const toggleNews = document.getElementById('toggle-news-visible');
    if (toggleNews) toggleNews.checked = s.newsVisible !== false;
    const togglePrices = document.getElementById('toggle-prices-visible');
    if (togglePrices) togglePrices.checked = s.pricesVisible !== false;
    document.querySelectorAll('.digits-style-btn').forEach((button) => button.classList.toggle('active', button.dataset.digitsStyle === (s.persianDigits || 'auto')));
    renderGoogleServicesSettings();
    DashboardLayoutUI.renderSettings();
  }

  function applyTheme(themeKey) {
    const theme = THEMES[themeKey] || THEMES.glass;
    const vars = { ...BASE_DARK_VARS, ...theme.dark };
    const root = document.documentElement;
    const body = document.body;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
      body.style.setProperty(key, val);
    });
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    body.classList.toggle('glass-theme', themeKey === 'glass');
  }

  function resetBackgroundLayer(layer) {
    layer.style.filter = '';
    layer.style.background = '';
    layer.style.backgroundImage = '';
    layer.style.backgroundSize = '';
    layer.style.backgroundPosition = '';
    layer.classList.remove('bg-loading');
  }

  async function applyBackgroundImage(s) {
    const layer = document.getElementById('background-layer');
    if (!layer || s.bgType !== 'image' || !s.bgImage) return;

    layer.classList.add('bg-loading');
    try {
      const src = await WallpaperLoader.resolve(s.bgImage);
      layer.style.backgroundImage = `url("${src}")`;
      layer.style.backgroundSize = 'cover';
      layer.style.backgroundPosition = 'center';
      layer.style.filter = `blur(${s.bgBlur}px)`;
      layer.style.setProperty('--bg-overlay-opacity', s.bgOverlay / 100);
    } catch (err) {
      console.warn('Tabyar: wallpaper load failed', err);
    } finally {
      layer.classList.remove('bg-loading');
    }
  }

  function applyBackgroundSync() {
    const s = Storage.getSettings();
    const layer = document.getElementById('background-layer');
    if (!layer) return;

    resetBackgroundLayer(layer);

    if (s.bgType === 'gradient') {
      layer.style.background = GRADIENTS[s.bgGradient] || GRADIENTS.night;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'color') {
      layer.style.background = s.bgColor;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'image' && s.bgImage) {
      layer.style.background = GRADIENTS.night;
      layer.style.setProperty('--bg-overlay-opacity', '0');
      applyBackgroundImage(s);
    }
  }

  async function applyBackground() {
    const s = Storage.getSettings();
    const layer = document.getElementById('background-layer');
    if (!layer) return;

    resetBackgroundLayer(layer);

    if (s.bgType === 'gradient') {
      layer.style.background = GRADIENTS[s.bgGradient] || GRADIENTS.night;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'color') {
      layer.style.background = s.bgColor;
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'image' && s.bgImage) {
      layer.style.background = GRADIENTS.night;
      layer.style.setProperty('--bg-overlay-opacity', '0');
      await applyBackgroundImage(s);
    }
  }

  function applyQuick() {
    const s = Storage.getSettings();
    applyTheme(s.theme);
    applyBackgroundSync();
    updateLanguageButtons(s.language || 'fa');
    applyPerfMode(s.perfMode || 'auto');
  }

  async function applyAll() {
    const s = Storage.getSettings();
    applyTheme(s.theme);
    await applyBackground();
    updateLanguageButtons(s.language || 'fa');
  }

  async function reapplyAppearance() {
    const s = Storage.getSettings();
    applyTheme(s.theme);
    await applyBackground();
  }

  function refreshI18n() {
    ensureSettingsPanels();
    renderThemeGrid();
    renderWallpaperGallery();
    renderGoogleServicesSettings();
    syncControlsFromSettings();
    DashboardLayoutUI.renderSettings();
  }

  function getThemeKeys() { return Object.keys(THEMES); }
  function getGradientKeys() { return Object.keys(GRADIENTS); }

  return { init, applyQuick, applyAll, applyPerfMode, refreshI18n, refreshLocationLabels, updateLanguageButtons, updatePerfModeButtons, reapplyAppearance, getThemeKeys, getGradientKeys };
})();
