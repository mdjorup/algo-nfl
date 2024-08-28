FROM node:22-alpine as base
ARG SETUP_ENVINROMENT=production


# Dependencies 
FROM base AS deps
RUN apk add --no-cache libc6-compat git

# Setup pnpm environment
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"


# Corepack lets you use Yarn, npm, and pnpm without having to install them
RUN corepack enable
RUN corepack prepare pnpm@latest --activate

# Install dependencies

WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prefer-frozen-lockfile



# Builder
FROM base AS builder


RUN corepack enable
RUN corepack prepare pnpm@latest --activate

WORKDIR /app

COPY .env.$SETUP_ENVINROMENT .env

# copy the dependencies installed in the deps build stage above 
COPY --from=deps /app/node_modules ./node_modules
# copy the code here to generate the build 
COPY . .
# builds the app from the package.json build script
RUN pnpm build


FROM base AS runner
# Set NODE_ENV to production
ENV NODE_ENV $SETUP_ENVINROMENT
# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED 1



RUN addgroup nodejs
RUN adduser -SDH nextjs
RUN mkdir .next
RUN chown nextjs:nodejs .next


COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public


USER nextjs

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# Run the nextjs app
CMD ["node", "server.js"]
