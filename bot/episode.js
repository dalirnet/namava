const fs = require("fs");
const request = require("request-promise");
const _ = require("lodash");
const httpHeader = {
    "User-Agent": "Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via bot https://github.com/dalirnet/namava)"
};
//
let episode = {
    mediaPerSet: 20,
    mainPath: "./build/media/list/",
    url: "https://www.namava.ir/api/v1.0/medias/seasons/{{seasonId}}/episodes",
    all() {
        fs.readdir(episode.mainPath, function (err, folders) {
            if (!err) {
                let mediaSet = _.chunk(folders, episode.mediaPerSet);
                mediaSet.forEach((set, key) => {
                    setTimeout(() => {
                        set.forEach((folder) => {
                            episode.get(folder);
                        });
                    }, key * 2000);
                });
            }
        });
    },
    get(mediaId) {
        fs.readFile(episode.mainPath + mediaId + "/details.js", "utf8", (err, mediaDetails) => {
            if (!err) {
                let mediaObject = JSON.parse(mediaDetails);
                if (!_.isEmpty(mediaObject)) {
                    console.log("media [" + mediaId + "]");
                    mediaObject.seasons.forEach((season) => {
                        fs.readFile(episode.mainPath + mediaId + "/" + season.id + ".js", "utf8", (_err, seasonDetails) => {
                            if (!_err) {
                                let seasonObject = JSON.parse(seasonDetails);
                                if (!_.isEmpty(seasonObject)) {
                                    console.log("media [" + mediaId + "] season [" + season.id + "]");
                                    request({
                                        uri: encodeURI(_.replace(episode.url, "{{seasonId}}", season.id)),
                                        headers: httpHeader,
                                        json: true
                                    }).then((jsonList) => {
                                        if (jsonList.succeeded) {
                                            seasonObject.lastUpdate = new Date();
                                            seasonObject.episodes = [];
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
                                                console.log("media [" + mediaId + "] season [" + season.id + "] - episodes");
                                            });
                                        }
                                    }).catch((err) => {
                                        console.log("[ERROR]media [" + mediaId + "] season [" + season.id + "] - " + err.message);
                                    });
                                } else {
                                    console.log("[ERROR]media [" + mediaId + "] season [" + season.id + "] - content");
                                }
                            }
                            else {
                                console.log("[ERROR]media [" + mediaId + "] season [" + season.id + "] - " + err.message);
                            }
                        });
                    });
                } else {
                    console.log("[ERROR]media [" + mediaId + "] - content");
                }
            } else {
                console.log("[ERROR]media [" + mediaId + "] - " + err.message);
            }
        });
    }
};
module.exports = episode;