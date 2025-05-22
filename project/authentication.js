import { readFile, writeFile } from 'fs/promises';

import { input, password, checkbox, select, confirm } from '@inquirer/prompts'

import { loadUserConfig, loadUserOptions, loginUser, showOptions } from './menu.js'
import { loadUser, insertUser, updateUserName, updateUserPassword, deleteUser } from './userManager.js'
import { main } from './main.js'

import { delay, loading } from '../utilities/delay.js'
import { exit } from '../utilities/exit.js'

export const loadID = async (name) => {

    let users = await loadUser()

    for (let i = 0; i < users.length; i++) {
        if (users[i].userName === name) {
            return users[i].userID
        }
    }

    return false
}

export const existUser = async (user) => {

    let users = await loadUser()

    for (let i = 0; i < users.length; i++) {
        if (users[i].userName === user) {
            return true
        }
    }

    return false
}

export const verifyUser = async (user, password) => {
    let users = await loadUser();
    for (let i = 0; i < users.length; i++) {
        if (users[i].userName === user && users[i].userPassword === password) {
            return true
        }
    }

    return false
}

export const generateID = (users) => {

    let id = Math.ceil(Math.random() * 1000);

    for (let i = 0; i < users.length; i++) {
        if (users[i].userID === id) {
            return generateID(users);
        }
    }

    return id;

}

export const generateExpenseID = (expenses) => {

    let id = Math.ceil(Math.random() * 10000)
    let expenseIDs = []

    for (let i = 0; i < expenses.length; i++){
        expenseIDs.push(expenses[i].expenseID)
    }

    while (expenseIDs.find((item) => item === id)){
       id = Math.ceil(Math.random() * 10000)
    }

    return id
}   