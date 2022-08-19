docker cp mongo.daily.7/ prescrisur_db:/dump
docker exec -i prescrisur_db /usr/bin/mongorestore --port 27017 --authenticationDatabase admin --db  Prescrisur /dump/mongo.daily.7 
