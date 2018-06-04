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

import {Injectable} from '@angular/core';
import {AngularFirestore} from 'angularfire2/firestore';
import {Project} from '../model/project';
import {AuthService} from './auth.service';
import {AngularFireStorage} from 'angularfire2/storage';
import {Observable} from 'rxjs';
import {detectPrefix, filePath} from '../utils';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {BACKEND_URL, DEFAULT_INDEX_CONTENT, DEFAULT_INDEX_NAME} from '../constants';

@Injectable({
    providedIn: 'root'
})
export class ProjectService {

    constructor(private db: AngularFirestore,
                private auth: AuthService,
                private storage: AngularFireStorage,
                private http: HttpClient) {
    }

    /**
     * Get all the projects by the owner ID
     * @param userId Owner ID
     * @returns All its projects
     */
    public getProjectsByUserId(userId: string): Promise<Project[]> {
        return this.db.collection('projects')
            .ref
            .where('owner', '==', userId)
            .get()
            .then(snap => {
                const projects = [];
                snap.forEach(doc => projects.push(Project.fromFirebaseSnapshot(doc)));
                return projects;
            });
    }

    /**
     * Get a project document from Firestore by ID
     * @param id Project ID
     * @returns Project document
     */
    public getProjectById(id: string): Promise<Project> {
        return this.db.doc(`projects/${id}`)
            .ref
            .get()
            .then(snap => {
                if (!snap.exists) {
                    throw Error(`Project ${id} not found`);
                }

                return Project.fromFirebaseSnapshot(snap);
            });
    }

    /**
     * Update a project in Firestore
     * It also updates the last edit record in the project
     * @param project Project object with updated fields
     */
    public updateProject(project: Project): Promise<void> {
        project.lastEditDate = new Date();
        return this.db.doc(`projects/${project.id}`)
            .update(project.toJson());
    }

    /**
     * Delete a project from the database by ID
     * @param id Project ID
     */
    public deleteProject(id: string): Promise<void> {
        // Delete only the document
        // Cloud Functions think about deleting project files
        return this.db.doc(`projects/${id}`).delete();
    }

    /**
     * Update project files
     * @param id Project ID
     * @param files FileList given by an event
     * @returns Observable to notify about how many uploads have finished successfully
     */
    public updateFiles(id: string, files: FileList): Observable<number> {
        return new Observable(observer => {
            this.auth.currentUser()
                .then(user => {
                    // Get current user
                    const owner = user.id;
                    let completed = 0;
                    const total = files.length;
                    const prefix = detectPrefix(files);
                    // Upload each file
                    for (let i = 0; i < total; i++) {
                        this.storage.ref(`projects/${owner}/${id}/${filePath(files[i], prefix)}`)
                            .put(files[i])
                            .then(() => {
                                // On file uploaded, update the caller
                                observer.next(++completed);
                                if (completed === total) {
                                    this.getProjectById(id).then(proj => this.updateProject(proj))
                                        .then(() => observer.complete());
                                }
                            }).catch(err => observer.error(err));
                    }
                });

        });
    }

    /**
     * Create and initialize a new project
     * @param name New project's name
     * @returns The new created project
     */
    public createNewProject(name: string): Promise<Project> {
        if (!name) {
            return Promise.reject('Il nuovo progetto deve avere un nome');
        }

        const now = new Date();
        const newProject = new Project();
        newProject.name = name;
        newProject.creationDate = now;
        newProject.lastEditDate = now;
        newProject.mainFilename = DEFAULT_INDEX_NAME;

        return this.auth.currentUser().then(user => {
            // (1) Get current user UID
            newProject.owner = user.id;
            return Promise.resolve();
        }).then(() => {
            // (2) Save new document
            return this.db.collection('projects')
                .add(newProject.toJson());
        }).then(docRef => {
            // (3) Get new project UID
            newProject.id = docRef.id;
            return Promise.resolve(docRef.id);
        }).then(() => {
            // (4) Upload default index.html file
            return this.storage.ref(`projects/${newProject.owner}/${newProject.id}/${newProject.mainFilename}`)
                .putString(DEFAULT_INDEX_CONTENT, 'raw', {
                    contentType: 'text/html'
                });
        }).then(() => {
            return Promise.resolve(newProject);
        });
    }

    /**
     * Reset a project
     * It deletes all the uploaded files, resets the main filename and uploads the default index file
     * It doesn't change the project ID or its creation date
     * @param id Project ID
     */
    public resetProject(id: string): Promise<void> {
        let userId;

        // Get access token
        return this.auth.getAccessToken().then(token => {
            // Delete all project files
            // calling backend REST method
            const headers = new HttpHeaders()
                .set('Authorization', token);
            console.log(headers);
            return this.http.get(`${BACKEND_URL}/reset/${id}`, {headers: headers}).toPromise();
        }).then(() => {
            // Get project document to alter mainFilename
            return this.getProjectById(id);
        }).then(proj => {
            userId = proj.owner;
            // Alter mainFilename
            proj.mainFilename = DEFAULT_INDEX_NAME;
            return this.updateProject(proj);
        }).then(() => {
            // Write default index.html file
            return this.storage.ref(`projects/${userId}/${id}/${DEFAULT_INDEX_NAME}`)
                .putString(DEFAULT_INDEX_CONTENT, 'raw', {
                    contentType: 'text/html'
                });
        }).then(() => Promise.resolve());
    }
}
