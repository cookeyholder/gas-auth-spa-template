#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync, writeFileSync, existsSync, mkdirSync, rmSync } from 'fs';
import { resolve } from 'path';
import { createInterface } from 'readline';

function run(cmd, errorMessage) {
  console.log(`$ ${cmd}`);
  try {
    execSync(cmd, { stdio: 'inherit' });
  } catch {
    console.error(errorMessage || `命令失敗: ${cmd}`);
    process.exit(1);
  }
}

function capture(cmd) {
  return execSync(cmd, { encoding: 'utf-8' }).trim();
}

function checkNodeVersion() {
  const match = process.version.match(/^v(\d+)\./);
  const major = match ? parseInt(match[1], 10) : 0;
  if (major < 18) {
    console.error(`需要 Node.js >= 18，目前版本: ${process.version}`);
    process.exit(1);
  }
  console.log(`Node.js ${process.version}`);
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
  const dir = resolve('.deploy');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, `${env}.json`), JSON.stringify(info, null, 2));
}

function askConfirmation() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question('請輸入 DEPLOY TO PRODUCTION 以確認部署到正式環境: ', (answer) => {
      rl.close();
      resolve(answer.trim() === 'DEPLOY TO PRODUCTION');
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const shouldCreate = args.includes('--create');
  const isDryRun = args.includes('--dry-run');
  const env = args.includes('--production') ? 'production' : 'uat';

  checkNodeVersion();

  try {
    capture('clasp --version');
    console.log('clasp');
  } catch {
    console.error('請先安裝 clasp: npm install -g @google/clasp');
    process.exit(1);
  }

  if (env === 'production') {
    const confirmed = await askConfirmation();
    if (!confirmed) {
      console.log('已取消部署');
      process.exit(0);
    }
  }

  let scriptId = getScriptId();
  if (!scriptId && shouldCreate) {
    console.log('正在建立新的 GAS 專案...');
    const tmpDir = '.clasp-tmp';
    if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });

    try {
      capture(`clasp create --type webapp --title "gas-auth-spa-${env}" --rootDir ${tmpDir}`);
    } catch {
      console.error('建立 GAS 專案失敗');
      if (existsSync(tmpDir)) rmSync(tmpDir, { recursive: true });
      process.exit(1);
    }

    const tmpConfig = JSON.parse(readFileSync(resolve(tmpDir, '.clasp.json'), 'utf-8'));
    scriptId = tmpConfig.scriptId;
    rmSync(tmpDir, { recursive: true });
    console.log(`Script ID: ${scriptId}`);
  }

  if (!scriptId) {
    console.error('找不到 Script ID。請執行: node setup.mjs --create');
    process.exit(1);
  }

  if (isDryRun) {
    console.log(`[乾執行] Script ID: ${scriptId}`);
    console.log(`[乾執行] 環境: ${env}`);
    console.log(`[乾執行] 將寫入 .clasp.json`);
    console.log(`[乾執行] 將寫入 .claspignore`);
    console.log(`[乾執行] 將執行: clasp push --force`);
    console.log(`[乾執行] 將執行: clasp version + clasp deploy`);
    return;
  }

  writeFileSync('.clasp.json', JSON.stringify({ scriptId, rootDir: '.' }, null, 2));
  writeFileSync('.claspignore', [
    '**/*',
    '!appsscript.json',
    '!Code.js',
    '!*.html',
  ].join('\n') + '\n');
  console.log('.clasp.json / .claspignore');

  run('clasp push --force', 'clasp push 失敗');

  let versionOutput;
  try {
    versionOutput = capture(`clasp version "deploy by setup.mjs ${new Date().toISOString()}"`);
  } catch {
    console.error('建立版本失敗');
    process.exit(1);
  }
  const versionMatch = versionOutput.match(/Created version\s+(\d+)/i);
  const versionNum = versionMatch ? versionMatch[1] : '1';
  console.log(`版本 ${versionNum}`);

  let deployOutput;
  try {
    deployOutput = capture(`clasp deploy -V ${versionNum} -d "${env} deploy"`);
  } catch {
    console.error('部署失敗');
    process.exit(1);
  }
  const deployMatch = deployOutput.match(/with deploymentId\s+([A-Za-z0-9_-]+)/i);
  const deployId = deployMatch ? deployMatch[1] : '';

  let listOutput;
  try {
    listOutput = capture('clasp deployments');
  } catch {
    listOutput = '';
  }
  const urlMatch = listOutput.match(/(https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec)/i);
  const webAppUrl = urlMatch ? urlMatch[1] : `https://script.google.com/macros/s/${deployId}/exec`;

  saveDeployInfo(env, {
    environment: env.toUpperCase(),
    scriptId,
    deploymentId: deployId,
    webAppUrl,
    versionNumber: parseInt(versionNum, 10),
    deployedAt: new Date().toISOString(),
  });

  console.log('\n部署完成！');
  console.log(`Web App URL: ${webAppUrl}`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
