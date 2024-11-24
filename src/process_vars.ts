const mode = () => import.meta.env.VITE_STAGE

const frontendURL = () => import.meta.env.VITE_FRONTEND_URL
const backendURL = () => import.meta.env.VITE_BACKEND_URL

const imageServer = () => import.meta.env.VITE_IMAGE_SERVER
const backendClientId = () => import.meta.env.VITE_CLIENT_ID
const backendClientKey = () => import.meta.env.VITE_CLIENT_KEY

const default_password = () => import.meta.env.VITE_DEFAULT_PASSWORD

export {mode,frontendURL,backendURL,imageServer,backendClientId,backendClientKey,default_password}