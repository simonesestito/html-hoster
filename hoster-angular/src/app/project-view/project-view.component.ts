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

import {Component, OnDestroy, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {AppbarService} from '../services/appbar.service';
import {ProjectService} from '../services/project.service';
import {Project} from '../model/project';
import {TakeUntilDestroy, untilDestroyed} from 'ngx-take-until-destroy';
import {MatDialog, MatSnackBar} from '@angular/material';
import {BACKEND_URL, SNACKBAR_ERROR_DURATION, SNACKBAR_NORMAL_DURATION} from '../constants';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';

@Component({
    selector: 'app-project-view',
    templateUrl: './project-view.component.html',
    styleUrls: ['./project-view.component.scss']
})
@TakeUntilDestroy()
export class ProjectViewComponent implements OnInit, OnDestroy {
    project: Project = null;
    loading = false;

    // storage upload variables
    uploading = false;
    totalFiles: number;
    loadedFiles: number;

    constructor(private route: ActivatedRoute,
                private appbar: AppbarService,
                private projectService: ProjectService,
                private router: Router,
                private snackbar: MatSnackBar,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        this.route.paramMap
            .pipe(untilDestroyed(this))
            .subscribe(map => {
                const id = map.get('id');
                this.projectService.getProjectById(id)
                    .then(proj => {
                        this.project = proj;
                        this.appbar.setTitle(this.project.name);
                    });
            });
    }

    saveChanges() {
        if (!this.project.name || !this.project.mainFilename) {
            return Promise.reject('Invalid project data');
        }

        // Update appbar title
        this.appbar.setTitle(this.project.name);

        console.log('Saving changes...');
        this.loading = true;
        return this.projectService.updateProject(this.project)
            .then(() => {
                this.loading = false;
                return Promise.resolve();
            }).catch(err => {
                this.loading = false;
                this.snackbar.open(`Salvataggio negato: ${err.message}`, '', {
                    duration: 7_000
                });
                return this.router.navigate(['']);
            });
    }

    onDirectoryChosen(files) {
        console.log(files);
        this.totalFiles = files.length;
        this.loadedFiles = 0;
        this.uploading = true;
        this.projectService.updateFiles(this.project.id, files)
            .pipe(untilDestroyed(this))
            .subscribe(progress => {
                this.loadedFiles = progress;
            }, error => {
                this.snackbar.open(error.message || error, '', {
                    duration: SNACKBAR_ERROR_DURATION
                });
            }, () => {
                this.loadedFiles = this.totalFiles;
                this.uploading = false;
                this.snackbar.open('File aggiornati!', '', {
                    duration: SNACKBAR_NORMAL_DURATION,
                });
            });
    }

    openProject() {
        window.open(BACKEND_URL + '/' + this.project.id);
    }

    downloadProject() {
        window.open(BACKEND_URL + '/zip/' + this.project.id);
    }

    askDeleteProject() {
        // Ask for confirmation before deleting the project
        this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Eliminare il progetto?',
                message: 'Non sarà più possibile recuperarlo'
            }
        }).afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe(result => {
                // Only if the user confirmed, delete the project
                if (result === true) {
                    this.deleteProject();
                }
            });
    }

    askResetProject() {
        // Ask for confirmation before resetting the project
        this.dialog.open(ConfirmDialogComponent, {
            data: {
                title: 'Svuotare il progetto?',
                message: 'Non sarà più possibile recuperare i file ora presenti'
            }
        }).afterClosed()
            .pipe(untilDestroyed(this))
            .subscribe(result => {
                // Only if the user confirmed, reset the project
                if (result === true) {
                    this.resetProject();
                }
            });
    }

    ngOnDestroy() {
        this.appbar.setTitle(null);
    }

    private deleteProject() {
        this.loading = true;
        this.projectService.deleteProject(this.project.id)
            .then(() => {
                this.loading = false;
                // Hide loading and go back to home
                return this.router.navigate(['']);
            }).catch(err => {
            this.loading = false;
            console.error(err);
        });
    }

    private resetProject() {
        this.loading = true;
        this.projectService.resetProject(this.project.id).then(() => {
            this.loading = false;
            this.snackbar.open('Progetto reimpostato', '', {
                duration: SNACKBAR_NORMAL_DURATION
            });
            return this.router.navigate(['']);
        }).catch(err => {
            this.loading = false;
            this.snackbar.open(`Reset fallito: ${err.message}`, '', {
                duration: SNACKBAR_ERROR_DURATION
            });
        });
    }

}
