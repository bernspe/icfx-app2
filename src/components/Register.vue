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

const router = useRouter()
const route = useRoute()
const props = defineProps(['institution_id', 'group'])
const pin = ref('')
const codename = ref('')

const status = ref('primary')
const alert = ref(false)
const alertmessage = ref('')

const findGroup = (group: string) => {
  let idx = roles.findIndex(x => x.group === group)
  return roles[idx]
}

const register = (e: Event) => {
  (e.target as Element).classList.add("was-validated");
  status.value = 'loading'
  user_store.register(props.institution_id, pin.value, codename.value, props.group).then(r => {
    user_store.checkToken(r).then(response => {
      status.value = 'success'
      user_store.clear_userdata()
      user_store.set_access_token(r)
      user_store.set_user(response)
      user_store.getAPIUsersOfThisInstitution(true)
      router.push({name: 'Welcome'})
    })
  }).catch(e => {
    console.log('error ', e)
    alertmessage.value = e
    alert.value = true
    status.value = 'danger'
  })
}
</script>

<template>
  <MDBContainer class="text-center">
    <MDBCard tag="form" @submit.prevent="register" autocomplete="on" novalidate>
      <MDBCardHeader>
        <MDBCardTitle class="text-secondary mt-2">
          <h1 class="text-secondary">Willkommen bei ICFx</h1>
        </MDBCardTitle>
      </MDBCardHeader>
      <MDBCardBody class="m-2 p-2">
        <MDBRow class="d-flex align-items-top">
          <MDBCol>
            <MDBRow>
              <h2 class="text-secondary">Über ICFx erfahren</h2>
              <MDBCol>
              <img :src="imageServer()+'icfx-notebook-logo.jpg'"
                   style="max-height: 250px; width: auto; object-fit: contain;"/>
                </MDBCol>
            </MDBRow>

          </MDBCol>

          <MDBCol>
            <MDBRow class="g-5 needs-validation align-items-center">
              <h2 class="text-primary">Als {{ findGroup(group).name }} neu registrieren</h2>
              <MDBCol>
                <img :src="imageServer()+`group-pics/${findGroup(group).icon}`"
                     style="max-height: 150px; width: auto; object-fit: contain;"/>
                <p>
                  Bitte wählen Sie eine vierstellige PIN, die sie sich gut merken können.
                </p>
                <MDBInput
                    label="PIN"
                    type="number"
                    v-model="pin"
                    counter
                    :maxlength="4"
                    required
                    invalidFeedback="Bitte eine vierstellige Zahl"
                    validFeedback="Sehr gut."></MDBInput>
              </MDBCol>
              <MDBCol v-if="group !== 'patient'">
                <p>Sie benötigen noch den <span class="text-decoration-underline"> Codenamen</span>, um sich als
                  {{ findGroup(group).name }} registrieren zu können. Fragen Sie
                  dazu am besten den Verantwortlichen bei {{ user_store.getState().institution.name }}.</p>
                <MDBInput
                    label="Codename"
                    type="text"
                    v-model="codename"
                    invalidFeedback="Das stimmt anscheinend nicht."
                    validFeedback="Sehr gut."></MDBInput>
              </MDBCol>
            </MDBRow>


          </MDBCol>
        </MDBRow>

      </MDBCardBody>

      <MDBCardFooter>
        <MDBRow class="d-flex align-items-center" v-if="user_store.getState().institution.logo_url">
          <MDBCol class="d-flex justify-content-center">
            <img :src="user_store.getState().institution.logo_url"
                 style="max-height: 100px;width: auto;object-fit: contain;"/>
          </MDBCol>
        </MDBRow>
        <MDBRow class="mt-2 align-items-center d-flex justify-content-between">
          <MDBCol>
            <router-link to="/"><MDBIcon icon="home" class="me-2"/>Home</router-link>
          </MDBCol>
          <MDBCol>
            <router-link :to="`/login/${institution_id}`">Ich bin schon registriert -> Anmeldung</router-link>
          </MDBCol>
          <MDBCol>
            <MDBBtn :color="status==='loading' ? 'primary' : status" type="submit" :disabled="pin.length!==4">
              <MDBSpinner class="me-2" v-if="status==='loading'"/>
              Weiter
            </MDBBtn>
          </MDBCol>
        </MDBRow>
      </MDBCardFooter>
    </MDBCard>

    <MDBAlert v-model="alert" color="danger"> {{ alertmessage }}</MDBAlert>
  </MDBContainer>
</template>

<style scoped>

</style>