"use strict";!function r(i,o,s){function d(a,e){if(!o[a]){if(!i[a]){var t="function"==typeof require&&require;if(!e&&t)return t(a,!0);if(c)return c(a,!0);throw new Error("Cannot find module '"+a+"'")}var n=o[a]={exports:{}};i[a][0].call(n.exports,function(e){var t=i[a][1][e];return d(t||e)},n,n.exports,r,i,o,s)}return o[a].exports}for(var c="function"==typeof require&&require,e=0;e<s.length;e++)d(s[e]);return d}({1:[function(e,t,a){$(document).ready(function(){var o={data:{},number:function(e,t){var a=1<arguments.length&&void 0!==t?t:"fa",n={fa:["۰","۱","۲","۳","۴","۵","۶","۷","۸","۹"],en:["0","1","2","3","4","5","6","7","8","9"]};if(e=e.toString(),"fa"==a){for(var r=0;r<10;r++)e=e.replace(new RegExp(n.en[r],"g"),n.fa[r]);return e}for(r=0;r<10;r++)e=e.replace(new RegExp(n.fa[r],"g"),n.en[r]);return e.toString()},mediaTemplate:$("#mediaTemplate").html(),template:function(){Mustache.parse(o.mediaTemplate),o.render(),$("#list").on("click",".watchAction",function(e){"watch"==$(e.currentTarget).attr("data-type")?o.watch.add($(e.currentTarget).attr("data-id"),e.currentTarget):o.watch.remove($(e.currentTarget).attr("data-id"),e.currentTarget),iziToast.show({message:["وضعیت","' "+$(e.currentTarget).attr("data-name")+" '","آپدیت شد"].join(" ")})}).on("click",".updateMediaAction",function(e){o.addMedia($(e.currentTarget).attr("data-id"))}).on("click",".removeMediaAction",function(e){o.removeMedia($(e.currentTarget).attr("data-id"))}).on("click",".watchAllAction",function(e){$(e.currentTarget).parents(".seasonEpisodes").find(".episodeItem").each(function(e,t){o.watch.add($(t).attr("data-id"),t)})})},render:function(){$("#list").html("");var i=o.watch.list();store.forEach(function(e,t){if("M"==e.charAt(0)){var a=0,n=0,r={media:{id:t.id,name:t.name,image:t.image,allSeasons:0,allEpisodes:0},seasons:$.map(t.seasons,function(t){return a++,{id:t.id,name:t.name,episodes:$.map(t.episodes,function(e){return n++,{id:e.id,name:e.name.replace(t.name,"").trim(),new:-1!==$.inArray(e.id,i),duration:o.number(e.duration)}})}})};r.media.allSeasons=o.number(a),r.media.allEpisodes=o.number(n),$("#list").append(Mustache.render(o.mediaTemplate,r))}})},watch:{list:function(){return store.get("W",[])},add:function(e,t){var a,n,r=1<arguments.length&&void 0!==t?t:null;store.set("W",(a=store.get("W",[]),n=e,a.push(Number(n)),$.unique(a))),r&&$(r).attr("data-type","unwatch").find(".icon").removeClass("has-text-link").addClass("has-text-success").find(".icon-new").removeClass("icon-new").addClass("icon-check")},remove:function(e,t){var a,n,r=1<arguments.length&&void 0!==t?t:null;store.set("W",(a=store.get("W",[]),n=e,$.grep(a,function(e){return Number(n)!=e}))),r&&$(r).attr("data-type","watch").find(".icon").removeClass("has-text-success").addClass("has-text-link").find(".icon-check").removeClass("icon-check").addClass("icon-new")}},addMedia:function(r){$.getJSON("media/list/"+r+"/details.js?"+Math.floor(Date.now()/1e3/21600),function(a){var n=[];$.each(a.seasons,function(e,t){$.getJSON("media/list/"+r+"/"+t.id+".js?"+Math.floor(Date.now()/1e3/21600),function(e){o.addSeasson(r,e),n.push(!0),n.length==a.seasons.length&&o.render()})})})},removeMedia:function(e){store.remove("M-"+e),o.render()},addSeasson:function(e,t){var a;store.set("M-"+e,((a=store.get("M-"+e,{id:e,name:o.data[e].name,image:o.data[e].image,seasons:{}})).seasons[t.id]={id:t.id,name:t.name,episodes:$.map(t.episodes,function(e){return{id:e.id,name:e.name,duration:e.duration}})},a)),iziToast.show({message:["' "+t.name+" '","آپدیت شد"].join(" ")})}};o.template(),iziToast.settings({theme:"dark",position:"bottomCenter",pauseOnHover:!1,progressBar:!1,animateInside:!1,rtl:!0}),$.ajaxSetup({error:function(){iziToast.show({message:"خطا تو ارتباط با سرور!"})}}),$.getJSON("media/list.js?"+Math.floor(Date.now()/1e3/21600),function(e){$.each(e.list,function(e,t){o.data[t.id]=t}),$("#search").select2({placeholder:"' جستجو کنید '",multiple:!0,dir:"rtl",width:"1%",data:$.map(o.data,function(e){return{id:e.id,text:e.name}}),maximumSelectionLength:1,minimumInputLength:2,language:{noResults:function(){return"بدون نتیجه!"},maximumSelected:function(){return"فقط یک انتخاب!"},inputTooShort:function(){return"برای جستجو حداقل دو حرف لازمه!"}}}).on("select2:select",function(e){o.addMedia(e.params.data.id),$(".select2-container-active").removeClass("select2-container-active"),$(":focus").blur()}).on("select2:opening",function(){$("#search").val(null).trigger("change")})})})},{}]},{},[1]);