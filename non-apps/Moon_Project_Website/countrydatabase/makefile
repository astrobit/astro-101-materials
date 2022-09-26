all: ctry2db

ctry2db: cntrytodb.cpp
	g++ -std=c++11 -I. -I../../../../Dev/libcsvpp/include -I../sqlCommon -DBIG_JOINS=1 -fno-strict-aliasing -DUNIV_LINUX ../sqlCommon/sqlCommon.cpp ../../../../Dev/libcsvpp/src/csvpp.cpp cntrytodb.cpp -L/usr/lib64/mysql -lmysqlcppconn -lboost_program_options -o ctry2db

