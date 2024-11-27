export let enabledCommands = ['ls', 'exit'];

import { ls } from '../cmd/ls.js';
import { cd } from '../cmd/cd.js';
import { cat } from '../cmd/cat.js';
import { pwd } from '../cmd/pwd.js';
import { echo } from '../cmd/echo.js';
import { touch } from '../cmd/touch.js';
import { mkdir } from '../cmd/mkdir.js';
import { mv } from '../cmd/mv.js';
import { cp } from '../cmd/cp.js';
import { rm } from '../cmd/rm.js';
import { exit } from '../cmd/exit.js';

export const availableCommands = {
    'ls': ls,
    'cd': (args, terminalState, fileSystem) => cd(args, terminalState, fileSystem),
    'cat': (args, terminalState, fileSystem) => cat(args, terminalState, fileSystem),
    'pwd': (terminalState) => pwd(terminalState),
    'echo': (args, terminalState, fileSystem) => echo(args, terminalState, fileSystem),
    'touch': (args, terminalState, fileSystem) => touch(args, terminalState, fileSystem),
    'mkdir': (args, terminalState, fileSystem) => mkdir(args, terminalState, fileSystem),
    'mv': (args, terminalState, fileSystem) => mv(args, terminalState, fileSystem),
    'cp': (args, terminalState, fileSystem) => cp(args, terminalState, fileSystem),
    'rm': (args, terminalState, fileSystem) => rm(args, terminalState, fileSystem),
    'exit': (args, terminalElement) => exit(args, terminalElement)
};


export function registerCommands() {
    const commands = {};
    enabledCommands.forEach((cmd) => {
        if (availableCommands[cmd]) {
            commands[cmd] = availableCommands[cmd];
        }
    });
    return commands;
}

export function processCommand(command, args, terminalState, fileSystem, terminalElement) {
    const commands = registerCommands();
    if (commands[command]) {
        return commands[command](args, terminalState, fileSystem, terminalElement);
    }
    return `${command}: command not set or not found`;
}

