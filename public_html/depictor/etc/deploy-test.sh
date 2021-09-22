#!/bin/bash
cd ../
npm run dist
rsync -avz --exclude node_modules --exclude vendor --del * tools:depictor-test/
ssh tools <<'ENDSSH'
cp -r depictor-test/* /data/project/hay/public_html/depictor-test/
ENDSSH

say -v Fred "Depictor deploy complete"