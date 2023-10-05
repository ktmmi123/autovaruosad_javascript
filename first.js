const http = require('http');
const fs = require('fs');
const url = require('url');

const hostname = '127.0.0.1';
const port = 3000;
const resultsPerPage = 30;

const server = http.createServer((req, res) => {
    console.log("Someone accessed the page:", req.url);
    res.statusCode = 200;
    res.setHeader('Content-Type', 'text/plain');

    if (req.url === "/") {
        res.end('Hello World');
    } else if (req.url === "/contact") {
        res.end('email');
    } else if (req.url.startsWith("/data")) {
        const parsedUrl = url.parse(req.url, true);
        const queryParams = parsedUrl.query;
        const filterProductCode = queryParams.productcode;
        const filterToode = queryParams.toode;

        const fileContents = fs.readFileSync('LE.txt', 'utf-8');
        const lines = fileContents.split('\n');

        const filteredLines = [];

        lines.forEach((line) => {
            const values = line.replace(/"/g, '').split('\t');

            const keys = [
                "product code", 
                "toode", 
                "ladu1", 
                "ladu2", 
                "ladu3", 
                "ladu4", 
                "ladu5",
                "ladu6", 
                "km/ta summa", 
                "mudel", 
                "summa"
            ];

            const object = {};

            values.forEach((value, index) => {
                const key = keys[index];
                object[key] = value;
            });

            const meetsFilterCriteria = (!filterProductCode || object["product code"] === filterProductCode) &&
                (!filterToode || object["toode"] === filterToode);

            if (meetsFilterCriteria) {
                filteredLines.push(JSON.stringify(object));
            }
        });

        const page = parseInt(queryParams.page) || 1;

        if (page === 1 && (!filterProductCode && !filterToode)) {
            res.end(filteredLines.join('\n'));
        } else {
            if (filteredLines.length > resultsPerPage) {
                const startIdx = (page - 1) * resultsPerPage;
                const endIdx = startIdx + resultsPerPage;
                const pageData = filteredLines.slice(startIdx, endIdx);

                const totalPages = Math.ceil(filteredLines.length / resultsPerPage);

                res.write(`Page ${page} of ${totalPages}:\n`);
                res.end(pageData.join('\n'));
            } else {
               
                res.end(filteredLines.join('\n'));
            }
        }
    } else {
        res.end('Page not found');
    }
});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});
