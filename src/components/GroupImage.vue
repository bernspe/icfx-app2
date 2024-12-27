<script setup lang="ts">

import {imageServer} from "../process_vars";
import {MDBBadge
} from 'mdb-vue-ui-kit';
import {roles} from "../constants";

const props = defineProps({
  group: {required: true, type: String}
})

const translateGroup = (group: string) => {
  let idx = roles.map(r=>r.group).indexOf(group);
  return roles[idx].name
}
</script>

<template>
        <div>
          <img
              :src="imageServer()+`group-pics/${group}.jpg`"
              alt="patient image"
              style="width: 45px; height: 45px"
              class="rounded-circle"
          />
          <MDBBadge
              class="translate-middle p-1"
              badge="info"
              pill
              notification
          >{{ translateGroup(group)}}
          </MDBBadge>
        </div>
</template>

<style scoped>

</style>