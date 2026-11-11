root_prod := "/data/project/hay/"
root_test := "/data/project/hay-test/"
rsync_opts := "--verbose --delay-updates -F --compress --archive --no-owner --no-group --exclude-from=./etc/rsync-exclude.txt --rsh='/usr/bin/ssh -S none -o StrictHostKeyChecking=no -o UserKnownHostsFile=/dev/null' --chmod=Dug=rwx,Dg+s,Do=rx,Fug=rw,Fo=r"

_default:
    @just --list

_deploy account source target *flags:
    just git-stamp
    rsync {{rsync_opts}} {{flags}} --rsync-path='sudo -u {{account}} rsync' {{source}} toolforge:{{target}}

# Build a single project
build-project project:
    npm install --prefix ./public_html/{{project}}
    npm run --prefix ./public_html/{{project}} dist

# Deploy all code to production
deploy-all-prod: (_deploy "tools.hay" "./*" root_prod)

# Deploy all code to test
deploy-all-test: (_deploy "tools.hay-test" "./*" root_test)

# Deploy a single project to production
deploy-project-prod project: (build-project project) (_deploy "tools.hay" "./public_html/" + project + "/" root_prod + "public_html/" + project "--del")

# Deploy a single project to test
deploy-project-test project: (build-project project) (_deploy "tools.hay-test" "./public_html/" + project + "/" root_test + "public_html/" + project "--del")

# Add a Git hash to a version.txt
git-stamp:
    git rev-parse HEAD > ./public_html/version.txt

# Run with Docker
run-docker:
    docker-compose up