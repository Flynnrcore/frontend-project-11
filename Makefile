develop:
		npx webpack serve

install:
		npm ci

run build:
		NODE_ENV=production npx webpack

lint:
		npx eslint