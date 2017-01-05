// Webserver Setup:
var fs = require('fs');
var http = require('http');
const PORT = process.env.PORT || 8080;

function handleRequest(request, response){
	console.log(request.url);
	var p = __dirname + request.url;
	if ((request.url.substr(-1) == '/') && exists(p + '/index.html')) {
		// Accessing a directory: Look for index.html
		p += '/index.html';
		fileret(p, response);
	}
	else if ( !(request.url.substr(-1) == '/') && exists(p)) {
		// Accessing a file: Look for the file
		fileret(p, response);
	}
	else if (!exists(p) && exists(__dirname + '/404.html')) {
		// Hit a 404 with a prewritten 404 page
		filret(404, response);
	}
	else {
		// Regular old 404
		console.log('404\'ed looking for ' + p);
		response.writeHead(404, {"Content-Type": "text/plain"});
		response.write("404 Not Found\n");
		response.end();
	}
}

// Existence checks, because fsexistssync is screwy
function exists(dir) {
	console.log('checking if ' + dir + ' exists.');
	try {
		fs.accessSync(dir);
		return(true);
	}
	catch(e) {
		return(false);
	}
}

// Return a file:
function fileret(path, resp) {
	if (path == 404) {
		resp.writeHead(404);
		var FaviconStream = fs.createReadStream(__dirname + '404.html');
	}
	else {
		resp.writeHead(200);
		var FaviconStream = fs.createReadStream(path);
	}
	FaviconStream.pipe(resp);
	console.log('returned ' + path);
}

// Run web server
var WebServer = http.createServer(handleRequest);

WebServer.listen(PORT, function(){
    console.log("HTTP server listening on: http://localhost:%s", PORT);
});
