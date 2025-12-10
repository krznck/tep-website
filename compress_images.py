#!/usr/bin/env python3
"""
Image Compression Script for TEP Website
Compresses all images in the members_pic folder to reduce file size
while maintaining good quality.
"""

import os
from pathlib import Path
from PIL import Image

def compress_image(input_path, output_path, max_size=(800, 800), quality=85):
    """
    Compress an image file.
    
    Args:
        input_path: Path to input image
        output_path: Path to save compressed image
        max_size: Maximum dimensions (width, height)
        quality: JPEG quality (1-100, default 85)
    """
    try:
        with Image.open(input_path) as img:
            # Convert RGBA to RGB if necessary
            if img.mode in ('RGBA', 'LA', 'P'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                if img.mode == 'P':
                    img = img.convert('RGBA')
                background.paste(img, mask=img.split()[-1] if img.mode == 'RGBA' else None)
                img = background
            
            # Resize if image is larger than max_size
            img.thumbnail(max_size, Image.Resampling.LANCZOS)
            
            # Get file extension
            ext = output_path.suffix.lower()
            
            # Save with appropriate format
            if ext in ['.jpg', '.jpeg']:
                img.save(output_path, 'JPEG', quality=quality, optimize=True)
            elif ext == '.png':
                img.save(output_path, 'PNG', optimize=True)
            elif ext == '.webp':
                img.save(output_path, 'WEBP', quality=quality)
            else:
                img.save(output_path, quality=quality, optimize=True)
            
            # Get file sizes
            original_size = os.path.getsize(input_path)
            compressed_size = os.path.getsize(output_path)
            reduction = ((original_size - compressed_size) / original_size) * 100
            
            print(f"✓ {input_path.name}")
            print(f"  {original_size / 1024 / 1024:.2f} MB → {compressed_size / 1024 / 1024:.2f} MB ({reduction:.1f}% reduction)")
            
            return True
    except Exception as e:
        print(f"✗ Error processing {input_path.name}: {e}")
        return False

def compress_folder(folder_path, max_size=(800, 800), quality=85, backup=True):
    """
    Compress all images in a folder.
    
    Args:
        folder_path: Path to folder containing images
        max_size: Maximum dimensions (width, height)
        quality: JPEG quality (1-100)
        backup: Whether to backup original files
    """
    folder = Path(folder_path)
    
    if not folder.exists():
        print(f"Error: Folder '{folder}' does not exist")
        return
    
    # Create backup folder if needed
    if backup:
        backup_folder = folder.parent / f"{folder.name}_backup"
        backup_folder.mkdir(exist_ok=True)
        print(f"📁 Backup folder: {backup_folder}")
    
    # Supported image extensions
    extensions = {'.jpg', '.jpeg', '.png', '.webp'}
    
    # Get all image files
    image_files = [f for f in folder.iterdir() if f.suffix.lower() in extensions]
    
    if not image_files:
        print(f"No images found in {folder}")
        return
    
    print(f"\n🖼️  Found {len(image_files)} images to compress\n")
    
    success_count = 0
    for image_file in image_files:
        # Backup original file
        if backup:
            backup_path = backup_folder / image_file.name
            if not backup_path.exists():
                import shutil
                shutil.copy2(image_file, backup_path)
        
        # Create temporary output path
        temp_output = folder / f"temp_{image_file.name}"
        
        # Compress image
        if compress_image(image_file, temp_output, max_size, quality):
            # Replace original with compressed version
            temp_output.replace(image_file)
            success_count += 1
        else:
            # Remove temp file if compression failed
            if temp_output.exists():
                temp_output.unlink()
    
    print(f"\n✅ Successfully compressed {success_count}/{len(image_files)} images")
    if backup:
        print(f"📦 Original files backed up to: {backup_folder}")

def main():
    print("=" * 60)
    print("TEP Website Image Compression Tool")
    print("=" * 60)
    print()
    
    # Get script directory
    script_dir = Path(__file__).parent
    members_pic = script_dir / "assets" / "members_pic"
    
    if not members_pic.exists():
        print(f"Error: Members picture folder not found at {members_pic}")
        return
    
    print(f"📂 Compressing images in: {members_pic}")
    print()
    
    # Ask for confirmation
    response = input("This will compress all images in the members_pic folder. Continue? (y/n): ")
    if response.lower() != 'y':
        print("Cancelled.")
        return
    
    print()
    print("Compression settings:")
    print("  - Max dimensions: 800x800 pixels")
    print("  - Quality: 85%")
    print("  - Backup: Yes")
    print()
    
    # Compress images
    compress_folder(members_pic, max_size=(800, 800), quality=85, backup=True)
    
    print()
    print("=" * 60)
    print("Done! You can now use the compressed images on your website.")
    print("=" * 60)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n\nCancelled by user.")
    except Exception as e:
        print(f"\n\nError: {e}")
