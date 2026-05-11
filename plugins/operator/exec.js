import { exec, spawn } from 'child_process'
import vm from 'node:vm'
import syntax from 'syntax-error'
import { format, promisify } from 'util'
const execAsync = promisify(exec)

export const run = {
   async: async (m, {
      client,
      body,
      ctx,
      isOperator,
      hostJid,
      clientJid,
      findJid,
      bot,
      Config,
      Utils,
      database,
      Scraper,
      participants,
      groupSet
   }) => {
      if (typeof body != 'string' || !isOperator) return
      let command, code
      let lines = body && body.trim().split('\n')
      let first = lines && lines[0] ? lines[0].trim() : ''
      let rest = lines ? lines.slice(1).join('\n') : ''
      command = first ? first.split(' ')[0] : ''
      let content = first ? first.split(' ').slice(1).join(' ') : ''
      code = `${content}${content && rest ? '\n' : ''}${rest}`.trim()
      if (!code) return

      try {
         if (['>', '~'].includes(command)) {
            const exec = `(async () => { ${code} })()`
            const evaluate = command === '>' ? await eval(exec) : await safeEval(exec, { ctx, client, Utils, Scraper })
            m.reply(format(evaluate))
         } else if (['=>', '~>'].includes(command)) {
            const exec = `(async () => { return ${code} })()`
            const evaluate = command === '=>' ? await eval(exec) : await safeEval(exec, { ctx, client, Utils, Scraper })
            m.reply(format(evaluate))
         } else if (['$'].includes(command)) {
            await client.sendReact(m.chat, '🕒', m.key)
            const [cmd, ...args] = code.trim().split(' ')
            const proc = spawn(cmd, args)
            proc.stdout.on('data', async (data) => {
               const text = data.toString()
               console.log('stdout:', text)
               await m.reply(text)
            })
            proc.stderr.on('data', async (data) => {
               const text = data.toString()
               await Utils.delay(1500)
               await m.reply(text)
            })
            proc.on('close', async (code) => { })
            proc.on('error', async (err) => {
               await m.reply(`❌ Failed to run command: ${err.message}`)
            })
         } else if (['%'].includes(command)) {
            await client.sendReact(m.chat, '🕒', m.key)
            const { stdout, stderr } = await execAsync(code.trim(), { maxBuffer: 1024 * 1024 })
            if (stderr) {
               await m.reply(stderr.toString())
            }
            if (stdout) {
               await m.reply(stdout.toString())
            }
         }
      } catch (e) {
         const error = await syntax(code)
         m.reply(typeof error != 'undefined' ? Utils.texted('monospace', error) + '\n\n' : '' + format(e))
      }
   },
   error: false,
   operator: true
}

/**
 * Safely evaluates JavaScript code in a restricted VM context.
 *
 * This function creates a sandboxed Configironment using Node.js's `vm` module
 * to securely execute arbitrary code strings without giving access to dangerous
 * global objects or functions. It disables potentially harmful features such as
 * `eval`, `Function` constructors, and `require` to prevent unauthorized code execution.
 *
 * @param {string} code - The JavaScript code to be executed.
 * @param {Object} [extraContext={}] - Optional additional variables or functions
 *     to be injected into the sandbox context.
 *
 * @returns {Promise<*>} - The result of the evaluated code or an error message
 *     string prefixed with ❌ if execution fails or times out.
 */
const safeEval = async (code, extraContext = {}) => {
   const sandbox = {
      console: {
         log: () => { }
      },
      ...extraContext,
      eval: () => { throw new Error('eval is disabled') },
      Function: () => { throw new Error('Function constructor is disabled') },
      require: () => { throw new Error('require is disabled') },
      process: undefined,
      global: undefined,
      globalThis: undefined,
      this: undefined,
      constructor: undefined
   }

   Object.freeze(sandbox)
   const context = vm.createContext(sandbox)

   const script = new vm.Script(code)

   try {
      const result = await script.runInContext(context, { timeout: 1000 })
      return result
   } catch (err) {
      return `❌ ${err.message}`
   }
}