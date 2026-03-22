import json
import os
import shutil
import tempfile
import re


def processing_path(dir):
    returnDir = dir
    if dir[0] == "'" and dir[-1] == "'":
        returnDir = returnDir.rstrip("'")
        returnDir = returnDir.lstrip("'")
    return returnDir


def fix_trailing_commas(json_string):
    """移除 JSON 中的尾随逗号，如 {...,} 或 [...,]"""
    return re.sub(r',(\s*[}\]])', r'\1', json_string)


def load_json_flexible(json_string):
    """灵活加载 JSON，支持尾随逗号"""
    try:
        return json.loads(json_string)
    except json.JSONDecodeError:
        fixed = fix_trailing_commas(json_string)
        return json.loads(fixed)


def main():
    dir = processing_path(input("输入新扩展的路径:"))
    
    if not os.path.isdir(dir):
        print(f"非法目录:{dir}")
        return 1

    dir_files = os.listdir(dir)

    if not (("text.json" in dir_files) and ("featured.png" in dir_files) and ("main.js" in dir_files)):
        print("无效的扩展目录")
        return 1

    ext_js = open(f"{dir}/main.js", "r").read()
    id_pending = None
    for line in ext_js.split('\n'):
        line_content = line.lstrip(" ").lstrip("\t")
        if line_content[0:3] == "id:" or line_content[0:4] == "//ID" or line_content[0:5] == "// ID":
            id_pending = line_content
            break
    
    if id_pending is None:
        print("未找到扩展ID")
        return 1
    
    id_start = 0
    id_end = 0
    for char in range(len(id_pending)):
        if id_pending[char] == "'" or id_pending[char] == "\"" or id_pending[0: char] == '//ID:' or id_pending[0:char] == '// ID:':
            if id_start == 0:
                id_start = char + 1
            else:
                id_end = char
    if id_end == 0:
        id_end = len(id_pending)

    id = id_pending[id_start:id_end].strip()
    print(f"id: {id}")
    
    # extensions_dir = processing_path(input("扩展库的目录:"))
    extensions_dir = processing_path(os.path.dirname(os.path.realpath(__file__))) #当前目录
    print(f"我们正在: {extensions_dir} 中")

    if not os.path.isdir(extensions_dir):
        print("非法目录")
        return 1
    if not os.path.isdir(f"{extensions_dir}/extensions"):
        print("找不到extensions文件夹")
        return 1

    # 创建临时备份目录
    backup_dir = tempfile.mkdtemp()
    
    # 定义文件路径
    extensions_json_path = f"{extensions_dir}/extensions/extensions.json"
    metadata_json_path = f"{extensions_dir}/translations/extension-metadata.json"
    dst_js_path = f"{extensions_dir}/extensions/{id}.js"
    dst_png_path = f"{extensions_dir}/images/{id}.png"
    
    try:
        # 复制 main.js
        src_path = f"{dir}/main.js"
        print(f"正在将\"{src_path}\"复制到\"{dst_js_path}\"")
        shutil.copy(src_path, dst_js_path)
        
        # 复制 featured.png
        src_path = f"{dir}/featured.png"
        print(f"正在将\"{src_path}\"复制到\"{dst_png_path}\"")
        shutil.copy(src_path, dst_png_path)
        
        # 备份 extensions.json
        shutil.copy(extensions_json_path, os.path.join(backup_dir, "extensions.json"))
        
        # 处理 extensions.json
        extensions_id_list_string = open(extensions_json_path, "r").read()
        try:
            extensions_id_list = load_json_flexible(extensions_id_list_string)
            try:
                extensions_id_list.remove(id)
            except ValueError:
                print("未发现重复ID")
            extensions_id_list.append(id)
            print(f"已加入到扩展ID列表{extensions_id_list}")

            with open(extensions_json_path, 'w', encoding='utf-8') as f:
                f.write(json.dumps(extensions_id_list, indent=2, ensure_ascii=False))
            
            print("成功保存 extensions.json")
        except Exception as e:
            print(f"修改extensions.json失败: {e}")
            shutil.copy(os.path.join(backup_dir, "extensions.json"), extensions_json_path)
            return 1

        # 备份 extension-metadata.json
        shutil.copy(metadata_json_path, os.path.join(backup_dir, "extension-metadata.json"))
        
        # 处理翻译
        extensions_translate_list_string = open(metadata_json_path, "r").read()
        try:
            extensions_translate_list = load_json_flexible(extensions_translate_list_string)
        except Exception as e:
            print(f"解析extension-metadata.json失败: {e}")
            shutil.copy(os.path.join(backup_dir, "extensions.json"), extensions_json_path)
            shutil.copy(os.path.join(backup_dir, "extension-metadata.json"), metadata_json_path)
            return 1
            
        text_string = open(f"{dir}/text.json", "r").read()
        try:
            text = load_json_flexible(text_string)
        except Exception as e:
            print(f"解析text.json失败: {e}")
            shutil.copy(os.path.join(backup_dir, "extensions.json"), extensions_json_path)
            shutil.copy(os.path.join(backup_dir, "extension-metadata.json"), metadata_json_path)
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

        with open(metadata_json_path, 'w', encoding='utf-8') as f:
            f.write(json.dumps(extensions_translate_list, indent=2, ensure_ascii=False))
        print("保存extension-metadata.json成功")
        
        # 运行 build
        build_result = os.system(f"cd {extensions_dir} && npm run build")
        if build_result != 0:
            print("自动build失败，正在回退更改...")
            shutil.copy(os.path.join(backup_dir, "extensions.json"), extensions_json_path)
            shutil.copy(os.path.join(backup_dir, "extension-metadata.json"), metadata_json_path)
            os.remove(dst_js_path)
            os.remove(dst_png_path)
            return 1
            
    except Exception as e:
        print(f"操作过程中发生错误: {e}")
        try:
            if os.path.exists(os.path.join(backup_dir, "extensions.json")):
                shutil.copy(os.path.join(backup_dir, "extensions.json"), extensions_json_path)
            if os.path.exists(os.path.join(backup_dir, "extension-metadata.json")):
                shutil.copy(os.path.join(backup_dir, "extension-metadata.json"), metadata_json_path)
            if os.path.exists(dst_js_path):
                os.remove(dst_js_path)
            if os.path.exists(dst_png_path):
                os.remove(dst_png_path)
        except Exception as rollback_error:
            print(f"回退过程也发生错误: {rollback_error}")
        return 1
    finally:
        shutil.rmtree(backup_dir)

    return 0


if __name__ == '__main__':
    if main():
        print("发生了错误")
    else:
        print("成功！")