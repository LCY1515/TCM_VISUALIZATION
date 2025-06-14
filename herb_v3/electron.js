const { app, BrowserWindow, protocol } = require('electron');
const path = require('path');
const fs = require('fs');
const http = require('http');
const { promisify } = require('util');

let mainWindow;
let servers = {};

// 处理单实例应用
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}

// 创建一个简单的HTTP服务器
function createServer(projectPath, port) {
  return new Promise((resolve, reject) => {
    try {
      // 关闭之前的服务器
      if (servers[port]) {
        servers[port].close();
      }
      
      // 创建服务器
      const server = http.createServer((req, res) => {
        let url = req.url;
        // 去除URL查询部分
        url = url.split('?')[0];
        // 去除URL哈希部分
        url = url.split('#')[0];
        
        let filePath = path.join(projectPath, url === '/' ? 'index.html' : url);
        
        // 处理路径中的 %20 等编码
        filePath = decodeURIComponent(filePath);
        
        // 检查文件是否存在
        fs.stat(filePath, (err, stats) => {
          if (err || !stats.isFile()) {
            // 文件不存在，尝试加载index.html (SPA应用通常需要这样)
            filePath = path.join(projectPath, 'index.html');
            fs.stat(filePath, (err, stats) => {
              if (err || !stats.isFile()) {
                res.writeHead(404);
                res.end('文件未找到');
                return;
              }
              serveFile(filePath, res);
            });
            return;
          }
          serveFile(filePath, res);
        });
      });
      
      // 服务特定文件
      function serveFile(filePath, res) {
        const extname = path.extname(filePath);
        let contentType = 'text/html';
        
        switch (extname) {
          case '.js':
            contentType = 'text/javascript';
            break;
          case '.css':
            contentType = 'text/css';
            break;
          case '.json':
            contentType = 'application/json';
            break;
          case '.png':
            contentType = 'image/png';
            break;
          case '.jpg':
          case '.jpeg':
            contentType = 'image/jpeg';
            break;
          case '.svg':
            contentType = 'image/svg+xml';
            break;
          case '.woff':
            contentType = 'application/font-woff';
            break;
          case '.woff2':
            contentType = 'application/font-woff2';
            break;
          case '.ttf':
            contentType = 'application/font-ttf';
            break;
          case '.eot':
            contentType = 'application/vnd.ms-fontobject';
            break;
          case '.otf':
            contentType = 'application/font-otf';
            break;
        }
        
        // 读取并提供文件
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.writeHead(500);
            res.end(`服务器错误: ${err.message}`);
            return;
          }
          
          // 添加CORS头
          res.writeHead(200, {
            'Content-Type': contentType,
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type'
          });
          res.end(data);
        });
      }
      
      // 监听端口
      server.listen(port, () => {
        console.log(`服务器启动，端口: ${port}, 路径: ${projectPath}`);
        servers[port] = server;
        resolve(`http://localhost:${port}`);
      });
      
      server.on('error', (err) => {
        console.error(`服务器启动失败(端口 ${port}): ${err.message}`);
        reject(`服务器启动失败: ${err.message}`);
      });
      
    } catch (err) {
      reject(`创建服务器时出错: ${err.message}`);
    }
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false,
    webPreferences: {
      contextIsolation: false,
      nodeIntegration: true,
      webSecurity: false,
      allowRunningInsecureContent: true
    }
  });

  // 直接加载第一个项目
  if (app.isPackaged) {
    mainWindow.loadURL('http://localhost:5172');
  } else {
    mainWindow.loadURL('http://localhost:5172');
  }

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // 监听窗口关闭
  mainWindow.on('closed', () => {
    // 关闭所有服务器
    Object.values(servers).forEach(server => {
      if (server && typeof server.close === 'function') {
        server.close();
      }
    });
    
    mainWindow = null;
  });
  
  // 开发者工具已移除
}

// 项目和端口映射
const projectPorts = {
  'first1': 5172,
  'test': 5173,
  'my-project': 5174,
  'third': 5175
};

// 当 Electron 完成初始化后
app.whenReady().then(async () => {
  // 为所有项目预先启动服务器
  const projects = ['first1', 'test', 'my-project', 'third'];
  
  for (const project of projects) {
    try {
      // 确定项目路径
      let projectPath;
      if (app.isPackaged) {
        // 优先检查资源目录
        projectPath = path.join(process.resourcesPath, project, 'dist');
        if (!fs.existsSync(projectPath)) {
          // 备用路径
          projectPath = path.join(app.getAppPath(), project, 'dist');
        }
      } else {
        // 开发环境
        projectPath = path.join(app.getAppPath(), project, 'dist');
      }
      
      if (fs.existsSync(projectPath)) {
        const port = projectPorts[project];
        await createServer(projectPath, port);
      } else {
        console.error(`项目目录不存在: ${projectPath}`);
      }
    } catch (err) {
      console.error(`启动服务失败, 项目: ${project}:`, err);
    }
  }
  
  // 创建主窗口
  createWindow();
  
  // 处理 IPC 通信 - 打开项目
  const { ipcMain } = require('electron');
  ipcMain.on('open-project', (event, projectName) => {
    try {
      // 获取端口
      let port;
      if (projectPorts[projectName]) {
        port = projectPorts[projectName];
      } else if (projectName.startsWith('http')) {
        // 支持传入完整 URL
        mainWindow.loadURL(projectName);
        event.reply('project-opened', true, 'success');
        return;
      } else {
        // 默认端口
        port = 5172;
      }
      
      // 加载对应端口的服务器
      const url = `http://localhost:${port}`;
      mainWindow.loadURL(url);
      event.reply('project-opened', true, `已加载 ${projectName}`);
    } catch (err) {
      console.error(`处理打开项目请求出错:`, err);
      event.reply('project-opened', false, err.toString());
    }
  });
});

// 处理窗口关闭
app.on('window-all-closed', () => {
  // 关闭所有服务器
  Object.values(servers).forEach(server => {
    if (server && typeof server.close === 'function') {
      server.close();
    }
  });
  
  app.quit();
});

// 处理未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
});