import { createTheme } from '@mantine/core'

export const theme = createTheme({
  primaryColor: 'stream',
  primaryShade: { light: 6, dark: 5 },
  colors: {
    stream: [
      '#eef2ff', '#dde3fd', '#b8c5f8', '#91a5f3', '#6f89ee',
      '#5977eb', '#3d5fe0', '#3150c7', '#2846b3', '#1b3a9e',
    ],
    dark: [
      '#d0d3db', '#a9aeba', '#80879a', '#5d6476', '#3b4050',
      '#2b2f3a', '#1f222b', '#171920', '#121318', '#0c0d11',
    ],
  },
  fontFamily: 'Geist, system-ui, -apple-system, "Segoe UI", sans-serif',
  fontFamilyMonospace: '"Geist Mono", ui-monospace, monospace',
  headings: {
    fontFamily: 'Geist, system-ui, sans-serif',
    fontWeight: '600',
    sizes: {
      h1: { fontSize: '2rem', lineHeight: '1.2' },
      h2: { fontSize: '1.5rem', lineHeight: '1.25' },
      h3: { fontSize: '1.125rem', lineHeight: '1.35' },
      h4: { fontSize: '1rem', lineHeight: '1.4' },
    },
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  components: {
    Card: { defaultProps: { withBorder: true, radius: 'md', padding: 'lg' } },
    Paper: { defaultProps: { radius: 'md' } },
    Badge: { defaultProps: { variant: 'light', radius: 'sm', tt: 'none' }, styles: { root: { fontWeight: 500 } } },
    Button: { styles: { root: { fontWeight: 500 } } },
    Tooltip: { defaultProps: { withArrow: true, openDelay: 200 } },
    Modal: { defaultProps: { radius: 'md', centered: true } },
    Table: { defaultProps: { verticalSpacing: 'sm' } },
  },
})
