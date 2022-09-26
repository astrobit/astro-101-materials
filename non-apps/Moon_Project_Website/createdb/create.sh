DBSERVER='tcp://127.0.0.1:3306'
DBUSER='moonproject'
DBPASS='7c3J0r*nO0M#0rD$s@P'
DBDB='moon_project'
#mysql --user=root --password < create_database.sql
cd ../sqlremote
make
cd ../createdb
../sqlremote/sqlremote -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB -f drop_tables.sql
../sqlremote/sqlremote -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB -f create_tables.sql
cd ../timezonedatabase/myparse
make
./parse  -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB --dont_drop --dont_create
cd ../../countrydatabase
make
./ctry2db -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB --dont_drop --dont_create
cd ../ziptodatabase
make
./z2db -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB --dont_drop --dont_create
cd ../createdb
../sqlremote/sqlremote -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB -f populate_permissions.sql
../sqlremote/sqlremote -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB -f populate_angle_units.sql
../sqlremote/sqlremote -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB -f populate_class_roles.sql
#../sqlremote/sqlremote -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB -f populate_users.sql

