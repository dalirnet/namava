const figlet = require("figlet");
const request = require("request-promise");
const _ = require("lodash");
const args = require("minimist")(process.argv.slice(2), {
    alias: {
        a: "action"
    },
    default: {
        action: "media" // episode
    }
});


figlet("NAMAVA - " + args.action, (err, data) => {
    if (!err) {
        console.log(data);
    }
});