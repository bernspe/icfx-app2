<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon,
  MDBAccordion, MDBAccordionItem
} from 'mdb-vue-ui-kit'

import _coresets from '../assets/coresets.json'
import moment from "moment";
import {computed, onMounted, ref, watch} from "vue";
import type {DataStore, ICFItemStructure, ICFStruct} from "../app_store";
import {app_store} from "../app_store";


import PatientStatisticsComponent from "./PatientStatisticsComponent.vue";
import InfoButton from "./InfoButton.vue";
import ICFThumbPanel from "./ICFThumbPanel.vue";
import ListHeader from "./ListHeader.vue";
import DiagnosisInput from "./DiagnosisInput.vue";
import AvatarImage from "./AvatarImage.vue";
import {user_store} from "../user_store";
import GroupImage from "./GroupImage.vue";
import {imageServer} from "../process_vars";
import {useRoute, useRouter} from "vue-router";


const router = useRouter()
const route = useRoute()

const accordion_activeItem = ref('icf')

const props = defineProps({patientid: {type: String, required: true}, preloadgroup: {type: String, required: false}})
const _userdata = computed(() => user_store.getState().userdata)
const patient = computed(() => {
  return _userdata.value.filter(p => p.id === props.patientid)[0]
})

const statsmoduleref = ref<HTMLElement>();

const show_preload_switch = computed(() => {
  // check if the current medprof has already given his statement in order to be eligible for other perspectives
  return alldata.value.filter(d => d.creator === user_store.getState().id).length > 0
})

const preload_other_data = ref(props.preloadgroup?.length != 0)

const api_data_store_size = computed(() => app_store.getState().api_patient_records.length)

const data = ref<DataStore>(app_store.emptyDataStore())
const alldata = ref<Array<DataStore>>([app_store.emptyDataStore()])

const secondaryData1 = ref<DataStore>(app_store.emptyDataStore())
const secondaryData2 = ref<DataStore>(app_store.emptyDataStore())

const mergedIcfData = computed(() => {
  if (secondaryData1.value?.id) {
    let result: DataStore = {...app_store.emptyDataStore(), id: secondaryData1.value.id}
    if (secondaryData1.value?.icf && secondaryData2.value?.icf) {
      // if datasets are the same break
      if (secondaryData1.value?.id === secondaryData2.value?.id) {
        return secondaryData1.value
      }
      // otherwise
      const sd1 = Object.fromEntries(Object.entries(secondaryData1.value.icf).filter(([code, icf]) => icf.selected > (showIcfDetails.value ? -2 : 0)))
      const sd2 = Object.fromEntries(Object.entries(secondaryData2.value.icf).filter(([code, icf]) => icf.selected > (showIcfDetails.value ? -2 : 0)))
      let k1 = Object.keys(sd1)
      let k2 = Object.keys(sd2)
      if (mergeOperations[currentMergeOperationIdx.value].operation === 'and') {
        let k3 = k1.filter(code => k2.includes(code)) // get common icf items
        let targets = k3.map(code => ([code, {selected: 1, value: (sd1[code].value + sd2[code].value) / 2}]))
        result.icf = Object.fromEntries(targets)
        result.id = '' // Delete id to create new
      }
      if (mergeOperations[currentMergeOperationIdx.value].operation === 'or') {
        let k3 = k1.concat(k2) // add icf items
        let targets = k3.map(code => {
          if (k1.includes(code) && k2.includes(code)) return [code, {
            selected: 1,
            value: (sd1[code].value + sd2[code].value) / 2
          }]
          else return [code, {selected: 1, value: k1.includes(code) ? sd1[code].value : sd2[code].value}]
        })
        result.icf = Object.fromEntries(targets)
        result.id = '' // Delete id to create new
      }
      if (mergeOperations[currentMergeOperationIdx.value].operation === 'right') {
        result.icf = sd2
        result.id = ''
      }
      if (mergeOperations[currentMergeOperationIdx.value].operation === 'left') {
        result.icf = sd1
      }
    }
    return result
  }
})

const mergeOperations = [
  {operation: 'and', icon: 'sets_logical_and.svg', descriptor_de: 'und', descriptor_en: 'and'},
  {
    operation: 'or',
    icon: 'sets_logical_or.svg',
    descriptor_de: 'oder',
    descriptor_en: 'or'
  },
  {operation: 'right', icon: 'sets_logical_right.svg', descriptor_de: 'rechts', descriptor_en: 'right'},
  {operation: 'left', icon: 'sets_logical_left.svg', descriptor_de: 'links', descriptor_en: 'left'},
]
const currentMergeOperationIdx = ref(0)

const changeMergeOperationIdx = () => {
  if (currentMergeOperationIdx.value < mergeOperations.length - 1) currentMergeOperationIdx.value += 1
  else currentMergeOperationIdx.value = 0
}

const newestDataSetFromEachCreator = computed(() => {
  let creators = Array.from(new Set(alldata.value.map(d => d.creator)))
  let indices = creators.map(c => alldata.value.map(d => d.creator).indexOf(c)).filter(i => i > -1)
  return indices.map(i => alldata.value[i])
})

const rollingSecondaryDataset = (d: DataStore) => {
  let result;
  if (d.creator === '') result = newestDataSetFromEachCreator.value[0]
  let idx = newestDataSetFromEachCreator.value.map(e => e.creator).indexOf(d.creator)
  if (idx > -1) {
    if (idx === newestDataSetFromEachCreator.value.length - 1) result = newestDataSetFromEachCreator.value[0]
    else result = newestDataSetFromEachCreator.value[idx + 1]
  } else result = d
  let statsRows = document.querySelectorAll('.stats-record');
  statsRows?.forEach((p) => {
    if (p['dataset']['creator'] === result.creator) p.classList.add('clicked-record')
    else p.classList.remove('clicked-record')
  });
  return result
}

/**
 * get the creator group of the selected dataset
 */
const currentPerspectiveGroup1 = computed(() => {
  if (secondaryData1.value.creator) {
    let ud = user_store.getState().userdata
    let idx = ud.map(u => u.id).indexOf(secondaryData1.value.creator)
    if (idx >= 0) return ud[idx].groups
    else return user_store.getState().groups
  } else return user_store.getState().groups
})

const currentPerspectiveGroup2 = computed(() => {
  if (secondaryData2.value.creator) {
    let ud = user_store.getState().userdata
    let idx = ud.map(u => u.id).indexOf(secondaryData2.value.creator)
    if (idx >= 0) return ud[idx].groups
    else return user_store.getState().groups
  } else return user_store.getState().groups
})
const loadDataSetFromApi = (d: DataStore) => {
  // set current medprof user as primary dataset for merging
  secondaryData1.value = newestDataSetFromEachCreator.value.filter(dx => dx.creator === user_store.getState().id)[0]
  // dataset from choice will be secondary set
  secondaryData2.value = JSON.parse(JSON.stringify(d));
  data.value = mergedIcfData.value || secondaryData1.value;
  loadCoreSetCheckBoxes()
  app_store.setCurrentData(data.value)
  app_store.set_active_icf('')
}

const core_options = ref(Object.entries(_coresets).map(([k, v], idx) => ({
  keycode: k,
  text: v.name,
  icfitems: v.items,
  value: idx,
  checked: false
})))

const loadCoreSetCheckBoxes = () => {
  core_options.value.forEach(code => code.checked = false)
  const coreset_array = data.value?.coreset?.toString().split(',') || []
  core_options.value.forEach((coreset, idx) => {
    if (coreset_array.includes(coreset.keycode)) {
      core_options.value[idx].checked = true
    }
  })
}

const selected_icf_keys = computed<Array<string>>(() => {
  return [...new Set(core_options.value.filter(o => o.checked).map(s => {
    return s.icfitems
  }).flat())]
})

const lastIcfEdited = computed(() => {
  const vals = Object.values(data.value?.icf || {})
  if (vals.length > 0) {
    let i = Object.values(data.value.icf || {}).map(x => x.selected != 0).lastIndexOf(true)
    if (i === -1) return 0
    else return i
  } else return 0
})

const icfEdited = computed(() => {
  const vals = Object.values(data.value?.icf || {})
  if (vals.length > 0)
    return Math.ceil(vals.filter(x => x.selected != 0).length / vals.length * 100)
  else
    return 0
})

// will show all icfs, even those that were deselected
const showIcfDetails = ref(true)

const icfsFromCoresetData = computed(() => {
  let targetObj: Record<string, ICFStruct> = {}
  selected_icf_keys.value.forEach(code => {
    targetObj[code] = {value: code[0] === 'e' ? 4 : 0, selected: 0};
  })
  Object.entries(data.value?.icf || {}).forEach(([code, icfitem]) => {
    targetObj[code] = icfitem
  })
  return targetObj
})

const clearAll = () => {
  core_options.value.forEach(code => code.checked = false)
  data.value = app_store.emptyDataStore()
  app_store.setCurrentData(data.value)
  app_store.set_active_icf('')
}


const active_icf = computed(() => app_store.getState().active_icf)
watch(active_icf, (newVal, oldVal) => {
  if (oldVal && props.patientid && preload_other_data.value) app_store.loadDataFromApi(props.patientid)
})

const preloadData = (autoassign: boolean) => {
  if (props.patientid) {
    app_store.set_current_patient_id(props.patientid)
    app_store.loadDataFromApi(props.patientid).then(r => {
      // fuse data from API and from Store if Store contains values
      alldata.value = r
      let p = app_store.emptyDataStore()

      if (preload_other_data.value) {
        let t;
        if (props.preloadgroup) {
          let alldata_with_groups = alldata.value.map(d => {
            let ud = user_store.getState().userdata
            let idx = ud.map(u => u.id).indexOf(d.creator)
            return {...d, groups: ud[idx].groups}
          })
          let alldata_filtered_group = alldata_with_groups.filter(x => x.groups.includes(props.preloadgroup))
          if (alldata_filtered_group.length > 0) t = alldata_filtered_group[0]
          else t = r[0]
        } else t = r[0]

        p = t
        p.icf = t.icf
        p.coreset = t.coreset
        p.date = t.date || moment().format()

        autoassign = true
      }
      // aktuelle Daten
      let s = Object.values(app_store.getState().patient_data).some(v => Object.keys(v).length > 0) ? app_store.getState().patient_data : app_store.emptyDataStore()
      loadDataSetFromApi(autoassign ? p : s)
    })
  }
}

watch(icfsFromCoresetData, (newVal, oldVal) => {
  app_store.setCurrentData({
    ...data.value,
    icf: newVal,
    coreset: core_options.value.filter(coreset => coreset.checked).map(coreset => coreset.keycode).join(',')
  })
  app_store.set_active_icf('')
})

watch(preload_other_data, (newVal, oldVal) => {
  if (newVal) {
    preloadData(newVal)
  } else {
    clearAll()
  }
})

watch(mergedIcfData, (newVal, oldVal) => {
  if (newVal) data.value = newVal
})

onMounted(() => {
  if (props.patientid && _userdata.value?.length > 0) preloadData(preload_other_data.value)
  else router.push('/')
})
</script>

<template>
 <MDBRow class="d-flex align-items-center m-2">
        <MDBCol class="d-flex justify-content-start">
          <h1 class="text-secondary">Behandlerseite</h1>
        </MDBCol>
        <MDBCol class="d-flex justify-content-end">
          <InfoButton component_name="MedProfMain"/>
        </MDBCol>
      </MDBRow>

  <MDBAccordion v-model="accordion_activeItem" flush :stay-open="true">
    <MDBAccordionItem header-title="Beurteilungsperspektive" collapse-id="perspective">
      <MDBRow class="d-flex align-items-center m-2">
        <MDBCol class="d-flex justify-content-start">
          <h2 class="text-secondary">Beurteilungsperspektive</h2>
        </MDBCol>
        <MDBCol class="d-flex justify-content-end">
          <InfoButton component_name="MedProfMain"/>
        </MDBCol>
      </MDBRow>

      <MDBRow class="d-flex align-items-center m-2 g-0">

        <MDBCol cols="6">
          <MDBRow class="d-flex align-items-center m-2 g-0 people-case">
            <div class="text-center ribbon">
              <span class="text-primary">Behandler und Patient</span>
            </div>

            <MDBCol class="d-flex justify-content-start">
              <AvatarImage :pseudonym="user_store.getState().pseudonym" size="55px" color="green"/>
            </MDBCol>
            <MDBCol class="px-0 text-center">
              <MDBIcon class="text-primary" icon="equals"/>
            </MDBCol>
            <MDBCol class="px-0">
              <GroupImage :group="g" v-for="g in user_store.getState().groups"/>
            </MDBCol>

            <MDBCol class="d-flex justify-content-start px-4">
              <div class="text-center">
                <MDBIcon class="text-primary" icon="hand-point-right"/>
                <h5 class="text-primary">beurteilt</h5>
              </div>
            </MDBCol>

            <MDBCol class="d-flex justify-content-start">
              <AvatarImage :pseudonym="patient?.pseudonym" v-if="patient" size="55px" color="blue"/>
            </MDBCol>
            <MDBCol class="text-center px-0">
              <MDBIcon class="text-primary" icon="equals"/>
            </MDBCol>
            <MDBCol>
              <GroupImage group="patient"/>
            </MDBCol>
          </MDBRow>
        </MDBCol>

        <MDBCol cols="6" v-if="show_preload_switch" class="d-flex justify-content-center">

          <div v-if="!preload_other_data">
            <MDBBtn color="primary" @click="preload_other_data=true">
              <MDBIcon class="me-2" icon="eye"/>
              Perspektive eröffnen
            </MDBBtn>
          </div>

          <div v-else>
            <MDBRow class="d-flex align-items-center m-2 g-0 people-case">

              <div class="text-center ribbon">
                <MDBIcon class="text-primary me-4" icon="eye"/>
                <span class="text-primary">aus Sicht von</span>
              </div>


              <MDBCol>
                <div class="text-center">
                  <h5 class="text-secondary m-2">Meine Sicht</h5>
                  <GroupImage :group="g" v-for="g in currentPerspectiveGroup1"/>
                  <MDBBtn color="tertiary" @click="secondaryData1 = rollingSecondaryDataset(secondaryData1)" disabled>
                    <MDBIcon icon="refresh" class="me-2"></MDBIcon>
                    Ändern
                  </MDBBtn>
                </div>
              </MDBCol>

              <MDBCol>
                <div class="text-center">
                  <div>
                    <img :src="imageServer()+mergeOperations[currentMergeOperationIdx].icon"
                         style="height:40px;width:auto;"
                         class="filter-primary"/>
                  </div>
                  <div>
                    <MDBBtn color="tertiary" @click="changeMergeOperationIdx">
                      <MDBIcon icon="refresh" class="me-2"></MDBIcon>
                    </MDBBtn>
                  </div>
                </div>
              </MDBCol>

              <MDBCol>
                <div class="text-center">
                  <h5 class="text-secondary m-2">Zweite Sicht</h5>
                  <GroupImage :group="g" v-for="g in currentPerspectiveGroup2"/>
                  <MDBBtn color="tertiary" @click="secondaryData2 = rollingSecondaryDataset(secondaryData2)">
                    <MDBIcon icon="refresh" class="me-2"></MDBIcon>
                    Ändern
                  </MDBBtn>
                </div>
              </MDBCol>
            </MDBRow>
          </div>
        </MDBCol>

        <MDBRow class="d-flex align-items-center" ref="statsmoduleref" v-if="show_preload_switch">
          <MDBCol>
            <h2 class="text-secondary">Perspektiven</h2>
          </MDBCol>
          <MDBCol class="d-flex justify-content-end">
            <MDBSwitch v-model="preload_other_data"></MDBSwitch>
          </MDBCol>
        </MDBRow>

        <PatientStatisticsComponent
            mode="long"
            :patient_id="patientid"
            v-show="preload_other_data"
            @entry_clicked="loadDataSetFromApi"
            :key="api_data_store_size"/>
      </MDBRow>
    </MDBAccordionItem>

    <MDBAccordionItem header-title="Diagnosen" collapse-id="diagnoses">
      <MDBRow class="d-flex align-items-center m-2">
        <DiagnosisInput :diagnoses="patient?.diagnoses" :patientid="patientid"/>
      </MDBRow>
    </MDBAccordionItem>

    <MDBAccordionItem header-title="Coresets" collapse-id="coresets">
      <MDBRow class="d-flex align-items-center m-2">
        <MDBCheckbox v-for="core in core_options" :label="core.text" inline v-model="core.checked"/>
      </MDBRow>
    </MDBAccordionItem>

    <MDBAccordionItem header-title="ICFs" collapse-id="icf">
      <ListHeader
          label="ICFs"
          :number-icf-items="Object.keys(icfsFromCoresetData).length"
          :show-details="showIcfDetails"
          :patientid="patientid"
          :last-item-edited="Object.keys(icfsFromCoresetData)[lastIcfEdited]"
          module="icf"
          :percent-edited="icfEdited"
          :startButtonActive="true"
          @show-details-changed="showIcfDetails=$event"
          @clear="clearAll"
      ></ListHeader>
      <ICFThumbPanel :icfs="icfsFromCoresetData" :patientid="patientid"/>
    </MDBAccordionItem>
  </MDBAccordion>
</template>

<style scoped>
.filter-primary {
  filter: invert(41%) sepia(20%) saturate(1538%) hue-rotate(178deg) brightness(105%) contrast(92%);
}

.people-case {
  border: #2c58a0 solid 2px;
  border-radius: 15px;
  position: relative;
  padding-top: 1em;
}

.ribbon {
  width: auto;
  font-size: 14px;
  padding: 4px;
  position: absolute;
  left: 10px;
  top: -15px;
  text-align: center;
  background-color: #ffffff;
  color: dodgerblue;
}
</style>