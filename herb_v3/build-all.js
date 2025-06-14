const concurrently = require('concurrently');
const fs = require('fs');
const path = require('path');

// 先验证项目目录是否存在
const projects = [
  { name: 'first1', path: './first1' },
  { name: 'test', path: './test' },
  { name: 'my-project', path: './my-project' },
  { name: 'third', path: './third' }
];

// 检查项目目录
projects.forEach(project => {
  if (!fs.existsSync(project.path)) {
    console.error(`错误: 项目目录不存在: ${project.path}`);
    process.exit(1);
  }
});

// 构建所有项目
const { result } = concurrently([
  { command: 'cd first1 && npm install && npm run build', name: 'first1', prefixColor: 'cyan' },
  { command: 'cd test && npm install && npm run build', name: 'test', prefixColor: 'green' },
  { command: 'cd my-project && npm install && npm run build', name: 'my-project', prefixColor: 'yellow' },
  { command: 'cd third && npm install && npm run build', name: 'third', prefixColor: 'blue' }
], {
  prefix: 'name',
  killOthers: ['failure'],
  restartTries: 0
});

// 监听结束
result
  .then(() => {
    console.log('\n✅ 所有项目构建完成');
    
    // 验证构建结果
    let allValid = true;
    projects.forEach(project => {
      const distPath = path.join(project.path, 'dist');
      const indexPath = path.join(distPath, 'index.html');
      
      if (!fs.existsSync(distPath)) {
        console.error(`❌ 错误: ${project.name} 的 dist 目录不存在`);
        allValid = false;
      } else if (!fs.existsSync(indexPath)) {
        console.error(`❌ 错误: ${project.name} 的 index.html 文件不存在`);
        allValid = false;
      } else {
        console.log(`✅ ${project.name} 构建成功`);
      }
    });
    
    if (!allValid) {
      console.error('❌ 一些项目构建失败，请检查错误');
      process.exit(1);
    }
  })
  .catch(err => {
    console.error('\n❌ 构建过程中出错:', err.message);
    process.exit(1);
  });