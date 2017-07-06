FROM node:8
MAINTAINER  Yourtion Guo <yourtion@gmail.com>

EXPOSE 3000
WORKDIR /Voting
CMD ["node", "server.js"]

COPY . /Voting

RUN npm install && \
	  npm run init_gulp && \
    rm -rf node_modules && \
	  npm install --production && \
	  rm -rf LICENSE README.md ScreenShot.jpg bower.json bower_components data_sample/newedenfaces.bson gulpfile.js install_env.sh
