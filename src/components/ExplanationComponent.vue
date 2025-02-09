<script setup lang="ts">

import {MDBAnimation, MDBBtn, MDBListGroup, MDBListGroupItem, MDBBadge, MDBIcon, MDBRow, MDBCol} from "mdb-vue-ui-kit";
import {inject, ref, watch} from "vue";
import {app_store, Explanation} from "../app_store";
import __icf_explanations from "../assets/icf-explanations_de.json";
import {user_store} from "../user_store";
import {backendURL} from "../process_vars";
import axios from "axios";

const _icf_explanations: Record<string, string> = __icf_explanations;


const props = defineProps({
  code: {type: String},
  module: {type: String, default: 'icf'},
  explanations: {type: Array<String>}
})

const _toggleExplanation = inject('toggleExplanation', false);

const toggleExplanation = ref(_toggleExplanation);

const explanationListRequested = ref(false)
const explanationList = ref<Array<Explanation>>([])
const getExplanationsFromApi = () => {
  explanationListRequested.value = true
  app_store.loadExplanationsFromApi(props.module + '_' + props.code).then(r => {
    explanationList.value = r
    toggleExplanation.value = true
  }).finally(() => explanationListRequested.value = true)
}

const getExplanations = () => {
  if ((props.module === 'icf') && (props.code)) {
    if (Object.keys(_icf_explanations).includes(props.code)) toggleExplanation.value = true
    else getExplanationsFromApi()
  }
  if (props.module === 'env') {
    getExplanationsFromApi()
  }
}

const updateExplainAPIRequest = (id: number, data:Explanation): Promise<Explanation> => {
  return new Promise((resolve, reject) => {
    if (user_store.getState().authenticated) {
      var config = {
        method: 'PATCH',
        url: backendURL() + `explain/${id}/`,
        headers: {
          authorization: `Bearer ${user_store.getState().access_token}`,
          'Content-Type': 'application/json'
        },
        xhrFields: {
          withCredentials: true
        },
        data: data
      };
      axios(config).then((response) => {
        resolve(response.data)
        getExplanations()
      }).catch((e) => {
        reject(e);
      })
    } else reject('Not authenticated')
  })
}

const deleteExplainAPIRequest = (id: number): Promise<Explanation> => {
  return new Promise((resolve, reject) => {
    if (user_store.getState().authenticated) {
      var config = {
        method: 'DELETE',
        url: backendURL() + `explain/${id.toString()}/`,
        headers: {
          authorization: `Bearer ${user_store.getState().access_token}`,
          'Content-Type': 'application/json'
        },
        xhrFields: {
          withCredentials: true
        }
      };
      axios(config).then((response) => {
        resolve(response.data)
        getExplanations()
      }).catch((e) => {
        reject(e);
      })
    } else reject('Not authenticated')
  })
}

watch(toggleExplanation, (newVal, oldVal) => {
  if (newVal) {
    getExplanations()
  } else {
    explanationList.value = []
    explanationListRequested.value = false
  }
})
</script>

<template>
  <div v-show="toggleExplanation">
    <MDBAnimation trigger="manually" v-model="toggleExplanation" animation="slide-in-down" begin-hidden>
      <div v-if="(module==='icf') && (code)">
        <p class="text-center text-info" v-if="(Object.keys(_icf_explanations).includes(code))">
          {{ _icf_explanations[code] }}</p>
      </div>
      <div v-if="(module==='env')">
        <MDBListGroup class="m-2 p-2">
          <MDBListGroupItem v-for="explanation in explanations">
            <p v-html="explanation"/>
          </MDBListGroupItem>
        </MDBListGroup>
      </div>

      <!-- API derived Explanations -->
      <MDBBtn color="tertiary" @click="getExplanationsFromApi" v-if="explanationList.length===0">Weitere
        Erklärungen laden
      </MDBBtn>
      <MDBListGroup v-if="explanationList.length>0" >
        <MDBListGroupItem v-for="APIexplanation in explanationList" class="d-flex justify-content-between align-items-center">
          <div>
          <p :class="APIexplanation.validator ? '' : 'text-secondary'">{{ APIexplanation.text }}</p>
            <MDBRow>
              <MDBCol>
            <MDBBtn v-if="APIexplanation.creator===user_store.getState().id"
                    class="d-flex justify-content-start" outline="danger" size="sm"
                    @click="deleteExplainAPIRequest(APIexplanation.id)"
            ><MDBIcon icon="trash" class="me-2"/>Löschen</MDBBtn>
            </MDBCol>
              <MDBCol>
            <MDBBtn v-if="user_store.getState().is_staff"
                    class="d-flex justify-content-start" outline="primary" size="sm"
                    @click="updateExplainAPIRequest(APIexplanation.id, {...APIexplanation, validator: user_store.getState().id})">
              <MDBIcon icon="check" class="me-2"/>Validieren
            </MDBBtn>
                </MDBCol>
              </MDBRow>
            </div>
          <MDBBadge v-if="!APIexplanation.validator" class="badge-warning rounded-pill">
          Noch nicht validiert
            </MDBBadge>
          <MDBBadge v-else class="badge-success rounded-pill">
          Validiert
            </MDBBadge>
        </MDBListGroupItem>
      </MDBListGroup>

      <p class="text-secondary" v-if="explanationListRequested && (explanationList.length===0)">Keine Einträge
        vorhanden. Vielleicht schreibst du eine in den Kommentar?</p>
    </MDBAnimation>
  </div>
</template>

<style scoped>

</style>