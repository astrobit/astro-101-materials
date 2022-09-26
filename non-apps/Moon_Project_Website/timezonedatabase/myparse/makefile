all: parse

parse: parsedata.cpp
	g++ -std=c++11 -I. -I../../sqlCommon -DBIG_JOINS=1 -fno-strict-aliasing -DUNIV_LINUX ../../sqlCommon/sqlCommon.cpp parsedata.cpp -L/usr/lib64/mysql -lmysqlcppconn -lboost_program_options -o parse

