// NODEJS THREEJS Example By GoalieSave25

var CLIENTS = [];
var PLAYERS = [];
var CONTROLS = [];
var MOVESPEED = 1;
var ROTATIONSPEED = 0.03;
var SPEED = 0.1;
var PREFIX = " [NODEJS] ";
setInterval(main, 0.9*1000/60);

var WebSocketServer = require('ws').Server;
var wss = new WebSocketServer({ ip: process.env.OPENSHIFT_NODEJS_IP || "127.0.0.1", port: process.env.OPENSHIFT_NODEJS_PORT  || 8080 });

console.log();
log("Server Started");

function main() {
	for(var i = 0; i < PLAYERS.length; i++) {
		var player = PLAYERS[i];
		var control = CONTROLS[i];
		if(control.up) {
			player.x -= SPEED * Math.sin(player.yrotation);
			player.z -= SPEED * Math.cos(player.yrotation);
		} if(control.down) {
			player.x += SPEED * Math.sin(player.yrotation);
			player.z += SPEED * Math.cos(player.yrotation);
		} if(control.left) {
			player.yrotation += ROTATIONSPEED;
		} if(control.right) {
			player.yrotation -= ROTATIONSPEED;
		}
	}
	sendPlayers();
}

wss.on('connection', function(ws) {
	log("Client Connected");
	CLIENTS.push(ws);
	PLAYERS.push(new playerdefault());
	CONTROLS.push(new controldefault());
	ws.on('message', function(message) {
		var control = CONTROLS[CLIENTS.indexOf(ws)];
		var input = JSON.parse(message);
		control.up = input.up;
		control.down = input.down;
		control.left = input.left;
		control.right = input.right;
	});
	ws.on('close', function(client) {
		log("Client Disconnected");
		var index = CLIENTS.indexOf(ws);
		CLIENTS.splice(index, 1);
		PLAYERS.splice(index, 1);
		CONTROLS.splice(index, 1);
	});
	ws.on('error', function(client) {
		log("Client Error");
		var index = CLIENTS.indexOf(ws);
		CLIENTS.splice(index, 1);
		PLAYERS.splice(index, 1);
		CONTROLS.splice(index, 1);
	});
});

function playerdefault() {
	return {
		x:0,
		y:0,
		z:0,
		yrotation:0
	};
}

function controldefault() {
	return {
		up:false,
		down:false,
		left:false,
		right:false
	};
}

function log(text) {
	console.log(PREFIX + text);
}

// SENDPLAYERS - Sends all PLAYERS to all CLIENTS
function sendPlayers() {
	for (var i = 0; i < CLIENTS.length; i++) {
		if(CLIENTS[i].readyState == CLIENTS[0].OPEN) {
			var currentPlayer = PLAYERS[i];
			var pdata = JSON.parse(JSON.stringify(PLAYERS));
			pdata.splice(i, 1);
			pdata.push(currentPlayer);
			CLIENTS[i].send(JSON.stringify(pdata));
		}
	}
}