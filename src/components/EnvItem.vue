<script setup lang="ts">
import {
  MDBCard,
  MDBCardImg,
  MDBCardTitle,
  MDBCardBody,
  MDBCardFooter,
  MDBRow,
  MDBCol,
  MDBProgressBar, MDBProgress, MDBIcon, MDBCardHeader,
  MDBBtn, MDBSpinner, MDBAnimation, MDBListGroup, MDBListGroupItem
} from 'mdb-vue-ui-kit'

import {WhodasEnvItemStructure} from "../app_store";
import __env from '../assets/env_factors_de.json'

const _env: Record<string, WhodasEnvItemStructure> = __env;
import {computed, onMounted, provide, ref, watch} from "vue";
import {app_store, type DataStore} from "../app_store";
import {onBeforeRouteLeave, onBeforeRouteUpdate} from "vue-router";
import {imageServer} from "../process_vars";

import MetricsComponent from "./MetricsComponent.vue";
import SpeechTextInput from "./SpeechTextInput.vue";
import ExplanationComponent from "./ExplanationComponent.vue";


const props = defineProps({
  patientid: {type: String},
  item: {type: String, required: true}
})

const navigate = ref(false)

function get_random(list: Array<String>) {
  return list[Math.floor((Math.random() * list.length))];
}

const percentDone = computed(() => {
  return Math.floor(Number(props.item) / 5 * 100)
})

const current_img = computed(() => {
  return get_random(env.value[Number(props.item) - 1]?.p)
})

const env = computed(() => {
  return Object.values(_env)
})

const toggleExplanation = ref(false);
provide('toggleExplanation', toggleExplanation)
const toggleComment = ref(false);

const backUrl = computed(() => {
  if (Number(props.item) > 1) return `/patientdata/env/${props.patientid}/${Number(props.item) - 1}`
  else return `/patientview/${props.patientid}`
})

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})

const nextUrl = computed(() => {
  if (Number(props.item) < env.value.length) return `/patientdata/env/${props.patientid}/${Number(props.item) + 1}`
  else return `/modulefinish/env/${props.patientid}/`
})





const result = computed({
  get: () => {
    let data = app_store.getState().patient_data.env
    let ks = Object.keys(data || {})
    if (ks.includes(props.item)) {
      return Number(data[props.item])
    } else {
      return 4
    }
  },
  set: (val) => {
    let data: DataStore = app_store.getState().patient_data
    data = {...data, env: {...app_store.getState().patient_data.env, [props.item]: val}}
    app_store.setCurrentData(data)
  }
})

provide('result',result)

const calculated_data = computed(() => {
  let data: DataStore = app_store.getState().patient_data
  data = {...data, env: {...app_store.getState().patient_data.env, [props.item]: result.value}}
  return data
})



onBeforeRouteLeave((to, from) => {
  navigate.value=true
  app_store.saveDataToApi(calculated_data.value).finally(() => {
    navigate.value=false
    return true
  })
})


// same as beforeRouteUpdate option but with no access to `this`
onBeforeRouteUpdate(async (to, from) => {
  navigate.value=true
    toggleComment.value=false
  toggleExplanation.value=false
  app_store.saveDataToApi(calculated_data.value).finally(() => {
     navigate.value=false
    return true
  })
})

</script>

<template>
  <MDBCard class="m-2 p-2 text-center d-flex justify-content-center">

    <MDBProgress class="m-2" :height="20">
      <MDBProgressBar :value="percentDone" animated bg="success">
        Geschafft: {{ percentDone }}%
      </MDBProgressBar>
    </MDBProgress>


    <img
        :src="imageServer()+`env-pics/version-1/${current_img}`"
        :alt="`Kontextfaktoren-Bild ${item}`"
        style="max-height:280px;max-width:100%; object-fit: contain; border-radius:10px;"
        class="image-blurred-edge mainpic"
    />

    <MDBCardBody class="m-0 p-0 text-center">
      <MDBRow class="mb-4">
        <h2 class="text-primary mt-2">{{ env[Number(item) - 1].s }}</h2>
        <ExplanationComponent :explanations="env[Number(item) - 1].e" :code="item" module="env" />
        <p v-html="env[Number(item) - 1].t"></p>
        <MDBCol>
        <MDBBtn :color="toggleExplanation ? 'secondary' : 'primary'" @click="toggleExplanation=!toggleExplanation"><MDBIcon icon="info-circle" class="me-2" size="lg"></MDBIcon><span>Hinweis</span></MDBBtn>
     </MDBCol>
      </MDBRow>

 <MDBRow>
   <MetricsComponent module="env" :item="item"/>
 </MDBRow>

        <MDBBtn color="tertiary" @click="toggleComment=!toggleComment"><MDBIcon icon="circle-exclamation" size="lg" class="me-2"></MDBIcon>Mein Kommentar oder Problem</MDBBtn>
        <MDBRow v-if="toggleComment" class="m-2">
          <MDBCol class="d-flex justify-content-center">
          <SpeechTextInput :refcode="'env_'+item"/>
            </MDBCol>
        </MDBRow>

    </MDBCardBody>
    <MDBCardFooter>
      <MDBRow class="d-flex align-items-center">
        <MDBCol class="justify-content-start">
          <router-link :to="backUrl">Zurück</router-link>
        </MDBCol>
        <MDBCol class="justify-content-center">
          <router-link :to="upUrl">Abbruch</router-link>
        </MDBCol>
        <MDBCol class="justify-content-end">
          <router-link :to="nextUrl">Weiter</router-link>
          <MDBSpinner v-if="navigate" class="ms-3" color="primary" size="sm" />
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>
</template>

<style>
.imgcontainer {
  position: relative;
}


.mainpic {
  padding: 2px;
}

.secondarypic {
  background-color: white;
  border-radius: 50%;
  position: absolute;
  bottom: 10%;
  right: 10%;
  width: 70px;
  border: 3px dotted blue;
  box-shadow: grey 3px 3px 5px;
  opacity: 70%;
  padding: 3px;
}



ul {
    text-align: center;
    list-style-position: inside;
}
</style>
