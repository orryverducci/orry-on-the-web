import * as Turbo from "@hotwired/turbo";
import { Application } from "@hotwired/stimulus";
import figlet from "figlet";
import standard from "figlet/importable-fonts/Standard.js";

figlet.parseFont('Standard', standard);

figlet.text("Hello!", { font: "Standard" }, function(err, data) {
    if (err) {
        console.error(err);
        return;
    }
    console.info(data);
    console.info("I see you there, poking around the code ;)");
    console.info("Want to see the source code for this site? Head over to https://github.com/orryverducci/orry-on-the-web");
});

const application = Application.start();
