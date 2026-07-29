import json
import os
from PIL import Image, ImageDraw, ImageFont

def visualize_detection_result(image_path, json_path, output_path=None):
    """
    在图片上绘制识别框和物品名称
    
    参数:
    image_path (str): 输入图片的路径
    json_path (str): 包含识别结果的JSON文件路径
    output_path (str, optional): 输出图片的路径。若未指定，会在原文件名后添加"_annotated"
    
    返回:
    PIL.Image: 处理后的图片对象
    """
    # 打开图片
    try:
        image = Image.open(image_path).convert("RGB")
    except FileNotFoundError:
        print(f"错误: 找不到图片文件 {image_path}")
        return None
    
    # 读取JSON数据
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            detections = json.load(f)
    except FileNotFoundError:
        print(f"错误: 找不到JSON文件 {json_path}")
        return None
    except json.JSONDecodeError:
        print(f"错误: JSON文件格式不正确 {json_path}")
        return None
    
    # 定义不同类别的颜色
    colors = {
        "head": "red",
        "bow": "blue",
        "bag": "green",
    }
    
    # 创建绘图对象
    draw = ImageDraw.Draw(image)
    
    # 尝试加载字体，确保中文能正常显示
    # try:
    #     font = ImageFont.truetype("simhei.ttf", 16)
    # except IOError:
    #     # 如果找不到中文字体，使用默认字体
    #     font = ImageFont.load_default()
    font = ImageFont.load_default()
    # 绘制每个检测结果
    for detection in detections:
        category = detection.get("category", "其他")
        bbox_str = detection.get("bbox", "")
        
        if not bbox_str:
            continue
        
        # 解析边界框坐标
        try:
            x1, y1, x2, y2 = map(int, bbox_str.split())
        except ValueError:
            print(f"警告: 无法解析边界框坐标 {bbox_str}")
            continue
        
        # 获取类别对应的颜色
        color = colors.get(category, "purple")
        
        # 绘制边界框
        draw.rectangle([x1, y1, x2, y2], outline=color, width=2)
        
        # 计算文本框的位置和大小
        text_bbox = font.getbbox(category)
        text_width = 40#text_bbox[2] - text_bbox[0]
        text_height = 20#text_bbox[3] - text_bbox[1]
        
        text_bg_rect = [x1, y1 - text_height - 5, x1 + text_width + 5, y1]
        
        # 绘制文本背景
        draw.rectangle(text_bg_rect, fill=color)
        
        # 绘制文本
        draw.text((x1 + 2, y1 - text_height - 3), category, fill="white", font=font)
    # 保存图片
    if output_path:
        image.save(output_path)
        print(f"已保存标注后的图片到 {output_path}")
    else:
        # 如果未指定输出路径，在原文件名后添加"_annotated"
        base, ext = os.path.splitext(image_path)
        output_path = f"{base}_annotated{ext}"
        image.save(output_path)
        print(f"已保存标注后的图片到 {output_path}")
    
    return image

if __name__ == "__main__":
    # 使用示例
    image_path = "D://Pictures/_game_resource/aigame/ff1.jpg"  # 替换为你的图片路径
    json_path = "D://Pictures/_game_resource/aigame/image_box.json"  # 替换为你的JSON路径
    
    visualize_detection_result(image_path, json_path)    