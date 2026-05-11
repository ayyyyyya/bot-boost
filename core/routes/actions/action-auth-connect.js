import { Instance, Config, Utils } from '@neoxr/wb'
import qrcode from 'qrcode'
import { retry, io } from '../../../lib/system/mapping.js'
import system from '../../../lib/system/adapter.js'
import { toJid } from '../../utils/index.js'
import { createHash } from 'crypto'
import { models } from '../../../lib/system/models.js'

export const routes = {
   category: 'action',
   path: '/action/connect',
   method: 'post',
   parameter: ['username', 'email', 'password', 'number', 'owner', 'method'],
   execution: async (req, res, next) => {
      try {
         const { username, email, password, number, owner, method } = req.body

         const usernameAlreadyUse = global.db?.bots?.some(v =>
            v.connector?.override?.username === username
         )

         if (usernameAlreadyUse)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Username is already in use. Choose another username.'
            })

         const emailAlreadyUse = global.db?.bots?.some(v =>
            v.connector?.override?.email === email
         )

         if (emailAlreadyUse)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Email is already in use. Choose another email.'
            })

         const already = global.db?.bots?.find(v =>
            v.jid === toJid(number) ||
            v.connector?.sessionOpts?.owner === toJid(owner) ||
            v.jid === toJid(owner) ||
            v.connector?.sessionOpts?.owner === toJid(number)
         )
         const now = Date.now()

         if (already) {
            if (!already.is_connected && !already.stop && !already.is_logout) {
               already.is_logout = true
            }

            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Bot or Owner number is already registered.'
            })
         }

         const result = await req.bot.sock.onWhatsApp(String(number))
         const { jid, exists } = result?.[0] || {}

         if (!exists)
            return res.status(404).json({
               creator: global.creator,
               status: false,
               message: 'Bot number is not registered on WhatsApp.'
            })

         let ownerJid = toJid(owner)
         if (number != owner) {
            const result = await req.bot.sock.onWhatsApp(ownerJid)
            const { jid, exists } = result?.[0] || {}
            if (!exists)
               return res.status(404).json({
                  creator: global.creator,
                  status: false,
                  message: 'Owner number is not registered on WhatsApp.'
               })

            ownerJid = jid
         }

         const isRegistered = global.db?.bots?.some(v =>
            v?.is_connected &&
            (
               v?.connector?.sessionOpts?.number === number ||
               v?.connector?.sessionOpts?.owner === toJid(owner)
            )
         )

         if (isRegistered)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'The owner or bot number already registered'
            })

         if (req.io) {
            io.set(jid, req.io)
         } else {
            console.error(`[CRITICAL] req.io is undefined for JID: ${jid}. WebSocket updates will fail.`)
            return res.status(500).json({
               creator: global.creator,
               status: false,
               message: 'Internal Error: WebSocket handler not available.'
            })
         }

         if (retry.has(jid))
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'You are in the process of connecting, please wait a moment before trying again.'
            })

         if (!['pairing', 'qr'].includes(method))
            return res.status(400).json({
               creator: global.creator,
               status: false,
               message: 'Invalid connection method.'
            })


         if (!already && (global.db?.bots?.length >= Config.bot_hosting.slot))
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'Sorry, the bot host slots are full.'
            })

         if (Instance.getBotDataByJid(jid)?.is_connected)
            return res.status(403).json({
               creator: global.creator,
               status: false,
               message: 'The bot is already connected.'
            })

         io.set(jid, req.io)

         res.status(200).json({
            creator: global.creator,
            status: true,
            message: 'The connection process has started. Please scan the QR or enter the code.'
         })

         const msisdn = jid.replace(/\D/g, '')
         const socket = await req.bot.create({
            session: ['sqlite', 'local'].includes(system.session)
               ? `./${Config.bot_hosting.session_dir}/${msisdn}`
               : String(msisdn),
            type: system.session,
            number: msisdn,
            owner: ownerJid,
            owner_name: already?.connector?.sessionOpts?.owner_name || 'Owner',
            config: process.env.DATABASE_URL || ''
         }, {
            state: method === 'pairing',
            number: msisdn,
            code: Config.pairing.code
         }, {
            username: already?.connector?.override?.username || username,
            email: already?.connector?.override?.email || email,
            password: already?.connector?.override?.password || createHash('sha256').update(password).digest('hex')
         })

         socket.register('connect', async ctx => {
            const { sock } = socket
            const timeoutDuration = 59_000
            const timers = setTimeout(() => {
               if (retry.has(jid)) {
                  req.io.emit(`status.${msisdn}`, {
                     jid,
                     status: 'timeout',
                     message: 'The request has ended, the bot did not connect within the time limit.'
                  })
                  sock.end()
                  retry.delete(jid)
                  Utils.removeItem(global.db.bots, global.db.bots.find(v => v.jid === jid))
               }
            }, timeoutDuration)

            const record = global.db?.bots?.find(v => v.jid === jid)

            await system.proxy.init(models, models.structure, Config.database, jid)

            const isEmpty = !record?.data?.users?.length && !record?.data?.chats?.length

            if (isEmpty) {
               const previous = await system.database.fetchByJid(jid)

               if (previous && Object.keys(previous).length > 0) {
                  console.dim('[Proxy DB] Old data found, starting migration...')
                  await system.proxy.migrate(previous, models.structure, jid)
                  console.dim('[Proxy DB] Migration successful!')
               }
            }

            retry.set(jid, timers)

            if (ctx?.qr) {
               const buffer = await qrcode.toBuffer(ctx.qr, { type: 'png' })
               req.io.emit(`connect.${msisdn}`, {
                  jid,
                  qr: buffer.toString('base64'),
                  code: null
               })
            }

            if (ctx?.code) {
               req.io.emit(`connect.${msisdn}`, {
                  jid,
                  qr: null,
                  code: ctx.code
               })
            }
         })
      } catch (e) {
         Utils.printError(e)
         if (!res.headersSent) {
            res.status(500).json({
               creator: global.creator,
               status: false,
               message: e.message
            })
         }
      }
   },
   error: false,
   challenge: true
}