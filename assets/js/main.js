import $ from "./vendor/jquery-3.4.1.slim.min.js";

$(function() {
    $("#menu-icon").click(() => {
        $("header").toggleClass("menu-visible");
    });
});
