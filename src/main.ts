import "mdb-vue-ui-kit/css/mdb.min.css";

import {createApp} from "vue";
import "./style.css";
import App from "./App.vue";
import router from "./router";

import * as Sentry from "@sentry/vue";

const app = createApp(App);

Sentry.init({
  app,
  dsn: "https://8b42c64e4640f8df836f4ec4494a3468@o432741.ingest.us.sentry.io/4508675036282880",
  integrations: [
    Sentry.browserTracingIntegration({ router }),
    Sentry.replayIntegration(),
  ],
  // Tracing
  tracesSampleRate: 1.0, //  Capture 100% of the transactions
  // Session Replay
  replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
  replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
});


app.use(router)
    app.mount("#app");
