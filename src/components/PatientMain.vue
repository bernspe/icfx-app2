<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSelect,
  MDBContainer, MDBIcon, MDBSwitch
} from 'mdb-vue-ui-kit'

import {WhodasEnvItemStructure} from "../app_store";
import __whodas from '../assets/whodas12_de.json';
import __env from '../assets/env_factors_de.json'
const _whodas: Record<string, WhodasEnvItemStructure> = __whodas;
const _env: Record<string, WhodasEnvItemStructure> = __env;
import _sf36 from '../assets/sf36_de.json'
import __uxq from "../assets/uxquestionnaire_patient_de.json";

const _uxq:Record<string,Record<string,any>> = __uxq

import {computed, onMounted, ref, watch} from "vue";
import type {DataStore, ICFStruct} from "../app_store";
import {app_store} from "../app_store";
import {
  Auspraegung, AuspraegungBeschwerden,
  AuspraegungColor,
  AuspraegungTextColor, dateformat,
  InactiveColor,
  UmweltColor, UmweltFaktoren,
  UmweltTextColor
} from "../constants";
import {imageServer, mode} from "../process_vars";
import {user_store} from "../user_store";
import PatientStatisticsComponent from "./PatientStatisticsComponent.vue";
import InfoButton from "./InfoButton.vue";
import ICFThumbPanel from "./ICFThumbPanel.vue";
import ListHeader from "./ListHeader.vue";
import AvatarImage from "./AvatarImage.vue";

const TestBetrieb = ref(mode()==='LOCAL')

const props = defineProps({patientid: {type: String, required: true}})
const _userdata = computed(()=>user_store.getState().userdata)
const patient = computed(() => {
  return  _userdata.value.filter(p => p.id === props.patientid)[0]
})
const show_preload_switch = ref(false)
const preload_other_data = ref(false)

const whodas_keys = computed(() => Object.keys(_whodas))
const env_keys = computed(() => Object.keys(_env))
const icf_keys = computed(() => Object.keys(data.value.icf || {}))

const sf36_keys = computed(() => Object.keys(_sf36))
const sf36_keys_with_answers = Object.values(_sf36).filter(x=>x.answers).length

const uxq_keys = computed(() => Object.keys(_uxq))
const uxq_keys_with_answers = Object.values(_uxq).filter(x=>x.answers).length

const data = ref<DataStore>(app_store.emptyDataStore())


const styleFromWhodasData = (idx: any) => {
  let ks = Object.keys(data.value?.whodas || {})
  let val: any;
  let bg = InactiveColor
  if (ks.includes(idx)) {
    val = Number(data.value.whodas[idx])
    bg = AuspraegungColor[val]
  }
  let fg = AuspraegungTextColor
  return `background-color: ${bg}; color: ${fg};`
}

const styleFromEnvData = (idx: any) => {
  let ks = Object.keys(data.value?.env || {})
  let val: any;
  let bg = InactiveColor
  if (ks.includes(idx)) {
    val = Number(data.value.env[idx])
    bg = UmweltColor[val]
  }
  let fg = UmweltTextColor
  return `background-color: ${bg}; color: ${fg};`
}

const styleFromSF36Data = (idx: any) => {
  let ks = Object.keys(data.value?.sf36 || {})
  let val: any;
  let bg = InactiveColor
  if (ks.includes(idx)) {
    bg = AuspraegungColor[0]
  }
  let fg = AuspraegungTextColor
  return `background-color: ${bg}; color: ${fg};`
}

const icfsFromWhodasEnvData = computed(() => {
  // return only those linked ICF items where whodas or env was marked as having a problem
  let targetObj: Record<string, ICFStruct> = {}
  Object.entries(data.value?.whodas || {})
      .filter(([k, v]) => v > 0).map(([k, v]) => (_whodas[k].l.split(',')
      .filter((code: string) => code.length > 2).forEach((icfitem: string) => {
        targetObj[icfitem] = {value: v, selected: icf_keys.value.includes(icfitem) ? 1 : 0}
      })))
  Object.entries(data.value?.env || {})
      .filter(([k, v]) => v !== 4).map(([k, v]) => (_env[k].l.split(',')
      .filter((code: string) => code.length > 2).forEach((icfitem: string) => {
        targetObj[icfitem] = {value: (v === 9) ? 4 : v, selected: icf_keys.value.includes(icfitem) ? 1 : 0}
      })))
  Object.entries(data.value?.icf || {}).forEach(([code, icfitem]) => {
    targetObj[code] = icfitem
  })
  return targetObj
})

const lastWhodasItemEdited = computed(()=> Object.keys(data.value.whodas || {}).length+1)
const whodasEdited = computed(() => Math.ceil(Object.keys(data.value.whodas || {}).length / whodas_keys.value.length*100))
const showWhodasDetails = ref(false)

const lastEnvItemEdited = computed(()=> Object.keys(data.value.env || {}).length+1)
const envEdited = computed(() => Math.ceil(Object.keys(data.value.env || {}).length / env_keys.value.length*100))
const showEnvDetails = ref(false)

const lastIcfEdited = computed(() => {
  const vals = Object.values(data.value?.icf || {})
  if (vals.length > 0) {
    // check for lastActiveIcf in API data
    let i=0
    if (data.value.lastActiveIcf)
    {
      i = Object.keys(data.value.icf || {}).indexOf(data.value.lastActiveIcf)
      if (i === -1) return 0
      else return i
    } else {
      i = Object.values(data.value.icf || {}).map(x => x.selected != 0).lastIndexOf(true)
      if (i === -1) return 0
      else {
        let i2 = Object.values(data.value.icf || {}).map(x => x.selected === 0).indexOf(true)
        return (i > i2) ? i : i2
      }
    }
  } else return 0
})

const icfEdited = computed(() => {
  const vals = Object.values(data.value?.icf || {})
  if (vals.length > 0) {
    return Math.ceil((lastIcfEdited.value + 1) / vals.length * 100)
    }
  else
    return 0
})

const showIcfDetails = ref(false)

const lastSf36ItemEdited = computed(()=> Object.keys(data.value.sf36 || {}).length)
const sf36Edited = computed(() => Math.ceil(Object.keys(data.value.sf36 || {}).length / sf36_keys_with_answers*100))
const showSf36Details = ref(false)

const lastUxqItemEdited = computed(()=> Object.keys(data.value.uxquestionnaire || {}).length)
const uxqEdited = computed(() => Math.ceil(Object.keys(data.value.uxquestionnaire || {}).length / uxq_keys_with_answers*100))
const showUxqDetails = ref(false)

const numberOfBadges = computed(()=> {
  let counter = 0
  if (whodasEdited.value===100) counter+=1
  if (envEdited.value===100) counter+=1
  if (icfEdited.value===100) counter+=1
  if (sf36Edited.value===100) counter+=1
  if (uxqEdited.value >= 100) counter+=1
  return counter
})

const clearAll = (module:string) => {
  data.value = {...data.value, [module]: app_store.emptyDataStore()[module]}
  app_store.setCurrentData(data.value)
  app_store.set_active_icf('')
}

watch(icfsFromWhodasEnvData, (newVal, oldVal) => {
  app_store.setCurrentData({...data.value, icf: newVal})
  app_store.set_active_icf('')
})
const loadDataSetFromApi = (d: DataStore) => {
  data.value = JSON.parse(JSON.stringify(d));
  app_store.setCurrentData(data.value)
}

const preloadData = (autoassign: boolean) => {
  if (props.patientid) {
    app_store.set_current_patient_id(props.patientid)
    if (user_store.getState().mock_mode) {
       let p_idx = user_store.getState().userdata.map(u => u.id).indexOf(props.patientid)
      user_store.set_user(user_store.getState().userdata[p_idx])
    }

    app_store.loadDataFromApi(props.patientid).then(r => {
      // fuse data from API and from Store if Store contains values
      if (r.length !== 0) show_preload_switch.value = true
      // aktuelle Daten
      let s = Object.values(app_store.getState().patient_data).some(v => Object.keys(v || {}).length > 0) ? app_store.getState().patient_data : app_store.emptyDataStore()
      if (autoassign) {
        data.value = Object.assign({}, r[0])
      } else
        data.value = Object.assign({}, s)
      app_store.setCurrentData(data.value)
      app_store.set_active_icf('')
    })
  }
}


watch(preload_other_data, (newVal, oldVal) => {
  preloadData(newVal)
})

onMounted(() => {
  preloadData(preload_other_data.value)
})
</script>

<template>
  <MDBContainer>
    <MDBRow class="d-flex align-items-center m-2">
      <MDBCol class="d-flex justify-content-start">

        <AvatarImage v-if="patient" :pseudonym="patient.pseudonym" size="55px" color="blue" label_position="right"/>

      </MDBCol>
      <MDBCol>
        <img :src="imageServer()+'gold-medal.png'" style="height: 32px; width: auto; object-fit: contain;"
        v-for="i in numberOfBadges" :key="i"
        />
      </MDBCol>
    </MDBRow>
    <MDBListGroup>

      <MDBListGroupItem v-if="app_store.getState().api_patient_records.length>0 && show_preload_switch">
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
            v-show="preload_other_data"
            :patient_id="patientid"
            @entry_clicked="loadDataSetFromApi"/>
      </MDBListGroupItem>

       <MDBListGroupItem id="whodas">
         <ListHeader
           label="Beeinträchtigung"
           :number-icf-items="0"
           :show-details="showWhodasDetails"
           :patientid="patientid"
           :last-item-edited="lastWhodasItemEdited"
           module="whodas"
           :percent-edited="whodasEdited"
           :start-button-active="true"
           @show-details-changed="showWhodasDetails=$event"
           @clear="clearAll('whodas')"
           ></ListHeader>

        <MDBRow v-if="showWhodasDetails">
          <MDBCol v-for="(idx) in whodas_keys" col="2" class="m-1">
            <router-link :to="`/patientdata/whodas/${patientid}/${idx}`">
              <MDBChip class="m-2" outline="info" :style="styleFromWhodasData(idx)"> {{ idx }}</MDBChip>
            </router-link>
          </MDBCol>
        </MDBRow>
      </MDBListGroupItem>

      <MDBListGroupItem id="env">
                 <ListHeader
           label="Umwelt"
           :number-icf-items="0"
           :show-details="showEnvDetails"
           :patientid="patientid"
           :last-item-edited="lastEnvItemEdited"
           module="env"
           :percent-edited="envEdited"
           :start-button-active="whodasEdited===100 || TestBetrieb"
           @show-details-changed="showEnvDetails=$event"
           @clear="clearAll('env')"
           ></ListHeader>

        <MDBRow v-if="showEnvDetails">
          <MDBCol v-for="(idx) in env_keys" col="2" class="m-1">
            <router-link :to="`/patientdata/env/${patientid}/${idx}`">
              <MDBChip class="m-2" outline="info" :style="styleFromEnvData(idx)"> {{ idx }}</MDBChip>
            </router-link>
          </MDBCol>
        </MDBRow>
      </MDBListGroupItem>


      <MDBListGroupItem id="icf">
                         <ListHeader
           label="ICFs"
           :number-icf-items="Object.keys(icfsFromWhodasEnvData).length"
           :show-details="showIcfDetails"
           :patientid="patientid"
           :last-item-edited="Object.keys(icfsFromWhodasEnvData)[lastIcfEdited]"
           module="icf"
           :start-button-active="whodasEdited + envEdited === 200 || TestBetrieb"
           :percent-edited="icfEdited"
           @show-details-changed="showIcfDetails=$event"
           @clear="clearAll('icf')"
           ></ListHeader>

        <ICFThumbPanel :patientid="patientid" :icfs="icfsFromWhodasEnvData" v-if="showIcfDetails">
        </ICFThumbPanel>
      </MDBListGroupItem>

      <MDBListGroupItem id="sf36">
         <ListHeader
           label="Lebensqualität"
           :number-icf-items="0"
           :show-details="showSf36Details"
           :patientid="patientid"
           :last-item-edited="sf36_keys[lastSf36ItemEdited]"
           module="sf36"
           :percent-edited="sf36Edited"
           :start-button-active="icfEdited>=95 || TestBetrieb"
           @show-details-changed="showSf36Details=$event"
           @clear="clearAll('sf36')"
           ></ListHeader>

        <MDBRow v-if="showSf36Details">
          <MDBCol v-for="(idx) in sf36_keys" col="2" class="m-1">
            <router-link :to="`/patientdata/sf36/${patientid}/${idx}`">
              <MDBChip class="m-2" outline="info" :style="styleFromSF36Data(idx)"> {{ idx }}</MDBChip>
            </router-link>
          </MDBCol>
        </MDBRow>
      </MDBListGroupItem>

      <MDBListGroupItem id="uxquestionnaire">
                 <ListHeader
           label="Benutzerfreundlichkeit"
           :number-icf-items="0"
           :patientid="patientid"
           :last-item-edited="uxq_keys[lastUxqItemEdited]"
           :percent-edited="uxqEdited"
           module="uxquestionnaire"
           :start-button-active="icfEdited>=95 || TestBetrieb"
           @clear="clearAll('uxquestionnaire')"
           ></ListHeader>
      </MDBListGroupItem>

    </MDBListGroup>
  </MDBContainer>
</template>

<style scoped>

</style>