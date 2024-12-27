<script setup lang="ts">
import {
  MDBBtn, MDBRadio, MDBCard, MDBRow, MDBCol, MDBAlert, MDBContainer, MDBCardImg, MDBCardBody
} from 'mdb-vue-ui-kit';
import {version} from "../../package.json"
import {computed, onMounted, ref, watch} from "vue";
import {app_store, DataStore} from "../app_store";
import _userdata from "../assets/mock-userdata.json";
import {RemoteInstitutionDataset, user_store} from "../user_store";
import {imageServer} from "../process_vars";
import InfoButton from "./InfoButton.vue";
import {VueScrollPicker} from "vue-scroll-picker";
import {roles} from "../constants";
import {useRoute, useRouter} from "vue-router";

const router = useRouter()
const route = useRoute()

const apiInstitutions = ref<Array<RemoteInstitutionDataset>>([])


const scroll_optionslist = computed(() => {
  return roles.map(x => ({name: x.name, value: x.group}))
})

const registergroup = ref('patient')

const iconFromGroup = (group: string) => {
  let idx = roles.findIndex(x => x.group === group)
  return roles[idx].icon
}

const useApiData = computed(() => {
  return apiInstitutions.value.map(i => i.id).includes(picked_institution.value)
})

const mockInstitutions = computed(() => new Set(_userdata.map(u => u.institution.id)))

const possibleInstitutions = computed(() => {
  return [...mockInstitutions.value, ...apiInstitutions.value.map(i => i.id)]
})

const inst_optionslist = computed(() => {
  return possibleInstitutions.value.map(x => ({name: getInstitutionNameFromId(x), value: x}))
})

const picked_institution = ref(possibleInstitutions.value[0])

const getInstitutionNameFromId = (id: string) => {
  let idx = _userdata.map(u => u.institution.id).indexOf(id)
  if (idx === -1) {
    idx = apiInstitutions.value.map(i => i.id).indexOf(id)
    if (idx > -1) return apiInstitutions.value[idx].name
  }
  return _userdata[idx].institution.name
}

const getInstitutionUrlFromId = (id: string) => {
  let idx = _userdata.map(u => u.institution.id).indexOf(id)
  if (idx === -1) {
    idx = apiInstitutions.value.map(i => i.id).indexOf(id)
    if (idx > -1) return apiInstitutions.value[idx].logo_url
  }
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
  user_store.set_institution(picked_institution.value, getInstitutionNameFromId(picked_institution.value), getInstitutionUrlFromId(picked_institution.value))
  user_store.setMockMode(mockInstitutions.value.has(picked_institution.value))

}

onMounted(() => {
  // try to autoconnect if there is a token saved
  user_store.connect_user_to_api().then(response => {
    user_store.getAPIUsersOfThisInstitution(true).then(() => {
      const medprof_groups = roles.map(x => x.group).filter(item => item !== 'patient')
      // MedProf Relay
      if (response.groups.some(g => medprof_groups.includes(g))) router.push({name: 'patientlist'})
      // Patient Relay
      if (response.groups.includes('patient')) router.push({name: 'PatientView', params: {patientid: response.id}})
    })
  }).catch(e => {
    // if autoconnect fails try to relay to register
    const ks = Object.keys(route.query)
    if (ks.length !== 0) {
      if (ks.includes('institution') && ks.includes('group')) {
        router.push('/register/' + route.query.institution + '/' + route.query.group)
      }
    } else {
      // if everything fails, just display the start page and load possible institutions
      loadData()
      user_store.getAPIInstitutions().then((res) => apiInstitutions.value = res)
    }
  })
})
</script>

<template>
  <MDBContainer class="text-center">
    <MDBCard class="p-2">
      <MDBCardImg :src="imageServer()+'icfx-notebook-logo.jpg'" top
                  style="max-height: 300px; width: auto; object-fit: contain;">

      </MDBCardImg>
      <MDBCardBody>
        <MDBRow class="d-flex align-items-center">
          <MDBCol class="d-flex justify-content-center">
            <h1 class="text-primary">ICFx Version {{ version }}</h1>
          </MDBCol>

        </MDBRow>
        <MDBRow>
          <h2 class="text-secondary">Institutionen</h2>
          <p>Willkommen bei ICFx. Wählen Sie bitte eine Institution</p>
          <VueScrollPicker
              :options="inst_optionslist"
              v-model:model-value="picked_institution"
              style="font-size: 20px">
          </VueScrollPicker>
          <MDBCol class="d-flex justify-content-center">
            <img v-if="user_store.getState().institution.logo_url" :src="user_store.getState().institution.logo_url"
                 style="max-height: 50px;width: auto;object-fit: contain;"/>
          </MDBCol>
        </MDBRow>


        <MDBRow class="d-flex align-items-top m-4" v-if="useApiData">
          <MDBRow>
            <h3 class="text-secondary">Deine Möglichkeiten</h3>
          </MDBRow>

          <MDBCol class="m-2 p-2">
            <h4 class="text-primary">Als bekannter Nutzer anmelden</h4>
            <MDBRow>
              <MDBCol class="d-flex justify-content-center">
                <router-link :to="{name: 'login',params:{institution_id:picked_institution}}">
                  <MDBBtn color="primary">Anmelden</MDBBtn>
                </router-link>
              </MDBCol>
            </MDBRow>
          </MDBCol>

          <MDBCol class="m-2 p-2 align-items-center">
            <h4 class="text-primary">Als neuer Benutzer registrieren</h4>
            <MDBCol cols="12">
              <img :src="imageServer()+`group-pics/${iconFromGroup(registergroup)}`"
                   style="max-height: 100px; width: auto; object-fit: contain;"/>
            </MDBCol>
            <VueScrollPicker
                :options="scroll_optionslist"
                v-model:model-value="registergroup"
                style="font-size: 20px">
            </VueScrollPicker>


            <MDBRow class="mb-4">
              <MDBCol class="d-flex justify-content-center">
                <router-link :to="{name: 'register',params:{institution_id:picked_institution, group: registergroup}}">
                  <MDBBtn color="primary">Registrieren</MDBBtn>
                </router-link>
              </MDBCol>
            </MDBRow>
          </MDBCol>


        </MDBRow>

        <MDBRow class="d-flex align-items-center m-4 p-3" v-else>
          <h3 class="text-secondary">Deine Möglichkeiten im Testbetrieb</h3>
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
        </MDBRow>

      </MDBCardBody>
    </MDBCard>

  </MDBContainer>
</template>

<style src="vue-scroll-picker/lib/style.css">

</style>