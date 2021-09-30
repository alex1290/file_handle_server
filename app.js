const fs = require('fs');
const fsPromises = fs.promises;

const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();

const { port } = require('./config/config.json').server;

app.use(fileUpload());

app.route('/file*')
    .get(async (req, res) => {
        const { path, query } = req;
        const localSystemFilePath = path.substring(6);
        try {
            const stat = await fsPromises.stat(localSystemFilePath);

            if (stat.isFile()) {
                const filename = localSystemFilePath.split("/").pop();
                const data = await fsPromises.readFile(localSystemFilePath);
                res.writeHead(200, {
                    // 'Content-Type': mimetype,
                    'Content-disposition': 'attachment;filename=' + filename,
                    'Content-Length': data.length
                });
                res.end(Buffer.from(data, 'binary'));
            }

            if (stat.isDirectory()) {
                /**
                 * @param {string} orderBy support enum[lastModified, size, fileName]
                 * @param {string} orderByDirection support enum[Descending , Ascending]
                 * @param {string} filterByName support file name filter which only shows the results contains filter string in ignore case condition
                 */
                const { orderBy, orderByDirection, filterByName } = query;

                let result = await fsPromises.readdir(localSystemFilePath);
                const { sortFileWithOrderBy, filterFileName } = require('./utils/fileListHandle');

                result = filterFileName(result, filterByName);
                result = await sortFileWithOrderBy(localSystemFilePath, result, orderBy, orderByDirection);

                const response = {
                    isDirectory: true,
                    files: result
                };
                
                res.send(JSON.stringify(response));
            }
        } catch (error) {
            console.log(error);
            res.sendStatus(404);
        }
    })
    .post(async (req, res) => {
        if (!req.files || !req.files.file) {
            return res.status(400).send('No files were uploaded.');
        }

        const { file } = req.files;
        const localSystemFilePath = req.path.substring(6);

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
    })
    .patch(async (req, res) => {
        if (!req.files || !req.files.file) {
            return res.status(400).send('No files were uploaded.');
        }

        const { file } = req.files;
        const localSystemFilePath = req.path.substring(6);

        // check the existence of the file
        try {
            await fsPromises.access(localSystemFilePath);
            // if file existed, update the file
            console.log("File is existed");
            file.mv(localSystemFilePath, err => {
                if (err)
                    return res.status(500).send(err);
                res.send('File uploaded!');
            })
            res.send('File updated');
        } catch (error) {
            // if not exist not operate
            console.log(`The file is not existed`);
            res.status(400).send("File is not existed");
        }
    })
    .delete(async (req, res) => {
        const localSystemFilePath = req.path.substring(6);
        try {
            await fsPromises.unlink(localSystemFilePath);
            res.send('File deleted!');
        } catch (error) {
            console.log(error);
            res.sendStatus(400);
        }
    })

app.listen(port, () => {
    console.log(`start listen on port : ${port}`);
})