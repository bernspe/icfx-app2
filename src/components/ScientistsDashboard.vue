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
  MDBSelect,
} from 'mdb-vue-ui-kit'
import {computed, onMounted, ref, watch} from "vue";
import {user_store} from "../user_store";
import {app_store, ICFItemStructure, ICFStruct} from "../app_store";

import ICFResultBarGraph from "./ICFResultBarGraph.vue";
import {useRoute, useRouter} from "vue-router";
import WhodasResultBarGraphByPatientCase from "./WhodasResultBarGraphByPatientCase.vue";
import ResultDescriptiveStatisticsWholeInstitution from "./ResultDescriptiveStatisticsWholeInstitution.vue";
import {roles} from "../constants";
import {backendURL} from "../process_vars";
import axios, {AxiosRequestConfig} from "axios";
import color_codes from "../assets/icf_eval_color_coding.json"

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
  columns: ["Pseudonym", "patient_case", "ID"],
  rows: user_store.getState().userdata?.filter(x => x.groups.includes('patient')).map(u => ([u.pseudonym, u.patient_case, u.id])) || []
}

const collectSelectedPatients = (rows: Array<any>) => {
  selectedPatients.value = rows
}

const selectedPatients = ref([{pseudonym: '', patient_case: '', id: ''}])

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
  datasetRows.value = rows
}
const datasetRows = ref<Array<RowStructure>>()

const icf_eval_options = ref(
    Object.keys(color_codes).map((eval_method,idx)=>({text: eval_method,value:idx}))
);

const eval_selected = ref('');
const getColorFromICFItemLogic = (item: ICFStruct | string | undefined) => {
  if (item===undefined) return 'white'
  if (typeof item === 'string') {
    return 'white'
  }
  if (<ICFStruct>item) {
    let eval_method = icf_eval_options.value[Number(eval_selected.value)]?.text || 'select_status'
    let property = color_codes[eval_method]['prop']
    return (color_codes[eval_method]['eval'][(item[property]).toString()])
  }
}

const format = (icfdata:Record<string, ICFStruct>) => {
  let rows = []
  if (datasetRows?.value) {
    let icf_codes = Array.from(new Set(datasetRows.value.map(r => Object.keys(r.icfdata)).flat()))
    icf_codes.forEach((icfcode) => {
      let icf_content = datasetRows.value.map(r => r.icfdata)
      let r = [icfcode, ...icf_content.map(c => Object.keys(c).includes(icfcode) ? c[icfcode] : undefined)]
      rows.push(r)
    })


    return icf_codes.map(code => {
      return {
        backgroundColor: getColorFromICFItemLogic(icfdata[code]),
        fontWeight: 400
      };
    });
  }
}

const datasetIcfRows = computed(()=> {
  let columns=[]
  let rows=[]
  if (datasetRows?.value) {
    let patientslabels = datasetRows.value.map((r,idx) =>  ({label: r.patient + ': ' + r.id.toString(), field: idx.toString(), format: format(r.icfdata)}))
    columns = [{label:'ICF Code',field:'icfcode'}, ...patientslabels]
    let icf_codes = Array.from(new Set(datasetRows.value.map(r => Object.keys(r.icfdata)).flat()))
    icf_codes.forEach((icfcode) => {
      let icf_content = datasetRows.value.map(r=>r.icfdata)
      let r = [icfcode,...icf_content.map(c=>Object.keys(c).includes(icfcode) ? c[icfcode].value : undefined)]
      rows.push(r)
    })
  }
  return {columns, rows}
})

const excelGroupOptions = computed(() => roles.map((r, idx) => ({text: r.name, value: idx, group: r.group})))
const selectedGroup = ref('');

const excelDataSetOptions = ref([
  {text: 'WHODAS', value: 0, subset: 'whodas'},
  {text: 'Umweltfaktoren', value: 1, subset: 'env'},
  {text: 'ICFs', value: 2, subset: 'icf'},
  {text: 'SF-36', value: 3, subset: 'sf36'},
  {text: 'Bedienerfreundlichkeit', value: 4, subset: 'uxquestionnaire'}
])
const selectedDataSet = ref('');
const excelDataSetCompletenessOptions = ref([
  {text: 'WHODAS', value: 0, subset: 'whodas'},
  {text: 'Umweltfaktoren', value: 1, subset: 'env'},
  {text: 'ICFs', value: 2, subset: 'icf'},
  {text: 'SF-36', value: 3, subset: 'sf36'},
  {text: 'Bedienerfreundlichkeit', value: 4, subset: 'uxquestionnaire'}
])
const selectedDataSetForCompleteness = ref('')

interface Response {
  data: any;
}

function loadExcelTableFromApi(): Promise<Response> {
  return new Promise((resolve, reject) => {
    if (user_store.getState().authenticated) {
      var config: AxiosRequestConfig = {
        method: 'GET',
        url: backendURL() + `icfdata/getdataxls/`,
        responseType: 'blob',
        headers: {
          authorization: `Bearer ${user_store.getState().access_token}`,
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        },
        params: {
          subsets: selectedDataSet.value ? selectedDataSet.value.split(',').map(i => excelDataSetOptions.value[Number(i)].subset).join(',') : undefined,
          subgroups: selectedGroup.value ? selectedGroup.value.split(',').map(i => excelGroupOptions.value[Number(i)].group).join(',') : undefined,
          dropna: selectedDataSetForCompleteness.value ? selectedDataSetForCompleteness.value.split(',').map(i => excelDataSetOptions.value[Number(i)].subset).join(',') : undefined,
        }
      };
      axios(config).then((response) => {
        resolve(response)
      }).catch((e) => {
        console.log('Retrieval of Excel Table failed: ', e)
        reject(e);
      })
    } else reject('Not authenticated')
  })
}

function createExcel() {
  loadExcelTableFromApi().then(response => {
    const blob = new Blob([response.data]);
    var dllink = document.createElement('a');
    dllink.href = URL.createObjectURL(blob)
    dllink.setAttribute("download", `icfx-dataset.xlsx`);
    dllink.click()
  })
}

const copyTokenToClipboard = () => {
  navigator.clipboard.writeText(user_store.getState().access_token);

  // Alert the copied text
  alert("Access token copied to clipboard");
}

onMounted(() => {
  if (user_store.getState().userdata?.length === 0) {
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

      <MDBRow class="m-2" v-if="datasetRows">
        <h2 class="text-primary">Whodas</h2>
        <WhodasResultBarGraphByPatientCase :datarows="datasetRows" v-if="datasetRows"/>

      </MDBRow>

      <MDBRow class="m-2" v-if="datasetRows">
        <MDBCol>
        <h2 class="text-primary">ICFs</h2>
          </MDBCol>
        <MDBCol>
          <MDBBtn color="tertiary" @click="loadIcfs"><MDBIcon icon="refresh" class="me-2"/>Refresh</MDBBtn>
        </MDBCol>
        <h3 class="text-secondary">ICF Rohdaten</h3>
        <MDBSelect label="Evaluation Color Coding" v-model:options="icf_eval_options" v-model:selected="eval_selected" />
        <ul class="color-legend">
          <li class="color-legend-item" v-for="(color, key) in color_codes[icf_eval_options[Number(eval_selected)].text]['eval']">
            {{ key }} : <span :style="{backgroundColor: color}">{{ color }}</span></li>
        </ul>
         <MDBDatatable :dataset="datasetIcfRows" :loading="loadingIcfs" :key="eval_selected"/>
        <h3 class="text-secondary">ICF Chart</h3>
        <ICFResultBarGraph :datarows="datasetRows" v-if="datasetRows"/>
      </MDBRow>

      <MDBRow class="m-2">
        <h2 class="text-primary">Excel - Area</h2>
        <p>Configure your Excel Download</p>
        <MDBRow>
          <MDBCol>
            <MDBSelect v-model:options="excelGroupOptions" label="Included Groups" v-model:selected="selectedGroup"
                       multiple/>
          </MDBCol>
          <MDBCol>
            <MDBSelect v-model:options="excelDataSetOptions" label="Included Datasets"
                       v-model:selected="selectedDataSet" multiple/>
          </MDBCol>
          <MDBCol>
            <MDBSelect v-model:options="excelDataSetCompletenessOptions" label="Enforce Completeness"
                       v-model:selected="selectedDataSetForCompleteness" multiple/>
          </MDBCol>
          <MDBCol>
            <MDBBtn color="primary" @click="createExcel"><MDBIcon icon="table" size="lg" class="me-2"/>Download Excel</MDBBtn>
          </MDBCol>
        </MDBRow>
      </MDBRow>

      <MDBRow class="m-2 mt-4">
        <h2 class="text-primary">REST-API Area</h2>

        <h3 class="text-secondary">Access Token</h3>
        <p>Use this Token in your REST API requests.</p>
        <MDBRow class="d-flex align-items-bottom">
          <MDBCol>
            <p class="text-primary">{{ user_store.getState().access_token }}</p>
          </MDBCol>
          <MDBCol>
            <MDBBtn color="primary" @click="copyTokenToClipboard">
              <MDBIcon icon="clipboard" size="lg" class="me-2"/>
              Copy to Clipboard
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </MDBRow>
    </MDBCardBody>
  </MDBCard>
</template>

<style scoped>
.color-legend-item {
  display: inline-block;
  margin-inline: 2rem;
}
</style>