import { Version } from '@neoxr/wb'
import fs from 'node:fs'

export const run = {
   usage: ['menu', 'help', 'command', 'allmenu'],
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      setting,
      plugins,
      Config,
      Utils,
      system
   }) => {
      try {
         const hidden = Array.isArray(setting?.hidden)
            ? setting.hidden.map(v => String(v).toLowerCase())
            : []

         let local_size = ''
         try {
            const dbPath = './' + Config.database + '.json'
            local_size = fs.existsSync(dbPath)
               ? await Utils.formatSize(fs.statSync(dbPath).size)
               : ''
         } catch {
            local_size = ''
         }

         let baileysVersion = 'unknown'
         try {
            const library = JSON.parse(fs.readFileSync('./node_modules/baileys/package.json', 'utf-8'))
            baileysVersion = library.version || 'unknown'
         } catch {
            baileysVersion = 'unknown'
         }

         const template = String(setting?.msg || `Hi +tag

◦ Module : +module
◦ Database : +db
◦ Library : Baileys v+version`)

         const message = template
            .replace(/\+tag/g, `@${m.sender.replace(/@.+/g, '')}`)
            .replace(/\+name/g, m.pushName || 'User')
            .replace(/\+greeting/g, Utils.greeting())
            .replace(/\+db/g, system.name === 'Local' ? `Local (${local_size})` : system.name)
            .replace(/\+module/g, Version)
            .replace(/\+version/g, baileysVersion)

         const style = Number(setting?.style || 4)

         const category = {}

         for (let name in plugins) {
            const obj = plugins[name]
            const cmd = obj?.run

            if (!cmd?.usage || !cmd?.category) continue

            const cat = String(cmd.category).toLowerCase()
            if (hidden.includes(cat)) continue

            if (!category[cmd.category]) category[cmd.category] = []
            category[cmd.category].push(cmd)
         }

         const keys = Object.keys(category).sort()

         const getFormattedCommands = (catName) => {
            const commands = []

            Object.entries(plugins || {}).map(([_, v]) => {
               const cmd = v?.run
               if (!cmd?.usage || !cmd?.category) return

               const cat = String(cmd.category).toLowerCase()
               if (cat !== String(catName).toLowerCase()) return
               if (hidden.includes(cat)) return

               const usages = Array.isArray(cmd.usage) ? cmd.usage : [cmd.usage]

               usages.map(x => {
                  if (!x) return

                  commands.push({
                     usage: x,
                     use: cmd.use ? Utils.texted('bold', cmd.use) : ''
                  })
               })
            })

            return commands.sort((a, b) => a.usage.localeCompare(b.usage))
         }

         const formatPrefixList = (commandsList) => {
            if (!commandsList.length) return ''

            return commandsList.map((v, i) => {
               if (i === 0) return `┌  ◦  ${isPrefix + v.usage} ${v.use}`
               if (i === commandsList.length - 1) return `└  ◦  ${isPrefix + v.usage} ${v.use}`
               return `│  ◦  ${isPrefix + v.usage} ${v.use}`
            }).join('\n')
         }

         const sendSafeMenu = async (caption) => {
            const finalCaption = [caption, global.footer].filter(Boolean).join('\n\n')

            try {
               // Kalau teks panjang, jangan kirim sebagai caption gambar.
               // Ini lebih aman untuk Baileys.
               if (finalCaption.length > 2500) {
                  return client.reply(m.chat, finalCaption, m)
               }

               if (!setting?.cover) {
                  return client.reply(m.chat, finalCaption, m)
               }

               if (Utils.isUrl(setting.cover)) {
                  return await client.sendMessage(m.chat, {
                     image: {
                        url: setting.cover
                     },
                     caption: finalCaption,
                     mentions: [m.sender]
                  }, {
                     quoted: m
                  })
               }

               const buffer = Buffer.from(setting.cover, 'base64')

               return await client.sendMessage(m.chat, {
                  image: buffer,
                  caption: finalCaption,
                  mentions: [m.sender]
               }, {
                  quoted: m
               })
            } catch (e) {
               return client.reply(m.chat, finalCaption, m)
            }
         }

         let print = message + '\n' + String.fromCharCode(8206).repeat(4001)

         if (text) {
            const commands = getFormattedCommands(text.trim())

            if (!commands.length) {
               return client.reply(m.chat, `🚩 Menu *${text}* tidak ditemukan.`, m)
            }

            const categoryText = `乂  *${text.toUpperCase().split('').join(' ')}*\n\n${formatPrefixList(commands)}`
            return sendSafeMenu(categoryText)
         }

         if (command === 'allmenu') {
            for (let k of keys) {
               const commands = getFormattedCommands(k)
               if (!commands.length) continue

               print += '\n\n乂  *' + k.toUpperCase().split('').join(' ') + '*\n\n'
               print += commands.map(v => `   ◦  ${isPrefix + v.usage} ${v.use}`).join('\n')
            }

            return sendSafeMenu(Utils.Styles(print))
         }

         if (style === 1 || style === 2 || style === 3) {
            for (let k of keys) {
               const divider = style === 1 ? '乂' : '-'
               const commands = getFormattedCommands(k)
               if (!commands.length) continue

               print += `\n\n ${divider}  *` + k.toUpperCase().split('').join(' ') + '*\n\n'
               print += style === 1
                  ? commands.map(v => `   ◦  ${isPrefix + v.usage} ${v.use}`).join('\n')
                  : formatPrefixList(commands)
            }

            const formatted = style === 3 ? print : Utils.Styles(print)
            return sendSafeMenu(formatted)
         }

         if (style === 4 || style === 5 || style === 6 || style === 7) {
            print += '\n'

            const menuCategories = keys.map(k => ({
               usage: command,
               use: k
            }))

            print += formatPrefixList(menuCategories)

            return sendSafeMenu(print)
         }

         print += '\n'

         const menuCategories = keys.map(k => ({
            usage: command,
            use: k
         }))

         print += formatPrefixList(menuCategories)

         return sendSafeMenu(print)
      } catch (e) {
         console.error(e)
         return client.reply(m.chat, Utils.jsonFormat ? Utils.jsonFormat(e) : String(e?.stack || e), m)
      }
   },
   error: false
}
