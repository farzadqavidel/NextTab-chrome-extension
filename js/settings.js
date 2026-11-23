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

  function picsum(id, w, h) {
    return `https://picsum.photos/id/${id}/${w}/${h}`;
  }

  // Bundled local wallpapers (offline, no network). Paths are relative to the
  // newtab page, resolved by the browser against the extension URL; thumbs are
  // downscaled copies generated from the full images.
  function localWallpaper(fileName) {
    return `assets/wallpapers/${fileName}`;
  }

  const WALLPAPERS = {
    nature: [
      { id: 'fjord', url: picsum('1015', 1920, 1080), thumb: picsum('1015', 480, 270) },
      { id: 'waterfall', url: picsum('1035', 1920, 1080), thumb: picsum('1035', 480, 270) },
      { id: 'yosemite', url: picsum('1043', 1920, 1080), thumb: picsum('1043', 480, 270) },
      { id: 'coast', url: picsum('1050', 1920, 1080), thumb: picsum('1050', 480, 270) },
      { id: 'warm-cliffs', url: picsum('1016', 1920, 1080), thumb: picsum('1016', 480, 270) },
      { id: 'rocky-river', url: picsum('1044', 1920, 1080), thumb: picsum('1044', 480, 270) },
      { id: 'snow-tent', url: picsum('1036', 1920, 1080), thumb: picsum('1036', 480, 270) },
      { id: 'pier-lake', url: picsum('1051', 1920, 1080), thumb: picsum('1051', 480, 270) }
    ],
    space: [
      { id: 'mars-crater', url: picsum('1032', 1920, 1080), thumb: picsum('1032', 480, 270) },
      { id: 'star-trails', url: picsum('1042', 1920, 1080), thumb: picsum('1042', 480, 270) }
    ],
    minimal: [
      { id: 'triangle', url: picsum('1076', 1920, 1080), thumb: picsum('1076', 480, 270) },
      { id: 'pyramid', url: picsum('1081', 1920, 1080), thumb: picsum('1081', 480, 270) },
      { id: 'bright', url: picsum('1056', 1920, 1080), thumb: picsum('1056', 480, 270) },
      { id: 'overpass', url: picsum('1063', 1920, 1080), thumb: picsum('1063', 480, 270) },
      { id: 'cloud-sea', url: picsum('1064', 1920, 1080), thumb: picsum('1064', 480, 270) },
      { id: 'still-life', url: picsum('1068', 1920, 1080), thumb: picsum('1068', 480, 270) }
    ],
    sea: [
      { id: 'stormy-sea', url: picsum('1019', 1920, 1080), thumb: picsum('1019', 480, 270) },
      { id: 'dark-waves', url: picsum('1038', 1920, 1080), thumb: picsum('1038', 480, 270) },
      { id: 'cliff-beach', url: picsum('1061', 1920, 1080), thumb: picsum('1061', 480, 270) },
      { id: 'rock-reflection', url: picsum('1049', 1920, 1080), thumb: picsum('1049', 480, 270) },
      { id: 'wide-coast', url: picsum('1055', 1920, 1080), thumb: picsum('1055', 480, 270) },
      { id: 'turquoise-lake', url: picsum('1011', 1920, 1080), thumb: picsum('1011', 480, 270) },
      { id: 'wave-curl', url: picsum('1041', 1920, 1080), thumb: picsum('1041', 480, 270) },
      { id: 'black-beach', url: picsum('1052', 1920, 1080), thumb: picsum('1052', 480, 270) }
    ],
    city: [
      { id: 'city-skyline', url: picsum('1029', 1920, 1080), thumb: picsum('1029', 480, 270) },
      { id: 'city-alley', url: picsum('1047', 1920, 1080), thumb: picsum('1047', 480, 270) },
      { id: 'sunset-city', url: picsum('1067', 1920, 1080), thumb: picsum('1067', 480, 270) },
      { id: 'night-city', url: picsum('1078', 1920, 1080), thumb: picsum('1078', 480, 270) },
      { id: 'sea-alley', url: picsum('1065', 1920, 1080), thumb: picsum('1065', 480, 270) }
    ],
    gaming: [
      { id: 'gaming-car-1', url: localWallpaper('gaming-car-1.jpg'), thumb: localWallpaper('gaming-car-1-thumb.webp') },
      { id: 'gaming-car-2', url: localWallpaper('gaming-car-2.jpg'), thumb: localWallpaper('gaming-car-2-thumb.webp') },
      { id: 'gaming-arena', url: localWallpaper('gaming-arena.jpg'), thumb: localWallpaper('gaming-arena-thumb.webp') }
    ],
    tech: [
      { id: 'tech-circuit', url: localWallpaper('tech-circuit.jpg'), thumb: localWallpaper('tech-circuit-thumb.webp') },
      { id: 'tech-server', url: localWallpaper('tech-server.jpg'), thumb: localWallpaper('tech-server-thumb.webp') }
    ],
    neon: [
      { id: 'neon-trails', url: localWallpaper('neon-trails.jpg'), thumb: localWallpaper('neon-trails-thumb.webp') },
      { id: 'neon-nebula', url: localWallpaper('neon-nebula.jpg'), thumb: localWallpaper('neon-nebula-thumb.webp') }
    ]
  };

  const WALLPAPER_CATEGORY_KEYS = {
    nature: 'wpNature',
    space: 'wpSpace',
    minimal: 'wpMinimal',
    sea: 'wpSea',
    city: 'wpCity',
    gaming: 'wpGaming',
    tech: 'wpTech',
    neon: 'wpNeon'
  };

  const BASE_DARK_VARS = {
    '--surface-muted': '#0e0e12',
    '--tile-bg': '#101014',
    '--input-bg': '#0e0e12',
    '--panel-bg': '#000000',
    '--shadow': '0 1px 2px rgba(0, 0, 0, 0.45), 0 12px 32px -8px rgba(0, 0, 0, 0.65)',
    '--shadow-hover': '0 2px 4px rgba(0, 0, 0, 0.5), 0 20px 48px -12px rgba(0, 0, 0, 0.75)'
  };

  // Dark mode must be fully black: every surface becomes pure/near-black black,
  // so the dashboard and modal content sit on a true black canvas. Accent colors,
  // borders and text stay theme-driven and readable. Applied AFTER the theme merge
  // and the visibility floor so it always wins.
  const DARK_BLACK_SURFACE_VARS = {
    '--bg-card': '#000000',
    '--bg-card-hover': '#0a0a0c',
    '--surface-muted': '#0e0e12',
    '--tile-bg': '#101014',
    '--input-bg': '#0e0e12',
    '--panel-bg': '#000000',
    '--panel-surface': '#0d0d10',
    '--panel-input-bg': '#0e0e12',
    '--search-bg': '#000000',
    '--menu-bg': '#000000',
    '--overlay-scrim': 'rgba(0, 0, 0, 0.78)',
    '--highlight': 'rgba(255, 255, 255, 0.07)'
  };

  const BASE_LIGHT_VARS = {
    '--surface-muted': '#f1f5fb',
    '--tile-bg': '#ffffff',
    '--input-bg': '#ffffff',
    '--panel-input-bg': '#ffffff',
    '--panel-bg': '#ffffff',
    '--panel-surface': '#f1f5fb',
    '--highlight': 'rgba(255, 255, 255, 0.7)',
    '--shadow': '0 4px 20px rgba(0, 0, 0, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)',
    '--shadow-hover': '0 16px 48px rgba(0, 0, 0, 0.12), 0 4px 12px rgba(0, 0, 0, 0.06)'
  };

  // Field backgrounds per app-wide mode (white/black/glass).
  const FIELD_VARS = {
    light: { '--input-bg': '#ffffff', '--panel-input-bg': '#ffffff', '--search-bg': '#ffffff' },
    dark: { '--input-bg': 'rgba(15, 22, 41, 0.78)', '--panel-input-bg': 'rgba(15, 22, 41, 0.78)', '--search-bg': 'rgba(15, 22, 41, 0.78)' },
    glass: { '--input-bg': 'rgba(11, 18, 34, 0.72)', '--panel-input-bg': 'rgba(11, 18, 34, 0.72)', '--search-bg': 'rgba(11, 18, 34, 0.72)' }
  };

  // Every mode must stay readable, so text and secondary surfaces get
  // explicit, high-contrast floors no matter what a theme's palette says.
  // Themes still control the accent, borders, and the tint of `text-primary`;
  // readability of every control is guaranteed.
  function enforceDarkVisibility(vars) {
    const bumpAlpha = (value, target) => {
      const m = String(value).match(/rgba?\(([^)]+)\)/);
      if (!m) return value;
      const parts = m[1].split(/[,\s/]+/).filter(Boolean);
      if (parts.length === 3) return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${target})`;
      const alpha = Number(parts[3]);
      if (parts.length >= 4 && !Number.isNaN(alpha)) {
        return `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${Math.max(alpha, target)})`;
      }
      return value;
    };
    vars['--text-secondary'] = bumpAlpha(vars['--text-secondary'], 0.85);
    vars['--surface-muted'] = 'rgba(148, 163, 184, 0.16)';
    vars['--panel-surface'] = 'rgba(15, 15, 18, 0.94)';
    vars['--highlight'] = 'rgba(255, 255, 255, 0.10)';
    return vars;
  }

  const MODES = ['light', 'dark', 'glass'];

  function normalizeMode(mode) {
    return MODES.includes(mode) ? mode : 'dark';
  }

  let settingsPanelsRendered = false;

  function ensureSettingsPanels() {
    if (settingsPanelsRendered) return;
    settingsPanelsRendered = true;
    renderThemeGrid();
    renderModeSelector();
    renderGradientGrid();
    renderWallpaperGallery();
  }

  function init() {
    document.getElementById('btn-settings').addEventListener('click', openSettings);
    setupTabs();
    setupBackgroundControls();
    setupLanguageToggle();
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
    if (typeof UpdatesUI !== 'undefined' && typeof UpdatesUI.init === 'function') {
      UpdatesUI.init();
    }
  }

  function openSettings() {
    ensureSettingsPanels();
    syncControlsFromSettings();
    renderGoogleServicesSettings();
    TabyarUI.openModal('modal-settings');
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
    document.querySelectorAll('.lang-btn:not(.onboarding-lang-btn)').forEach((btn) => {
      btn.addEventListener('click', async () => {
        await I18n.setLanguage(btn.dataset.lang);
        updateLanguageButtons(btn.dataset.lang);
      });
    });
  }

  function updateLanguageButtons(lang) {
    document.querySelectorAll('.lang-btn:not(.onboarding-lang-btn)').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.lang === lang);
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
    const sitesToggle = document.getElementById('toggle-iranian-sites-visible');
    if (sitesToggle) {
      sitesToggle.addEventListener('change', async (e) => {
        await Storage.updateSettings({ sitesVisible: e.target.checked });
        Feeds.applyVisibility();
      });
    }
  }

  function setupExtraControls() {
    const floating = document.getElementById('toggle-floating-bookmark');
    floating?.addEventListener('change', async (event) => {
      await Storage.updateSettings({ floatingBookmarkButton: event.target.checked });
    });

    const modeSelector = document.getElementById('mode-selector');
    if (modeSelector) {
      modeSelector.querySelectorAll('.mode-option').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const mode = normalizeMode(btn.dataset.mode);
          if (mode === normalizeMode(Storage.getSettings().colorMode)) return;
          await Storage.updateSettings({ colorMode: mode });
          renderModeSelector();
          applyTheme(Storage.getSettings().theme);
        });
      });
    }
  }

  function renderModeSelector() {
    const selector = document.getElementById('mode-selector');
    if (!selector) return;
    const mode = normalizeMode(Storage.getSettings().colorMode);
    selector.querySelectorAll('.mode-option').forEach((btn) => {
      const active = btn.dataset.mode === mode;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-checked', String(active));
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

    grid.innerHTML = Object.entries(THEMES).map(([key, theme]) => `
      <button class="theme-card ${settings.theme === key ? 'active' : ''}" data-theme="${key}">
        <div class="theme-preview" style="background: ${theme.accent}"></div>
        <span>${I18n.t(theme.nameKey)}</span>
      </button>
    `).join('');

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
      a.download = `nexttab-backup-${date}.json`;
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
        console.error('NextTab: Chrome bookmark sync toggle failed', error);
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
      // Chrome wraps everything in two root folders ("Bookmarks bar" and
      // "Other bookmarks", chrome ids "1" and "2"). Unwrap them so the real
      // folders and bookmarks land directly on the main page.
      const tree = await new Promise((resolve, reject) => {
        chrome.bookmarks.getTree((nodes) => {
          if (chrome.runtime.lastError) reject(chrome.runtime.lastError);
          else resolve(nodes);
        });
      });
      const root = Array.isArray(tree) ? tree[0] : null;
      const topLevel = root && Array.isArray(root.children) && root.children.length
        ? root.children
        : (Array.isArray(tree) ? tree.filter(Boolean) : []);
      const wrapperIds = new Set(['1', '2']);
      const flattened = topLevel
        .flatMap((node) => {
          if (!node) return [];
          if (node.url) return [node];
          if (wrapperIds.has(String(node.id)) && Array.isArray(node.children)) return node.children;
          return [node];
        });

      // Sweep leftover wrapper folders from a previous import so only the real
      // folders sit at the top level; their contents move to the main page.
      const legacyWrappers = Storage.getFolders().filter((folder) =>
        !folder.isDefault && !folder.isChromeRoot &&
        ['bookmarks bar', 'other bookmarks'].includes(String(folder.name || '').trim().toLowerCase())
      );
      for (const wrapper of legacyWrappers) {
        await Storage.deleteFolder(wrapper.id, false);
      }

      await Storage.importBookmarkTree(flattened);
      await Storage.setActiveFolder('default');
      BookmarksUI.render();
      TabyarUI.alert(I18n.t('importSuccess'), { type: 'success' });
    } catch (err) {
      console.error('NextTab: bookmark import failed', err);
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
    const toggleSites = document.getElementById('toggle-iranian-sites-visible');
    if (toggleSites) toggleSites.checked = s.sitesVisible !== false;
    renderModeSelector();
    renderGoogleServicesSettings();
  }

  // Glass surfaces must stay dark and mostly opaque on purpose: the app always
  // runs in perf-lite mode (app.js hardcodes it), so backdrop-filter is disabled
  // and the cards have to remain readable over ANY wallpaper — light, dark or
  // photographic. A translucent white wash on a light wallpaper is invisible
  // (white-on-pale), so glass uses a deep frosted navy instead and lets the
  // wallpaper glow through softly via saturation + the sheen.
  const GLASS_SURFACE_VARS = {
    '--bg-card': 'rgba(11, 18, 34, 0.68)',
    '--bg-card-hover': 'rgba(16, 26, 46, 0.78)',
    '--surface-muted': 'rgba(255, 255, 255, 0.10)',
    '--panel-bg': 'rgba(11, 18, 34, 0.82)',
    '--search-bg': 'rgba(11, 18, 34, 0.62)',
    '--tile-bg': 'rgba(11, 18, 34, 0.62)',
    '--input-bg': 'rgba(11, 18, 34, 0.62)',
    '--panel-input-bg': 'rgba(11, 18, 34, 0.62)',
    '--border': 'rgba(255, 255, 255, 0.20)',
    '--shadow': '0 6px 26px rgba(2, 6, 23, 0.38), 0 1px 0 rgba(255, 255, 255, 0.10) inset',
    '--shadow-hover': '0 14px 44px rgba(2, 6, 23, 0.50), 0 1px 0 rgba(255, 255, 255, 0.14) inset'
  };

  function applyTheme(themeKey) {
    const s = Storage.getSettings();
    const key = THEMES[themeKey] ? themeKey : 'midnight';
    const theme = THEMES[key];
    const mode = normalizeMode(s.colorMode);
    const vars = mode === 'light'
      ? { ...BASE_LIGHT_VARS, ...theme.light }
      : { ...BASE_DARK_VARS, ...theme.dark };
    if (mode === 'glass') Object.assign(vars, GLASS_SURFACE_VARS);
    Object.assign(vars, FIELD_VARS[mode]);
    if (mode === 'light') {
      vars['--text-secondary'] = '#55637a';
    } else {
      enforceDarkVisibility(vars);
    }
    if (mode === 'dark') Object.assign(vars, DARK_BLACK_SURFACE_VARS);
    const root = document.documentElement;
    const body = document.body;
    Object.entries(vars).forEach(([key, val]) => {
      root.style.setProperty(key, val);
      body.style.setProperty(key, val);
    });
    body.classList.toggle('light-mode', mode === 'light');
    body.classList.toggle('dark-mode', mode !== 'light');
    body.classList.toggle('glass-theme', mode === 'glass');
    // Dark mode must be fully black — including the canvas behind any
    // transparent/overlay layers.
    body.style.background = mode === 'dark' ? '#000000' : '';
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
      console.warn('NextTab: wallpaper load failed', err);
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
      const mode = normalizeMode(s.colorMode);
      layer.style.background = mode === 'dark' ? '#000000' : (GRADIENTS[s.bgGradient] || GRADIENTS.night);
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'color') {
      const mode = normalizeMode(s.colorMode);
      layer.style.background = mode === 'dark' ? '#000000' : s.bgColor;
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

    const mode = normalizeMode(s.colorMode);
    if (s.bgType === 'gradient') {
      layer.style.background = mode === 'dark' ? '#000000' : (GRADIENTS[s.bgGradient] || GRADIENTS.night);
      layer.style.setProperty('--bg-overlay-opacity', '0');
    } else if (s.bgType === 'color') {
      layer.style.background = mode === 'dark' ? '#000000' : s.bgColor;
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
    if (typeof FontsUI !== 'undefined') FontsUI.render();
    renderThemeGrid();
    renderWallpaperGallery();
    renderGoogleServicesSettings();
    syncControlsFromSettings();
  }

  function getThemeKeys() { return Object.keys(THEMES); }
  function getGradientKeys() { return Object.keys(GRADIENTS); }

  return { init, applyQuick, applyAll, refreshI18n, refreshLocationLabels, updateLanguageButtons, reapplyAppearance, getThemeKeys, getGradientKeys };
})();
