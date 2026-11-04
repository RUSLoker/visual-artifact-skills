FROM node:24.19.0-slim
WORKDIR /app
COPY skills/hosted-artifacts/scripts/artifacts.mjs skills/hosted-artifacts/scripts/artifacts.mjs
ENV ARTIFACTS_DIR=/data HOST=0.0.0.0 PORT=8080
USER node
EXPOSE 8080
CMD ["node", "skills/hosted-artifacts/scripts/artifacts.mjs", "serve"]
