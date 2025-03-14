<script setup lang="ts">
import {computed, ComputedRef, inject, onMounted, ref, watch, watchEffect} from "vue";
import {
  MDBCard,
  MDBCardHeader,
  MDBCardBody,
  MDBSelect,
  MDBRow,
  MDBCol,
  MDBAutocomplete,
  MDBChip,
  MDBInput,
  MDBListGroup,
  MDBListGroupItem,
  MDBTable, MDBBadge,
    MDBBtn, MDBIcon, MDBTextarea
} from "mdb-vue-ui-kit";
import {app_store, Explanation, ICFItemStructure, WhodasEnvItemStructure} from "../app_store";
import {user_store} from "../user_store";
import {imageServer} from "../process_vars";
import AvatarImage from "./AvatarImage.vue";
import __icfcodes from "../assets/icf_codes3.json";
import __env from "../assets/env_factors_de.json";
const _env: Record<string, WhodasEnvItemStructure> = __env;
const _icfcodes: Record<string, ICFItemStructure> = __icfcodes;

const explanations = ref<Array<Explanation>>([])


const activeRow = ref<number>(0)
const rowRefs = ref<Record<string, Element | any>>({})

const refcode2Item = (refcode: string) => {
  let a = refcode.split('_')
  return {entity: a[0], code: a[1]}
}

const textAreaValue = ref('')

watch(activeRow, (value) => {
  textAreaValue.value = explanations.value[value].text
})

const updateItem = (idx: number) => {
  let e = {...explanations.value[idx], validator: user_store.getState().id, text: textAreaValue.value}
  app_store.updateExplanationsAtApi(e).then(e=>(explanations.value[idx]={...e,...refcode2Item(e.refcode)}))
}

const deleteItem = (idx: number) => {
  app_store.deleteExplanationsAtApi(explanations.value[idx]).then(()=>explanations.value.splice(idx,1))
}

const creators = computed(()=> {
  const validators = explanations.value.map(e=>e.validator)
  const creatrs = explanations.value.map(e=>e.creator)
  return Array.from(new Set([...validators,...creatrs]))
})

onMounted(()=> {
  app_store.loadExplanationsFromApi().then(expl=> {
    explanations.value = expl.map(e=>({...e,...refcode2Item(e.refcode)}))
    if (expl?.length>0)
    textAreaValue.value=expl[0].text
  })
})
</script>

<template>
<MDBCard class="m-2 p-2">
  <MDBCardHeader>
    <h1>Explain Items</h1>
  </MDBCardHeader>
  <MDBCardBody>
          <MDBTable class="align-middle mb-0 bg-white">
            <thead class="bg-light">
            <tr>
              <th></th>
              <th>Item</th>
              <th>Comment Text</th>
              <th>Validation</th>
              <th>Action</th>
              <!--
              <th v-for="c in creators">
                <AvatarImage :pseudonym="user_store.getState().pseudonym" v-if="c===user_store.getState().id"
                             size="55px"
                             label_position="badge"/>
                <div v-else
                     v-for="g in user_store.getState().userdata.filter(user => user.id === c)[0]?.groups">
                  <img :src="imageServer()+'group-pics/'+g+'.jpg'"
                       style="width: 55px; height: 55px"/>
                  <MDBBadge
                      class="translate-middle p-1"
                      badge="info"
                      pill
                      notification
                  >{{ g }}
                  </MDBBadge>
                </div>

              </th>

              -->

            </tr>
            </thead>

            <tbody>
            <tr v-for="(e,idx) in explanations"
                :class="activeRow === idx ? 'table-active' :'' "
                :ref="(el) => (rowRefs['row_'+e.refcode] = el)"
            >
              <td>
                <div class="table_icf_code">
                  <p> {{ e.refcode }}</p>
                </div>
              </td>
              <td>
                <div class="thumbimg" v-if="e.entity==='icf'">
                  <img
                      :src="imageServer()+`icf-pics/${e.code}.jpg`"
                      :alt="e.refcode"
                      style="max-height: 80px; width:auto; object-fit: contain"
                  />
                  <p> {{ _icfcodes[e.code]?.t }} </p>
                </div>

                <div v-if="e.entity==='env'">
                  <h6 class="text-primary"> {{ _env[e.code].s }}</h6>
                  <p v-html="_env[e.code].t"/>
                </div>
              </td>

              <td>
                <div v-if="activeRow === idx">
                  <MDBTextarea label="Kommentar" rows="4" v-model="textAreaValue" @blur="updateItem(idx)"/>
                </div>
                <div v-else> {{ e.text }}</div>
              </td>

              <td>
                <img :src="(e.validator ? 'check-mark.svg' : 'cross-mark.svg')"
                     style="max-height: 80px; width:auto; object-fit: contain" />
              </td>

              <td class="p-1">
                <MDBBtn @click="updateItem(idx)" outline="success"><MDBIcon icon="check" class="me-2"/>Validate</MDBBtn>
                <MDBBtn @click="activeRow=idx" outline="primary"><MDBIcon icon="pen" class="me-2"></MDBIcon>Edit</MDBBtn>
                <MDBBtn outline="danger" @click="deleteItem(idx)"><MDBIcon icon="trash" class="me-2"/>Delete</MDBBtn>
              </td>
            </tr>
            </tbody>
          </MDBTable>
  </MDBCardBody>
</MDBCard>
</template>

<style scoped>

.table-active .thumbimg {
  zoom: 200%;
}

.thumbimg {
  position: relative;
}

.thumbimg p {
  position: absolute;
  bottom: -1em;
  padding-left: 1em;
  width: 100%;
  border: solid #000;
  border-width: 1px 0;
  font-size: 0.7em;
  text-align: left;
  color: rgb(90%, 90%, 90%);
  background: gray;
}

.table_icf_code {
  writing-mode: vertical-rl;
  white-space: nowrap;
  transform: scale(-1);
}
</style>