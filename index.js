const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const fs = require('fs')
const path = require('path');
const async = require('async');
let Args = process.argv.slice(2);
let listenCode = parseInt(Args[0]) || process.env.PORT;
let filePath = __dirname + '/' + (Args[1] || "index.html");
let pagePath = "";
let sendPath = __dirname + '/send.html';
let settingsPath = __dirname + '/settings.json';
let awake = "";
let send = "";
let settings = {};
let compilers = [];
let configurator = () => {
    pagePath = settings.pages;
    app.use(express.static(settings.appFolder));
    http.listen(listenCode, () => {
        console.log('listening on *:' + listenCode);
    });
    fs.readdir("./plugins", (err, files) => {
        if(err) throw err;
        for(n in files) {
            let file = files[n];
            fs.readFile("./plugins/" + file, "utf8", (err, data) => {
                if(err) throw err;
                Compiler = new Function(data)();
                compilers.push({
                    name: file.split(".")[0],
                    compiler: Compiler
                });
            });
        }
    });
};

let watchers = () => {
    fs.watch(settingsPath, function (event, filename) {
        console.log('event is: ' + event);
        if (filename) {
            console.log('filename provided: ' + filename);
            changesettings();
        } else {
            console.log('filename not provided');
        }
    });
    fs.watch(settings.awake, function (event, filename) {
        console.log('event is: ' + event);
        if (filename) {
            console.log('filename provided: ' + filename);
            changeawake();
        } else {
            console.log('filename not provided');
        }
    });
    fs.watch(settings.start, function (event, filename) {
        console.log('event is: ' + event);
        if (filename) {
            console.log('filename provided: ' + filename);
            changesend();
        } else {
            console.log('filename not provided');
        }
    });
};

let changeweb = (callback) => {
    fs.readFile(filePath, "utf8", function(err, data){
        if(err) throw err;
        var d = data;
        var i = 0;
        var result = [];
        for(x in compilers)
        {
            var pattern = new RegExp('<' + compilers[x].name + '[\\s\\S]*?' + compilers[x].name + '>', 'igm');
            d = d.replace(pattern, function(x){i++;return `<span id="${i}"></span>`});
        }
        for(x in compilers)
        {
            let pattern = new RegExp('<' + compilers[x].name + '[\\s\\S]*?' + compilers[x].name + '>', 'igm');
            var a = data.match(pattern);
            for(code in a)
            {
                a[code] = strip_html_tags(a[code]);
            }
            result = a;
        }
        callback(result, d);
    });
};

let changeawake = () => {
    fs.readFile(settings.awake || __dirname + "/awake.html", "utf8", function(err, data){
        if(err) throw err;
        awake = data;
    });
};

let changesend = () => {
    fs.readFile(settings.start, "utf8", function(err, data){
        if(err) throw err;
        send = data;
    });
};

let changesettings = (callback) => {
    fs.readFile(settingsPath, "utf8", function(err, data){
        if(err) throw err;
        settings = JSON.parse(data);
        callback();
    });
};

let connectors = () => {
    app.get('/', (req, res) => {
        res.send(awake);
    });
    io.on('connection', (socket) => {
        var url = socket.request.headers.referer;
        url = getParam("path", url);
        if(url)
        {
            filePath = pagePath + '/' + url;
        }
        else
        {
            filePath = pagePath + '/' + (Args[0] || settings.mainPage);
        }
        if (fs.existsSync(filePath)) {
            Servmarl(socket);
            socket.on("disconnect", () => {
                console.log(settings.clientDisconnect);
            });
        }
        else
        {
            socket.emit("loadPage", settings.error404);
        }
    }); 
};

let Servmarl = (socket) => {
    socket.emit("loadPage", send);
    changeweb((result, obv) => {
        console.log(settings.clientConnection);
        socket.emit("loadPage", obv);
        for(code in result)
        {
            let coderes = '';
            let f = parseInt(code) + 1;
            let print = function(value, s)
            {
                if(s == socket)
                {
                    socket.emit("noderesult", {
                        id:f,
                        send:value
                    });
                    coderes += value;
                }
            };
            let printed = function(s){
                if(s == socket)
                {
                    return coderes;
                }
            };
            let runc = function(str, callback){
                socket.emit("get", str);
                socket.on("get", function(x){callback(x);});
            };
            let run = function(str){
                socket.emit("set", str);
            };
            for(x in compilers)
            {
                new compilers[x].compiler('socket', 'print', 'printed', 'runc', 'run',result[code])(socket, print, printed, runc, run);
            }
        }
    });
};

let strip_html_tags = (str) => {
    if ((str===null) || (str===''))
       return false;
    else
        str = str.toString();
    return str.replace(/<[^>]*>/g, '');
};

let getParam = (name, url) => {
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( url );
    return results == null ? null : results[1];
};

changesettings(() => {
    changeawake();
    changesend();
    watchers();
    connectors();
    configurator();
});