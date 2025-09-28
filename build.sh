#!/bin/bash

# NestJS AWS Lambda 部署脚本
# 使用 AWS SAM 进行构建和部署

set -e

echo "🚀 开始部署 NestJS Lambda 应用..."

# 检查必要工具
check_dependencies() {
    echo "🔍 检查依赖工具..."

    if ! command -v sam &> /dev/null; then
        echo "❌ AWS SAM CLI 未安装，请先安装: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html"
        exit 1
    fi

    if ! command -v aws &> /dev/null; then
        echo "❌ AWS CLI 未安装，请先安装: https://aws.amazon.com/cli/"
        exit 1
    fi

    echo "✅ 依赖工具检查通过"
}

# 清理旧文件
clean_build() {
    echo "🧹 清理构建文件..."
    rm -rf dist/
    rm -rf layer/
    echo "✅ 清理完成"
}

# 安装依赖
install_dependencies() {
    echo "📦 安装项目依赖..."
    yarn install --production=false
    echo "✅ 依赖安装完成"
}

# 构建应用
build_app() {
    echo "🔨 构建 NestJS 应用..."
    yarn build
    echo "✅ 应用构建完成"
}

# 准备 Lambda Layer
prepare_layer() {
    echo "📁 准备 Lambda Layer..."

    # 创建 layer 目录
    mkdir -p layer/nodejs

    # 复制 package.json 和 yarn.lock
    cp package.json layer/nodejs/
    cp yarn.lock layer/nodejs/

    # 进入 layer 目录安装生产依赖
    cd layer/nodejs

    # 创建优化的 package.json，排除大型不必要的依赖
    cat > package.json << 'EOF'
{
  "name": "nest-aws-layer",
  "version": "0.0.1",
  "dependencies": {
    "@nestjs/common": "^11.0.1",
    "@nestjs/core": "^11.0.1",
    "@nestjs/platform-express": "^11.0.1",
    "@prisma/client": "6.16.2",
    "express": "^5.1.0",
    "nunjucks": "^3.2.4",
    "reflect-metadata": "^0.2.2",
    "rxjs": "^7.8.1",
    "serverless-http": "^4.0.0"
  }
}
EOF

    yarn install --production --frozen-lockfile

    # 删除不需要的文件以进一步减少大小
    find node_modules -name "*.d.ts" -delete
    find node_modules -name "*.map" -delete
    find node_modules -name "README*" -delete
    find node_modules -name "CHANGELOG*" -delete
    find node_modules -name "*.md" -delete
    find node_modules -name "test" -type d -exec rm -rf {} + 2>/dev/null || true
    find node_modules -name "tests" -type d -exec rm -rf {} + 2>/dev/null || true
    find node_modules -name "docs" -type d -exec rm -rf {} + 2>/dev/null || true

    # 返回根目录
    cd ../../

    echo "✅ Lambda Layer 准备完成"
}

# 复制静态资源
copy_assets() {
    echo "📋 复制静态资源..."

    # 复制视图文件
    if [ -d "views" ]; then
        cp -r views dist/
        echo "✅ 视图文件已复制"
    fi

    # 复制静态资源
    if [ -d "assets" ]; then
        cp -r assets dist/
        echo "✅ 静态资源已复制"
    fi

     # 复制 Prisma Client（必须）
    if [ -d "node_modules/@prisma/client" ]; then
        mkdir -p layer/nodejs/node_modules/@prisma
        cp -r node_modules/@prisma/client layer/nodejs/node_modules/@prisma/
        echo "✅ Prisma Client 已复制到 Lambda Layer"
    fi

    # 复制 Prisma 引擎（必须，否则 Lambda 500）
    if [ -d "node_modules/.prisma" ]; then
        cp -r node_modules/.prisma layer/nodejs/node_modules/
        echo "✅ Prisma 引擎已复制到 Lambda Layer"
    fi

    echo "✅ 资源复制完成"
}

# SAM 构建
sam_build() {
    echo "🏗️ 执行 SAM 构建..."
    sam build --use-container
    echo "✅ SAM 构建完成"
}

# SAM 部署
sam_deploy() {
    echo "🚀 部署到 AWS..."

    # 获取堆栈名称（可选参数）
    STACK_NAME=${1:-nest-aws-app}

    sam deploy \
        --stack-name "$STACK_NAME" \
        --capabilities CAPABILITY_IAM \
        --resolve-s3 \
        --no-confirm-changeset \
        --parameter-overrides \
            ParameterKey=Environment,ParameterValue=production

    echo "✅ 部署完成"
}

# 显示输出信息
show_outputs() {
    echo "📋 获取部署信息..."

    STACK_NAME=${1:-nest-aws-app}

    echo "🌐 API 端点:"
    aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
        --output text

    echo "⚡ Lambda 函数 ARN:"
    aws cloudformation describe-stacks \
        --stack-name "$STACK_NAME" \
        --query 'Stacks[0].Outputs[?OutputKey==`FunctionArn`].OutputValue' \
        --output text
}

# 主函数
main() {
    echo "🎯 NestJS AWS Lambda 部署开始"
    echo "================================="

    # 解析命令行参数
    STACK_NAME=${1:-nest-aws-app}
    SKIP_BUILD=${2:-false}

    check_dependencies

    if [ "$SKIP_BUILD" != "true" ]; then
        clean_build
        install_dependencies
        build_app
        prepare_layer
        copy_assets
        sam_build
    else
        echo "⏭️ 跳过构建步骤"
    fi

    sam_deploy "$STACK_NAME"
    show_outputs "$STACK_NAME"

    echo "================================="
    echo "🎉 部署完成！"
    echo "📚 使用说明:"
    echo "  - 完整部署: ./build.sh [stack-name]"
    echo "  - 仅部署: ./build.sh [stack-name] true"
    echo "  - 示例: ./build.sh my-app"
}

# 执行主函数
main "$@"