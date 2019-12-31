const fs = require("fs");
const request = require("request-promise");
const _ = require("lodash");
//
let media = {
    itemsPerPage: 30,
    data: {
        lastUpdate: new Date(),
        item: []
    },
    url: "https://www.namava.ir/api/v1.0/medias/latest-series?pi={{page}}&ps={{itemsPerPage}}",
    get(page = 1) {
        console.log("media page " + page + " start.");
        request({
            uri: encodeURI(_.replace(_.replace(media.url, "{{itemsPerPage}}", media.itemsPerPage), "{{page}}", page)),
            headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 5.1; rv:11.0) Gecko Firefox/11.0 (via bot https://github.com/dalirnet/namava)"
            },
            json: true
        }).then((json) => {
            if (json.succeeded) {
                _.forEach(json.result, function (mediaItem) {
                    media.data.item.push(mediaItem);
                });
                if (json.result.length == media.itemsPerPage) {
                    media.get(page + 1);
                } else {
                    media.put();
                }
            }
        }).catch((err) => {
            console.error(err.message);
        });
    },
    put() {
        if (media.data.item.length) {
            fs.writeFile("./build/scripts/media.js", JSON.stringify(media.data), "utf8", () => {
                console.log(media.data.item.length + " media written.");
            });
        } else {
            console.log("no data to write!");
        }
    }
};
module.exports = media;