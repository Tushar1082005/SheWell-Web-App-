// src/utils/ipfs.js
import axios from 'axios';

/**
 * Stores a file on IPFS via Pinata
 * @param {File} file - The file to store
 * @returns {Promise<string>} - Returns the IPFS content ID (CID)
 */
export async function storeFile(file) {
  try {
    // Get API keys from environment variables
    const apiKey = process.env.REACT_APP_PINATA_API_KEY;
    const apiSecret = process.env.REACT_APP_PINATA_SECRET_KEY;
    
    // Validate API keys
    if (!apiKey || !apiSecret) {
      throw new Error('Pinata API credentials are missing. Please set REACT_APP_PINATA_API_KEY and REACT_APP_PINATA_SECRET_KEY in your environment variables.');
    }

    console.log(`Uploading ${file.name} to Pinata...`);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append('file', file);
    
    // Optional metadata
    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        type: 'health-record',
        timestamp: Date.now()
      }
    });
    formData.append('pinataMetadata', metadata);
    
    // Upload options
    const pinataOptions = JSON.stringify({
      cidVersion: 1,
    });
    formData.append('pinataOptions', pinataOptions);

    // Make API request to Pinata
    const response = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          'Content-Type': `multipart/form-data;`,
          'pinata_api_key': apiKey,
          'pinata_secret_api_key': apiSecret
        }
      }
    );

    if (response.status !== 200) {
      throw new Error(`Pinata upload failed with status: ${response.status}`);
    }

    console.log('File uploaded successfully! CID:', response.data.IpfsHash);
    
    // Return the IPFS hash (CID)
    return response.data.IpfsHash;
  } catch (error) {
    console.error('Error uploading file to IPFS:', error);
    if (error.response) {
      // Pinata API error response
      console.error('Pinata API Error:', error.response.data);
      throw new Error(`Failed to upload to IPFS: ${error.response.data.error || 'Pinata API error'}`);
    }
    throw new Error('Failed to upload to IPFS: ' + error.message);
  }
}

/**
 * Get IPFS gateway URL for a CID
 * @param {string} cid - The IPFS content ID
 * @returns {string} - The public gateway URL
 */
export function getIPFSGatewayURL(cid) {
  // Using the gateway from environment variables or default to Pinata gateway
  const gateway = process.env.REACT_APP_IPFS_GATEWAY || 'https://gateway.pinata.cloud/ipfs';
  return `${gateway}/${cid}`;
}