#include <filesystem>
#include <iostream>
#include <fstream>
#include <string>
#include <vector>
#include <map>


class SFBentry
{
public:
	double radius;
	double surface_brightness;
	int kill; //?
	double err;
};

class DATentry
{
public:
	double radius;
	double Vobs;
	double Vobs_err; //?
	double Vgas;
	double Vdisk;
	double Vbul;
	double SBdisk;
	double SBbul;
};
class DATdata
{
public:
	double distance;
	std::vector<DATentry> vDAT;
};

class SFBdata
{
public:
	std::vector<SFBentry> vSFB;
};

	
class galaxy
{
public:
	std::vector<SFBdata> vSFB;
	std::vector<DATdata> vDAT;
};

void advance(char * line, char * & pCursor)
{
	if (pCursor != nullptr)
	{
		while (pCursor[0] != 0 && pCursor[0] != '\t' && pCursor[0] != ' ')
			pCursor++;
		while (pCursor[0] != 0 && (pCursor[0] == '\t' || pCursor[0] == ' '))
			pCursor++;
	}
}
int main(void)
{
	std::map<std::string,galaxy> mapData;
	
	std::filesystem::path pSFB = std::filesystem::path("/file.sfb").extension();
	std::filesystem::path pDAT = std::filesystem::path("/file.dat").extension();
	for(auto& file: std::filesystem::directory_iterator("./raw"))
	{
		FILE * fileIn = nullptr;
		if (file.path().extension() == pSFB)
		{
			printf("reading %s\n",file.path().c_str());
			fileIn = fopen(file.path().c_str(),"rt");
			char line[256];
			size_t nCount = 0;
			SFBdata cFileData;
			while (fgets(line,256,fileIn) == line)
			{
				if (nCount != 0 && line[0] >= '0' && line[0] <= '9') // skip header and final line
				{
					SFBentry cData;
					char * pCursor = line;
					cData.radius = atof(pCursor);advance(line,pCursor);
					cData.surface_brightness = atof(pCursor);advance(line,pCursor);
					cData.kill = atoi(pCursor);advance(line,pCursor);
					cData.err = atof(pCursor);
					cFileData.vSFB.push_back(cData);
				}
				nCount++;
			}
			std::string sGalaxy = file.path().stem();
			if (mapData.count(sGalaxy) == 0)
			{
				mapData[sGalaxy] = galaxy();
			}
			mapData[sGalaxy].vSFB.push_back(cFileData);
		}
		else if (file.path().extension() == pDAT)
		{
			printf("reading %s\n",file.path().c_str());
			fileIn = fopen(file.path().c_str(),"rt");
			char line[256];
			size_t nCount = 0;
			DATdata cFileData;
			while (fgets(line,256,fileIn) == line)
			{
				if (nCount != 0 && line[0] >= '0' && line[0] <= '9') // skip header and final line
				{
					DATentry cData;
					char * pCursor = line;
					cData.radius = atof(pCursor);advance(line,pCursor);
					cData.Vobs = atof(pCursor);advance(line,pCursor);
					cData.Vobs_err = atof(pCursor);advance(line,pCursor);
					cData.Vgas = atof(pCursor);advance(line,pCursor);
					cData.Vdisk = atof(pCursor);advance(line,pCursor);
					cData.Vbul = atof(pCursor);advance(line,pCursor);
					cData.SBdisk = atof(pCursor);advance(line,pCursor);
					cData.SBbul = atof(pCursor);advance(line,pCursor);

					cFileData.vDAT.push_back(cData);
				}
				else if (nCount == 0)
				{
					cFileData.distance = atof(&(line[13]));
				}
				nCount++;
			}
			std::string sFilename = file.path().stem();
			std::string sGalaxy = sFilename.substr(0,sFilename.size() - 7);
			if (mapData.count(sGalaxy) == 0)
			{
				mapData[sGalaxy] = galaxy();
			}
			mapData[sGalaxy].vDAT.push_back(cFileData);
		}
		if (fileIn != nullptr)
			fclose(fileIn);
	}
	
	FILE * fileOut = fopen("galaxyRotationData.js","wt");
	if (fileOut != nullptr)
	{
		fprintf(fileOut,"const galaxyData = {\n");
		auto iBegin = mapData.begin(); 
		auto iEnd = mapData.end();
		for (auto iterI = iBegin; iterI != iEnd; iterI++)
		{
			fprintf(fileOut,"\t\"%s\": {\n",iterI->first.c_str());
			fprintf(fileOut,"\t\t\"SFB\": [\n");
			{
				auto jBegin = iterI->second.vSFB.begin();
				auto jEnd = iterI->second.vSFB.end();
				for (auto iterJ = jBegin; iterJ != jEnd; iterJ++)
				{
					fprintf(fileOut,"\t\t\t[\n");
					auto kBegin = iterJ->vSFB.begin();
					auto kEnd = iterJ->vSFB.end();
					for (auto iterK = kBegin; iterK != kEnd; iterK++)
					{
						fprintf(fileOut,"\t\t\t\t{\n");
						fprintf(fileOut,"\t\t\t\t\t\"radius\": %.5f,\n",iterK->radius);
						fprintf(fileOut,"\t\t\t\t\t\"surfaceBrightness\": %.5f,\n",iterK->surface_brightness);
						fprintf(fileOut,"\t\t\t\t\t\"kill\": %i,\n",iterK->kill);
						fprintf(fileOut,"\t\t\t\t\t\"err\": %.5f\n",iterK->err);
						auto iterKNext = iterK;
						iterKNext++;
						if (iterKNext != kEnd)
							fprintf(fileOut,"\t\t\t\t},\n");
						else
							fprintf(fileOut,"\t\t\t\t}\n");
					}
					auto iterNext = iterJ;
					iterNext++;
					if (iterNext != jEnd)
						fprintf(fileOut,"\t\t\t],\n");
					else
						fprintf(fileOut,"\t\t\t]\n");
				}
			}
			fprintf(fileOut,"\t\t],\n");
			fprintf(fileOut,"\t\t\"DAT\": [\n");
			{
				auto jBegin = iterI->second.vDAT.begin();
				auto jEnd = iterI->second.vDAT.end();
				for (auto iterJ = jBegin; iterJ != jEnd; iterJ++)
				{
					fprintf(fileOut,"\t\t\t{\n");
					fprintf(fileOut,"\t\t\t\"distance\": %.5f,\n",iterJ->distance);
					fprintf(fileOut,"\t\t\t\"data\": [\n");
					auto kBegin = iterJ->vDAT.begin();
					auto kEnd = iterJ->vDAT.end();
					for (auto iterK = kBegin; iterK != kEnd; iterK++)
					{
						fprintf(fileOut,"\t\t\t\t{\n");
						fprintf(fileOut,"\t\t\t\t\t\"radius\": %.5f,\n",iterK->radius);
						fprintf(fileOut,"\t\t\t\t\t\"Vobs\": %.5f,\n",iterK->Vobs);
						fprintf(fileOut,"\t\t\t\t\t\"err\": %.5f,\n",iterK->Vobs_err);
						fprintf(fileOut,"\t\t\t\t\t\"Vgas\": %.5f,\n",iterK->Vgas);
						fprintf(fileOut,"\t\t\t\t\t\"Vdisk\": %.5f,\n",iterK->Vdisk);
						fprintf(fileOut,"\t\t\t\t\t\"Vbulge\": %.5f,\n",iterK->Vbul);
						fprintf(fileOut,"\t\t\t\t\t\"SBdisk\": %.5f,\n",iterK->SBdisk);
						fprintf(fileOut,"\t\t\t\t\t\"SBbulge\": %.5f,\n",iterK->SBbul);
						auto iterKNext = iterK;
						iterKNext++;
						if (iterKNext != kEnd)
							fprintf(fileOut,"\t\t\t\t},\n");
						else
							fprintf(fileOut,"\t\t\t\t}\n");
					}
					auto iterNext = iterJ;
					iterNext++;
					if (iterNext != jEnd)
						fprintf(fileOut,"\t\t\t]\n\t\t\t},\n");
					else
						fprintf(fileOut,"\t\t\t]\n\t\t\t}\n");
				}
			}
			fprintf(fileOut,"\t\t]\n");
			auto iterINext = iterI;
			iterINext++;
			if (iterINext != iEnd)
				fprintf(fileOut,"\t},\n");
			else
				fprintf(fileOut,"\t}\n");
		}
		fprintf(fileOut,"}\n");
		fclose(fileOut);
	}
	return 0;
}

