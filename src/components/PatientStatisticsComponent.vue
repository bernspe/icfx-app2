<script setup lang="ts">
import {MDBBadge, MDBRow, MDBCol} from 'mdb-vue-ui-kit'
import {app_store, type DataStore} from "../app_store";
import {imageServer} from "../process_vars";
import {dateformat, dateTimeFormat, mergeOperations, modules} from "../constants";
import {computed, onMounted, ref} from "vue";
import moment from "moment";
import GroupImage from "./GroupImage.vue";
import {user_store} from "../user_store";

const props = defineProps({
  patient_id: {type: String, required: true},
  mode: {type: String, default: 'short'}
})
const emit = defineEmits(['entry_clicked'])

const statsmoduleref = ref<HTMLElement>();

const mouseOverAct = (e: Event, code: string | undefined) => {
  let parentRows = statsmoduleref.value?.querySelectorAll('.row');
  let t = e.target as HTMLElement
  parentRows?.forEach((p) => {
    if (p.contains(t)) p.classList.add('hovered-record')
    else p.classList.remove('hovered-record')
  });
}

const mouseLeaveAct = (e: Event) => {
  let t = e.target as HTMLElement
  t.classList.remove('hovered-record')
}
const mouseClickAct = (e: Event, stats_entry: DataStore) => {
  let parentRows = statsmoduleref.value?.querySelectorAll('.row');
  let t = e.target as HTMLElement
  parentRows?.forEach((p) => {
    if (p.contains(t)) p.classList.add('clicked-record')
    else p.classList.remove('clicked-record')
  });
  app_store.set_active_icf('');
  emit('entry_clicked', stats_entry)
}

const _userdata = computed(() => user_store.getState().userdata)
const userFromUserID = (userid: string | undefined) => {
  if (userid === undefined) return {groups:[]}
  return _userdata.value.filter(user => user.id === userid)[0]
}

const getMergeFromOperator = (mergeOperation: string) => {
  let i = mergeOperations.map(o=>o.operation).indexOf(mergeOperation)
  if (i>-1) return mergeOperations[i]
}

</script>

<template>
  <div class="p-1" ref="statsmoduleref">
    <div v-if="mode==='short'">
      <div class="ms-3 text-center">
        <div class="fw-bold">{{ app_store.getPatientStatisticsFromAPI(patient_id).length }}</div>
        <div class="text-muted small">Einträge</div>
      </div>

    </div>

    <MDBRow v-else v-for="(stats_entry,idx) in app_store.getState().api_patient_records" class="mb-4 stats-record"
            @click="mouseClickAct($event, stats_entry)"
            @mouseover="mouseOverAct($event, stats_entry.id)"
            @mouseleave="mouseLeaveAct($event)"
            :class="(idx===0) ? 'clicked-record' : ''"
            :data-creator="stats_entry.creator"
    >
      <MDBCol>
        <p class="m-0">{{ moment(stats_entry.date).format(dateformat) }}</p>
        <p class="text-secondary m-0">{{ moment(stats_entry.date).format('HH:mm') }}

                    <img  v-if="stats_entry.merge"
                        :src="imageServer()+getMergeFromOperator(stats_entry.merge?.operation)?.icon"
                         style="height:20px;width:auto;"
                         class="filter-primary m-1"/>

        </p>
      </MDBCol>
      <MDBCol>
        <GroupImage :group="g" v-for="g in userFromUserID(stats_entry.creator)?.groups"/>
      </MDBCol>


      <MDBCol v-for="stats_item_key in modules"
      >
        <img
            :src="imageServer()+`module-types/${stats_item_key}.png`"
            :alt="stats_item_key"
            style="width: 45px; height: 45px"
            :class="`rounded-circle ` + ((app_store.statisticsCalculator(stats_item_key,stats_entry)===0) ? `opacity-20` : ``)"
        />
        <MDBBadge
            v-if="app_store.statisticsCalculator(stats_item_key,stats_entry)!=0"
            :badge="app_store.statisticsCalculator(stats_item_key,stats_entry) ? `danger` : `info`"
            class="translate-middle p-1"
            pill
            notification
        > {{ app_store.statisticsCalculator(stats_item_key, stats_entry) }}
        </MDBBadge>
      </MDBCol>
    </MDBRow>
  </div>
</template>

<style scoped>
.filter-primary {
  filter: invert(41%) sepia(20%) saturate(1538%) hue-rotate(178deg) brightness(105%) contrast(92%);
}

.hovered-record {
  border: #2c58a0 solid 2px;
  border-radius: 15px;
  transition: all ease-in-out;
}

.clicked-record {
  border: #009688 solid 3px;
  border-radius: 15px;
  transition: all ease-in-out;
}
</style>