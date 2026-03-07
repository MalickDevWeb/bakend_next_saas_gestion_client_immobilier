#!/usr/bin/env node
import { spawn } from 'node:child_process'
import path from 'node:path'
import { getScriptDir, parseArgs, timestampToken } from './extreme-shared.mjs'

function printHelp() {
  console.info(`Usage: node scripts/run-extreme-suite.mjs [options]

Options:
  --tag=<value>         Tag du scenario (defaut: extreme-suite-<timestamp>)
  --skip-seed           N execute pas le seed massif
  --skip-load           N execute pas la suite charge/securite
  --skip-report         N execute pas le rapport consolide
  --help                Affiche cette aide

Toutes les autres options sont transmises aux scripts internes:
  - scripts/extreme-seed.mjs
  - scripts/extreme-load-security.mjs
  - scripts/extreme-report.mjs
`)
}

function runNodeScript(scriptPath, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [scriptPath, ...args], {
      cwd: path.dirname(scriptPath),
      stdio: 'inherit',
      env: process.env,
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${path.basename(scriptPath)} a echoue avec code ${code}`))
    })
  })
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  if (args.help) {
    printHelp()
    return
  }

  const scriptDir = getScriptDir(import.meta.url)
  const tag = String(args.tag || process.env.EXTREME_TAG || `extreme-suite-${timestampToken()}`).trim()
  const forwardedArgs = process.argv
    .slice(2)
    .filter((arg) => !['--skip-seed', '--skip-load', '--skip-report'].includes(arg))

  if (!forwardedArgs.some((arg) => arg.startsWith('--tag='))) {
    forwardedArgs.unshift(`--tag=${tag}`)
  }

  if (!args['skip-seed']) {
    await runNodeScript(path.join(scriptDir, 'extreme-seed.mjs'), forwardedArgs)
  }
  if (!args['skip-load']) {
    await runNodeScript(path.join(scriptDir, 'extreme-load-security.mjs'), forwardedArgs)
  }
  if (!args['skip-report']) {
    await runNodeScript(path.join(scriptDir, 'extreme-report.mjs'), forwardedArgs)
  }
}

main().catch((error) => {
  console.error('[EXTREME][SUITE] Echec:', error)
  process.exitCode = 1
})
