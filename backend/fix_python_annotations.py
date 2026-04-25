#!/usr/bin/env python3
"""
批量修复Python 3.8的类型注解问题。
在所有Python文件开头添加 'from __future__ import annotations'（如果尚未存在）。
"""
import os
import sys

def should_add_future_import(content: str) -> bool:
    """检查文件是否已经包含 __future__ import annotations"""
    lines = content.splitlines()
    for line in lines[:10]:  # 只检查前10行
        if 'from __future__ import annotations' in line:
            return False
        if 'import' in line and '__future__' in line and 'annotations' in line:
            return False
    return True

def add_future_import(content: str) -> str:
    """在文件开头添加 __future__ import"""
    lines = content.splitlines(keepends=True)
    
    # 找到第一个非空行、非注释行之后的位置
    insert_idx = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if stripped and not stripped.startswith('#'):
            insert_idx = i
            break
    
    # 在insert_idx位置插入
    lines.insert(insert_idx, 'from __future__ import annotations\n')
    return ''.join(lines)

def process_file(filepath: str) -> bool:
    """处理单个文件"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        if not should_add_future_import(content):
            return False
        
        new_content = add_future_import(content)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        
        print(f"[OK] 已修复: {filepath}")
        return True
    except Exception as e:
        print(f"[ERROR] 错误处理 {filepath}: {e}")
        return False

def main():
    start_dir = os.path.dirname(os.path.abspath(__file__))
    
    count = 0
    fixed = 0
    
    for root, dirs, files in os.walk(start_dir):
        # 跳过虚拟环境目录
        if '.venv' in root or '__pycache__' in root:
            continue
        
        for filename in files:
            if filename.endswith('.py'):
                filepath = os.path.join(root, filename)
                count += 1
                if process_file(filepath):
                    fixed += 1
    
    print(f"\n处理完成: 扫描了 {count} 个Python文件，修复了 {fixed} 个文件。")

if __name__ == '__main__':
    main()