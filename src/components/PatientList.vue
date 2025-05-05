<script setup lang="ts">
import {
  MDBListGroup,
  MDBListGroupItem,
  MDBBadge,
  MDBInput,
  MDBRow,
  MDBCol,
  MDBSwitch,
  MDBIcon,
  MDBTooltip
} from 'mdb-vue-ui-kit'

import {computed, onMounted, provide, ref, watch} from "vue";
import {RemoteUserAPI, user_store, UserData} from "../user_store";
import {app_store, FulfillmentStats} from "../app_store";
import AvatarImage from "./AvatarImage.vue";
import {backtranslate_pseudonym, translate_pseudonym} from "../language_helper";
import {imageServer} from "../process_vars";

import __patientcases from "../assets/patientcases_de.json";
import GroupImage from "./GroupImage.vue";
import GroupFulfillmentStatsView from "./GroupFulfillmentStatsView.vue";
import {roles} from "../constants";

const _patientcases: Record<string, any> = __patientcases


const patientFromCasenumber = (casenumber?: number) => {
  if (!casenumber) return ''
  if (Object.keys(_patientcases).includes(casenumber.toString())) {
    return _patientcases[casenumber.toString()];
  } else return _patientcases["1"];
}

const _userdata = computed(() => user_store.getState().userdata)

const   medprof_groups = computed(() => {
  if (user_store.getState().id && (!user_store.getState().groups.includes('patient')) && _userdata.value.length > 0) {
    let idx = _userdata.value.map(u => u.id).indexOf(user_store.getState().id)
    return _userdata.value[idx].groups
  }
})

const targetUrl = (patientid: string) => {
  if ((user_store.getState().groups.includes('patient')) || (user_store.getState().groups.length === 0)) return `/patientview/${patientid}`
  else return `/medview/${patientid}`
}

const sortNAddTranslatedPseudonym = (r: Array<UserData> | Array<RemoteUserAPI>) => {
  return r.filter(p => p.groups.includes('patient'))
      .map(p => ({...p, translated_pseudonym: translate_pseudonym(p.pseudonym)}))
      .sort((a, b) => a.translated_pseudonym.localeCompare(b.translated_pseudonym))
}

const patient_list = ref<Array<UserData>>(sortNAddTranslatedPseudonym(user_store.getState().userdata))
const addInfoTooltip = ref(Object.fromEntries(patient_list.value.map(p=>[p.id,false])))

const props = defineProps(['medprofid'])
const searchInput = ref('')

const english_pseudonym = computed(() => {
  let arr = searchInput.value.split(' ')
  if (arr.length > 1 && arr[0].length > 2 && arr[1].length > 2) return backtranslate_pseudonym(searchInput.value)
  else return ''
})

const searched_list = computed<Array<UserData>>(() => {
  if (searchInput.value) {
    return patient_list.value.filter((p: UserData) => p.translated_pseudonym?.toLowerCase().includes(searchInput.value.toLowerCase()))
  } else
    return patient_list.value
})

const showFulfillment = ref(false)
const fulfillmentStatistics = ref<FulfillmentStats>({})

watch(showFulfillment, (value: boolean) => {
  if (value) {
    app_store.getAPIFulfillmentStatistics(roles.map(r=>r.group)).then(stats=>fulfillmentStatistics.value=stats)
  } else {
    fulfillmentStatistics.value={}
  }
})


onMounted(() => {
  user_store.getAPIUsersOfThisInstitution(true).then(r => {
    // when Patientlist is reached through BehandlerListe
    if (props.medprofid && user_store.getState().mock_mode) {
      let md_idx = r.map(u => u.id).indexOf(props.medprofid)
      user_store.set_user(r[md_idx])
    }

    patient_list.value = sortNAddTranslatedPseudonym(r)
  })


  app_store.clearData()
})
</script>

<template>
  <MDBRow class="d-flex align-items-center m-2 p-2">
    <h1 class="text-secondary">Behandler</h1>
    <MDBCol class="d-flex justify-content-start">
      <AvatarImage
          v-if="user_store.getState().pseudonym"
          :pseudonym="user_store.getState().pseudonym" size="55px" color="green" label_position="right"/>
    </MDBCol>
    <MDBCol class="d-flex justify-content-start">
           <div v-for="g in medprof_groups">
        <GroupImage :group="g"/>
      </div>
    </MDBCol>

  </MDBRow>
  <MDBRow class="d-flex align-items-center m-2">
    <h1 class="text-secondary">Patienten</h1>
      <h2 class="text-primary m-4">Patient auswählen</h2>


  <MDBInput
      inputGroup
      :formOutline="false"
      wrapperClass="mb-3"
      class="rounded"
      v-model="searchInput"
      aria-describedby="search-addon"
      aria-label="Search"
      placeholder="Pseudonym finden"
  >
    <template #prepend>
      <span class="input-group-text border-0" id="search-addon">@</span>
    </template>
  </MDBInput>
      </MDBRow>

   <MDBRow class="d-flex align-items-center m-2 p-2">
     <MDBCol class="d-flex justify-content-start ms-4">
       <div>
     <h2 class="text-secondary">Status anzeigen</h2>
       <p class="text-secondary">Zeigt an, welche Berufsgruppen ICF Items erzeugt haben</p>
         </div>
       </MDBCol>
     <MDBCol class="d-flex justify-content-end">
       <MDBSwitch v-model="showFulfillment"/>
     </MDBCol>
   </MDBRow>
  <MDBListGroup light class="me-4">
    <MDBListGroupItem
        v-for="patient in searched_list"
    >
      <router-link :to="targetUrl(patient.id)">
        <MDBRow class="d-flex justify-content-between align-items-center">
          <MDBCol>
            <div>
              <AvatarImage :pseudonym="patient.pseudonym" size="55px" color="blue" label_position="right"/>
              <span class="text-info fst-italic"
                    v-if="patient.patient_case"> {{ patientFromCasenumber(patient.patient_case).title }}</span>
            </div>
          </MDBCol>

          <MDBCol v-if="showFulfillment && Object.keys(fulfillmentStatistics).includes(patient.id)" class="d-flex justify-content-center align-items-center">
            <GroupFulfillmentStatsView :ownerid="patient.id" />
          </MDBCol>

          <MDBCol v-if="showFulfillment && (Object.keys(patient.add_info || {}).length>0)">


                <MDBTooltip v-model="addInfoTooltip[patient.id]">
      <template #reference>
         <MDBIcon icon="info-circle"></MDBIcon>
      </template>
      <template #tip>
        Enthält zusätzliche Informationen zu
        {{ Object.keys(patient.add_info || {}).join(', ') }}
      </template>
    </MDBTooltip>
          </MDBCol>

          <MDBCol class="d-flex justify-content-end">
            Weiter
          </MDBCol>
        </MDBRow>
      </router-link>
    </MDBListGroupItem>
  </MDBListGroup>
</template>

<style scoped>

</style>