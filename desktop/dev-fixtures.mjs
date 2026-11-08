import { promises as fs } from 'node:fs'
import path from 'node:path'

const chunk = (name, data) => {
  const header = Buffer.alloc(8)
  header.write(name)
  header.writeUInt32LE(data.length, 4)
  return Buffer.concat([header, data, ...(data.length % 2 ? [Buffer.alloc(1)] : [])])
}

function silentWave(album, track) {
  const fmt = Buffer.alloc(16)
  fmt.writeUInt16LE(1, 0)
  fmt.writeUInt16LE(1, 2)
  fmt.writeUInt32LE(16000, 4)
  fmt.writeUInt32LE(32000, 8)
  fmt.writeUInt16LE(2, 12)
  fmt.writeUInt16LE(16, 14)
  const tags = { INAM: `Test Track ${track}`, IART: 'Local Test Artist', IPRD: `Test Album ${album}`, IGNR: 'Test' }
  const info = Buffer.concat([Buffer.from('INFO'), ...Object.entries(tags).map(([name, value]) => chunk(name, Buffer.from(`${value}\0`)))])
  const body = Buffer.concat([Buffer.from('WAVE'), chunk('fmt ', fmt), chunk('LIST', info), chunk('data', Buffer.alloc(32000 * 16))])
  const header = Buffer.alloc(8)
  header.write('RIFF')
  header.writeUInt32LE(body.length, 4)
  return Buffer.concat([header, body])
}

async function writeMissing(file, data) {
  try { await fs.writeFile(file, data, { flag: 'wx' }) }
  catch (error) { if (error.code !== 'EEXIST') throw error }
}

// Only generated silence and original test lyrics; never discovers a user library.
export async function prepareDevFixtures(directory) {
  for (let album = 1; album <= 3; album++) {
    const folder = path.join(directory, `Test Album ${album}`)
    await fs.mkdir(folder, { recursive: true })
    for (let track = 1; track <= 2; track++) {
      const basename = path.join(folder, `${String(track).padStart(2, '0')} Test Track ${track}`)
      await writeMissing(`${basename}.wav`, silentWave(album, track))
      await writeMissing(`${basename}.lrc`, '[00:00.00]Local development test\n[00:03.00]A quiet window opens\n[00:06.00]The light moves across the shelf\n[00:09.00]Original words for a silent track\n[00:12.00]Ready for the next change\n')
    }
  }
  return directory
}
