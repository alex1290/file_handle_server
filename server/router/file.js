const express = require('express');

const fs = require('fs');
const fsPromises = fs.promises;

const { parsePath } = require('../utils/parsePath');

const getFileOrFolderFilesList = async (req, res) => {
    const { path, query } = req;
    const localSystemFilePath = parsePath(path);
    try {
        const stat = await fsPromises.stat(localSystemFilePath);

        // if localSystemFilePath is file, return binary of the file
        if (stat.isFile()) {
            const filename = localSystemFilePath.split("/").pop();
            const data = await fsPromises.readFile(localSystemFilePath);
            res.writeHead(200, {
                'Content-disposition': 'attachment;filename=' + filename,
                'Content-Length': data.length
            });
            res.end(Buffer.from(data, 'binary'));
        }
        
        // if localSystemFilePath is folder, return folder files
        if (stat.isDirectory()) {
            /**
             * @param {string} orderBy support enum[lastModified, size, fileName]
             * @param {string} orderByDirection support enum[Descending , Ascending]
             * @param {string} filterByName support file name filter which only shows the results contains filter string in ignore case condition
             */
            const { orderBy, orderByDirection, filterByName } = query;

            let result = await fsPromises.readdir(localSystemFilePath);
            const { sortFileWithOrderBy, filterFileName } = require('../utils/fileListHandle');

            result = filterFileName(result, filterByName);
            result = await sortFileWithOrderBy(localSystemFilePath, result, orderBy, orderByDirection);

            const response = {
                isDirectory: true,
                files: result
            };

            res.json(response);
        }
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
}

const uploadFile = async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No files were uploaded.');
    }

    const { file } = req.files;
    const localSystemFilePath = parsePath(req.path);

    // check the existence of the file
    try {
        await fsPromises.access(localSystemFilePath);
        // if file existed not operate
        console.log("File is existed");
        res.status(400).send("File is existed");
    } catch (error) {
        console.log(`Upload new file to ${localSystemFilePath}`);
        // if not exist, create new file
        file.mv(localSystemFilePath, err => {
            if (err)
                return res.status(500).send(err);
            return res.send('File uploaded');
        })
    }
}

const updateFile = async (req, res) => {
    if (!req.files || !req.files.file) {
        return res.status(400).send('No files were uploaded.');
    }

    const { file } = req.files;
    const localSystemFilePath = parsePath(req.path);

    // check the existence of the file
    try {
        await fsPromises.access(localSystemFilePath);
        // if file existed, update the file
        file.mv(localSystemFilePath, err => {
            if (err)
                return res.status(500).send(err);
            console.log("File is updated!");
            return res.send('File updated!');
        });
    } catch (error) {
        // if not exist not operate
        console.log(`The file is not existed`);
        res.status(400).send("The file is not existed");
    }
}

const deleteFile = async (req, res) => {
    const localSystemFilePath = parsePath(req.path);
    try {
        await fsPromises.unlink(localSystemFilePath);
        res.sendStatus(200);
    } catch (error) {
        console.log(error);
        res.sendStatus(400);
    }
}

module.exports.getFileRouter = () => {
    const router = express.Router();
    router.get('/*', getFileOrFolderFilesList);
    router.post('/*', uploadFile);
    router.patch('/*', updateFile);
    router.delete('/*', deleteFile);
    return router;
};