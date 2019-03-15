let vscode = require('vscode');
let RestClient = require('node-rest-client').Client;
let OAuth = require('oauth-1.0a');
let crypto  = require('crypto');

function getRelativePath(absFilePath) {
    return absFilePath.slice(vscode.workspace.rootPath.length);
}

function getFile(file, callback) {
    getData('file', file.fsPath, callback);
}

function getDirectory(directory, callback) {
    getData('directory', directory.fsPath, callback);
}

function buildOauthHeader() {
    let requiredSettings = ['netsuiteKey', 'netsuiteSecret', 'consumerToken', 'consumerSecret'];

    requiredSettings.forEach(element => {
        if (! vscode.workspace.getConfiguration('netSuiteUpload')[element]) {
            vscode.window.showInformationMessage('Settings ' + element + ' missed');
            return;
        }
    });

    let oauth = OAuth({
        consumer: {
            key: vscode.workspace.getConfiguration('netSuiteUpload')['consumerToken'],
            secret: vscode.workspace.getConfiguration('netSuiteUpload')['consumerSecret']
        },
        signature_method: 'HMAC-SHA1',
        hash_function: function(base_string, key) {
            return crypto.createHmac('sha1', key).update(base_string).digest('base64');
        }
    });
    let token = {
        key: vscode.workspace.getConfiguration('netSuiteUpload')['netsuiteKey'],
        secret: vscode.workspace.getConfiguration('netSuiteUpload')['netsuiteSecret']
    };
    let headerWithRealm = oauth.toHeader(oauth.authorize(
        {
            url: vscode.workspace.getConfiguration('netSuiteUpload')['restlet'], 
            method: 'POST' 
        }, token));
    headerWithRealm.Authorization += ', realm="' + vscode.workspace.getConfiguration('netSuiteUpload')['realm'] + '"';
    headerWithRealm['Content-Type'] = 'application/json';
    
    return headerWithRealm;
}

function getData(type, objectPath, callback) {
    var relativeName = getRelativePath(objectPath);
    
    var client = new RestClient();
    var args = {
        path: { name: relativeName },
        headers: {                
            "Content-Type": "application/json",
            "Authorization": vscode.workspace.getConfiguration('netSuiteUpload')['authentication']
        }
    };

    let baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload')['restlet'];
    if (!args.headers.Authorization) {
        args.headers = buildOauthHeader();
    }

    client.get(baseRestletURL + '&type=' + type + '&name=${name}', args, function (data) {
        callback(data);
    });
}

function postFile(path, content, callback) {
    postData('file', path, content, callback);
}

function postData(type, objectPath, content, callback) {
    var relativeName = getRelativePath(objectPath);
    
    var client = new RestClient();
    var args = {
        headers: {                
            "Content-Type": "application/json",
            "Authorization": vscode.workspace.getConfiguration('netSuiteUpload')['authentication']
        },
        data: {
            type: 'file',
            name: relativeName,
            content: content
        }
    };

    let baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload')['restlet'];
    if (!args.headers.Authorization) {
        args.headers = buildOauthHeader();
    }

    client.post(baseRestletURL, args, function (data) {
        callback(data);
    });
}

function deleteFile(file, callback) {
    deletetData('file', file.fsPath, callback);
}

function deletetData(type, objectPath, callback) {
    var relativeName = getRelativePath(objectPath);
    
    var client = new RestClient();
    var args = {
        path: { name: relativeName },
        headers: {                
            "Content-Type": "application/json",
            "Authorization": vscode.workspace.getConfiguration('netSuiteUpload')['authentication']
        }
    };

    let baseRestletURL = vscode.workspace.getConfiguration('netSuiteUpload')['restlet'];
    if (!args.headers.Authorization) {
        args.headers = buildOauthHeader();
    }

    client.delete(baseRestletURL + '&type=' + type + '&name=${name}', args, function (data) {
        callback(data);
    });
}

exports.getRelativePath = getRelativePath;
exports.getFile = getFile;
exports.postFile = postFile;
exports.deleteFile = deleteFile;
exports.getDirectory = getDirectory;
