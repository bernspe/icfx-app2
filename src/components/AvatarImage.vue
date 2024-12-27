<script setup lang="ts">

import {computed, ref} from "vue";
import {imageServer} from "../process_vars";
import {language} from "../constants";
import __avtrans from '../assets/avatar_transcriptions.json'
import {translate_pseudonym} from "../language_helper";
import {MDBBadge} from "mdb-vue-ui-kit";
const _avtrans: Record<string,Record<string,string>> = __avtrans;

const props = defineProps({
  pseudonym: {type: String, required: true},
  size: {type: String, default: '100px'},
  color: {type: String, default: ''},
  label_position: {type: String, default: 'bottom'}
})

const img_suffix='.png'
const adjective_img = computed(()=> props.pseudonym?.split(' ')[0])
const noun_img = computed(()=> props.pseudonym?.split(' ')[1])

const transcribed_pseudonym = computed(()=> {
  if (props.pseudonym) return translate_pseudonym(props.pseudonym)
  else return ''
})

</script>

<template>
  <div class="d-flex align-items-center">

    <div class='imgcontainer m-2' v-if="props.pseudonym">
      <div class="mask" v-if="label_position==='ontop'"> <p class="small">{{ transcribed_pseudonym }}</p></div>
    <img :src="imageServer()+'avatars/animals/'+noun_img+img_suffix" class='mainpic' />

    <img :src="imageServer()+'avatars/adjectives/'+adjective_img+img_suffix" class='secondarypic'/>
      <MDBBadge
           v-if="label_position==='badge'"
           class="translate-middle p-1"
              badge="info"
              pill
              notification
          >{{ transcribed_pseudonym }}
          </MDBBadge>
      <p class="small" v-if="label_position==='bottom'">{{ transcribed_pseudonym }}</p>
    </div>
    <h2 v-if="label_position==='right'">{{ transcribed_pseudonym }}</h2>
    </div>
</template>

<style scoped>
.imgcontainer {
  position: relative;
}

.imgcontainer p {
  max-width: 10ch;
}
.mainpic {
  border-radius: 50%;
  padding: 2px;
  border: solid v-bind('props.color');
  width: v-bind('props.size');
}

.mainpic:hover {
  border-color: green;
  border-width: 3px;
  width: 110px;
}

.secondarypic {
  background-color: white;
  border-radius: 50%;
  position: absolute;
  top: 0%;
  left: 0%;
  width: 38%;
  padding: 1px;
}
</style>