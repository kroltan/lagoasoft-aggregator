/**
 * Could not find any decent SE API clients for node,
 * so I made this ridiculously minimal wrapper.
 * Does not support authentication directly.
 */

const url = require("url");
const request = require("request");

const API_BASE = "https://api.stackexchange.com/2.2/";

/**
 * Fills an endpoint-format string
 * Supports SE API vectorized parameters very naively.
 * @param {string} endpoint - Format to fill
 * @param {Object} values - Replacement mapping, arrays are
 *     converted to vectorized params.
 * @return {string} All values replaced, missng keys
 *     not modified.
 */
function formatEndpoint(endpoint, values) {
    return endpoint.replace(/{(.+?)}/g, (match, i) => {
        let arg = values[match.substring(1, match.length - 1)];
        let value = arg;
        if (typeof(arg) == 'undefined') {
            value = match;
        } else if (arg instanceof Array) {
            value = arg.join(";");
        }
        return encodeURIComponent(value);
    });
}

function get(endpoint, values, params) {
    let filled_endpoint = formatEndpoint(endpoint, values);
    let uri = url.resolve(API_BASE, filled_endpoint);
    return new Promise((resolve, reject) => {
        request.get({
            url: uri,
            qs: params,
            json: true,
            gzip: true
        }, function(err, res, body) {
            if (err) {
                reject(err);
            } else {
                resolve(body);
            }
        });
    });
}

module.exports = {get};
