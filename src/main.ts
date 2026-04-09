import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import { vuetify } from './plugins/vuetify'
import { router } from './router/router.ts'
import '@/assets/index.css'
import '@/assets/tailwind-legacy.css'

createApp(App)
  .use(createPinia())
  .use(vuetify)
  .use(router)
  .mount('#app')
