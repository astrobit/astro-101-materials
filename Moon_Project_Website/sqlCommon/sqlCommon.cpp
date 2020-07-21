#include<sqlCommon.h>
#include <sstream>
#include <stack>

void setString(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString)
{
	if (!i_sString.empty())
		i_pStmt->setString(i_nParam,i_sString);
	else
		i_pStmt->setNull(i_nParam,sql::DataType::VARCHAR);
}
void setInt(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString)
{
	if (!i_sString.empty())
		i_pStmt->setInt(i_nParam,std::stoi(i_sString));
	else
		i_pStmt->setNull(i_nParam,sql::DataType::INTEGER);
}
void setInt(sql::PreparedStatement * i_pStmt, size_t i_nParam, int i_nValue)
{
	i_pStmt->setInt(i_nParam,i_nValue);
}
void setFloat(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString)
{
	if (!i_sString.empty())
		i_pStmt->setDouble(i_nParam,std::stof(i_sString));
	else
		i_pStmt->setNull(i_nParam,sql::DataType::REAL);
}
void setFloat(sql::PreparedStatement * i_pStmt, size_t i_nParam, const float & i_fData)
{
	i_pStmt->setDouble(i_nParam,i_fData);
}

void setDouble(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString)
{
	if (!i_sString.empty())
		i_pStmt->setDouble(i_nParam,std::stod(i_sString));
	else
		i_pStmt->setNull(i_nParam,sql::DataType::DOUBLE);
}
void setDouble(sql::PreparedStatement * i_pStmt, size_t i_nParam, const double & i_fData)
{
	i_pStmt->setDouble(i_nParam,i_fData);
}


int interpretMonthEn(const std::string & i_sMonth)
{
	static const std::map<std::string, int> mMonths = {
		{std::string("Jan"),1},
		{std::string("Jan."),1},
		{std::string("January"),1},
		{std::string("JAN"),1},
		{std::string("JAN."),1},
		{std::string("JANUARY"),1},
		{std::string("jan"),1},
		{std::string("jan."),1},
		{std::string("january"),1},

		{std::string("Feb"),2},
		{std::string("Feb."),2},
		{std::string("February"),2},
		{std::string("feb"),2},
		{std::string("feb."),2},
		{std::string("february"),2},
		{std::string("FEB"),2},
		{std::string("FEB."),2},
		{std::string("FEBRUARY"),2},

		{std::string("Mar"),3},
		{std::string("Mar."),3},
		{std::string("March"),3},
		{std::string("mar"),3},
		{std::string("mar."),3},
		{std::string("march"),3},
		{std::string("MAR"),3},
		{std::string("MAR."),3},
		{std::string("MARCH"),3},

		{std::string("Apr"),4},
		{std::string("Apr."),4},
		{std::string("April"),4},
		{std::string("apr"),4},
		{std::string("apr."),4},
		{std::string("april"),4},
		{std::string("APR"),4},
		{std::string("APR."),4},
		{std::string("APRIL"),4},

		{std::string("May"),5},
		{std::string("may"),5},
		{std::string("MAY"),5},

		{std::string("Jun"),6},
		{std::string("Jun."),6},
		{std::string("June"),6},
		{std::string("jun"),6},
		{std::string("jun."),6},
		{std::string("june"),6},
		{std::string("JUN"),6},
		{std::string("JUN."),6},
		{std::string("JUNE"),6},

		{std::string("Jul"),7},
		{std::string("Jul."),7},
		{std::string("July"),7},
		{std::string("jul"),7},
		{std::string("jul."),7},
		{std::string("july"),7},
		{std::string("JUL"),7},
		{std::string("JUL."),7},
		{std::string("JULY"),7},

		{std::string("Aug"),8},
		{std::string("Aug."),8},
		{std::string("August"),8},
		{std::string("aug"),8},
		{std::string("aug."),8},
		{std::string("august"),8},
		{std::string("AUG"),8},
		{std::string("AUG."),8},
		{std::string("AUGUST"),8},

		{std::string("Sep"),9},
		{std::string("Sep."),9},
		{std::string("Sept"),9},
		{std::string("Sept."),9},
		{std::string("September"),9},
		{std::string("sep"),9},
		{std::string("sep."),9},
		{std::string("sept"),9},
		{std::string("sept."),9},
		{std::string("september"),9},
		{std::string("SEP"),9},
		{std::string("SEP."),9},
		{std::string("SEPT"),9},
		{std::string("SEPT."),9},
		{std::string("SEPTEMBER"),9},

		{std::string("Oct"),10},
		{std::string("Oct."),10},
		{std::string("October"),10},
		{std::string("oct"),10},
		{std::string("oct."),10},
		{std::string("october"),10},
		{std::string("OCT"),10},
		{std::string("OCT."),10},
		{std::string("OCTOBER"),10},

		{std::string("Nov"),11},
		{std::string("Nov."),11},
		{std::string("November"),11},
		{std::string("nov"),11},
		{std::string("nov."),11},
		{std::string("november"),11},
		{std::string("NOV"),11},
		{std::string("NOV."),11},
		{std::string("NOVEMBER"),11},

		{std::string("Dec"),12},
		{std::string("Dec."),12},
		{std::string("December"),12},
		{std::string("dec"),12},
		{std::string("dec."),12},
		{std::string("december"),12},
		{std::string("DEc"),12},
		{std::string("DEc."),12},
		{std::string("DECEMBER"),12}
	};
	int iRet = 0;
	if (mMonths.count(i_sMonth) == 1)
		iRet = mMonths.at(i_sMonth);
	return iRet;
}

std::string parseDate(int i_nDay, int i_nMonth, int i_nYear)
{
	std::string sRet;
	bool bLeap_Year = (i_nYear % 4 == 0 && (i_nYear % 400 == 0 || i_nYear % 100 != 0));
	if (i_nYear >= 1000 && i_nYear <= 9999 && i_nMonth >= 1 && i_nMonth <= 12 && i_nDay >= 1 && 
			((i_nMonth == 1 && i_nDay <= 31) || (i_nMonth == 2 && bLeap_Year && i_nDay <= 29) || (i_nMonth == 2 && !bLeap_Year && i_nDay <= 28) ||
			(i_nMonth == 3 && i_nDay <= 31) || (i_nMonth == 4 && i_nDay <= 30) || (i_nMonth == 5 && i_nDay <= 31) || (i_nMonth == 6 && i_nDay <= 30) ||
			(i_nMonth == 7 && i_nDay <= 31) || (i_nMonth == 8 && i_nDay <= 31) || (i_nMonth == 9 && i_nDay <= 30) || (i_nMonth == 10 && i_nDay <= 31) ||
			(i_nMonth == 11 && i_nDay <= 30) || (i_nMonth == 12 && i_nDay <= 31)))
	{
		std::ostringstream sDate;
		sDate << i_nYear;
		sDate << "-";
		if (i_nMonth < 10)
			sDate << "0";
		sDate << i_nMonth;
		sDate << "-";
		if (i_nDay < 10)
			sDate << "0";
		sDate << i_nDay;
		sRet = sDate.str();
	}
	else
		printf(" parse date fail %04i-%02i-%02i ",i_nYear,i_nMonth,i_nDay);
	return sRet;
}

std::string parseTime(int i_nHours, int i_nMinutes, int i_nSeconds)
{
	std::string sRet;
	if (i_nHours < 0)
	{
		if (i_nMinutes < 0 && i_nSeconds < 0)
		{
			i_nMinutes *= -1;
			i_nSeconds *= -1;
		}
	}
	if (i_nMinutes >= 0 && i_nMinutes <= 59 && i_nSeconds >= 0 && i_nSeconds <= 59)
	{
		std::ostringstream sTime;
		sTime << i_nHours;
		sTime << ":";
		if (i_nMinutes < 10)
			sTime << "0";
		sTime << i_nMinutes;
		sTime << ":";
		if (i_nSeconds < 10)
			sTime << "0";
		sTime << i_nSeconds;

		sRet = sTime.str();
	}
	return sRet;
}


dateformat parseDateStringFormat(const std::string & i_sValue)
{
	dateformat eRet = dateformat::unspecified;
	std::string sReduced_Value;
	auto iterI = i_sValue.cbegin();
	while (iterI != i_sValue.cend() && (*iterI == ' ' || *iterI == '\t'))
		iterI++;
		
	while (iterI != i_sValue.cend())
	{
		sReduced_Value.push_back(*iterI);
		iterI++;
	}
//	printf("rv: %s %s\n",i_sValue.c_str(), sReduced_Value.c_str());
	
	// get rid of anything at the end that isn't date related. There is no date format that uses YDM or DYM, so the day or year must be at the end
	// assuming the day and year are both numbers (we won't consider any word based numbering, e.g. "Two Thousand Nineteen")
	while (sReduced_Value.size() > 0 && !((sReduced_Value.back() >= '0' && sReduced_Value.back() <= '9') || (sReduced_Value.back() >= 'a' && sReduced_Value.back() <= 'z') || (sReduced_Value.back() >= 'a' && sReduced_Value.back() <= 'Z')))
		sReduced_Value.pop_back();
//	printf("rv: %s\n",sReduced_Value.c_str());
	
	std::string sDataFormat;
	for (auto iterI = sReduced_Value.cbegin(); iterI != sReduced_Value.cend(); iterI++)
	{
		if (*iterI >= '0' && *iterI <= '9')
			sDataFormat.push_back('n');
		else if (*iterI == '-' || *iterI == '.' || *iterI == ' ' || *iterI == '\t' || *iterI == '/' || *iterI == ',')
		{
			if (sDataFormat.size() > 0 && sDataFormat.back() != '-' && sDataFormat.back() != '.' && sDataFormat.back() != ' ' && sDataFormat.back() != '\t' && sDataFormat.back() != '/' && sDataFormat.back() != ',')
				sDataFormat.push_back('-');
		}
		else if (*iterI >= 'A' && *iterI <= 'Z')
			sDataFormat.push_back('l');
		else if (*iterI >= 'a' && *iterI <= 'z')
			sDataFormat.push_back('l');
		else
			sDataFormat.push_back('?');
	}
	
	if (!sDataFormat.empty())
	{
		if (sDataFormat == "nnnn-lll-n" || 
			sDataFormat == "nnnn-llll-n" || 
			sDataFormat == "nnnn-lllll-n" || 
			sDataFormat == "nnnn-llllll-n" || 
			sDataFormat == "nnnn-lllllll-n" || 
			sDataFormat == "nnnn-llllllll-n" || 
			sDataFormat == "nnnn-lllllllll-n" || 
			sDataFormat == "nnnn-lll-nn" ||
			sDataFormat == "nnnn-llll-nn" ||
			sDataFormat == "nnnn-lllll-nn" ||
			sDataFormat == "nnnn-llllll-nn" ||
			sDataFormat == "nnnn-lllllll-nn" ||
			sDataFormat == "nnnn-llllllll-nn" ||
			sDataFormat == "nnnn-lllllllll-nn"
			)
		{ // yyyy-mmm-dd
			eRet = dateformat::yyyy_month_dd;
		}
		else if (sDataFormat == "nnnn-lll" || 
			sDataFormat == "nnnn-llll" || 
			sDataFormat == "nnnn-lllll" || 
			sDataFormat == "nnnn-llllll" || 
			sDataFormat == "nnnn-lllllll" || 
			sDataFormat == "nnnn-llllllll" || 
			sDataFormat == "nnnn-lllllllll"
			)
		{ // yyyy-mmm-dd
			eRet = dateformat::yyyy_month;
		}
		else if (sDataFormat == "nn-lll-n" ||
			sDataFormat == "nn-llll-n" ||
			sDataFormat == "nn-lllll-n" ||
			sDataFormat == "nn-llllll-n" ||
			sDataFormat == "nn-lllllll-n" ||
			sDataFormat == "nn-llllllll-n" ||
			sDataFormat == "nn-lllllllll-n"
			)
		{ // yy-mmm-dd
			eRet = dateformat::yy_month_dd;
		}
		else if (sDataFormat == "nnnn-nn-nn")
		{ // yy-mmm-dd
			eRet = dateformat::yy_mm_dd;
		}
		else if (sDataFormat == "nnnnnnnn")
		{ // ISO 8601
			eRet = dateformat::yyyymmdd;
		}
		else if (sDataFormat == "nnnn")
		{ // ISO 8601
			eRet = dateformat::yyyy;
		}
		else
			printf("df: %s\n",sDataFormat.c_str());
	}
	return eRet;
	
}


datedata parseDateString(const std::string & i_sValue, dateformat i_eFormat)
{
	datedata cRet;
	auto iterI = i_sValue.cbegin();
	std::string sYear;
	std::string sMonth;
	std::string sDay;
	
	switch (i_eFormat)
	{
	case dateformat::yyyy_mm_dd:
	case dateformat::yy_mm_dd:
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sYear.push_back(*iterI);
			iterI++;
		}

		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sMonth.push_back(*iterI);
			iterI++;
		}

		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sDay.push_back(*iterI);
			iterI++;
		}
		break;
	case dateformat::yyyy_month_dd:
	case dateformat::yy_month_dd:
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sYear.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && !((*iterI >= 'a' && *iterI <= 'z') || (*iterI >= 'A' && *iterI <= 'Z')))
			iterI++;
		while (iterI != i_sValue.cend() && ((*iterI >= 'a' && *iterI <= 'z') || (*iterI >= 'A' && *iterI <= 'Z')))
		{
			sMonth.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sDay.push_back(*iterI);
			iterI++;
		}
		break;
	case dateformat::mm_dd_yy:
	case dateformat::mm_dd_yyyy:
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sMonth.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sDay.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sYear.push_back(*iterI);
			iterI++;
		}

		break;
	case dateformat::dd_mm_yy:
	case dateformat::dd_mm_yyyy:
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sDay.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sMonth.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sYear.push_back(*iterI);
			iterI++;
		}
		break;
	case dateformat::month_dd_yy:
	case dateformat::month_dd_yyyy:
		while (iterI != i_sValue.cend() && !((*iterI >= 'a' && *iterI <= 'z') || (*iterI >= 'A' && *iterI <= 'Z')))
		{
			sMonth.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sDay.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sYear.push_back(*iterI);
			iterI++;
		}
		break;
	case dateformat::dd_month_yy:
	case dateformat::dd_month_yyyy:
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sDay.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && !((*iterI >= 'a' && *iterI <= 'z') || (*iterI >= 'A' && *iterI <= 'Z')))
			iterI++;
		while (iterI != i_sValue.cend() && !((*iterI >= 'a' && *iterI <= 'z') || (*iterI >= 'A' && *iterI <= 'Z')))
		{
			sMonth.push_back(*iterI);
			iterI++;
		}
		while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sYear.push_back(*iterI);
			iterI++;
		}
		break;
	case dateformat::yyyymmdd:
		{
			size_t nCount = 0;
			while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9' && nCount < 4)
			{
				sYear.push_back(*iterI);
				iterI++;
				nCount++;
			}
			while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9' && nCount < 6)
			{
				sMonth.push_back(*iterI);
				iterI++;
				nCount++;
			}
			while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9' && nCount < 8)
			{
				sMonth.push_back(*iterI);
				iterI++;
				nCount++;
			}
		}
		break;
	case dateformat::yyyy_month:
		{
			while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
			{
				sYear.push_back(*iterI);
				iterI++;
			}
			while (iterI != i_sValue.cend() && !((*iterI >= 'a' && *iterI <= 'z') || (*iterI >= 'A' && *iterI <= 'Z')))
				iterI++;
			while (iterI != i_sValue.cend() && !((*iterI >= 'a' && *iterI <= 'z') || (*iterI >= 'A' && *iterI <= 'Z')))
			{
				sMonth.push_back(*iterI);
				iterI++;
			}
		}
		break;
	case dateformat::month_yyyy:
		{
			while (iterI != i_sValue.cend() && !((*iterI >= 'a' && *iterI <= 'z') || (*iterI >= 'A' && *iterI <= 'Z')))
			{
				sMonth.push_back(*iterI);
				iterI++;
			}
			while (iterI != i_sValue.cend() && (*iterI < '0' || *iterI > '9'))
				iterI++;
			while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
			{
				sYear.push_back(*iterI);
				iterI++;
			}
		}
		break;
	case dateformat::yyyy:
		while (iterI != i_sValue.cend() && (*iterI == ' ' || *iterI == '\t'))
			iterI++;
		while (iterI != i_sValue.cend() && *iterI >= '0' && *iterI <= '9')
		{
			sYear.push_back(*iterI);
			iterI++;
		}
		break;
	default:
	case dateformat::unspecified:
		break;
	}
//	printf("pdt: %s %s %s\n",sYear.c_str(),sMonth.c_str(),sDay.c_str());
	
	if (sYear.size() > 0)
		cRet._nYear = std::stoi(sYear);
	if (sMonth.size() > 0 && sMonth[0] >= '0' && sMonth[0] <= '9')	
		cRet._nMonth = std::stoi(sMonth);
	else if (sMonth.size() > 0)
		cRet._nMonth = interpretMonthEn(sMonth);
	
	if (sDay.size() > 0)
		cRet._nDay = std::stoi(sDay);
//	printf("pdt %i %i %i\n",cRet._nYear,cRet._nMonth, cRet._nDay);
	return cRet;	
}

	
void setDate(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sDate, dateformat i_eFormat)
{
	dateformat eFormat = i_eFormat;
	
	if (eFormat == dateformat::unspecified)
	{
		eFormat = parseDateStringFormat(i_sDate);
	}
	if (eFormat != dateformat::unspecified)
	{
		datedata cData = parseDateString(i_sDate,eFormat);
		std::string sDate = parseDate(cData._nDay,cData._nMonth,cData._nYear);
		if (!sDate.empty())
			i_pStmt->setDateTime(i_nParam,sDate);
		else
			i_pStmt->setNull(i_nParam,sql::DataType::DATE);
	}
	else
		i_pStmt->setNull(i_nParam,sql::DataType::DATE);
}


void setDate(sql::PreparedStatement * i_pStmt, size_t i_nParam, int i_nDay, int i_nMonth, int i_nYear)
{
	std::string sDate = parseDate(i_nDay, i_nMonth, i_nYear);
	if (!sDate.empty())
		i_pStmt->setDateTime(i_nParam,sDate);
	else
		i_pStmt->setNull(i_nParam,sql::DataType::DATE);
}

std::string parseTimeStringFormat(const std::string &i_sTime)
{
	std::string sRet;
	for (auto iterI = i_sTime.cbegin(); iterI != i_sTime.cend(); iterI++)
	{
		if (*iterI >= '0' && *iterI <= '9')
			sRet.push_back('n');
		else if (*iterI == '-' || *iterI == ':')
			sRet.push_back(':');
		else if (*iterI == '.')
			sRet.push_back('.');
		else
			sRet.push_back('?');
	}
	if (sRet[0] == ':')
		sRet[0] = '-';
	return sRet;
}

class timedata
{
public:
	int _nHour;
	int _nMinute;
	float _fSecond;
	timedata(void)
	{
		_nHour = -65536;
		_nMinute = -1;
		_fSecond = -1.0;
	}
};


timedata interpretTime(const std::string &i_sTime)
{
	timedata cRet;
	if (!i_sTime.empty())
	{
		int nSign = 1;
		int nHours = 0;
		int nMinutes = 0;
		int nSeconds = 0;
		int nHours_Idx = 0;
		int nMinutes_Idx = 0;
		int nSeconds_Idx = -1;
		int nDecimal_Idx = 0;
//printf("determine format\n");
		std::string sFormat = parseTimeStringFormat(i_sTime);
//printf("process format\n");
		if (sFormat.substr(0,10) == "-nnn:nn:nn")
		{
			nSign = -1;
			nHours_Idx = 1;
			nMinutes_Idx = 5;
			nSeconds_Idx = 8;
			nDecimal_Idx = 10;
		}
		else if (sFormat.substr(0,9) == "-nn:nn:nn")
		{
			nSign = -1;
			nHours_Idx = 1;
			nMinutes_Idx = 4;
			nSeconds_Idx = 7;
			nDecimal_Idx = 9;
		}
		else if (sFormat.substr(0,9) == "nnn:nn:nn")
		{
			nHours_Idx = 0;
			nMinutes_Idx = 4;
			nSeconds_Idx = 7;
			nDecimal_Idx = 9;
		}
		else if (sFormat.substr(0,8) == "nn:nn:nn")
		{
			nHours_Idx = 0;
			nMinutes_Idx = 3;
			nSeconds_Idx = 6;
			nDecimal_Idx = 8;
		}
		else if (sFormat.substr(0,7) == "-nnn:nn")
		{
			nSign = -1;
			nHours_Idx = 1;
			nMinutes_Idx = 5;
		}
		else if (sFormat.substr(0,6) == "-nn:nn")
		{
			nSign = -1;
			nHours_Idx = 1;
			nMinutes_Idx = 4;
		}
		else if (sFormat.substr(0,6) == "nnn:nn")
		{
			nHours_Idx = 0;
			nMinutes_Idx = 4;
		}
		else if (sFormat.substr(0,5) == "nn:nn")
		{
			nHours_Idx = 0;
			nMinutes_Idx = 3;
		}
		else if (sFormat.substr(0,5) == "n:nn")
		{
			nHours_Idx = 0;
			nMinutes_Idx = 2;
		}
		else if (sFormat.substr(0,5) == "-n:nn")
		{
			nSign = -1;
			nHours_Idx = 1;
			nMinutes_Idx = 3;
		}
		else if (sFormat.substr(0,5) == "-nnnn")
		{
			nSign = -1;
			nHours_Idx = 1;
			nMinutes_Idx = 3;
		}
		else if (sFormat.substr(0,4) == "nnnn")
		{
			nHours_Idx = 0;
			nMinutes_Idx = 2;
		}
		int nHour_Length = nMinutes_Idx - nHours_Idx;
		if (nHour_Length > 2)
			nHour_Length--;
		
//printf("get hours and minutes\n");
		cRet._nHour = nSign * std::stoi(i_sTime.substr(nHours_Idx,nHour_Length));
		cRet._nMinute = std::stoi(i_sTime.substr(nMinutes_Idx,2));
		if (nSeconds_Idx > 0)
		{
//printf("get seconds\n");
			cRet._fSecond = std::stof(i_sTime.substr(nSeconds_Idx,i_sTime.size() - 1));
		}
	}
	return cRet;
}
		
//printf("generate time string\n");
void setTime(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string &i_sTime)
{
	timedata cTime = interpretTime(i_sTime);
	if (cTime._nHour != -65536)
	{
		int nMinutes = cTime._nMinute;
		int nSeconds = cTime._fSecond;
		if (nMinutes < 0)
		{
			nMinutes = 0;
			nSeconds = 0;
		}
		else if (nSeconds < 0)
			nSeconds = 0;
	
		std::string sTime = parseTime(cTime._nHour, nMinutes, nSeconds);
		if (!sTime.empty())
			i_pStmt->setDateTime(i_nParam,sTime);
		else
			i_pStmt->setNull(i_nParam,sql::DataType::TIME);
	}
	else
		i_pStmt->setNull(i_nParam,sql::DataType::TIME);
}

void setTime(sql::PreparedStatement * i_pStmt, size_t i_nParam, int i_nHours, int i_nMinutes, int i_nSeconds)
{
	std::string sTime = parseTime(i_nHours, i_nMinutes, i_nSeconds);
	if (!sTime.empty())
		i_pStmt->setDateTime(i_nParam,sTime);
	else
		i_pStmt->setNull(i_nParam,sql::DataType::TIME);
}


std::string interpretDateTime(const std::string & i_sValue, dateformat i_eDate_Format)
{
	std::string sRet;
	std::string sTimePiece;
	std::string sDatePiece;
	std::string sRevised_Value;
	auto iterI = i_sValue.crbegin();
	std::stack<char> tTime;
	std::stack<char> tDate;
	
	while (iterI != i_sValue.crend() && (*iterI < '0' || *iterI > '9'))
		iterI++;
	while (iterI != i_sValue.crend() && ((*iterI >= '0' && *iterI <= '9') || (*iterI == ':')))
	{
		tTime.push(*iterI);
		iterI++;
	}
	while (iterI != i_sValue.crend() && (*iterI == ' ' && *iterI == '\t'))
		iterI++;
	while (iterI != i_sValue.crend())
	{
		tDate.push(*iterI);
		iterI++;
	}
	while (!tTime.empty())
	{
		sTimePiece.push_back(tTime.top());
		tTime.pop();
	}
	while (!tDate.empty())
	{
		sDatePiece.push_back(tDate.top());
		tDate.pop();
	}
	if (sTimePiece.find_first_of(':') == std::string::npos)
	{
		sDatePiece += " ";
		sDatePiece += sTimePiece;
		sTimePiece.clear();
	}
	//printf("dtt: %s---%s\n",sTimePiece.c_str(),sDatePiece.c_str());
	
	dateformat eFormat = i_eDate_Format;
	datedata cDate;
	
	if (eFormat == dateformat::unspecified)
	{
		eFormat = parseDateStringFormat(sDatePiece);
	}
	if (eFormat != dateformat::unspecified)
	{
		//printf("date format %i %s\n",eFormat,sDatePiece.c_str());
		cDate = parseDateString(sDatePiece,eFormat);
	}
	timedata cTime;
	if (sTimePiece.size() > 0)
	{
		//printf("it '%s'\n",sTimePiece.c_str());
		cTime = interpretTime(sTimePiece);
	}
//	printf("ppt\n");
	int nHour = cTime._nHour;
	int nMinute = cTime._nMinute;
	int nSecond = cTime._fSecond;
	if (nHour == -65536)
	{
		nHour = 23;
		nMinute = 59;
		nSecond = 59;
	}
	else if (nMinute < 0)
	{
		nMinute = 0;
		nSecond = 0;
	}
	else if (nSecond < 0)
		nSecond = 0;
	if (cDate._nYear > 0)
	{
		if (cDate._nMonth <= 0)
		{
			cDate._nMonth = 12;
			cDate._nDay = 31;
		}
		else if (cDate._nDay <= 0)
		{
			switch (cDate._nMonth)
			{
			case 1:
			case 3:
			case 5:
			case 7:
			case 8:
			case 10:
			case 12:
				cDate._nDay = 31;
				break;
			case 4:
			case 6:
			case 9:
			case 11:
				cDate._nDay = 30;
				break;
			case 2:
			default:
				if (cDate._nYear % 4 == 0 && (cDate._nYear % 100 != 0 || cDate._nYear % 400 == 0))
					cDate._nDay = 29;
				else
					cDate._nDay = 28;
				break;
			}
		}
		if (nHour == 24 && nMinute == 0 && nSecond == 0) // 24:00:00 is either midnight the next day, or end of current day. interpret as end of current day
		{
			nHour = 23;
			nMinute = 59;
			nSecond = 59;
		}
		//printf("pd: %i %i %i\n",		cDate._nDay,cDate._nMonth,cDate._nYear);	
		std::string sDate = parseDate(cDate._nDay,cDate._nMonth,cDate._nYear);
		std::string sTime = parseTime(nHour, nMinute, nSecond);
		sRet = sDate + " " + sTime;
	}
	return sRet;
}


void setDateTime(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sValue, dateformat i_eDate_Format)
{
	std::string sDateTime = interpretDateTime(i_sValue,i_eDate_Format);
	if (!sDateTime.empty())
		i_pStmt->setDateTime(i_nParam,sDateTime);
	else
		i_pStmt->setNull(i_nParam,sql::DataType::TIMESTAMP);
}


void setDateTime(sql::PreparedStatement * i_pStmt, size_t i_nParam, int i_nDay, int i_nMonth, int i_nYear, int i_nHours, int i_nMinutes, int i_nSeconds)
{
	std::string sDate = parseDate(i_nDay, i_nMonth, i_nYear);
	std::string sTime = parseTime(i_nHours, i_nMinutes, i_nSeconds);
	std::string sDateTime;
	if (!sDate.empty() && !sTime.empty())
	{
		sDateTime = sDate + " " + sTime;
		i_pStmt->setDateTime(i_nParam,sDateTime);
	}
	else
		i_pStmt->setNull(i_nParam,sql::DataType::TIMESTAMP);
}
void setBoolean(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString)
{
	if (!i_sString.empty())
		i_pStmt->setBoolean(i_nParam,i_sString == "1");
	else
		i_pStmt->setNull(i_nParam,sql::DataType::TINYINT);
}

void setChar(sql::PreparedStatement * i_pStmt, size_t i_nParam, char i_cValue)
{
	char sString[2] = {i_cValue,0};
	if (i_cValue != 0)
		i_pStmt->setString(i_nParam,std::string(sString));
	else
		i_pStmt->setNull(i_nParam,sql::DataType::VARCHAR);
}


