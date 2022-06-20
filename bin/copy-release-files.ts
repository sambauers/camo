import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { readFileSync, writeFileSync, copyFileSync } from 'node:fs'

import programVars from '../src/lib/program/vars.js'

// Update program vars
const distVarsPath = join('..', 'dist', 'src', 'lib', 'program', 'vars.js')
const distVarsURL = fileURLToPath(new URL(distVarsPath, import.meta.url))
const distVarsTemplate = readFileSync(distVarsURL, 'utf8')

const packagePath = join('..', 'package.json')
const packageURL = fileURLToPath(new URL(packagePath, import.meta.url))
const packageJson = JSON.parse(readFileSync(packageURL).toString())

const distVarsContent = distVarsTemplate
  .replace(`'${programVars.displayName}'`, `'${packageJson.displayName}'`)
  .replace(`'${programVars.description}'`, `'${packageJson.description}'`)
  .replace(`'${programVars.version}'`, `'${packageJson.version}'`)

writeFileSync(distVarsURL, distVarsContent)

// Create truncated package.json for distribution
const distPackagePath = join('..', 'dist', 'package.json')
const distPackageURL = fileURLToPath(new URL(distPackagePath, import.meta.url))

const distPackageJson = { ...packageJson }
delete distPackageJson.devDependencies
delete distPackageJson.files
delete distPackageJson.scripts

writeFileSync(distPackageURL, JSON.stringify(distPackageJson, null, '  '))

// Copy readme and license
const docFiles = ['readme.md', 'license.md']
docFiles.forEach((docFile) => {
  const docPath = join('..', docFile)
  const docURL = fileURLToPath(new URL(docPath, import.meta.url))
  const docPackagePath = join('..', 'dist', docFile)
  const docPackageURL = fileURLToPath(new URL(docPackagePath, import.meta.url))
  copyFileSync(docURL, docPackageURL)
})
