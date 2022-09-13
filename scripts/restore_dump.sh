dir="$1"

docker cp $dir prescrisur_db:/dump/
docker exec -i prescrisur_db /usr/bin/mongorestore --port 27017 --authenticationDatabase admin --db  Prescrisur /dump/$dir
