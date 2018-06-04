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
import {ActivatedRoute, Router} from '@angular/router';
import {AuthService} from '../services/auth.service';
import {TakeUntilDestroy, untilDestroyed} from 'ngx-take-until-destroy';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
@TakeUntilDestroy()
export class LoginComponent implements OnDestroy {
    loginStatus = LoginStatus.NOTHING;
    username = '';
    password = '';

    constructor(private authService: AuthService,
                private router: Router,
                private route: ActivatedRoute) {
    }

    doRedirect() {
        this.route.queryParamMap
            .pipe(untilDestroyed(this))
            .subscribe(map => {
                let redirect = '';
                if (map.has('redirect')) {
                    redirect = map.get('redirect');
                }
                console.log(`Redirecting to ${redirect}`);
                this.router.navigate([redirect]);
            });
    }

    ngOnDestroy() {
    }

    submit() {
        this.loginStatus = LoginStatus.WAITING;
        this.authService.login(this.username, this.password)
            .then(() => {
                this.loginStatus = LoginStatus.NOTHING;
                this.doRedirect();
            }).catch(() => this.loginStatus = LoginStatus.FAILED);
    }
}

enum LoginStatus {
    FAILED = 'failed',
    NOTHING = '',
    WAITING = 'waiting'
}
