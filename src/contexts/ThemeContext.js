import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function useTheme() {
  return useContext(ThemeContext);
}

export function ThemeProvider({ children }) {
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  const [mode, setMode] = useState(() => {
    const savedMode = localStorage.getItem('theme-mode');
    return savedMode || (prefersDarkMode ? 'dark' : 'light');
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
  }, [mode]);

  const theme = React.useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#2463eb',
            light: '#5f8fff',
            dark: '#1944a5',
          },
          secondary: {
            main: '#0f766e',
            light: '#0ea5a0',
            dark: '#115e59',
          },
          success: {
            main: '#16a34a',
          },
          warning: {
            main: '#d97706',
          },
          error: {
            main: '#dc2626',
          },
          text: {
            primary: mode === 'light' ? '#0f172a' : '#e2e8f0',
            secondary: mode === 'light' ? '#475569' : '#94a3b8',
          },
          background: {
            default: mode === 'light' ? '#f4f7fb' : '#070c17',
            paper: mode === 'light' ? '#ffffff' : '#111827',
          },
          divider: mode === 'light' ? 'rgba(15, 23, 42, 0.08)' : 'rgba(148, 163, 184, 0.2)',
        },
        typography: {
          fontFamily: '"Manrope", "Inter", "Segoe UI", sans-serif',
          h1: { fontWeight: 800, letterSpacing: '-0.02em' },
          h2: { fontWeight: 800, letterSpacing: '-0.02em' },
          h3: { fontWeight: 700, letterSpacing: '-0.01em' },
          h4: { fontWeight: 700, letterSpacing: '-0.01em' },
          h5: { fontWeight: 700 },
          h6: { fontWeight: 700 },
          button: { fontWeight: 700 },
        },
        shape: {
          borderRadius: 16,
        },
        shadows: [
          'none',
          '0 4px 10px rgba(15, 23, 42, 0.06)',
          '0 8px 20px rgba(15, 23, 42, 0.08)',
          '0 12px 28px rgba(15, 23, 42, 0.1)',
          ...Array(21).fill('0 14px 30px rgba(15, 23, 42, 0.12)'),
        ],
        transitions: {
          duration: {
            shortest: 120,
            shorter: 180,
            short: 220,
            standard: 260,
            complex: 320,
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundImage:
                  mode === 'light'
                    ? 'radial-gradient(circle at 0% 0%, rgba(36,99,235,0.08), transparent 40%), radial-gradient(circle at 100% 0%, rgba(15,118,110,0.08), transparent 35%)'
                    : 'radial-gradient(circle at 0% 0%, rgba(36,99,235,0.18), transparent 45%), radial-gradient(circle at 100% 0%, rgba(15,118,110,0.16), transparent 40%)',
                backgroundAttachment: 'fixed',
              },
            },
          },
          MuiButton: {
            defaultProps: {
              disableElevation: true,
            },
            styleOverrides: {
              root: {
                textTransform: 'none',
                fontWeight: 700,
                borderRadius: 12,
                paddingInline: 18,
                transition: 'transform 160ms ease, box-shadow 160ms ease',
              },
              contained: {
                boxShadow: mode === 'light' ? '0 8px 20px rgba(36, 99, 235, 0.24)' : 'none',
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                border: `1px solid ${mode === 'light' ? 'rgba(15, 23, 42, 0.06)' : 'rgba(148, 163, 184, 0.22)'}`,
                backgroundImage: 'none',
                backgroundColor:
                  mode === 'light' ? 'rgba(255, 255, 255, 0.92)' : 'rgba(17, 24, 39, 0.92)',
                backdropFilter: 'blur(8px)',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                border: `1px solid ${mode === 'light' ? 'rgba(15, 23, 42, 0.06)' : 'rgba(148, 163, 184, 0.2)'}`,
              },
            },
          },
          MuiAppBar: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 10,
              },
            },
          },
        },
      }),
    [mode]
  );

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <MuiThemeProvider theme={theme}>{children}</MuiThemeProvider>
    </ThemeContext.Provider>
  );
}
