var unit = process.argv[5];

var cases = [ 'settings', 'database', 'router', 'scheduler', 'logger', 'webserver' ];

if(unit)
    try{ require('./spec/' + unit); }
    catch(e){ console.error(e, `\nModule "${unit}" not found!`); }
else
    for(let c of cases)
        try{ require('./spec/' + c); }
        catch(e){ console.error(e, `\nModule "${c}" not found!`); }
