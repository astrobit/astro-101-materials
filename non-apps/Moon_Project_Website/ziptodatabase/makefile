all: z2db

z2db: ziptodatabase.cpp
	g++ -std=c++11 -I. -I../../../../Dev/libcsvpp/include -I../sqlCommon -DBIG_JOINS=1 -fno-strict-aliasing -DUNIV_LINUX ../sqlCommon/sqlCommon.cpp ../../../../Dev/libcsvpp/src/csvpp.cpp ziptodatabase.cpp -L/usr/lib64/mysql -lmysqlcppconn -lboost_program_options -o z2db
#	g++ -std=c++11 -DBIG_JOINS=1 -fno-strict-aliasing -DUNIV_LINUX ziptodatabase.cpp -L/usr/lib64/mysql -lmysqlcppconn8-static -lmysqlclient -lssl -lcrypto -lpthread -lresolv -o z2db

