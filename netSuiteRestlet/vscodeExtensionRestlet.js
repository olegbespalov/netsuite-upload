/**
 * @NApiVersion 2.x
 * @NScriptType Restlet
 */
define(['N/file', 'N/search'], function (file, search) {
    
    function getFolderId(folderPath) {
        var foldersArray = folderPath.split('/');
        var folderName = foldersArray[foldersArray.length-1];
        
        var filters = [];
        filters.push({
            name: 'name',
            operator: 'is',
            values: [folderName]
        });
        if (foldersArray.length > 1) {
            var parentFolderArray = foldersArray.slice(-1);
            var parentString = parentFolderArray.join(' : ');

            filters.push({
                name: 'parent',
                operator: 'is',
                values: [parentString]
            }); 
        }
        
        var folderSearch = search.create({
            type: search.Type.FOLDER,
            filters: filters
        });

        var folderId = null;
        folderSearch.run().each(function(result) {
            folderId = result.id;
            return false;
        });

        return folderId;   
    }

    function getInnerFolders(folderPath, folderId) {
        var folderSearch = search.create({
            type: search.Type.FOLDER,
            columns: ['name'],
            filters: [{
                name: 'parent',
                operator: 'is',
                values: [folderId]
            }]
        });

        var innerFolders = [{
            id: folderId,
            path: folderPath
        }];
        folderSearch.run().each(function(result) {
            innerFolders = innerFolders.concat(getInnerFolders(folderPath + '/' + result.getValue('name'), result.id));
            return true;
        });
        return innerFolders;
    }

    function getFilesInFolder(folderPath, folderId) {
        var fileSearch = search.create({
            type: search.Type.FOLDER,
            columns: ['file.internalid', 'file.name'],
            filters: [{
                name: 'internalid',
                operator: 'is',
                values: [folderId]
            }]
        });
        
        var files = [];
        fileSearch.run().each(function(result) {
            var fileId = result.getValue({ name: 'internalid', join: 'file' });
            if (fileId) {
                var fileName = result.getValue({ name: 'name', join: 'file' });
                var fileContent = file.load({ id: fileId }).getContents();

                files.push({
                    name: fileName,
                    fullPath: folderPath + '/' + fileName,
                    content: fileContent
                });    
            }
            return true;
        });

        return files;
    }

    function getFile(relFilePath) {
        var fullFilePath = 'SuiteScripts' + relFilePath;
        
        var fileToReturn = file.load({
            id: fullFilePath
        });
        
        return [{
            name: fileToReturn.name,
            fullPath: fullFilePath,
            content: fileToReturn.getContents()
        }];
    }

    function getDirectory(relDirectoryPath) {
        var folderId = getFolderId('SuiteScripts' + relDirectoryPath);
        var folders = getInnerFolders(relDirectoryPath, folderId)
        var allFiles = [];
        
        folders.forEach(function(folder) {
            allFiles = allFiles.concat(getFilesInFolder(folder.path, folder.id));
        });
        return allFiles;
    }

    function get(request) {
        var type = request.type; // directory, file
        var relPath = request.name.split('\\').join('/');
        // TODO: fix request.name == EMPTY STRING

        if (type === 'file') {
            return getFile(relPath);
        }
        if (type === 'directory') {
            return getDirectory(relPath);
        }
    }

    return {
        get: get
    }
});