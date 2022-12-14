import React, { useState, useRef, useEffect, useMemo } from 'react'
import * as THREE from 'three'
import img from './floor_texture.jpg';
import { tweenToColor, getNodesInShortestPathOrder } from './algorithms/helpers'
import TWEEN from '@tweenjs/tween.js';
import { weightedSearchAlgorithm } from "./algorithms/weightedSearchAlgorithm.js";
import { unweightedSearchAlgorithm } from "./algorithms/unweightedSearchAlgorithm.js";
import { randomMaze} from './algorithms/mazeAlgorithms';
import { useThree } from 'react-three-fiber';




function Grid(props) {

  let groundMaterial;
  let groundMesh;
  let mouseDownX = 0;
  let mouseDownY = 0;
  let previousHoverNodeId;
  let currentHoverNodeId;

  let mouseIsUp = true;
  
  const [groundGeometry, setGroundGeometry] = useState(new THREE.PlaneGeometry(300,300,30,30));
  
  const selectedAlgorithm = props.selectedAlgorithm;
  const selectedMazeAlgorithm = props.selectedMazeAlgorithm;
  const runState = props.worldProperties.runState;
  const clearTheWalls = props.worldProperties.clearWalls; //rename this variable
  const clearThePath = props.worldProperties.clearPath; // rename this variable too
  const algorithmSpeed = props.algorithmSpeed;

  
  const {
    camera,
  } = useThree();

  useEffect(() => {
    if(props.applyingSettings)
    {
      resetTerrainConfig();
    }}
    );



  useEffect(() => {
    if(props.agentKnowledge ==="clearMemory")
    {
      terrain.records = [];
      terrain.q_table = Array(props.worldProperties.rows).fill().map(() => Array(props.worldProperties.cols).fill(0));
      //clearPath();
      props.agentResetDone();
    }
    if(props.worldProperties.runState === true)
    {
      
      visualizeAlgorithm(); // Calls animation
      
    }
    else if(props.worldProperties.clearWalls === true){
      clearWalls(); // calls clear wall function
    }
    else if(props.worldProperties.clearPath === true){
      clearPath(); //  call clearpath function
    }
    else if(props.selectedMazeAlgorithm === "randomMaze"){
      clearPath();
      let nodesToAnimate = [];
      randomMaze(terrain.grid, nodesToAnimate, "wall");
      animateMaze(nodesToAnimate, "wall", 30);
    }
  }, [runState, clearTheWalls, clearThePath, selectedMazeAlgorithm,]);

  // information about mesh geometry
  const loader = useMemo(() => new THREE.TextureLoader().load(img,
    function(texture){
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.x = 30;
        texture.repeat.y = 30;
        
        groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
				groundMesh.receiveShadow = true;
    }), [img]);

    
    
    groundMaterial = new THREE.MeshLambertMaterial({
      map: loader,
      side: THREE.FrontSide,
      vertexColors: THREE.FaceColors,
    });

    const mesh = useRef(null);
    
    
    const [terrain, setTerrain] = useState({
      grid: initializeGrid(),
      states: initStates(),
      q_table: Array(props.worldProperties.rows).fill().map(() => Array(props.worldProperties.cols).fill(0)),
      records: [],
      optimalPolicy: [],
      actions : { "left":[0,-1], "down":[1,0],"right":[0,1], "up":[-1,0]},
      //visits: Array(props.worldProperties.rows).fill().map(() => Array(props.worldProperties.cols).fill(0)),
      discountFactor: 0.8,
      alpha: 0.1,
      start: [props.settingsConfig.startRow,props.settingsConfig.startCol],
      finish: [props.settingsConfig.finishRow,props.settingsConfig.finishCol]
    });

  function initializeGrid()
  {
    let tempGrid = []
    for(let i = 0; i < 30; i++)
    {
        let currentRow = [];
        for(let j = 0; j < 30; j++){
            let node = createNode(i, j);  // Creating grid by creating node object
            currentRow.push(node);
        }
        tempGrid.push(currentRow);
    }
   renderLoop();
   return tempGrid;
  }   

  function createNode(row, col)
  {

    let status = "default";
    let faces = {};

    let faceIndex = row * 2 * props.worldProperties.cols + col * 2 ;
  
    faces[1] = groundGeometry.faces[faceIndex];


    faceIndex = faceIndex % 2 === 0 ? faceIndex + 1 : faceIndex - 1;
    faces[2] = groundGeometry.faces[faceIndex];

    if(row === props.worldProperties.start.row && col === props.worldProperties.start.col){
      status = "start";
    }
    else if(row === props.worldProperties.finish.row && col === props.worldProperties.finish.col){
      status = "finish";
    }
    // node object creation
    let node = {
        id: row * props.worldProperties.cols + col,
        row: row,
        col: col,
        faces: faces,
        status: status,
        distance: Infinity,
        totalDistance: Infinity,
        heuristicDistance: null,
        direction: null,
        weight: 0,
        visits: 0,
        onceSpecial: false,
        previousNode: null,
    };
    if(status === "start")
    {
      node.onceSpecial = true;
      tweenToColor(node, groundGeometry, [props.worldProperties.colors.start]);
      
    }
    else if(status === "finish")
    {
      node.reward = 100;
      node.onceSpecial = true;
      tweenToColor(node, groundGeometry, [props.worldProperties.colors.finish]);
    }
    return node;
  }
  function initStates()
  {
    let tempStateGrid = [];
    for(let row = 0; row < props.worldProperties.rows; row++){
      for(let col = 0; col < props.worldProperties.cols;col++){
        tempStateGrid.push([row,col]);
      }
    }
    return tempStateGrid;
  }
  
  function renderLoop(){
    window.requestAnimationFrame(renderLoop);

      hoverLoop();
  
    TWEEN.update(); // update animation
  }

  function hoverLoop()
  {
    if(mouseIsUp || currentHoverNodeId === previousHoverNodeId){
      return;
    }
    else
    {
      previousHoverNodeId = currentHoverNodeId;
      let nodeRow = Math.floor(currentHoverNodeId / props.worldProperties.rows);
      let nodeCol = currentHoverNodeId % props.worldProperties.cols
      if((nodeRow === props.worldProperties.start.row && nodeCol === props.worldProperties.start.col) 
        || (nodeRow === props.worldProperties.finish.row && nodeCol === props.worldProperties.finish.col))
        {
        return;
      }
      else if(terrain.grid[nodeRow][nodeCol].status === "wall")
      {
        terrain.grid[nodeRow][nodeCol].status = "default";
        terrain.grid[nodeRow][nodeCol].visits = 0;
        tweenToColor(terrain.grid[nodeRow][nodeCol], groundGeometry, [props.worldProperties.colors.default]);
      }
      else
      {
        terrain.grid[nodeRow][nodeCol].status = "wall";
        terrain.grid[nodeRow][nodeCol].visits = -1;
       terrain.grid[nodeRow][nodeCol].reward = -100;
        tweenToColor(terrain.grid[nodeRow][nodeCol], groundGeometry, [props.worldProperties.colors.wall]);
      }
    
    }
    //get coordinates of node i just clicked on
    
  }

  function mouseUpHandler(event)
  {
    if((mouseDownX !== event.clientX) || (mouseDownY !== event.clientY)){
      return;
    }
    else
    {
      let nodeId = findNodeId(event.faceIndex);
      if((nodeId.nodeRow === props.worldProperties.start.row && nodeId.nodeCol === props.worldProperties.start.col) 
        || (nodeId.nodeRow === props.worldProperties.finish.row && nodeId.nodeCol === props.worldProperties.finish.col)){
      return;
      }
      else if(terrain.grid[nodeId.nodeRow][nodeId.nodeCol].status === "wall")
      {
        terrain.grid[nodeId.nodeRow][nodeId.nodeCol].status = "default";
        tweenToColor(terrain.grid[nodeId.nodeRow][nodeId.nodeCol], groundGeometry, [props.worldProperties.colors.default]);
      }
      else
      {
        terrain.grid[nodeId.nodeRow][nodeId.nodeCol].status = "wall";
        tweenToColor(terrain.grid[nodeId.nodeRow][nodeId.nodeCol], groundGeometry, [props.worldProperties.colors.wall]);
      }
    }

  }
    
  
  function findNodeId(faceIndex)
  {
    let linearIndex = Math.floor(faceIndex / 2);
    return {
      nodeRow: Math.floor(linearIndex / props.worldProperties.rows),
      nodeCol: linearIndex % props.worldProperties.cols,
    }
  }
  function mouseDownHandler(event){
      mouseDownX = event.clientX;     //set X and Y mouse coordinates when mouseDown
      mouseDownY = event.clientY;
  }
  
  function visualizeAlgorithm()
  {
    console.log("Dijkstra Dijkstra Dijkstra");
    clearPath();
    let nodesToAnimate = []; // array to store nodes to animate
    let processedSuccessfuly;
    const startNode = terrain.grid[props.worldProperties.start.row][props.worldProperties.start.col];
    const finishNode = terrain.grid[props.worldProperties.finish.row][props.worldProperties.finish.col];
    if(selectedAlgorithm.type === "weighted")
    {
      processedSuccessfuly = weightedSearchAlgorithm(
        terrain.grid,
        startNode,
        finishNode,
        nodesToAnimate,
        selectedAlgorithm.algorithm,
        selectedAlgorithm.heuristic,
      );
      console.log(processedSuccessfuly);
    }
    else{
      processedSuccessfuly = unweightedSearchAlgorithm
      (
        terrain.grid,
        startNode,
        finishNode,
        nodesToAnimate,
        selectedAlgorithm.algorithm,
      );
    }
    const nodesInShortestPathOrder = getNodesInShortestPathOrder(finishNode);
    //add conditions for unweighted and no paths found
    console.log(algorithmSpeed + " is the speed were using")
    animateAlgorithm(nodesToAnimate, nodesInShortestPathOrder, algorithmSpeed);  
  }
  // function to be called to animate algorithm
  function animateAlgorithm(visitedNodesInOrder, nodesInShortestPathOrder, timerDelay)
  {
    window.alert("Paths traversed :"+visitedNodesInOrder.length+"   Shortest path :"+nodesInShortestPathOrder.length ) // show number of nodes visited
    for (let i = 0; i <= visitedNodesInOrder.length; i++) 
    {
				if (i === visitedNodesInOrder.length) 
        {   // animate shortest path
					setTimeout(() => {
						animateShortestPath(nodesInShortestPathOrder, 5 * timerDelay);
					}, timerDelay * i);
					return;
				}
				if ((visitedNodesInOrder[i].row === props.worldProperties.start.row &&
            visitedNodesInOrder[i].col === props.worldProperties.start.col) ||
					(visitedNodesInOrder[i].row === props.worldProperties.finish.row &&
						visitedNodesInOrder[i].col === props.worldProperties.finish.col)
				) {
					continue;
				}
				setTimeout(() => {
					const node = visitedNodesInOrder[i];
					if (!node) return;
          // providing node object to tweentocolor for animation
					tweenToColor(
						node,
						groundGeometry,
						[{ r: 0.5, g: 0.1, b:1 }, { r: 0.3 ,g:0, b: 0.8}],
						300,
						{ position: false }
					);
				}, timerDelay * i);
      }
      
  }
  // animate shortest path function
  function animateShortestPath(nodesInShortestPathOrder, timerDelay)
  {
    for (let i = 0; i < nodesInShortestPathOrder.length; i++) {
      setTimeout(() => {
        const node = nodesInShortestPathOrder[i];
        tweenToColor(node, groundGeometry, [props.worldProperties.colors.path], undefined, {
          position: false,
        });
        if (i === nodesInShortestPathOrder.length - 1) 
        {
                }
      }, timerDelay * i);
    }
    props.updateRunState(false);
  }

  // terrain control function
  function resetTerrainConfig()
  {
    for(let row = 0; row < 30; row++){
      for(let col = 0; col < 30; col++)
      {
        if(terrain.grid[row][col].status === "wall"){
          continue;
        }
        if(row === props.settingsConfig.startRow && col  === props.settingsConfig.startCol){
          terrain.grid[row][col].status = "start";
          terrain.grid[row][col].onceSpecial = true;
        }
        else if(row === props.settingsConfig.finishRow && col === props.settingsConfig.finishCol){
          terrain.grid[row][col].status = "finish";
          terrain.grid[row][col].onceSpecial = true;

        }
        else{
          terrain.grid[row][col].status = "default";
          if(terrain.grid[row][col].onceSpecial){
          tweenToColor(terrain.grid[row][col], groundGeometry, [props.worldProperties.colors.default]);
          }

        }
      }
    }
    props.finishApplyingSettings();
  }

  function clearWalls()
  {
    for(let i = 0; i < props.worldProperties.rows; i++){
      for(let j = 0; j < props.worldProperties.cols; j++){
        if(terrain.grid[i][j].status === "wall" || terrain.q_table[i][j] < 0){
          terrain.grid[i][j].status = "default";
          terrain.grid[i][j].reward = 0;
          tweenToColor(terrain.grid[i][j], groundGeometry, [props.worldProperties.colors.default])
        }
      }
    }
    props.stopClearWalls();
  }
  function clearPath(){
    TWEEN.removeAll();
    for(let i = 0; i < props.worldProperties.rows; i++){
      for(let j = 0; j < props.worldProperties.cols; j++){
        if(i === props.worldProperties.start.row && j === props.worldProperties.start.col){
          terrain.grid[i][j].status = "start";
          terrain.grid[i][j].visits = -1; 
        }
        if(i === props.worldProperties.finish.row && j === props.worldProperties.finish.col){
          terrain.grid[i][j].status = "finish"; 
        }
        
        if(terrain.grid[i][j].status === "visited" || terrain.grid[i][j].visits > 0 ){
          terrain.grid[i][j].status = "default";
          tweenToColor(terrain.grid[i][j], groundGeometry, [props.worldProperties.colors.default]);
        }
        terrain.grid[i][j].distance = Infinity;
        terrain.grid[i][j].totalDistance = Infinity;
        terrain.grid[i][j].heuristicDistance = null;
        terrain.grid[i][j].direction = null;
        terrain.grid[i][j].previousNode = null;
      }
    }
    props.stopClearPath();
  }
  function animateMaze(nodesToAnimate, type, timerDelay){
    clearWalls();
    for(let i = 0; i < nodesToAnimate.length; i++){
      let nodeRow = nodesToAnimate[i].row;
      let nodeCol = nodesToAnimate[i].col
      setTimeout(() => {
        //const node = nodesToAnimate[i];
       // node.status = type;
       terrain.grid[nodeRow][nodeCol].status = "wall";
       terrain.grid[nodeRow][nodeCol].reward = -100;
       terrain.grid[nodeRow][nodeCol].visits = -1;
      tweenToColor(terrain.grid[nodeRow][nodeCol], groundGeometry, [props.worldProperties.colors.wall]);
      }, timerDelay * i);
      props.stopMazeSelection();
    }
  }
 
  return (
    <mesh ref = {mesh} position = {[0,0,0]}>
      <gridHelper args = {[300, props.gridDimensions, 0x5c78bd, 0x5c78bd] }/>
      <mesh rotation={[-Math.PI /2, 0, 0]} 
        position={[0,-0.1,0]} 
        receiveShadow = {true}
        onPointerDown={ (e) => {
          mouseIsUp = false;
          mouseDownHandler(e)
        }}
      onPointerUp = {e => {
        if(props.resetStatus === true || mouseIsUp === true){
          mouseIsUp = true;
        }
        mouseUpHandler(e)
      }}
      onPointerMove = {e => {
        if(mouseIsUp === true || props.resetStatus === false){
          return;
        }
        else if(mouseIsUp === false){
          currentHoverNodeId = Math.floor(e.faceIndex/2);
          return;
        }
      }}
      >
      <primitive attach = 'geometry' object = {groundGeometry}  />  
      <primitive attach = 'material' object = {groundMaterial}  />   
      </mesh>
      <axesHelper />
    </mesh>
    )
}


export default Grid
