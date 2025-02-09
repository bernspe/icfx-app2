<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSelect, MDBIcon, MDBBadge, MDBAnimation,
  MDBTextarea
} from 'mdb-vue-ui-kit'
import _icfcodes from "../assets/icf_codes3.json";
import {useRoute, useRouter} from "vue-router";
import {computed, onMounted, ref} from "vue";
import SpeechTextInput from "./SpeechTextInput.vue";
import {app_store, Explanation} from "../app_store";

const router = useRouter()
const route = useRoute()
const props = defineProps<{
  code: string,
  patientid: string,
  mode?: string,
  backUrl?: string,
  upUrl?: string,
  nextUrl?: string
}>()

const backwards = computed(() => route.query?.redirect)


const explanationList = ref<Array<Explanation>>([])
const getExplanations = () => {
  app_store.loadExplanationsFromApi('icf_' + props.code).then(r => explanationList.value = r)
}

onMounted(() => {
  getExplanations()
})
</script>

<template>
  <MDBCard
      class="m-2">
    <MDBCardHeader v-if="code">
      <h2 class="text-primary text-center">{{ _icfcodes[code].t }}</h2>

    </MDBCardHeader>
    <MDBCardBody v-if="code">
      <MDBListGroup>
        <MDBListGroupItem>
          <h5 class="text-primary">Offizielle Erklärung der WHO</h5>
          <p>{{ _icfcodes[code].h }}</p>
        </MDBListGroupItem>

        <MDBRow>
          <h2 class="text-primary">Wie es andere verstanden haben...</h2>
          <p class="text-secondary" v-if="explanationList?.length===0">noch keine Einträge</p>
          <MDBListGroup>
            <MDBListGroupItem v-for="APIexplanation in explanationList">
              <p :class="APIexplanation.validator ? '' : 'text-secondary'">{{ APIexplanation.text }}</p>
              <p v-if="!APIexplanation.validator" class="d-flex justify-content-end text-secondary small">Noch nicht
                validiert</p>
            </MDBListGroupItem>
          </MDBListGroup>
        </MDBRow>

        <MDBListGroupItem>
          <h2 class="text-primary">Hilf anderen Menschen beim Verstehen</h2>
          <h4 class="text-secondary">... und erkläre Ihnen Deine Sichtweise</h4>
          <SpeechTextInput :refcode="'icf_'+code" @explained="getExplanations"/>
        </MDBListGroupItem>
      </MDBListGroup>
    </MDBCardBody>


    <MDBCardFooter>
      <MDBRow>
        <MDBCol class="justify-content-start">
          <MDBBtn role="link" @click="router.back()" color="tertiary">Zurück</MDBBtn>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>

  </MDBCard>
</template>

<style scoped>

</style>