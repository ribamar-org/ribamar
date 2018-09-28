const assert = require('assert');
const http   = require('http');
const { URL } = require('url');

/*============================================================================o\
    Parse the @url's query string into a simpler to access object.
\o============================================================================*/
function getQuery(url){
    let query = {};
    url.searchParams.forEach(function(v, k){

        // Push to array param.
        if(typeof query[k] == 'object')
            query[k].push(v);

        // Transform repeated param in array.
        else if(query[k])
            query[k] = [query[k], v];

        // Set normal param.
        else
            query[k] = v;
    });
    return query;
}

/*============================================================================o\
    Effectively read @req's JSON body payload, if it has one. Returns a native
    object parsed from the json data received.
\o============================================================================*/
async function getBody(req){

    // Filter out requests that should not have a body.
    if(!['POST', 'PUT', 'PATCH'].includes(req.method))
        return undefined;

    // Perform the socket reading.
    let body = await new Promise(resolve => {
        let body = '';
        req.on('data', chunk => body += chunk.toString());
        req.on('end', () => resolve(body) );
    });

    // Attempt the parsing from JSON.
    try{ return JSON.parse(body); }
    catch(e){ throw 'bad-json'; }
}

/*============================================================================o\
    Define the proper response status code based on the input and process data.
\o============================================================================*/
function calcStatus(method, error, output, custom){

    // Decides the success code for the method.
    let success = 200 + Number(['POST', 'PUT'].includes(method));

    // Assign some defaults.
    let status = {
        'bad-json': 400,
        'no-method': 405 - Number(method == 'GET'),
        'no-entity': 404,
        'empty': 204,
        undefined: success
    }

    // Prioritize custom status, over default status, over unknown.
    return custom || status[error] || 500;
}

/*============================================================================o\
    Attempt converting @output to JSON string. Raises if invalid output.
\o============================================================================*/
function parseOutput(output){
    if(typeof output == 'object')
        return JSON.stringify(output);
    else if(!output)
        throw 'empty';
    return String(output);
}

/*============================================================================o\
    Respond to an external HTTP request (@req).
\o============================================================================*/
async function respond(req, res){

    // Parse input data.
    let url = new URL(req.url, 'http://localhost');
    let input = {
        headers: req.headers,
        query: getQuery(url),
        path: url.pathname.substring(1).split('/')
    };

    // Grab first portion of path as entity.
    let entity = input.path[0];

    // Facility for defining of custom status.
    var customStatus = false;
    input.status = (status) => { customStatus = status };

    // Decode input, forward to router for processing, and encode ouput.
    try{
        input.body = await getBody(req);
        var output = await this.run(`${req.method} ${entity}`, input);
        output = parseOutput(output);
    }
    catch(e){ var err = e; }

    // If unknown error is gotten, write to log as ERROR.
    /* istanbul ignore next */
    err && err.message && this.logger && this.logger.log(err.message, 'ERROR');

    // Define final status to respond.
    let status = calcStatus(req.method, err, output, customStatus);

    // If method not allowed, list available methods for entity.
    if(status == 405)
        res.setHeader('Allow', this.options(entity).join(', ').toUpperCase());

    // Effectively write output status and payload to socket.
    res.writeHead(status);
    res.end(output);
}

/*============================================================================o\
    An instance of this class represents a routing webserver.
\o============================================================================*/
module.exports = class WebServer{

    /*------------------------------------------------------------------------o\
        Start the server according to @settings, forwarding requests to @router.
    \o------------------------------------------------------------------------*/
    start(settings){
        settings = settings || {};
        let router = settings.router || { run: /* istanbul ignore next */() => {} };

        // Check input data.
        assert(typeof settings.port == 'number');
        assert(Number.isInteger(settings.port));

        // Create the http server object.
        this.router = router;
        this.port = settings.port;
        this.server = http.createServer(respond.bind(router));

        // Treat unexpected client errors.
        this.server.on('clientError', (e, socket) => {
            socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
        });

        // Starts listening on setup port.
        this.server.listen(this.port);
    }

    /*------------------------------------------------------------------------o\
        Stop the server from listening to requests.
    \o------------------------------------------------------------------------*/
    stop(){
        if(this.server)
            this.server.close();
    }
};
