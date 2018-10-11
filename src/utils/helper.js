'use strict';

const Bcrypt = require('bcryptjs');

module.exports.hash = (word) => {

    return new Promise((resolve, reject) => {

        Bcrypt.hash(word, 8, (err, hash) => {

            if (err) {
                reject(err);
            }
            else {
                resolve(hash);
            }
        });
    });
};

module.exports.compare = (word, hash) => {

    return new Promise((resolve, reject) => {

        Bcrypt.compare(word, hash, (err, res) => {

            if (err) {
                reject(err);
            }
            else {
                resolve(res);
            }
        });
    });
};
