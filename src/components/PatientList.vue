<script setup lang="ts">
import {MDBListGroup, MDBListGroupItem, MDBBadge, MDBInput, MDBRow, MDBCol} from 'mdb-vue-ui-kit'
import _userdata from '../assets/mock-userdata.json'
import {computed, onMounted, ref} from "vue";

import {dateTimeFormat} from "../constants";
import {user_store, UserData} from "../user_store";
import {imageServer} from "../process_vars";
import {app_store} from "../app_store";
import PatientStatisticsComponent from "./PatientStatisticsComponent.vue";
import InfoButton from "./InfoButton.vue";
import AvatarImage from "./AvatarImage.vue";
import {translate_pseudonym} from "../language_helper";

const props = defineProps(['medprofid'])

const patient_list = ref<Array<UserData>>([])

const searchInput = ref('')

const searched_list = computed<Array<UserData>>(() => {
  if (searchInput.value) {
    return patient_list.value.filter((p: UserData) => p.pseudonym.toLowerCase().includes(searchInput.value.toLowerCase()) || p.translated_pseudonym?.toLowerCase().includes(searchInput.value.toLowerCase()) )
  } else
    return patient_list.value
})

onMounted(() => {

  //TODO: Get Patient list by institution from API

  patient_list.value = _userdata.filter(p => p.groups.includes('patient'))
                      .filter(p => p.institution.id === user_store.getState().institution.id)
      .map(p=>({...p,translated_pseudonym:translate_pseudonym(p.pseudonym)}))
  // End of MOCK

  if (props.medprofid) {
    let md_idx = _userdata.map(u=>u.id).indexOf(props.medprofid)
    user_store.set_user(_userdata[md_idx])
  }

  app_store.clearData()
})
</script>

<template>
    <MDBRow class="d-flex align-items-center m-2">
    <MDBCol class="d-flex justify-content-start">
    <h3 class="text-secondary m-4">Patient auswählen</h3>
    </MDBCol>
        <MDBCol class="d-flex justify-content-end">
        <InfoButton component_name="PatientList"/>
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


      <PatientStatisticsComponent :patient_id="patient.id" @entry_clicked="console.log"/>

      <router-link v-if="((user_store.getState().groups.includes('patient')) || (user_store.getState().groups.length===0))" :to="`/patientview/${patient.id}`">Weiter</router-link>
      <router-link v-else :to="`/medview/${patient.id}`">Weiter</router-link>
    </MDBListGroupItem>
  </MDBListGroup>
</template>

<style scoped>

</style>