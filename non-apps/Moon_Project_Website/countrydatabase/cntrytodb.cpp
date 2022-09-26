#include<vector>
#include<string>
#include<cstdio>
#include <mysql-cppconn/mysql/jdbc.h>
#include <sqlCommon.h>
#include <csvpp.hpp>
#include<boost/program_options.hpp>



int main(int i_nParam, const char ** i_pParam)
{
	using namespace boost::program_options;
	std::string sServer;
	std::string sUser;
	std::string sPassword;
	std::string sDatabase;
	bool bDont_Drop = false;
	bool bDont_Create = false;

	try
	{
		options_description cOption_Description{"Options"};
		cOption_Description.add_options()
			("help,h", "this help")
			("server,s", value<std::string>(&sServer)->required(), "server to connect to")
			("user,u", value<std::string>(&sUser)->required(), "user to connect to the server")
			("password,p", value<std::string>(&sPassword)->required(), "password for the user")
			("database,d", value<std::string>(&sDatabase)->required(), "database that will be in use.")
			("dont_drop,D", value<std::string>()->zero_tokens()->implicit_value("f"), "don't drop existing databases.")
			("dont_create,C", value<std::string>()->zero_tokens()->implicit_value("f"), "don't attempt to create databases.")
			;

		command_line_parser cCL_Parser{i_nParam, i_pParam};
		cCL_Parser.options(cOption_Description).allow_unregistered().style(
			command_line_style::default_style |
			command_line_style::allow_slash_for_short);
		parsed_options cParsed_Options = cCL_Parser.run();

		variables_map mCL_Variables;
		store(cParsed_Options, mCL_Variables);
		notify(mCL_Variables);

		bDont_Drop = mCL_Variables.count("dont_drop") > 0;
		bDont_Create = mCL_Variables.count("dont_create") > 0;
	}
	catch (const error &cError)
	{
		std::cerr << cError.what() << '\n';
	}

	csvpp::csv cData;
	cData.parse_csv("country-codes_csv.csv",",","\"",true,false);
	
	sql::mysql::MySQL_Driver *pDriver = nullptr;
	sql::Connection *pConnection = nullptr;
	sql::Statement *pStmt = nullptr;
	sql::PreparedStatement * pPrepStmt = nullptr;
	sql::ResultSet *pResult = nullptr;
	pDriver = sql::mysql::get_mysql_driver_instance();
	if (pDriver != nullptr)
	{
		pConnection = pDriver->connect(sServer, sUser, sPassword);
		if (pConnection != nullptr)
		{
			pStmt = pConnection->createStatement();
			if (pStmt != nullptr)
			{
				pResult = pStmt->executeQuery("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'countries' AND TABLE_SCHEMA = '" + sDatabase + "'");
				pStmt->execute("USE " + sDatabase);
				if (!bDont_Drop)
				{
					if (pResult != nullptr && pResult->next())
					{
						if (pResult->getString(1) == "countries")
						{
							printf("dropping table\n");
							pStmt->execute("DROP TABLE countries");
						}
	  				}
	  			}
	  			if (!bDont_Create)
	  			{
					printf("creating table\n");
					pStmt->execute("CREATE TABLE countries (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, country_ar TEXT, country_cn TEXT, country_en TEXT, country_es TEXT, country_fr TEXT, country_ru TEXT, ISO3166_2 TEXT, ISO3166_3 TEXT, ISO3166_numeric INT, ISO4217_Currency_3 TEXT, ISO4217_Currency_Country_Name TEXT, ISO4217_Currency_Name TEXT, ISO4217_Currency_Numeric INT, CLDR_Name TEXT, languages TEXT, region_code INT, region_name TEXT, subregion_code INT, subregion_name TEXT );");
				}
				delete pResult;
				delete pStmt;
			}



			pPrepStmt = pConnection->prepareStatement("INSERT INTO countries(country_ar, country_cn, country_en, country_es, country_fr, country_ru, ISO3166_2, ISO3166_3, ISO3166_numeric, ISO4217_Currency_3, ISO4217_Currency_Country_Name, ISO4217_Currency_Name, ISO4217_Currency_Numeric, CLDR_Name, languages, region_code, region_name, subregion_code, subregion_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
			if (pPrepStmt != nullptr)
			{
//				size_t nRow = 1;
				for(size_t nRow = 1; nRow < cData._vData.size(); nRow++)
				{
					printf("Clearing %i...",nRow);
					fflush(stdout);
					pPrepStmt->clearParameters();
					printf("Preparing %i...",nRow);
					fflush(stdout);
					setString(pPrepStmt,1,cData._vData[nRow][0]);
					setString(pPrepStmt,2,cData._vData[nRow][1]);
					if (!cData._vData[nRow][2].empty())
						setString(pPrepStmt,3,cData._vData[nRow][2]);
					else
						setString(pPrepStmt,3,cData._vData[nRow][27]);
					setString(pPrepStmt,4,cData._vData[nRow][3]);
					setString(pPrepStmt,5,cData._vData[nRow][4]);
					setString(pPrepStmt,6,cData._vData[nRow][5]);
					setString(pPrepStmt,7,cData._vData[nRow][6]);
					setString(pPrepStmt,8,cData._vData[nRow][7]);
					setInt(pPrepStmt,9,cData._vData[nRow][8]);
					setString(pPrepStmt,10,cData._vData[nRow][9]);
					setString(pPrepStmt,11,cData._vData[nRow][10]);
					setString(pPrepStmt,12,cData._vData[nRow][12]);
					setInt(pPrepStmt,13,cData._vData[nRow][13]);
					setString(pPrepStmt,14,cData._vData[nRow][27]);
					setString(pPrepStmt,15,cData._vData[nRow][45]);
					setInt(pPrepStmt,16,cData._vData[nRow][48]);
					setString(pPrepStmt,17,cData._vData[nRow][49]);
					setInt(pPrepStmt,18,cData._vData[nRow][51]);
					setString(pPrepStmt,19,cData._vData[nRow][52]);

					printf("executing %i...",nRow);
					fflush(stdout);
					pPrepStmt->execute();
					printf("done\n");
				}			
				delete pPrepStmt;
			}
			delete pConnection;
		}
		//delete driver;
	}
	return 0;
}
