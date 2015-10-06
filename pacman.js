/**
 * Map
 *
 * 0: Wall
 * 1: Dot
 * 2: Blank
 * 3: Ghost's House
 * 4: Special Dot
 */
var Pacman       = {},
    pacmanSprite = {},
    ghostSprite  = {},
    oldGhostSprite  = {},
    nodeHistory  = new Array(),
    cnvBg        = null,
    cnvPacman    = null,
    ctxBg        = null,
    ctxPacman    = null,
    log		 = "",
    route        = new Array(),
    FAILURE      = -10001,
    CUTOFF       =  10000,
    SOLUTION     =  11111;

Pacman.MAP = [
//   0  1  2  3  4  5  6  7  8  9 10 11 12 13 14 15 16 17 18
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], // 0
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 1
    [0, 4, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 4, 0], // 2
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0], // 3
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 4
    [0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0], // 5
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0], // 6
    [0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0], // 7
    [2, 2, 2, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 2, 2, 2], // 8
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0], // 9
    [2, 2, 2, 2, 1, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 2, 2, 2, 2], // 10
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0], // 11
    [2, 2, 2, 0, 1, 0, 1, 1, 1, 2, 1, 1, 1, 0, 1, 0, 2, 2, 2], // 12
    [0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0], // 13
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 14
    [0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0], // 15
    [0, 4, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 4, 0], // 16
    [0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0], // 17
    [0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0], // 18
    [0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0], // 19
    [0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // 20
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]  // 21
];

/**
 * Ghost Movement Logic - Informed Search
 */
function ghostDirectionInformedSearch(node){
    nodeHistory.push({x: node.x, y: node.y});

    var eyeDirection = 0;

    var nextNode = {};

    //Goal (Solution)
    if(pacmanSprite.x == node.x && pacmanSprite.y == node.y){
        alert("LOST!");
    } else {
        // Pacman Located Bottom Left
        if(pacmanSprite.x < node.x && pacmanSprite.y > node.y){
            // Node Bottom
            if(Pacman.MAP[node.y + 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y + 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y + 1;

                eyeDirection = 3;
            }
            // Node Left
            else if(Pacman.MAP[node.y][node.x - 1] > 0 && objectIndexOf(nodeHistory,{x: node.x - 1, y: node.y}) == -1){
                nextNode.x = node.x - 1;
                nextNode.y = node.y;

                eyeDirection = 4;
            }
            /**
             * X distance bigger than Y distance: Do not increase X! (Matrix is bigger at the X axis than Y)
             * Node Top
             */
            else if((Math.abs(node.x - pacmanSprite.x) > Math.abs(node.y - pacmanSprite.y)) && Pacman.MAP[node.y - 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y - 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y - 1;

                eyeDirection = 1;
            }
            /**
             * Y distance bigger than X distance: Do not increase Y!
             * Node Right
             */
            else {
                nextNode.x = node.x + 1;
                nextNode.y = node.y;

                eyeDirection = 2;
            }
        }
        // Pacman Located Bottom Right
        else if(pacmanSprite.x > node.x && pacmanSprite.y > node.y){
            // Node Bottom
            if(Pacman.MAP[node.y + 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y + 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y + 1;

                eyeDirection = 3;
            }
            // Node Right
            else if(Pacman.MAP[node.y][node.x + 1] > 0 && objectIndexOf(nodeHistory,{x: node.x + 1, y: node.y}) == -1){
                nextNode.x = node.x + 1;
                nextNode.y = node.y;

                eyeDirection = 2;
            }
            /**
             * X distance bigger than Y distance: Do not increase X!
             * Node Top
             */
            else if((Math.abs(node.x - pacmanSprite.x) > Math.abs(node.y - pacmanSprite.y)) && Pacman.MAP[node.y - 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y - 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y - 1;

                eyeDirection = 1;
            }
            /**
             * Y distance bigger than X distance: Do not increase Y!
             * Node Left
             */
            else {
                nextNode.x = node.x - 1;
                nextNode.y = node.y;

                eyeDirection = 4;
            }
        }
        // Pacman Located Top Left
        else if(pacmanSprite.x < node.x && pacmanSprite.y < node.y){
            // Node Top
            if(Pacman.MAP[node.y - 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y - 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y - 1;

                eyeDirection = 1;
            }
            // Node Left
            else if(Pacman.MAP[node.y][node.x - 1] > 0 && objectIndexOf(nodeHistory,{x: node.x - 1, y: node.y}) == -1){
                nextNode.x = node.x - 1;
                nextNode.y = node.y;

                eyeDirection = 4;
            }
            /**
             * X distance bigger than Y distance: Do not increase X!
             * Node Bottom
             */
            else if((Math.abs(node.x - pacmanSprite.x) > Math.abs(node.y - pacmanSprite.y)) && Pacman.MAP[node.y + 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y + 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y + 1;

                eyeDirection = 3;
            }
            /**
             * Y distance bigger than X distance: Do not increase Y!
             * Node Right
             */
            else {
                nextNode.x = node.x + 1;
                nextNode.y = node.y;

                eyeDirection = 2;
            }
        }
        // Pacman Located Top Right
        else if(pacmanSprite.x > node.x && pacmanSprite.y < node.y){
            // Node Top
            if(Pacman.MAP[node.y - 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y - 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y - 1;

                eyeDirection = 1;
            }
            // Node Right
            else if(Pacman.MAP[node.y][node.x + 1] > 0 && objectIndexOf(nodeHistory,{x: node.x + 1, y: node.y}) == -1){
                nextNode.x = node.x + 1;
                nextNode.y = node.y;

                eyeDirection = 2;
            }
            /**
             * X distance bigger than Y distance: Do not increase X!
             * Node Bottom
             */
            else if((Math.abs(node.x - pacmanSprite.x) > Math.abs(node.y - pacmanSprite.y)) && Pacman.MAP[node.y + 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y + 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y + 1;

                eyeDirection = 3;
            }
            /**
             * Y distance bigger than X distance: Do not increase Y!
             * Node Left
             */
            else {
                nextNode.x = node.x - 1;
                nextNode.y = node.y;

                eyeDirection = 4;
            }
        }
        // Pacman Located Bottom
        else if(pacmanSprite.x == node.x && pacmanSprite.y > node.y){
            // Node Bottom
            if(Pacman.MAP[node.y + 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y + 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y + 1;

                eyeDirection = 3;
            }
            // TODO: Add Random Decision aeyeDirectionbout the priority of Right/Left
            // Node Right
            else if(Pacman.MAP[node.y][node.x + 1] > 0 && objectIndexOf(nodeHistory,{x: node.x + 1, y: node.y}) == -1){
                nextNode.x = node.x + 1;
                nextNode.y = node.y;

                eyeDirection = 2;
            }
            // Node Left
            else if(Pacman.MAP[node.y][node.x - 1] > 0 && objectIndexOf(nodeHistory,{x: node.x - 1, y: node.y}) == -1){
                nextNode.x = node.x - 1;
                nextNode.y = node.y;

                eyeDirection = 4;
            }
            // Node Top
            else {
                nextNode.x = node.x;
                nextNode.y = node.y - 1;

                eyeDirection = 1;
            }
        }
        // Pacman Located Top
        else if(pacmanSprite.x == node.x && pacmanSprite.y < node.y){
            // Node Top
            if(Pacman.MAP[node.y - 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y - 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y - 1;

                eyeDirection = 1;
            }
            // Node Right
            else if(Pacman.MAP[node.y][node.x + 1] > 0 && objectIndexOf(nodeHistory,{x: node.x + 1, y: node.y}) == -1){
                nextNode.x = node.x + 1;
                nextNode.y = node.y;

                eyeDirection = 2;
            }
            // Node Left
            else if(Pacman.MAP[node.y][node.x - 1] > 0 && objectIndexOf(nodeHistory,{x: node.x - 1, y: node.y}) == -1){
                nextNode.x = node.x + 1;
                nextNode.y = node.y;

                eyeDirection = 4;
            }
            // Node Bottom
            else {
                nextNode.x = node.x;
                nextNode.y = node.y + 1;

                eyeDirection = 3;
            }
        }
        // Pacman Located Right
        else if(pacmanSprite.x > node.x && pacmanSprite.y == node.y){
            // Node Right
            if(Pacman.MAP[node.y][node.x + 1] > 0 && objectIndexOf(nodeHistory,{x: node.x + 1, y: node.y}) == -1){
                nextNode.x = node.x + 1;
                nextNode.y = node.y;

                eyeDirection = 2;
            }
            // Node Bottom
            else if(Pacman.MAP[node.y + 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y + 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y + 1;

                eyeDirection = 3;
            }
            // Node Top
            else if(Pacman.MAP[node.y - 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y - 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y - 1;

                eyeDirection = 1;
            }
            // Node Left
            else {
                nextNode.x = node.x - 1;
                nextNode.y = node.y;

                eyeDirection = 4;
            }
        }
        // Pacman Located Left
        else {
            // Node Left
            if(Pacman.MAP[node.y][node.x - 1] > 0 && objectIndexOf(nodeHistory,{x: node.x - 1, y: node.y}) == -1){
                nextNode.x = node.x - 1;
                nextNode.y = node.y;

                eyeDirection = 4;
            }
            // Node Bottom
            else if(Pacman.MAP[node.y + 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y + 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y + 1;

                eyeDirection = 3;
            }
            // Node Top
            else if(Pacman.MAP[node.y - 1][node.x] > 0 && objectIndexOf(nodeHistory,{x: node.x, y: node.y - 1}) == -1){
                nextNode.x = node.x;
                nextNode.y = node.y - 1;

                eyeDirection = 1;
            }
            // Node Right
            else {
                nextNode.x = node.x + 1;
                nextNode.y = node.y;

                eyeDirection = 2;
            }
        }

        if(nextNode != null){
                oldGhostSprite.y = ghostSprite.y;
                oldGhostSprite.x = ghostSprite.x;

                ghostSprite.y = nextNode.y;
                ghostSprite.x = nextNode.x;

                //return ghostDirection(nextNode);
                //window.setTimeout(ghostDirection, 400, nextNode);
        } else {
                ghostSprite.y = node.y;
                ghostSprite.x = node.x;
        }

        //drawPacman();
        drawGhost(eyeDirection,0);
    }
}


/**
 * Uninformed Depth-Limited Tree Search
 */
function depthLimitedSearch(initialNode, problem, limit){
    return recursiveDLS(initialNode, problem, limit);
}

/**
 * Recursive Depth-Limited Tree Search
 */
function recursiveDLS(node, problem, limit){
    if(goalTest(problem, node) == true){
        log += "(" + node.x + "," + node.y + ")<br />";
        return SOLUTION;
    } else if(limit == 0){
        log += "CUTOFF: (" + node.x + "," + node.y + ")<br />";
        return CUTOFF;
    } else {
        var cutoff_occurred = false;
        var arrActions = actions(node);

        for(var actionId in arrActions){
            var child = childNode(node, arrActions[actionId]);
            var result = recursiveDLS(child, problem, limit - 1);
            if(result == CUTOFF) {
                cutoff_occurred = true;
            } else if (result != FAILURE){
                //route.push(node);
                log += "RESULT: (" + node.x + "," + node.y + ")<br />";
                return result;
            }
        }

        if(cutoff_occurred == true) {
            log += "CUTOFF: (" + node.x + "," + node.y + ")<br />";
            return CUTOFF;
        } else {
            log += "FAILURE: (" + node.x + "," + node.y + ")<br />";
            return FAILURE;
        }
    }
}

function iterativeDeepeningSearch(problem) {
    for(d = 0; d < problem.length; d++){
        var result = depthLimitedSearch(problem, d);
    }
}

/**
 * Test if the algorithm hit the Solution
 */
function goalTest(problem, node){
    if(problem.x == node.x && problem.y == node.y){
        return true;
    }

    return false;
}

/**
 * Function that returns the array of possible actions for the node
 *
 * 1: Top
 * 2: Right
 * 3: Bottom
 * 4: Left
 */
function actions(node){
    var resArray = new Array();

    if(Pacman.MAP[node.y - 1][node.x] > 0){
        resArray.push(1);
    }

    if(Pacman.MAP[node.y][node.x + 1] > 0){
        resArray.push(2);
    }

    if(Pacman.MAP[node.y + 1][node.x] > 0){
        resArray.push(3);
    }

    if(Pacman.MAP[node.y][node.x - 1] > 0){
        resArray.push(4);
    }

    return resArray;
}

/**
 * Returns Child Node
 *
 * 1: Top
 * 2: Right
 * 3: Bottom
 * 4: Left
 */
function childNode(node, action){
    log += "CHILD [" + action + "] OF: (" + node.x + "," + node.y + "): <br />\n";

    switch(action) {
        case 1:
            log += "----> (" + node.x + "," + (node.y - 1) + "): <br />\n";
            return {x: node.x, y: node.y - 1};
            break;

        case 2:
            log += "----> (" + (node.x + 1) + "," + node.y + "): <br />\n";
            return {x: node.x + 1, y: node.y};
            break;

        case 3:
            log += "----> (" + node.x + "," + (node.y + 1) + "): <br />\n";
            return {x: node.x, y: node.y + 1};
            break;

        case 4:
            log += "----> (" + (node.x - 1) + "," + node.y + "): <br />\n";
            return {x: node.x - 1, y: node.y};
            break;
    }
}

/**
 * Transformate the Matrix in the World and create initial Sprites
 */
function createWorld(){
    cnvBg = document.getElementById("bg");
    cnvPacman = document.getElementById("pacman");

    if(cnvPacman.getContext){
        ctxBg = cnvBg.getContext("2d");
        ctxPacman = cnvPacman.getContext("2d");

        ctxBg.fillStyle = "black";
        ctxBg.fillRect(0, 0, 760, 880);

        for(y = 0; y < Pacman.MAP.length; y++){
            for(x = 0; x < Pacman.MAP[y].length; x++){
                if(Pacman.MAP[y][x] == 0){
                    var blocksGradient = ctxPacman.createLinearGradient(x * 40, y * 40, x * 40, (y * 40) +  40);
                    blocksGradient.addColorStop(0,"#1240AB");
                    blocksGradient.addColorStop(1,"#06266F");

                    ctxBg.fillStyle = blocksGradient;
                    ctxBg.fillRect(x * 40, y * 40, 40, 40);

                    ctxBg.strokeStyle = "#4671D5";
                    ctxBg.strokeRect(x * 40, y * 40, 40, 40);
                } else if(Pacman.MAP[y][x] == 1){
                    ctxBg.fillStyle = "white";
                    ctxBg.fillRect((x * 40) + 18, (y * 40) + 18, 4, 4);
                } else if(Pacman.MAP[y][x] == 4){
                    ctxBg.beginPath();
                    ctxBg.arc((x * 40) + 20, (y * 40) + 20, 5, 0, 2 * Math.PI);
                    ctxBg.fillStyle = "white";
                    ctxBg.fill();
                    ctxBg.closePath();
                }
            }
        }

        ghostSprite  = {};

        pacmanSprite.y = 20 ;
        pacmanSprite.x = 9;

        ghostSprite.y = 8;
        ghostSprite.x = 9;

        drawGhost(4,400);

        $("#log").html(log);
    }
}

function objectIndexOf(arr, o) {
    for (var i = 0; i < arr.length; i++) {

        if (arr[i].x == o.x && arr[i].y == o.y) {
            return i;
        }

    }

    return -1;
}

function drawPacman(){
    //Pacman
    ctxPacman.beginPath();
    ctxPacman.arc((pacmanSprite.x * 40) + 20, (pacmanSprite.y * 40) + 20, 15, 0.20 * Math.PI, 1.80 * Math.PI);
    ctxPacman.lineTo((pacmanSprite.x * 40) + 15, (pacmanSprite.y * 40) + 20);
    ctxPacman.closePath();
    ctxPacman.fillStyle = "yellow";
    ctxPacman.fill();
}

/**
 * eyeDirection:
 * 1: Top
 * 2: Right
 * 3: Bottom
 * 4: Left
 */
function drawGhost(eyeDirection, tmpMs){
    var eye1Position = {},
        eye2Position = {};

    switch(eyeDirection){
        case 1:
            eye1Position.x = 8;
            eye1Position.y = 15;
            eye2Position.x = 20;
            eye2Position.y = 15;
            break;

        case 2:
            eye1Position.x = 10;
            eye1Position.y = 19;
            eye2Position.x = 22;
            eye2Position.y = 19;
            break;

        case 3:
            eye1Position.x = 8;
            eye1Position.y = 21;
            eye2Position.x = 20;
            eye2Position.y = 21;
            break;

        default:
            eye1Position.x = 6;
            eye1Position.y = 19;
            eye2Position.x = 18;
            eye2Position.y = 19;
            break;
    }

    var tmpGhostSprite = {};

    if(tmpMs < 400){
        if(ghostSprite.x > oldGhostSprite.x){
            tmpGhostSprite.x = (oldGhostSprite.x * 40) + (tmpMs / 10);
            tmpGhostSprite.y = oldGhostSprite.y * 40;
        } else if(ghostSprite.x < oldGhostSprite.x){
            tmpGhostSprite.x = (oldGhostSprite.x * 40) - (tmpMs / 10);
            tmpGhostSprite.y = oldGhostSprite.y * 40;
        } else if(ghostSprite.y > oldGhostSprite.y){
            tmpGhostSprite.x = oldGhostSprite.x * 40;
            tmpGhostSprite.y = (oldGhostSprite.y * 40) + (tmpMs / 10)
        } else if(ghostSprite.y < oldGhostSprite.y){
            tmpGhostSprite.x = oldGhostSprite.x * 40;
            tmpGhostSprite.y = (oldGhostSprite.y * 40) - (tmpMs / 10)
        } else {
            tmpGhostSprite.x = ghostSprite.x * 40;
            tmpGhostSprite.y = ghostSprite.y * 40;
        }
    } else {
        tmpGhostSprite.x = ghostSprite.x * 40;
        tmpGhostSprite.y = ghostSprite.y * 40;
    }

    ctxPacman.clearRect(0,0,760,880);

    drawPacman();

    //Ghost

    ctxPacman.fillStyle = "red";
    ctxPacman.beginPath();
    ctxPacman.moveTo(tmpGhostSprite.x + 6 + 0, tmpGhostSprite.y + 2 + 33);
    ctxPacman.lineTo(tmpGhostSprite.x + 6 + 0, tmpGhostSprite.y + 2 + 19);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 0, tmpGhostSprite.y + 2 + 11, tmpGhostSprite.x + 6 + 6, tmpGhostSprite.y + 2 + 5, tmpGhostSprite.x + 6 + 14, tmpGhostSprite.y + 2 + 5);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 22, tmpGhostSprite.y + 2 + 5, tmpGhostSprite.x + 6 + 28, tmpGhostSprite.y + 2 + 11, tmpGhostSprite.x + 6 + 28, tmpGhostSprite.y + 2 + 19);
    ctxPacman.lineTo(tmpGhostSprite.x + 6 + 28, tmpGhostSprite.y + 2 + 33);
    ctxPacman.lineTo(tmpGhostSprite.x + 6 + 23.333, tmpGhostSprite.y + 2 + 28.333);
    ctxPacman.lineTo(tmpGhostSprite.x + 6 + 18.666, tmpGhostSprite.y + 2 + 33);
    ctxPacman.lineTo(tmpGhostSprite.x + 6 + 14, tmpGhostSprite.y + 2 + 28.333);
    ctxPacman.lineTo(tmpGhostSprite.x + 6 + 9.333, tmpGhostSprite.y + 2 + 33);
    ctxPacman.lineTo(tmpGhostSprite.x + 6 + 4.666, tmpGhostSprite.y + 2 + 28.333);
    ctxPacman.lineTo(tmpGhostSprite.x + 6 + 0, tmpGhostSprite.y + 2 + 33);
    ctxPacman.closePath();
    ctxPacman.fill();

    ctxPacman.fillStyle = "white";
    ctxPacman.beginPath();
    ctxPacman.moveTo(tmpGhostSprite.x + 6 + 8, tmpGhostSprite.y + 2 + 13);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 5, tmpGhostSprite.y + 2 + 13, tmpGhostSprite.x + 6 + 4, tmpGhostSprite.y + 2 + 16, tmpGhostSprite.x + 6 + 4, tmpGhostSprite.y + 2 + 18);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 4, tmpGhostSprite.y + 2 + 20, tmpGhostSprite.x + 6 + 5, tmpGhostSprite.y + 2 + 23, tmpGhostSprite.x + 6 + 8, tmpGhostSprite.y + 2 + 23);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 11, tmpGhostSprite.y + 2 + 23, tmpGhostSprite.x + 6 + 12, tmpGhostSprite.y + 2 + 20, tmpGhostSprite.x + 6 + 12, tmpGhostSprite.y + 2 + 18);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 12, tmpGhostSprite.y + 2 + 16, tmpGhostSprite.x + 6 + 11, tmpGhostSprite.y + 2 + 13, tmpGhostSprite.x + 6 + 8, tmpGhostSprite.y + 2 + 13);
    ctxPacman.moveTo(tmpGhostSprite.x + 6 + 20, tmpGhostSprite.y + 2 + 13);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 17, tmpGhostSprite.y + 2 + 13, tmpGhostSprite.x + 6 + 16, tmpGhostSprite.y + 2 + 16, tmpGhostSprite.x + 6 + 16, tmpGhostSprite.y + 2 + 18);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 16, tmpGhostSprite.y + 2 + 20, tmpGhostSprite.x + 6 + 17, tmpGhostSprite.y + 2 + 23, tmpGhostSprite.x + 6 + 20, tmpGhostSprite.y + 2 + 23);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 23, tmpGhostSprite.y + 2 + 23, tmpGhostSprite.x + 6 + 24, tmpGhostSprite.y + 2 + 20, tmpGhostSprite.x + 6 + 24, tmpGhostSprite.y + 2 + 18);
    ctxPacman.bezierCurveTo(tmpGhostSprite.x + 6 + 24, tmpGhostSprite.y + 2 + 16, tmpGhostSprite.x + 6 + 23, tmpGhostSprite.y + 2 + 13, tmpGhostSprite.x + 6 + 20, tmpGhostSprite.y + 2 + 13);
    ctxPacman.closePath();
    ctxPacman.fill();

    ctxPacman.fillStyle = "black";
    ctxPacman.beginPath();
    ctxPacman.arc(tmpGhostSprite.x + 6 + eye2Position.x, tmpGhostSprite.y + 2 + eye2Position.y, 2, 0, Math.PI*2, true);
    ctxPacman.closePath();
    ctxPacman.fill();

    ctxPacman.beginPath();
    ctxPacman.arc(tmpGhostSprite.x + 6 + eye1Position.x, tmpGhostSprite.y + 2 + eye1Position.y, 2, 0, Math.PI*2, true);
    ctxPacman.closePath();
    ctxPacman.fill();

    $("#log").html(log);

    if(tmpMs < 400){
        window.setTimeout(drawGhost, 20, eyeDirection, tmpMs + 20);
    } else {
        window.setTimeout(ghostDirectionInformedSearch, 20, ghostSprite);
    }
}

window.onload = function(){
    createWorld();
}
