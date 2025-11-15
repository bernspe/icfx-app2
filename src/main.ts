import "mdb-vue-ui-kit/css/mdb.min.css";

import {createApp} from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

import axios from 'axios'
import axiosRetry from 'axios-retry'

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay
})

const app = createApp(App);

app.use(router)
    app.mount("#app");
