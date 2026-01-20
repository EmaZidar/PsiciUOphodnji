const { BlobServiceClient } = require("@azure/storage-blob");
const { v1: uuidv1 } = require("uuid");
require("dotenv").config();

async function initializeBlobStorage() {
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
        const containerName = "profilneSlike" + uuidv1();

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

async function uploadImage(blobName, containerClient) {
    // Create a unique name for the blob
    const blobName = "quickstart" + uuidv1() + ".txt";

    // Get a block blob client
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    // Display blob name and url
    console.log(
        `\nUploading to Azure storage as blob\n\tname: ${blobName}:\n\tURL: ${blockBlobClient.url}`,
    );

    // Upload data to the blob
    const data = "Hello, World!";
    const uploadBlobResponse = await blockBlobClient.upload(data, data.length);
    console.log(
        `Blob was uploaded successfully. requestId: ${uploadBlobResponse.requestId}`,
    );
}
