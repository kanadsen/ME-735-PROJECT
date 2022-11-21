# ME-735-PROJECT
PROJECT FILE FOR ME 735 (COMPUTER GRAPHICS)
<h1 align="center">3D Pathfinding Algorithm Visualizer </h1>

<div align="center" >
  <img src="https://img.shields.io/badge/made%20by-Kanad%20Sen-blue?style=for-the-badge&labelColor=20232a" />
  <img src="https://img.shields.io/badge/Javascript-20232a?style=for-the-badge&logo=javascript&labelColor=2e2f38" />
  <img src="https://img.shields.io/badge/React JS-20232a?style=for-the-badge&logo=react&labelColor=2e2f38" />
</div>

## Features
### Weighted and unweighted algorithms
* **Dijkstra’s algorithm** (weighted) <br>
The father of pathfinding algorithms, it creates a tree of shortest paths from the starting vertex, the source, to all other points in the graph. As shown in the image below this algorithm does not care to avoid the area around the walls. <b>Guarantees</b> the shortest path!


* **A\* Search algorithm** (weighted) <br>
One of the best and a popular technique used in path-finding and graph traversals with heuristic. <b>Guarantees</b> the shortest path!

* **Breadth-First Search** (unweighted) <br>
The algorithm starts at the tree root, and explores all of the neighbor nodes at the present depth prior to moving on to the nodes at the next depth level. <b>Guarantees</b> the shortest path!

* **Depth-First Search** (unweighted) <br>
The algorithm starts at the root node and explores as far as possible along each branch before backtracking. <b>Does not guarantee</b> the shortest path!

### Maze generation
Method to generate a maze:
* Random Maze

### Libraries used
* Three.js
* react-three-fiber
* Tween.js

How to start the project:

1. run npm install 
2. Change directory to src and open in integrated terminal
3. run npm start
