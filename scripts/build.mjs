import { cp, rm, mkdir } from 'node:fs/promises'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const rootDir = dirname(dirname(fileURLToPath(import.meta.url)))
const distDir = join(rootDir, 'dist')

const staticEntries = ['index.html', 'src', 'robots.txt', 'sitemap.xml', 'manifest.webmanifest', 'favicon.svg']

const build = async () => {
  await rm(distDir, { recursive: true, force: true })
  await mkdir(distDir, { recursive: true })
  for (const entry of staticEntries) {
    await cp(join(rootDir, entry), join(distDir, entry), { recursive: true })
  }
  console.log(`Built static site into ${distDir}`)
}

build().catch(error => {
  console.error(error)
  process.exit(1)
})
