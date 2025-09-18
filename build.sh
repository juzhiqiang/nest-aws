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
    yarn install --production --frozen-lockfile

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