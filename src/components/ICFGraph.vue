<script setup lang="ts">
import {
  MDBListGroup, MDBListGroupItem, MDBChip, MDBRow, MDBCol, MDBBtn, MDBBtnGroup,
  MDBCard, MDBCardHeader, MDBCardBody, MDBCardFooter, MDBTransition, MDBSwitch, MDBCheckbox, MDBIcon, MDBChart,
  MDBDatatable
} from 'mdb-vue-ui-kit'
import {VNetworkGraph} from "v-network-graph"
import "v-network-graph/lib/style.css"
import {ref, reactive, computed} from "vue"
import * as vNG from "v-network-graph"
import {Nodes, Edges, Layouts} from "v-network-graph"

// dagre: Directed graph layout for JavaScript
// https://github.com/dagrejs/dagre

import dagre from "@dagrejs/dagre"

const props = defineProps(['nodes'])
const emit = defineEmits(['nodeClicked'])

const _nodes: Array<string> = props.nodes

const nodesFromNodeObject = computed(()=> {
  let target: Nodes = {}
  if (_nodes) {
    _nodes.forEach(node => {
      let n = node.split('.')
      if (n.length===1) target[node] = {name: 'US'+n[0].slice(0,2)} // this is a user item
      else {
        target[node] = {name: n[n.length - 1]}
      }
    })
  }
  return target
})

const edgesFromNodeObject = computed(()=> {
  let target: Edges = {}
  if (_nodes) {
    _nodes.forEach(node => {
      let n = node.split('.')
      if (n.length===3) {
        let creators = n[0].split('_')
        creators.forEach(creator => {
          target[creator + '.' + n[1] + '.' + n[2]] = {source: creator + '.' + n[1], target: node}
        })
      } if (n.length===2) {
        target[node] = {source: n[0], target: node}
      }
    })
  }
  return target
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
    normal: {radius: nodeSize / 2},
    label: {direction: "center", color: "#fff"},
    selectable: true,
    focusring: {
      color: "darkgray",
    },
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

const eventHandlers: vNG.EventHandlers = {
  "node:click": ({ node }) => {
    emit("nodeClicked",node.split('.')[2])
  },
}

function layout(direction: "TB" | "LR") {
  if (Object.keys(nodesFromNodeObject.value).length <= 1 || Object.keys(edgesFromNodeObject.value).length == 0) {
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
  Object.entries(nodesFromNodeObject.value).forEach(([nodeId, node]) => {
    g.setNode(nodeId, {label: node.name, width: nodeSize, height: nodeSize})
  })

  // Add edges to the graph.
  Object.values(edgesFromNodeObject.value).forEach(edge => {
    g.setEdge(edge.source, edge.target)
  })

  dagre.layout(g)

  g.nodes().forEach((nodeId: string) => {
    // update node position
    try {
      const x = g.node(nodeId).x
      const y = g.node(nodeId).y
      layouts.nodes[nodeId] = {x, y}
    } catch {
      console.error("Unable to layout node " + nodeId)
    }
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



  <VNetworkGraph
      ref="graph"
      class="graph"
      :nodes="nodesFromNodeObject"
      :edges="edgesFromNodeObject"
      :layouts="layouts"
      :configs="configs"
      :event-handlers="eventHandlers"
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