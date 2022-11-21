export function randomMaze(grid, nodesToAnimate, type) {
	for(let i=0; i<grid.length; i++) {
		for(let j=0; j<grid[0].length; j++) {
			let random = Math.random();
			let currentNode = grid[i][j];
			let reservedStatus = ["start", "finish"];
			let randomTwo = type === "wall" ? 0.25 : 0.35;
			if (random < randomTwo && !reservedStatus.includes(currentNode.status)) {
				nodesToAnimate.push(currentNode);
				if (type === "wall") {
					// currentNode.status = "wall";
					currentNode.weight = 0;
				} else if (type === "weight") {
					// currentNode.status = "default";  // should be "weight"; left for later implementation
					currentNode.weight = 15;
				}
			}
		}
	}
};

