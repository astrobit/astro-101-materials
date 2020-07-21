#pragma once
#include <mysql-cppconn/mysql/jdbc.h>
#include <string>

enum class dateformat {
	unspecified,
	yyyy_mm_dd,
	yy_mm_dd,
	yyyy_month_dd,
	yy_month_dd,
	mm_dd_yy,
	mm_dd_yyyy,
	dd_mm_yy,
	dd_mm_yyyy,
	month_dd_yy,
	month_dd_yyyy,
	dd_month_yy,
	dd_month_yyyy,
	yyyymmdd,
	yyyy_month,
	yyyy,
	month_yyyy };

class datedata
{
public:
	int _nYear;
	int _nMonth;
	int _nDay;
	
	datedata(void)
	{
		_nYear = -50000;
		_nMonth = 0;
		_nDay = 0;
	}
};

extern int interpretMonthEn(const std::string & i_sString);
extern void setString(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString);
extern void setInt(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString);
extern void setInt(sql::PreparedStatement * i_pStmt, size_t i_nParam, int i_nValue);
extern void setFloat(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString);
extern void setFloat(sql::PreparedStatement * i_pStmt, size_t i_nParam, const float & i_fData);
extern void setDouble(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString);
extern void setDouble(sql::PreparedStatement * i_pStmt, size_t i_nParam, const double & i_fData);
extern std::string parseDate(int i_nDay, int i_nMonth, int i_nYear);
extern std::string parseTime(int i_nHours, int i_nMinutes, int i_nSeconds);
extern void setDate(sql::PreparedStatement * i_pStmt, size_t i_nParam, int i_nDay, int i_nMonth, int i_nYear);
extern void setDate(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sDate, dateformat i_eFormat = dateformat::unspecified);
extern void setTime(sql::PreparedStatement * i_pStmt, size_t i_nParam, int i_nHours, int i_nMinutes, int i_nSeconds);
extern void setTime(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string &i_sTime);
extern void setDateTime(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sValue, dateformat i_eDate_Format = dateformat::unspecified);
extern void setDateTime(sql::PreparedStatement * i_pStmt, size_t i_nParam, int i_nDay, int i_nMonth, int i_nYear, int i_nHours, int i_nMinutes, int i_nSeconds);
extern void setBoolean(sql::PreparedStatement * i_pStmt, size_t i_nParam, const std::string & i_sString);
extern void setChar(sql::PreparedStatement * i_pStmt, size_t i_nParam, char i_cValue);


extern std::string interpretDateTime(const std::string & i_sValue, dateformat i_eDate_Format = dateformat::unspecified);
extern dateformat parseDateStringFormat(const std::string & i_sValue);
extern datedata parseDateString(const std::string & i_sValue, dateformat i_eFormat);

