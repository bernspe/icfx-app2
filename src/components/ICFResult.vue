<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart,
  MDBDatatable, MDBTable, MDBBadge, MDBAccordion, MDBAccordionItem
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

const data = ref<Array<DataStore>>([app_store.emptyDataStore()])
const consolidatedICFDict = computed(()=> {
  let t = transformAPIResponseToConsolidatedICFDict(data.value)
  if (filterOmitSoloICFs.value) {
      t = Object.fromEntries(Object.entries(t).filter(([code, icf]) => Object.keys(icf).length > 1))
  }
  return t
})
const sortedList = computed<Array<[string, Record<string, ConsolidatedICFListEntry>]>>(()=>Object.entries(consolidatedICFDict.value))

const isPatient = computed(() => user_store.getState().groups.includes('patient'))

const upUrl = computed(() => {
  if (isPatient.value) return `/patientview/${props.patientid}`
  else return `/medview/${props.patientid}`
})


const activeItem = ref('')


const creators = ref<Array<string>>([])

/**
 * Generates Object notation nodelist with
 * Rootnode
 * Rootnode.domain
 * Rootnode.domain.icfcode
 * or
 * Rootnode1_Rootnode2.domain.icfcode if not singleNodes
 * @param cdict
 * @param singleNodes
 */
const makeNodesFromConsolidatedICFDict = (cdict: Record<string, Record<string, ConsolidatedICFListEntry>>, singleNodes?: boolean) => {
  return Array.from(new Set(Object.entries(cdict).map(([code, creator_icf_record]) => {
    return Object.keys(creator_icf_record)
        .map(creator => [creator,
          creator + '.' + code.slice(0, 2),
          singleNodes ? creator + '.' + code.slice(0, 2) + '.' + code : Object.keys(creator_icf_record).join('_') + '.' + code.slice(0, 2) + '.' + code])
  }).flat(2)))
}



const filterFuseICFs = ref(true)
const filterOmitSoloICFs = ref(true)

const currentNodes = computed(() => {
  return makeNodesFromConsolidatedICFDict(consolidatedICFDict.value,!filterFuseICFs.value)
})

interface ConsolidatedICFListEntry {
  code: string,
  creator: string,
  date?: string,
  value: number,
  selected: number
}

const transformAPIResponseToConsolidatedICFDict = (api_response: Array<DataStore>) => {
  let target: Record<string, Record<string, ConsolidatedICFListEntry>> = {}
  let c: Array<string> = []
  if (api_response) {
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
    // make creator Array unique and shift current user to first column
    creators.value = Array.from(new Set(c))

    let i = creators.value.indexOf(user_store.getState().id)
    if (i > 0) {
      creators.value.splice(i, 1)
      creators.value.unshift(user_store.getState().id)
    }
  }
  return target
}

const activeRows = ref<Array<string>>([])
const rowRefs = ref<Record<string, Element | any>>({})

const focusIcfCode = (code: string) => {
  activeRows.value = [code]
  rowRefs.value['row_' + code]?.scrollIntoView(true)
}

onMounted(() => {
  if (props.patientid) {
    // user_store.getAPIUsersOfThisInstitution(true)
    app_store.loadDataFromApi(props.patientid).then(r => {
      data.value =  r.reverse() // reverse the list so that the newest comes last to overwrite older entries
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
      <MDBAccordion v-model="activeItem" flush>
        <MDBAccordionItem
            icon="fas fa-filter fa-sm me-2 opacity-70"
            headerTitle="Filter"
            collapseId="collapseFilter"
        >
          <MDBRow class="align-items-center m-2 p-3 d-flex justify-content-end">
            <MDBCol>
              <MDBCheckbox label="Gemeinsame ICFs fusionieren" v-model="filterFuseICFs"/>
              <MDBCheckbox label="einzeln stehende ICFs ausblenden" v-model="filterOmitSoloICFs"/>
            </MDBCol>
          </MDBRow>

        </MDBAccordionItem>
      </MDBAccordion>


      <ICFGraph v-if="currentNodes.length!=0"
                :nodes="currentNodes"
                :key="currentNodes.length"
                @node-clicked="focusIcfCode"/>

      <MDBTable class="align-middle mb-0 bg-white">
        <thead class="bg-light">
        <tr>
          <th></th>
          <th>ICF Item</th>
          <th v-for="c in creators">
            <AvatarImage :pseudonym="user_store.getState().pseudonym" v-if="c===user_store.getState().id" size="55px"
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
        </tr>
        </thead>
        <tbody>
        <tr v-for="([code,icf],idx) in sortedList"
            :class="activeRows.includes(code) ? 'table-active' :'' "
            :ref="(el) => (rowRefs['row_'+code] = el)"
        >
          <td>
             <div class="table_icf_code">
              <p> {{ code }}</p>
            </div>
          </td>
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

.table_icf_code {
   writing-mode: vertical-rl;
   white-space:nowrap;
   transform:scale(-1);
}
</style>