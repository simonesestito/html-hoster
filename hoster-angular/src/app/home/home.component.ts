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

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Project} from '../model/project';
import {AuthService} from '../services/auth.service';
import {ProjectService} from '../services/project.service';
import {MatDialog} from '@angular/material';
import {CreationDialogComponent} from './creation-dialog/creation-dialog.component';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
    email: string = null;
    projects: Project[] = null;

    constructor(private authService: AuthService,
                private router: Router,
                private projectService: ProjectService,
                private dialog: MatDialog) {
    }

    ngOnInit() {
        this.authService.currentUser()
            .then(user => this.email = user.email);
        this.getProjects().then(projects => {
            this.projects = projects.sort((a, b) => {
                const aTime = a.lastEditDate.getTime();
                const bTime = b.lastEditDate.getTime();
                return aTime > bTime ? -1
                    : aTime === bTime ? 0
                        : +1;
            });
        });
    }

    onProjectClick(project) {
        return this.router.navigate(['projects', project.id]);
    }

    getProjects(): Promise<Project[]> {
        return this.authService.currentUser().then(user => {
            return this.projectService.getProjectsByUserId(user.id);
        });
    }

    onNewProject() {
        // Display dialog
        this.dialog.open(CreationDialogComponent);
    }

    format(date: Date): string {
        const day = date.getDate();
        const month = date.getMonth() + 1;
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    }
}
