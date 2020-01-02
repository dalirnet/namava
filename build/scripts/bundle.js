(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
$(document).ready(() => {
    var list = [];
    $.getJSON("media/list.js", (data) => {
        $.each(data.list, (key, val) => {
            list.push({
                id: val.id,
                text: val.name
            });
        });
        $("#search").select2({
            placeholder: "جستجو تو همه سریال های نماوا",
            multiple: true,
            dir: "rtl",
            width: "100%",
            data: list,
            maximumSelectionLength: 1,
            minimumInputLength: 2,
            language: {
                noResults: function () {
                    return "بدون نتیجه!";
                },
                maximumSelected: function () {
                    return "فقط یک انتخاب!";
                },
                inputTooShort: function () {
                    return "حداقل دو حرف!";
                },
            }
        });
    });
});
},{}]},{},[1])