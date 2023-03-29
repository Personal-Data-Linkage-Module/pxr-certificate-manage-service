# Copyright 2022 NEC Corporation
# Released under the MIT license.
# https://opensource.org/licenses/mit-license.php
#
FROM node:12

WORKDIR /usr/src/app

# Install node modules
COPY package*.json ./
RUN npm install

# Build production
COPY . ./
RUN npm run build

# Node.js application port binding.
EXPOSE 3013

# Setup cron.
RUN mkdir ssl
RUN apt update
RUN apt install -y cron jq postgresql-client
RUN update-rc.d cron defaults
RUN { echo ""; } | crontab -
RUN { crontab -l; echo "*/5 * * * * bash /usr/src/app/create-certificate.bash"; } | crontab -

# Start a container with this line.
RUN chmod +x /usr/src/app/starting.sh
CMD [ "/usr/src/app/starting.sh" ]
