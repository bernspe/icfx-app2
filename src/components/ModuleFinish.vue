<script setup lang="ts">

import {MDBCard, MDBCardHeader, MDBCardFooter, MDBCardBody, MDBCol, MDBRow, MDBCardImg, MDBListGroup, MDBListGroupItem} from "mdb-vue-ui-kit";
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

const repeatUrl = computed(() => {
  return `/patientdata/${props.module}/${props.patientid}/${finishtext[props.module].startItem}`
})

const resultUrl = computed(()=> {
  return `/patientresult/${props.module}/${props.patientid}/`
})

const nextModuleUrl = computed(()=> {
  let ks =  Object.keys(finishtext)
  let i =ks.indexOf(props.module)
  if (i<ks.length-1) {
    return `/moduleintro/${ks[i+1]}/${props.patientid}}`
  }
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
      <h2>Wie möchten Sie nun weitermachen?</h2>
      <MDBListGroup>
        <!--
        <MDBListGroupItem v-if="nextModuleUrl">
          <router-link :to="nextModuleUrl">Gleich den nächsten Fragebogen beantworten</router-link>
        </MDBListGroupItem>
        -->
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