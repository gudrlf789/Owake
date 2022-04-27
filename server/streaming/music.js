#!/usr/bin/env node

let spawn = require("child_process").spawn;
let net = require("net");
let lookup = require("lookup-multicast-dns");
let register = require("register-multicast-dns");
let fs = require("fs");
let minimist = require("minimist");
let toPort = require("hash-to-port");

let argv = minimist(process.argv.slice(2), {
    alias: { station: "s" },
    "--": true,
});
let port = argv.port || (argv.station ? toPort(argv.station) : 24242);
let name = "deejay-" + (argv.station || "default") + ".local";

if (argv._[0]) {
    let source = null;
    let server = net.createServer(function (socket) {
        if (!source) source = fs.createReadStream(argv._[0]);
        source.pipe(socket);
        socket.on("error", function (e) {
            console.log(e);
            socket.destroy();
        });
    });
    server.listen(port);
    register(name);
    connect("localhost");
} else {
    lookup(name, function onlookup(err, host) {
        if (err) return setTimeout(lookup.bind(null, name, onlookup), 1000);
        connect(host);
    });
}

function connect(host) {
    let socket = net.connect(port, host);
    let proc = spawn("mplayer", [].concat(argv["--"] || []).concat("-"), {
        stdio: [null, "inherit", "inherit"],
    });
    socket.pipe(proc.stdin);
    proc.on("error", function () {
        console.error(
            "mplayer is required (brew install mplayer / apt-get install mplayer)"
        );
        process.exit(1);
    });
    proc.on("exit", function (code) {
        process.exit(code);
    });
}
