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

import {Component, OnDestroy} from '@angular/core';
import {Router} from '@angular/router';
import {AppbarService} from './services/appbar.service';
import {AuthService} from './services/auth.service';
import {TakeUntilDestroy, untilDestroyed} from 'ngx-take-until-destroy';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
@TakeUntilDestroy()
export class AppComponent implements OnDestroy {
    title: string;
    logged: boolean;
    inLoginPage = false;

    constructor(private authService: AuthService,
                private router: Router,
                private appbarService: AppbarService) {
        this.authService.onLoginChanged()
            .pipe(untilDestroyed(this))
            .subscribe(user => {
                this.logged = user != null;
            });
        this.appbarService.currentRoute
            .pipe(untilDestroyed(this))
            .subscribe(event => {
            this.inLoginPage = event.startsWith('/login');
            console.log(event);
        });
        this.appbarService.getTitle()
            .pipe(untilDestroyed(this))
            .subscribe(title => this.title = title);
    }

    logout() {
        this.authService.logout()
            .then(() => {
                return this.router.navigate(['login']);
            });
    }

    ngOnDestroy() {
    }
}
