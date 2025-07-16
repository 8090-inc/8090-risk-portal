const http = require('http');

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Test server is working!\n');
});

const port = 8080;
server.listen(port, () => {
  console.log(`Test server running at http://localhost:${port}/`);
});

// Keep the server running
process.on('SIGINT', () => {
  console.log('Server shutting down');
  server.close();
  process.exit(0);
});