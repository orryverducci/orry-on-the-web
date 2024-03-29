import * as Turbo from "@hotwired/turbo";
import { Application } from "@hotwired/stimulus";
import * as figlet from "figlet";
// @ts-ignore
import standard from "figlet/importable-fonts/Standard.js";
import HeaderController from "./controllers/header_controller";
import Error404Controller from "./controllers/error404_controller";

figlet.parseFont("Standard", standard);

figlet.text("Hello!", { font: "Standard" }, function(err, data) {
    if (err) {
        console.error(err);
        return;
    }

    let figletText:string = `%c${data}`;
    let messageText:string = "\nI see you there, poking around the code ;)";
    messageText += "\nWant to see the source code for this site? Head over to https://github.com/orryverducci/orry-on-the-web";

    console.info(figletText, "color: #52c41a", messageText);
});

const turbo = Turbo.start();
const application:Application = Application.start();

application.register("header", HeaderController);
application.register("error404", Error404Controller);
