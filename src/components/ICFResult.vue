<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart,
    MDBDatatable
} from 'mdb-vue-ui-kit'

import {computed, onMounted, ref} from "vue";
import {app_store, type DataStore, ICFItemStructure} from "../app_store";
import __icfcodes from "../assets/icf_codes3.json";

import {imageServer} from "../process_vars";
import { VNetworkGraph } from "v-network-graph"
import "v-network-graph/lib/style.css"
import ICFGraph from "./ICFGraph.vue";



const _icfcodes: Record<string, ICFItemStructure> = __icfcodes;


const props = defineProps({
  patientid: {type: String},
})

const data = ref<DataStore>(app_store.emptyDataStore())

const upUrl = computed(() => {
  return `/patientview/${props.patientid}`
})


const sortedList = ref<Array<[string,Record<string,ConsolidatedICFListEntry>]>>([])
const creators = ref<Array<string>>([])
const userGroupPicFromUserID = (userid: string) => {
  if (userid) {
    let g = app_store.getState().users_of_this_institution.filter(user => user.id === userid)[0].groups

    return g.join(',')
  }
  else return ''
}

const dataset = computed(()=> {
  return ({
    columns: ['ICF Code', ...creators.value.map(id=>userGroupPicFromUserID(id))],
    rows: [
        ...sortedList.value.map(([code, icf]) => ([icfCode2Pic( code), ...creators.value.map(c => {
        if (Object.keys(icf).includes(c)) return icf[c].value.toString()
        else return ''
      })]))
    ]
  });
})

const icfCode2Pic = (code:string) => {
  return `<img src='${imageServer()}icf-pics/${code}.jpg' alt='${code}' style="max-height: 40px; width:auto; object-fit: contain"/><p>${_icfcodes[code]?.t}</p>`
}

const domainsOfEachUser = computed(()=> {
  let targetDomains:Record<string,Record<string,Array<string>>> = Object.fromEntries(creators.value.map(c => ([c,{}])))
  sortedList.value.forEach(([code, icf])=> {
   Object.values(icf).forEach(i=> {
      let d = code.slice(0, 2)
      if (Object.keys(targetDomains[i.creator]).includes(d)) targetDomains[i.creator][d].push(code)
      else targetDomains[i.creator][d]=[code]
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
const transformAPIResponseToConsolidatedICFList = (api_response:Array<DataStore>) => {
  let target:Record<string,Record<string,ConsolidatedICFListEntry>> = {}
  let c:Array<string>=[]
  api_response.forEach(r=>{
    Object.entries(r.icf).forEach(([code,icf_value])=> {
      let o = {code: code, creator: r.creator, date: r.date, ...icf_value}
      c.push(r.creator)
      if (Object.keys(target).includes(code)) {
        target[code][r.creator]=o
      } else {
        target[code] = {[r.creator]:o}
      }
    })
  })
  creators.value=Array.from(new Set(c))
  return target
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

<ICFGraph v-if="Object.keys(domainsOfEachUser).length!=0" :domains="domainsOfEachUser"/>
      <MDBDatatable :dataset="dataset"/>

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

</style>