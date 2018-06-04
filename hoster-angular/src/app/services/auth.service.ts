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

import {Injectable, OnDestroy} from '@angular/core';
import {AngularFireAuth} from 'angularfire2/auth';
import {User} from '../model/user';
import {User as FirebaseUser} from 'firebase';
import {Unsubscribe} from 'firebase';
import {BehaviorSubject, Observable} from 'rxjs';
import {filter, map} from 'rxjs/operators';
import {TakeUntilDestroy, untilDestroyed} from 'ngx-take-until-destroy';

@Injectable({
    providedIn: 'root'
})
@TakeUntilDestroy()
export class AuthService implements OnDestroy {
    private authState = new BehaviorSubject(AuthState.WAITING);
    private user: FirebaseUser;
    private readonly unsubscribe: Unsubscribe;

    constructor(private auth: AngularFireAuth) {
        this.unsubscribe = this.auth.auth.onAuthStateChanged(user => {
            // Update authState based on FirebaseAuth callback
            this.authState.next(user == null ? AuthState.NOT_LOGGED : AuthState.LOGGED);
            this.user = user;
        });
    }

    ngOnDestroy() {
        this.unsubscribe();
    }

    /**
     * Login with username/email and password
     * @param username User's email address
     * @param password User's password
     * @returns Promise, fulfilled on login completion
     */
    public login(username: string, password: string): Promise<any> {
        return this.auth.auth.signInWithEmailAndPassword(username, password);
    }

    /**
     * Know if the current user is logged in or not
     * @returns Promise true if user is logged in
     */
    public isLogged(): Promise<boolean> {
        return new Promise<boolean>((res) => {
            this.authState
                .pipe(
                    // Call observable callback only if not in Waiting state
                    filter(val => val !== AuthState.WAITING),
                    untilDestroyed(this)
                )
                .subscribe(val => {
                    // Return true if state is logged
                    res(val === AuthState.LOGGED);
                });
        });
    }

    /**
     * Get current Firebase access token
     * @returns refreshed access token
     */
    public getAccessToken(): Promise<string> {
        return this.auth.auth.currentUser.getIdToken(true);
    }

    /** Listen on the authState Observable to get notified about auth state changes
     * @returns Observable
     */
    public onLoginChanged(): Observable<User | null> {
        return this.authState
            .pipe(
                filter(val => val !== AuthState.WAITING),
                map(val => {
                    if (val === AuthState.NOT_LOGGED) {
                        return null;
                    }

                    const firebaseUser = this.auth.auth.currentUser;
                    return User.fromFirebaseUser(firebaseUser);
                })
            );
    }

    /**
     * Retrieve the current logged user
     * @returns the current user or null
     */
    public currentUser(): Promise<User | null> {
        return this.isLogged()
            .then(logged => {
                if (logged) {
                    const user = new User();
                    user.id = this.user.uid;
                    user.email = this.user.email;
                    return Promise.resolve(user);
                } else {
                    return Promise.resolve(null);
                }
            });
    }

    /**
     * Logout and redirect to the homepage
     */
    public logout(): Promise<void> {
        return this.auth.auth.signOut();
    }
}

export enum AuthState {
    WAITING,
    LOGGED,
    NOT_LOGGED
}
