const assert = require('assert');

/*============================================================================o\
    Instances of this class can direct REST routes to objects and methods in the
    routes dir.
\o============================================================================*/
module.exports = class Router{

    /*------------------------------------------------------------------------o\
        Constructor
    \o------------------------------------------------------------------------*/
    constructor(context){

        // Keep a reference to the context to be passed to the methods.
        this.context = context || {};

        // Aggregate all REST entities.
        this.routes = {
            account: require('./api/account'),
            credential: require('./api/credential'),
            '': { get: () => 'It works!' }
        };
    }

    /*------------------------------------------------------------------------o\
        Execute the function from method and entoty defined in th REST @route.
    \o------------------------------------------------------------------------*/
    async run(route, input){

        // Validate input argments.
        assert(typeof route == 'string');
        var [ method, entity ] = route.toLowerCase().split(' ');
        assert(typeof entity == 'string');
        assert(typeof method == 'string');

        // Check if specified route exists.
        if(typeof this.routes[entity] != 'object')
            throw 'no-entity';
        entity = this.routes[entity];
        if(typeof entity[method] != 'function')
            throw 'no-method';
        method = entity[method].bind(this.context);

        // Execute the route code and return its result.
        return await method(input || {});
    }

    /*------------------------------------------------------------------------o\
        Return an arry with all methods available in @entity.
    \o------------------------------------------------------------------------*/
    options(entity){

        // Validate input argument.
        assert(typeof entity == 'string');
        assert(typeof this.routes[entity] == 'object');

        // Return all keys in this as array.
        return Object.keys(this.routes[entity]);
    }
}
