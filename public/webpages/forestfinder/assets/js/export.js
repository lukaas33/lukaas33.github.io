
const addTree = function(point, tree) {
  const doc = document.querySelector("#detail-page")
  doc.appendChild(herbarium.progressCard(point))
}

const trees = herbarium.filter(database.locations, database.progress)

for (let tree of trees) {
  for (let point of database.progress) {
    if (tree.tree_id === point.tree) {
      addTree(point, tree)
    }
  }
}
