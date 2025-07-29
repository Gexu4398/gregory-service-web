#!/bin/bash

# Gregory Service Web 环境配置脚本

echo "🔧 设置环境配置文件..."

# 创建 .env.example
if [ ! -f ".env.example" ]; then
    echo "📝 创建 .env.example..."
    cp env.example .env.example
    echo "✅ .env.example 文件已创建"
else
    echo "ℹ️  .env.example 文件已存在"
fi

# 创建 ..env.development
if [ ! -f ".env.development" ]; then
    echo "📝 创建 .env.development..."
    cp .env.development ..env.development
    echo "✅ .env.development 文件已创建"
else
    echo "ℹ️  .env.development 文件已存在"
fi

# 创建 ..env.production
if [ ! -f ".env.production" ]; then
    echo "📝 创建 .env.production..."
    cp .env.production ..env.production
    echo "✅ .env.production 文件已创建"
else
    echo "ℹ️  .env.production 文件已存在"
fi

# 创建默认的 .env
if [ ! -f ".env" ]; then
    echo "📝 创建默认 .env..."
    cp .env.development .env
    echo "✅ .env 文件已创建（复制自开发环境配置）"
else
    echo "ℹ️  .env 文件已存在"
fi

echo ""
echo "🎉 环境配置完成！"
echo ""
echo "📋 配置文件说明："
echo "   .env.example    - 环境配置示例文件"
echo "   .env.development - 开发环境配置"
echo "   .env.production  - 生产环境配置"
echo "   .env             - 当前使用的环境配置"
echo ""
echo "🔧 请根据你的实际环境修改以下配置："
echo "   VITE_API_URL         - 后端 API 地址"
echo "   VITE_KEYCLOAK_URL    - Keycloak 服务地址"
echo "   VITE_KEYCLOAK_REALM  - Keycloak 域名"
echo "   VITE_KEYCLOAK_CLIENT_ID - Keycloak 客户端 ID" 