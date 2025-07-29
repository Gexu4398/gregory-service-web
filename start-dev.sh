#!/bin/bash

# Gregory Service Web 开发环境启动脚本

set -e

echo "🚀 启动 Gregory Service Web 开发环境..."

# 检查是否安装了 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查是否存在 node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 首次运行，安装依赖..."
    npm install
fi

# 检查是否存在环境配置文件
if [ ! -f ".env.development" ]; then
    echo "⚠️  .env.development 文件不存在，从示例文件复制..."
    if [ -f ".env.example" ]; then
        cp .env.example .env.development
        echo "✅ 已创建 .env.development 文件，请根据需要修改配置"
    else
        echo "❌ .env.example 文件不存在"
        exit 1
    fi
fi

# 显示配置信息
echo "📋 当前配置："
echo "   - API URL: $(grep VITE_API_URL .env.development | cut -d'=' -f2)"
echo "   - Keycloak URL: $(grep VITE_KEYCLOAK_URL .env.development | cut -d'=' -f2)"
echo "   - Keycloak Realm: $(grep VITE_KEYCLOAK_REALM .env.development | cut -d'=' -f2)"

# 启动开发服务器
echo "🌐 启动开发服务器..."
echo "   访问地址: http://localhost:3000"
echo "   按 Ctrl+C 停止服务器"
echo ""

npm run dev 