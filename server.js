//gets express package
var express = require ('express');

//gets express returns
var app = express();

var server = require('http').Server(app);

//sockets
var socket = require('socket.io');
var io = socket(server);

//makes public the code within public folder
app.use(express.static('public'));
server.listen(process.env.PORT || 5000);

app.get('/', function(request, response){
	response.sendFile('public/index.html');
});

//runs server
console.log("node running on port" + (process.env.PORT || 5000));



io.sockets.on('connection', newConnection);

function newConnection(socket)
{
	console.log('new connection: ' + socket.id);

	//if there is a message called mouse, trigger the function mouseMsg
	socket.on('mouse', mouseMsg);

	//runs function and prints to console on server
	function mouseMsg(data)
	{
		console.log(data);
		//when the function receives data it broadcast that exact same message
		socket.broadcast.emit('mouse', data);
	}

}