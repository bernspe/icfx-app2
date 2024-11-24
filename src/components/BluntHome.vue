<script setup lang="ts">
import {
  MDBBtn, MDBRadio, MDBCard, MDBRow, MDBCol, MDBAlert
} from 'mdb-vue-ui-kit';
import {computed, onMounted, ref, watch} from "vue";
import {app_store, DataStore} from "../app_store";
import _userdata from "../assets/mock-userdata.json";
import {user_store} from "../user_store";
import {imageServer} from "../process_vars";
import InfoButton from "./InfoButton.vue";
import {version} from "../../package.json"
import AvatarImage from "./AvatarImage.vue";


const userOfThisInstitution = computed(() => {
  return _userdata.filter(u => u.institution.id === picked_institution.value)
})

const StartupInfo = ref(true)

const possibleInstitutions = computed(() => {
  return [...new Set(_userdata.map(u => u.institution.id))]
})

const picked_institution = ref(possibleInstitutions.value[0])

const getInstitutionNameFromId = (id: string) => {
  let idx = _userdata.map(u => u.institution.id).indexOf(id)
  return _userdata[idx].institution.name
}

watch(picked_institution, (newval, oldval) => {
  if (newval) {
    loadData()
  }
})

const loadData = () => {
  app_store.clearData()
  user_store.clear_userdata()
  //load users of this institution
  app_store.setUsersOfThisInstitution(_userdata.filter(u => u.institution.id === picked_institution.value))
  user_store.set_institution(picked_institution.value, getInstitutionNameFromId(picked_institution.value))
  if (app_store.getState().api_all_patient_records.length === 0) {
    app_store.setMockApiRecords()
  }
}

onMounted(() => {
  loadData()
})
</script>

<template>
  <MDBCard class="p-2">
    <MDBRow class="d-flex align-items-center">
      <MDBCol class="d-flex justify-content-start">
    <h1>ICFx Test Version {{ version }}</h1>

        </MDBCol>
      <MDBCol class="d-flex justify-content-end">
        <InfoButton component_name="BluntHome"/>
      </MDBCol>
      </MDBRow>
    <h3>Loaded Mock Data</h3>
    <MDBRadio v-for="inst_id in possibleInstitutions" :value="inst_id" :label="getInstitutionNameFromId(inst_id)"
              v-model="picked_institution"></MDBRadio>

    <p>User Data Object Length: {{ userOfThisInstitution.length }}</p>
    <p>Patient Data Object Length: {{ app_store.getState().api_all_patient_records.length }}</p>

    <div class="d-flex align-items-center m-4 p-3">
      <h5 class="text-primary">Deine Möglichkeiten im Testbetrieb</h5>
      <MDBRow>
        <MDBCol>

                <router-link to="/patientlist">
                  <MDBBtn color="secondary" class="m-2"> Als Patient weitermachen</MDBBtn>
                </router-link>

        </MDBCol>
        <MDBCol>
          <router-link to="/medproflist">
            <MDBBtn color="primary" class="m-2"> Als Behandler weitermachen</MDBBtn>
          </router-link>
        </MDBCol>
      </MDBRow>
    </div>
    <MDBAlert v-model="StartupInfo" color="info" dismiss static>
      <i class="fas fa-info-circle me-3"></i><strong>Hast Du Fragen? </strong>Benutze das Fragezeichen oben rechts!
    </MDBAlert>
  </MDBCard>
</template>

<style>

</style>