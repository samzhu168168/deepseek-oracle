#!/bin/bash
# Elemental Bond 营销工具安装脚本

echo "🚀 Installing Elemental Bond marketing tools..."

# Python 依赖
pip install praw edge-tts requests pillow python-dotenv --break-system-packages

# 检查 FFmpeg
if command -v ffmpeg &> /dev/null; then
    echo "✅ FFmpeg already installed: $(ffmpeg -version 2>&1 | head -1)"
else
    echo "⚠️  FFmpeg not found."
    echo "   Windows: Download from https://ffmpeg.org/download.html"
    echo "   Mac:     brew install ffmpeg"
    echo "   Linux:   sudo apt install ffmpeg"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Copy .env.example to .env and fill in your Reddit credentials"
echo "2. Test Reddit: python reddit_poster.py --dry-run"
echo "3. Generate a video: python video_generator.py"
