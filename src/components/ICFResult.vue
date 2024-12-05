<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart,
  MDBDatatable, MDBTable, MDBBadge
} from 'mdb-vue-ui-kit'

import {computed, onMounted, ref, useTemplateRef} from "vue";
import {app_store, type DataStore, ICFItemStructure} from "../app_store";
import __icfcodes from "../assets/icf_codes3.json";

import {imageServer} from "../process_vars";
import {VNetworkGraph} from "v-network-graph"
import "v-network-graph/lib/style.css"
import ICFGraph from "./ICFGraph.vue";
import AvatarImage from "./AvatarImage.vue";
import {user_store} from "../user_store";
import {AuspraegungColor, UmweltColor} from "../constants";


const _icfcodes: Record<string, ICFItemStructure> = __icfcodes;


const props = defineProps({
  patientid: {type: String},
})

const data = ref<DataStore>(app_store.emptyDataStore())

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})


const sortedList = ref<Array<[string, Record<string, ConsolidatedICFListEntry>]>>([])
const creators = ref<Array<string>>([])

const domainsOfEachUser = computed(() => {
  let targetDomains: Record<string, Record<string, Array<string>>> = Object.fromEntries(creators.value.map(c => ([c, {}])))
  sortedList.value.forEach(([code, icf]) => {
    Object.values(icf).forEach(i => {
      let d = code.slice(0, 2)
      if (Object.keys(targetDomains[i.creator]).includes(d)) targetDomains[i.creator][d].push(code)
      else targetDomains[i.creator][d] = [code]
    })
  })

  return targetDomains
})

interface ConsolidatedICFListEntry {
  code: string,
  creator: string,
  date?: string,
  value: number,
  selected: number
}

const transformAPIResponseToConsolidatedICFList = (api_response: Array<DataStore>) => {
  let target: Record<string, Record<string, ConsolidatedICFListEntry>> = {}
  let c: Array<string> = []
  api_response.forEach(r => {
    Object.entries(r.icf).forEach(([code, icf_value]) => {
      let o = {code: code, creator: r.creator, date: r.date, ...icf_value}
      c.push(r.creator)
      if (Object.keys(target).includes(code)) {
        target[code][r.creator] = o
      } else {
        target[code] = {[r.creator]: o}
      }
    })
  })
  creators.value = Array.from(new Set(c))
  let i = creators.value.indexOf(user_store.getState().id)
  if (i > 0) {
    creators.value.splice(i, 1)
    creators.value.unshift(user_store.getState().id)
  }
  return target
}

const activeRows = ref<Array<string>>([])
const rowRefs = ref<Record<string, Element | any>>({})

const focusIcfCode = (code: string) => {
  activeRows.value = [code]
  rowRefs.value['row_' + code]?.scrollIntoView(true)
}
const downgrade = (item: any, i: number) => {
  sortedList.value.splice(i, 1)
  sortedList.value.splice(i + 1, 0, item)
}

const upgrade = (item: any, i: number) => {
  sortedList.value.splice(i, 1)
  sortedList.value.splice(i - 1, 0, item)
}

onMounted(() => {
  if (props.patientid) {
    app_store.loadDataFromApi(props.patientid).then(r => {
      data.value = Object.assign({}, r[0])
      sortedList.value = Object.entries(transformAPIResponseToConsolidatedICFList(r.reverse())) // reverse the list so that the newest comes last to overwrite older entries
    })
  }
})
</script>

<template>
  <MDBCard class="m-2 p-2">
    <MDBCardHeader>
      <h2 class="text-secondary">Ergebnisse der ICFs</h2>
    </MDBCardHeader>
    <MDBCardBody>

      <ICFGraph v-if="Object.keys(domainsOfEachUser).length!=0" :domains="domainsOfEachUser"
                @node-clicked="focusIcfCode"/>

      <MDBTable class="align-middle mb-0 bg-white">
        <thead class="bg-light">
        <tr>
          <th>ICF Item</th>
          <th v-for="c in creators">
            <AvatarImage :pseudonym="user_store.getState().pseudonym" v-if="c===user_store.getState().id" size="55px"
                         label_position="badge"/>
            <div v-else
                 v-for="g in app_store.getState().users_of_this_institution.filter(user => user.id === c)[0]?.groups">
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
        </tr>
        </thead>
        <tbody>
        <tr v-for="([code,icf],idx) in sortedList"
            :class="activeRows.includes(code) ? 'table-active' :'' "
            :ref="(el) => (rowRefs['row_'+code] = el)"
        >
          <td>
            <div class="thumbimg">
              <img
                  :src="imageServer()+`icf-pics/${code}.jpg`"
                  :alt="code"
                  style="max-height: 80px; width:auto; object-fit: contain"
              />
              <p> {{ _icfcodes[code]?.t }} </p>
            </div>
          </td>
          <td v-for="c in creators">
            <div v-if="Object.keys(icf).includes(c)"> {{ icf[c].value }}</div>

          </td>
        </tr>
        </tbody>
      </MDBTable>


    </MDBCardBody>
    <MDBCardFooter>
      <MDBRow class="d-flex align-items-center">
        <MDBCol class="justify-content-start">
          <router-link :to="upUrl">Zurück</router-link>
        </MDBCol>
      </MDBRow>
    </MDBCardFooter>
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
</style>