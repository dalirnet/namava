(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$(document).ready(() => {
    const action = {
        data: {},
        number(input, type = "fa") {
            let map = {
                fa: ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"],
                en: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"]
            };
            input = input.toString();
            if (type == "fa") {
                for (var i = 0; i < 10; i++) {
                    input = input.replace(new RegExp(map.en[i], "g"), map.fa[i]);
                }
                return input;
            } else {
                for (var i = 0; i < 10; i++) {
                    input = input.replace(new RegExp(map.fa[i], "g"), map.en[i]);
                }
                return input.toString();
            }
        },
        mediaTemplate: $("#mediaTemplate").html(),
        template() {
            Mustache.parse(action.mediaTemplate);
            action.render();
            $("#list").on("click", ".watchAction", (e) => {
                if ($(e.currentTarget).attr("data-type") == "watch") {
                    action.watch.add($(e.currentTarget).attr("data-id"), e.currentTarget);
                } else {
                    action.watch.remove($(e.currentTarget).attr("data-id"), e.currentTarget);
                }
                iziToast.show({
                    message: ["وضعیت", "' " + $(e.currentTarget).attr("data-name") + " '", "آپدیت شد"].join(" ")
                });
            }).on("click", ".updateMediaAction", (e) => {
                action.addMedia($(e.currentTarget).attr("data-id"));
            }).on("click", ".removeMediaAction", (e) => {
                action.removeMedia($(e.currentTarget).attr("data-id"));
            }).on("click", ".watchAllAction", (e) => {
                $(e.currentTarget).parents(".seasonEpisodes").find(".episodeItem").each((key, value) => {
                    action.watch.add($(value).attr("data-id"), value);
                });
            });
        },
        render() {
            $("#list").html("");
            let watch = action.watch.list();
            store.forEach((key, object) => {
                if (key.charAt(0) == "M") {
                    let allSeasons = 0;
                    let allEpisodes = 0;
                    let template = {
                        media: {
                            id: object.id,
                            name: object.name,
                            image: object.image,
                            allSeasons: 0,
                            allEpisodes: 0
                        },
                        seasons: $.map(object.seasons, (season) => {
                            allSeasons++;
                            return {
                                id: season.id,
                                name: season.name,
                                lastUpdate: (typeof (season.lastUpdate) != "undefined" ? action.number(season.lastUpdate) : ""),
                                episodes: $.map(season.episodes, (episode) => {
                                    allEpisodes++;
                                    return {
                                        id: episode.id,
                                        name: episode.name.replace(season.name, "").trim(),
                                        new: ($.inArray(episode.id, watch) !== -1),
                                        duration: action.number(episode.duration)
                                    }
                                })
                            }
                        })
                    }
                    template.media.allSeasons = action.number(allSeasons);
                    template.media.allEpisodes = action.number(allEpisodes);
                    $("#list").append(Mustache.render(action.mediaTemplate, template));
                }
            });
        },
        watch: {
            list() {
                return store.get("W", []);
            },
            add(episodeId, el = null) {
                store.set("W", ((current, episodeId) => {
                    current.push(Number(episodeId));
                    return $.unique(current);
                })(store.get("W", []), episodeId));
                if (el) {
                    $(el).attr("data-type", "unwatch")
                        .find(".icon").removeClass("has-text-link").addClass("has-text-success")
                        .find(".icon-new").removeClass("icon-new").addClass("icon-check");
                }
            },
            remove(episodeId, el = null) {
                store.set("W", ((current, episodeId) => {
                    return $.grep(current, (item) => {
                        if (Number(episodeId) == item) {
                            return false;
                        }
                        return true;
                    });
                })(store.get("W", []), episodeId));
                if (el) {
                    $(el).attr("data-type", "watch")
                        .find(".icon").removeClass("has-text-success").addClass("has-text-link")
                        .find(".icon-check").removeClass("icon-check").addClass("icon-new");
                }
            }
        },
        addMedia(id) {
            $.getJSON("media/list/" + id + "/details.js?" + Math.floor((Date.now() / 1000) / (86400 / 4)), (mediaData) => {
                let doRender = [];
                $.each(mediaData.seasons, (key, season) => {
                    $.getJSON("media/list/" + id + "/" + season.id + ".js?" + Math.floor((Date.now() / 1000) / (86400 / 4)), (seasonData) => {
                        action.addSeasson(id, seasonData);
                        doRender.push(true);
                        if (doRender.length == mediaData.seasons.length) {
                            action.render();
                        }
                    });
                });
            });
        },
        removeMedia(id) {
            store.remove("M-" + id);
            action.render();
        },
        addSeasson(mediaId, seasonData) {
            store.set("M-" + mediaId, ((current, seasonData) => {
                current["seasons"][seasonData.id] = {
                    id: seasonData.id,
                    name: seasonData.name,
                    lastUpdate: seasonData.lastUpdate,
                    episodes: $.map(seasonData.episodes, (episode) => {
                        return {
                            id: episode.id,
                            name: episode.name,
                            duration: episode.duration
                        }
                    })
                };
                return current;
            })(store.get("M-" + mediaId, {
                id: mediaId,
                name: action.data[mediaId].name,
                image: action.data[mediaId].image,
                seasons: {}
            }), seasonData));
            iziToast.show({
                message: ["' " + seasonData.name + " '", "آپدیت شد"].join(" ")
            });
        }
    };
    action.template();
    iziToast.settings({
        theme: "dark",
        position: "bottomCenter",
        pauseOnHover: false,
        progressBar: false,
        animateInside: false,
        rtl: true
    })
    $.ajaxSetup({
        error() {
            iziToast.show({
                message: 'خطا تو ارتباط با سرور!'
            });
        }
    });
    $.getJSON("media/list.js?" + Math.floor((Date.now() / 1000) / (86400 / 4)), (data) => {
        $.each(data.list, (key, val) => {
            action.data[val.id] = val;
        });
        $("#search").select2({
            placeholder: "' جستجو کنید '",
            multiple: true,
            dir: "rtl",
            width: "1%",
            data: $.map(action.data, (object) => {
                return {
                    id: object.id,
                    text: object.name
                }
            }),
            maximumSelectionLength: 1,
            minimumInputLength: 2,
            language: {
                noResults: () => {
                    return "بدون نتیجه!";
                },
                maximumSelected: () => {
                    return "فقط یک انتخاب!";
                },
                inputTooShort: () => {
                    return "برای جستجو حداقل دو حرف لازمه!";
                },
            }
        }).on("select2:select", (e) => {
            action.addMedia(e.params.data.id);
            $(".select2-container-active").removeClass("select2-container-active");
            $(":focus").blur();
        }).on("select2:opening", () => {
            $("#search").val(null).trigger("change");
        });
    });
});
},{}]},{},[1])