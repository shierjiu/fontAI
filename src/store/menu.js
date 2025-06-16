const state={
    isCollapse:false,
    selectMenu:[],
    currentNodeId: null,
    currentFileId: null,
    currentDatasetId: null
}

const mutations={
    collapseMenu(state){
        state.isCollapse=!state.isCollapse
    },
    addMenu(state,payload){
        if(state.selectMenu.findIndex(item=>item.path===payload.path)===-1){
            state.selectMenu.push(payload)
            console.log('当前路由',state.selectMenu)
        }
    },
    closeMenu(state, payload){
        const index=state.selectMenu.findIndex(val=>val.title===payload.title)
        console.log('关闭菜单',payload.title,index)
        state.selectMenu.splice(index,1)
    },
      setCurrentParams(state, { nodeId, fileId, datasetId }) {
    state.currentNodeId    = nodeId
    state.currentFileId    = fileId
    state.currentDatasetId = datasetId
  }
}

export default{
    state,
    mutations
}