export default {
  abi: [
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_unlockTime",
          type: "uint256"
        }
      ],
      stateMutability: "payable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "uint256",
          name: "amount",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "uint256",
          name: "when",
          type: "uint256"
        }
      ],
      name: "Withdrawal",
      type: "event"
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address payable",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "unlockTime",
      outputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "withdraw",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ],
  // 注意：这里需要在部署合约后更新实际的合约地址
  address: "0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6" // Lock合约地址 - 自动更新
}