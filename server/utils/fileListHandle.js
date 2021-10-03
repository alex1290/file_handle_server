const { promisify } = require('util')
const fastFolderSize = require('fast-folder-size')
const fastFolderSizeAsync = promisify(fastFolderSize)
const fs = require('fs');
const fsPromises = fs.promises;

/**
 * Order the folder file
 * @param {string} folderPath folder path
 * @param {string[]} folderfiles files name list
 * @param {string} orderBy support enum[lastModified, size, fileName]
 * @param {string} orderByDirection support enum[Descending , Ascending]
 * @returns {[]} file name array
 */
module.exports.sortFileWithOrderBy = async (folderPath, folderFiles, orderBy, orderByDirection) => {
    const isOrderInputVaild =
        (orderBy === "lastModified" || orderBy === "size" || orderBy === "fileName")
        && (orderByDirection === "Descending" || orderByDirection === "Ascending");

    if (!isOrderInputVaild) return folderFiles;
    console.log(`Path: ${folderPath} \nFiles: ${folderFiles}`);
    console.log(`Order By ${orderBy} and direction is ${orderByDirection}`);
    let fileInformationArray = [];

    for (let i = 0; i < folderFiles.length; i++) {
        const filePath = `${folderPath}/${folderFiles[i]}`;
        const stat = await fsPromises.stat(filePath);
        const folderFileStat = {
            lastModified: stat.mtime.getTime(),
            size: stat.isDirectory() ? await fastFolderSizeAsync(filePath) : stat.size,
            fileName: folderFiles[i].split("/").pop()
        };
        console.log(folderFileStat);
        fileInformationArray.push(folderFileStat);
    };

    // Use Descending direction for default
    let result = [];
    switch (orderBy) {
        case "lastModified":
            result = fileInformationArray
                .sort((a, b) =>
                    orderByDirection === "Ascending"
                        ? a.lastModified - b.lastModified
                        : b.lastModified - a.lastModified
                );
            break;
        case "size":
            result = fileInformationArray
                .sort((a, b) =>
                    orderByDirection === "Ascending"
                        ? a.size - b.size
                        : b.size - a.size
                );
            break;
        case "fileName":
            /**
             * compare string order
             * @param {string} a 
             * @param {string} b 
             */
            const stringCompare = (a, b) => a > b ? 1 : -1;
            result = fileInformationArray
                .sort((a, b) =>
                    orderByDirection === "Ascending"
                        ? stringCompare(a.fileName, b.fileName)
                        : stringCompare(b.fileName, a.fileName)
                );
            break;
        default:
            break;
    }
    return result.map(i => i.fileName);
}
/**
 * Filter the folder file name list
 * @param {string[]} folderfiles files name list
 * @param {string} filterByName support file name filter which only shows the results contains filter string in ignore case condition
 * @returns {[]} file name array
 */
module.exports.filterFileName = (folderfiles, filterByName) => {
    if (filterByName) {
        console.log(`Filter name by ${filterByName}`);
        return folderfiles.filter(fileName => fileName.toUpperCase().includes(filterByName.toUpperCase()));
    } else {
        return folderfiles;
    }
};