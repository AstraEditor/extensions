// Name: Better Iframe
// ID: betterIframe
// Description: Better Iframe framework, containing more features!
// By: fhy-action  <https://github.com/fhy-action>
// License: CC BY-NC-SA 4.0

(function (Scratch) {
  "use strict";

  const iframes = new Map();
  let nextId = 1;

  let lastMessageContent = "";
  let lastMessageSourceId = null;

  const featurePolicy = {
    accelerometer: "'none'",
    "ambient-light-sensor": "'none'",
    battery: "'none'",
    camera: "'none'",
    "display-capture": "'none'",
    "document-domain": "'none'",
    "encrypted-media": "'none'",
    fullscreen: "'none'",
    geolocation: "'none'",
    gyroscope: "'none'",
    magnetometer: "'none'",
    microphone: "'none'",
    midi: "'none'",
    payment: "'none'",
    "picture-in-picture": "'none'",
    "publickey-credentials-get": "'none'",
    "speaker-selection": "'none'",
    usb: "'none'",
    vibrate: "'none'",
    vr: "'none'",
    "screen-wake-lock": "'none'",
    "web-share": "'none'",
    "interest-cohort": "'none'",
  };

  const SANDBOX = [
    "allow-same-origin",
    "allow-scripts",
    "allow-forms",
    "allow-modals",
    "allow-popups",
  ];

  function updateIframeFrame(id) {
    const instance = iframes.get(id);
    if (!instance || !instance.iframe) return;

    const { iframe, x, y, width, height, interactive, resizeBehavior } = instance;
    const { stageWidth, stageHeight } = Scratch.vm.runtime;

    iframe.style.pointerEvents = interactive ? "auto" : "none";

    const effectiveWidth = width >= 0 ? width : stageWidth;
    const effectiveHeight = height >= 0 ? height : stageHeight;

    if (resizeBehavior === "scale") {
      iframe.style.width = `${effectiveWidth}px`;
      iframe.style.height = `${effectiveHeight}px`;
      iframe.style.transform = `translate(${-effectiveWidth / 2 + x}px, ${-effectiveHeight / 2 - y}px)`;
      iframe.style.top = "0";
      iframe.style.left = "0";
    } else {
      iframe.style.width = `${(effectiveWidth / stageWidth) * 100}%`;
      iframe.style.height = `${(effectiveHeight / stageHeight) * 100}%`;
      iframe.style.transform = "";
      iframe.style.top = `${(0.5 - effectiveHeight / 2 / stageHeight - y / stageHeight) * 100}%`;
      iframe.style.left = `${(0.5 - effectiveWidth / 2 / stageWidth + x / stageWidth) * 100}%`;
    }
  }

  function getOverlayMode(resizeBehavior) {
    return resizeBehavior === "scale" ? "scale-centered" : "manual";
  }

  function updateOverlayMode(id) {
    const instance = iframes.get(id);
    if (!instance || !instance.overlay) return;
    const newMode = getOverlayMode(instance.resizeBehavior);
    if (instance.overlay.mode !== newMode) {
      instance.overlay.mode = newMode;
      Scratch.renderer._updateOverlays();
    }
  }

  async function createIframeElement(src) {
    const iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.border = "none";
    iframe.style.position = "absolute";
    iframe.setAttribute("sandbox", SANDBOX.join(" "));
    iframe.setAttribute(
      "allow",
      Object.entries(featurePolicy)
        .map(([name, permission]) => `${name} ${permission}`)
        .join("; ")
    );
    iframe.setAttribute("allowtransparency", "true");
    iframe.setAttribute("src", src);
    return iframe;
  }

  async function createNewIframe(src, isHtml = false) {
    if (!(await Scratch.canEmbed(src))) {
      console.warn("Better Iframe: 无法嵌入该URL:", src);
      return null;
    }

    const id = nextId++;
    const iframe = await createIframeElement(src);

    const stageWidth = Scratch.vm.runtime.stageWidth;
    const stageHeight = Scratch.vm.runtime.stageHeight;
    const instance = {
      id,
      iframe,
      overlay: null,
      src,
      x: 0,
      y: 0,
      width: -1,
      height: -1,
      interactive: true,
      resizeBehavior: "scale",
      visible: true,
    };

    const overlayMode = getOverlayMode(instance.resizeBehavior);
    const overlay = Scratch.renderer.addOverlay(iframe, overlayMode);
    instance.overlay = overlay;

    iframes.set(id, instance);
    updateIframeFrame(id);
    return id;
  }

  function deleteIframe(id) {
    const instance = iframes.get(id);
    if (!instance) return false;
    if (instance.overlay) {
      Scratch.renderer.removeOverlay(instance.iframe);
    }
    iframes.delete(id);
    if (lastMessageSourceId === id) {
      lastMessageSourceId = null;
      lastMessageContent = "";
    }
    if (iframes.size === 0) {
      nextId = 1;
    }
    return true;
  }

  function closeAllIframes() {
    for (const [id, instance] of iframes) {
      if (instance.overlay) {
        Scratch.renderer.removeOverlay(instance.iframe);
      }
    }
    iframes.clear();
    lastMessageSourceId = null;
    lastMessageContent = "";
    nextId = 1;
  }

  window.addEventListener("message", (e) => {
    let sourceId = null;
    for (const [id, instance] of iframes) {
      if (instance.iframe.contentWindow && e.source === instance.iframe.contentWindow) {
        sourceId = id;
        break;
      }
    }
    if (sourceId !== null) {
      lastMessageSourceId = sourceId;
      lastMessageContent =
        typeof e.data === "string" || typeof e.data === "number" || typeof e.data === "boolean"
          ? e.data
          : JSON.stringify(e.data);
      Scratch.vm.runtime.startHats("betterIframe_whenMessage");
    }
  });

  Scratch.vm.on("STAGE_SIZE_CHANGED", () => {
    for (const id of iframes.keys()) {
      updateIframeFrame(id);
    }
  });

  Scratch.vm.runtime.on("RUNTIME_DISPOSED", () => {
    closeAllIframes();
  });

  class BetterIframeExtension {
    getInfo() {
      return {
        name: "更好的Iframe",
        id: "betterIframe",
        blocks: [
          {
            opcode: "createFromUrl",
            blockType: Scratch.BlockType.REPORTER,
            text: "创建网站iframe [URL]",
            arguments: {
              URL: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "https://extensions.turbowarp.org/hello.html",
              },
            },
          },
          {
            opcode: "createFromHtml",
            blockType: Scratch.BlockType.REPORTER,
            text: "从HTML代码创建iframe [HTML]",
            arguments: {
              HTML: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: `<h1 style="color:white;">你好，多开！</h1>`,
              },
            },
          },
          {
            opcode: "delete",
            blockType: Scratch.BlockType.COMMAND,
            text: "删除iframe [ID]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "deleteAll",
            blockType: Scratch.BlockType.COMMAND,
            text: "删除所有iframe",
          },
          "---",
          {
            opcode: "show",
            blockType: Scratch.BlockType.COMMAND,
            text: "显示iframe [ID]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "hide",
            blockType: Scratch.BlockType.COMMAND,
            text: "隐藏iframe [ID]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
            },
          },
          {
            opcode: "setVisible",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置iframe [ID] 可见性 [VISIBLE]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              VISIBLE: {
                type: Scratch.ArgumentType.STRING,
                menu: "booleanMenu",
              },
            },
          },
          "---",
          {
            opcode: "setX",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置iframe [ID] 的X坐标为 [X]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              X: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "setY",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置iframe [ID] 的Y坐标为 [Y]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              Y: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 0,
              },
            },
          },
          {
            opcode: "setWidth",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置iframe [ID] 宽度为 [WIDTH] (负数表示舞台宽度)",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              WIDTH: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 480,
              },
            },
          },
          {
            opcode: "setHeight",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置iframe [ID] 高度为 [HEIGHT] (负数表示舞台高度)",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              HEIGHT: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 360,
              },
            },
          },
          {
            opcode: "setInteractive",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置iframe [ID] 交互性为 [INTERACTIVE]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              INTERACTIVE: {
                type: Scratch.ArgumentType.STRING,
                menu: "booleanMenu",
              },
            },
          },
          {
            opcode: "setResizeBehavior",
            blockType: Scratch.BlockType.COMMAND,
            text: "设置iframe [ID] 缩放模式为 [RESIZE]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              RESIZE: {
                type: Scratch.ArgumentType.STRING,
                menu: "resizeMenu",
              },
            },
          },
          "---",
          {
            opcode: "getProperty",
            blockType: Scratch.BlockType.REPORTER,
            text: "获取iframe [ID] 的 [PROPERTY]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              PROPERTY: {
                type: Scratch.ArgumentType.STRING,
                menu: "propertyMenu",
              },
            },
          },
          {
            opcode: "getAllIds",
            blockType: Scratch.BlockType.REPORTER,
            text: "所有iframe的ID列表 (空格分隔)",
          },
          "---",
          {
            opcode: "sendMessage",
            blockType: Scratch.BlockType.COMMAND,
            text: "向iframe [ID] 发送消息 [MESSAGE]",
            arguments: {
              ID: {
                type: Scratch.ArgumentType.NUMBER,
                defaultValue: 1,
              },
              MESSAGE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "hello",
              },
            },
          },
          {
            opcode: "whenMessage",
            blockType: Scratch.BlockType.EVENT,
            text: "当从任意iframe收到消息时",
            isEdgeActivated: false,
          },
          {
            opcode: "lastMessage",
            blockType: Scratch.BlockType.REPORTER,
            text: "最近收到的消息内容",
          },
          {
            opcode: "lastMessageSource",
            blockType: Scratch.BlockType.REPORTER,
            text: "最近消息的来源iframe ID",
          },
        ],
        menus: {
          booleanMenu: {
            acceptReporters: true,
            items: ["true", "false"],
          },
          resizeMenu: {
            acceptReporters: true,
            items: [
              { text: "缩放模式 (scale)", value: "scale" },
              { text: "视口模式 (viewport)", value: "viewport" },
            ],
          },
          propertyMenu: {
            acceptReporters: true,
            items: [
              "url",
              "可见性",
              "x",
              "y",
              "宽度",
              "高度",
              "交互性",
              "缩放模式",
            ],
          },
        },
      };
    }

    async createFromUrl({ URL }) {
      const url = Scratch.Cast.toString(URL);
      const id = await createNewIframe(url, false);
      return id !== null ? id : 0;
    }

    async createFromHtml({ HTML }) {
      const html = Scratch.Cast.toString(HTML);
      const url = `data:text/html;,${encodeURIComponent(html)}`;
      const id = await createNewIframe(url, true);
      return id !== null ? id : 0;
    }

    delete({ ID }) {
      const id = Scratch.Cast.toNumber(ID);
      deleteIframe(id);
    }

    deleteAll() {
      closeAllIframes();
    }

    show({ ID }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (instance && instance.iframe) {
        instance.iframe.style.display = "";
        instance.visible = true;
      }
    }

    hide({ ID }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (instance && instance.iframe) {
        instance.iframe.style.display = "none";
        instance.visible = false;
      }
    }

    setVisible({ ID, VISIBLE }) {
      const id = Scratch.Cast.toNumber(ID);
      const visible = Scratch.Cast.toBoolean(VISIBLE);
      const instance = iframes.get(id);
      if (instance && instance.iframe) {
        instance.iframe.style.display = visible ? "" : "none";
        instance.visible = visible;
      }
    }

    setX({ ID, X }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (instance) {
        instance.x = Scratch.Cast.toNumber(X);
        updateIframeFrame(id);
      }
    }

    setY({ ID, Y }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (instance) {
        instance.y = Scratch.Cast.toNumber(Y);
        updateIframeFrame(id);
      }
    }

    setWidth({ ID, WIDTH }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (instance) {
        instance.width = Scratch.Cast.toNumber(WIDTH);
        updateIframeFrame(id);
      }
    }

    setHeight({ ID, HEIGHT }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (instance) {
        instance.height = Scratch.Cast.toNumber(HEIGHT);
        updateIframeFrame(id);
      }
    }

    setInteractive({ ID, INTERACTIVE }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (instance) {
        instance.interactive = Scratch.Cast.toBoolean(INTERACTIVE);
        updateIframeFrame(id);
      }
    }

    setResizeBehavior({ ID, RESIZE }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (instance && (RESIZE === "scale" || RESIZE === "viewport")) {
        instance.resizeBehavior = RESIZE;
        updateOverlayMode(id);
        updateIframeFrame(id);
      }
    }

    getProperty({ ID, PROPERTY }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (!instance) return "";
      const prop = Scratch.Cast.toString(PROPERTY);
      switch (prop) {
        case "url":
          return instance.src;
        case "可见性":
          return instance.visible;
        case "x":
          return instance.x;
        case "y":
          return instance.y;
        case "宽度":
          return instance.width >= 0 ? instance.width : Scratch.vm.runtime.stageWidth;
        case "高度":
          return instance.height >= 0 ? instance.height : Scratch.vm.runtime.stageHeight;
        case "交互性":
          return instance.interactive;
        case "缩放模式":
          return instance.resizeBehavior;
        default:
          return "";
      }
    }

    getAllIds() {
      const ids = Array.from(iframes.keys());
      return ids.join(" ");
    }

    sendMessage({ ID, MESSAGE }) {
      const id = Scratch.Cast.toNumber(ID);
      const instance = iframes.get(id);
      if (instance && instance.iframe.contentWindow) {
        instance.iframe.contentWindow.postMessage(Scratch.Cast.toString(MESSAGE), "*");
      }
    }

    whenMessage() {
    }

    lastMessage() {
      return lastMessageContent;
    }

    lastMessageSource() {
      return lastMessageSourceId !== null ? lastMessageSourceId : 0;
    }
  }

  Scratch.extensions.register(new BetterIframeExtension());
})(Scratch);