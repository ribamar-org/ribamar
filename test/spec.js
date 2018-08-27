var unit = process.argv[5];

var cases = [ 'settings', 'database', 'router', 'scheduler', 'logger' ];

if(unit)
    require('./spec/' + unit);
else
    for(let c of cases)
        require('./spec/' + c);
