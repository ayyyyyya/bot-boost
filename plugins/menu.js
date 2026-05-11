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
         const local_size = fs.existsSync('./' + Config.database + '.json')
            ? await Utils.formatSize(fs.statSync('./' + Config.database + '.json').size)
            : ''

         const library = JSON.parse(fs.readFileSync('./node_modules/baileys/package.json', 'utf-8'))

         const message = setting.msg
            .replace('+tag', `@${m.sender.replace(/@.+/g, '')}`)
            .replace('+name', m.pushName || 'User')
            .replace('+greeting', Utils.greeting())
            .replace('+db', system.name === 'Local' ? `Local (${local_size})` : system.name)
            .replace('+module', Version)
            .replace('+version', library.version)

         const style = setting.style || 4

         const filter = Object.entries(plugins).filter(([_, obj]) => obj.run.usage)
         const cmdObj = Object.fromEntries(filter)
         const category = {}

         for (let name in cmdObj) {
            const obj = cmdObj[name].run
            if (!obj || !obj.category || setting.hidden.includes(obj.category)) continue
            if (!category[obj.category]) category[obj.category] = []
            category[obj.category].push(obj)
         }

         const keys = Object.keys(category).sort()

         const getFormattedCommands = (catName) => {
            const cmdList = Object.entries(plugins).filter(([_, v]) => {
               return v.run.usage &&
                  v.run.category &&
                  v.run.category.toLowerCase() === catName.toLowerCase() &&
                  !setting.hidden.includes(v.run.category.toLowerCase())
            })

            const commands = []

            cmdList.map(([_, v]) => {
               const usageType = v.run.usage.constructor.name

               if (usageType === 'Array') {
                  v.run.usage.map(x => commands.push({
                     usage: x,
                     use: v.run.use ? Utils.texted('bold', v.run.use) : ''
                  }))
               } else if (usageType === 'String') {
                  commands.push({
                     usage: v.run.usage,
                     use: v.run.use ? Utils.texted('bold', v.run.use) : ''
                  })
               }
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
            const finalCaption = caption + '\n\n' + global.footer

            try {
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
               print += commands.map(v => `	◦  ${isPrefix + v.usage} ${v.use}`).join('\n')
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
                  ? commands.map(v => `	◦  ${isPrefix + v.usage} ${v.use}`).join('\n')
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
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}
