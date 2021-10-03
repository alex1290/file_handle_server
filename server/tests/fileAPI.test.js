const request = require("supertest");
const app = require("../app");
const fs = require('fs');
const fsPromises = fs.promises;


const testUploadPath = __dirname + '/testFile';
const notExistedPath = __dirname + '/notExistedPath';

describe('GET /file/{localSystemFilePath}', () => {
    test("Return binary stream to client, if query is applied.", async () => {
        const response = await request(app)
            .get(`/file/${__filename}`)
            .responseType('blob')
            .expect(200);
        const fileData = await fsPromises.readFile(__filename);
        expect(response.body).toStrictEqual(fileData);
    });

    test("No query result matched, should return HTTP code not found.", async () => {
        await request(app).get(`/file/${notExistedPath}`).expect(404);
    });

    test("If the request target is directory. Return json content as bellow, if query is applied.", async () => {
        const files = await fsPromises.readdir(`${__dirname}/testFolder`);
        const response = await request(app)
            .get(`/file/${__dirname}/testFolder`)
            .expect('Content-Type', /json/)
            .expect(200);
        expect(response.text).toStrictEqual(JSON.stringify({
            isDirectory: true,
            files
        }));
    });

    const orderBy = ["lastModified", "size", "fileName"];
    const orderByDirection = ["Descending", "Ascending"];

    // The expect answer for request
    const expectAnswers = [["c34", "b23", "a12"], ["a12", "b23", "c34"], ["c34", "b23", "a12"]];

    orderBy.forEach((orderByType, index) => {
        orderByDirection.forEach((direction) => {
            test(`Request order by ${orderByType} and order direction is ${direction}`, async () => {
                const response = await request(app)
                    .get(`/file/${__dirname}/testFolder?orderBy=${orderByType}&orderByDirection=${direction}`)
                    .expect('Content-Type', /json/)
                    .expect(200);

                const answer = direction === "Descending" ? expectAnswers[index] : expectAnswers[index].reverse();

                expect(response.text).toStrictEqual(JSON.stringify({
                    isDirectory: true,
                    files: answer
                }));
            });
        })
    })
});

describe('POST /file/{localSystemFilePath}', () => {
    test("To create a file in specified {localSystemFilePath}, client will send a binary form data with form key [file].", async () => {
        const fileData = await fsPromises.readFile(__filename);
        await request(app)
            .post(`/file/${testUploadPath}`)
            .attach('file', fileData, 'testFile')
            .expect(200);
    });

    test("if file existed not allow to operate.", async () => {
        const fileData = await fsPromises.readFile(__filename);
        await request(app)
            .post(`/file/${testUploadPath}`)
            .attach('file', fileData, 'testFile')
            .expect(400);
    });
});

describe('PATCH /file/{localSystemFilePath}', () => {
    test("To update file in specified {localSystemFilePath}, client will send a binary form data with form key [file].", async () => {
        const fileData = await fsPromises.readFile(__filename);
        await request(app)
            .patch(`/file/${testUploadPath}`)
            .attach('file', fileData, 'testFile')
            .expect(200);
    });

    test("Only allow to operate with existed file.", async () => {
        const fileData = await fsPromises.readFile(__filename);
        await request(app)
            .patch(`/file/${notExistedPath}`)
            .attach('file', fileData, 'testFile')
            .expect(400);
    });
});

describe('DELETE /file/{localSystemFilePath}', () => {
    test("To delete file in specified {localSystemFilePath}.", async () => {
        await request(app)
            .delete(`/file/${testUploadPath}`)
            .expect(200);
    });
})