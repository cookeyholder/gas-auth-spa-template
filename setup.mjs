#!/usr/bin/env node
/**
 * setup.mjs — 跨平臺一鍵初始化建置
 * 用法: node setup.mjs [--create] [--deploy]
 *
 * 不需 package.json，不需 bash，只需 node + clasp (全域)
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

function run(cmd, options = {}) {
  console.log(`$ ${cmd}`);
  return execSync(cmd, { stdio: 'inherit', ...options });
}

function capture(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

function getScriptId() {
  if (existsSync('.clasp.json')) {
    const config = JSON.parse(readFileSync('.clasp.json', 'utf-8'));
    if (config.scriptId && config.scriptId !== '請改成你的 Script ID') {
      return config.scriptId;
    }
  }
  return null;
}

function saveDeployInfo(env, info) {
  const dir = resolve(__dirname, '.deploy');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(`${dir}/${env}.json`, JSON.stringify(info, null, 2));
}

async function main() {
  const args = process.argv.slice(2);
  const shouldCreate = args.includes('--create');
  const shouldDeploy = args.includes('--deploy') || true;
  const env = args.includes('--production') ? 'production' : 'uat';

  // 1. 驗證 clasp
  try {
    capture('clasp --version');
  } catch {
    console.error('請先安裝 clasp: npm install -g @google/clasp');
    process.exit(1);
  }

  // 2. 取得或建立 Script ID
  let scriptId = getScriptId();
  if (!scriptId && shouldCreate) {
    console.log('正在建立新的 GAS 專案...');
    const output = capture(
      `clasp create "gas-auth-spa-${env}" --type webapp --rootDir /tmp/clasp-create`
    );
    const tmpConfig = JSON.parse(
      readFileSync('/tmp/clasp-create/.clasp.json', 'utf-8')
    );
    scriptId = tmpConfig.scriptId;
  }

  if (!scriptId) {
    console.error('找不到 Script ID。請執行: node setup.mjs --create');
    process.exit(1);
  }

  // 3. 寫入 .clasp.json
  writeFileSync('.clasp.json', JSON.stringify({ scriptId, rootDir: '.' }, null, 2));
  writeFileSync('.claspignore', [
    '**/*',
    '!appsscript.json',
    '!src/backend/**/*.gs',
    '!src/frontend/**/*.html',
  ].join('\n'));

  // 4. 上傳
  run('clasp push --force');

  // 5. 部署
  if (shouldDeploy) {
    const versionOutput = capture(`clasp version "deploy by setup.mjs $(new Date().toISOString())"`);
    const versionMatch = versionOutput.match(/Created version\s+(\d+)/i);
    const versionNum = versionMatch ? versionMatch[1] : '1';

    const deployOutput = capture(`clasp deploy -V ${versionNum} -d "${env} deploy"`);
    const deployMatch = deployOutput.match(/with deploymentId\s+([A-Za-z0-9_-]+)/i);
    const deployId = deployMatch ? deployMatch[1] : '';

    const listOutput = capture('clasp deployments');
    const urlMatch = listOutput.match(/(https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec)/i);
    const webAppUrl = urlMatch ? urlMatch[1] : `https://script.google.com/macros/s/${deployId}/exec`;

    saveDeployInfo(env, {
      environment: env.toUpperCase(),
      scriptId,
      deploymentId: deployId,
      webAppUrl,
      versionNumber: parseInt(versionNum),
      deployedAt: new Date().toISOString(),
    });

    console.log('\n部署完成！');
    console.log(`Web App URL: ${webAppUrl}`);
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
