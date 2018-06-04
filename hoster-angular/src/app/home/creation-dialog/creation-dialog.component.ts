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

import {Component} from '@angular/core';
import {MatDialogRef} from '@angular/material';
import {ProjectService} from '../../services/project.service';
import {Router} from '@angular/router';

@Component({
    selector: 'app-creation-dialog',
    templateUrl: './creation-dialog.component.html',
    styleUrls: ['./creation-dialog.component.scss']
})
export class CreationDialogComponent {
    projectName = '';
    isLoading = false;
    error = '';

    constructor(private dialogRef: MatDialogRef<CreationDialogComponent>,
                private projectService: ProjectService,
                private router: Router) {
    }

    onProjectCreation() {
        this.isLoading = true;
        console.log(`Creating project ${this.projectName}`);
        this.dialogRef.disableClose = true;

        this.projectService.createNewProject(this.projectName)
            .then(proj => {
                // Redirect to new project page
                this.dialogRef.close();
                return this.router.navigate(['projects', proj.id]);
            }).catch(err => {
                // @formatter:off
                console.error(err);
                this.isLoading = false;
                this.dialogRef.disableClose = false;
                if (err.message !== undefined) {
                    this.error = err.message;
                } else {
                    this.error = err.toString();
                }
                // @formatter:on
        });
    }
}
