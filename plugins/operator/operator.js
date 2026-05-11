export const run = {
   usage: ['+operator', '-operator'],
   hidden: ['+op', '-op'],
   use: 'mention or reply',
   category: 'operator',
   async: async (m, {
      client,
      text,
      command,
      setup,
      Utils
   }) => {
      try {
         let input = text ? text : m.quoted ? m.quoted.sender : m.mentionedJid.length > 0 ? m.mentioneJid[0] : false
         if (!input) return client.reply(m.chat, Utils.texted('bold', `🚩 Mention or reply chat target.`), m)
         let p = await client.onWhatsApp(input.trim())
         if (p.length == 0) return client.reply(m.chat, Utils.texted('bold', `🚩 Invalid number.`), m)
         let jid = client.decodeJid(p[0].jid)
         let number = jid.replace(/@.+/, '')
         if (['+operator', '+op'].includes(command)) { // add operator number
            let operators = setup.operators
            if (operators.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is already the operator.`), m)
            operators.push(number)
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully added @${number} as operator.`), m)
         } else if (['-operator', '-op'].includes(command)) { // remove operator number
            let operators = setup.operators
            if (!operators.includes(number)) return client.reply(m.chat, Utils.texted('bold', `🚩 Target is not operator.`), m)
            operators.forEach((data, index) => {
               if (data === number) operators.splice(index, 1)
            })
            client.reply(m.chat, Utils.texted('bold', `🚩 Successfully removing @${number} from operator list.`), m)
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false,
   operator: true
}