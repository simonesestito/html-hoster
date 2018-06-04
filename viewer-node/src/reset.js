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

const index = require('../index');
const firebase = index.firebase;

const resetProject = (projId, userToken, res) => {
    let owner, authUser;

    // Get Project document
    firebase.firestore()
        .doc('projects/' + projId)
        .get()
        .then(doc => {
            // Check its existence
            if (!doc.exists) {
                throw new Error('Invalid Project ID');
            }

            // Get project owner
            owner = doc.data().owner;

            // Verify provided access token
            // to avoid unwanted project deletion
            return firebase.auth()
                .verifyIdToken(userToken);
        }).then(user => {
            authUser = user;
            if (authUser.uid !== owner) {
                throw new Error('Not allowed');
            } else {
                return Promise.resolve();
            }
        }).catch(err => {
            // Authorization error
            res.status(403).send('Unauthorized: ' + err.message);
            return Promise.reject();
        }).then(() => {
            // Double check
            if (authUser.uid === owner) {
                // Delete all its files
                return firebase.storage()
                    .bucket()
                    .deleteFiles({
                        prefix: 'projects/' + owner + '/' + projId
                    });
            } else {
                throw new Error('Unauthorized');
            }
        })
        .then(() => res.send({}))
        .catch(err => {
            res.status(500).send(err.message || err)
            console.error(err);
        });
}

module.exports = resetProject;
