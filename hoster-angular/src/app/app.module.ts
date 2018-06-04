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

import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {RouterModule} from '@angular/router';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './material/material.module';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {AuthActivate} from './services/auth-activate.service';
import {AngularFireModule} from 'angularfire2';
import {environment} from '../environments/environment';
import {AngularFireAuthModule} from 'angularfire2/auth';
import {FormsModule} from '@angular/forms';
import {ProjectViewComponent} from './project-view/project-view.component';
import {AngularFirestoreModule} from 'angularfire2/firestore';
import {AngularFireStorageModule} from 'angularfire2/storage';
import {CreationDialogComponent} from './home/creation-dialog/creation-dialog.component';
import {FileDropAreaComponent} from './project-view/file-drop-area/file-drop-area.component';
import {HttpClientModule} from '@angular/common/http';

const routes = [
    {path: '', component: HomeComponent, canActivate: [AuthActivate]},
    {path: 'login', component: LoginComponent, canActivate: [AuthActivate]},
    {path: 'projects/:id', component: ProjectViewComponent, canActivate: [AuthActivate]}
];

@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        LoginComponent,
        ProjectViewComponent,
        CreationDialogComponent,
        FileDropAreaComponent,
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        MaterialModule,
        RouterModule.forRoot(routes),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        AngularFirestoreModule,
        AngularFireStorageModule,
        FormsModule,
        HttpClientModule
    ],
    entryComponents: [
        CreationDialogComponent,
    ],
    providers: [AuthActivate],
    bootstrap: [AppComponent]
})
export class AppModule {
}
