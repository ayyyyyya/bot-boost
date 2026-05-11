import { toJid } from '../../core/utils/index.js'

export const run = {
   async: async (m, {
      client,
      hostJid,
      clientJid,
      findJid,
      Config,
      Utils
   }) => {
      try {
         let database
         if (hostJid) {
            database = global.db
         } else if (findJid.bot(clientJid)) {
            database = findJid.bot(clientJid).data
         } else {
            database = global.db
         }

         const INACTIVE_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000 // 3 days
         const now = Date.now()

         if (database.users) {
            database.users = database.users.filter(user => {
               const isRecent = (now - user.lastseen) <= INACTIVE_THRESHOLD_MS
               const isProtected = user.premium || user.banned || user.point >= 1000000
               return isRecent || isProtected
            })
         }

         if (database.chats) {
            database.chats = database.chats.filter(chat => (now - chat.lastseen) <= INACTIVE_THRESHOLD_MS)
         }

         if (database.groups) {
            database.groups = database.groups.filter(group => (now - group.activity) <= INACTIVE_THRESHOLD_MS)
         }

         if (global.db.players) {
            const inactivePlayers = global.db.players.filter(player =>
               player.lastseen && (now - player.lastseen) > INACTIVE_THRESHOLD_MS
            )

            if (inactivePlayers.length > 0) {
               inactivePlayers.forEach(player => {
                  const userIndex = database.users.findIndex(u => u.jid === player.jid)

                  if (userIndex !== -1) {
                     database.users[userIndex].rpg = false
                  } else { }
               })
            }

            global.db.players = global.db.players.filter(player =>
               player.lastseen && (now - player.lastseen) <= INACTIVE_THRESHOLD_MS
            )
         }

         if (global.db.bots) {
            const validBots = global.db.bots.filter(bot => bot?.jid)
            global.db.bots = [...new Map(validBots.map(bot => [bot.jid, bot])).values()]
         }

         if (global.db.instance && global.db.bots) {
            const pairingJid = toJid(Config.pairing.number)

            const registeredJids = new Set(global.db.bots.map(bot => bot.jid))
            registeredJids.add(pairingJid)

            const validInstances = global.db.instance.filter(inst =>
               inst?.jid && registeredJids.has(inst.jid)
            )

            global.db.instance = [...new Map(validInstances.map(inst => [inst.jid, inst])).values()]
         }
      } catch (e) {
         console.error(e)
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}