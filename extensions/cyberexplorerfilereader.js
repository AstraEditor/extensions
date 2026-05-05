// Name: Cyberexplorer's File Reader
// ID: CyberexplorersFileReader
// Author: Cyberexplorer
// Description: Open files and folders, and return contents in specified formats.
// License: MIT

(function (Scratch) {
  "use strict";

  if (!Scratch.extensions.unsandboxed) {
    throw new Error("fileReader extension must be run unsandboxed");
  }

  // Internationalization setup
  Scratch.translate.setup({
    "zh-cn": {
        "_File Reader": "文件读取器",
        "_Select or drop a file": "选择或拖入一个文件",
        "_Select or drop multiple files": "选择或拖入多个文件",
        "_Select a folder": "选择一个文件夹",
        "_Accepted formats: {formats}": "支持的格式：{formats}",
        "_any": "任意",
        "_dataURL": "dataURL",
        "_Base64": "Base64",
        "_text": "文本",
        "_binary": "二进制文件",
        "_Open single file [FILE_TYPE] as [FORMAT]": "以 [FORMAT] 格式打开单个类型为 [FILE_TYPE] 的文件",
        "_Open multiple files [FILE_TYPE] as [FORMAT]": "以 [FORMAT] 格式打开多个个类型为 [FILE_TYPE] 的文件",
        "_Open folder as [FORMAT]": "以 [FORMAT] 格式打开一个文件夹"},
    "en": {
        "_File Reader": "File Reader",
        "_Select or drop a file": "Select or drop a file",
        "_Select or drop multiple files": "Select or drop multiple files",
        "_Select a folder": "Select a folder",
        "_Accepted formats: {formats}": "Accepted formats: {formats}",
        "_any": "any",
        "_dataURL": "dataURL",
        "_Base64": "Base64",
        "_text": "text",
        "_binary": "binary",
        "_Open single file [FILE_TYPE] as [FORMAT]": "Open a single file of type [FILE_TYPE] as [FORMAT]",
        "_Open multiple files [FILE_TYPE] as [FORMAT]": "Open multiple files of type [FILE_TYPE] as [FORMAT]",
        "_Open folder as [FORMAT]": "Open a folder as [FORMAT]"
        },
    "zh-tw": {
        "_File Reader": "文件讀取器",
        "_Select or drop a file": "選擇或拖入一個文件",
        "_Select or drop multiple files": "選擇或拖入多個文件",
        "_Select a folder": "選擇一個文件夾",
        "_Accepted formats: {formats}": "支持的格式：{formats}",
        "_any": "任意",
        "_dataURL": "dataURL",
        "_Base64": "Base64",
        "_text": "文本",
        "_binary": "二進制文件",
        "_Open single file [FILE_TYPE] as [FORMAT]": "以 [FORMAT] 格式打開一個類型為 [FILE_TYPE] 的文件",
        "_Open multiple files [FILE_TYPE] as [FORMAT]": "以 [FORMAT] 格式打開多個類型為 [FILE_TYPE] 的文件",
        "_Open folder as [FORMAT]": "以 [FORMAT] 格式打開一個文件夾"
        },
    "ja": {
        "_File Reader": "ファイルリーダー",
        "_Select or drop a file": "ファイルを選択またはドラッグアンドドロップ",
        "_Select or drop multiple files": "複数のファイルを選択またはドラッグアンドドロップ",
        "_Select a folder": "フォルダを選択",
        "_Accepted formats: {formats}": "サポートされている形式：{formats}",
        "_any": "任意",
        "_dataURL": "dataURL",
        "_Base64": "Base64",
        "_text": "テキスト",
        "_binary": "バイナリファイル",
        "_Open single file [FILE_TYPE] as [FORMAT]": "[FORMAT] 形式で単一の [FILE_TYPE] ファイルを開く",
        "_Open multiple files [FILE_TYPE] as [FORMAT]": "[FORMAT] 形式で複数の [FILE_TYPE] ファイルを開く",
        "_Open folder as [FORMAT]": "[FORMAT] 形式でフォルダを開く"
        },
    "ru": {
        "_File Reader": "Читатель файлов",
        "_Select or drop a file": "Выберите или перетащите файл",
        "_Select or drop multiple files": "Выберите или перетащите несколько файлов",
        "_Select a folder": "Выберите папку",
        "_Accepted formats: {formats}": "Поддерживаемые форматы: {formats}",
        "_any": "любой",
        "_dataURL": "dataURL",
        "_Base64": "Base64",
        "_text": "текст",
        "_binary": "бинарный файл",
        "_Open single file [FILE_TYPE] as [FORMAT]": "Открыть один файл типа [FILE_TYPE] в формате [FORMAT]",
        "_Open multiple files [FILE_TYPE] as [FORMAT]": "Открыть несколько файлов типа [FILE_TYPE] в формате [FORMAT]",
        "_Open folder as [FORMAT]": "Открыть папку в формате [FORMAT]"
        },
    "la": {
        "_File Reader": "Lector Filiarium",
        "_Select or drop a file": "Selige aut projice plicam",
        "_Select or drop multiple files": "Selige aut projice plures plicas",
        "_Select a folder": "Selige cartabulum",
        "_Accepted formats: {formats}": "Formae acceptae: {formats}",
        "_any": "quilibet",
        "_dataURL": "dataURL",
        "_Base64": "Base64",
        "_text": "textus",
        "_binary": "plicam binariam",
        "_Open single file [FILE_TYPE] as [FORMAT]": "Aperi singulam plicam generis [FILE_TYPE] ut [FORMAT]",
        "_Open multiple files [FILE_TYPE] as [FORMAT]": "Aperi plures plicas generis [FILE_TYPE] ut [FORMAT]",
        "_Open folder as [FORMAT]": "Aperi cartabulum ut [FORMAT]"
        },
    "pt": {
        "_File Reader": "Leitor de Arquivos",
        "_Select or drop a file": "Selecione ou arraste um arquivo",
        "_Select or drop multiple files": "Selecione ou arraste vários arquivos",
        "_Select a folder": "Selecione uma pasta",
        "_Accepted formats: {formats}": "Formatos aceitos: {formats}",
        "_any": "qualquer",
        "_dataURL": "dataURL",
        "_Base64": "Base64",
        "_text": "texto",
        "_binary": "arquivo binário",
        "_Open single file [FILE_TYPE] as [FORMAT]": "Abra um arquivo de tipo [FILE_TYPE] como [FORMAT]",
        "_Open multiple files [FILE_TYPE] as [FORMAT]": "Abra vários arquivos de tipo [FILE_TYPE] como [FORMAT]",
        "_Open folder as [FORMAT]": "Abra uma pasta como [FORMAT]"
        }
  });

  const AS_DATA_URL = "dataURL";
  const AS_BASE64 = "Base64";
  const AS_TEXT = "text";
  const AS_BINARY = "binary";

  /**
   * Show file prompt with drag-and-drop support
   * @param {string} accept - File type filter (e.g., ".txt, .png")
   * @param {string} as - Output format (text, dataURL, Base64, binary)
   * @param {boolean} multiple - Allow multiple files
   * @param {boolean} folder - Allow folder selection
   * @returns {Promise<string>} - JSON result
   */
  const showFilePrompt = (accept, as, multiple = false, folder = false) => {
    return new Promise((resolve) => {
      const overlay = document.createElement("div");
      overlay.style.position = "fixed";
      overlay.style.top = "0";
      overlay.style.left = "0";
      overlay.style.width = "100%";
      overlay.style.height = "100%";
      overlay.style.display = "flex";
      overlay.style.alignItems = "center";
      overlay.style.justifyContent = "center";
      overlay.style.background = "rgba(0, 0, 0, 0.5)";
      overlay.style.zIndex = "1000";

      const button = document.createElement("button");
      button.style.padding = "20px 40px";
      button.style.fontSize = "18px";
      button.style.color = "black";
      button.style.background = "white";
      button.style.border = "2px solid #ccc";
      button.style.borderRadius = "10px";
      button.style.cursor = "pointer";
      button.style.textAlign = "center";
      button.style.lineHeight = "1.5";

      // Determine button text based on operation type
      let mainText;
      if (folder) {
        mainText = Scratch.translate("Select a folder");
      } else if (multiple) {
        mainText = Scratch.translate("Select or drop multiple files");
      } else {
        mainText = Scratch.translate("Select or drop a file");
      }

      // Format the accepted file types
      const formattedAccept = accept === "*" ? Scratch.translate("any") : accept;

      // Create button content with two lines
      const buttonContent = document.createElement("div");
      const line1 = document.createElement("div");
      line1.textContent = mainText;
      line1.style.fontWeight = "bold";

      const line2 = document.createElement("div");
      line2.textContent = folder ? "" : Scratch.translate("Accepted formats: {formats}", { formats: formattedAccept });
      line2.style.color = "#666";
      line2.style.fontSize = "14px";

      buttonContent.appendChild(line1);
      buttonContent.appendChild(line2);
      button.appendChild(buttonContent);

      const input = document.createElement("input");
      input.type = "file";
      input.accept = accept;
      input.multiple = multiple;
      input.webkitdirectory = folder;
      input.style.display = "none";

      button.addEventListener("click", () => {
        input.click();
      });

      input.addEventListener("change", async () => {
        if (input.files.length === 0) {
          resolve(""); // User canceled
        } else {
          try {
            const files = Array.from(input.files);
            const results = await Promise.all(files.map(file => readFile(file, as)));

            if (folder) {
              const folderName = files[0].webkitRelativePath.split("/")[0];
              const output = {
                folderName: folderName,
                content: files.map((file, index) => ({
                  fileName: file.name,
                  content: results[index]
                }))
              };
              resolve(JSON.stringify(output));
            } else {
              const output = multiple
                ? files.map((file, index) => ({
                  fileName: file.name,
                  content: results[index]
                }))
                : { fileName: files[0].name, content: results[0] };
              resolve(JSON.stringify(output));
            }
          } catch (error) {
            console.error("Error reading file:", error);
            resolve(""); // Return empty if error occurs
          }
        }
        document.body.removeChild(overlay);
      });

      overlay.addEventListener("dragover", (e) => {
        e.preventDefault();
        button.style.border = "2px solid #4CAF50";
      });

      overlay.addEventListener("dragleave", () => {
        button.style.border = "2px solid #ccc";
      });

      overlay.addEventListener("drop", (e) => {
        e.preventDefault();
        input.files = e.dataTransfer.files;
        input.dispatchEvent(new Event("change"));
      });

      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          resolve(""); // Cancel if clicking outside
          document.body.removeChild(overlay);
        }
      });

      document.body.appendChild(overlay);
      overlay.appendChild(button);
    });
  };

  /**
   * Read file content based on format
   * @param {File} file - File object
   * @param {string} format - Output format (text, dataURL, Base64, binary)
   * @returns {Promise<string>} - File content
   */
  const readFile = (file, format) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      if (!reader) {
        reject("FileReader is not available");
        return;
      }
  
      switch (format) {
        case AS_DATA_URL:
        case AS_BASE64:
          if (reader.readAsDataURL) {
            reader.readAsDataURL(file);
          } else {
            reject("FileReader.readAsDataURL is not supported");
          }
          break;
        case AS_TEXT:
          reader.readAsText(file);
          break;
        case AS_BINARY:
          reader.readAsArrayBuffer(file);
          break;
        default:
          reject("Invalid format");
      }
  
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => {
        console.error("Error reading file:", error);
        reject(error);
      };
    });
  };

  class FileReaderExt {
    getInfo() {
      return {
        id: "CyberexplorersFileReader",
        name: Scratch.translate("File Reader"),
        color1: "#4CAF50",
        color2: "#388E3C",
        blocks: [
          {
            opcode: "openSingleFile",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("Open single file [FILE_TYPE] as [FORMAT]"),
            arguments: {
              FILE_TYPE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "*"
              },
              FORMAT: {
                type: Scratch.ArgumentType.STRING,
                menu: "formats"
              }
            }
          },
          {
            opcode: "openMultipleFiles",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("Open multiple files [FILE_TYPE] as [FORMAT]"),
            arguments: {
              FILE_TYPE: {
                type: Scratch.ArgumentType.STRING,
                defaultValue: "*"
              },
              FORMAT: {
                type: Scratch.ArgumentType.STRING,
                menu: "formats"
              }
            }
          },
          {
            opcode: "openFolder",
            blockType: Scratch.BlockType.REPORTER,
            text: Scratch.translate("Open folder as [FORMAT]"),
            disableMonitor: true,
            arguments: {
              FORMAT: {
                type: Scratch.ArgumentType.STRING,
                menu: "formats"
              }
            }
          }
        ],
        menus: {
          formats: {
            items: [
              { text: Scratch.translate("dataURL"), value: AS_DATA_URL },
              { text: Scratch.translate("Base64"), value: AS_BASE64 },
              { text: Scratch.translate("text"), value: AS_TEXT },
              { text: Scratch.translate("binary"), value: AS_BINARY }
            ]
          }
        }
      };
    }

    openSingleFile(args) {
      return showFilePrompt(args.FILE_TYPE, args.FORMAT);
    }

    openMultipleFiles(args) {
      return showFilePrompt(args.FILE_TYPE, args.FORMAT, true);
    }

    openFolder(args) {
      return showFilePrompt("", args.FORMAT, false, true);
    }
  }

  Scratch.extensions.register(new FileReaderExt());
})(Scratch);