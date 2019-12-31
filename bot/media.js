const fs = require("fs");
const request = require("request-promise");
const _ = require("lodash");
const httpHeader = {
    "User-Agent": "Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via bot https://github.com/dalirnet/namava)"
};
//
let media = {
    itemsPerPage: 30,
    mainPath: "./build/media/list/",
    data: {
        lastUpdate: new Date(),
        list: []
    },
    url: {
        list: "https://www.namava.ir/api/v1.0/medias/latest-series?pi={{page}}&ps={{itemsPerPage}}",
        seasons: "https://www.namava.ir/api/v1.0/medias/{{itemId}}/single-series",
    },
    get(page = 1) {
        console.log("page [" + page + "]");
        request({
            uri: encodeURI(_.replace(_.replace(media.url.list, "{{itemsPerPage}}", media.itemsPerPage), "{{page}}", page)),
            headers: httpHeader,
            json: true
        }).then((jsonList) => {
            if (jsonList.succeeded) {
                _.forEach(jsonList.result, function (mediaItem) {
                    console.log("page [" + page + "] - media [" + mediaItem.id + "]");
                    request({
                        uri: encodeURI(_.replace(media.url.seasons, "{{itemId}}", mediaItem.id)),
                        headers: httpHeader,
                        json: true
                    }).then((jsonItem) => {
                        if (jsonItem.succeeded) {
                            let mediaDetails = {
                                lastUpdate: new Date(),
                                id: mediaItem.id,
                                name: mediaItem.caption,
                                image: mediaItem.imageUrl,
                                seasons: []
                            };
                            if (!fs.existsSync(media.mainPath + mediaItem.id)) {
                                fs.mkdirSync(media.mainPath + mediaItem.id);
                            }
                            _.forEach(jsonItem.result.seasons, function (seasonItem) {
                                fs.writeFile(media.mainPath + mediaItem.id + "/" + seasonItem.seasonId + ".js", JSON.stringify({
                                    lastUpdate: new Date(),
                                    id: seasonItem.seasonId,
                                    name: seasonItem.seasonName,
                                    episodes: []
                                }), "utf8", () => {
                                    console.log("page [" + page + "] - media [" + mediaItem.id + "] - season [" + seasonItem.seasonId + "]");
                                });
                                mediaDetails.seasons.push({
                                    id: seasonItem.seasonId,
                                    name: seasonItem.seasonName
                                });
                            });
                            fs.writeFile(media.mainPath + mediaItem.id + "/details.js", JSON.stringify(mediaDetails), "utf8", () => {
                                console.log("page [" + page + "] - media [" + mediaItem.id + "] - seasons");
                            });
                        }
                    }).catch((err) => {
                        console.log("[ERROR]page [" + page + "] - media [" + mediaItem.id + "] - " + err.message);
                    });
                    media.data.list.push({
                        id: mediaItem.id,
                        name: mediaItem.caption,
                        image: mediaItem.imageUrl
                    });
                });
                if (jsonList.result.length == media.itemsPerPage) {
                    setTimeout(() => {
                        media.get(page + 1);
                    }, 2000);
                } else {
                    media.put();
                }
            }
        }).catch((err) => {
            console.log("[ERROR]page [" + page + "] - " + err.message);
        });
    },
    put() {
        if (media.data.list.length) {
            fs.writeFile("./build/media/list.js", JSON.stringify(media.data), "utf8", () => {
                console.log("[" + media.data.list.length + "] media written");
            });
        } else {
            console.log("[ERROR]no data to write");
        }
    }
};
module.exports = media;