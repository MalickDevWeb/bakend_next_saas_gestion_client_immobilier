import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function parseArgs(argv) {
  const options = {}
  for (const raw of argv) {
    if (!raw.startsWith('--')) continue
    const trimmed = raw.slice(2)
    const separatorIndex = trimmed.indexOf('=')
    if (separatorIndex === -1) {
      options[trimmed] = true
      continue
    }
    const key = trimmed.slice(0, separatorIndex)
    const value = trimmed.slice(separatorIndex + 1)
    options[key] = value
  }
  return options
}

export function toInt(value, fallback, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

export function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value
  if (value == null) return fallback
  const normalized = String(value).trim().toLowerCase()
  if (normalized === 'true' || normalized === '1' || normalized === 'yes') return true
  if (normalized === 'false' || normalized === '0' || normalized === 'no') return false
  return fallback
}

export function toFloat(value, fallback, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {
  const parsed = Number.parseFloat(String(value ?? ''))
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(parsed, min), max)
}

export function ensureDir(dirPath) {
  mkdirSync(dirPath, { recursive: true })
  return dirPath
}

export function getScriptDir(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl))
}

export function getReportsDir(importMetaUrl) {
  return ensureDir(path.join(getScriptDir(importMetaUrl), '..', 'reports'))
}

export function timestampToken() {
  return new Date().toISOString().replace(/[-:.TZ]/g, '')
}

export function chunkArray(items, chunkSize) {
  const output = []
  for (let index = 0; index < items.length; index += chunkSize) {
    output.push(items.slice(index, index + chunkSize))
  }
  return output
}

export function createRng(seedText) {
  let seed = 0
  const source = String(seedText || 'extreme-default-seed')
  for (let index = 0; index < source.length; index += 1) {
    seed = (seed * 31 + source.charCodeAt(index)) >>> 0
  }
  let state = seed || 0x6d2b79f5
  return () => {
    state += 0x6d2b79f5
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function pickFrom(array, index) {
  if (!Array.isArray(array) || array.length === 0) return null
  return array[((index % array.length) + array.length) % array.length]
}

export function weightedPick(rng, entries) {
  const total = entries.reduce((sum, entry) => sum + Number(entry.weight || 0), 0)
  if (total <= 0) return entries[0]?.value ?? null
  const threshold = rng() * total
  let cursor = 0
  for (const entry of entries) {
    cursor += Number(entry.weight || 0)
    if (threshold <= cursor) return entry.value
  }
  return entries[entries.length - 1]?.value ?? null
}

export function writeJsonFile(filePath, value) {
  ensureDir(path.dirname(filePath))
  writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

export function readJsonFile(filePath, fallback = null) {
  if (!existsSync(filePath)) return fallback
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

export function latestFile(dirPath, prefix, suffix = '.json') {
  if (!existsSync(dirPath)) return null
  const matches = readdirSync(dirPath)
    .filter((name) => name.startsWith(prefix) && name.endsWith(suffix))
    .map((name) => ({
      name,
      fullPath: path.join(dirPath, name),
      mtimeMs: statSync(path.join(dirPath, name)).mtimeMs,
    }))
    .sort((left, right) => right.mtimeMs - left.mtimeMs)
  return matches[0]?.fullPath ?? null
}

export function percentile(values, target) {
  if (!Array.isArray(values) || values.length === 0) return 0
  const sorted = [...values].sort((left, right) => left - right)
  const index = Math.min(
    sorted.length - 1,
    Math.max(0, Math.ceil((target / 100) * sorted.length) - 1)
  )
  return sorted[index]
}

export function summarizeLatencies(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return {
      count: 0,
      minMs: 0,
      maxMs: 0,
      avgMs: 0,
      p50Ms: 0,
      p95Ms: 0,
      p99Ms: 0,
    }
  }
  const sum = values.reduce((acc, value) => acc + value, 0)
  return {
    count: values.length,
    minMs: Math.min(...values),
    maxMs: Math.max(...values),
    avgMs: Number((sum / values.length).toFixed(2)),
    p50Ms: Number(percentile(values, 50).toFixed(2)),
    p95Ms: Number(percentile(values, 95).toFixed(2)),
    p99Ms: Number(percentile(values, 99).toFixed(2)),
  }
}

export function nowIso() {
  return new Date().toISOString()
}

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function hostSnapshot(label) {
  const memory = process.memoryUsage()
  return {
    label,
    at: nowIso(),
    hostname: os.hostname(),
    platform: `${os.platform()} ${os.release()}`,
    cpuCount: os.cpus().length,
    loadAverage: os.loadavg(),
    totalMemoryMb: Math.round(os.totalmem() / 1024 / 1024),
    freeMemoryMb: Math.round(os.freemem() / 1024 / 1024),
    processRssMb: Math.round(memory.rss / 1024 / 1024),
    processHeapUsedMb: Math.round(memory.heapUsed / 1024 / 1024),
    processHeapTotalMb: Math.round(memory.heapTotal / 1024 / 1024),
  }
}

export function humanDuration(ms) {
  const totalMs = Math.max(0, Math.round(ms))
  if (totalMs < 1000) return `${totalMs} ms`
  const seconds = totalMs / 1000
  if (seconds < 60) return `${seconds.toFixed(2)} s`
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = (seconds % 60).toFixed(1)
  return `${minutes} min ${remainingSeconds} s`
}

export function buildReportPaths(importMetaUrl, prefix, tag, extension = 'json') {
  const reportsDir = getReportsDir(importMetaUrl)
  const fileName = `${prefix}-${tag}.${extension}`
  return {
    reportsDir,
    filePath: path.join(reportsDir, fileName),
  }
}
