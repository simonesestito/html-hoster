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

const index = require('../index');
const tmp = require('tmp-promise');
const archiver = require('archiver');
const fs = require('fs');
const path = require('path');
const shell = require('shelljs');
const firebase = index.firebase;

const touch = (file) => {
	const dir = path.dirname(file);
	if (!fs.existsSync(dir))
		shell.mkdir('-p', dir);
	fs.writeFileSync(file);
};

const handleDownload = (projId, res) => {
	let dir;

	tmp.dir().then(d => {
        // Get project document from Firestore
		dir = d;
		return	firebase.firestore()
			.doc('projects/' + projId)
			.get()
	.then(doc => {
        // Check project existence
		if (!doc.exists)
			throw new Error('Invalid Project ID');
		const owner = doc.data().owner;

        // Return firebase Storage files references
		return firebase.storage()
			.bucket()
			.getFiles({
				prefix: 'projects/' + owner + '/' + projId
			});
	}).then(result => {
        // Exclude folders from result files
		const files = [];
		result[0].forEach(i => { 
			if (!i.name.endsWith('/'))
				files.push(i.name);
		});
		return files;
	}).then(files => {
        // Download each file
		const promises = files.map(f => {
			const resource = f.split('/').slice(3).join('/');
			const dest = dir.path + '/' + resource;
			touch(dest);	
			return firebase.storage()
				.bucket()
				.file(f)
				.download({
					destination: dest
				});
		});
		return Promise.all(promises);
	}).then(() => {
        // If all files downloaded successfully
        // Zip all of them and send to the client
		console.log('Zipping: ' + dir.path);
        const zip = archiver('zip');
        zip.on('error', err => {
            console.error(err);
            res.status(500)
                .send({
                    error: err.message
                });
        });
        res.attachment('project-' + projId + '.zip');
		zip.pipe(res);
		zip.directory(dir.path, false);
		zip.finalize();
	}).catch(err => {
		shell.rm('-rf', dir.path);
		console.error(err);
		res.send(err.message);
	});
})};

module.exports = handleDownload;