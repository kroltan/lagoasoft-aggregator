"use strict";
const angular = require("angular");

let components = angular.module("components", []);

components.component("searchBar", {
    templateUrl: "/templates/search-bar.html",
    bindings: {
        query: "=",
        onSubmit: "&"
    },
});

components.component("userCard", {
    templateUrl: "/templates/user-card.html",
    bindings: {
        user: "<"
    }
});

module.exports = "components";
