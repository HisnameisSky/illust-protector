FROM node:20-alpine

WORKDIR /app

# 依存パッケージのインストール
COPY package*.json ./
RUN npm install

# ソースコードのコピー
COPY . .

# Viteの開発サーバーを外部アクセス許可（--host）で起動
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host"]