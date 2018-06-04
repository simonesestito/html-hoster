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

import * as firebase from 'firebase';
import DocumentSnapshot = firebase.firestore.DocumentSnapshot;

export class Project {
    id: string;
    name: string;
    owner: string;
    mainFilename: string;
    creationDate: Date;
    lastEditDate: Date; // It refers to files only

    static fromFirebaseSnapshot(snap: DocumentSnapshot): Project {
        const project = new Project();
        project.id = snap.id;
        project.name = snap.get('name');
        project.owner = snap.get('owner');
        project.mainFilename = snap.get('mainFilename');
        project.creationDate = new Date(snap.get('creationDate'));
        project.lastEditDate = new Date(snap.get('lastEditDate'));
        return project;
    }

    public toJson(): any {
        const result = JSON.parse(JSON.stringify(this));
        result.creationDate = this.creationDate.getTime();
        result.lastEditDate = this.lastEditDate.getTime();
        delete result.id;
        return result;
    }
}
