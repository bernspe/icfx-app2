import {createRouter, createWebHistory} from "vue-router";
import {user_store} from "../user_store";

const routes = [
    {
        path: "/",
        name: "Home",
        component: () => import("../components/BluntHome.vue"),
    },
    {
        path: "/patientview/:patientid?",
        name: "PatientView",
        component: () => import("../components/PatientMain.vue"),
        props: true,
        meta: {requiresAuth: true},
    },

    {
        path: "/moduleintro/:module/:patientid",
        name: 'intro',
        component: () => import("../components/ModuleIntro.vue"),
        props: true,
    },
    {
        path: "/modulefinish/:module/:patientid",
        name: 'finish',
        component: () => import("../components/ModuleFinish.vue"),
        props: true

    },

    {
        path: "/patientdata/env/:patientid/:item", name: 'whodas', component: () => import("../components/EnvItem.vue"),
        props: true,
        meta: {
            recordDuration: true,
            requiresAuth: true
        }

    },
    {
        path: "/patientdata/whodas/:patientid/:item",
        name: 'env',
        component: () => import("../components/WhodasItem.vue"),
        props: true,
        meta: {
            recordDuration: true,
            requiresAuth: true
        }

    },
    {
        path: "/patientdata/:whodas_or_env-detail/:patientid/:item",
        name: 'whodasdetail',
        component: () => import("../components/WhodasEnvDetail.vue"),
        props: true,
        meta: {requiresAuth: true},
    },
    {
        path: "/patientresult/whodas/:patientid",
        name: 'whodasresult',
        component: () => import("../components/WhodasResult.vue"),
        props: true,
        meta: {requiresAuth: true},

    },
    {
        path: "/patientresult/env/:patientid",
        name: 'envresult',
        component: () => import("../components/EnvResult.vue"),
        props: true,
        meta: {requiresAuth: true},

    },
    {
        path: "/patientdata/icf/:patientid/:code", name: 'icf', component: () => import("../components/ICFItem.vue"),
        props: true,
        meta: {
            recordDuration: true,
            requiresAuth: true
        }

    },
    {
        path: "/patientdata/icf-detail/:patientid/:code",
        name: 'icf-detail',
        component: () => import("../components/ICFDetail.vue"),
        props: true,
        meta: {requiresAuth: true},
    },
    {
        path: "/patientresult/icf/:patientid",
        name: 'icfresult',
        component: () => import("../components/ICFResult.vue"),
        props: true,
        meta: {requiresAuth: true},

    },
    {
        path: "/patientdata/sf36/:patientid/:item", name: 'sf36', component: () => import("../components/SF36Item.vue"),
        props: true,
        meta: {
            recordDuration: true,
            requiresAuth: true
        }
    },
        {
        path: "/patientdata/uxquestionnaire/:patientid/:item", name: 'uxquestionnaire', component: () => import("../components/UXQuestionnaireItem.vue"),
        props: true,
        meta: {
            recordDuration: true,
            requiresAuth: true
        }
    },
    {
        path: "/patientresult/sf36/:patientid",
        name: 'sf36result',
        component: () => import("../components/SF36Result.vue"),
        props: true,
        meta: {requiresAuth: true},

    },
    {
        path: "/patientlist/:medprofid?",
        name: "patientlist",
        component: () => import("../components/PatientList.vue"),
        props: true,
        meta: {requiresAuth: true},

    },
    {
        path: "/medproflist",
        name: "MedProfList",
        component: () => import("../components/MedProfList.vue"),
        meta: {requiresAuth: true},
    }, {
        path: "/medview/:patientid?/:preloadgroup?",
        name: "MedProfView",
        component: () => import("../components/MedProfMain.vue"),
        props: true,
        meta: {requiresAuth: true},
    },
    {
        path: "/icfbrowser/:patientid?",
        name: "ICFBrowser",
        component: () => import("../components/ICFBrowser.vue"),
        props: true,
        meta: {requiresAuth: true},
    },
    {
        path: "/scientistview",
        name: "ScientistView",
        component: () => import("../components/ScientistsDashboard.vue"),
        meta: {requiresAuth: true},
    },
    {
        path: "/register/:institution_id/:group?/:casenumber?",
        name: "register",
        component: () => import("../components/Register.vue"),
        props: true
    },
    {
        path: "/login/:institution_id?",
        name: "login",
        component: () => import("../components/Login.vue"),
        props: true
    },
    {
        path: "/logout",
        name: "logout",
        component: () => import("../components/Logout.vue"),
        meta: {requiresAuth: true},
    },
    {
        path: "/welcome",
        name: "Welcome",
        component: () => import("../components/WelcomePage.vue"),
        meta: {requiresAuth: true},
    },
        {
        path: "/patientcase/:casenumber",
        name: "PatientCase",
        component: () => import("../components/PatientCaseCard.vue"),
        meta: {requiresAuth: true},
            props:true
    },
        {
        path: "/leaderboard",
        name: "Leaderboard",
        component: () => import("../components/LeaderBoardView.vue"),
        meta: {requiresAuth: true},
    },
    {
        path: '/:pathMatch(.*)*',
        redirect: "/",
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

let intervalID: number;

router.beforeEach((to, from, next) => {
    if (intervalID) {
        clearInterval(intervalID);
        if (to.meta?.recordDuration) {
            user_store.add_new_time_per_page()
        }
    }

    if (to.name == 'login' || user_store.getState().mock_mode) {
        next()
    } else {

        if (to.meta.requiresAuth && !user_store.getState().authenticated) {
            // this route requires auth, check if logged in
            // if not, redirect to login page.
            user_store.connect_user_to_api().then(() => {
                next()
            }).catch(() =>
                next({
                    path: '/login',
                }))
        } else {
            next()
        }
    }

})


router.afterEach((to, from) => {
    if (to.meta?.recordDuration) {
        intervalID = setInterval(() => {
            user_store.increment_last_time_per_page(1)
        }, 1000);
    }
})
export default router;