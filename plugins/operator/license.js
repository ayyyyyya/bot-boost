import { format } from 'date-fns'
import PhoneNumber from 'awesome-phonenumber'

export const run = {
   usage: ['license'],
   hidden: ['lsc'],
   category: 'operator',
   async: async (m, {
      client,
      Utils
   }) => {
      await client.sendReact(m.chat, '🕒', m.key)

      const json = await client.license()
      if (!json.status) return m.reply(json.msg)

      let pr = `▦ *License* : ${json.data.license}\n`
      pr += `▦ *Owner* : ${new PhoneNumber('+' + json.data.number).getNumber('international')}\n`
      pr += `▦ *Bound IP* : ${json.data.boundIP}\n`
      pr += `▦ *Valid* : ${json.data.isValid ? '√' : '×'}\n`
      pr += `▦ *Status* : ${Utils.ucword(json.data.status)}\n`
      pr += `▦ *Register* : ${format(new Date(json.data.createdAt), 'EEE, dd MMMM yyyy')}\n`
      pr += `▦ *Expired* : ${format(new Date(json.data.expiredAt), 'EEE, dd MMMM yyyy')} (${json.data.days_left} Days Left)\n\n`
      pr += `> This license has an expiration date, but you're free to renew it anytime.`

      m.reply(pr)
   },
   error: false,
   operator: true,
   private: true
}
