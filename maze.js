canvas = document.getElementById('main');
header = document.getElementById('header');
c = canvas.getContext('2d');
playerColor = "#00FF00"
difficulty = 50;
obf = 3;
if (window.innerWidth > window.innerHeight){
canvas.width = window.innerHeight * 0.8;
canvas.height = window.innerHeight * 0.8;
} else {
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerWidth * 0.8;
}
flood = null;
document.getElementById('header').style.width = canvas.width + 'px';
size = 30;
loss = true;
level = 0;
coins = 0;
delayVal = 5;
class Sqaure{
    constructor(x, y, s, color, coin){
        this.x = x;
        this.y = y;
        this.s = s;
        this.color = color;
        this.previous = null;
        this.coin = coin;
        if (this.color == 'black'){
            this.visited = true;
            this.playerVisited = true;
        } else {
            this.visited = false;
            this.playerVisited = false;
        }
    }
    draw() {
        c.fillStyle = 'black';
        c.fillRect(this.x*this.s, this.y*this.s, this.s, this.s);
        c.fillStyle = this.color;
        c.fillRect(this.x*this.s+1, this.y*this.s+1, this.s-2, this.s-2);
        if (this.coin){
            c.beginPath();
            c.arc(this.x*this.s+this.s/2, this.y*this.s+this.s/2, this.s/2, 0, 2 * Math.PI, false);
            c.fillStyle = 'yellow';
            c.fill();
            c.lineWidth = 1;
            c.strokeStyle = '#003300';
            c.stroke();
        }
    }
}
function endgame(){
    canvas.style.display = 'None';
    header.style.display = 'None';
    document.getElementById('postgame').style.display = 'Block';
    document.getElementById('fs').innerHTML = "Final Score: " + coins.toString();
}
function drawBoard(board){
    for (k = 0; k < board.length; k++){
        board[k].draw();
    }
}
function shuffle(a) {
    var j, x, i;
    for (i = a.length - 1; i > 0; i--) {
        j = Math.floor(Math.random() * (i + 1));
        x = a[i];
        a[i] = a[j];
        a[j] = x;
    }
    return a;
}
function makeSquares(side){
    board = [];
    boardColors = [];
    obstacles = Math.floor(side**2/obf);
    for (l=0; l < side**2; l++){
        if (l >= 3 && l <= obstacles + 2){
            boardColors.push('black');
        }
        else{
            boardColors.push('white');
        }
    }
    
    boardColors = shuffle(boardColors);
    boardColors[0] = 'blue';
    boardColors[1] = playerColor;
    boardColors[size] = 'white';
    boardColors[size + 1] = 'white';
    boardColors[boardColors.length-1] = 'red';
    x = 0;
    y = 0;
    s = canvas.width/side;
    for (j = 0; j < side; j++){
        for (i = 0; i < side; i++){
            color = boardColors[j*side+i];
            sqaure = new Sqaure(i, j, s, color, false);
            if (sqaure.color == 'white'){
                if (Math.floor(Math.random()*20)==5){
                    sqaure.coin = true;
                }
            }
            board.push(sqaure);
            if (color == playerColor){
                player = j*side+i;
            }
            if (color == 'red'){
                end = j*side+i;
            }
        }
    }
    return board;
}
function movePlayer(key, board){
    if ((key == 'w' || key == 'ArrowUp') && player>=size&&board[player-size].playerVisited==false){
        board[player].color = 'white';
        board[player].draw();
        player = player-size;  
        board[player].color = playerColor;
        board[player].draw();
    }
    if ((key == 's' || key == 'ArrowDown') && player<=board.length-size&&board[player+size].playerVisited==false){
        board[player].color = 'white';
        board[player].draw();
        player = player+size;  
        board[player].color = playerColor;
        board[player].draw();
    }
    if ((key == 'a' || key == 'ArrowLeft') && player%size!=0&&board[player-1].playerVisited==false){
        board[player].color = 'white';
        board[player].draw();
        player = player-1;  
        board[player].color = playerColor;
        board[player].draw();
    }
    if ((key == 'd' || key == 'Arrow') && (player+1)%size!=0&&board[player+1].playerVisited==false){
        board[player].color = 'white';
        board[player].draw();
        player = player+1;  
        board[player].color = playerColor;
        board[player].draw();
    }
    if (board[player].coin){
        board[player].coin = false;
        board[player].draw();
        coins += 1;
        document.getElementById('score').innerHTML = "Current Score: " + coins.toString();
    }
    if (player==0){
        clearInterval(delay);
        if (flood != null){
        clearInterval(flood);
        }
        endgame();
    }
    if (player==end){
        if (delay != null){
            clearInterval(delay);
        } else {
        clearInterval(flood);
        }
        board = generate(size);
        mainQueue = [board[start]];
        drawBoard(board);
        delay = setInterval(wait, 1000*delayVal);
    }
}
function step(queue, board2){
    active = queue.shift();
    current = board2.indexOf(active);
    if (active == board2[end]){
        board2[end].previous = active.previous;
        return -1;
    }
    active.visited = true;
    if (current%size!=0&&board2[current-1].visited==false&&queue.includes(board2[current-1])==false){
        board2[current-1].previous = active;
        queue.push(board2[current-1]);
    }
    if ((current+1)%size!=0&&board2[current+1].visited==false&&queue.includes(board2[current+1])==false){
        board2[current+1].previous = active;
        queue.push(board2[current+1]);
    }
    if (current<(board2.length-size)&&board2[current+size].visited==false&&queue.includes(board2[current+size])==false){
        board2[current+size].previous = active;
        queue.push(board2[current+size]);
    }
    if (current>=size&&board2[current-size].visited==false&&queue.includes(board2[current-size])==false){
        board2[current-size].previous = active;
        queue.push(board2[current-size]);
    }
    return queue;
}
function isSolveable(localboard){
    start = 1;
    end = localboard.length-1;
    queue = [localboard[start]]
    while (queue.length!=0 && queue!=-1){
        queue = step(queue, localboard)
    }
    if (queue==-1){
        return true;
    }
    return false;
}
function generate(size){
    level += 1;
    document.getElementById('level').innerHTML = "LEVEL " + level.toString();
    temp = true;
    while (temp || !isSolveable(boardClone)){
    temp = false;
    board = makeSquares(size);
    boardClone = [...board];
    }
    return board;
}
function floodStep(queue, board){
    active = queue.shift();
    active.color = 'blue';
    active.coin = false;
    active.draw();
    current = board.indexOf(active);
    if (active == board[end]){
        // board[end].previous = active.previous;
        clearInterval(flood);
        flood = setInterval(floodGo, 5)
    }
    active.playerVisited = true;
    if (current%size!=0&&board[current-1].playerVisited==false&&queue.includes(board[current-1])==false){
        board[current-1].previous = active;
        queue.push(board[current-1]);
    }
    if ((current+1)%size!=0&&board[current+1].playerVisited==false&&queue.includes(board[current+1])==false){
        board[current+1].previous = active;
        queue.push(board[current+1]);
    }
    if (current<=(board.length-size)&&board[current+size].playerVisited==false&&queue.includes(board[current+size])==false){
        board[current+size].previous = active;
        queue.push(board[current+size]);
    }
    if (current>=size&&board[current-size].playerVisited==false&&queue.includes(board[current-size])==false){
        board[current-size].previous = active;
        queue.push(board[current-size]);
    }
    return queue;
}
function floodGo(){
    mainQueue = floodStep(mainQueue, board);
    if (mainQueue.includes(board[player])){
        loss = true;
        clearInterval(flood);
        endgame();
    }
}
board = null;
mainQueue = null;
addEventListener('keydown', function(event){
    if (!loss){
        movePlayer(event.key, board);
    }
});
function wait(){
    clearInterval(delay);
    delay = null;
    flood = setInterval(floodGo, difficulty);
}
canvas.style.display = 'None';
header.style.display = 'None';
document.getElementById('postgame').style.display = 'None';
function init(){
canvas.style.display = 'Block';
header.style.display = 'Block';
loss = false;
drawBoard(board);
delay = setInterval(wait, 1000*delayVal);
document.getElementById('pregame').style.display = 'None';
}
document.getElementById('go').onclick = function(){
    temp2 = document.getElementById('size').value
    size = parseInt(temp2);
    if (temp2==''||size<5||size>200){
        document.getElementById('bs').style.color = 'red';
    } else{
    playerColor = document.getElementById('color').value;
    difficulty = 110 - parseInt(document.getElementById('diff').value)
    obf = 6 - (parseInt(document.getElementById('obf').value)/10);
    delayVal = parseInt(document.getElementById('delay').value)
    board = generate(size);
    mainQueue = [board[0]];
    init();
    }
}
document.getElementById('rego').onclick=function(){window.location.reload()}
document.getElementById('easy').onclick=function(){
    document.getElementById('diff').value = 10;
    document.getElementById('delay').value = 10;
    document.getElementById('obf').value = 10;
    document.getElementById('size').value = 20;
}
document.getElementById('med').onclick=function(){
    document.getElementById('diff').value = 50;
    document.getElementById('delay').value = 5;
    document.getElementById('obf').value = 30;
    document.getElementById('size').value = 30;
}
document.getElementById('hard').onclick=function(){
    document.getElementById('diff').value = 75;
    document.getElementById('delay').value = 3;
    document.getElementById('obf').value = 30;
    document.getElementById('size').value = 50;
}
document.getElementById('hard2').onclick=function(){
    document.getElementById('diff').value = 100;
    document.getElementById('delay').value = 5;
    document.getElementById('obf').value = 30;
    document.getElementById('size').value = 30;
}
document.getElementById('hard3').onclick=function(){
    document.getElementById('diff').value = 100;
    document.getElementById('delay').value = 5;
    document.getElementById('obf').value = 30;
    document.getElementById('size').value = 200;
}