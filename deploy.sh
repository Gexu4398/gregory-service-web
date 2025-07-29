#!/bin/bash

# Gregory Service Web 部署脚本

set -e

echo "🚀 开始部署 Gregory Service Web..."

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查 Node.js 版本
NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

if [ "$(printf '%s\n' "$REQUIRED_VERSION" "$NODE_VERSION" | sort -V | head -n1)" != "$REQUIRED_VERSION" ]; then
    echo "❌ Node.js 版本过低，需要 18.0.0+，当前版本：$NODE_VERSION"
    exit 1
fi

echo "✅ Node.js 版本检查通过：$NODE_VERSION"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 类型检查
echo "🔍 执行类型检查..."
npm run type-check

# 代码检查
echo "🔧 执行代码检查..."
npm run lint

# 构建项目
echo "🏗️ 构建项目..."
npm run build

echo "✅ 构建完成！"

# 如果传入了部署目标参数
if [ "$1" = "docker" ]; then
    echo "🐳 构建 Docker 镜像..."
    docker build -t gregory-service-web:latest .
    echo "✅ Docker 镜像构建完成！"
elif [ "$1" = "nginx" ]; then
    echo "📄 复制文件到 Nginx 目录..."
    if [ -d "/var/www/html" ]; then
        sudo cp -r dist/* /var/www/html/
        echo "✅ 文件已复制到 /var/www/html/"
    else
        echo "❌ /var/www/html 目录不存在"
        exit 1
    fi
else
    echo "📁 构建文件位于 dist/ 目录"
    echo "🔧 可选部署方式："
    echo "   - Docker: ./deploy.sh docker"
    echo "   - Nginx:  ./deploy.sh nginx"
fi

echo "🎉 部署完成！" 