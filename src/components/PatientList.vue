<script setup lang="ts">
import {MDBListGroup, MDBListGroupItem, MDBBadge, MDBInput, MDBRow, MDBCol} from 'mdb-vue-ui-kit'

import {computed, onMounted, ref} from "vue";
import {RemoteUserAPI, user_store, UserData} from "../user_store";
import {app_store} from "../app_store";
import PatientStatisticsComponent from "./PatientStatisticsComponent.vue";
import InfoButton from "./InfoButton.vue";
import AvatarImage from "./AvatarImage.vue";
import {backtranslate_pseudonym, translate_pseudonym} from "../language_helper";
import {imageServer} from "../process_vars";

const _userdata = computed(()=>user_store.getState().userdata)

const medprof_groups = computed(() => {
  if (user_store.getState().id && (!user_store.getState().groups.includes('patient')) && _userdata.value.length>0) {
    let idx = _userdata.value.map(u => u.id).indexOf(user_store.getState().id)
    return _userdata.value[idx].groups
  }
})


const sortNAddTranslatedPseudonym = (r: Array<UserData> | Array<RemoteUserAPI>) => {
  return r.filter(p => p.groups.includes('patient'))
        .map(p => ({...p, translated_pseudonym: translate_pseudonym(p.pseudonym)}))
        .sort((a,b)=>a.translated_pseudonym.localeCompare(b.translated_pseudonym))
}

const patient_list = ref<Array<UserData>>(sortNAddTranslatedPseudonym( user_store.getState().userdata))
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


onMounted(() => {
  user_store.getAPIUsersOfThisInstitution().then(r => {
    // when Patientlist is reached through BehandlerListe
    if (props.medprofid && user_store.getState().mock_mode) {
      let md_idx = r.map(u => u.id).indexOf(props.medprofid)
      user_store.set_user(r[md_idx])
    }

    // TODO: patient_list needs to be computed value to have translated pseudonymas
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
          <img
              :src="imageServer()+`group-pics/${g}.jpg`"
              alt=""
              style="width: 45px; height: 45px"
              class="rounded-circle"
          />
          <MDBBadge
              class="translate-middle p-1"
              badge="info"
              pill
              notification
          >{{ g }}
          </MDBBadge>
        </div>
    </MDBCol>
     <MDBCol class="d-flex justify-content-end">
      <InfoButton component_name="PatientList"/>
    </MDBCol>
  </MDBRow>
  <MDBRow class="d-flex align-items-center m-2">
    <h1 class="text-secondary">Patienten</h1>
    <MDBCol class="d-flex justify-content-start">
      <h2 class="text-primary m-4">Patient auswählen</h2>
    </MDBCol>

  </MDBRow>
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
  <MDBListGroup light class="me-4">
    <MDBListGroupItem class="d-flex justify-content-between align-items-center"
                      v-for="patient in searched_list"
    >

      <AvatarImage :pseudonym="patient.pseudonym" size="55px" color="blue" label_position="right"/>


      <router-link
          v-if="((user_store.getState().groups.includes('patient')) || (user_store.getState().groups.length===0))"
          :to="`/patientview/${patient.id}`">Weiter
      </router-link>
      <router-link v-else :to="`/medview/${patient.id}`">Weiter</router-link>
    </MDBListGroupItem>
  </MDBListGroup>
</template>

<style scoped>

</style>