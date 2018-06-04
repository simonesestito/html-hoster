"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const app = admin.initializeApp(functions.config().firebase);
/**
 * Delete project files on Firestore project document deletion
 */
exports.deleteFiles = functions.firestore
    .document('projects/{projId}')
    .onDelete((snap, context) => {
    const projId = context.params.projId;
    const userId = snap.data().owner;
    return app.storage()
        .bucket()
        .deleteFiles({
        prefix: `projects/${userId}/${projId}`
    });
});
//# sourceMappingURL=index.js.map