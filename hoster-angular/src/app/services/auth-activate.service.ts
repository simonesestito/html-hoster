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
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';

@Injectable()
export class AuthActivate implements CanActivate {

    constructor(private authService: AuthService,
                private router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authService.isLogged().then(logged => {
            const activationResult = this.handle(state.url, logged);
            return Promise.resolve(activationResult);
        });
    }

    handle(url: string, logged: boolean): boolean {
        if (url.startsWith('/login')) {
            return this.handleLogin(logged);
        } else {
            return this.handlePage(url, logged);
        }
    }

    handleLogin(logged: boolean): boolean {
        console.log('Handling login activation');
        if (logged) {
            this.router.navigate(['']);
        }
        return !logged;
    }

    handlePage(url: string, logged: boolean) {
        console.log(`Handling URL ${url}`);
        if (!logged) {
            this.router.navigate(['login'],
                {
                    queryParams: {
                        redirect: url
                    }
                });
        }
        return logged;
    }
}
