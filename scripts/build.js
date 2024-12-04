const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const fsDir = process.env.TERMYX_FS_DIR;
const envFile = process.env.TERMYX_ENV_FILE;
const fsJsonPath = process.env.TERMYX_FS_JSON;
const pwd = process.env.TERMYX_PWD || '';
const prompt = process.env.TERMYX_PROMPT || 'term@yx';

const outputPath = path.resolve('./dist');
const defaultIntroText = `

   /$$                                                          
  | $$                                                          
 /$$$$$$    /$$$$$$   /$$$$$$  /$$$$$$/$$$$  /$$   /$$ /$$   /$$
|_  $$_/   /$$__  $$ /$$__  $$| $$_  $$_  $$| $$  | $$|  $$ /$$/
  | $$    | $$$$$$$$| $$  \__/| $$ \ $$ \ $$| $$  | $$ \  $$$$/ 
  | $$ /$$| $$_____/| $$      | $$ | $$ | $$| $$  | $$  >$$  $$ 
  |  $$$$/|  $$$$$$$| $$      | $$ | $$ | $$|  $$$$$$$ /$$/ \  $$
   \___/   \_______/|__/      |__/ |__/ |__/ \____  $$|__/  \__/
                                             /$$  | $$          
                                            |  $$$$$$/          
                                             \______/           

`;

const introText = (process.env.TERMYX_INTRO || defaultIntroText).replace(/\\n/g, '<br>');
const title = process.env.TERMYX_TITLE || 'term@yx';
const theme = process.env.TERMYX_THEME || 'basic';
const themesDirectory = path.resolve('./src/themes');

function createOrCleanDirSync(dirPath) {
    const resolvedPath = path.resolve(dirPath);
    try {
        const stats = fs.statSync(resolvedPath);
        if (!stats.isDirectory()) {
            throw new Error(`The path exists and is not a directory: ${resolvedPath}`);
        }
        const files = fs.readdirSync(resolvedPath);
        for (const file of files) {
            const filePath = path.join(resolvedPath, file);
            const fileStats = fs.statSync(filePath);

            if (fileStats.isDirectory()) {
                fs.rmSync(filePath, { recursive: true });
            } else {
                fs.unlinkSync(filePath);
            }
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            fs.mkdirSync(resolvedPath, { recursive: true });
        } else {
            console.error(`Error handling path ${resolvedPath}: ${error.message}`);
        }
    }
}

function copyDirectorySync(source, destination) {
    try {
        fs.cpSync(source, destination, { recursive: true });
    } catch (error) {
        console.error(`Error copying directory: ${error.message}`);
    }
}

function readDirectorySync(dirPath) {
    const directoryContents = {};
    fs.readdirSync(dirPath, { withFileTypes: true }).forEach(dirent => {
        const fullPath = path.resolve(dirPath, dirent.name);
        if (dirent.isDirectory()) {
            directoryContents[dirent.name] = readDirectorySync(fullPath);
        } else if (dirent.isFile()) {
            directoryContents[dirent.name] = fs.readFileSync(fullPath, 'utf-8');
        }
    });
    return directoryContents;
}

function mergeEnvs(envs) {
    return {
        'TERMYX_THEME': theme,
        'TERMYX_INTRO': introText,
        'TERMYX_PROMPT': prompt,
        ...envs
    };
}

function prepareFsJson(fsJsonPath) {
    if (fs.existsSync(fsJsonPath)) {
        fsJson = JSON.parse(fs.readFileSync(fsJsonPath, 'utf-8'));
        fsJson.envs = mergeEnvs(fsJson.envs);
        fs.writeFileSync(path.join(outputPath, 'fs.json'), JSON.stringify(fsJson, null, 2));
    } else {
        console.error(`Error: The provide file ${fsJson} does not exists.`)
    }
}

function generateFsJson() {
    if (fsJsonPath) {
        console.log('Using fs.json file from TERMYX_FS_JSON env.')
        prepareFsJson(fsJsonPath);
    } else if (fsDir && envFile) {
        const envContent = dotenv.parse(fs.readFileSync(envFile));
        const filesystemStruct = readDirectorySync(fsDir);

        const resultJson = {
            envs: mergeEnvs(envContent),
            filesystem: filesystemStruct
        };
        fs.writeFileSync(path.join(outputPath, 'fs.json'), JSON.stringify(resultJson, null, 2));
        console.log(`Using fs.json created from ${fsDir} and ${envFile}.`);
    } else {
        console.log('Using default fs.json file.')
        prepareFsJson(path.resolve('assets/fs.json'));
    }
}

function generateAssets() {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <script type="module" src="index.js"></script>
    <div id="terminal"
         data-intro-text="${introText}"
         data-prompt="${prompt}"
         data-start-path="${pwd}">
    </div>
</body>
</html>`;

    const cssContent = `
:root {
       --background: #${cssBg};
       --foreground: #${cssFg};
       --dirs: #${cssDir};
       --files: #${cssFile};
       --intro: #${cssIntro};
       --prompt: #${cssPrompt};
       --input: #${cssInput};
       --cursor: #${cssCursor};
       --output: #${cssOutput};
       --error: #${cssError};
   }

body {
    background-color: var(--background);
    color: var(--foreground);
    font-family: "Courier New", Courier, monospace;
    margin: 0;
    padding: 0;
    overflow: hidden;
}

.terminal {
    padding: 15px;
    height: 90vh;
    overflow-y: auto;
    box-sizing: border-box;
    white-space: pre-wrap;
}

h1 {
    color: #00ff00;
}

a {
    color: #57f7ff;
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

ul {
    list-style: none;
    padding: 0;
}

li {
    padding: 5px 0;
    color: #c0c0c0;
}

.prompt  {
    color: var(--prompt);
    display: inline;
    line-height: 25px;
    visibility: visible;
}

.input-line {
    color: var(--input);
    display: inline;
    line-height: 25px;
    visibility: visible;
}

.intro-text {
    color: var(--intro);
}

.dir {
    color: var(--dirs);
}

.file {
    color: var(--files);
}


a:hover {
    text-decoration: underline;
}

.cursor {
    height: 1.5em;
    background-color: var(--cursor);
    color: var(--background);
    animation: blink 1s steps(1) infinite;
    display: inline-block;
    width: 10px;
    vertical-align: top;
}

@keyframes blink {
    50% { 
        background-color: transparent; 
        color: var(--foreground); 
    }
}

.output {
    color: var(--output);
}

.error {
    color: var(--error);
}
`;

    fs.writeFileSync(path.join(outputPath, 'index.html'), htmlContent);
    fs.writeFileSync(path.join(outputPath, 'styles.css'), cssContent);
}

function loadTheme() {
    let themePath;

    if (theme) {
        if (fs.existsSync(theme)) {
                themePath = path.resolve(theme);
        } else {
            themePath = path.join(themesDirectory, `${theme}.json`);
        }
    } else {
        themePath = path.join(themesDirectory, `basic.json`);
    }
    try {
        if (fs.existsSync(themePath)) {
            const themeContent = fs.readFileSync(themePath, 'utf-8');
            const theme = JSON.parse(themeContent);
            return {
                cssBg: theme.background,
                cssFg: theme.foreground,
                cssDir: theme.directories,
                cssFile: theme.files,
                cssIntro: theme.intro,
                cssPrompt: theme.prompt,
                cssInput: theme.input,
                cssCursor: theme.cursor,
                cssOutput: theme.output,
                cssError: theme.error,
            };
        } else {
            console.warn(`Warning: Theme file not found: ${themePath}`);
        }
    } catch (error) {
        console.error("Error loading theme:", error);
    }
}

createOrCleanDirSync(outputPath);
generateFsJson();
copyDirectorySync(path.resolve('./src'), outputPath)

const {
    cssBg,
    cssFg,
    cssDir,
    cssFile,
    cssIntro,
    cssPrompt,
    cssInput,
    cssCursor,
    cssOutput,
    cssError
} = loadTheme();

generateAssets();
