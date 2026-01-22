import { BlobServiceClient } from "@azure/storage-blob";
import * as dotenv from "dotenv";
dotenv.config();

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

        // Container name MUST be lowercase and can only contain letters, numbers, and hyphens
        const containerName = "profil-slike";

        console.log("\nInitializing Azure Blob Storage container...");
        console.log("\t", containerName);

        // Get a reference to a container
        const containerClient =
            blobServiceClient.getContainerClient(containerName);
        
        // Try to create the container, but it's ok if it already exists
        try {
            const createContainerResponse = await containerClient.create();
            console.log(
                `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`,
            );
        } catch (error) {
            // If container already exists, that's fine
            if (error.code === 'ContainerAlreadyExists') {
                console.log(`Container already exists: ${containerClient.url}`);
            } else {
                throw error;
            }
        }
        
        return containerClient;
    } catch (error) {
        console.error(`Error initializing blob storage: ${error.message}`);
        throw error;
    }
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
