const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");
const ignitionPath = path.join(__dirname, "../ignition/modules");

async function deployAndUpdateContracts() {
  console.log("🚀 开始智能部署流程...\n");
  // 同步读取目录内容
  const files = fs.readdirSync(ignitionPath, { withFileTypes: true });
  console.log(files);
  // 过滤出目录
  // const modulesList = files
  //   .filter((file) => {
  //     return file.isFile()
  //   })
  //   .map((dir) => dir.name.replace('.js', ''));
  const modulesList = ['AllModule']
  console.log(modulesList);
  try {
    // 检查网络连接
    console.log("🔍 检查Hardhat网络状态...");
    await checkNetworkStatus();
    console.log("✅ 网络连接正常！\n");
    if (!modulesList.length) {
      console.log("❌ 没有找到模块！");
      return;
    }
    for (const module of modulesList) {
      try {
        console.log(`📄 正在部署 ${module} 合约...`);
        const result = await execCommand(
          `npx hardhat ignition deploy ./ignition/modules/${module}.js --network localhost --reset`
        );
        console.log(result,'xxxxx')
        const address = extractAddress(result, module);
        console.log(address,'xxx2x')
        return 
        console.log("\n🔄 正在更新前端配置...");
        updateFrontendConfig(address, module);
        console.log(`📍 ${module} 地址: ${address}`);
      } catch (error) {
        console.error(`❌ 部署 ${module} 失败:`, error);
      }
    }

    console.log("✅ 前端配置更新完成！");
    console.log("\n🎉 部署流程全部完成！可以直接使用前端应用了。");
  } catch (error) {
    console.error("❌ 部署过程中出现错误:", error.message);
  }
}

function execCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(stdout);
    });
  });
}

async function checkNetworkStatus() {
  const http = require("http");
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "127.0.0.1",
      port: 8545,
      path: "/",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 3000,
    };

    const req = http.request(options, (res) => {
      resolve(true);
    });

    req.on("error", (err) => {
      reject(
        new Error(
          `❌ Hardhat网络未运行！\n\n请先启动网络 ：\n1. 新开一个终端\n2. 运行：npx hardhat node\n3. 然后重新运行此脚本\n\n或者直接使用：start_dev.bat`
        )
      );
    });

    req.on("timeout", () => {
      req.destroy();
      reject(new Error("❌ 网络连接超时！请检查Hardhat网络是否正在运行。"));
    });

    req.write(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1,
      })
    );
    req.end();
  });
}

function extractAddress(deployOutput, contractName) {
  // 从部署输出中提取合约地址，支持多种格式
  const patterns = [
    new RegExp(
      `${contractName}Module#${contractName}\\s*-\\s*(0x[a-fA-F0-9]{40})`
    ),
    new RegExp(`${contractName}\\s*-\\s*(0x[a-fA-F0-9]{40})`),
    new RegExp(`Contract address:\\s*(0x[a-fA-F0-9]{40})`),
    new RegExp(`(0x[a-fA-F0-9]{40})`, "g"),
  ];

  for (const pattern of patterns) {
    const match = deployOutput.match(pattern);
    if (match) {
      return match[1];
    }
  }

  // 如果没有找到，尝试从最后一个出现的地址中提取
  const allAddresses = deployOutput.match(/0x[a-fA-F0-9]{40}/g);
  if (allAddresses && allAddresses.length > 0) {
    return allAddresses[allAddresses.length - 1];
  }

  return null;
}

/**
 * 从合约 JSON 文件中提取 ABI
 */
function extractAbiFromArtifacts(module) {
  const artifactPath = path.join(__dirname, `../artifacts/contracts/${module}.sol/${module}.json`);
  
  if (!fs.existsSync(artifactPath)) {
    console.log(`⚠️ 没有找到 ${module} 的编译产物: ${artifactPath}`);
    return null;
  }

  try {
    const contractData = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
    return contractData.abi;
  } catch (error) {
    console.error(`❌ 读取 ${module} ABI 失败:`, error);
    return null;
  }
}

/**
 * 生成前端配置文件内容
 */
function generateConfigContent(module, abi, address,isFrontend=true) {
  // 使用自定义序列化去除键的双引号，让格式更简洁
  const formatAbi = (obj, indent = 2) => {
    const spaces = ' '.repeat(indent);
    
    if (Array.isArray(obj)) {
      if (obj.length === 0) return '[]';
      const items = obj.map(item => formatAbi(item, indent + 2));
      return `[\n${spaces}  ${items.join(`,\n${spaces}  `)}\n${spaces}]`;
    }
    
    if (obj && typeof obj === 'object') {
      const entries = Object.entries(obj);
      if (entries.length === 0) return '{}';
      
      const formatted = entries.map(([key, value]) => {
        const formattedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
        return `${formattedKey}: ${formatAbi(value, indent + 2)}`;
      });
      
      return `{\n${spaces}  ${formatted.join(`,\n${spaces}  `)}\n${spaces}}`;
    }
    
    return JSON.stringify(obj);
  };

  if(!isFrontend){
    return `module.exports = {
        abi: ${formatAbi(abi)},
        // 注意：这里需要在部署合约后更新实际的合约地址
        address: "${address}" // ${module}合约地址 - 自动更新
      }`;
  }
  return `export default {
  abi: ${formatAbi(abi)},
  // 注意：这里需要在部署合约后更新实际的合约地址
  address: "${address}" // ${module}合约地址 - 自动更新
}`;
}

function updateFrontendConfig(address, module) {
  const configPath = path.join(__dirname, `../../frontend/src/contracts/config/${module}.js`);
  const backConfigPath = path.join(__dirname, `../../backend/config/config/${module}.js`);
  const configDir = path.dirname(configPath);
  const backConfigDir = path.dirname(backConfigPath);
  
  // 确保配置目录存在
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
    console.log(`📁 创建前端配置目录: ${configDir}`);
  }
  if (!fs.existsSync(backConfigDir)) {
    fs.mkdirSync(backConfigDir, { recursive: true });
    console.log(`📁 创建后端配置目录: ${backConfigDir}`);
  }

  // 从 artifacts 中获取 ABI
  const abi = extractAbiFromArtifacts(module);
  if (!abi) {
    console.log(`❌ 无法获取 ${module} 的 ABI，跳过更新`);
    return;
  }

  // 直接覆盖配置文件
  console.log(`🔄 正在生成 ${module} 配置文件...`);
  const configContent = generateConfigContent(module, abi, address);
  fs.writeFileSync(configPath, configContent);
  const backconfigContent = generateConfigContent(module, abi, address,false);
  fs.writeFileSync(backConfigPath, backconfigContent);
  console.log(`✅ 已生成 ${module} 配置文件: ${configPath}`);
}

// 运行脚本
deployAndUpdateContracts();
