DBSERVER='tcp://127.0.0.1:3306'
DBUSER='moonproject'
DBPASS='7c3J0r*nO0M#0rD$s@P'
DBDB='moon_project'

../sqlremote/sqlremote -s $DBSERVER -u $DBUSER -p $DBPASS -d $DBDB -f populate_users.sql
