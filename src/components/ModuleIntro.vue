<script setup lang="ts">

import {MDBCard, MDBCardHeader, MDBCardFooter, MDBCardBody, MDBCol, MDBRow, MDBCardImg} from "mdb-vue-ui-kit";
import {AuspraegungBeschwerden, UmweltFaktoren} from "../constants";
import {app_store} from "../app_store";
import {computed} from "vue";
import {user_store} from "../user_store";
import moment from "moment";
import _sf36 from '../assets/sf36_de.json'
import _ from "lodash";
import {imageServer} from "../process_vars";

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

const nextUrl = computed(() => {
  return `/patientdata/${props.module}/${props.patientid}/${introtext[props.module].startItem}`
})

const expectedModuleTime = (numberOfItems:number)=> {
  let m = moment.duration(_.mean(user_store.getState().times_per_page)*numberOfItems*introtext[props.module].timeFactor,'seconds')
  let result = Math.ceil(m.asMinutes())
  return result.toString() + ' ' + (result===1 ? 'Minute' : 'Minuten')
}

const introtext: Record<string, any> = {
  whodas: {
    heading: 'Der WHODAS-Fragebogen',
    expl: `In den folgenden Fragen möchten wir von Ihnen wissen, ob und wie stark Sie im Alltag beeinträchtigt sind. Bitte geben Sie an, in welchem Maß Sie Probleme oder Einschränkungen in den genannten Bereichen erleben.
 Für jede Frage stehen Ihnen die Antwortoptionen von ${AuspraegungBeschwerden[0]} bis ${AuspraegungBeschwerden[4]} zur Verfügung. Wählen Sie bitte die Antwort, die am besten auf Ihre aktuelle Situation zutrifft. Es gibt keine richtigen oder falschen Antworten – wichtig ist Ihre persönliche Einschätzung.`,
    numberquestions: 12,
    startItem: '1',
    timeFactor: 0.7,
  },
  env: {
    heading: 'Umweltfaktoren',
    expl: `Wir alle sind in unterschiedlichem Maß von unserer Umgebung abhängig. Einige Umwelteinflüsse können uns unterstützen, während andere hinderlich sein können. Auf den nächsten 5 Seiten bitten wir Sie, anzugeben, ob die genannten Faktoren für Sie störend (NEGATIV), hilfreich (POSITIV), beides oder neutral (Weder noch) sind.`,
    numberquestions: 5,
    startItem: '1',
        timeFactor: 1,
  },
  icf: {
    heading: 'Die ICF Auswahl',
    expl: `Aus Ihren vorangegangenen Antworten haben wir bestimmte Dinge zusammengestellt, die aus unserer Sicht wichtig für Ihr Leben sind. Bitte geben Sie an, wie stark Ihre Probleme sind (Begriffe von ${AuspraegungBeschwerden[0]} bis ${AuspraegungBeschwerden[4]}) oder Dinge Sie beeinträchtigen (${UmweltFaktoren[0]} bis ${UmweltFaktoren[3]}) oder Ihnen helfen (${UmweltFaktoren[5]} bis ${UmweltFaktoren[8]}).`,
    numberquestions: Object.keys(app_store.getState().patient_data.icf || {}).length,
    startItem: Object.keys(app_store.getState().patient_data.icf)[0],
        timeFactor: 0.6,
  },
  icf_medprof: {
    heading: 'Die ICF Auswahl',
    expl: `Aus den Coresets haben wir nun die ICF Items generiert. Bitte versuchen Sie, die Probleme Ihres Patienten zu quantifizeren (Begriffe von ${AuspraegungBeschwerden[0]} bis ${AuspraegungBeschwerden[4]}) und eine Wichtung der Kontextfaktoren vorzunehmen (${UmweltFaktoren[0]} bis ${UmweltFaktoren[8]}).`,
    numberquestions: Object.keys(app_store.getState().patient_data.icf || {}).length,
    startItem: Object.keys(app_store.getState().patient_data.icf)[0],
        timeFactor: 1.2,
  },
  sf36: {
    heading: 'Der SF36 Fragebogen',
    expl: 'In diesem Fragebogen werden verschiedene Aspekte Ihrer Gesundheit und Lebensqualität erfasst. Bitte nehmen Sie sich noch einmal die Zeit, um diese wichtigen Fragen zu beantworten.',
    numberquestions: 36,
    startItem: sf36_keys.value[0],
        timeFactor: 0.6,
  }
}

</script>

<template>
  <MDBCard class="m-2 p-2 text-center d-flex justify-content-center">
    <MDBCardImg top style="max-height: 200px; width: auto; object-fit: contain" :src="imageServer()+`module-types/${props.module}.png`" />
    <MDBCardHeader>
      <h1>{{ introtext[props.module].heading }}</h1>
    </MDBCardHeader>
    <MDBCardBody>
      <p v-if="((module==='icf') && !isPatient)">{{ introtext.icf_medprof.expl }}</p>
      <p v-else>{{ introtext[props.module].expl }}</p>
      <p class="text-secondary">Geschätzte Bearbeitungsdauer: {{ expectedModuleTime(introtext[props.module].numberquestions) }}</p>
    </MDBCardBody>
    <MDBCardFooter>
      <MDBRow>
        <MDBCol class="justify-content-start" v-if="backUrl">
          <router-link :to="backUrl">Zurück</router-link>
        </MDBCol>

        <MDBCol class="justify-content-end" v-if="nextUrl">
          <router-link :to="nextUrl"> Weiter</router-link>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
  </MDBCard>
</template>

<style scoped>

</style>