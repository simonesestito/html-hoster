# HTML Hoster
The platform where to host HTML projects.

It supports HTML, CSS, JS and any type of static resource.

## Project structure

**[functions](functions)**: the Firebase Cloud Functions, like deleting the project files on project deletion.

**[viewer](viewer-node)**: the nodejs backend that runs on the viewer subdomain, like project files deployment and zipping.

**[hoster](hoster-angular)**: the Angular app where you can manage your hosted projects

## Main technologies used
- Firebase (Firestore, Storage, Auth, Cloud Functions, Admin)
- Angular 6 with Typescript
- Node.JS
- Express

## License

    Copyright 2018 Simone Sestito

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.
    You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
