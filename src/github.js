"use strict";
let GitHub = require("github");

module.exports = new GitHub({
    protocol: "https",
    host: "api.github.com",
    headers: {
        "User-Agent": "kroltan/lagoasoft-aggregator"
    }
});
