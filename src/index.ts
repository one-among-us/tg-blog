import { App } from 'vue'
import * as components from './views'

export default function install (app: App) {
  for (const key in components) {
    app.component(key, components[key])
  }
}

import './css/global.sass'

export * from './views'
export * from './logic'
