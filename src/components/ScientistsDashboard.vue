<script setup lang="ts">
import {
  MDBDatatable,
  MDBBtn,
  MDBIcon,
  MDBInput,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBCardFooter,
  MDBContainer,
  MDBCheckbox
} from 'mdb-vue-ui-kit'
import {computed, onMounted, ref, watch} from "vue";
import {user_store} from "../user_store";
import {app_store, ICFItemStructure, ICFStruct} from "../app_store";

import ICFResultBarGraph from "./ICFResultBarGraph.vue";
import {useRoute, useRouter} from "vue-router";
import WhodasResultBarGraphByPatientCase from "./WhodasResultBarGraphByPatientCase.vue";
import ResultDescriptiveStatisticsWholeInstitution from "./ResultDescriptiveStatisticsWholeInstitution.vue";

export interface RowStructure {
  content: string,
  creator: string,
  creatorgroup: string,
  date: string,
  icfdata: Record<string, ICFStruct>,
  id: string,
  merge: string,
  patient: string,
  whodas: Record<string, number>,
  env: Record<string, number>,
  coreset: string,
  sf36: Record<string, number>,
  patient_case: string
}


const router = useRouter()
const route = useRoute()

const searchPatient = ref('')

const datasetPatients = {
  columns: ["Pseudonym","patient_case", "ID"],
  rows: user_store.getState().userdata?.filter(x => x.groups.includes('patient')).map(u => ([u.pseudonym, u.patient_case, u.id])) || []
}

const collectSelectedPatients = (rows: Array<any>) => {
  selectedPatients.value = rows
}

const selectedPatients = ref([{pseudonym: '',patient_case:'', id: ''}])

const loadIcfs = () => {
  if (selectedPatients.value) {
    loadingIcfs.value = true
    datasetIcfs.value.rows = []
    selectedPatients.value.forEach(patient => {
      app_store.loadDataFromApi(patient.id).then(r => {
        r.forEach(d => {
          let ud = user_store.getState().userdata
          let idx = ud.map(u => u.id).indexOf(d.creator)
          let creatorgroup = idx > -1 ? ud[idx].groups[0] : ''
          let creatorpseudonym = idx > -1 ? ud[idx].pseudonym : ''
          let content = `ICF (${d.icf ? Object.keys(d.icf).length : 0})`
          let t = {
            patient: patient.pseudonym,
            date: d.date,
            creator: creatorpseudonym,
            creatorgroup: creatorgroup,
            content: content,
            merge: d.merge ? d.merge.operation : 'N',
            id: d.id,
            icfdata: d.icf,
            whodas: d.whodas,
            env: d.env,
            coreset: d.coreset,
            sf36: d.sf36,
            patient_case: patient.patient_case,
          }
          if (datasetIcfs.value.rows) datasetIcfs.value.rows.push(t)
          else datasetIcfs.value.rows = [t]
        })
      }).finally(() => loadingIcfs.value = false)
    })
  }
}

const loadingIcfs = ref(false)
const datasetIcfs = ref({
  columns: ['Patient', 'Date', 'Creator', 'CreatorGroup', 'Content', 'Merge', 'ID'],
  rows: []
})

const loadIcfRows = (rows: Array<RowStructure>) => {
  icfRows.value = rows
}
const icfRows = ref<Array<RowStructure>>()


const copyTokenToClipboard = () => {
  navigator.clipboard.writeText(user_store.getState().access_token);

  // Alert the copied text
  alert("Access token copied to clipboard");
}

onMounted(()=> {
  if (user_store.getState().userdata?.length===0) {
    router.push('/')
  }
})
</script>

<template>
  <MDBCard class="m-3">
    <MDBCardHeader>
      <h1 class="text-secondary">Scientists Dashboard</h1>
    </MDBCardHeader>
    <MDBCardBody class="p-2">
      <h2 class="text-secondary">
        Deskriptive Statistik
      </h2>
      <MDBRow>
          <ResultDescriptiveStatisticsWholeInstitution/>
      </MDBRow>

      <h2 class="text-secondary">
        ICF Verteilung
      </h2>
      <MDBRow>
        <MDBCol md="4">
          <h3 class="text-secondary">Patientenauswahl</h3>
          <MDBInput class="mb-4" v-model="searchPatient"/>
          <MDBDatatable :dataset="datasetPatients" :search="searchPatient" selectable multi
                        @selected-rows="collectSelectedPatients"/>
        </MDBCol>
        <MDBCol md="8">
          <MDBRow>
            <MDBCol>
              <MDBBtn color="primary" @click="loadIcfs">ICFs laden</MDBBtn>
            </MDBCol>
            <MDBCol><h3 class="text-secondary">Datensatzauswahl</h3></MDBCol>

          </MDBRow>
          <MDBDatatable :dataset="datasetIcfs" :loading="loadingIcfs" selectable multi
                        @selected-rows="loadIcfRows"/>

        </MDBCol>
      </MDBRow>

      <MDBRow class="m-2">
      <h2 class="text-primary">Whodas</h2>
      <WhodasResultBarGraphByPatientCase :datarows="icfRows" v-if="icfRows"/>

        </MDBRow>

      <MDBRow class="m-2">
      <h2 class="text-primary">ICFs</h2>
      <ICFResultBarGraph :datarows="icfRows" v-if="icfRows"/>
</MDBRow>


      <h2 class="text-secondary">Access Token</h2>
      <h4 class="text-primary">{{ user_store.getState().access_token }}
        <MDBBtn class="ms-3" color="tertiary" @click="copyTokenToClipboard">
          <MDBIcon icon="clipboard" size="lg" class="me-2"/>
          Copy to Clipboard
        </MDBBtn>
      </h4>
    </MDBCardBody>
  </MDBCard>
</template>

<style scoped>

</style>