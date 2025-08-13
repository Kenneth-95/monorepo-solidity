const { ethers } = require("hardhat");
const fs = require('fs');
const path = require('path');
const { getContractEvents, parseEventData } = require('./event-parser-config');

async function main() {
  // 从命令行参数获取交易ID和合约名称
  const args = process.argv.slice(2);
  let txHash, contractName;
  
  if (args.length >= 2) {
    txHash = args[0];
    contractName = args[1];
  }

  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📋 智能合约事件解析器");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🔗 交易哈希: ${txHash}`);
  console.log(`📄 合约类型: ${contractName}`);
  
  try {
    // 获取合约事件配置
    const { config, events } = getContractEvents(contractName);
    console.log(`📝 合约描述: ${config.description}`);
    console.log(`📂 ABI路径: ${path.relative(process.cwd(), config.abiPath)}`);
    console.log(`🎯 发现事件: ${Object.keys(events).length} 个`);

    // 获取交易详情
    const tx = await ethers.provider.getTransaction(txHash);
    if (!tx) {
      console.log("❌ 未找到交易");
      return;
    }

    // 保存原始交易数据
    const logDir = path.join(__dirname, 'log');
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    fs.writeFileSync(path.join(logDir, `tx_${txHash.slice(2, 8)}.json`), JSON.stringify(tx, null, 2));

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📊 交易基本信息");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`🏷️  区块号: ${tx.blockNumber}`);
    console.log(`📤 发送方: ${tx.from}`);
    console.log(`📥 接收方: ${tx.to}`);
    console.log(`💰 金额: ${ethers.formatEther(tx.value)} ETH`);
    console.log(`⛽ Gas限制: ${tx.gasLimit.toString()}`);
    console.log(`💸 Gas价格: ${ethers.formatUnits(tx.gasPrice, "gwei")} Gwei`);
    console.log(`🔢 Nonce: ${tx.nonce}`);

    // 获取交易回执
    const receipt = await ethers.provider.getTransactionReceipt(txHash);
    if (!receipt) {
      console.log("❌ 未找到交易回执");
      return;
    }

    // 保存原始回执数据
    fs.writeFileSync(path.join(logDir, `receipt_${txHash.slice(2, 8)}.json`), JSON.stringify(receipt, null, 2));

    console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("📈 交易执行结果");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`✅ 状态: ${receipt.status === 1 ? '成功' : '失败'}`);
    console.log(`⛽ 实际Gas使用: ${receipt.gasUsed.toString()}`);
    console.log(`📊 Gas使用率: ${(receipt.gasUsed * 100n / tx.gasLimit)}%`);
    console.log(`💵 Gas费用: ${ethers.formatEther(BigInt(receipt.gasPrice || tx.gasPrice) * BigInt(receipt.gasUsed))} ETH`);

    if (receipt.logs.length > 0) {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("🎉 智能事件解析");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

      const parsedEvents = [];

      receipt.logs.forEach((log, index) => {
        const eventSig = log.topics[0];
        const eventInfo = events[eventSig];
        
        console.log(`\n📌 事件 ${index + 1}:`);
        console.log(`   📍 合约地址: ${log.address}`);
        console.log(`   🏷️  事件签名哈希: ${eventSig}`);
        
        if (eventInfo) {
          const parsedEvent = parseEventData(eventInfo, log);
          parsedEvents.push({
            logIndex: index,
            contractAddress: log.address,
            ...parsedEvent
          });
          
          console.log(`   🎯 事件名称: ${parsedEvent.name}`);
          console.log(`   📋 事件签名: ${parsedEvent.signature}`);
          
          if (parsedEvent.parseError) {
            console.log(`   ⚠️  解析错误: ${parsedEvent.parseError}`);
          } else {
            console.log(`   📝 参数详情:`);
            Object.entries(parsedEvent.params).forEach(([name, param]) => {
              const indexedTag = param.indexed ? " 🔍(indexed)" : "";
              if (param.type.startsWith("uint") && (name.includes("amount") || name.includes("reward") || name.includes("value"))) {
                // 对金额类型的参数显示ETH单位
                console.log(`      ${name}${indexedTag}: ${ethers.formatEther(param.value)} ETH (${param.value} wei)`);
              } else if (param.type === "string") {
                console.log(`      ${name}${indexedTag}: "${param.value}"`);
              } else {
                console.log(`      ${name}${indexedTag}: ${param.value}`);
              }
            });
          }
        } else {
          console.log(`   ❓ 未知事件 (不在 ${contractName} 合约的ABI中)`);
          console.log(`   📄 原始数据: ${log.data}`);
        }
      });

      // 保存解析结果
      const parseResult = {
        transaction: {
          hash: txHash,
          blockNumber: tx.blockNumber,
          from: tx.from,
          to: tx.to,
          status: receipt.status === 1 ? 'success' : 'failed',
          gasUsed: receipt.gasUsed.toString(),
          timestamp: new Date().toISOString()
        },
        contract: {
          name: contractName,
          description: config.description
        },
        events: parsedEvents
      };

      fs.writeFileSync(
        path.join(logDir, `parsed_events_${txHash.slice(2, 8)}.json`), 
        JSON.stringify(parseResult, null, 2)
      );

      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("💾 数据保存");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log(`📁 原始交易: scripts/log/tx_${txHash.slice(2, 8)}.json`);
      console.log(`📁 原始回执: scripts/log/receipt_${txHash.slice(2, 8)}.json`);
      console.log(`📁 解析结果: scripts/log/parsed_events_${txHash.slice(2, 8)}.json`);
      
    } else {
      console.log("\n🔕 该交易没有产生任何事件日志");
    }

    if (receipt.status === 0) {
      console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      console.log("💥 失败分析");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      try {
        await ethers.provider.call(tx, tx.blockNumber);
      } catch (error) {
        console.log(`❌ 失败原因: ${error.reason || error.message}`);
      }
    }

  } catch (error) {
    console.error("💥 查询失败:", error.message);
  }
}

// 显示帮助信息
function showHelp() {
  console.log(`
📖 使用方法:
npx hardhat run scripts/enhanced-query-transaction.js --network <network> <交易哈希> <合约名称>

📋 示例:
npx hardhat run scripts/enhanced-query-transaction.js --network localhost 0x123... TodoList
npx hardhat run scripts/enhanced-query-transaction.js --network sepolia 0x456... Counter

🏷️  支持的合约名称:
- TodoList    (待办事项合约)
- Counter     (计数器合约)  
- Greeting    (问候合约)
- Lock        (转账合约)
`);
}

// 检查是否需要显示帮助
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  showHelp();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
}); 