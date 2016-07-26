"use strict";

const express = require("express");
const Promise = require("bluebird");

const github = require("../src/github");
const stackexchange = require("../src/stackexchange");

let router = express.Router();

github.authenticate({
    type: "oauth",
    token: process.env.GITHUB_API_TOKEN
});

function findStackUsers(name, amount) {
    return stackexchange.get("/users", {}, {
        site: "stackoverflow",
        pagesize: amount,
        sort: "reputation",
        order: "desc",

        inname: name
    }).then(data => data.items);
}

function findGithubUsers(name, amount) {
    return Promise.promisify(github.search.users)({
        q: name,
        per_page: amount
    }).then(result => Promise.all(
        result.items.map(user =>
            github.users.getById({id: user.id}))
    ));
}

/**
 * Given a list of users from GitHub and StackExchange,
 * attempts to find a very strongly correlated user,
 * which is almost surely the same person.
 * @param {Object[]} stack - Array of StackExchange users
 * @param {Object[]} github - Array of GitHub users
 * @return {Object} An object containing the SE and GH users
 *     under the keys `"stackexchange"` and `"github"`,
 *     respectively. If no matching user pair is found,
 *     `null` is returned.
 */
function userCompareNames(stack, github) {
    for (let i = stack.length - 1; i >= 0; i--) {
        let se_user = stack[i];
        let se_display_name = se_user.display_name.toLowerCase();
        let se_url_name = se_user.link.toLowerCase().split("/").pop();

        for (var j = github.length - 1; j >= 0; j--) {
            let gh_user = github[j];

            if (gh_user.login === se_display_name
                || gh_user.login === se_url_name) {

                return {
                    stack: se_user,
                    github: gh_user
                };
            }
        }
    }
    return null;
}

function normalizeStackexchangeUser(user) {
    return {
        name: user.display_name,
        picture: user.profile_image,
        profile_link: user.link,
        website: user.website_url,
        meaningful_value:
            user.reputation + " rep, "
            + user.accept_rate + "% accept rate",
        location: user.location
    };
}

function normalizeGithubUser(user) {
    return {
        name: user.login,
        picture: user.avatar_url,
        profile_link: user.html_url,
        website: user.blog,
        meaningful_value:
            user.followers + " followers, "
            + user.public_repos + " public repositories",
        location: user.location
    };
}

router.get('/', (req, res) => {
    const result_count = 5;
    let name = req.query.name.trim().toLowerCase();
    Promise.join(
        findStackUsers(name, result_count),
        findGithubUsers(name, result_count),
        (stack, github) => ({stack, github})
    )
    .then(data => {
        let best_match = userCompareNames(data.stack, data.github);
        return res.send({
            best_match: best_match? {
                stackexchange: normalizeStackexchangeUser(best_match.stack),
                github: normalizeGithubUser(best_match.github)
            } : null,
            stackexchange: data.stack.map(normalizeStackexchangeUser),
            github: data.github.map(normalizeGithubUser)
        });
    });
});

module.exports = router;
