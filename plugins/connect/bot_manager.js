import { Instance } from '@neoxr/wb'
import fs from 'node:fs'

export const run = {
   usage: ['listbot', 'botinfo', 'logout'],
   category: 'bot hosting',
   async: async (m, {
      client,
      command,
      Config,
      Utils
   }) => {
      try {
         const formatNum = num => Utils.texted('bold', Utils.formatNumber(num))
         if (command === 'listbot') {
            global.db.bots = global.db.bots ? global.db.bots : []
            if (!global.db.bots.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No bots connected.`), m)

            let pr = `乂  *L I S T  B O T*\n\n`

            for (let i = 0; i < global.db.bots.length; i++) {
               const v = global.db.bots[i]
               const user = global.db.users.find(x => x.jid === v.jid)
               const name = user ? user.name : 'No Name'

               if (!v?.account) v.account = Utils.randomInt(999999, 100000)

               let isBusiness = false
               try {
                  const biz = await client.getBusinessProfile(v.jid)
                  if (biz) isBusiness = true
               } catch {
                  isBusiness = false
               }

               pr += `*${i + 1}. ${Utils.maskNumber(client.decodeJid(v.jid).replace(/@.+/, ''))}*\n`
               pr += `◦ *Account ID* : ${v.account}\n`
               pr += `◦ *Name* : ${name}\n`
               pr += `◦ *Method* : ${v.method === 'pairing' ? 'Pairing Code' : 'Scan QR'}\n`
               pr += `◦ *Last Connect* : ${v.last_connect > 0 ? Utils.timeAgo(v.last_connect) : '-'}\n`
               pr += `◦ *Connected* : ${v.is_connected ? '✅' : '❌'}\n`
               pr += `◦ *Logout* : ${v.is_logout ? '✅' : '❌'}\n`
               pr += `◦ *Plan* : ${v?.plan ? Utils.ucword(v.plan) : '-'}\n`
               pr += `◦ *Limit* : ${v?.limit || 0}\n`
               pr += `◦ *WhatsApp* : ${isBusiness ? 'Business (w4b)' : 'Original'}\n`
               pr += `◦ *Expired At* : ${v?.expired > 1 ? Utils.timeReverse(v.expired - new Date() * 1) : '-'}\n`
               pr += `◦ *Data* : ${formatNum(v?.data?.users?.length || 0)} User(s), ${formatNum(v?.data?.chats?.length || 0)} Chat(s) and ${formatNum(v?.data?.groups?.length || 0)} Group(s)\n\n`
            }

            pr += global.footer
            client.reply(m.chat, pr, m)
         } else if (command === 'botinfo') {
            if (!global.db.bots.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No bots connected.`), m)
            const fn = global.db.bots.find(v => v.jid === client.decodeJid(client.user.id))
            if (!fn) return client.reply(m.chat, Utils.texted('bold', `🚩 No information for this bot.`), m)
            let pr = `乂  *B O T I N F O*\n\n`
            pr += `   ◦ *Account ID* : ${fn?.account || '-'}\n`
            pr += `   ◦ *JID* : @${fn.jid.replace(/@.+/, '')}\n`
            pr += `   ◦ *Name* : ${global.db.users.find(x => x.jid === fn.jid) ? global.db.users.find(x => x.jid === fn.jid).name : 'No Name'}\n`
            pr += `   ◦ *Last Connect* : ${Utils.timeAgo(fn.last_connect)}\n`
            pr += `   ◦ *Plan* : ${fn?.plan ? Utils.ucword(fn.plan) : '-'}\n`
            pr += `   ◦ *Limit* : ${fn?.limit || 0}\n`
            pr += `   ◦ *Expired At* : ${fn?.expired > 1 ? Utils.timeReverse(fn.expired - new Date() * 1) : '-'}\n\n`
            pr += global.footer
            client.reply(m.chat, pr, m)
         } else if (command === 'logout') {
            if (!global.db?.bots || !Array.isArray(global.db.bots)) return client.reply(m.chat, Utils.texted('bold', `🚩 Bot database not available.`))
            if (!global.db.bots.length) return client.reply(m.chat, Utils.texted('bold', `🚩 No bots connected.`), m)
            const fn = global.db.bots.find(v => v.jid === client.decodeJid(client.user.id) || v.connector.sessionOpts.owner === m.sender)
            if (!fn || (fn?.sender !== m.sender && fn?.jid !== m?.sender)) return client.reply(m.chat, Utils.texted('bold', `🚩 You can't access this feature.`), m)
            const instance = Instance.getSocketByJid(fn.jid)
            if (!instance) return client.reply(m.chat, Utils.texted('bold', `🚩 Bot instance not found.`), m)
            client.reply(m.chat, Utils.texted('bold', `✅ Bot disconnected (Logout).`), m).then(() => {
               instance.logout()
               if (fs.existsSync(`./${Config.bot_hosting.session_dir}/${fn.jid.replace(/@.+/, '')}`)) fs.rmSync(`./${Config.bot_hosting.session_dir}/${fn.jid.replace(/@.+/, '')}`, {
                  recursive: true,
                  force: true
               })
            })
         }
      } catch (e) {
         client.reply(m.chat, Utils.texted('bold', `🚩 ${e.message}.`), m)
      }
   },
   error: false
}