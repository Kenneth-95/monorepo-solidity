module.exports = {
        abi: [
    {
      inputs: [
        {
          internalType: "address",
          name: "_counterAddress",
          type: "address"
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
          internalType: "uint256",
          name: "newCount",
          type: "uint256"
        }
      ],
      name: "CounterUpdated",
      type: "event"
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "uint256",
          name: "todoId",
          type: "uint256"
        },
        {
          indexed: false,
          internalType: "string",
          name: "content",
          type: "string"
        }
      ],
      name: "TodoCompleted",
      type: "event"
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "_content",
          type: "string"
        }
      ],
      name: "addTodo",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "checkAndCompleteDefaultTodo",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [
        {
          internalType: "uint256",
          name: "_index",
          type: "uint256"
        }
      ],
      name: "completeTodo",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function"
    },
    {
      inputs: [],
      name: "counterContract",
      outputs: [
        {
          internalType: "contract ICounter",
          name: "",
          type: "address"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "defaultTodoIndex",
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
      name: "getCurrentCount",
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
      name: "getDefaultTodoStatus",
      outputs: [
        {
          internalType: "bool",
          name: "",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "getTodos",
      outputs: [
        {
          components: [
            {
              internalType: "uint256",
              name: "id",
              type: "uint256"
            },
            {
              internalType: "string",
              name: "content",
              type: "string"
            },
            {
              internalType: "bool",
              name: "isCompleted",
              type: "bool"
            }
          ],
          internalType: "struct TodoList.Todo[]",
          name: "",
          type: "tuple[]"
        }
      ],
      stateMutability: "view",
      type: "function"
    },
    {
      inputs: [],
      name: "lastCheckedCount",
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
      inputs: [
        {
          internalType: "uint256",
          name: "",
          type: "uint256"
        }
      ],
      name: "todos",
      outputs: [
        {
          internalType: "uint256",
          name: "id",
          type: "uint256"
        },
        {
          internalType: "string",
          name: "content",
          type: "string"
        },
        {
          internalType: "bool",
          name: "isCompleted",
          type: "bool"
        }
      ],
      stateMutability: "view",
      type: "function"
    }
  ],
        // 注意：这里需要在部署合约后更新实际的合约地址
        address: "0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e" // TodoList合约地址 - 自动更新
      }