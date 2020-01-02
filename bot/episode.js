const fs = require("fs");
const moment = require("moment");
const cliProgress = require("cli-progress");
const progressPreset = require("./cliProgressPreset");
const cliTable = require("cli-table");
const colors = require("colors");
const request = require("request-promise");
const _ = require("lodash");
// set var
const httpHeader = {
    "User-Agent": "Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via bot https://github.com/dalirnet/namava)"
};
const progressBar = new cliProgress.MultiBar(progressPreset);
const mediaSetStatus = progressBar.create(1, 0);
mediaSetStatus.update(null, {
    title: "Media Set"
});
const mediaEpisodeStatus = progressBar.create(1, 0);
mediaEpisodeStatus.update(null, {
    title: "Media Episode",
    row: ""
});
const table = new cliTable({
    colWidths: [6, 100]
});
// module
let episode = {
    mediaPerSet: 10,
    mainPath: "./build/media/list/",
    url: "https://www.namava.ir/api/v1.0/medias/seasons/{{seasonId}}/episodes",
    get(id = null) {
        fs.readdir(episode.mainPath, async (err, folders) => {
            let errors = [];
            let success = 0;
            if (!err) {
                if (!_.isNull(id)) {
                    folders = [id];
                }
                mediaSetStatus.setTotal(folders.length);
                for (const folder of folders) {
                    mediaSetStatus.increment(1);
                    await episode.media(folder).then(() => {
                        success++;
                    }).catch((error) => {
                        errors.push("Media '" + folder + "' " + error);
                    });
                }
            } else {
                errors.push(err.message);
            }
            progressBar.stop();
            table.push([colors.green("OK"), "'" + success + "' Media[s] Updated"]);
            for (const error of errors) {
                table.push([colors.red("ERR"), error]);
            }
            console.log(table.toString());
        });
    },
    media(mediaId) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                fs.readFile(episode.mainPath + mediaId + "/details.js", "utf8", async (err, mediaDetails) => {
                    if (!err) {
                        let mediaObject = JSON.parse(mediaDetails);
                        if (!_.isEmpty(mediaObject)) {
                            mediaEpisodeStatus.setTotal(mediaObject.seasons.length);
                            mediaEpisodeStatus.update(0, {
                                title: "Media " + mediaId,
                                row: mediaId + "m"
                            });
                            for (const season of mediaObject.seasons) {
                                await new Promise((_resolve, _reject) => {
                                    let seasonObject = {
                                        lastUpdate: moment().format("YYYY-MM-DD HH:mm:ss"),
                                        id: season.id,
                                        name: season.name,
                                        episodes: []
                                    };
                                    request({
                                        uri: encodeURI(_.replace(episode.url, "{{seasonId}}", season.id)),
                                        headers: httpHeader,
                                        json: true
                                    }).then((jsonList) => {
                                        if (jsonList.succeeded) {
                                            _.forEach(jsonList.result, function (episodeItem) {
                                                seasonObject.episodes.push({
                                                    id: episodeItem.id,
                                                    name: episodeItem.caption,
                                                    image: episodeItem.imageUrl,
                                                    story: episodeItem.shortDescription,
                                                    duration: episodeItem.mediaDuration
                                                });
                                            });
                                            fs.writeFile(episode.mainPath + mediaId + "/" + season.id + ".js", JSON.stringify(seasonObject), "utf8", () => {
                                                mediaEpisodeStatus.increment(1, {
                                                    row: season.id + "e"
                                                });
                                                _resolve();
                                            });
                                        }
                                    }).catch((e) => {
                                        reject("Http Error");
                                    });
                                });
                            };
                            resolve();
                        } else {
                            reject("Json Error");
                        }
                    } else {
                        reject("File Error");
                    }
                });
            }, 50);
        });
    }
};
module.exports = episode;