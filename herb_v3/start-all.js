const concurrently = require('concurrently');
const open = require('open');
const http = require('http');
const path = require('path');
const fs = require('fs');

// 检查 open 模块是否可用
const openBrowser = typeof open === 'function' ? open : 
                   (typeof open === 'object' && open.default) ? open.default : 
                   null;

if (!openBrowser) {
  console.error('警告: open 模块无法正确加载，浏览器可能不会自动打开');
  console.error('open 的类型是:', typeof open);
  console.error('open 的值是:', open);
}

// 获取当前运行环境 - Electron 打包环境或开发环境
function getAppRoot() {
  // 检查是否在 Electron 打包环境中运行
  if (process.env.ELECTRON_RUN_AS_NODE === '1') {
    // 在打包环境中，当前工作目录应该是应用根目录
    return process.cwd();
  }
  // 开发环境
  return path.resolve(__dirname);
}

// 应用根目录
const appRoot = getAppRoot();
console.log(`应用根目录: ${appRoot}`);

// 检查端口是否可用
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = http.createServer();
    
    server.once('error', () => {
      resolve(false); // 端口不可用
    });
    
    server.once('listening', () => {
      // 关闭服务器并释放端口
      server.close(() => {
        resolve(true); // 端口可用
      });
    });
    
    server.listen(port);
  });
}

// 检查项目目录是否存在
function doesProjectExist(projectPath) {
  return fs.existsSync(projectPath);
}

// 项目配置
const projects = [
  { name: 'first1', port: 5172, cwd: './first1' },
  { name: 'my-project', port: 5174, cwd: './my-project' },
  { name: 'test', port: 5173, cwd: './test' },
  { name: 'third', port: 5175, cwd: './third' },
];

// 主函数
async function main() {
  console.log('正在启动所有项目...');
  
  // 验证项目目录
  const missingProjects = [];
  for (const project of projects) {
    const projectPath = path.join(appRoot, project.cwd);
    if (!doesProjectExist(projectPath)) {
      missingProjects.push(project.name);
      console.error(`❌ 错误: 找不到项目目录 ${projectPath}`);
    }
  }
  
  if (missingProjects.length > 0) {
    console.error(`❌ 以下项目目录不存在: ${missingProjects.join(', ')}`);
    console.error('请确保这些目录存在或修改配置');
    process.exit(1);
  }
  
  // 检查端口
  console.log('检查端口可用性...');
  const unavailablePorts = [];
  
  for (const project of projects) {
    const available = await isPortAvailable(project.port);
    if (!available) {
      unavailablePorts.push({ name: project.name, port: project.port });
      console.error(`❌ 警告: 端口 ${project.port} (${project.name}) 已被占用`);
    }
  }
  
  if (unavailablePorts.length > 0) {
    console.error(`❌ 以下端口不可用:`);
    unavailablePorts.forEach(p => console.error(`   - ${p.port} (${p.name})`));
    console.error('这可能导致某些项目无法启动。请关闭使用这些端口的应用后重试。');
  }
  
  // 启动所有项目
  console.log(`开始启动所有项目...`);
  
  const commands = projects.map(p => ({
    command: 'npm run dev',
    name: p.name,
    cwd: path.join(appRoot, p.cwd),
    env: { ...process.env }
  }));
  
  try {
    const { result } = concurrently(commands, {
      prefix: 'name',
      killOthers: ['failure'],
      restartTries: 0,
      outputStream: process.stdout,
      timestampFormat: 'HH:mm:ss'
    });
    
    // 输出访问地址
    console.log('\n可访问的项目地址:');
    projects.forEach(p => {
      console.log(`- ${p.name}: http://localhost:${p.port}`);
    });
    
    // 打开浏览器访问第一个项目
    const firstProjectUrl = `http://localhost:${projects[0].port}`;
    console.log(`\n尝试打开首页: ${firstProjectUrl}`);
    
    // 打开浏览器（如果可能）
    if (openBrowser && !process.env.ELECTRON_RUN_AS_NODE) {
      try {
        await openBrowser(firstProjectUrl);
        console.log('✅ 已在浏览器中打开首页');
      } catch (err) {
        console.error(`❌ 无法打开浏览器: ${err.message}`);
      }
    } else {
      console.log('在 Electron 环境中运行，不尝试打开浏览器');
    }
    
    // 等待所有项目结束
    result.catch(err => {
      console.error('项目运行失败:', err.message);
    });
  } catch (err) {
    console.error(`无法启动项目: ${err.message}`);
    process.exit(1);
  }
}

// 运行主函数
main().catch(err => {
  console.error(`启动过程中发生错误: ${err.message}`);
  process.exit(1);
});