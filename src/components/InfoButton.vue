<script setup lang="ts">
import {
  MDBBtn, MDBPopover, MDBIcon
} from 'mdb-vue-ui-kit';
import {imageServer} from "../process_vars";
import {ref} from "vue";

const props = defineProps({component_name: {type: String, required: true}})
const popovershow = ref(false)

const contentdict = {
  BluntHome: {header: 'Wähle Deine Rolle', bodytext: 'Wer möchtest Du sein? Medizinischer Profi oder Patientin?', bodyvideo: imageServer()+'videos/icfx-video1.mp4'},
  MedProfList: {header: 'Behandler auswählen', bodytext: '1. Such dir einen Behandler aus. 2. Such dir einen Patienten aus. In der Liste kannst du sehen, wie viele Einträge es zu diesem Patienten schon gibt.', bodyvideo: imageServer()+'videos/icfx-video-medlist.mp4'},
  MedProfMain: {header: 'Deine Aufgaben', bodytext: '1. Coreset wählen 2. ICFs bearbeiten', bodyvideo: imageServer()+'videos/icfx-video-medmain.mp4'},
  PatientMain: {header: 'Deine Aufgaben', bodytext: 'Spiele eine Playlist nach der anderen ab!', bodyvideo: imageServer()+'videos/icfx-video-patientmain.mp4'},
  PatientList: {header: 'Patienten suchen', bodytext: 'Such dir einen Patienten aus. In der Liste kannst du sehen, wie viele Einträge es zu diesem Patienten schon gibt.', bodyvideo: imageServer()+'videos/icfx-video-patientlist.mp4'},
  ICFItem: {header: 'Deine Beeinträchtigung', bodytext: 'Gib an, wie stark du Probleme hast. Wenn du dieses Problem nicht hast, kannst du es auch ganz abwählen.', bodyvideo: imageServer()+'videos/icfx-video-icfitem.mp4'}
}
</script>

<template>
 <MDBPopover v-model="popovershow"
            dismissible
            direction="bottom"
             boundary="scrollParent"
             :max-width="380"
             arrow
            >
              <template #reference>
                <MDBBtn :color="popovershow ? 'primary' : 'secondary'" floating @click="popovershow = !popovershow"><MDBIcon icon="question"></MDBIcon></MDBBtn>
                 </template>
              <template #header>
                {{ contentdict[component_name].header }}
              </template>

              <template #body>
                {{ contentdict[component_name].bodytext }}
                <video width="320" height="200" autoplay muted loop>
                  <source :src="contentdict[component_name].bodyvideo" type="video/mp4">
                  Your browser does not support the video tag.
                </video>
              </template>
            </MDBPopover>
</template>

<style>
.popover {
  --mdb-popover-body-color: #fff;
  --mdb-popover-header-font-size: 1.5rem;
  --mdb-popover-header-bg: #4578ca;
  --mdb-popover-header-color: #fff;
  background-color: #4578ca;
}
.popover[data-popper-placement^=bottom] .popover_arrow{
 border-left: 10px solid transparent;
            border-right: 10px solid transparent;
            border-bottom: 10px solid blue;
}

.dump {

   border-color: rgba(0,0,0,0) rgba(0,0,0,0) #4578ca rgba(0,0,0,0);
}
</style>