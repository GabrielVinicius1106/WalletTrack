import { readFile, writeFile } from 'fs/promises'

import { input, password, checkbox, select, confirm } from '@inquirer/prompts'

import { loadUserConfig, loadUserOptions, loginUser, showOptions } from './menu.js'
import { existUser, loadID, verifyUser, generateID } from './authentication.js'
import { loadUser, insertUser, updateUserName, updateUserPassword, deleteUser } from './userManager.js'

import { delay, loading } from '../utilities/delay.js'
import { exit } from '../utilities/exit.js'

export const main = async () => {
    console.clear()
    
    let users = await loadUser()
    
    await showOptions()
}