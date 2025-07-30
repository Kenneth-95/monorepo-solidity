export default {
  abi: [
    {
      inputs: [
        {
          internalType: "string",
          name: "_greeting",
          type: "string"
        }
      ],
      stateMutability: "nonpayable",
      type: "constructor"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: false,
          internalType: "string",
          name: "newGreeting",
          type: "string"
        },
        {
          indexed: false,
          internalType: "address",
          name: "changedBy",
          type: "address"
        }
      ],
      name: "GreetingChanged",
      type: "event"
    },
    {
      inputs: [],
      name: "changeCount",
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
      name: "getChangeCount",
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
      name: "getFullGreeting",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getGreeting",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "greeting",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "owner",
      outputs: [
        {
          internalType: "address",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "resetGreeting",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_greeting",
          type: "string"
        }
      ],
      name: "setGreeting",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    }
  ],
  // 注意：这里需要在部署合约后更新实际的合约地址
  address: "0xa513E6E4b8f2a923D98304ec87F64353C4D5C853" // Greeting合约地址 - 自动更新
}