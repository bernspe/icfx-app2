<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon
} from 'mdb-vue-ui-kit'
import _userdata from '../assets/mock-userdata.json'
import _coresets from '../assets/coresets.json'
import moment from "moment";
import {computed, onMounted, ref, watch} from "vue";
import type {DataStore, ICFItemStructure, ICFStruct} from "../app_store";
import {app_store} from "../app_store";


import PatientStatisticsComponent from "./PatientStatisticsComponent.vue";
import ICFThumbCard from "./ICFThumbCard.vue";
import InfoButton from "./InfoButton.vue";
import ICFThumbPanel from "./ICFThumbPanel.vue";
import ListHeader from "./ListHeader.vue";


const props = defineProps({patientid: {type: String, required: true}})
const patient = computed(() => {
  return _userdata.filter(p => p.id === props.patientid)[0]
})

const show_preload_switch = ref(false)
const preload_other_data = ref(false)

const api_data_store_size = computed(() => app_store.getState().api_patient_records.length)

const data = ref<DataStore>(app_store.emptyDataStore())


const loadDataSetFromApi = (d: DataStore) => {
  data.value = JSON.parse(JSON.stringify(d));
  loadCoreSetCheckBoxes()
  app_store.setCurrentData(data.value)
}

const core_options = ref(Object.entries(_coresets).map(([k, v], idx) => ({
  keycode: k,
  text: v.name,
  icfitems: v.items,
  value: idx,
  checked: false
})))

const loadCoreSetCheckBoxes = () => {
  core_options.value.forEach(code => code.checked = false)
        const coreset_array = data.value.coreset.toString().split(',')
      core_options.value.forEach((coreset,idx) => {
        if (coreset_array.includes(coreset.keycode)) {
          core_options.value[idx].checked = true
        }
      })
}

const selected_icf_keys = computed<Array<string>>(() => {
  return [...new Set(core_options.value.filter(o => o.checked).map(s => {
    return s.icfitems
  }).flat())]
})

const lastIcfEdited = computed(()=> {
   const vals = Object.values(data.value.icf || {})
  if (vals.length > 0) {
    let i = Object.values(data.value.icf || {}).map(x => x.selected != 0).lastIndexOf(true)
    if (i===-1) return 0
    else return i
  }
  else return 0
})

const icfEdited = computed(() => {
  const vals = Object.values(data.value.icf || {})
  if (vals.length > 0)
    return Math.ceil(vals.filter(x => x.selected != 0).length / vals.length * 100)
  else
    return 0
})
const showIcfDetails = ref(true)

const icfsFromCoresetData = computed(() => {
  let targetObj: Record<string, ICFStruct> = {}
  selected_icf_keys.value.forEach(code => {
    targetObj[code] = {value: code[0] === 'e' ? 4 : 0, selected: 0};
  })
  Object.entries(data.value?.icf || {}).forEach(([code, icfitem]) => {
    targetObj[code] = icfitem
  })
  return targetObj
})

const clearAll = () => {
  core_options.value.forEach(code => code.checked = false)
  data.value = app_store.emptyDataStore()
  app_store.setCurrentData(data.value)
  app_store.set_active_icf('')
}


const active_icf = computed(() => app_store.getState().active_icf)
watch(active_icf, (newVal, oldVal) => {
  if (oldVal && props.patientid && preload_other_data.value) app_store.loadDataFromApi(props.patientid)
})

const preloadData = (autoassign: boolean) => {
  if (props.patientid) {
    app_store.set_current_patient_id(props.patientid)
    app_store.loadDataFromApi(props.patientid).then(r => {
      // fuse data from API and from Store if Store contains values
      //patients_api_records.value = r
      let p = app_store.emptyDataStore()

      if (preload_other_data.value) {
        p.icf = r[0].icf
        p.coreset = r[0].coreset
        p.date = r[0].date || moment().format()
      }
      if (r.length !== 0) show_preload_switch.value = true
      // aktuelle Daten
      let s = Object.values(app_store.getState().patient_data).some(v => Object.keys(v).length > 0) ? app_store.getState().patient_data : app_store.emptyDataStore()
      if (autoassign) {
        data.value = Object.assign({}, p)
      } else
        data.value = Object.assign({}, s)
      loadCoreSetCheckBoxes()

      app_store.setCurrentData(data.value)
      app_store.set_active_icf('')
    })
  }
}

watch(icfsFromCoresetData, (newVal, oldVal) => {
  app_store.setCurrentData({...data.value, icf: newVal, coreset: core_options.value.filter(coreset=>coreset.checked).map(coreset=>coreset.keycode).join(',')})
  app_store.set_active_icf('')
})

watch(preload_other_data, (newVal, oldVal) => {
  preloadData(newVal)
})

onMounted(() => {
  preloadData(preload_other_data.value)

})
</script>

<template>
  <MDBRow class="d-flex align-items-center m-2">
    <MDBCol class="d-flex justify-content-start">
  <h1>{{ patient?.pseudonym }}</h1>
      </MDBCol>
          <MDBCol class="d-flex justify-content-end">
        <InfoButton component_name="MedProfMain"/>
      </MDBCol>
    </MDBRow>
  <MDBListGroup>
    <MDBListGroupItem v-if="show_preload_switch">
      <MDBRow class="d-flex align-items-center">
        <MDBCol>
          <h3 class="text-secondary">Vorbelegung mit existierenden Daten</h3>
        </MDBCol>
        <MDBCol class="d-flex justify-content-end">
          <MDBSwitch v-model="preload_other_data"></MDBSwitch>
        </MDBCol>
      </MDBRow>

      <PatientStatisticsComponent
          mode="long"
          :patient_id="patientid"
          v-show="preload_other_data"
          @entry_clicked="loadDataSetFromApi"
          :key="api_data_store_size"/>
    </MDBListGroupItem>
    <MDBListGroupItem>
      <MDBCheckbox v-for="core in core_options" :label="core.text" inline v-model="core.checked" />

    </MDBListGroupItem>

    <MDBListGroupItem id="icf">
                              <ListHeader
           label="ICFs"
           :number-icf-items="Object.keys(icfsFromCoresetData).length"
           :show-details="showIcfDetails"
           :patientid="patientid"
           :last-item-edited="Object.keys(icfsFromCoresetData)[lastIcfEdited]"
           module="icf"
           :percent-edited="icfEdited"
           :startButtonActive="true"
           @show-details-changed="showIcfDetails=$event"
           ></ListHeader>

      <ICFThumbPanel :icfs="icfsFromCoresetData" :patientid="patientid" v-if="showIcfDetails"/>
    </MDBListGroupItem>
  </MDBListGroup>
</template>

<style scoped>

</style>