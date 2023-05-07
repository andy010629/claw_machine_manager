// FILE: main.js
import { createApp } from 'vue'
import { Quasar } from 'quasar'

import { VueFire, VueFireAuth } from 'vuefire'
// the file we created above with `database`, `firestore` and other exports
import { firebaseApp } from './firebase'

// Import icon libraries
import '@quasar/extras/material-icons/material-icons.css'
import '@quasar/extras/material-symbols-outlined/material-symbols-outlined.css'

// Import Quasar css
import 'quasar/src/css/index.sass'

// Assumes your root component is App.vue
// and placed in same folder as main.js
import App from './App.vue'

const myApp = createApp(App)

myApp.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
}).use(VueFire, {
    // imported above but could also just be created here
    firebaseApp,
    modules: [
      // we will see other modules later on
      VueFireAuth(),
    ],
  })

// Assumes you have a <div id="app"></div> in your index.html
myApp.mount('#app')
