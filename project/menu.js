import { input, password, checkbox, select, confirm } from '@inquirer/prompts'

import chalk from 'chalk'

import { readFile, writeFile } from 'fs/promises';


import { loadUser, insertUser, updateUserName, updateUserPassword, deleteUser } from './userManager.js'
import { existUser, loadID, verifyUser, generateID, generateExpenseID } from './authentication.js'
import { main } from './main.js'

import { delay, loading } from '../utilities/delay.js'
import { exit } from '../utilities/exit.js'

export const loadUserConfig = async (name, id) => {
    let userName = name
    let userID = id

    console.clear()
    console.log("\n   --- CONFIGURAÇÕES ---");

    let option = await select({
        message: "\n O que você deseja fazer?\n",
        choices: [
            {
                name: "-> Atualizar Usuário",
                value: "updateUser"
            },
            {
                name: "-> Atualizar Senha",
                value: "updatePassword"
            },
            {
                name: "-> Deletar Usuário",
                value: "deleteUser"
            },
            {
                name: "-> Voltar",
                value: "back"
            }
        ]
    })

    switch (option) {

        case "updateUser":
            let newName = await input({message: "\n Novo nome de usuário: ", default: ""});
            
            var REGEX = /\s/g;

            while (await existUser(newName) || newName.length == 0 || newName.match(REGEX)) {
                if (newName.match(REGEX)) {
                    console.log("\n Nome de usuário não pode conter espaços! Insira novamente!\n");
                } else if (newName.length == 0) {
                    console.log("\n Nome de usuário não pode ser vazio! Insira novamente!\n");
                } else {
                    console.log("\n Nome de usuário já existe! Insira novamente!\n");
                }
                newName = await input({message: "\n Novo nome de usuário: ", default: ""});
            }
            
            userName = newName
            await updateUserName(userID, newName)
            break

        case "updatePassword":
            let newPassword = await input({message: "\n Nova senha: ", default: ""});
            
            var REGEX = /[ '"!?\.@#$%&*\(\)\-_\+=\{\}\[\]\\|\/:;<>~,`]/g;
    
            while (newPassword.length < 5 || newPassword.match(REGEX) || isNaN(newPassword)) {
                console.log("\n Senha deve ter no mínimo 5 caracteres! E deve ser composta somente por números! \n");
                newPassword = await input({message: " Nova senha: ", mask: "*", default: ""});
            }
            
            await updateUserPassword(userID, newPassword)
            break

        case "deleteUser":
            try {
                await deleteUser(userID)
                await loading(" ✅ Usuário deletado com sucesso! Saindo")
                await delay(1000)
                await main()
                return
            } catch (error) {
                console.log("Erro: " + error);
                return
            }
            break
        
        case "back":
            console.clear()
            await loadUserOptions(userName)
            return

    }

    await loadUserOptions(userName)
    return

}

export const loadUserOptions = async (name) => {
        let userName = name
        let userID = await loadID(name)

        console.clear()
        console.log(`\n  --- BEM-VINDO ${userName} ---`);

        let option = await select({
            message: "\n  O que você deseja fazer hoje?\n",
            choices: [
                {
                    name: "-> Track Wallet",
                    value: "access"
                },
                {
                    name: "-> Configurações",
                    value: "config"
                },
                {
                    name: "-> Sair",
                    value: "exit"
                }
            ]
        })

        switch (option) {

            case "access":
                // Aqui inicia a aplicação de gastos
                console.clear()
                await loadExpensesSystem(userName, userID)
                break

            case "config": 
                // Aqui o usuário pode atualizar suas configurações
                console.clear()
                await loadUserConfig(userName, userID)
                break
            
            case "exit":
                // Sair para o menu principal
                console.clear()
                await exit()
                await main()
                return

        }

    return false
}

export const loginUser = async () => {

    console.log("\n   --- LOGIN --- \n");

    let userName = await input({message: "Usuário: ", default: ""});
    let userPassword = await password({message: "Senha: ", mask: "*", default: ""});

    if (await verifyUser(userName, userPassword)) {
        await loading(" ✅  Login realizado com sucesso! Carregando informações")
        await loadUserOptions(userName)
    } else {
        console.log("\n ❌  Usuário e/ou senha inválidos!")

        let option = await input({message: "\n Deseja fazer login novamente (s/n)? ", default: false});

        if (option == 's' || option == 'S' || option == 'y' || option == 'Y') {
            console.clear()
            await loginUser()
        } else {
            console.clear()
            await main()
            return
        }
    }


}

export const showOptions = async () => {

    let option = await select({
        message: "\n  ---   WALLET TRACK --- \n",
        choices: [
            {
                name: "-> Login",
                value: "login"
            },
            {
                name: "-> Cadastrar-se",
                value: "insert"
            },
            {
                name: "-> Sair",
                value: "exit"
            }

        ]
    })

    switch (option) {

        case "login":
            console.clear()
            await loginUser()
            break

        case "insert":
            console.clear()
            await insertUser()
            break

        case "exit":
            console.clear()
            await exit()
            console.clear()
            console.log("\n Até mais!");
            return
    }

}

// APLICAÇÃO DE GASTOS ---------------------------------------------------------------------------------------------------------------------------------------

export const loadExpensesSystem = async (userName, userID) => {
    console.clear()

    await listExpenses(userID)

    let option = await select({
        message: "\n   Opções: \n",
        choices: [
            {
                name: "-> Adicionar Gastos",
                value: "add"
            },
            {
                name: "-> Deletar Gastos",
                value: "delete"
            },
            {
                name: "-> Voltar",
                value: "back"
            }
        ]
    })

    switch (option) {

        case "add":
            console.clear()
            await addExpenses(userName, userID)
            break

        case "delete":
            console.clear()
            await toDeleteExpenses(userName, userID)
            break

        case "back":
            console.clear()
            await loadUserOptions(userName)
            return

    }

}

export const listExpenses = async (userID) => {
    
    let userExpenses = await loadUserExpenses(userID);

    console.log("\n   --- TRACKING EXPENSES --- \n");
    
    let totalExpenses = 0;

    if (userExpenses.length > 0){
    
        for (let i = 0; i < userExpenses.length; i++) {
            console.log(`   - ${userExpenses[i].expenseName}: ${chalk.green(`R$ ${userExpenses[i].expenseValue.toFixed(2)}`)}`);
            totalExpenses += userExpenses[i].expenseValue;
        }
        console.log("\n   ------------------------------------");
        console.log(`   - Total: ${chalk.blue(`R$ ${totalExpenses.toFixed(2)}`)}`)

    } else {
        console.log("   Você ainda não possui nenhum gasto!"); 
    }
    
}

export const loadAllExpenses = async () => {

    let bd = []

    try {
        bd = JSON.parse(await readFile("./bd-expenses.json", {encoding: "utf-8"}))
        return bd.expenses
    } catch (error) {
        console.log("Erro" + error)
    }

}

export const loadUserExpenses = async (userID) => {

    let bd = [];
    try {
        bd = JSON.parse(await readFile("./bd-expenses.json", {encoding: "utf-8"}))
        let bdFiltered = bd.expenses.filter((item) => item.foreignUserID === userID)
        if (bdFiltered.length == 0) {
            return []
        } else {
            return bdFiltered;
        }
    } catch (error) {
        console.log("Erro: " + error);
    } 

}

export const addExpenses = async (userName, userID) => {

    let expenses = await loadAllExpenses()

    console.clear()
    console.log("\n   --- ADICIONAR GASTOS ---\n");

    let expense = ""
    do {
        expense = await input({message: " Descrição: ", default: ""})
    } while (expense.length == 0)

    let value = 0
    do {
        value = parseFloat(await input({message: " Valor: ", default: 0}))
    } while (isNaN(value) || value <= 0)

    let id = generateExpenseID(expenses)

    try {
        expenses.push({
            foreignUserID: userID, 
            expenseID: id, 
            expenseName: expense, 
            expenseValue: value, 
        })
        
        await writeFile("./bd-expenses.json", JSON.stringify({ expenses }, null, 2), { encoding: "utf-8" })
    
    } catch (error) {
        console.log(console.log(" Erro: " + error));
    }

    await loading(" Gasto adicionado com sucesso! Voltando")

    await loadExpensesSystem(userName, userID)

}

export const toDeleteExpenses = async (userName, userID) => {

    let expenses = await loadUserExpenses(userID)
    let expensesToDelete = []

    console.log(expenses);

    console.clear()
    console.log("\n   --- DELETAR GASTOS --- \n");

    if (expenses.length > 0){
        expensesToDelete = await checkbox({ 
            message: ' Selecione os gastos que deseja excluir: \n',
            choices: expenses.map((expense) => ({
                name: `${expense.expenseName}  ${chalk.green(`R$ ${expense.expenseValue}`)}`,
                value: expense.expenseID
            }))
        })
    } else {
        console.log(" Não há gastos!");
        await delay(2000)
        await loading(" Voltando")
        await loadExpensesSystem(userName, userID)
    }

    console.clear()
    console.log("\n   ------------------------------------- \n");

    await deleteExpenses(expensesToDelete, userName, userID)

}

export const deleteExpenses = async (expensesToDelete, userName, userID) => {

    let expenses = await loadAllExpenses()
    let newExpenses = []

    if (expensesToDelete.length > 0){

        newExpenses = expenses.filter((expense) => !expensesToDelete.includes(expense.expenseID))

        await writeFile("./bd-expenses.json", JSON.stringify({ expenses: newExpenses }, null, 2), { encoding: "utf-8" });
        await loading(" ✅  Gastos deletados! Voltando")
    } else {
        await loading(" Não há gastos para deletar! Voltando")
    }

    await loadExpensesSystem(userName, userID)

}