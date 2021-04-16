const azure = require('@azure/storage-blob');
const AZURE_STORAGE_CONNECTION_STRING = process.env.AZURE_STORAGE_CONNECTION_STRING;
const BlobServiceClient = azure.BlobServiceClient;

const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONNECTION_STRING);

async function uploadFile(destPath,destName,srcFilePath) {
    const containerClient = blobServiceClient.getContainerClient("attendance");
    const blobClient = containerClient.getBlobClient(destPath+destName);
    const blockBlobClient = blobClient.getBlockBlobClient();
    const res = await blockBlobClient.uploadFile(srcFilePath);
    console.log("url: " + blockBlobClient.url);
    return blockBlobClient.url;
}

// returns a promise of the upload
exports.uploadAttendanceSheet = function uploadAttendanceSheet(destName,picPath) {
    console.log("uploading file at: " + destName + " " + picPath)
    return uploadFile('sheet/',destName,picPath);
}
