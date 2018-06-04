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

import {Component, ElementRef, EventEmitter, Output, ViewChild} from '@angular/core';
import {isMobile} from '../../utils';

@Component({
    selector: 'app-file-drop-area',
    templateUrl: './file-drop-area.component.html',
    styleUrls: ['./file-drop-area.component.scss']
})
export class FileDropAreaComponent {
    readonly isMobile: boolean;
    @Output() uploaded: EventEmitter<FileList> = new EventEmitter();
    @ViewChild('fileInput') fileInput: ElementRef;
    @ViewChild('mobileFileInput') mobileFileInput: ElementRef;

    constructor() {
        this.isMobile = isMobile();
    }

    onDropClick() {
        if (this.isMobile) {
            this.mobileFileInput.nativeElement.click();
        } else {
            this.fileInput.nativeElement.click();
        }
    }

    onFileSelected($event) {
        const dir = $event.target.files;
        this.uploaded.emit(dir);
    }
}
