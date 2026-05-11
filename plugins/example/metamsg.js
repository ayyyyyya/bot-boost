import fs from 'node:fs'

export const run = {
   usage: ['metacode', 'metatable'],
   category: 'example',
   async: async (m, {
      client,
      command,
      Utils
   }) => {
      try {
         await client.sendReact(m.chat, '🕒', m.key)

         if (command === 'metacode') {
            client.sendMetaMsg(m.chat, {
               text: 'This is an example of sending a message with a code format.',
               code: {
                  language: 'javascript',
                  code: fs.readFileSync('./error.js', 'utf-8')
               }
            })
         }

         if (command === 'metatable') {
            client.sendMetaMsg(m.chat, {
               text: 'This is an example of sending a table.',
               table: {  
                  title: 'Data',  
                  headers: ['Code', 'Artist'],  
                  rows: [  
                    ['SSIN-273', 'Yua Mikami'],  
                    ['RTXU-849', 'Megawait']  
                  ]  
                }
            })
         }
      } catch (e) {
         client.reply(m.chat, Utils.jsonFormat(e), m)
      }
   },
   error: false
}