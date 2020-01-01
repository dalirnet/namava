module.exports = {
    format: (options, params, payload) => {
        let part = [
            " " + payload.title.padEnd(16, " "),
            options.barCompleteString.substr(0, Math.round(params.progress * options.barsize)).padEnd(options.barsize, "░"),
            (Math.round(params.value * 100 / params.total) + "﹪").padStart(5, " "),
            Math.round(params.value).toString().padStart(5, " "),
            "Of",
            Math.round(params.total).toString().padEnd(5, " "),
        ];
        if (typeof (payload.row) == "undefined") {
            part.push("Elapsed Time : '" + Math.round((Date.now() - params.startTime) / 1000) + "s'");
        } else {
            part.push("In Process   : '" + payload.row + "'");
        }
        return part.join(" ");
    },
    stopOnComplete: true,
    barCompleteChar: "█",
    hideCursor: true,
    fps: 10
};