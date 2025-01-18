const fs = require('fs');
const path = require('path');

class VersionIncrementerPlugin {
  constructor(options = {}) {
    this.packageJsonPath = options.packageJsonPath || 'package.json';
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapAsync('VersionIncrementerPlugin', (compilation, callback) => {
      const packageJsonPath = path.resolve(this.packageJsonPath);
      
      try {
        // package.jsonを読み込む
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        
        // バージョンを分解
        const [major, minor, patch] = packageJson.version.split('.').map(Number);
        
        // パッチバージョンをインクリメント
        packageJson.version = `${major}.${minor}.${patch + 1}`;
        
        // 更新したpackage.jsonを書き込む
        fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
        
        console.log(`Version incremented to: ${packageJson.version}`);
        callback();
      } catch (error) {
        console.error('Error incrementing version:', error);
        callback();
      }
    });
  }
}

module.exports = VersionIncrementerPlugin;