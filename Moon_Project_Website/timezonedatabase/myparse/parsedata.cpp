#include<vector>
#include<string>
#include<cstdio>
#include <mysql-cppconn/mysql/jdbc.h>
#include <sqlCommon.h>
#include<boost/program_options.hpp>

class rule
{
public:
	std::string _sName;
	std::string _sFrom;
	std::string	_sTo;
	std::string _sType;
	std::string _sMonth;
	std::string _sOn;
	std::string _sAt;
	std::string _sSave;
	std::string	_sLetterCode;

	rule(const std::string &i_sRule)
	{
		auto iterI = i_sRule.cbegin();
		iterI+=4; // bypass "Rule"
		while (iterI != i_sRule.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sRule.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sName.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sRule.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sRule.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sFrom.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sRule.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sRule.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sTo.push_back(*iterI);
			iterI++;
		}

		while (iterI != i_sRule.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sRule.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sType.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sRule.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sRule.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sMonth.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sRule.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sRule.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sOn.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sRule.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sRule.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sAt.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sRule.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sRule.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sSave.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sRule.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sRule.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sLetterCode.push_back(*iterI);
			iterI++;
		}
	}
};

class tzlink
{
public:
	std::string _sCore_Name;
	std::string _sLink_Name;
	tzlink(void)
	{
	}
	tzlink(const std::string &i_sLink)
	{
		auto iterI = i_sLink.cbegin();
		iterI+=5; // bypass "Link"
		while (iterI != i_sLink.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sLink.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sCore_Name.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sLink.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sLink.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sLink_Name.push_back(*iterI);
			iterI++;
		}
	}
};

class zonedata
{
public:
	std::string _sStd_Offset;
	std::string _sRule;
	std::string _sFormat;
	std::string _sUntil;
	char		_chUntil_Ref;
};

class zone
{
public:
	std::string _sName;
	std::vector<zonedata> _vData;
	
	zone(void)
	{
	}
	zone(const std::string &i_sZone)
	{
		zonedata cData;
		auto iterI = i_sZone.cbegin();
		bool bComment = false;
		iterI+=4; // bypass "Zone\t"
//		printf("name\n");
		while (iterI != i_sZone.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sZone.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			_sName.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sZone.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sZone.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			cData._sStd_Offset.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sZone.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sZone.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			cData._sRule.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sZone.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sZone.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			cData._sFormat.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sZone.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sZone.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			cData._sUntil.push_back(*iterI);
			iterI++;
		}
		cData._chUntil_Ref = 0;
		// there are a few special cases in the tz files can't be processed as a normal date/time. handle these here manually
		if (cData._sUntil == "1992 Sep lastSun  2:00s")
		{
			cData._sUntil = "1992 Sep 27  2:00";
			cData._chUntil_Ref = 's';
		}
		else if (cData._sUntil == "2005 Mar lastSun  2:00")
		{
			cData._sUntil = "2005 Mar 27  2:00";
		}
		else if (cData._sUntil == "1989 Mar lastSun  2:00s")
		{
			cData._sUntil = "1989 Mar 26  2:00";
			cData._chUntil_Ref = 's';
		}
		else if (cData._sUntil == "1989 Sep lastSun  2:00s")
		{
			cData._sUntil = "1989 Sep 24  2:00";
			cData._chUntil_Ref = 's';
		}
		else if (cData._sUntil == "1997 Mar lastSun  1:00u")
		{
			cData._sUntil = "1997 Mar 30  1:00";
			cData._chUntil_Ref = 'u';
		}
		else if (cData._sUntil == "1997 Mar lastSun  2:00s")
		{
			cData._sUntil = "1997 Mar 30  2:00";
			cData._chUntil_Ref = 's';
		}
		else if (cData._sUntil == "1960 Apr lastSun  2:00")
		{
			cData._sUntil = "1960 Apr 24  2:00";
		}
		else if (cData._sUntil == "1946 Apr lastSun  2:00")
		{
			cData._sUntil = "1946 Apr 28  2:00";
		}
		else if (cData._sUntil == "1972 Apr lastSun  2:00")
		{
			cData._sUntil = "1972 Apr 30  2:00";
		}
		else if (cData._sUntil == "1995 Apr Sun>=1  2:00")
		{
			cData._sUntil = "1995 Apr 2  2:00";
		}
		else if (cData._sUntil == "1979 Apr lastSun  2:00")
		{
			cData._sUntil = "1979 Apr 29  2:00";
		}
		else if (cData._sUntil == "1998 Apr Sun>=1  3:00")
		{
			cData._sUntil = "1998 Apr 5  3:00";
		}
		else if (cData._sUntil == "2015 Nov Sun>=1 2:00")
		{
			cData._sUntil = "2015 Nov 1  2:00";
		}
	
		_vData.push_back(cData);
	}
	void parseContinuation(const std::string &i_sZone)
	{
		zonedata cData;
		auto iterI = i_sZone.cbegin();
		while (iterI != i_sZone.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sZone.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			cData._sStd_Offset.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sZone.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sZone.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			cData._sRule.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sZone.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sZone.cend() && *iterI != '\t' && *iterI != ' ' && *iterI != '#')
		{
			cData._sFormat.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sZone.cend() && (*iterI == '\t' || *iterI == ' '))
			iterI++;
		while (iterI != i_sZone.cend() && *iterI != '#')
		{
			cData._sUntil.push_back(*iterI);
			iterI++;
		}
		cData._chUntil_Ref = 0;
		// there are a few special cases in the tz files can't be processed as a normal date/time. handle these here manually
		if (cData._sUntil == "1992 Sep lastSun  2:00s")
		{
			cData._sUntil = "1992 Sep 27  2:00";
			cData._chUntil_Ref = 's';
		}
		else if (cData._sUntil == "2005 Mar lastSun  2:00")
		{
			cData._sUntil = "2005 Mar 27  2:00";
		}
		else if (cData._sUntil == "1989 Mar lastSun  2:00s")
		{
			cData._sUntil = "1989 Mar 26  2:00";
			cData._chUntil_Ref = 's';
		}
		else if (cData._sUntil == "1989 Sep lastSun  2:00s")
		{
			cData._sUntil = "1989 Sep 24  2:00";
			cData._chUntil_Ref = 's';
		}
		else if (cData._sUntil == "1997 Mar lastSun  1:00u")
		{
			cData._sUntil = "1997 Mar 30  1:00";
			cData._chUntil_Ref = 'u';
		}
		else if (cData._sUntil == "1997 Mar lastSun  2:00s")
		{
			cData._sUntil = "1997 Mar 30  2:00";
			cData._chUntil_Ref = 's';
		}
		else if (cData._sUntil == "1960 Apr lastSun  2:00")
		{
			cData._sUntil = "1960 Apr 24  2:00";
		}
		else if (cData._sUntil == "1946 Apr lastSun  2:00")
		{
			cData._sUntil = "1946 Apr 28  2:00";
		}
		else if (cData._sUntil == "1972 Apr lastSun  2:00")
		{
			cData._sUntil = "1972 Apr 30  2:00";
		}
		else if (cData._sUntil == "1995 Apr Sun>=1  2:00")
		{
			cData._sUntil = "1995 Apr 2  2:00";
		}
		else if (cData._sUntil == "1979 Apr lastSun  2:00")
		{
			cData._sUntil = "1979 Apr 29  2:00";
		}
		else if (cData._sUntil == "1998 Apr Sun>=1  3:00")
		{
			cData._sUntil = "1998 Apr 5  3:00";
		}
		else if (cData._sUntil == "2015 Nov Sun>=1 2:00")
		{
			cData._sUntil = "2015 Nov 1  2:00";
		}
		
		
		_vData.push_back(cData);
	}
};

class data
{
public:
	std::vector<zone> _vZones;
	std::vector<rule> _vRules;
	std::vector<tzlink> _vLinks;
	void parsefile(FILE * i_fileIn)
	{
		if (i_fileIn != nullptr)
		{
			char chCurr = fgetc(i_fileIn);
			char chLast = 0xa;
			bool bIs_Comment = chCurr == '#';
			bool bIs_EOL = chCurr == 0xa || chCurr == 0xd;
			bool bLast_Is_EOL = chLast == 0xa || chLast == 0xd;
			std::vector<std::string> vLine;
			std::string sLineCurr;
			bool bLastIsZone = false;
			while (chCurr != EOF)
			{
				if (!bIs_Comment && !bIs_EOL)
				{
					sLineCurr.push_back(chCurr);
				}
				else if (!bIs_Comment) // end of line for zone, rule, or link
				{
					if (!sLineCurr.empty())
					{
						if (sLineCurr.substr(0,4) == "Link")
						{
//							printf("processing link %s\n",sLineCurr.c_str());
							_vLinks.push_back(tzlink(sLineCurr));
							bLastIsZone = false;
						}
						else if (sLineCurr.substr(0,4) == "Rule")
						{
//							printf("processing rule %s\n",sLineCurr.c_str());
							_vRules.push_back(rule(sLineCurr));
							bLastIsZone = false;
						}
						else if (sLineCurr.substr(0,4) == "Zone")
						{
//							printf("processing zone %s\n",sLineCurr.c_str());
							_vZones.push_back(zone(sLineCurr));
							bLastIsZone = true;
						}
						else if (bLastIsZone) // continuation line
						{
//							printf("processing zone continuation %s\n",sLineCurr.c_str());
							_vZones.back().parseContinuation(sLineCurr);
						}
						sLineCurr.clear();
					}
				}
				
				chLast = chCurr;
				chCurr = fgetc(i_fileIn);
				bLast_Is_EOL = chLast == 0xa || chLast == 0xd;
				if (bLast_Is_EOL)
					bIs_Comment = chCurr == '#';
				bIs_EOL = chCurr == 0xa || chCurr == 0xd;
			}
		}
	}
};



void createDatabaseRuleSet(sql::Connection * i_pConnection, const std::string & i_sDatabase, const data & i_cData, bool i_bDont_Drop, bool i_bDont_Create)
{
	sql::Statement *pStmt = nullptr;
	sql::PreparedStatement * pPrepStmt = nullptr;
	sql::ResultSet *pResult = nullptr;
	std::map<std::string, int> mRulesets;
	pStmt = i_pConnection->createStatement();
	if (pStmt != nullptr)
	{
		if (!i_bDont_Drop)
		{
		
			pResult = pStmt->executeQuery("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'timezone_details' AND TABLE_SCHEMA = '" + i_sDatabase + "'");
			if (pResult != nullptr && pResult->next())
			{
				if (pResult->getString(1) == "timezone_details")
				{
					printf("dropping table timezone_details\n");
					pStmt->execute("DROP TABLE " + i_sDatabase + ".timezone_details");
				}
				delete pResult;
			}

			pResult = pStmt->executeQuery("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'timezones' AND TABLE_SCHEMA = '" + i_sDatabase + "'");
			if (pResult != nullptr && pResult->next())
			{
				if (pResult->getString(1) == "timezones")
				{
					printf("dropping table timezones\n");
					pStmt->execute("DROP TABLE " + i_sDatabase + ".timezones");
				}
				delete pResult;
			}
			pResult = pStmt->executeQuery("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'dst_rules' AND TABLE_SCHEMA = '" + i_sDatabase + "'");
			if (pResult != nullptr && pResult->next())
			{
				if (pResult->getString(1) == "dst_rules")
				{
					printf("dropping table dst_rules\n");
					pStmt->execute("DROP TABLE " + i_sDatabase + ".dst_rules");
				}
				delete pResult;
			}
			pResult = pStmt->executeQuery("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_NAME = 'dst_rule_set' AND TABLE_SCHEMA = '" + i_sDatabase + "'");
			if (pResult != nullptr && pResult->next())
			{
				if (pResult->getString(1) == "dst_rule_set")
				{
					printf("dropping table dst_rule_set\n");
					pStmt->execute("DROP TABLE " + i_sDatabase + ".dst_rule_set");
				}
				delete pResult;
			}
		}
		pStmt->execute("USE " + i_sDatabase);
		if (!i_bDont_Create)
		{
			printf("creating table\n");
			pStmt->execute("CREATE TABLE dst_rule_set (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80) UNIQUE NOT NULL);");
		}
		delete pStmt;
	}
	
	pPrepStmt = i_pConnection->prepareStatement("INSERT INTO dst_rule_set(name) VALUES (?)");
	if (pPrepStmt != nullptr)
	{
		for(auto iterI = i_cData._vRules.cbegin(); iterI != i_cData._vRules.cend(); iterI++)
		{
			if (mRulesets.count(iterI->_sName) == 0)
			{
				printf("Clearing %s... ",iterI->_sName.c_str());
				fflush(stdout);
				pPrepStmt->clearParameters();
				printf("Preparing ... ");
				fflush(stdout);
				setString(pPrepStmt,1,iterI->_sName);
				mRulesets[iterI->_sName] = 1;
				printf("Executing ... ");
				fflush(stdout);
				pPrepStmt->execute();
				printf("Done\n");
			}
		}
		delete pPrepStmt;
	}
}


void createDatabaseRules(sql::Connection * i_pConnection, const std::string & i_sDatabase, const data & i_cData, bool i_bDont_Drop, bool i_bDont_Create)
{
	sql::Statement *pStmt = nullptr;
	sql::PreparedStatement * pPrepStmt = nullptr;
	sql::PreparedStatement * pPrepStmtFindSet = nullptr;
	sql::ResultSet *pResult = nullptr;

	pStmt = i_pConnection->createStatement();
	if (pStmt != nullptr)
	{
		pStmt->execute("USE " + i_sDatabase);
		if (!i_bDont_Create)
		{
			printf("creating table\n");
			pStmt->execute("CREATE TABLE dst_rules (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, rulesetID INT UNSIGNED, fromDate DATE NOT NULL, toDate DATE, month INT, onDescr TEXT NOT NULL, atTime TIME NOT NULL, atReference VARCHAR(1), saveTime TIME, letterCode TEXT, FOREIGN KEY (rulesetID) REFERENCES dst_rule_set(id))");
		}
		delete pStmt;
	}
			

	pPrepStmtFindSet = i_pConnection->prepareStatement("SELECT id FROM dst_rule_set WHERE name = ?");
	pPrepStmt = i_pConnection->prepareStatement("INSERT INTO dst_rules(rulesetID, fromDate, toDate, month, onDescr, atTime, atReference, saveTime, letterCode) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
	if (pPrepStmt != nullptr)
	{
		for(auto iterI = i_cData._vRules.cbegin(); iterI != i_cData._vRules.cend(); iterI++)
		{
			printf(" %s %s %s %s %s %s %s Clearing... ",iterI->_sName.c_str(),iterI->_sFrom.c_str(),iterI->_sTo.c_str(),iterI->_sMonth.c_str(),iterI->_sOn.c_str(),iterI->_sAt.c_str(), iterI->_sSave.c_str());
			fflush(stdout);
			pPrepStmt->clearParameters();
			pPrepStmtFindSet->clearParameters();

			printf("Finding Ruleset id ... ");
			fflush(stdout);
			pPrepStmtFindSet->setString(1,iterI->_sName);
			pResult = pPrepStmtFindSet->executeQuery();
			int iRuleSetID = -1;
			if (pResult != nullptr && pResult->next())
			{
				iRuleSetID = pResult->getInt(1);
			}
			else
				printf("Could not find ruleset ID\n");
			if (pResult != nullptr)
				delete pResult;
			if (iRuleSetID != -1)
			{
//			printf("Set Ruleset id ... ");
//			fflush(stdout);
				setInt(pPrepStmt,1,iRuleSetID);
//			printf("Set From ... ");
//			fflush(stdout);
				setDate(pPrepStmt,2,1,1,std::stoi(iterI->_sFrom));
//			printf("Set To ... ");
//			fflush(stdout);
				if (!iterI->_sTo.empty())
				{
					if (iterI->_sTo == "max")
						pPrepStmt->setNull(3,sql::DataType::DATE);
					else if (iterI->_sTo == "only")
					{
						setDate(pPrepStmt,3,31,12,std::stoi(iterI->_sFrom));
						//printf("only 12-31-%s\n",iterI->_sFrom.c_str());
					}
					else
					{
						//printf("to 12-31-%s\n",iterI->_sTo.c_str());
						setDate(pPrepStmt,3,31,12,std::stoi(iterI->_sTo));
					}
				}
				else
					pPrepStmt->setNull(3,sql::DataType::DATE);
					
//			printf("Set Month ... ");
//			fflush(stdout);
				int iMonth = interpretMonthEn(iterI->_sMonth);
				if (iMonth == 0)
					pPrepStmt->setNull(4,sql::DataType::INTEGER);
				else
					pPrepStmt->setInt(4,iMonth);
//			printf("Set On ... ");
//			fflush(stdout);
				setString(pPrepStmt,5,iterI->_sOn);
//			printf("Process At %s ... ",iterI->_sAt.c_str());
//			fflush(stdout);
				char chAtReference = 0;
				std::string sAt = iterI->_sAt;
				if (sAt.size() > 1 && sAt.back() >= 'a' && sAt.back() <= 'z')
				{
					chAtReference = sAt.back();
					sAt.pop_back();
				}
				
//			printf("Set At ... ");
//			fflush(stdout);
				setTime(pPrepStmt,6,sAt);
//			printf("Set At Reference ... ");
//			fflush(stdout);
				setChar(pPrepStmt,7,chAtReference);
				
//			printf("Set Save ... ");
//			fflush(stdout);
				if (iterI->_sSave == "0")
					setTime(pPrepStmt,8,0,0,0);
				else if (iterI->_sSave == "1")
					setTime(pPrepStmt,8,1,0,0);
				else			
					setTime(pPrepStmt,8,iterI->_sSave);
//			printf("Set Letter Code ... ");
//			fflush(stdout);
				setString(pPrepStmt,9,iterI->_sLetterCode);
				printf("Executing ... ");
				fflush(stdout);
				pPrepStmt->execute();
				printf("Done.\n");
			}
		}
		delete pPrepStmt;
	}
}

class currentZoneData
{
public:
	int _nDST_Rule_ID;
	int _nZone_ID;
};

class timezone_location
{
public:
	float _fLatitude;
	float _fLongitude;
	timezone_location(void)
	{
		_fLatitude = -91;
		_fLongitude = -361;
	}
	timezone_location(float i_Latitude, float i_fLongitude)
	{
		_fLatitude = i_Latitude;
		_fLongitude = i_fLongitude;
	}
};
std::map<std::string, timezone_location> g_mTZ_Locations = {
{"Africa/Algiers", timezone_location(36.75,3.06)},
{"Atlantic/Cape_Verde", timezone_location(16.54,-23.04)},
{"Africa/Ndjamena", timezone_location(12.13,15.06)},
{"Africa/Abidjan", timezone_location(5.36,-4.01)},
{"Africa/Cairo", timezone_location(30.04,31.24)},
{"Africa/Accra", timezone_location(5.6,-0.19)},
{"Africa/Bissau", timezone_location(11.86,-15.58)},
{"Africa/Nairobi", timezone_location(1.29,36.82)},
{"Africa/Monrovia", timezone_location(6.32,-10.81)},
{"Africa/Tripoli", timezone_location(32.89,13.19)},
{"Indian/Mauritius", timezone_location(-20.35,57.55)},
{"Africa/Casablanca", timezone_location(33.57,-7.59)},
{"Africa/El_Aaiun", timezone_location(27.15,-13.2)},
{"Africa/Maputo", timezone_location(-25.97,32.57)},
{"Africa/Windhoek", timezone_location(-22.56,17.07)},
{"Africa/Lagos", timezone_location(6.52,3.38)},
{"Indian/Reunion", timezone_location(-21.12,55.54)},
{"Africa/Sao_Tome", timezone_location(0.19,6.61)},
{"Indian/Mahe", timezone_location(11.7,75.54)},
{"Africa/Johannesburg", timezone_location(-26.2,28.05)},
{"Africa/Khartoum", timezone_location(15.5,32.56)},
{"Africa/Juba", timezone_location(4.86,31.57)},
{"Africa/Tunis", timezone_location(33.89,9.54)},
{"Antarctica/Casey", timezone_location(-66.28,110.53)},
{"Antarctica/Davis", timezone_location(-68.58,77.97)},
{"Antarctica/Mawson", timezone_location(-67.6,62.87)},
{"Indian/Kerguelen", timezone_location(-49.39,69.35)},
{"Antarctica/DumontDUrville", timezone_location(-66.66,140)},
{"Antarctica/Syowa", timezone_location(-69,39.58)},
{"Antarctica/Troll", timezone_location(-72,2.53)},
{"Antarctica/Vostok", timezone_location(-78.46,106.83)},
{"Antarctica/Rothera", timezone_location(-67.56,-68.12)},
{"Asia/Kabul", timezone_location(34.56,69.21)},
{"Asia/Yerevan", timezone_location(40.19,44.52)},
{"Asia/Baku", timezone_location(40.41,49.87)},
{"Asia/Dhaka", timezone_location(23.81,90.41)},
{"Asia/Thimphu", timezone_location(27.47,89.63)},
{"Indian/Chagos", timezone_location(-6.34,71.88)},
{"Asia/Brunei", timezone_location(4.53,114.73)},
{"Asia/Yangon", timezone_location(16.84,96.17)},
{"Asia/Shanghai", timezone_location(31.23,121.47)},
{"Asia/Urumqi", timezone_location(43.83,87.62)},
{"Asia/Hong_Kong", timezone_location(22.32,114.17)},
{"Asia/Taipei", timezone_location(25.03,121.57)},
{"Asia/Macau", timezone_location(22.2,113.54)},
{"Asia/Nicosia", timezone_location(35.19,33.38)},
{"Asia/Famagusta", timezone_location(35.11,33.92)},
{"Asia/Tbilisi", timezone_location(41.72,44.83)},
{"Asia/Dili", timezone_location(-8.56,125.56)},
{"Asia/Kolkata", timezone_location(22.57,88.36)},
{"Asia/Jakarta", timezone_location(-6.21,106.85)},
{"Asia/Pontianak", timezone_location(-0.03,109.34)},
{"Asia/Makassar", timezone_location(-5.15,119.43)},
{"Asia/Jayapura", timezone_location(-2.59,140.67)},
{"Asia/Tehran", timezone_location(35.69,51.59)},
{"Asia/Baghdad", timezone_location(33.32,44.37)},
{"Asia/Jerusalem", timezone_location(31.77,35.21)},
{"Asia/Tokyo", timezone_location(35.68,139.65)},
{"Asia/Amman", timezone_location(31.95,35.91)},
{"Asia/Almaty", timezone_location(43.22,76.85)},
{"Asia/Qyzylorda", timezone_location(44.85,65.48)},
{"Asia/Qostanay", timezone_location(53.22,63.64)},
{"Asia/Aqtobe", timezone_location(50.28,57.17)},
{"Asia/Aqtau", timezone_location(43.66,51.2)},
{"Asia/Atyrau", timezone_location(47.09,51.92)},
{"Asia/Oral", timezone_location(51.23,51.39)},
{"Asia/Bishkek", timezone_location(42.87,74.57)},
{"Asia/Seoul", timezone_location(37.57,126.98)},
{"Asia/Pyongyang", timezone_location(39.04,125.76)},
{"Asia/Beirut", timezone_location(33.89,35.5)},
{"Asia/Kuala_Lumpur", timezone_location(3.14,101.69)},
{"Asia/Kuching", timezone_location(1.55,110.36)},
{"Indian/Maldives", timezone_location(3.2,73.22)},
{"Asia/Hovd", timezone_location(47.98,91.63)},
{"Asia/Ulaanbaatar", timezone_location(47.89,106.91)},
{"Asia/Choibalsan", timezone_location(48.1,114.54)},
{"Asia/Kathmandu", timezone_location(27.72,85.32)},
{"Asia/Karachi", timezone_location(24.86,67)},
{"Asia/Gaza", timezone_location(31.35,34.31)},
{"Asia/Hebron", timezone_location(31.53,35.1)},
{"Asia/Manila", timezone_location(14.6,120.98)},
{"Asia/Qatar", timezone_location(25.35,51.18)},
{"Asia/Riyadh", timezone_location(24.71,46.68)},
{"Asia/Singapore", timezone_location(1.35,103.82)},
{"Asia/Colombo", timezone_location(6.93,79.86)},
{"Asia/Damascus", timezone_location(33.51,36.28)},
{"Asia/Dushanbe", timezone_location(38.56,68.79)},
{"Asia/Bangkok", timezone_location(13.76,100.5)},
{"Asia/Ashgabat", timezone_location(37.96,58.33)},
{"Asia/Dubai", timezone_location(25.2,55.27)},
{"Asia/Samarkand", timezone_location(39.63,66.98)},
{"Asia/Tashkent", timezone_location(41.3,69.24)},
{"Asia/Ho_Chi_Minh", timezone_location(10.82,106.63)},
{"Australia/Darwin", timezone_location(-12.46,130.85)},
{"Australia/Perth", timezone_location(-31.95,115.86)},
{"Australia/Eucla", timezone_location(-31.68,128.89)},
{"Australia/Brisbane", timezone_location(-27.47,153.03)},
{"Australia/Lindeman", timezone_location(-20.44,149.04)},
{"Australia/Adelaide", timezone_location(-34.93,138.6)},
{"Australia/Hobart", timezone_location(-42.88,147.33)},
{"Australia/Currie", timezone_location(-39.93,143.85)},
{"Australia/Melbourne", timezone_location(-37.82,144.96)},
{"Australia/Sydney", timezone_location(-33.87,151.21)},
{"Australia/Broken_Hill", timezone_location(-31.95,141.45)},
{"Australia/Lord_Howe", timezone_location(-31.56,159.08)},
{"Antarctica/Macquarie", timezone_location(-54.35,159.02)},
{"Indian/Christmas", timezone_location(-10.45,105.69)},
{"Indian/Cocos", timezone_location(-12.16,96.87)},
{"Pacific/Fiji", timezone_location(-17.74,178.07)},
{"Pacific/Gambier", timezone_location(-23.34,-134.47)},
{"Pacific/Marquesas", timezone_location(-9.45,-139.39)},
{"Pacific/Tahiti", timezone_location(-17.65,-149.42)},
{"Pacific/Guam", timezone_location(13.45,144.79)},
{"Pacific/Tarawa", timezone_location(1.45,172.97)},
{"Pacific/Enderbury", timezone_location(-3.13,-171.08)},
{"Pacific/Kiritimati", timezone_location(1.87,-157.43)},
{"Pacific/Majuro", timezone_location(7.09,171.38)},
{"Pacific/Kwajalein", timezone_location(8.72,167.73)},
{"Pacific/Chuuk", timezone_location(7.42,151.78)},
{"Pacific/Pohnpei", timezone_location(6.91,158.23)},
{"Pacific/Kosrae", timezone_location(5.32,162.98)},
{"Pacific/Nauru", timezone_location(-0.53,166.93)},
{"Pacific/Noumea", timezone_location(-21.21,165.85)},
{"Pacific/Auckland", timezone_location(-36.85,174.76)},
{"Pacific/Chatham", timezone_location(-44.02,-175.93)},
{"Pacific/Rarotonga", timezone_location(-21.23,-159.78)},
{"Pacific/Niue", timezone_location(-19.07,-169.85)},
{"Pacific/Norfolk", timezone_location(-29.04,167.95)},
{"Pacific/Palau", timezone_location(7.52,134.58)},
{"Pacific/Port_Moresby", timezone_location(-9.44,147.18)},
{"Pacific/Bougainville", timezone_location(-6.38,155.38)},
{"Pacific/Pitcairn", timezone_location(-24.38,-128.32)},
{"Pacific/Pago_Pago", timezone_location(-14.28,-170.7)},
{"Pacific/Apia", timezone_location(-13.83,-171.77)},
{"Pacific/Guadalcanal", timezone_location(-9.58,160.15)},
{"Pacific/Fakaofo", timezone_location(-9.38,-171.22)},
{"Pacific/Tongatapu", timezone_location(-21.15,-175.25)},
{"Pacific/Funafuti", timezone_location(-8.52,179.2)},
{"Pacific/Wake", timezone_location(19.28,166.65)},
{"Pacific/Efate", timezone_location(-17.66,168.43)},
{"Pacific/Wallis", timezone_location(-13.3,-176.21)},
{"Europe/London", timezone_location(51.51,-0.13)},
{"Europe/Dublin", timezone_location(53.35,-6.26)},
{"Europe/Tirane", timezone_location(41.33,19.82)},
{"Europe/Andorra", timezone_location(42.51,1.52)},
{"Europe/Vienna", timezone_location(48.21,16.37)},
{"Europe/Minsk", timezone_location(53.9,27.56)},
{"Europe/Brussels", timezone_location(50.85,4.35)},
{"Europe/Sofia", timezone_location(42.7,23.32)},
{"Europe/Prague", timezone_location(50.08,14.44)},
{"Europe/Copenhagen", timezone_location(55.68,12.57)},
{"Atlantic/Faroe", timezone_location(61.89,-6.91)},
{"America/Danmarkshavn", timezone_location(76.77,-18.67)},
{"America/Scoresbysund", timezone_location(70.49,-21.96)},
{"America/Nuuk", timezone_location(64.18,-51.69)},
{"America/Thule", timezone_location(77.47,-69.23)},
{"Europe/Tallinn", timezone_location(59.44,24.75)},
{"Europe/Helsinki", timezone_location(60.17,24.94)},
{"Europe/Paris", timezone_location(48.86,2.35)},
{"Europe/Berlin", timezone_location(52.52,13.41)},
{"Europe/Gibraltar", timezone_location(36.14,-5.35)},
{"Europe/Athens", timezone_location(37.98,23.73)},
{"Europe/Budapest", timezone_location(47.5,19.04)},
{"Atlantic/Reykjavik", timezone_location(64.15,-21.94)},
{"Europe/Rome", timezone_location(41.9,12.5)},
{"Europe/Riga", timezone_location(56.95,24.11)},
{"Europe/Vilnius", timezone_location(54.69,25.28)},
{"Europe/Luxembourg", timezone_location(49.61,6.13)},
{"Europe/Malta", timezone_location(35.94,14.38)},
{"Europe/Chisinau", timezone_location(47.01,28.86)},
{"Europe/Monaco", timezone_location(43.74,7.42)},
{"Europe/Amsterdam", timezone_location(52.37,4.89)},
{"Europe/Oslo", timezone_location(59.91,10.75)},
{"Europe/Warsaw", timezone_location(52.23,21.01)},
{"Europe/Lisbon", timezone_location(38.72,-9.14)},
{"Atlantic/Azores", timezone_location(37.74,-25.68)},
{"Atlantic/Madeira", timezone_location(32.76,-16.96)},
{"Europe/Bucharest", timezone_location(44.43,26.1)},
{"Europe/Kaliningrad", timezone_location(54.71,20.45)},
{"Europe/Moscow", timezone_location(55.76,37.62)},
{"Europe/Simferopol", timezone_location(44.95,34.1)},
{"Europe/Astrakhan", timezone_location(46.36,48.06)},
{"Europe/Volgograd", timezone_location(48.71,44.51)},
{"Europe/Saratov", timezone_location(51.55,46.02)},
{"Europe/Kirov", timezone_location(58.6,49.67)},
{"Europe/Samara", timezone_location(53.2,50.16)},
{"Europe/Ulyanovsk", timezone_location(54.32,48.4)},
{"Asia/Yekaterinburg", timezone_location(56.84,60.65)},
{"Asia/Omsk", timezone_location(54.99,73.36)},
{"Asia/Barnaul", timezone_location(53.35,83.78)},
{"Asia/Novosibirsk", timezone_location(54.98,82.9)},
{"Asia/Tomsk", timezone_location(56.49,84.95)},
{"Asia/Novokuznetsk", timezone_location(53.76,87.12)},
{"Asia/Krasnoyarsk", timezone_location(56.02,92.89)},
{"Asia/Irkutsk", timezone_location(52.29,104.29)},
{"Asia/Chita", timezone_location(52.05,113.47)},
{"Asia/Yakutsk", timezone_location(62.04,129.74)},
{"Asia/Vladivostok", timezone_location(43.13,131.91)},
{"Asia/Khandyga", timezone_location(62.66,135.55)},
{"Asia/Sakhalin", timezone_location(50.69,142.95)},
{"Asia/Magadan", timezone_location(59.56,150.81)},
{"Asia/Srednekolymsk", timezone_location(67.43,153.73)},
{"Asia/Ust-Nera", timezone_location(64.56,143.22)},
{"Asia/Kamchatka", timezone_location(56.13,159.53)},
{"Asia/Anadyr", timezone_location(64.73,177.5)},
{"Europe/Belgrade", timezone_location(44.79,20.45)},
{"Europe/Madrid", timezone_location(40.42,-3.7)},
{"Africa/Ceuta", timezone_location(35.89,-5.32)},
{"Atlantic/Canary", timezone_location(28.29,-16.63)},
{"Europe/Stockholm", timezone_location(59.33,18.07)},
{"Europe/Zurich", timezone_location(47.38,8.54)},
{"Europe/Istanbul", timezone_location(41.01,28.98)},
{"Europe/Kiev", timezone_location(50.45,30.52)},
{"Europe/Uzhgorod", timezone_location(48.62,22.29)},
{"Europe/Zaporozhye", timezone_location(47.84,35.14)},
{"America/New_York", timezone_location(40.71,-74.01)},
{"America/Chicago", timezone_location(41.88,-87.63)},
{"America/North_Dakota/Center", timezone_location(47,-101)},
{"America/North_Dakota/New_Salem", timezone_location(46.85,-101.41)},
{"America/North_Dakota/Beulah", timezone_location(47.26,-101.78)},
{"America/Denver", timezone_location(39.74,-104.99)},
{"America/Los_Angeles", timezone_location(34.05,-118.24)},
{"America/Juneau", timezone_location(58.3,-134.42)},
{"America/Sitka", timezone_location(57.05,-135.33)},
{"America/Metlakatla", timezone_location(55.13,-131.57)},
{"America/Yakutat", timezone_location(59.55,-139.73)},
{"America/Anchorage", timezone_location(61.22,-149.9)},
{"America/Nome", timezone_location(64.5,-165.41)},
{"America/Adak", timezone_location(51.88,-176.66)},
{"Pacific/Honolulu", timezone_location(21.31,-157.86)},
{"America/Phoenix", timezone_location(33.45,-112.07)},
{"America/Boise", timezone_location(43.62,-116.2)},
{"America/Indiana/Indianapolis", timezone_location(39.77,-86.16)},
{"America/Indiana/Marengo", timezone_location(38.37,-86.34)},
{"America/Indiana/Vincennes", timezone_location(38.68,-87.53)},
{"America/Indiana/Tell_City", timezone_location(40.27,-86.13)},
{"America/Indiana/Petersburg", timezone_location(38.49,-87.28)},
{"America/Indiana/Knox", timezone_location(41.3,-86.63)},
{"America/Indiana/Winamac", timezone_location(41.05,-86.6)},
{"America/Indiana/Vevay", timezone_location(38.75,-85.07)},
{"America/Kentucky/Louisville", timezone_location(38.25,-85.76)},
{"America/Kentucky/Monticello", timezone_location(36.83,-84.85)},
{"America/Detroit", timezone_location(42.33,-83.05)},
{"America/Menominee", timezone_location(45.11,-87.61)},
{"America/St_Johns", timezone_location(47.65,-52.71)},
{"America/Goose_Bay", timezone_location(53.3,-60.33)},
{"America/Halifax", timezone_location(44.65,-63.58)},
{"America/Glace_Bay", timezone_location(46.2,-59.96)},
{"America/Moncton", timezone_location(46.09,-64.78)},
{"America/Blanc-Sablon", timezone_location(51.43,-57.13)},
{"America/Toronto", timezone_location(43.65,-79.38)},
{"America/Thunder_Bay", timezone_location(48.38,-89.25)},
{"America/Nipigon", timezone_location(49.02,-88.27)},
{"America/Rainy_River", timezone_location(48.27,-94.57)},
{"America/Atikokan", timezone_location(48.76,-91.62)},
{"America/Winnipeg", timezone_location(49.9,-97.14)},
{"America/Regina", timezone_location(50.45,-104.62)},
{"America/Swift_Current", timezone_location(50.29,-107.8)},
{"America/Edmonton", timezone_location(53.55,-113.49)},
{"America/Vancouver", timezone_location(49.28,-123.12)},
{"America/Dawson_Creek", timezone_location(55.76,-120.24)},
{"America/Fort_Nelson", timezone_location(58.81,-122.7)},
{"America/Creston", timezone_location(49.1,-116.51)},
{"America/Pangnirtung", timezone_location(66.15,-65.7)},
{"America/Iqaluit", timezone_location(63.75,-68.52)},
{"America/Resolute", timezone_location(74.7,-94.83)},
{"America/Rankin_Inlet", timezone_location(62.81,-92.09)},
{"America/Cambridge_Bay", timezone_location(69.12,-105.06)},
{"America/Yellowknife", timezone_location(62.45,-114.37)},
{"America/Inuvik", timezone_location(68.36,-133.72)},
{"America/Whitehorse", timezone_location(60.72,-135.06)},
{"America/Dawson", timezone_location(64.06,-139.43)},
{"America/Cancun", timezone_location(21.16,-86.85)},
{"America/Merida", timezone_location(20.97,-89.59)},
{"America/Matamoros", timezone_location(25.87,-97.5)},
{"America/Monterrey", timezone_location(25.69,-100.32)},
{"America/Mexico_City", timezone_location(19.43,-99.13)},
{"America/Ojinaga", timezone_location(29.55,-104.41)},
{"America/Chihuahua", timezone_location(28.63,-106.07)},
{"America/Hermosillo", timezone_location(29.07,-110.96)},
{"America/Mazatlan", timezone_location(23.25,-106.41)},
{"America/Bahia_Banderas", timezone_location(20.81,-105.25)},
{"America/Tijuana", timezone_location(32.52,-117.04)},
{"America/Nassau", timezone_location(25.04,-77.35)},
{"America/Barbados", timezone_location(13.19,-59.54)},
{"America/Belize", timezone_location(17.19,88.5)},
{"Atlantic/Bermuda", timezone_location(32.31,-64.75)},
{"America/Costa_Rica", timezone_location(9.75,-83.75)},
{"America/Havana", timezone_location(23.11,-82.37)},
{"America/Santo_Domingo", timezone_location(18.49,-69.93)},
{"America/El_Salvador", timezone_location(13.79,-88.9)},
{"America/Guatemala", timezone_location(15.78,-90.23)},
{"America/Port-au-Prince", timezone_location(18.59,-72.31)},
{"America/Tegucigalpa", timezone_location(14.07,-87.17)},
{"America/Jamaica", timezone_location(18.11,-77.3)},
{"America/Martinique", timezone_location(14.64,-61.02)},
{"America/Managua", timezone_location(12.12,-86.24)},
{"America/Panama", timezone_location(8.54,-80.78)},
{"America/Puerto_Rico", timezone_location(18.22,-66.59)},
{"America/Miquelon", timezone_location(46.89,-56.32)},
{"America/Grand_Turk", timezone_location(21.47,-71.14)},
{"America/Argentina/Buenos_Aires", timezone_location(-34.6,-58.38)},
{"America/Argentina/Cordoba", timezone_location(-31.42,-64.19)},
{"America/Argentina/Salta", timezone_location(-24.78,-65.42)},
{"America/Argentina/Tucuman", timezone_location(-26.81,-65.22)},
{"America/Argentina/La_Rioja", timezone_location(-29.41,-66.86)},
{"America/Argentina/San_Juan", timezone_location(-31.54,-68.54)},
{"America/Argentina/Jujuy", timezone_location(-24.19,-65.3)},
{"America/Argentina/Catamarca", timezone_location(-28.47,-65.78)},
{"America/Argentina/Mendoza", timezone_location(-32.89,-68.85)},
{"America/Argentina/San_Luis", timezone_location(-33.3,-66.34)},
{"America/Argentina/Rio_Gallegos", timezone_location(-51.62,-69.22)},
{"America/Argentina/Ushuaia", timezone_location(-54.8,-68.3)},
{"America/La_Paz", timezone_location(-16.49,-68.12)},
{"America/Noronha", timezone_location(-3.85,-32.42)},
{"America/Belem", timezone_location(-1.46,-48.49)},
{"America/Santarem", timezone_location(-39.28,-8.7)},
{"America/Fortaleza", timezone_location(-3.73,-38.53)},
{"America/Recife", timezone_location(-8.05,-34.93)},
{"America/Araguaina", timezone_location(-7.19,-48.2)},
{"America/Maceio", timezone_location(-9.65,-35.71)},
{"America/Bahia", timezone_location(-12.58,-41.7)},
{"America/Sao_Paulo", timezone_location(-23.55,-46.63)},
{"America/Campo_Grande", timezone_location(-20.47,-54.62)},
{"America/Cuiaba", timezone_location(-15.6,-56.1)},
{"America/Porto_Velho", timezone_location(-8.76,-63.9)},
{"America/Boa_Vista", timezone_location(-16.1,-22.81)},
{"America/Manaus", timezone_location(-3.12,-60.02)},
{"America/Eirunepe", timezone_location(-6.66,-69.87)},
{"America/Rio_Branco", timezone_location(-9.98,-68.43)},
{"America/Santiago", timezone_location(-33.45,-70.67)},
{"America/Punta_Arenas", timezone_location(-53.16,-70.92)},
{"Pacific/Easter", timezone_location(-27.11,-109.35)},
{"Antarctica/Palmer", timezone_location(-64.77,-64.05)},
{"America/Bogota", timezone_location(4.7,-74.07)},
{"America/Curacao", timezone_location(12.17,-68.99)},
{"America/Guayaquil", timezone_location(-2.19,-79.89)},
{"Pacific/Galapagos", timezone_location(-0.95,-90.97)},
{"Atlantic/Stanley", timezone_location(-51.7,-57.85)},
{"America/Cayenne", timezone_location(4.92,-52.31)},
{"America/Guyana", timezone_location(4.86,-58.93)},
{"America/Asuncion", timezone_location(-25.26,-57.58)},
{"America/Lima", timezone_location(-12.05,-77.04)},
{"Atlantic/South_Georgia", timezone_location(-54.43,-36.59)},
{"America/Paramaribo", timezone_location(5.85,-55.2)},
{"America/Port_of_Spain", timezone_location(10.66,-61.51)},
{"America/Montevideo", timezone_location(34.9,-56.16)},
{"America/Caracas", timezone_location(10.48,-66.9)},

{"Africa/Bamako", timezone_location(12.64,-8)},
{"Africa/Banjul", timezone_location(13.45,-16.58)},
{"Africa/Conakry", timezone_location(9.64,-13.58)},
{"Africa/Dakar", timezone_location(14.72,-17.47)},
{"Africa/Freetown", timezone_location(8.46,-13.23)},
{"Africa/Lome", timezone_location(6.13,1.23)},
{"Africa/Nouakchott", timezone_location(18.07,-15.96)},
{"Africa/Ouagadougou", timezone_location(12.37,-1.52)},
{"Atlantic/St_Helena", timezone_location(-15.97,-5.71)},
{"Africa/Addis_Ababa", timezone_location(8.98,38.76)},
{"Africa/Asmara", timezone_location(15.32,38.93)},
{"Africa/Dar_es_Salaam", timezone_location(-6.79,39.21)},
{"Africa/Djibouti", timezone_location(11.83,42.59)},
{"Africa/Kampala", timezone_location(0.35,32.58)},
{"Africa/Mogadishu", timezone_location(2.05,45.32)},
{"Indian/Antananarivo", timezone_location(-18.88,47.51)},
{"Indian/Comoro", timezone_location(-11.65,43.33)},
{"Indian/Mayotte", timezone_location(-12.83,45.17)},
{"Africa/Blantyre", timezone_location(-15.77,35.02)},
{"Africa/Bujumbura", timezone_location(-3.36,29.36)},
{"Africa/Gaborone", timezone_location(-24.63,25.92)},
{"Africa/Harare", timezone_location(-17.83,31.03)},
{"Africa/Kigali", timezone_location(-1.94,30.06)},
{"Africa/Lubumbashi", timezone_location(-11.69,27.5)},
{"Africa/Lusaka", timezone_location(-15.39,28.32)},
{"Africa/Bangui", timezone_location(4.39,15.56)},
{"Africa/Brazzaville", timezone_location(-4.26,15.24)},
{"Africa/Douala", timezone_location(4.05,9.77)},
{"Africa/Kinshasa", timezone_location(-4.44,15.27)},
{"Africa/Libreville", timezone_location(0.42,9.47)},
{"Africa/Luanda", timezone_location(-8.81,13.23)},
{"Africa/Malabo", timezone_location(3.76,8.78)},
{"Africa/Niamey", timezone_location(13.51,2.13)},
{"Africa/Porto-Novo", timezone_location(6.5,2.63)},
{"Africa/Maseru", timezone_location(-29.32,27.49)},
{"Africa/Mbabane", timezone_location(-26.31,31.14)},
{"Europe/Nicosia", timezone_location(35.19,33.38)},
{"Asia/Bahrain", timezone_location(26.07,50.56)},
{"Asia/Aden", timezone_location(12.79,45.02)},
{"Asia/Kuwait", timezone_location(29.31,47.48)},
{"Asia/Phnom_Penh", timezone_location(11.56,104.93)},
{"Asia/Vientiane", timezone_location(17.98,102.63)},
{"Asia/Muscat", timezone_location(23.59,58.38)},
{"Pacific/Saipan", timezone_location(15.19,145.75)},
{"Antarctica/McMurdo", timezone_location(-77.85,166.67)},
{"Pacific/Midway", timezone_location(28.21,-177.37)},
{"Europe/Jersey", timezone_location(49.21,-2.13)},
{"Europe/Guernsey", timezone_location(49.44,-2.59)},
{"Europe/Isle_of_Man", timezone_location(54.24,-4.55)},
{"Europe/Mariehamn", timezone_location(60.1,19.93)},
{"Europe/Busingen", timezone_location(47.7,8.69)},
{"Europe/Vatican", timezone_location(41.9,12.45)},
{"Europe/San_Marino", timezone_location(43.94,12.46)},
{"Europe/Vaduz", timezone_location(47.14,9.52)},
{"Arctic/Longyearbyen", timezone_location(78.22,15.63)},
{"Europe/Ljubljana", timezone_location(46.06,14.51)},
{"Europe/Podgorica", timezone_location(42.43,19.26)},
{"Europe/Sarajevo", timezone_location(43.86,18.41)},
{"Europe/Skopje", timezone_location(42,21.43)},
{"Europe/Zagreb", timezone_location(45.82,15.98)},
{"Europe/Bratislava", timezone_location(48.15,17.11)},
{"Asia/Istanbul", timezone_location(41,29.98)},
{"America/Cayman", timezone_location(19.31,-81.25)},
{"America/Aruba", timezone_location(12.52,-69.97)},
{"America/Lower_Princes", timezone_location(18.05,-63.05)},
{"America/Kralendijk", timezone_location(12.14,-68.27)},
{"America/Anguilla", timezone_location(18.22,-63.07)},
{"America/Antigua", timezone_location(17.07,-61.82)},
{"America/Dominica", timezone_location(15.42,-61.37)},
{"America/Grenada", timezone_location(12.12,-61.68)},
{"America/Guadeloupe", timezone_location(16.27,-61.55)},
{"America/Marigot", timezone_location(18.07,-63.08)},
{"America/Montserrat", timezone_location(16.74,-62.19)},
{"America/St_Barthelemy", timezone_location(17.9,-62.83)},
{"America/St_Kitts", timezone_location(17.36,-62.78)},
{"America/St_Lucia", timezone_location(13.91,-60.98)},
{"America/St_Thomas", timezone_location(18.34,-64.89)},
{"America/St_Vincent", timezone_location(12.98,-61.29)},
{"America/Tortola", timezone_location(18.43,-64.63)}

};



void createDatabaseTimezones(sql::Connection * i_pConnection, const std::string & i_sDatabase, const data & i_cData, bool i_bDont_Drop, bool i_bDont_Create)
{
	sql::Statement *pStmt = nullptr;
	sql::PreparedStatement * pPrepStmt = nullptr, *pPrepStmtFindTZ = nullptr;
	sql::ResultSet *pResult = nullptr;
	pStmt = i_pConnection->createStatement();
	if (pStmt != nullptr)
	{
		pStmt->execute("USE " + i_sDatabase);
		if (!i_bDont_Create)
		{
			printf("creating table\n");
			pStmt->execute("CREATE TABLE timezones (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, name VARCHAR(128) NOT NULL UNIQUE, linkTo INT UNSIGNED, latitude REAL, longitude REAL, FOREIGN KEY (linkTo) REFERENCES timezones(id))");
		}
		delete pStmt;
	}
	FILE * fileTZ = fopen("timezones.csv","wt");
	pPrepStmt = i_pConnection->prepareStatement("INSERT INTO timezones(name,latitude,longitude) VALUES (?, ?, ?)");
	if (pPrepStmt != nullptr)
	{
		for(auto iterI = i_cData._vZones.cbegin(); iterI != i_cData._vZones.cend(); iterI++)
		{
			printf("%s Clearing ...",iterI->_sName.c_str());
			fflush(stdout);
			pPrepStmt->clearParameters();
			printf("Preparing ...");
			fflush(stdout);
			setString(pPrepStmt,1,iterI->_sName);
			if (g_mTZ_Locations.count(iterI->_sName) == 1)
			{
				pPrepStmt->setDouble(2,g_mTZ_Locations.at(iterI->_sName)._fLatitude);
				pPrepStmt->setDouble(3,g_mTZ_Locations.at(iterI->_sName)._fLongitude);
			}
			else
			{
				pPrepStmt->setNull(2,sql::DataType::REAL);
				pPrepStmt->setNull(3,sql::DataType::REAL);
			}
			printf("Executing ... ");
			fflush(stdout);
			pPrepStmt->execute();
			printf("Done.\n");
			if (fileTZ != nullptr)
				fprintf(fileTZ,"%s\n",iterI->_sName.c_str());
		}
		delete pPrepStmt;
	}
	if (fileTZ != nullptr)
		fclose(fileTZ);
	// process links
	FILE * fileLinks = fopen("links.csv","wt");
	pPrepStmt = i_pConnection->prepareStatement("INSERT INTO timezones(name,latitude,longitude, linkTo) VALUES (?, ?, ?, ?)");
	pPrepStmtFindTZ = i_pConnection->prepareStatement("SELECT id FROM timezones WHERE name = ?");
	if (pPrepStmt != nullptr && pPrepStmtFindTZ != nullptr)
	{
		for(auto iterI = i_cData._vLinks.cbegin(); iterI != i_cData._vLinks.cend(); iterI++)
		{
			printf("%s Clearing ...",iterI->_sLink_Name.c_str());
			fflush(stdout);
			pPrepStmt->clearParameters();
			printf("Preparing ...");
			fflush(stdout);
			pPrepStmtFindTZ->setString(1, iterI->_sCore_Name);
			pResult = pPrepStmtFindTZ->executeQuery();
			int nTZID = -1;
			if (pResult != nullptr && pResult->next())
			{
				nTZID = pResult->getInt(1);
			}
			else
				printf("Could not find timezone ID\n");
			if (pResult != nullptr)
				delete pResult;
			if (nTZID != -1)
			{
				setString(pPrepStmt,1,iterI->_sLink_Name);
				if (g_mTZ_Locations.count(iterI->_sLink_Name) == 1)
				{
					pPrepStmt->setDouble(2,g_mTZ_Locations.at(iterI->_sLink_Name)._fLatitude);
					pPrepStmt->setDouble(3,g_mTZ_Locations.at(iterI->_sLink_Name)._fLongitude);
				}
				else
				{
					pPrepStmt->setNull(2,sql::DataType::REAL);
					pPrepStmt->setNull(3,sql::DataType::REAL);
				}
				pPrepStmt->setInt(4,nTZID);
				printf("Executing ... ");
				fflush(stdout);
				pPrepStmt->execute();
				printf("Done.\n");
				if (fileTZ != nullptr)
					fprintf(fileLinks,"%s\n",iterI->_sLink_Name.c_str());
			}
		}
		delete pPrepStmt;
		delete pPrepStmtFindTZ;
	}
	if (fileLinks != nullptr)
		fclose(fileLinks);
}

void createDatabaseTimezoneDetails(sql::Connection * i_pConnection, const std::string & i_sDatabase, const data & i_cData, bool i_bDont_Drop, bool i_bDont_Create)
{
	sql::Statement *pStmt = nullptr;
	sql::PreparedStatement * pPrepStmt = nullptr, *pPrepStmtFindSet = nullptr, *pPrepStmtFindTZ = nullptr;
	sql::ResultSet *pResult = nullptr;
	pStmt = i_pConnection->createStatement();
	if (pStmt != nullptr)
	{
		pStmt->execute("USE " + i_sDatabase);
		if (!i_bDont_Create)
		{
			printf("creating table\n");
			pStmt->execute("CREATE TABLE timezone_details (id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, tzID INT UNSIGNED NOT NULL, offset INT NOT NULL, DSTruleID INT UNSIGNED, format TEXT, until DATETIME,  untilRef VARCHAR(1), FOREIGN KEY (DSTruleID) REFERENCES dst_rule_set(id), FOREIGN KEY (tzID) REFERENCES timezones(id))");
		}
		delete pStmt;
	}
	
	
	pPrepStmt = i_pConnection->prepareStatement("INSERT INTO timezone_details(tzID, offset, DSTruleID, format, until, untilRef) VALUES (?, ?, ?, ?, ?, ?)");
	pPrepStmtFindSet = i_pConnection->prepareStatement("SELECT id FROM dst_rule_set WHERE name = ?");
	pPrepStmtFindTZ = i_pConnection->prepareStatement("SELECT id FROM timezones WHERE name = ?");
	if (pPrepStmt != nullptr)
	{
		for(auto iterI = i_cData._vZones.cbegin(); iterI != i_cData._vZones.cend(); iterI++)
		{
			int nTZID = -1;
			printf("Finding Timezone id ... ");
			fflush(stdout);
			pPrepStmtFindTZ->setString(1, iterI->_sName);
			pResult = pPrepStmtFindTZ->executeQuery();
			if (pResult != nullptr && pResult->next())
			{
				nTZID = pResult->getInt(1);
			}
			else
				printf("Could not find timezone ID\n");
			if (pResult != nullptr)
				delete pResult;
			if (nTZID != -1)
			{
				for (auto iterJ = iterI->_vData.cbegin(); iterJ != iterI->_vData.cend(); iterJ++)
				{
					if (iterJ->_sUntil.empty())
						printf("%s current Clearing ...",iterI->_sName.c_str());
					else
						printf("%s until %s Clearing ...",iterI->_sName.c_str(), iterJ->_sUntil.c_str());
					fflush(stdout);
					pPrepStmt->clearParameters();

					int iRuleSetID = -2;
					if (iterJ->_sRule != "-")
					{
						iRuleSetID = -1;
						printf("Finding Ruleset id ... ");
						fflush(stdout);
						pPrepStmtFindSet->setString(1,iterJ->_sRule);
						pResult = pPrepStmtFindSet->executeQuery();
						if (pResult != nullptr && pResult->next())
						{
							iRuleSetID = pResult->getInt(1);
						}
						else
							printf("Could not find ruleset ID\n");
						if (pResult != nullptr)
							delete pResult;
					}
					if (iRuleSetID != -1)
					{
						printf("Preparing ...");
						fflush(stdout);
						setInt(pPrepStmt,1,nTZID);
						setInt(pPrepStmt,2,iterJ->_sStd_Offset);
						if (iRuleSetID != -2)
							pPrepStmt->setInt(3,iRuleSetID);
						else
							pPrepStmt->setNull(3,sql::DataType::INTEGER);
						setString(pPrepStmt,4,iterJ->_sFormat);
						if (iterJ->_sUntil.empty())
							pPrepStmt->setNull(5,sql::DataType::VARCHAR);
						else
							setDateTime(pPrepStmt,5,iterJ->_sUntil);
						setChar(pPrepStmt,6,iterJ->_chUntil_Ref);
						printf("Executing ... ");
						fflush(stdout);
						pPrepStmt->execute();
						printf("Done.\n");
					}
				}
			}
		}
		delete pPrepStmt;
		delete pPrepStmtFindSet;
		delete pPrepStmtFindTZ;
	}
}

void createDatabases(const data & i_cData, const std::string &i_sServer, const std::string & i_sUser, const std::string & i_sPassword, const std::string & i_sDatabase, bool i_bDont_Drop, bool i_bDont_Create)
{
	sql::mysql::MySQL_Driver *pDriver = nullptr;
	sql::Connection *pConnection = nullptr;
	pDriver = sql::mysql::get_mysql_driver_instance();
	if (pDriver != nullptr)
	{
		pConnection = pDriver->connect(i_sServer, i_sUser, i_sPassword);
		if (pConnection != nullptr)
		{
			createDatabaseRuleSet(pConnection, i_sDatabase, i_cData, i_bDont_Drop, i_bDont_Create);
			createDatabaseRules(pConnection, i_sDatabase, i_cData, i_bDont_Drop, i_bDont_Create);
			
			createDatabaseTimezones(pConnection, i_sDatabase, i_cData, i_bDont_Drop, i_bDont_Create);
			createDatabaseTimezoneDetails(pConnection, i_sDatabase, i_cData, i_bDont_Drop, i_bDont_Create);
			delete pConnection;
		}
	}
}
int main(int i_nParam_Count, char ** i_pParams)
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

		command_line_parser cCL_Parser{i_nParam_Count, i_pParams};
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

	data cData;
	std::vector<std::string> vFiles({"africa","antarctica","asia", "australasia", "europe", "northamerica", "pacificnew", "southamerica"});
	for (auto iterI = vFiles.cbegin(); iterI != vFiles.cend(); iterI++)
	{
		FILE * fileCurr = fopen(iterI->c_str(),"rt");
		if (fileCurr)
		{
			printf("processing %s\n",iterI->c_str());
			cData.parsefile(fileCurr);
			fclose(fileCurr);
		}
	}
	for (auto iterI = cData._vZones.cbegin(); iterI != cData._vZones.cend(); iterI++)
	{
		for (auto iterJ = iterI->_vData.begin(); iterJ != iterI->_vData.end(); iterJ++)
		{
			if (!iterJ->_sUntil.empty())
			{
				std::string sDT = interpretDateTime(iterJ->_sUntil);
				if (sDT.empty())
					printf("%s %s\n",iterI->_sName.c_str(), iterJ->_sUntil.c_str());
			}
		}
	}
//	dateformat eFormat = parseDateStringFormat("1942 Feb 21");
//	datedata cDate = parseDateString("1942 Feb 21", eFormat);
//	printf("%i %i %i\n",cDate._nYear,cDate._nMonth,cDate._nDay);
//	std::string sDateTime = interpretDateTime("1942 Feb 21 23:00");
//	printf("%s\n",sDateTime.c_str());
	createDatabases(cData, sServer, sUser, sPassword, sDatabase, bDont_Drop, bDont_Create);
	
}
