import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'

export default createVuetify({
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
