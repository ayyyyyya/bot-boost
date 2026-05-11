import { captcha } from '../../lib/canvas.js'

export const run = {
   async: async (m, {
      client,
      body,
      users,
      setting,
      isOwner,
      prefixes,
      Utils
   }) => {
      try {
         client.verify = client?.verify || {}
         const isShouldVerify = !m.isGroup && !users?.banned && !users?.verified && setting?.verify && !isOwner

         if (isShouldVerify && body === '1' && !client.verify?.[m.chat]) {
            const code = captcha()

            const caption = `Complete verification by replying with the captcha code from the image.`

            await client.sendMessageModify(m.chat, caption, null, {
               largeThumb: true,
               type: 'preview-link',
               thumbnail: code.image
            }, { disappear: 8400 }).then(() => {
               users.codeExpire = new Date * 1
               users.code = code.text
               users.email = ''
            })

            client.verify[m.chat] = {
               chat: null,
               to: m.sender,
               code: code,
               timeout: setTimeout(() => {
                  if (client.verify[m.chat]) return client.reply(m.chat, Utils.texted('bold', `⚠ Your verification code has expired.`), client.verify?.[m.chat]?.chat, { disappear: 8400 }).then(async () => {
                     users.codeExpire = -1
                     users.code = ''
                     users.email = ''
                     users.attempt = 0
                     clearTimeout(client.verify[m.chat].timeout)
                     delete client.verify[m.chat]
                  })
               }, 60 * 1000 * 3),
               type: 'captcha'
            }
         }

         if (isShouldVerify && body === '2' && !client.verify?.[m.chat]) {
            let note = `You have selected *Email Verification*. Send your active email address using this command :\n\n`
            note += `${prefixes[0]}reg <email>`
            m.reply(note)
         }

         if (!m.isGroup && body?.length > 1 && !users.verified && client.verify?.[m.chat]?.type === 'captcha') {
            if (users.jid === m.sender && users.code !== body.trim()) return client.reply(m.chat, Utils.texted('bold', '❌ Your captcha is wrong.'), m)
            if (new Date - users.codeExpire > 180000) return client.reply(m.chat, Utils.texted('bold', '⚠ Your captcha has expired.'), m).then(() => {
               users.codeExpire = -1
               users.code = ''
               users.email = ''
               users.attempt = 0
            })
            return client.reply(m.chat, Utils.texted('bold', `✅ Your number has been successfully verified (+50 Limit)`), m).then(() => {
               users.codeExpire = -1
               users.code = ''
               users.attempt = 0
               users.verified = true
               users.limit += 50
               if (client?.verify?.[m.chat]?.timeout) {
                  clearTimeout(client?.verify[m.chat].timeout)
                  delete client.verify[m.chat]
               }
            })
         }

         if (!m.isGroup && body?.length === 6 && /\d{6}/.test(body) && !users.verified && client.verify?.[m.chat]?.type === 'email') {
            if (users.jid == m.sender && users.code != body.trim()) return client.reply(m.chat, Utils.texted('bold', '❌ Your verification code is wrong.'), m)
            if (new Date - users.codeExpire > 180000) return client.reply(m.chat, Utils.texted('bold', '⚠ Your verification code has expired.'), m).then(() => {
               users.codeExpire = -1
               users.code = ''
               users.email = ''
               users.attempt = 0
            })
            return client.reply(m.chat, Utils.texted('bold', `✅ Your number has been successfully verified (+50 Limit)`), m).then(() => {
               users.codeExpire = -1
               users.code = ''
               users.attempt = 0
               users.verified = true
               users.limit += 50
               if (client?.verify?.[m.chat]?.timeout) {
                  clearTimeout(client?.verify[m.chat].timeout)
                  delete client.verify[m.chat]
               }
            })
         }
      } catch (e) {
         console.log(e)
         m.reply(Utils.jsonFormat(e))
      }
   },
   error: false,
   private: true
}