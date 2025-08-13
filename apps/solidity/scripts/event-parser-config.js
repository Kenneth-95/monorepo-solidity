const path = require('path');

// 合约配置映射
const CONTRACT_CONFIGS = {
  'TodoList': {
    abiPath: path.join(__dirname, '../artifacts/contracts/TodoList.sol/TodoList.json'),
    name: 'TodoList',
    description: '待办事项合约'
  },
  'Counter': {
    abiPath: path.join(__dirname, '../artifacts/contracts/Counter.sol/Counter.json'),
    name: 'Counter', 
    description: '计数器合约'
  },
  'Greeting': {
    abiPath: path.join(__dirname, '../artifacts/contracts/Greeting.sol/Greeting.json'),
    name: 'Greeting',
    description: '问候合约'
  },
  'Lock': {
    abiPath: path.join(__dirname, '../artifacts/contracts/Lock.sol/TransferContract.json'),
    name: 'TransferContract',
    description: '转账合约'
  }
};

// 从ABI中提取事件定义
function extractEventsFromABI(abiPath) {
  try {
    const fs = require('fs');
    const contractArtifact = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    const events = contractArtifact.abi.filter(item => item.type === 'event');
    
    const eventMap = {};
    events.forEach(event => {
      // 生成事件签名
      const signature = `${event.name}(${event.inputs.map(input => input.type).join(',')})`;
      const { ethers } = require('hardhat');
      const hash = ethers.keccak256(ethers.toUtf8Bytes(signature));
      
      eventMap[hash] = {
        name: event.name,
        signature: signature,
        inputs: event.inputs,
        anonymous: event.anonymous || false
      };
    });
    
    return eventMap;
  } catch (error) {
    console.error(`解析ABI文件失败: ${abiPath}`, error.message);
    return {};
  }
}

// 获取合约事件配置
function getContractEvents(contractName) {
  const config = CONTRACT_CONFIGS[contractName];
  if (!config) {
    throw new Error(`未找到合约配置: ${contractName}\n可用合约: ${Object.keys(CONTRACT_CONFIGS).join(', ')}`);
  }
  
  return {
    config,
    events: extractEventsFromABI(config.abiPath)
  };
}

// 解析事件数据
function parseEventData(eventInfo, log) {
  const { ethers } = require('hardhat');
  const result = {
    name: eventInfo.name,
    signature: eventInfo.signature,
    params: {}
  };

  try {
    // 解析indexed参数 (topics)
    let topicIndex = 1;
    eventInfo.inputs.forEach(input => {
      if (input.indexed) {
        const value = log.topics[topicIndex];
        if (input.type === "address") {
          result.params[input.name] = {
            type: input.type,
            value: ethers.getAddress("0x" + value.slice(26)),
            indexed: true
          };
        } else if (input.type.startsWith("uint")) {
          result.params[input.name] = {
            type: input.type,
            value: BigInt(value).toString(),
            indexed: true
          };
        } else if (input.type.startsWith("bytes")) {
          result.params[input.name] = {
            type: input.type,
            value: value,
            indexed: true
          };
        }
        topicIndex++;
      }
    });

    // 解析非indexed参数 (data)
    if (log.data !== "0x") {
      const nonIndexedInputs = eventInfo.inputs.filter(input => !input.indexed);
      if (nonIndexedInputs.length > 0) {
        const decoded = ethers.AbiCoder.defaultAbiCoder().decode(
          nonIndexedInputs.map(input => input.type),
          log.data
        );
        
        nonIndexedInputs.forEach((input, i) => {
          if (input.type.startsWith("uint")) {
            result.params[input.name] = {
              type: input.type,
              value: decoded[i].toString(),
              indexed: false
            };
          } else if (input.type === "string") {
            result.params[input.name] = {
              type: input.type,
              value: decoded[i],
              indexed: false
            };
          } else if (input.type === "bool") {
            result.params[input.name] = {
              type: input.type,
              value: decoded[i],
              indexed: false
            };
          } else {
            result.params[input.name] = {
              type: input.type,
              value: decoded[i].toString(),
              indexed: false
            };
          }
        });
      }
    }
  } catch (error) {
    result.parseError = error.message;
  }

  return result;
}

module.exports = {
  CONTRACT_CONFIGS,
  getContractEvents,
  parseEventData,
  extractEventsFromABI
}; 