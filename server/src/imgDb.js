const { BlobServiceClient } = require("@azure/storage-blob");
require("dotenv").config();

export async function initializeBlobStorage() {
    try {
        console.log("Azure Blob storage v12 - JavaScript quickstart sample");

        const AZURE_STORAGE_CONNECTION_STRING =
            process.env.AZURE_STORAGE_CONNECTION_STRING;

        if (!AZURE_STORAGE_CONNECTION_STRING) {
            throw Error("Azure Storage Connection string not found");
        }

        // Create the BlobServiceClient object with connection string
        const blobServiceClient = BlobServiceClient.fromConnectionString(
            AZURE_STORAGE_CONNECTION_STRING,
        );

        // Create a unique name for the container
        const containerName = "profilneSlike";

        console.log("\nCreating container...");
        console.log("\t", containerName);

        // Get a reference to a container
        const containerClient =
            blobServiceClient.getContainerClient(containerName);
        // Create the container
        const createContainerResponse = await containerClient.create();
        console.log(
            `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`,
        );
    } catch (err) {
        console.err(`Error: ${err.message}`);
    }
    return containerClient;
}

export async function uploadImage(blobName, containerClient, imageBuffer) {
    try {
        if (!blobName || !containerClient || !imageBuffer) {
            throw new Error('Missing required parameters: blobName, containerClient, or imageBuffer');
        }

        // Get a block blob client
        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        // Display blob name and url
        console.log(
            `\nUploading to Azure storage as blob\n\tname: ${blobName}\n\tURL: ${blockBlobClient.url}`,
        );
        
        // Upload data to the blob
        const uploadBlobResponse = await blockBlobClient.upload(imageBuffer, imageBuffer.length);
        console.log(
            `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`,
        );
        
        return {
            blobName: blobName,
            url: blockBlobClient.url,
            requestId: uploadBlobResponse.requestId
        };
    } catch (err) {
        console.error(`Error uploading image: ${err.message}`);
        throw err;
    }
}
