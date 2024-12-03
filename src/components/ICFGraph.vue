<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart,
    MDBDatatable
} from 'mdb-vue-ui-kit'
  import { VNetworkGraph } from "v-network-graph"
  import "v-network-graph/lib/style.css"
  import {ref, reactive, computed} from "vue"
import * as vNG from "v-network-graph"
import { Nodes, Edges, Layouts } from "v-network-graph"

// dagre: Directed graph layout for JavaScript
// https://github.com/dagrejs/dagre

import dagre from "@dagrejs/dagre"
const props = defineProps(['domains'])

  const _domains: Record<string,Record<string,Array<string>>> = props.domains

const showOnlySiblings = ref(true)

const nodesFromDomainTree = computed(()=> {
    let target:Nodes = {}
    if (_domains) {
      Object.entries(_domains).forEach(([userid, domain_items]) => {
        let domain_array = Object.entries(domain_items)
        target[userid] = {name: 'U'+userid.slice(0,2)}
        domain_array.forEach(domain_a => {
          target[userid + '_' + domain_a[0]] = {name: domain_a[0]}
          let icf_array = domain_a[1]
          icf_array.forEach(icf => {
            if (showOnlySiblings.value) {
              if (Object.keys(siblingsFromDomainTree.value).includes(icf)) target[userid + '_' + icf] = {name: icf}
            } else
            target[userid + '_' + icf] = {name: icf}
          })
        })
      })
    }
      return target
})

const edgesFromDomainTree = computed(()=> {
  let target:Edges = {}
   if (_domains) {
     Object.entries(_domains).forEach(([userid, domain_items]) => {
          let domain_array = Object.entries(domain_items)
       domain_array.forEach(domain_a => {
          target[userid + '_' + domain_a[0]] = {source: userid, target: userid+'_' + domain_a[0]}
          let icf_array = domain_a[1]
          icf_array.forEach(icf => {
            if (Object.keys(siblingsFromDomainTree.value).includes(icf)) {
              let siblingusers = siblingsFromDomainTree.value[icf]
              siblingusers.forEach(siblinguser => {
                target[userid+'_'+siblinguser+'_'+icf] = {source:userid+'_'+domain_a[0],target:siblinguser+'_'+icf}
              })
            } else {
              if (!showOnlySiblings.value) target[userid + '_' + icf] = {source:userid+'_' + domain_a[0], target:userid+'_' + icf}
            }
          })
        })
     })
   }
   return target
})

const siblingsFromDomainTree = computed(()=> {
   let target:Record<string,Array<string>> = {}
   if (_domains) {
     Object.entries(_domains).forEach(([userid, domain_items]) => {
          let domain_array = Object.entries(domain_items)
       domain_array.forEach(domain_a => {
          let icf_array = domain_a[1]
          icf_array.forEach(icf => {
            if (Object.keys(target).includes(icf)) target[icf].push(userid)
            else target[icf]=[userid]
          })
        })
     })
   }
   let o = Object.fromEntries(Object.entries(target).filter(e=>e[1].length>1))
   return o
})



const layouts: Layouts = reactive({
  nodes: {},
})

const nodeSize = 40

const configs = vNG.defineConfigs({
  view: {
    autoPanAndZoomOnLoad: "fit-content",
    onBeforeInitialDisplay: () => layout("TB"),
  },
  node: {
    normal: { radius: nodeSize / 2 },
    label: { direction: "center", color: "#fff" },
  },
  edge: {
    normal: {
      color: "#aaa",
      width: 3,
    },
    margin: 4,
  },
})

const graph = ref<vNG.VNetworkGraphInstance>()

function layout(direction: "TB" | "LR") {
  if (Object.keys(nodesFromDomainTree.value).length <= 1 || Object.keys(edgesFromDomainTree.value).length == 0) {
    return
  }

  // convert graph
  // ref: https://github.com/dagrejs/dagre/wiki
  const g = new dagre.graphlib.Graph()
  // Set an object for the graph label
  g.setGraph({
    rankdir: direction,
    nodesep: nodeSize * 4,
    edgesep: nodeSize,
    ranksep: nodeSize * 20,
  })
  // Default to assigning a new object as a label for each new edge.
  g.setDefaultEdgeLabel(() => ({}))

  // Add nodes to the graph. The first argument is the node id. The second is
  // metadata about the node. In this case we're going to add labels to each of
  // our nodes.
  Object.entries(nodesFromDomainTree.value).forEach(([nodeId, node]) => {
    g.setNode(nodeId, { label: node.name, width: nodeSize, height: nodeSize })
  })

  // Add edges to the graph.
  Object.values(edgesFromDomainTree.value).forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  g.nodes().forEach((nodeId: string) => {
    // update node position
    const x = g.node(nodeId).x
    const y = g.node(nodeId).y
    layouts.nodes[nodeId] = { x, y }
  })
}

function updateLayout(direction: "TB" | "LR") {
  // Animates the movement of an element.
  graph.value?.transitionWhile(() => {
    layout(direction)
  })
}
</script>

<template>
  <MDBRow class="align-items-center m-2 p-3 d-flex justify-content-end">
    <MDBCol>
       <MDBBtn color='tertiary' @click="updateLayout('TB')">Update</MDBBtn>
    </MDBCol>
    <MDBCol>
      <MDBSwitch label="Nur gemeinsame Objecte anzeigen" v-model="showOnlySiblings"/>
    </MDBCol>
  </MDBRow>


  <VNetworkGraph
    ref="graph"
    class="graph"
    :nodes="nodesFromDomainTree"
    :edges="edgesFromDomainTree"
    :layouts="layouts"
    :configs="configs"
  />

</template>

<style scoped>
.graph {
  width: 1000px;
  height: 600px;
  border: 1px solid #000;
  border-radius: 5px;
}
</style>