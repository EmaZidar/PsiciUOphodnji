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

        const blobServiceClient = BlobServiceClient.fromConnectionString(
            AZURE_STORAGE_CONNECTION_STRING,
        );

        const containerName = "profil-slike";

        console.log("\nInitializing Azure Blob Storage container...");
        console.log("\t", containerName);

        const containerClient =
            blobServiceClient.getContainerClient(containerName);
        
        try {
            const createContainerResponse = await containerClient.create();
            console.log(
                `Container was created successfully.\n\trequestId:${createContainerResponse.requestId}\n\tURL: ${containerClient.url}`,
            );
        } catch (error) {
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

        const blockBlobClient = containerClient.getBlockBlobClient(blobName);

        console.log(
            `\nUploading to Azure storage as blob\n\tname: ${blobName}\n\tURL: ${blockBlobClient.url}`,
        );
        
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
