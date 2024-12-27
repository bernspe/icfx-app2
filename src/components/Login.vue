<script setup lang="ts">

import {
  MDBCard,
  MDBCardBody,
  MDBCardHeader,
  MDBCardFooter,
  MDBContainer,
  MDBInput,
  MDBRow,
  MDBCol,
  MDBBtn,
    MDBIcon
} from "mdb-vue-ui-kit";
import {user_store} from "../user_store";
import {computed, ref} from "vue";
import {backtranslate_pseudonym} from "../language_helper";
import AvatarImage from "./AvatarImage.vue";
import {useRoute, useRouter} from "vue-router";
import {roles} from "../constants";

const router = useRouter()
const route = useRoute()

const props = defineProps(['institution_id'])

const pseudonym_input = ref('')
const pin = ref('')

const login_trial_performed = ref(false)
const login_success = ref(false)

const english_pseudonym = computed(() => {
  let arr = pseudonym_input.value.split(' ')
  if (arr.length > 1 && arr[0].length > 2 && arr[1].length > 2) return backtranslate_pseudonym(pseudonym_input.value)
  else return ''
})


const login = (e: Event) => {
  (e.target as Element).classList.add("was-validated");
  login_trial_performed.value = false
  user_store.login(props.institution_id, english_pseudonym.value, pin.value).then(r => {
    user_store.checkToken(r).then(response => {
      user_store.getAPIUsersOfThisInstitution(true)
      const medprof_groups = roles.map(x => x.group).filter(item => item !== 'patient')
      login_success.value = true
      // MedProf Relay
      if (response.groups.some(g => medprof_groups.includes(g))) router.push({name: 'patientlist'})
      // Patient Relay
      if (response.groups.includes('patient')) router.push({name: 'PatientView', params: {patientid: response.id}})
    })
  }).catch(e => {
    login_trial_performed.value = true
    login_success.value = false
  })
}

</script>

<template>
  <MDBContainer class="text-center mt-8">
    <MDBCard tag="form" @submit.prevent="login" autocomplete="on" novalidate class="g-5 needs-validation">
      <MDBCardHeader>
        <h1 class="text-secondary">Anmelden</h1>
      </MDBCardHeader>
      <MDBCardBody class="m-2 mb-6 p-2">
        <h2>Anmelden als Mitglied von {{ user_store.getState().institution.name }}</h2>
        <p>Bitte gib hier dein Pseudonym (z.B. glücklicher Elefant) ein.</p>
        <MDBInput
            label="Pseudonym"
            v-model="pseudonym_input"
            :is-valid="login_success"
            :is-validated="login_trial_performed"
            invalidFeedback="Bitte korrektes Pseudonym eingeben"
        >
        </MDBInput>
        <MDBRow v-if="english_pseudonym.length!==0">
          <h3 class="text-primary">
            Bist du das?
          </h3>
          <MDBCol>
            <AvatarImage :pseudonym="english_pseudonym"/>
          </MDBCol>
          <MDBCol>
            <p>Dann gib bitte hier deine PIN ein.</p>

            <MDBInput
                label="PIN"
                type="number"
                v-model="pin"
                counter
                :maxlength="4"
                required
                :is-valid="login_success"
                :is-validated="login_trial_performed"
                invalidFeedback="Bitte eine vierstellige Zahl"
            ></MDBInput>
          </MDBCol>
        </MDBRow>

      </MDBCardBody>
      <MDBCardFooter class="p-2">
        <router-link to="/"><MDBBtn color="secondary"><MDBIcon class="me-2" icon="home"></MDBIcon> Home</MDBBtn></router-link>
        <MDBBtn color="primary" type="submit" :disabled="pin.length!==4">Weiter</MDBBtn>
      </MDBCardFooter>
    </MDBCard>
  </MDBContainer>
</template>

<style scoped>

</style>