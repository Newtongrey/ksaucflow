const http = require('http');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon' };

http.createServer((request, response) => {
  const requested = request.url === '/' ? '/index.html' : decodeURIComponent(request.url.split('?')[0]);
  const file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(root)) { response.writeHead(403); return response.end('Forbidden'); }
  fs.readFile(file, (error, data) => {
    if (error) { response.writeHead(error.code === 'ENOENT' ? 404 : 500); return response.end(error.code === 'ENOENT' ? 'Not found' : 'Server error'); }
    response.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' });
    response.end(data);
  });
}).listen(8080, '127.0.0.1', () => console.log('RouteFlow is running at http://localhost:8080'));
