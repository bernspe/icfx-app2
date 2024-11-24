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
  let m = moment.duration(_.mean(user_store.getState().times_per_page)*numberOfItems,'seconds')
  let result = Math.ceil(m.asMinutes())
  return result.toString() + ' ' + (result===1 ? 'Minute' : 'Minuten')
}

const introtext: Record<string, any> = {
  whodas: {
    heading: 'Der WHODAS-Fragebogen',
    expl: `In den folgenden 12 Fragen geben Sie bitte Einschränkungen im täglichen Leben an. Bitte benutzen Sie dazu die vorgegebenen Begriffe von ${AuspraegungBeschwerden[0]} bis ${AuspraegungBeschwerden[4]}.`,
    numberquestions: 12,
    startItem: '1',
  },
  env: {
    heading: 'Umweltfaktoren',
    expl: `Wir sind alle mehr oder weniger auf ein gutes Zusammenspiel mit unserer Umwelt angewiesen. Manche Dinge stören uns, andere wiederum helfen uns. Bitte geben Sie auf den folgenden 5 Seiten an, ob diese Faktoren Sie stören (Auswahl NEGATIV), Ihnen helfen (POSITIV) oder Sie gar nicht besonders beeinflussen (Weder noch).`,
    numberquestions: 5,
    startItem: '1',
  },
  icf: {
    heading: 'Die ICF Auswahl',
    expl: `Aus Ihren vorangegangenen Antworten haben wir bestimmte Dinge zusammengestellt, die aus unserer Sicht wichtig für Ihr Leben sind. Bitte geben Sie an, wie stark Ihre Probleme sind (Begriffe von ${AuspraegungBeschwerden[0]} bis ${AuspraegungBeschwerden[4]}) oder Dinge Sie beeinträchtigen (${UmweltFaktoren[0]} bis ${UmweltFaktoren[3]}) oder Ihnen helfen (${UmweltFaktoren[5]} bis ${UmweltFaktoren[8]}).`,
    numberquestions: Object.keys(app_store.getState().patient_data.icf || {}).length,
    startItem: Object.keys(app_store.getState().patient_data.icf)[0],
  },
  sf36: {
    heading: 'Der SF36 Fragebogen',
    expl: 'In diesem Fragebogen werden verschiedene Aspekte von Gesundheit und Lebensqualität abgefragt. Bitte nehmen Sie sich noch einmal die Zeit für diese wichtigen Angeöegenheiten.',
    numberquestions: 36,
    startItem: sf36_keys.value[0],
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
      <p>{{ introtext[props.module].expl }}</p>
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