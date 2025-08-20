# 빌드 스테이지
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# ARG로 빌드 타임에 동적 설정
ARG NEXT_PUBLIC_URL=https://localhost
ENV NEXT_PUBLIC_URL=${NEXT_PUBLIC_URL}

RUN npm run build

# 실행 스테이지
FROM node:18-alpine

ARG UID=1001
RUN addgroup -g ${UID} appgroup && \
    adduser -u ${UID} -G appgroup -S appuser

# 작업 디렉토리 설정 및 파일 복사
WORKDIR /app
COPY --from=builder /app ./

# 실행 사용자에게 권한 부여
RUN chown -R appuser:appgroup /app

USER appuser

EXPOSE 3000
CMD ["npm", "run", "start"]