import { ethers } from "ethers";
import abi from "../abi/HealthRecord.json";

const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

export const getContract = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask is not installed");
  }

  const provider = new ethers.BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const contract = new ethers.Contract(contractAddress, abi.abi, signer);
  return contract;
};
