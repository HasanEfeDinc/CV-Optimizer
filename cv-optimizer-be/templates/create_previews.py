#!/usr/bin/env python3
"""
This script generates preview images for CV templates.
In a real production environment, you would want to create
actual preview images from rendered templates.
This is a simplified version that just creates placeholder images.
"""

import os
from PIL import Image, ImageDraw, ImageFont

def create_preview_image(output_path, title, color="#3498db"):
    """Create a simple preview image for a template"""
    width, height = 600, 800
    img = Image.new('RGB', (width, height), color='white')
    draw = ImageDraw.Draw(img)
    
    # Draw border
    draw.rectangle([(10, 10), (width-10, height-10)], outline=color, width=2)
    
    # Draw title
    try:
        font = ImageFont.truetype("Arial.ttf", 40)  # You may need to adjust the font path
    except IOError:
        font = ImageFont.load_default()
    
    draw.text((width//2, height//4), title, fill=color, font=font, anchor="mm")
    
    # Draw some template preview lines
    line_y = height//2
    for _ in range(10):
        line_width = width//3 + (width//3 * (_/10))
        draw.line([(width//4, line_y), (width//4 + line_width, line_y)], fill='#aaaaaa', width=5)
        line_y += 30

    img.save(output_path)
    print(f"Created preview image: {output_path}")

def main():
    """Main function to create all preview images"""
    dirname = os.path.dirname(__file__)
    
    templates = [
        {"id": "classic", "name": "Classic Template"},
        {"id": "modern", "name": "Modern Template"}
    ]
    
    for template in templates:
        output_path = os.path.join(dirname, f"{template['id']}.png")
        create_preview_image(output_path, template["name"])

if __name__ == "__main__":
    main() 