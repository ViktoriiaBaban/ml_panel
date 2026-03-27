import 'vuetify/styles'
import { createVuetify } from 'vuetify'

export const vuetify = createVuetify({
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          primary: '#409EFF',
          background: '#F5F7FA',
          surface: '#FFFFFF',
        },
      },
    },
  },
})
