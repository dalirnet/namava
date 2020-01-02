const fs = require("fs");
const figlet = require("figlet");
const args = require("minimist")(process.argv.slice(2), {
    alias: {
        a: "action",
        i: "id",
    },
    default: {
        action: "media", // or episode
        id: null, // or id
    }
});
//
figlet("N A M A V A - " + args.action.charAt(0).toUpperCase(), (err, data) => {
    if (!err) {
        console.log(data);
    }
    if (!fs.existsSync("./build/media/")) {
        fs.mkdirSync("./build/media/");
    }
    if (!fs.existsSync("./build/media/list/")) {
        fs.mkdirSync("./build/media/list/");
    }
    if (args.action == "media") {
        const media = require("./media.js");
        media.get();
    }
    if (args.action == "episode") {
        const episode = require("./episode.js");
        episode.get(args.id);
    }
});