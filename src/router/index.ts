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
    },

        {   path:"/moduleintro/:module/:patientid", name:'intro', component: () => import("../components/ModuleIntro.vue"),
            props:true

    },
        {   path:"/modulefinish/:module/:patientid", name:'finish', component: () => import("../components/ModuleFinish.vue"),
            props:true

    },

    {   path:"/patientdata/env/:patientid/:item", name:'whodas', component: () => import("../components/EnvItem.vue"),
            props:true

    },
       {   path:"/patientdata/whodas/:patientid/:item", name:'env', component: () => import("../components/WhodasItem.vue"),
            props:true

    },
        {   path:"/patientdata/:whodas_or_env-detail/:patientid/:item", name:'whodasdetail', component: () => import("../components/WhodasEnvDetail.vue"),
            props:true

    },
            {   path:"/patientresult/whodas/:patientid", name:'whodasresult', component: () => import("../components/WhodasResult.vue"),
            props:true

    },
                {   path:"/patientresult/env/:patientid", name:'envresult', component: () => import("../components/EnvResult.vue"),
            props:true

    },
        {   path:"/patientdata/icf/:patientid/:code", name:'icf', component: () => import("../components/ICFItem.vue"),
            props:true

    },
            {   path:"/patientdata/icf-detail/:patientid/:code", name:'icf-detail', component: () => import("../components/ICFDetail.vue"),
            props:true
    },
                {   path:"/patientresult/icf/:patientid", name:'icfresult', component: () => import("../components/ICFResult.vue"),
            props:true

    },
        {   path:"/patientdata/sf36/:patientid/:item", name:'sf36', component: () => import("../components/SF36Item.vue"),
            props:true
    },
                {   path:"/patientresult/sf36/:patientid", name:'sf36result', component: () => import("../components/SF36Result.vue"),
            props:true

    },
        {
        path: "/patientlist/:medprofid?",
        name: "patientlist",
        component: () => import("../components/PatientList.vue"),
            props: true,

    },
            {
        path: "/medproflist",
        name: "MedProfList",
        component: () => import("../components/MedProfList.vue"),

    },{
            path: "/medview/:patientid?",
        name: "MedProfView",
        component: () => import("../components/MedProfMain.vue"),
        props: true,
    },
        {
        path: "/adminview",
        name: "AdminView",
        component: () => import("../components/AdminDashboard.vue"),
        meta: {requiresAuth: true},
    },
    ]

const router = createRouter({
    history: createWebHistory(),
    routes,
});

let intervalID: number;

router.beforeEach((to, from, next) => {
 if (intervalID) {
     clearInterval(intervalID);
     user_store.add_new_time_per_page()
 }
   next()
})


router.afterEach((to, from) => {
   intervalID = setInterval(()=> {
        user_store.increment_last_time_per_page(1)
  }, 1000);
})
export default router;