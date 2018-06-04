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

const tmp = require('tmp-promise');
const mime = require('mime');
const index = require('../index');
const firebase = index.firebase;

const handleProvide = (resource, projectId, res) => {
    console.log('Providing project: ' + projectId);

    let file;
    let fileDir;

    firebase.firestore()
        .doc('projects/' + projectId)
        .get()
        .then(doc => {
            // Get owner ID from Project ID
            // If needed, get the main filename too
            if (!doc.exists)
                throw new Error('Invalid Project ID');

            const owner = doc.data().owner;
            if (resource === '')
                resource = doc.data().mainFilename;

            fileDir = 'projects/' +
                owner + '/' +
                projectId + '/' +
                resource;

            console.log('Requested resource: ' + resource);
            return tmp.file();
        }).then(f => {
            // Create a temporary file to save 
            // the file from Firebase
            // before sending it back to the client
            file = f;
            console.log('Local file: ' + f.path);

            return firebase.storage()
                .bucket()
                .file(fileDir)
                .download({
                    destination: file.path
                });
        }).then(() => {
            // Get the mimetype (based on the file extension)
            // then send the file to the client
            console.log('Downloaded.');
            const type = mime.getType(fileDir);
            console.log('Detected as ' + type);
            res.sendFile(file.path, {
                headers: {
                    'Content-Type': type
                }
            });
            console.log('File sent.\n\n');
        }).catch(err => {
            res.send(err.message);
            if (file !== undefined)
                file.cleanup();
            console.log(err);
        });
};

module.exports = handleProvide;
