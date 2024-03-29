import { createApp, provide } from 'vue'
import { registerSW } from 'virtual:pwa-register'
import Toast, { useToast } from 'vue-toastification'
import 'vue-toastification/dist/index.css'
import Qui from '@qvant/qui-max'
import '@qvant/qui-max/styles'
import v_outside from 'click-outside-vue3'
import VueHighlightJS from 'vue3-highlightjs'

import app from './app.vue'
import router from './router.js'
import 'highlight.js/styles/monokai.css'

console.log(
  `%c You're curious, i like you 😊`,
  'color: #1565C0;font-weight:bold;font-size:20px;'
)
console.log(
  "%c but don't bother, i'm open-source!",
  'color: #E67E22;font-size:18px;'
)
console.log('%c https://github.com/aresrpg/editor', 'font-size:15px;')

const vue_app = createApp(app)
const toast = useToast()

vue_app
  .use(router)
  .use(Toast)
  .use(VueHighlightJS)
  .use(v_outside)
  .use(Qui)
  .mount('#app')

const updateSW = registerSW({
  onOfflineReady() {
    toast('ready to work offline!')
  },
})

vue_app.config.compilerOptions.isCustomElement = tag => {
  if (tag.startsWith('el-')) return true
  if (tag.startsWith('q-')) return true
  if (tag.startsWith('upload-')) return true
  return false
}
