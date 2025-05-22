// IMPORTANDO MÓDULOS E FUNÇÕES

// @inquirer/prompts
import { input, password, checkbox, select, confirm } from '@inquirer/prompts'

// fs/promises
import { readFile, writeFile } from 'fs/promises'

// menu.js
import { loadUserConfig, loadUserOptions, loginUser, showOptions } from './project/menu.js'

// userManager.js
import { loadUser, insertUser, updateUserName, updateUserPassword, deleteUser } from './project/userManager.js'

// authentication.js
import { existUser, loadID, verifyUser, generateID } from './project/authentication.js'

// main.js
import { main } from './project/main.js'

// delay.js
import { delay, loading } from './utilities/delay.js'

// exit.js
import { exit } from './utilities/exit.js'


// PROGRAMA PRINCIPAL
await main()