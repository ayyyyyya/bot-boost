export const models = {
   get users() {
      return {
         lid: null,
         banned: false,
         ban_temporary: 0,
         ban_times: 0,
         point: 0,
         balance: 0,
         pocket: 0,
         deposito: 0,
         guard: 0,
         lastclaim: 0,
         lastrob: 0,
         premium: false,
         expired: 0,
         lastnotified: 0,
         lastseen: 0,
         hit: 0,
         warning: 0,
         attempt: 0,
         code: '',
         codeExpire: 0,
         email: '',
         verified: false,
         taken: false,
         partner: ''
      }
   },
   get players() {
      return {
         exp: 1000,
         agility: 0,
         strength: 0,
         defense: 0,
         health: 100,
         stamina: 0,
         lucky: 1,
         inventory: {},
         resource: {
            potion: 10,
            wood: 0,
            rock: 0,
            iron: 0,
            string: 0,
            diamond: 0,
            emerald: 0,
            gold: 0,
            trash: 0,
            thread: 0,
            legendary: 0,
            mythic: 0,
            superior: 0,
            common: 0,
            uncommon: 0,
            fish: 0,
            bone: 0,
            carrot: 0,
            rat: 0,
            fire: 0,
            lettuce: 0
         },
         pets: [],
         tools: [],
         location: 0,
         clan: 0,
         last: {
            daily: 0,
            weekly: 0,
            monthly: 0,
            adventure: 0,
            dungeon: 0,
            robbing: 0,
            mining: 0,
            feeding: 0,
            gym: 0
         },
         berserker: {
            lose: 0,
            winner: 0,
            last: 0
         },
         petbattle: {
            lose: 0,
            winner: 0
         },
         quest: [],
         lastseen: new Date * 1
      }
   },
   get groups() {
      return {
         name: '',
         activity: 0,
         antibot: false,
         antiporn: false,
         antidelete: false,
         antilink: false,
         antitagsw: true,
         antivirtex: false,
         adminonly: false,
         captcha: false,
         filter: false,
         game: true,
         mysterybox: false,
         left: false,
         localonly: false,
         list: [],
         mute: false,
         autosticker: false,
         restrict: false,
         member: {},
         text_left: '',
         text_welcome: '',
         welcome: false,
         expired: 0,
         lastnotified: 0,
         stay: false
      }
   },
   get chats() {
      return {
         chat: 0,
         lastseen: 0,
         lastreply: 0
      }
   },
   get setting() {
      return {
         autobackup: false,
         autodownload: true,
         antispam: true,
         debug: false,
         chatbot: false,
         games: true,
         verify: false,
         levelup: false,
         notifier: true,
         mimic: [],
         error: [],
         hidden: [],
         pluginDisable: [],
         pluginVerified: [],
         receiver: [],
         except: [],
         schedules: [],
         menfess: [],
         groupmode: false,
         sk_pack: 'Sticker by',
         sk_author: '© neoxr.js',
         self: false,
         noprefix: false,
         multiprefix: true,
         prefix: ['.', '#', '!', '/'],
         toxic: ["ajg", "ajig", "anjas", "anjg", "anjim", "anjing", "anjrot", "anying", "asw", "autis", "babi", "bacod", "bacot", "bagong", "bajingan", "bangsad", "bangsat", "bastard", "bego", "bgsd", "biadab", "biadap", "bitch", "bngst", "bodoh", "bokep", "cocote", "coli", "colmek", "comli", "dajjal", "dancok", "dongo", "fuck", "gelay", "goblog", "goblok", "guoblog", "guoblok", "hairul", "henceut", "idiot", "itil", "jamet", "jancok", "jembut", "jingan", "kafir", "kanjut", "kanyut", "keparat", "kntl", "kontol", "lana", "loli", "lont", "lonte", "mancing", "meki", "memek", "ngentod", "ngentot", "ngewe", "ngocok", "ngtd", "njeng", "njing", "njinx", "oppai", "pantek", "pantek", "peler", "pepek", "pilat", "pler", "pornhub", "pucek", "puki", "pukimak", "redhub", "sange", "setan", "silit", "telaso", "tempek", "tete", "titit", "toket", "tolol", "tomlol", "tytyd", "wildan", "xnxx"],
         online: true,
         onlyprefix: '+',
         owners: [],
         moderators: [],
         lastReset: new Date * 1,
         header: global.header,
         footer: global.footer,
         msg: '𓂃 ☢️ 𝗛𝗮𝗶 +tag 𝘀𝗮𝘆𝗮 𝗮𝗱𝗮𝗹𝗮𝗵  KURUMI - AI 𝘆𝗮𝗻𝗴 𝗯𝗶𝘀𝗮 𝗺𝗲𝗺𝗯𝗮𝗻𝘁𝘂 𝗔𝗻𝗱𝗮 𝗸𝗮𝗽𝗮𝗻 𝘀𝗮𝗷𝗮! 𝗮𝗱𝗮 𝗸𝗲𝗻𝗱𝗮𝗹𝗮 𝗽𝗮𝗱𝗮 𝗯𝗼𝘁? 𝘀𝗶𝗹𝗮𝗵𝗸𝗮𝗻 𝗵𝘂𝗯𝘂𝗻𝗴𝗶 𝗼𝘄𝗻𝗲𝗿!\n𝗦𝗶𝗹𝗮𝗸𝗮𝗻 𝗽𝗶𝗹𝗶𝗵 𝗺𝗲𝗻𝘂 𝘆𝗮𝗻𝗴 𝗔𝗻𝗱𝗮 𝘀𝘂𝗸𝗮! 𝗱𝗮𝗻 𝗵𝗮𝗿𝘂𝘀 𝗶𝗻𝗴𝗮𝘁, 𝗷𝗮𝗻𝗴𝗮𝗻 𝘀𝗽𝗮𝗺 𝗮𝘁𝗮𝘂 𝘁𝗲𝗹𝗽𝗼𝗻 𝗯𝗼𝘁 𝗶𝗻𝗶! 𝗸𝗮𝗿𝗲𝗻𝗮 𝗶𝘁𝘂 𝗺𝗲𝗻𝘆𝗲𝗯𝗮𝗯𝗸𝗮𝗻 𝗯𝗼𝘁 𝗶𝗻𝗶 𝘁𝗲𝗿𝗸𝗲𝗻𝗮 𝗯𝗹𝗼𝗸𝗶𝗿 𝗮𝗸𝗶𝗯𝗮𝘁 𝘀𝗽𝗮𝗺!\n𝘀𝗲𝗹𝗮𝗺𝗮𝘁 𝗺𝗲𝗻𝗶𝗸𝗺𝗮𝘁𝗶 𝗯𝗼𝘁 𝗻𝘆𝗮 ♡ ☢️',
         style: 4,
         rules: '-',
         cover: 'https://imgkub.com/images/2025/09/24/image0fe254c6cbb0910a.jpg',
         link: 'https://whatsapp.com/channel/0029Vai2z6I2kNFonTn6qR3a',
         inbound: 0,
         outbound: 0,
         sent: 0,
         received: 0,
         webhook: {
            url: '',
            method: 'post',
            active: false
         },
         chatbot_config: {
            apikey: {
               gemini: '',
               groq: '',
               cloudflare: {
                  account: '',
                  token: ''
               }
            },
            instruction: 'You are a helpful assistant.',
            model: {
               gemini: 'gemini-robotics-er-1.5-preview',
               groq: 'openai/gpt-oss-120b',
               cloudflare: {
                  text: '@cf/meta/llama-3-8b-instruct',
                  image: '@cf/leonardo/lucid-origin'
               }
            }
         }
      }
   },
   get setup() {
      return {
         username: 'admin',
         password: 'than11',
         operators: [],
         ads: ''
      }
   },
   get member() {
      return {
         afk: -1,
         afkReason: '',
         afkObj: {},
         chat: 0,
         lastseen: new Date(),
         warning: 0,
         left: false,
         joined_at: new Date()
      }
   },
   get structure() {
      return {
         users: [],
         chats: [],
         players: [],
         groups: [],
         bots: [],
         instance: [],
         menfess: [],
         storage: [],
         invoice: [],
         statistic: {},
         sticker: {},
         setting: this.setting,
         setup: this.setting,
         anon: {},
         chatbot: {}
      }
   }
}
