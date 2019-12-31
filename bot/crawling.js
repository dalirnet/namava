const figlet = require("figlet");
const args = require("minimist")(process.argv.slice(2), {
    alias: {
        a: "action"
    },
    default: {
        action: "media" // or episode
    }
});
const media = require("./media.js");
const episode = require("./episode.js");
//
figlet("N A M A V A - " + args.action, (err, data) => {
    if (!err) {
        console.log(data);
    }
    if (args.action == "media") {
        media.get();
    }
    if (args.action == "episode") {
        episode.get(4101);
    }
});