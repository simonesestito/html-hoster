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

/**
 * Detects if current device is a mobile device
 * @returns {boolean}
 */
export function isMobile(): boolean {
    return /iPhone|iPad|iPod|Android/.test(navigator.userAgent);
}

export function detectPrefix(fileList: FileList): string {
    if (fileList.length < 2) {
        return '';
    }
    // The first dir in file path
    const suspect = filePath(fileList[0]).split('/')[0];
    let success = true;
    Array.from(fileList).forEach(file => {
        // Check if every file has the same prefix
       if (filePath(file).split('/')[0] !== suspect) {
           success = false;
       }
    });
    if (!success) {
        // If not every file has the same prefix, return empty
        return '';
    } else {
        // Else, return the detected prefix
        return suspect;
    }
}

/**
 * Return the file path, without a given prefix
 * Useful in webkitDirectory upload
 * @param {File} file
 * @param {string} prefix to remove
 * @returns {string} resulting file path
 */
export function filePath(file: File, prefix?: string) {
    const path = file.webkitRelativePath || `/${file.name}`;
    if (path.startsWith(prefix)) {
        return path.substr(prefix.length);
    } else {
        return path;
    }
}
