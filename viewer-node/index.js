/*
 * Copyright (C) 2018 Simone Sestito
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

const admin = require('firebase-admin');
const account = require('./secret/firebase.json');
const firebase = admin.initializeApp({
    credential: admin.credential.cert(account),
    databaseURL: 'https://html-hoster-41acf.firebaseio.com',
    storageBucket: 'html-hoster-41acf.appspot.com'
});

const express = require('express');
const app = express();

module.exports = {
    firebase: firebase
};

const handleDownload = require('./src/zip');
const handleProvide = require('./src/provider');
const resetProject = require('./src/reset');

const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Credentials': false,
    'Access-Control-Allow-Headers': 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Authorization'
};

/**
 * Respond to OPTIONS request first
 */
app.options('/*', (req, res) => {
    res.writeHead(200, headers);
    res.end();
});

/**
 * Add CORS headers before every GET request
 */
app.get('/*', (req, res, next) => {
    for (let key in headers) {
        res.header(key, headers[key]);
    }
    next();
});

app.get('/favicon.ico', (req, res) => res.send(''));

/**
 * Return the entire project as a zip file
 */
app.get('/zip/:id', (req, res) => handleDownload(req.params.id, res));

/**
 * Reset all project files
 */
app.get('/reset/:projId', (req, res) => {
    const projId = req.params.projId;
    const authToken = req.headers.authorization;
    resetProject(projId, authToken, res);
});

/**
 * Provide a specific file project
 */
app.get('/:projId/*', (req, res) => {
    let resource = req.path
        .split('/')
        .slice(2)
        .join('/');
    const projectId = req.params.projId;
    handleProvide(resource, projectId, res);
});
app.get('/:projId', (req, res) => res.redirect(301, req.path + '/'));

/**
 * Start the server
 */
app.listen(80, () => console.log('Started'));
