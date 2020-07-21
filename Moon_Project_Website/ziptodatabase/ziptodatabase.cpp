#include<vector>
#include<string>
#include<cstdio>
#include <mysql-cppconn/mysql/jdbc.h>
#include <sstream>
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
	cData.parse_csv("zip_code_database.csv",",","\"",true,false);
	sql::mysql::MySQL_Driver *pDriver = nullptr;
	sql::Connection *pConnection = nullptr;
	sql::Statement *pStmt = nullptr;
	sql::PreparedStatement * pPrepStmt = nullptr;
	sql::ResultSet *pResult = nullptr;
	std::map<std::string,int> mTimeZoneID;
	int iUS_Country_ID = -1;
	
	pDriver = sql::mysql::get_mysql_driver_instance();
	if (pDriver != nullptr)
	{
		pConnection = pDriver->connect(sServer, sUser, sPassword);
		if (pConnection != nullptr)
		{
			pStmt = pConnection->createStatement();
			if (pStmt != nullptr)
			{
				pResult = pStmt->executeQuery("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'locations' AND TABLE_SCHEMA = '" + sDatabase + "'");
				pStmt->execute("USE " + sDatabase);
				if (pResult != nullptr && pResult->next())
				{
					if (!bDont_Drop)
					{
						if (pResult->getString(1) == "locations")
						{
							printf("dropping table\n");
							pStmt->execute("DROP TABLE locations");
						}
					}
					delete pResult;
  				}
				printf("retrieving time zone information\n");
				pResult = pStmt->executeQuery("SELECT id, name FROM timezones");
				if (pResult != nullptr)
				{
					while (pResult->next())
					{
						int iID = pResult->getInt(1);
						std::string sZoneName = pResult->getString(2);
						mTimeZoneID[sZoneName] = iID;
					}
					printf("US central time id is %i\n",mTimeZoneID["America/Chicago"]);
					printf("US eastern time id is %i\n",mTimeZoneID["America/New_York"]);
					printf("IDLW id is %i\n",mTimeZoneID["Pacific/Pago_Pago"]);
					delete pResult;
  				}
				printf("retrieving country information\n");
				pResult = pStmt->executeQuery("SELECT id FROM countries WHERE ISO3166_3 = \"USA\"");
				if (pResult != nullptr && pResult->next())
				{
					iUS_Country_ID = pResult->getInt(1);
					printf("US country id is %i\n",iUS_Country_ID);
					delete pResult;
  				}
				if (!bDont_Create)
				{
					printf("creating table\n");
					pStmt->execute("CREATE TABLE locations (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name TEXT, city TEXT NOT NULL, state_province TEXT, postcode TEXT, countryID INT UNSIGNED NOT NULL , latitude FLOAT NOT NULL, longitude FLOAT NOT NULL, timezoneID INT UNSIGNED NOT NULL, FOREIGN KEY (countryID) REFERENCES countries(id), FOREIGN KEY (timezoneID) REFERENCES timezones(id))");
				}				
				std::ostringstream sStEds;
				sStEds << "INSERT INTO locations(name, city, state_province, countryID, postcode, latitude, longitude, timezoneID) VALUES (\"St. Edward's University\", \"Austin\", \"TX\", ";
				sStEds << iUS_Country_ID;
				sStEds << ", \"78704\", 30.2264, -97.7553,";
				sStEds << mTimeZoneID["America/Chicago"];
				sStEds << ")";
				printf("interting St. Eds: %s\n",sStEds.str().c_str());
				pStmt->execute(sStEds.str());
				delete pStmt;
			}
			pPrepStmt = pConnection->prepareStatement("INSERT INTO locations(postcode, city, state_province, countryID, latitude, longitude, timezoneID) VALUES (?, ?, ?, ?, ?, ?, ?)");
			if (pPrepStmt != nullptr)
			{
				//size_t nRow = 1;
				for(size_t nRow = 1; nRow < cData._vData.size(); nRow++)
				{
					if (!cData._vData[nRow][8].empty())
					{
						printf("Clearing %i...",nRow);
						fflush(stdout);
						pPrepStmt->clearParameters();
						printf("Preparing %i...",nRow);
						fflush(stdout);
						std::string sCode = cData._vData[nRow][0];
						while (sCode.size() < 5)
						{
							sCode.insert(0,1,'0');
						}
						setString(pPrepStmt,1,sCode);
						setString(pPrepStmt,2,cData._vData[nRow][3]);
						setString(pPrepStmt,3,cData._vData[nRow][6]);
						pPrepStmt->setInt(4,iUS_Country_ID); // country ID code for US
						setFloat(pPrepStmt,5,cData._vData[nRow][12]);
						setFloat(pPrepStmt,6,cData._vData[nRow][13]);
						if (mTimeZoneID.count(cData._vData[nRow][8]) == 1)
							pPrepStmt->setInt(7,mTimeZoneID.at(cData._vData[nRow][8]));
						else
							printf("Unable to find timezone '%s'\n",cData._vData[nRow][8].c_str());
	//						pPrepStmt->setNull(7,sql::DataType::INTEGER);
						printf("executing %i...",nRow);
						fflush(stdout);
						pPrepStmt->execute();
						printf("done\n");
					}
					else
						printf("Skipped %s\n",cData._vData[nRow][0].c_str());
				}			
				delete pPrepStmt;
			}
			delete pConnection;
		}
		//delete driver;
	}
			
		
	return 0;
}
