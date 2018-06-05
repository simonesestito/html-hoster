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

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

const app = admin.initializeApp(functions.config().firebase);

/**
 * Delete project files on Firestore project document deletion
 */
export const deleteFiles = functions.firestore
        .document('projects/{projId}')
        .onDelete((snap, context) => {
            const projId = context.params.projId;
            const userId = snap.data().owner;
            return app.storage()
                .bucket()
                .deleteFiles({
                    prefix: `projects/${userId}/${projId}`
                });
        });

/**
 * Delete all projects when the project owner account is deleted from Firebase
 */
export const deleteProjects = functions.auth.user().onDelete(user => {
    const userId = user.uid;
    return app.firestore()
        .collection('projects')
        .where('owner', '==', userId)
        .get()
        .then(snap => {
            const promises = [];
            snap.forEach(doc => {
                promises.push(doc.ref.delete());
            });
        return Promise.all(promises);
    });
});
