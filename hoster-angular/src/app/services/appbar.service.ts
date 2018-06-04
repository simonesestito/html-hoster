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
import {BehaviorSubject, Observable} from 'rxjs';
import {NavigationEnd, Router} from '@angular/router';
import {filter, map} from 'rxjs/operators';
import {Title} from '@angular/platform-browser';

const defaultTitle = 'HtmlHoster';

@Injectable({
    providedIn: 'root'
})
export class AppbarService {
    currentRoute: Observable<string>;
    private titleSubject = new BehaviorSubject('HtmlHoster');

    constructor(router: Router, private titleService: Title) {
        this.currentRoute = router.events
            .pipe(
                filter(value => value instanceof NavigationEnd),
                map(value => (<NavigationEnd>value).url.toString().split('?')[0])
            );
    }

    /**
     * Observe the current title
     * @returns an Observable which notifies the subscriber each time the title changes
     */
    getTitle(): Observable<string> {
        return this.titleSubject;
    }

    /**
     * Set the appbar title
     * Notifies each subscriber
     * @param title New title to set
     */
    setTitle(title: string) {
        if (title == null) {
            title = defaultTitle;
        }
        this.titleSubject.next(title);
        this.titleService.setTitle(title);
    }
}
