// Name: Cyberexplorer's Terminal
// ID: cyberTerminal
// Description: Better than the terminal addon!
// Author: Cyberexplorer(Code) , _KOSHINO_(Image)
// License: MIT

(function(Scratch) {
    const { Cast, ArgumentType, BlockType } = Scratch;

    Scratch.translate.setup({
        "zh": {
            "_terminal.extName": "赛博猫猫的终端",
            "_terminal.closeTerminal": "关闭终端",
            "_terminal.clear": "清空终端",
            "_terminal.deleteLastOutput": "删除上一条打印内容",
            "_terminal.setOutputTitle": "设置终端标题为 [title]",
            "_terminal.setWindowSize": "设置终端窗口大小为宽 [width] 高 [height]",
            "_terminal.moveWindowTo": "将终端移动到位置 X [x] Y [y]",
            "_terminal.setToolbar": "设置终端工具栏为 [json]",
            "_terminal.getLastButtonPressed": "返回上一个按下的按钮名称",
            "_terminal.getLastInput": "用户输入",
            "_terminal.openConsole": "打开终端",
            "_terminal.getAllContent": "获取终端所有内容",
            "_terminal.getAllContentAsArray": "获取终端所有打印的文本内容作为数组",
            "_terminal.output": "输出 [outputLevel] [message]",
            "_terminal.printColored": "输出 [color] [message]",
            "_terminal.setTextProperty": "设置文本属性 [property] 为 [value]",
            "_terminal.getTextProperty": "获取文本属性 [property]",
            "_fontSize":"字体大小",
            "_lineHeight":"行高",
            "_when": "当 [CONDITION] 为真"
        }
    });
    
    // Image constants
    const CLOSE_ICON = 'data:image/svg+xml;base64,PHN2ZyB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHdpZHRoPSIyNy43NDI2MSIgaGVpZ2h0PSIyNy43NDI2MSIgdmlld0JveD0iMCwwLDI3Ljc0MjYxLDI3Ljc0MjYxIj48ZyB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtMjI2LjEyODY5LC0xNjYuMTI4NjkpIj48ZyBmaWxsPSIjZmYwMDAwIiBzdHJva2U9IiNiMzAwMDAiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIj48cGF0aCBkPSJNMjI3LjEyODcsMTgwYzAsLTcuMTA4NjIgNS43NjI2OCwtMTIuODcxMzEgMTIuODcxMzEsLTEyLjg3MTMxYzcuMTA4NjIsMCAxMi44NzEzMSw1Ljc2MjY4IDEyLjg3MTMxLDEyLjg3MTMxYzAsNy4xMDg2MiAtNS43NjI2OCwxMi44NzEzMSAtMTIuODcxMzEsMTIuODcxMzFjLTcuMTA4NjIsMCAtMTIuODcxMzEsLTUuNzYyNjggLTEyLjg3MTMxLC0xMi44NzEzMXoiLz48L2c+PC9nPjwvc3ZnPg==';

    const EXT_ICON = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTczIiBoZWlnaHQ9IjE3MyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSIgb3ZlcmZsb3c9ImhpZGRlbiI+PGRlZnM+PGNsaXBQYXRoIGlkPSJjbGlwMCI+PHJlY3QgeD0iMTQ1MyIgeT0iNzY4IiB3aWR0aD0iMTczIiBoZWlnaHQ9IjE3MyIvPjwvY2xpcFBhdGg+PC9kZWZzPjxnIGNsaXAtcGF0aD0idXJsKCNjbGlwMCkiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC0xNDUzIC03NjgpIj48cGF0aCBkPSJNMTQ1MyA4MzEuNTA1QzE0NTMgNzk2LjQzMiAxNDgxLjQzIDc2OCAxNTE2LjUgNzY4TDE1NjIuNSA3NjhDMTU5Ny41NyA3NjggMTYyNiA3OTYuNDMyIDE2MjYgODMxLjUwNUwxNjI2IDg3Ny40OTVDMTYyNiA5MTIuNTY4IDE1OTcuNTcgOTQxIDE1NjIuNSA5NDFMMTUxNi41IDk0MUMxNDgxLjQzIDk0MSAxNDUzIDkxMi41NjggMTQ1MyA4NzcuNDk1WiIgZmlsbD0iIzY2Q0NGRiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTE0NzUgODQzLjY4N0MxNDc1IDgxMy40ODQgMTQ5OS40OCA3ODkgMTUyOS42OSA3ODlMMTU0OS4zMSA3ODlDMTU3OS41MiA3ODkgMTYwNCA4MTMuNDg0IDE2MDQgODQzLjY4N0wxNjA0IDg2Mi4zMTNDMTYwNCA4OTIuNTE2IDE1NzkuNTIgOTE3IDE1NDkuMzEgOTE3TDE1MjkuNjkgOTE3QzE0OTkuNDggOTE3IDE0NzUgODkyLjUxNiAxNDc1IDg2Mi4zMTNaIiBmaWxsPSIjMjFCNUZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiLz48cGF0aCBkPSJNMTUxNC41IDgzNi41IDE1MzUuNSA4NDcuMDQ3IDE1MzUuNSA4NTEuOTUzIDE1MTQuNSA4NjIuNSAxNTE0LjUgODU4LjIzMiAxNTI5LjY0IDg1MC43NzVDMTUzMC4yNiA4NTAuNDgxIDE1MzAuODQgODUwLjIyOCAxNTMxLjM3IDg1MC4wMTUgMTUzMS45MSA4NDkuODAyIDE1MzIuMzEgODQ5LjY2MyAxNTMyLjU3IDg0OS41OTggMTUzMi4yOCA4NDkuNTMyIDE1MzEuODUgODQ5LjM4NSAxNTMxLjMgODQ5LjE1NyAxNTMwLjc1IDg0OC45MjggMTUzMC4xOSA4NDguNjgyIDE1MjkuNjQgODQ4LjQyMUwxNTE0LjUgODQwLjkxNSAxNTE0LjUgODM2LjVaIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMy40Mzc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PHBhdGggZD0iTTE1NDEuNSA4NjYuNSAxNTY1LjUgODY2LjUgMTU2NS41IDg3MC41IDE1NDEuNSA4NzAuNSAxNTQxLjUgODY2LjVaIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMy40Mzc1IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIHN0cm9rZS1taXRlcmxpbWl0PSIxMCIgZmlsbD0iI0ZGRkZGRiIgZmlsbC1ydWxlPSJldmVub2RkIi8+PC9nPjwvc3ZnPg==';


    // Create terminal window
    let terminalWindow = document.createElement('div');
    terminalWindow.style.position = 'fixed';
    terminalWindow.style.width = '640px';
    terminalWindow.style.height = '360px';
    terminalWindow.style.overflow = 'hidden';
    terminalWindow.style.borderRadius = '10px';
    terminalWindow.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.5)';
    terminalWindow.style.display = 'none';
    terminalWindow.style.fontFamily = 'Microsoft YaHei UI, Cascadia Code, Consolas, Courier New, Menlo, monospace';
    terminalWindow.style.backgroundColor = '#1E1E1E';
    terminalWindow.style.color = '#FFF';
    terminalWindow.style.zIndex = '9999';
    document.body.appendChild(terminalWindow);

    // Create title bar
    let titleBar = document.createElement('div');
    titleBar.style.height = '40px';
    titleBar.style.lineHeight = '40px';
    titleBar.style.paddingLeft = '12px';
    titleBar.style.paddingRight = '12px';
    titleBar.style.cursor = 'move';
    titleBar.style.fontSize = '16px';
    titleBar.innerText = 'Terminal';
    titleBar.style.position = 'sticky';
    titleBar.style.top = '0px';
    titleBar.style.backgroundColor = '#1E1E1E';
    titleBar.style.color = '#FFF';
    terminalWindow.appendChild(titleBar);

    // Create toolbar
    let toolbar = document.createElement('div');
    toolbar.style.height = '30px';
    toolbar.style.lineHeight = '30px';
    toolbar.style.paddingLeft = '0'; // Left-align buttons
    toolbar.style.backgroundColor = '#333';
    toolbar.style.color = '#FFF';
    terminalWindow.appendChild(toolbar);

    // Create content area
    let content = document.createElement('div');
    content.style.position = 'absolute';
    content.style.width = 'calc(100% - 20px)';
    content.style.height = 'calc(100% - 70px)';
    content.style.top = '70px';
    content.style.overflow = 'auto';
    content.style.paddingTop = '5px';
    content.style.paddingLeft = '10px';
    content.style.paddingRight = '10px';
    terminalWindow.appendChild(content);

    // Create input box
    let inputBox = document.createElement('input');
    inputBox.style.position = 'absolute';
    inputBox.style.width = 'calc(100% - 40px)';
    inputBox.style.height = '30px';
    inputBox.style.bottom = '10px';
    inputBox.style.left = '10px';
    inputBox.style.paddingLeft = '10px';
    inputBox.style.backgroundColor = '#2B2B2B';
    inputBox.style.color = '#FFF';
    inputBox.style.border = '1px solid #444';
    inputBox.style.borderRadius = '5px';
    terminalWindow.appendChild(inputBox);

    // Create close button
    let closeButton = document.createElement('img');
    closeButton.src = CLOSE_ICON;
    closeButton.style.position = 'absolute';
    closeButton.style.top = '12px';
    closeButton.style.right = '12px';
    closeButton.style.width = '16px';
    closeButton.style.height = '16px';
    closeButton.style.fontSize = '16px';
    closeButton.style.cursor = 'pointer';
    closeButton.style.border = 'none';
    closeButton.style.backgroundColor = '#333';
    closeButton.style.color = '#FFF';
    titleBar.appendChild(closeButton);

    // Close terminal
    closeButton.addEventListener('click', () => {
        terminalWindow.style.display = 'none';
        inputBox.value = '';
    });

    // Drag window
    let isDragging = false;
    let offset = { x: 0, y: 0 };
    titleBar.addEventListener('mousedown', (event) => {
        if (event.target === titleBar) {
            isDragging = true;
            offset.x = event.clientX - terminalWindow.offsetLeft;
            offset.y = event.clientY - terminalWindow.offsetTop;
        }
    });
    window.addEventListener('mousemove', (event) => {
        if (isDragging) {
            event.preventDefault();
            const newX = event.clientX - offset.x;
            const newY = event.clientY - offset.y;
            terminalWindow.style.left = newX + 'px';
            terminalWindow.style.top = newY + 'px';
        }
    });
    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    // Resize window
    let resizeHandle = document.createElement('div');
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.width = '10px';
    resizeHandle.style.height = '10px';
    resizeHandle.style.right = '0';
    resizeHandle.style.bottom = '0';
    resizeHandle.style.cursor = 'se-resize';
    resizeHandle.style.backgroundColor = '#666';
    resizeHandle.style.borderRadius = '2px';
    terminalWindow.appendChild(resizeHandle);

    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', (event) => {
        isResizing = true;
        startX = event.clientX;
        startY = event.clientY;
        startWidth = parseInt(document.defaultView.getComputedStyle(terminalWindow).width, 10);
        startHeight = parseInt(document.defaultView.getComputedStyle(terminalWindow).height, 10);
        event.preventDefault();
    });

    window.addEventListener('mousemove', (event) => {
        if (isResizing) {
            const newWidth = Math.max(startWidth + (event.clientX - startX), 400);
            const newHeight = Math.max(startHeight + (event.clientY - startY), 300);
            terminalWindow.style.width = newWidth + 'px';
            terminalWindow.style.height = newHeight + 'px';
        }
    });

    window.addEventListener('mouseup', () => {
        isResizing = false;
    });

    // Add text to content area
    function addText(message, isUserInput = false) {
        const messageElement = document.createElement('div');
        const prefix = isUserInput ? '§ ' : ' ';
        messageElement.textContent = prefix + message;
        if (isUserInput) {
            messageElement.style.color = '#808080';
        }
        messageElement.style.whiteSpace = 'pre-wrap';
        content.appendChild(messageElement);
        content.scrollTop = content.scrollHeight;
    }

    // Handle user input
    let lastUserInput = ""; // 用于存储用户最后输入的内容
    inputBox.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            const inputText = inputBox.value.trim();
            if (inputText !== '') {
                addText(inputText, true);
                lastUserInput = inputText; // 更新用户最后输入的内容
            }
            handleCommand(inputText);
            inputBox.value = '';
        }
    });

    function handleCommand(inputText) {
        if (inputText === 'clear') {
            content.innerHTML = '';
        }
    }

    // Get all terminal content
    function getAllTerminalContent() {
        let allText = '';
        const messages = content.querySelectorAll('div');
        messages.forEach(function(message) {
            allText += message.textContent + '\n';
        });
        return allText.trim();
    }

    // Create button for toolbar
    function createButton(text, onClick, isDropdown = false) {
        const button = document.createElement('button');
        button.innerText = text + (isDropdown ? ' >' : '');
        button.style.height = '100%';
        button.style.border = 'none'; // No border for main toolbar buttons
        button.style.background = 'transparent';
        button.style.color = '#FFF';
        button.style.marginRight = '0'; // No gap between buttons
        button.style.padding = '0 10px';
        button.style.cursor = 'pointer';
        button.addEventListener('click', onClick);
        return button;
    }

    // Create dropdown menu
    function createDropdown(json, parent) {
        const dropdown = document.createElement('div');
        dropdown.style.position = 'absolute';
        dropdown.style.display = 'none';
        dropdown.style.backgroundColor = '#222'; // Lighter color
        dropdown.style.borderRadius = '0'; // No rounded corners
        dropdown.style.padding = '0'; // No gap between buttons
        dropdown.style.zIndex = '1000';

        Object.keys(json).forEach((name) => {
            const button = createButton(name, () => {
                if (typeof json[name] === 'string') {
                    lastButtonPressed = name;
                    Scratch.vm.runtime.trigger('cyberTerminal_buttonPressed', { buttonName: name });
                } else {
                    // Toggle nested dropdown
                    const subDropdown = dropdown.querySelector(`[data-name="${name}"]`);
                    if (subDropdown) {
                        subDropdown.style.display = subDropdown.style.display === 'block' ? 'none' : 'block';
                    }
                }
            }, typeof json[name] === 'object');

            if (typeof json[name] === 'object') {
                const subDropdown = createDropdown(json[name], button);
                subDropdown.setAttribute('data-name', name);
                dropdown.appendChild(subDropdown);
            }

            button.style.border = '1px solid #555'; // Border for dropdown buttons
            dropdown.appendChild(button);
        });

        if (parent) {
            parent.appendChild(dropdown);
        }

        return dropdown;
    }

    // Set toolbar configuration
    function setToolbar(json) {
        try {
            const toolbarConfig = JSON.parse(json);
            toolbar.innerHTML = ''; // Clear toolbar
            Object.keys(toolbarConfig).forEach((name) => {
                if (typeof toolbarConfig[name] === 'string') {
                    // Regular button
                    const button = createButton(toolbarConfig[name], () => {
                        lastButtonPressed = name;
                        Scratch.vm.runtime.trigger('cyberTerminal_buttonPressed', { buttonName: name });
                    });
                    toolbar.appendChild(button);
                } else if (typeof toolbarConfig[name] === 'object') {
                    // Dropdown button
                    const button = createButton(name, () => {
                        const dropdown = toolbar.querySelector(`[data-name="${name}"]`);
                        if (dropdown) {
                            // Hide all other dropdowns
                            const allDropdowns = toolbar.querySelectorAll('div');
                            allDropdowns.forEach(d => {
                                if (d !== dropdown) {
                                    d.style.display = 'none';
                                }
                            });
                            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
                        }
                    }, true);
                    const dropdown = createDropdown(toolbarConfig[name], button);
                    dropdown.setAttribute('data-name', name);
                    toolbar.appendChild(button);
                    toolbar.appendChild(dropdown);
                }
            });
        } catch (e) {
            console.error('Invalid JSON:', e);
        }
    }

    // Track the last button pressed
    let lastButtonPressed = null;

    class cyberTerminal {
        getInfo() {
            return {
                id: 'cyberTerminal',
                name: Scratch.translate('terminal.extName'),
                menuIconURI: EXT_ICON,
                blockIconURI: EXT_ICON,
                color1: '#66ccff',
                color2: '#b3d9ff',
                color3: '#4080bf',
                blocks: [
                    {
                        opcode: 'openConsole',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.openConsole')
                    },
                    {
                        opcode: 'closeTerminal',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.closeTerminal')
                    },
                    {
                        opcode: 'clearTerminal',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.clear')
                    },
                    {
                        opcode: 'deleteLastOutput',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.deleteLastOutput')
                    },
                    {
                        opcode: 'setOutputTitle',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.setOutputTitle'),
                        arguments: {
                            title: {
                                type: ArgumentType.STRING,
                                defaultValue: 'Terminal'
                            }
                        }
                    },
                    {
                        opcode: 'setWindowSize',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.setWindowSize'),
                        arguments: {
                            width: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 640
                            },
                            height: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 360
                            }
                        }
                    },
                    {
                        opcode: 'moveWindowTo',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.moveWindowTo'),
                        arguments: {
                            x: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0
                            },
                            y: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 0
                            }
                        }
                    },
                    {
                        opcode: 'setToolbar',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.setToolbar'),
                        arguments: {
                            json: {
                                type: ArgumentType.STRING,
                                defaultValue: '{"SampleButton": "DisplayText","SampleFolder": {"OneButton":"Text","SampleFolder2": {"按钮": "中文也可以！","Folder": {"huh": "这么多下拉框，会坏掉的qwq"}}}}'
                            }
                        }
                    },
                    {
                        opcode: 'getLastInput',
                        blockType: BlockType.REPORTER,
                        text: Scratch.translate('terminal.getLastInput')
                    },
                    {
                        opcode: 'getLastButtonPressed',
                        blockType: BlockType.REPORTER,
                        text: Scratch.translate('terminal.getLastButtonPressed')
                    },
                    {
                        opcode: 'outputWithLevel',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.output'),
                        arguments: {
                            outputLevel: {
                                type: ArgumentType.STRING,
                                menu: 'outputLevel',
                                defaultValue: 'log'
                            },
                            message: {
                                type: ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'printColored',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.printColored'),
                        arguments: {
                            color: {
                                type: ArgumentType.COLOR,
                                defaultValue: '#66ccff'
                            },
                            message: {
                                type: ArgumentType.STRING,
                                defaultValue: ''
                            }
                        }
                    },
                    {
                        opcode: 'getAllTerminalContent',
                        blockType: BlockType.REPORTER,
                        text: Scratch.translate('terminal.getAllContent')
                    },
                    {
                        opcode: 'getAllTerminalContentAsArray',
                        blockType: BlockType.REPORTER,
                        text: Scratch.translate('terminal.getAllContentAsArray')
                    },
                    {
                        opcode: 'setTextProperty',
                        blockType: BlockType.COMMAND,
                        text: Scratch.translate('terminal.setTextProperty'),
                        arguments: {
                            property: {
                                type: ArgumentType.STRING,
                                menu: 'textProperty',
                                defaultValue: 'fontSize'
                            },
                            value: {
                                type: ArgumentType.NUMBER,
                                defaultValue: 16
                            }
                        }
                    },
                    {
                        opcode: 'getTextProperty',
                        blockType: BlockType.REPORTER,
                        text: Scratch.translate('terminal.getTextProperty'),
                        arguments: {
                            property: {
                                type: ArgumentType.STRING,
                                menu: 'textProperty',
                                defaultValue: 'fontSize'
                            }
                        }
                    }
                ],
                menus: {
                    outputLevel: ['log', 'warn', 'error'],
                    textProperty: {items: 
                        [
                            {text: Scratch.translate('fontSize'), value: "fontSize"},
                            {text: Scratch.translate('lineHeight'), value:"lineHeight"}
                        ]
                    }
                }
            };
        }

        openConsole() {
            terminalWindow.style.display = 'block';
        }

        closeTerminal() {
            terminalWindow.style.display = 'none';
        }

        clearTerminal() {
            content.innerHTML = '';
        }

        deleteLastOutput() {
            if (content.lastElementChild) {
                content.removeChild(content.lastElementChild);
            }
        }

        setOutputTitle({ title }) {
            titleBar.innerText = title;
        }

        setWindowSize({ width, height }) {
            terminalWindow.style.width = width + 'px';
            terminalWindow.style.height = height + 'px';
        }

        moveWindowTo({ x, y }) {
            terminalWindow.style.left = x + 'px';
            terminalWindow.style.top = y + 'px';
        }

        setToolbar({ json }) {
            setToolbar(json);
        }

        getLastButtonPressed() {
            return lastButtonPressed;
        }

        getLastInput() {
            return lastUserInput; // 返回用户最后输入的内容
        }

        outputWithLevel({ outputLevel, message }) {
            const colors = {
                log: '#FFFFFF',
                warn: '#FFA500',
                error: '#FF0000'
            };
            addText(message);
            const messageElement = content.lastElementChild;
            messageElement.style.color = colors[outputLevel];
        }

        printColored({ color, message }) {
            addText(message);
            const messageElement = content.lastElementChild;
            messageElement.style.color = color;
        }

        getAllTerminalContent() {
            return getAllTerminalContent();
        }

        getAllTerminalContentAsArray() {
            const allText = content.innerText;
            const messages = allText.split(/[\n\r]+/);
            const trimmedMessages = messages.map(message => message.trim());
            return JSON.stringify(trimmedMessages);
        }

        setTextProperty({ property, value }) {
            if (property === 'fontSize') {
                content.style.fontSize = value + 'px';
            } else if (property === 'lineHeight') {
                content.style.lineHeight = value;
            }
        }

        getTextProperty({ property }) {
            if (property === 'fontSize') {
                return parseFloat(content.style.fontSize);
            } else if (property === 'lineHeight') {
                return parseFloat(content.style.lineHeight);
            }
            return null;
        }
    }

    Scratch.extensions.register(new cyberTerminal());
})(Scratch);