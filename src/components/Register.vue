<script setup lang="ts">
import {
  MDBListGroup,
  MDBListGroupItem,
  MDBBadge,
  MDBBtn,
  MDBInput,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBCardFooter,
  MDBContainer,
  MDBCardImg,
  MDBCardTitle,
  MDBSpinner,
  MDBAlert,
    MDBIcon
} from 'mdb-vue-ui-kit'
import {ref} from "vue";
import {user_store} from "../user_store";
import {useRoute, useRouter} from "vue-router";
import {roles} from "../constants";
import {imageServer} from "../process_vars";
import _patientcases from "../assets/patientcases_de.json";
import {app_store, PatientCase} from "../app_store";

const patientcases: Record<string, PatientCase> = _patientcases

const router = useRouter()
const route = useRoute()
const props = defineProps(['institution_id', 'group','casenumber'])
const pin = ref('')
const codename = ref('')
const codenameCorrect = ref(true)

const status = ref('primary')
const alert = ref(false)
const alertmessage = ref('')

const findGroup = (group: string) => {
  let idx = roles.findIndex(x => x.group === group)
  return roles[idx]
}

const register = (e: Event) => {
  //(e.target as Element).classList.add("was-validated");
  status.value = 'loading'
  user_store.register(props.institution_id, pin.value, codename.value, props.group, props.casenumber).then(r => {
    user_store.checkToken(r).then(response => {
      status.value = 'success'
      codenameCorrect.value=true
      user_store.clear_userdata()
      user_store.set_access_token(r)
      user_store.set_user(response)
      if (props.casenumber) app_store.updateUserDiagnoses(response.id,patientcases[props.casenumber.toString()].diagnoses)
      user_store.getAPIUsersOfThisInstitution(true)
      router.push({name: 'Welcome'})
    })
  }).catch(error => {
    codenameCorrect.value=false
    alertmessage.value = error
    alert.value = true
    status.value = 'danger'
  })
}
</script>

<template>
  <MDBContainer class="text-center">
    <MDBCard tag="form" @submit.prevent="register" autocomplete="on" novalidate>
      <MDBCardHeader>
        <MDBCardImg style="max-height: 150px; width: auto;" v-if="user_store.getState().institution.logo_url" :src="user_store.getState().institution.logo_url"/>
        <MDBCardTitle class="text-secondary mt-2">
          <h1 class="text-secondary">Willkommen auf der ICFx-Plattform <span v-if=" user_store.getState().institution">von</span> {{ user_store.getState().institution.name }}</h1>
          <router-link to="/help#videohelp">Einführungsvideos</router-link>
        </MDBCardTitle>
      </MDBCardHeader>
      <MDBCardBody class="m-2">
            <MDBRow class="needs-validation d-flex align-items-center justify-content-center">
              <h2 class="text-primary">Als {{ findGroup(group).name }} neu registrieren</h2>
              <MDBRow class="mt-3 mb-3">
                <MDBCol>
                <img :src="imageServer()+`group-pics/${findGroup(group).icon}`"
                     style="max-height: 100px; width: auto; object-fit: contain;"/>
                  </MDBCol>
                <p>
                  Bitte wählen Sie eine vierstellige PIN, die sie sich gut merken können.
                </p>
                <MDBInput
                    id="PIN_input"
                    label="PIN"
                    type="number"
                    v-model="pin"
                    counter
                    :maxlength="4"
                    required
                    invalidFeedback="Bitte eine vierstellige Zahl"
                    ></MDBInput>
              </MDBRow>
              <MDBRow v-if="group !== 'patient'" class="mt-3">
                <hr>
                <p>Sie benötigen noch den <span class="text-decoration-underline"> Codenamen</span>, um sich als
                  {{ findGroup(group).name }} registrieren zu können. Fragen Sie
                  dazu am besten den Verantwortlichen bei {{ user_store.getState().institution.name }}.</p>
                <MDBInput
                    id="Codename_input"
                    :class="codenameCorrect ? (status==='success' ? 'is-valid' : '') : 'is-invalid'"
                    label="Codename"
                    type="text"
                    v-model="codename"
                    required
                    invalidFeedback="Das stimmt anscheinend nicht."
                    ></MDBInput>
              </MDBRow>
            </MDBRow>

      </MDBCardBody>

      <MDBCardFooter>
        <MDBRow class="my-2 align-items-center d-flex justify-content-between">
          <MDBCol>
            <router-link :to="`/login/${institution_id}`">
              <MDBBtn color="secondary">
              Ich bin schon registriert <MDBIcon icon="arrow-right" class="mx-2"/> Anmeldung
              </MDBBtn>
            </router-link>
          </MDBCol>
          <MDBCol>
            <MDBBtn :color="status==='loading' ? 'primary' : status" type="submit" :disabled="(pin.length!==4)">
              <MDBSpinner class="me-2" v-if="status==='loading'"/>
              Weiter
            </MDBBtn>
          </MDBCol>
        </MDBRow>

        <MDBRow class="mt-4 d-flex justify-content-around">
          <p>Mit Deiner Registrierung stimmst Du den Datenschutzbestimmungen zu.</p>
            <a href="https://renecol.org/datenschutzerklaerung/#icfx" target="_blank">Datenschutz</a>
        </MDBRow>
      </MDBCardFooter>
    </MDBCard>

    <MDBAlert v-model="alert" color="danger"> {{ alertmessage }}</MDBAlert>
  </MDBContainer>
</template>

<style scoped>

</style>