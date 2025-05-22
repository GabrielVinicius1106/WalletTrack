import { readFile, writeFile } from 'fs/promises';

import { input, password, checkbox, select, confirm } from '@inquirer/prompts'

import { loadUserConfig, loadUserOptions, loginUser, showOptions } from './menu.js'
import { existUser, loadID, verifyUser, generateID } from './authentication.js'
import { main } from './main.js'

import { delay, loading } from '../utilities/delay.js'
import { exit } from '../utilities/exit.js'

export const loadUser = async () => {
    let bd = [];
    try {
        bd = JSON.parse(await readFile("./bd-users.json", {encoding: "utf-8"}))
        return bd.users;
    } catch (error) {
        console.log("Erro: " + error);
    } 
}

export const insertUser = async () => {
    
    let users = await loadUser();
    console.clear()

    console.log("\n   --- INSERT --- \n");
    
    let user = await input({message: "Novo usuário: ", default: ""});

    var REGEX = /\s/g;
    
    // VERIFICAR SE O USUÁRIO JÁ EXISTE
    while (await existUser(user) || user.length == 0 || user.match(REGEX)) {
        if (user.match(REGEX)) {
            console.log("\n Nome de usuário não pode conter espaços! Insira novamente!\n");
        } else if (user.length == 0) {
            console.log("\nNome de usuário não pode ser vazio! Insira novamente!\n");
        } else {
            console.log("\nNome de usuário já existe! Insira novamente!\n");
        }
        user = await input({message: "\n Novo nome de usuário: ", default: ""});
    }

    let password = await input({message: "Senha: ", mask: "*", default: ""});
    
    var REGEX = /[ '"!?\.@#$%&*\(\)\-_\+=\{\}\[\]\\|\/:;<>~,`]/g;
    
    while (password.length < 5 || password.match(REGEX) || isNaN(password)) {
        console.log("\n Senha deve ter no mínimo 5 caracteres! E deve ser composta somente por números! \n");
        password = await input({message: "Senha: ", mask: "*", default: ""});
    }
    
    // GERAR ID ALEATÓRIO E ÚNICO
    let id = generateID(users);

    try {
        users.push({userAdmin: false, userID: id, userName: user, userPassword: password});
        await writeFile("./bd-users.json", JSON.stringify({ users }, null, 2), { encoding: "utf-8" });
    } catch (error) {
        console.log(" Erro: " + error);
        return
    }

    await loading(" Usuário inserido com sucesso! Voltando");

    await main()
}

export const deleteUser = async (id) => {
    let users = await loadUser();
    let newUsers = users.filter(user => user.userID !== id);
    await writeFile("./bd-users.json", JSON.stringify({ users: newUsers }, null, 2), { encoding: "utf-8" });
}

export const updateUserName = async (id, newUserName) => {
    let users = await loadUser();
    let newUsers = users.map(u => {
        if (u.userID == id) {
            return {userAdmin: u.userAdmin, userID: u.userID, userName: newUserName, userPassword: u.userPassword}
        } else {
            return u
        }
    })
    await writeFile("./bd-users.json", JSON.stringify({ users: newUsers }, null, 2), { encoding: "utf-8" });
}

export const updateUserPassword = async (id, newPassword) => {
    let users = await loadUser();
    let newUsers = users.map(u => {
        if (u.userID == id) {
            return {userAdmin: u.userAdmin, userID: u.userID, userName: u.userName, userPassword: newPassword}
        } else {
            return u
        }
    })
    await writeFile("./bd-users.json", JSON.stringify({ users: newUsers }, null, 2), { encoding: "utf-8" });
}