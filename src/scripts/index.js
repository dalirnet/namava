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