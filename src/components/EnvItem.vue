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
  MDBBtn, MDBSpinner
} from 'mdb-vue-ui-kit'

import {WhodasEnvItemStructure} from "../app_store";
import __env from '../assets/env_factors_de.json'

const _env: Record<string, WhodasEnvItemStructure> = __env;
import {computed, onMounted, ref, watch} from "vue";
import {AuspraegungBeschwerden, UmweltFaktoren} from "../constants";
import {app_store, type DataStore} from "../app_store";
import {onBeforeRouteLeave, onBeforeRouteUpdate} from "vue-router";
import {imageServer} from "../process_vars";
import {VueScrollPicker} from "vue-scroll-picker";


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


const scroll_optionslist = ref([
  {name: 'POSITIV', value: 5, icon:'thumbs-up'} ,{name: 'POSITIV und NEGATIV', value: 9, icon: 'plus-minus'},{name: 'NEGATIV', value: 3, icon:'thumbs-down'}, {name: 'Weder noch', value: 4, icon: 'circle-xmark'},
])



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
        class="image-blurred-edge"
    />

    <MDBCardHeader>
      <p class="text-primary">{{ env[Number(item) - 1].t }}</p>

      <router-link :to="`/patientdata/env-detail/${patientid}/${item}`">
        Was soll das bedeuten?
        <MDBIcon class="ms-3" icon="circle-info"></MDBIcon>
      </router-link>

    </MDBCardHeader>

    <MDBCardBody class="m-0 p-0">
      <MDBRow>


      </MDBRow>

          <VueScrollPicker
              :options="scroll_optionslist"
              v-model:model-value="result"
              style="font-size: 20px">
      <template #default="{ option }">
        <div class="custom-option">
          <MDBIcon class="custom-option-icon" :icon="option.icon" />
          <span>{{ option.name }}</span>
        </div>
      </template>

          </VueScrollPicker>

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

<style scoped>
.custom-option {
  padding: 2px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.custom-option-icon {
  width: 20px;
  height: 20px;
  margin-right:10px;
  fill: currentColor;
}
</style>
