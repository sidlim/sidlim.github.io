// Webserver Setup:
var fs = require('fs');
var http = require('http');
const PORT = process.env.PORT || 8080;

function handleRequest(request, response){
	console.log(request.url);
	if (request.url.slice(-1) == '/') {
		response.writeHead(200);
	    var FaviconStream = fs.createReadStream(__dirname  + request.url + 'index.html');
	    FaviconStream.pipe(response);
		console.log('returned ' + __dirname);
	}
	else if (fs.existsSync(__dirname + request.url)) {
		response.writeHead(200);
	    var FaviconStream = fs.createReadStream(__dirname  + request.url);
	    FaviconStream.pipe(response);
		console.log('returned ' + __dirname);
	}
	else {
		console.log('not found');
	}
}

var WebServer = http.createServer(handleRequest);

WebServer.listen(PORT, function(){
    console.log("HTTP server listening on: http://localhost:%s", PORT);
});
