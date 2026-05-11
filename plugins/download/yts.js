import yts from 'yt-search'

export const run = {
   usage: ['ytsearch'],
   hidden: ['yts', 'ytfind', 'mp3', 'mp4'],
   use: 'query',
   category: 'downloader',
   async: async (m, {
      client,
      text,
      isPrefix,
      command,
      users,
      Config,
      Utils
   }) => {
      try {
         client.yts = client.yts || []
         if (!text) return client.reply(m.chat, Utils.example(isPrefix, command, 'lathi'), m)

         const check = client.yts.find(v => v.jid === m.sender)
         const index = parseInt(text)
         const isNumber = !isNaN(index)

         if (/mp3|mp4/.test(command)) {
            if (!check || !isNumber) return client.reply(m.chat, Utils.texted('bold', '🚩 Session expired. Please search again.'), m)
            if (index < 1 || index > check.results.length) return client.reply(m.chat, Utils.texted('bold', '🚩 Invalid selection.'), m)

            client.sendReact(m.chat, '🕒', m.key)
            const url = check.results[index - 1]

            let json = command === 'mp4'
               ? await Api.neoxr('/youtube', { url, type: 'video', quality: '720p' }).catch(() => null)
               : await Api.neoxr('/youtube', { url, type: 'audio', quality: '128kbps' }).catch(() => null)

            if (command === 'mp4' && !json?.status)
               json = await Api.neoxr('/youtube', { url, type: 'video', quality: '480p' }).catch(() => null)

            if (!json?.status || !json?.data) return client.reply(m.chat, Utils.jsonFormat(json), m)

            const size = json.data.size || '0MB'
            const isOver = Utils.sizeLimit(size, users.premium ? Config.max_upload : Config.max_upload_free).oversize
            if (isOver) return client.reply(m.chat, users.premium
               ? `💀 File size (${size}) exceeds limit.`
               : `⚠️ File size (${size}) too big. Max ${Config.max_upload_free} MB (Free), ${Config.max_upload} MB (Premium).`, m)

            const thumb = await Utils.fetchAsBuffer(json.thumbnail).catch(() => null)
            const jpeg = await Utils.generateImageThumbnail(json.thumbnail).catch(() => null)
            const caption = `乂  *Y T - ${command.toUpperCase()?.split('')?.join(' ')}*\n\n` +
               `	◦  *Title* : ${json.title}\n` +
               `	◦  *Size* : ${size}\n` +
               `	◦  *Duration* : ${json.duration}\n` +
               `	◦  *Quality* : ${json.data.quality}\n\n` +
               global.footer

            await client.sendMessageModify(m.chat, caption, m, { largeThumb: true, thumbnail: thumb })
            return client.sendFile(m.chat, json.data.url, json.data.filename, '', m, { document: true, APIC: thumb }, { jpegThumbnail: jpeg })
         }

         client.sendReact(m.chat, '🕒', m.key)
         const res = await yts(text).catch(() => null)
         if (!res?.all?.length) return client.reply(m.chat, global.status.fail, m)

         const vids = res.all.filter(v => v.timestamp)
         const urls = vids.map(v => v.url)
         if (!check) client.yts.push({ jid: m.sender, results: urls, created_at: Date.now() })
         else Object.assign(check, { results: urls, created_at: Date.now() })

         let p = `To get audio use *${isPrefix}mp3 number* and video use *${isPrefix}mp4 number*\n*Example* : ${isPrefix}mp4 1\n\n`
         vids.forEach((v, i) => p += `*${i + 1}*. ${v.title}\n◦ *Duration* : ${v.timestamp}\n◦ *Views* : ${Utils.h2k(v.views || 0)}\n◦ *Link* : ${v.url}\n\n`)
         client.reply(m.chat, p + global.footer, m)

         setTimeout(() => {
            const session = client.yts.find(v => v.jid === m.sender)
            if (session) Utils.removeItem(client.yts, session)
         }, 60_000)
      } catch (err) {
         console.error(err)
         return client.reply(m.chat, global.status.error, m)
      }
   },
   error: false,
   limit: true,
   restrict: true
}