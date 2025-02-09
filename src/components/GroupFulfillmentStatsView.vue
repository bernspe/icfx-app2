<script setup lang="ts">
import {
  MDBRow, MDBCol,
  MDBContainer, MDBBadge, MDBTooltip
} from 'mdb-vue-ui-kit'
import {roles} from "../constants";
import {imageServer} from "../process_vars";
import {computed, inject, ref} from "vue";
import {app_store} from "../app_store";

const props = defineProps({
  ownerid: {type: String, required: true}
})

const default_vals = {[props.ownerid]:Object.fromEntries(roles.map(r=>([r.group,0])))}

const tooltip1 = ref(Object.fromEntries(roles.map(r=>([r.group,false]))))

const data = computed(()=> {
  const group_stats_data = app_store.getState().fulfillmentStatistics
  if (Object.keys(group_stats_data).includes(props.ownerid)) return group_stats_data[props.ownerid];
  else return default_vals[props.ownerid];
})
</script>

<template>
<MDBContainer>
  <MDBRow>
    <MDBCol class="d-flex justify-content-center g-0" v-for="role in roles">
      <MDBTooltip v-model="tooltip1[role.group]">
      <template #reference>
        <div>
           <img :src="imageServer()+`group-pics/${role.icon}`"
           :alt="role.name"
           :class="data[role.group]===0 ? 'rounded-circle inactive-pic' :'rounded-circle active-pic'">
      <MDBBadge v-if="data[role.group]>1"
                pill notification color="success"
                class="translate-middle p-1"
      >{{ data[role.group] }}  </MDBBadge>
        </div>

      </template>
      <template #tip>
        {{ role.name }}: {{ data[role.group] }} ICF Item{{data[role.group]!=1 ? 's' : ''}}
      </template>
    </MDBTooltip>


    </MDBCol>
  </MDBRow>
</MDBContainer>
</template>

<style scoped>
img {
  max-width: 50px;
  height: auto;
}
.inactive-pic {
  opacity: 0.2;
}
.active-pic {
  opacity: 1.0;
}
</style>