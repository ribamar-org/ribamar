const assert = require('assert');
const http   = require('http');
const { URL } = require('url');

function getQuery(url){
    let query = {};
    url.searchParams.forEach(function(v, k){
        if(typeof query[k] == 'object')
            query[k].push(v);
        else if(query[k])
            query[k] = [query[k], v];
        else
            query[k] = v;
    });
    return query;
}

async function getBody(req){

    if(!['POST', 'PUT', 'PATCH'].includes(req.method))
        return undefined;

    let body = await new Promise(resolve => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => resolve(body) );
    });

    try{ return JSON.parse(body); }
    catch(e){ throw 'bad-json'; }
}

async function respond(req, res){

    let url = new URL(req.url, 'http://localhost');
    let entity = url.pathname.substring(1);
    let input = { headers: req.headers, query: getQuery(url) };
    let success = 200 + Number(['POST', 'PUT'].includes(req.method));

    try{
        input.body = await getBody(req);
        var output = this.run(`${req.method} ${entity}`, input);
    }
    catch(e){ var error = e; }

    let status = {
        'bad-json': 400,
        'no-method': 405 - Number(req.method == 'GET'),
        'no-entity': 404,
        undefined: output ? success : 204
    }

    if(error == 'no-method')
        res.setHeader('Allow', this.options(entity).join(', ').toUpperCase());

    res.writeHead(status[error] || 500);
    res.end(output || '');
}

module.exports = class WebServer{

    start(settings, router){
        settings = settings || {};

        assert(typeof settings.port == 'number');
        assert(Number.isInteger(settings.port));

        this.router = router;
        this.port = settings.port;

        this.server = http.createServer(respond.bind(router));

        this.server.on('clientError', (e, socket) => {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        this.server.listen(this.port);
    }

    stop(){
        this.server.close();
    }
};
