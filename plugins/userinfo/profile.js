import { USD } from '../../lib/games/rpg-utils.js'

export const run = {
   usage: ['profile'],
   use: 'mention or reply',
   category: 'user info',
   async: async (m, {
      client,
      text,
      blockList,
      hostJid,
      clientJid,
      findJid,
      Config,
      setting,
      Utils
   }) => {
      let users = hostJid ? global.db.users : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.users : global.db.users
      let chats = hostJid ? global.db.chats : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.chats : global.db.chats
      let groups = hostJid ? global.db.groups : findJid.bot(clientJid) ? findJid.bot(clientJid)?.data?.groups : global.db.groups
      let number = isNaN(text) ? (text.startsWith('+') ? text.replace(/[()+\s-]/g, '') : (text).split`@`[1]) : text
      if (!text && !m.quoted) return client.reply(m.chat, Utils.texted('bold', `🚩 Mention or Reply chat target.`), m)
      if (isNaN(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid number.`), m)
      if (number.length > 15) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid format.`), m)
      try {
         if (text) {
            var user = number + '@s.whatsapp.net'
         } else if (m.quoted.sender) {
            var user = m.quoted.sender
         } else if (m.mentionedJid) {
            var user = number + '@s.whatsapp.net'
         }
      } catch (e) { } finally {
         let target = users.find(v => v.jid == user)
         if (typeof target == 'undefined') return client.reply(m.chat, Utils.texted('bold', `🚩 Can't find user data.`), m)
         const avatar = await client.profilePicture(user)
         let blocked = blockList.includes(user) ? true : false
         let now = new Date() * 1
         let lastseen = (target.lastseen == 0) ? 'Never' : Utils.toDate(now - target.lastseen)
         let usebot = (target.usebot == 0) ? 'Never' : Utils.toDate(now - target.usebot)
         let caption = `乂  *U S E R - P R O F I L E*\n\n`
         caption += `	◦  *Name* : ${target.name}\n`
         caption += `	◦  *Pocket* : ${USD.format(target.pocket)}\n`
         caption += `	◦  *Balance* : ${USD.format(target.balance)}\n`
         caption += `	◦  *Point* : ${Utils.formatNumber(target.point)}\n`
         caption += `	◦  *Guard* : ${Utils.formatNumber(target.guard)}\n`
         caption += `	◦  *Limit* : ${Utils.formatNumber(target.limit)}\n`
         caption += `	◦  *Game Limit* : ${Utils.formatNumber(target.limit_game)}\n`
         caption += `	◦  *Level* : ${Utils.level(target.point, Config.multiplier)[0]} (${Utils.role(Utils.level(target.point, Config.multiplier)[0])})\n`
         caption += `	◦  *Hitstat* : ${Utils.formatNumber(target.hit)}\n`
         caption += `	◦  *Warning* : ${((m.isGroup) ? (typeof groups.find(v => v.jid == m.chat).member[user] != 'undefined' ? groups.find(v => v.jid == m.chat).member[user].warning : 0) + ' / 5' : target.warning + ' / 5')}\n\n`
         caption += `乂  *R E F E R R A L*\n\n`
         caption += `	◦  *Total* : ${USD.format(target?.referrals?.reduce((sum, v) => sum + v.reward, 0) || 0) || 0}\n`
         caption += `	◦  *Referral* : ${target?.referrals?.length || 0}\n`
         caption += `	◦  *Code* : ${target?.refcode || '-'}\n\n`
         caption += `乂  *U S E R - S T A T U S*\n\n`
         caption += `	◦  *Blocked* : ${(blocked ? '√' : '×')}\n`
         caption += `	◦  *Banned* : ${(new Date - target.ban_temporary < Config.timeout) ? Utils.toTime(new Date(target.ban_temporary + Config.timeout) - new Date()) + ' (' + ((Config.timeout / 1000) / 60) + ' min)' : target.banned ? '√' : '×'}\n`
         caption += `	◦  *Use In Private* : ${(chats.map(v => v.jid).includes(user) ? '√' : '×')}\n`
         caption += `	◦  *Premium* : ${(target.premium ? '√' : '×')}\n`
         caption += `	◦  *Expired* : ${target.expired == 0 ? '-' : Utils.timeReverse(target.expired - new Date() * 1)}\n`
         caption += `	◦  *Partner* : ${(target.taken ? '@' + target?.partner?.replace(/@.+/, '') : '-')}\n`
         caption += `	◦  *Verified* : ${(target.verified ? '√' : '×')}\n\n`
         caption += global.footer
         client.sendMessageModify(m.chat, caption, m, {
            largeThumb: true,
            type: 'preview-link',
            ratio: 'square',
            thumbnail: avatar,
            url: setting.link
         })
      }
   },
   error: false
}