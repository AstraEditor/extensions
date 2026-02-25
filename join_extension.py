import json
import os
import shutil
import ast

def processing_path(dir):
    returnDir = dir
    if dir[0] == "'" and dir[-1] == "'":
        returnDir = returnDir.rstrip("'")
        returnDir = returnDir.lstrip("'")
    return returnDir

def throwError(condition, content):
    if not condition:
        print(content)
        return 1
def main():
    dir = processing_path(input("输入新扩展的路径:"))
    
    throwError(os.path.isdir(dir), f"非法目录:{dir}")

    dir_files = os.listdir(dir)

    # 我是Python萌新写的判断很史qwq
    throwError(
        ("text.json" in dir_files) and ("featured.png" in dir_files) and ("main.js" in dir_files),
          "无效的扩展目录"
    )
    ext_js = open(f"{dir}/main.js", "r").read()
    for line in ext_js.split('\n'):
        line_content = line.lstrip(" ").lstrip("\t")
        if line_content[0:3] == "id:" or line_content[0:4] == "//ID" or line_content[0:5] == "// ID":
            id_pending = line_content
            break
    
    id_start = 0
    id_end = 0
    for char in range(len(id_pending)):
        if id_pending[char] == "'" or id_pending[char] == "\"" or id_pending[0: char] == '//ID:' or id_pending[0:char] == '// ID:':
            if id_start == 0:
                id_start = char + 1 #不包含这个引号
            else:
                id_end = char
    if id_end == 0: #对于 //ID 的处理
        id_end = len(id_pending)

    id = id_pending[id_start:id_end]

    extensions_dir = processing_path(input("扩展库的目录:"))
    throwError(os.path.isdir(extensions_dir), "非法目录")
    throwError(f"{os.path.isdir(extensions_dir)}/extensions", "找不到extensions文件夹")

    # 复制main.js
    src_path = f"{dir}/main.js"
    dst_path = f"{extensions_dir}/extensions/{id}.js"
    print(f"正在将\"{src_path}\"复制到\"{dst_path}\"")
    shutil.copy(src_path, dst_path)
    # 复制featured.png
    src_path = f"{dir}/featured.png"
    dst_path = f"{extensions_dir}/images/{id}.png"
    print(f"正在将\"{src_path}\"复制到\"{dst_path}\"")
    shutil.copy(src_path, dst_path)

    extensions_id_list_string = open(f"{extensions_dir}/extensions/extensions.json", "r").read()
    try:
        extensions_id_list = ast.literal_eval(extensions_id_list_string)
        extensions_id_list.remove(id) #防止重复
        extensions_id_list.append(id)
        print(f"已加入到扩展ID列表{extensions_id_list}")

        with open(f"{extensions_dir}/extensions/extensions.json", 'w', encoding='utf-8') as f:
            f.write(json.dumps(extensions_id_list, indent=2, ensure_ascii=False))
        
        print("成功保存 extensions.json")
    except:
        print("修改extensions.json失败:"+extensions_id_list_string)

    # 修改翻译
    extensions_translate_list_string = open(f"{extensions_dir}/translations/extension-metadata.json","r").read()
    extensions_translate_list = json.loads(extensions_translate_list_string)
    text_string = open(f"{dir}/text.json","r").read()
    try:
        text = json.loads(text_string)
    except Exception as e:
        print(f"解析失败: {e}")
        return 1
    text_Name = text['Name']
    text_Description = text['Description']

    for key, value in text_Name.items():
        if key == "en-us": continue
        language = extensions_translate_list[key]
        language[f"{id}@name"] = value
        extensions_translate_list[key] = language
        print(f"{key}: {value}")
    for key, value in text_Description.items():
        if key == "en-us": continue
        language = extensions_translate_list[key]
        language[f"{id}@description"] = value
        extensions_translate_list[key] = language
        print(f"{key}: {value}")

    with open(f"{extensions_dir}/translations/extension-metadata.json", 'w', encoding='utf-8') as f:
        f.write(json.dumps(extensions_translate_list, indent=2, ensure_ascii=False))
    print("保存extension-metadata.json成功")
    try:
        os.system(f"cd {extensions_dir} && npm run build")
    except:
        print("自动build失败，您需要手动build一下")
        return 1

    return 0
        

if __name__ == '__main__':
    if(main()):
        print("发生了错误")
    else:
        print("成功！")
    input()
    