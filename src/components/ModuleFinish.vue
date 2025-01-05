<script setup lang="ts">

import {MDBCard, MDBCardHeader, MDBCardFooter, MDBCardBody, MDBCol, MDBRow, MDBCardImg, MDBListGroup, MDBListGroupItem, MDBBtn, MDBIcon} from "mdb-vue-ui-kit";
import {app_store, type ICFStruct} from "../app_store";
import {computed} from "vue";
import {user_store} from "../user_store";
import _sf36 from '../assets/sf36_de.json'
import {WhodasEnvItemStructure} from "../app_store";
import __whodas from '../assets/whodas12_de.json';
import __env from '../assets/env_factors_de.json'
const _whodas: Record<string, WhodasEnvItemStructure> = __whodas;
const _env: Record<string, WhodasEnvItemStructure> = __env;
import {imageServer} from "../process_vars";
import {useRoute, useRouter} from "vue-router";

const router = useRouter()
const route = useRoute()

const sf36_keys = computed(() => Object.keys(_sf36))

const props = defineProps<{
  module: string,
  patientid: string,
}>()

const isPatient = computed(() => user_store.getState().groups.includes('patient'))

const backUrl = computed(() => {
  if (isPatient.value) return `/patientview/${props.patientid}`
  else return `/medview/${props.patientid}`
})

const nextModuleUrl = computed(()=> {
  let ks =  Object.keys(finishtext)
  let i =ks.indexOf(props.module)
  if (i<ks.length-1) {
    return `/moduleintro/${ks[i+1]}/${props.patientid}`
  }
})

const repeatUrl = computed(() => {
  return `/patientdata/${props.module}/${props.patientid}/${finishtext[props.module].startItem}`
})

const resultUrl = computed(()=> {
  return `/patientresult/${props.module}/${props.patientid}/`
})

const icfRepeatWPatient = computed(()=> {
    return `/medview/${props.patientid}/patient`
})

const finishtext: Record<string, any> = {
  whodas: {
    heading: 'WHODAS Fragebogen',
    expl: `Sie haben den WHODAS-Fragebogen erfolgreich abgeschlossen. Damit haben wir nun ein klares Bild Ihrer Herausforderungen im Alltag gewonnen. Probleme lassen sich oft mit einer Mauer vergleichen, die es zu überwinden gilt – und Sie haben den ersten Schritt dazu bereits gemacht. Herzlichen Glückwunsch, Sie haben sich ein Abzeichen verdient!`,
    pic: 'wall_looking_at.png',
    startItem: '1',
  },
  env: {
    heading: 'Umweltfaktoren Fragebogen',
    expl: `Wir wissen nun schon viel mehr darüber, was Ihnen hilft und was Ihnen zusätzliche Probleme bereitet.`,
    pic: 'wall_social.png',
    startItem: '1',
  },
  icf: {
    heading: 'ICF Auswahl',
    expl: `Sie haben es geschafft, über ${Object.keys(app_store.getState().patient_data.icf || {}).length} Einträge zu bearbeiten. Das ist eine gelungene Leistung. Die Probleme lassen sich nun relativ gut überblicken.`,
    pic: 'wall_looking_over.png',
    startItem: Object.keys(app_store.getState().patient_data.icf)[0],
  },
  sf36: {
    heading: 'SF36 Fragebogen',
    expl: 'Vielen Dank, dass Sie die zusätzlichen Fragen zur Lebensqualität mit beantwortet haben. Wir denken, dass Sie den richtigen Schritt gegangen sind, um ihre Mauer einstürzen zu lassen.',
    pic: 'wall_kick.png',
    startItem: sf36_keys.value[0],
  }
}


const icfsFromWhodasEnvData = () => {
  // return only those linked ICF items where whodas or env was marked as having a problem
  let targetObj: Record<string, ICFStruct> = {}
  let icf_keys = Object.keys(app_store.getState().patient_data.icf)
  Object.entries(app_store.getState().patient_data.whodas || {})
      .filter(([k, v]) => v > 0).map(([k, v]) => (_whodas[k].l.split(',')
      .filter((code: string) => code.length > 2).forEach((icfitem: string) => {
        targetObj[icfitem] = {value: v, selected: icf_keys.includes(icfitem) ? 1 : 0}
      })))
  Object.entries(app_store.getState().patient_data.env || {})
      .filter(([k, v]) => v !== 4).map(([k, v]) => (_env[k].l.split(',')
      .filter((code: string) => code.length > 2).forEach((icfitem: string) => {
        targetObj[icfitem] = {value: (v === 9) ? 4 : v, selected: icf_keys.includes(icfitem) ? 1 : 0}
      })))
  Object.entries(app_store.getState().patient_data.icf || {}).forEach(([code, icfitem]) => {
    targetObj[code] = icfitem
  })
  return targetObj
}

const finishModuleAndJumpToNext = () => {
  app_store.setCurrentData({...app_store.getState().patient_data, icf: icfsFromWhodasEnvData()})
  app_store.set_active_icf('')
  if (nextModuleUrl.value) router.push(nextModuleUrl.value)
  else router.push(backUrl.value)
}
</script>

<template>
  <MDBCard class="m-2 p-2 text-center d-flex justify-content-center">
    <MDBCardImg top style="max-height: 200px; width: auto; object-fit: contain" :src="imageServer()+`wall_pics/${finishtext[props.module].pic}`" />
    <MDBCardHeader>
      <h1>{{ finishtext[props.module].heading }}</h1>
    </MDBCardHeader>
    <MDBCardBody>
      <h2>Geschafft!</h2>
      <p>{{ finishtext[props.module].expl }}</p>

      <img :src="imageServer()+'gold-medal.png'">
      <MDBRow class="m-4" v-if="isPatient && nextModuleUrl">
        <MDBCol>
      <MDBBtn color="primary" @click="finishModuleAndJumpToNext" size="lg"><MDBIcon icon="award" class="me-2"/> Auf zur nächsten Herausforderung</MDBBtn>
          </MDBCol>
        </MDBRow>
      <MDBListGroup>

        <MDBListGroupItem v-if="module==='icf' && !isPatient">
          <router-link :to="icfRepeatWPatient">Die ICF-Items nochmal aus Sicht des Patienten</router-link>
        </MDBListGroupItem>

                <MDBListGroupItem>
          <router-link :to="backUrl">Weiter zur Übersicht</router-link>
        </MDBListGroupItem>
        <MDBListGroupItem v-if="repeatUrl">
          <router-link :to="repeatUrl">{{ finishtext[props.module].heading }} wiederholen</router-link>
        </MDBListGroupItem>
        <MDBListGroupItem>
          <router-link :to="resultUrl">Zwischenergebnisse anschauen</router-link>
        </MDBListGroupItem>

      </MDBListGroup>
    </MDBCardBody>

  </MDBCard>
</template>

<style scoped>

</style>