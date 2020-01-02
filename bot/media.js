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
const mediaPageStatus = progressBar.create(1, 0);
mediaPageStatus.update(null, {
    title: "Media Page"
});
const mediaItemStatus = progressBar.create(1, 0);
mediaItemStatus.update(null, {
    title: "Media Item",
    row: ""
});
const table = new cliTable({
    colWidths: [6, 100]
});
// module
let media = {
    itemsPerPage: 10,
    mainPath: "./build/media/list/",
    data: {
        lastUpdate: moment().format("YYYY-MM-DD HH:mm:ss"),
        list: []
    },
    url: {
        total: "https://www.namava.ir/api2/search/advanced?type=series&count=1",
        list: "https://www.namava.ir/api/v1.0/medias/latest-series?pi={{page}}&ps={{itemsPerPage}}",
        seasons: "https://www.namava.ir/api/v1.0/medias/{{itemId}}/single-series",
    },
    async get() {
        let errors = [];
        let success = 0;
        let totel = await request({
            uri: encodeURI(media.url.total),
            headers: httpHeader,
            json: true
        }).then((json) => {
            return json.total;
        }).catch(() => {
            return false;
        });
        if (totel > 1) {
            let allPage = Math.ceil(totel / media.itemsPerPage);
            mediaPageStatus.setTotal(allPage);
            mediaItemStatus.setTotal(totel);
            for (let page = 1; page <= allPage; page++) {
                mediaPageStatus.increment(1);
                await media.page(page).then((itemsStatus = []) => {
                    let errorItems = [];
                    for (const item of itemsStatus) {
                        if (item.status) {
                            success++;
                        } else {
                            errorItems.push(colors.gray(item.id));
                        }
                    }
                    if (errorItems.length) {
                        errors.push("Page '" + colors.gray(page) + "' - ['" + colors.gray(errorItems.length) + "'] Item[s]  Error");
                    }
                    for (const itemError of _.chunk(errorItems, 7)) {
                        errors.push("Media[s] '" + itemError.join("','") + "' Error");
                    }
                }).catch((error) => {
                    errors.push("Page '" + colors.gray(page) + "' " + error);
                });
            }

        } else {
            errors.push("Total Error");
        }
        progressBar.stop();
        table.push([colors.green("OK"), "'" + colors.gray(success) + "' Media[s] Readed"]);
        if (media.data.list.length) {
            fs.writeFileSync("./build/media/list.js", JSON.stringify(media.data), "utf8");
            table.push([colors.green("OK"), "'" + colors.gray(media.data.list.length) + "' Media[s] Written"]);
        }
        for (const error of errors) {
            table.push([colors.red("ERR"), error]);
        }
        console.log(table.toString());
    },
    page(page = 1) {
        return new Promise((resolve, reject) => {
            request({
                uri: encodeURI(_.replace(_.replace(media.url.list, "{{itemsPerPage}}", media.itemsPerPage), "{{page}}", page)),
                headers: httpHeader,
                json: true
            }).then((mediaList) => {
                if (mediaList.succeeded) {
                    let promise = [];
                    for (const mediaItem of mediaList.result) {
                        promise.push(media.item(mediaItem, promise.length));
                    }
                    Promise.all(promise).then((itemsStatus) => {
                        resolve(itemsStatus);
                    });
                } else {
                    reject("Content Error");
                }
            }).catch((e) => {
                reject("Http Error");
            });
        });
    },
    item(mediaItem, index = 0) {
        return new Promise((resolve) => {
            setTimeout(() => {
                request({
                    uri: encodeURI(_.replace(media.url.seasons, "{{itemId}}", mediaItem.id)),
                    headers: httpHeader,
                    json: true
                }).then((json) => {
                    if (json.succeeded && _.size(json.result)) {
                        let mediaDetails = {
                            lastUpdate: moment().format("YYYY-MM-DD HH:mm:ss"),
                            id: mediaItem.id,
                            name: mediaItem.caption,
                            image: mediaItem.imageUrl,
                            seasons: []
                        };
                        if (!fs.existsSync(media.mainPath + mediaItem.id)) {
                            fs.mkdirSync(media.mainPath + mediaItem.id);
                        }
                        for (const seasonItem of json.result.seasons) {
                            mediaDetails.seasons.push({
                                id: seasonItem.seasonId,
                                name: seasonItem.seasonName
                            });
                        }
                        fs.writeFile(media.mainPath + mediaItem.id + "/details.js", JSON.stringify(mediaDetails), "utf8", () => {
                            media.data.list.push({
                                id: mediaItem.id,
                                name: mediaItem.caption,
                                image: mediaItem.imageUrl
                            });
                            resolve({
                                id: mediaItem.id,
                                status: true
                            });
                        });
                    } else {
                        resolve({
                            id: mediaItem.id + "c",
                            status: false
                        });
                    }
                }).catch((e) => {
                    resolve({
                        id: mediaItem.id + "h",
                        status: false
                    });
                }).finally(() => {
                    mediaItemStatus.increment(1, {
                        row: mediaItem.id + "m"
                    });
                });
            }, (index) * 50);
        });
    }
};
module.exports = media;