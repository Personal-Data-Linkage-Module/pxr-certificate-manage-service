#!/bin/bash
# Copyright 2022 NEC Corporation
# Released under the MIT license.
# https://opensource.org/licenses/mit-license.php

set -eu

cd /usr/src/app/ssl
export $(cat /usr/src/app/config/.env | sed 's/#.*//g' | xargs)

# Take the certificate-chain file
CLIENT_CERT_CHAIN=`curl -X GET "${URL}" -H "accept: application/json" -H "Content-Type: application/json"`;
CONTENT=`echo $CLIENT_CERT_CHAIN | jq -r '.chained_client_cert'`;
echo "$CONTENT" > ./client-ca.crt && echo "" >> ./client-ca.crt && cat ../secret/client-ca.crt >> ./client-ca.crt;

# Get a newest client certificate
SELECT_CLIENT_CERT="SELECT certificate FROM ${DB_SCHEMA}.certificate_manage WHERE cert_type='client' AND is_disabled=false ORDER BY updated_at DESC LIMIT 1;";
CLIENT_CERT=`PGPASSWORD=$DB_PASSWORD psql -t -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME -c "${SELECT_CLIENT_CERT}"`;
CLIENT_CERT=`echo "$CLIENT_CERT" | sed -e 's/+$//g' -e 's/^[ ]//g'`;

# Exit script if empty cerfificate
if [ -z "$CLIENT_CERT" ]
then
    echo "Zero entity of client certificate records, using default certificate."
    exit 0;
fi

# Get a newest server certificate
SELECT_SERVER_CERT="SELECT certificate FROM ${DB_SCHEMA}.certificate_manage WHERE cert_type='server' AND is_disabled=false ORDER BY updated_at DESC LIMIT 1;";
SERVER_CERT=`PGPASSWORD=$DB_PASSWORD psql -t -U $DB_USER -h $DB_HOST -p $DB_PORT $DB_NAME -c "${SELECT_CLIENT_CERT}"`;
SERVER_CERT=`echo "$SERVER_CERT" | sed -e 's/+$//g' -e 's/^[ ]//g'`;

# Exit script if empty cerfificate
if [ -z "$SERVER_CERT" ]
then
    echo "Zero entity of server certificate records, using default certificate."
    exit 0;
fi

# Split private key and public key

echo "$CLIENT_CERT" | sed -e "1,/-----END RSA PRIVATE KEY-----/w client.key
/-----BEGIN CERTIFICATE-----/,\$w client.crt"
echo "$SERVER_CERT" | sed -e "1,/-----END RSA PRIVATE KEY-----/w server.key
/-----BEGIN CERTIFICATE-----/,\$w server.crt"
