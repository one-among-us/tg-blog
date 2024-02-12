import {App} from 'vue'
import * as components from './views'
import './css/global.sass'

export default function install (app: App) {
  for (const key in components) {
    app.component(key, components[key])
  }
}

export * from './views'
export * from './logic'
