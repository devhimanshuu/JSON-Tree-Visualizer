
let idCounter = 1
const nextId = () => `${Date.now()}-${idCounter++}`

const NODE_WIDTH = 160
const NODE_HEIGHT = 50
const H_GAP = 40
const V_GAP = 80

function createNode(type, label, path, x=0, y=0, meta={}){
  return {
    id: nextId(),
    type: 'default',
    data: { label, path, meta },
    position: { x, y },
    style: {
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      borderRadius: 8
    }
  }
}

function buildTree(value, keyName='$', path='$'){
  const rootNode = createNode(getType(value), keyName, path)
  const nodes = [rootNode]
  const edges = []

  function rec(value, parentNode, pth){
    const t = getType(value)
    if(t === 'object'){
      const children = Object.keys(value)
      if(children.length === 0){
        const n = createNode('primitive', '{}', `${pth}`)
        nodes.push(n)
        edges.push({ id: `${parentNode.id}-${n.id}`, source: parentNode.id, target: n.id, animated: false })
        return [n]
      }
      const created = []
      for(const k of children){
        const childPath = `${pth}.${k}`
        const childNode = createNode(getType(value[k]), k, childPath)
        nodes.push(childNode)
        edges.push({ id: `${parentNode.id}-${childNode.id}`, source: parentNode.id, target: childNode.id })
        created.push({ node: childNode, value: value[k], path: childPath })
      }
      for(const c of created){
        rec(c.value, c.node, c.path)
      }
    } else if(t === 'array'){
      if(value.length === 0){
        const n = createNode('primitive', '[]', pth)
        nodes.push(n)
        edges.push({ id: `${parentNode.id}-${n.id}`, source: parentNode.id, target: n.id })
        return [n]
      }
      const created = []
      for(let i=0;i<value.length;i++){
        const childPath = `${pth}[${i}]`
        const childNode = createNode(getType(value[i]), `[${i}]`, childPath)
        nodes.push(childNode)
        edges.push({ id: `${parentNode.id}-${childNode.id}`, source: parentNode.id, target: childNode.id })
        created.push({ node: childNode, value: value[i], path: childPath })
      }
      for(const c of created){
        rec(c.value, c.node, c.path)
      }
    } else {
      // primitive
      const prim = createNode('primitive', `${parentNode.data.label}: ${String(value)}`, pth)
      nodes.push(prim)
      edges.push({ id: `${parentNode.id}-${prim.id}`, source: parentNode.id, target: prim.id })
    }
  }

  // start recursion from root
  rec(value, rootNode, path)

  // compute positions with simple top-down layout
  layout(nodes, edges)

  return { nodes, edges }
}

function getType(x){
  if(x === null) return 'primitive'
  if(Array.isArray(x)) return 'array'
  if(typeof x === 'object') return 'object'
  return 'primitive'
}

function layout(nodes, edges){
  // Build adjacency mapping
  const childrenMap = {}
  for(const e of edges){
    if(!childrenMap[e.source]) childrenMap[e.source] = []
    childrenMap[e.source].push(e.target)
  }

  // find root = node that is not target of any edge
  const targets = new Set(edges.map(e=>e.target))
  const root = nodes.find(n=>!targets.has(n.id))
  if(!root) return

  // compute subtree widths
  function measure(node){
    const kids = childrenMap[node.id] || []
    if(kids.length === 0) { node._subWidth = NODE_WIDTH; return node._subWidth }
    let w = 0
    for(const kidId of kids){
      const kid = nodes.find(n=>n.id===kidId)
      w += measure(kid) + H_GAP
    }
    w = Math.max(w - H_GAP, NODE_WIDTH)
    node._subWidth = w
    return w
  }

  function place(node, x0, y){
    node.position.x = x0 + (node._subWidth - NODE_WIDTH)/2
    node.position.y = y
    const kids = childrenMap[node.id] || []
    let curX = x0
    for(const kidId of kids){
      const kid = nodes.find(n=>n.id===kidId)
      place(kid, curX, y + NODE_HEIGHT + V_GAP)
      curX += kid._subWidth + H_GAP
    }
  }

  measure(root)
  place(root, 0, 0)
}

export { buildTree }