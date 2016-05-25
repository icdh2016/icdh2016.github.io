文件下载（3G）：http://ssdd.u.qiniudn.com/ftb.tar.gz

小区全球识别码（Cell Global Identity，CGI）:
	格式CGI的格式为：MCC－MNC－LAC－CI。
	MCC（Mobile Country Code）：三个十进制数组成，取值范围为十进制的000 ～ 999。
	MNC（Mobile Network Code）：二个十进制数，取值范围为十进制的00～99。
	LAC（Location Area Code）：范围为1～65535。
	CI（Cell Identity）：范围为0～65535。
	
LAC:location area code 位置区码 
CI: CGI/SAI。记录用户的当前位置信息，用户从BSS接入则为CGI，用户从RNS接入为SAI。其中CGI＝MCC＋MNC＋LAC＋CI，SAI＝MCC＋MNC＋LAC＋SAC。
STEP1：根据需求分析某个时段ftbBssRanSession表，分析数据加载到临时视图
create view vwAnalyse_1350284638607 as select * from ftbBssRanSession99_2012030208
 
STEP2：统计各个小区的寻呼情况，并将结果加载到临时表
select top 10000 number(*) as rowNumber ,
	cast('2012-03-02 08:00:00.000' as varchar(32)) as 开始时间,
	cast('2012-03-02 09:00:00.000' as varchar(32)) as 结束时间 ,
	(
		case when (intFirstCi>0 and intEndCI=0) or (intDuration < intSMSLen and intFirstCi<>0 and intEndCI <>0 )
			then intFirstLAC 
		else intEndLAC
		end
		) as LAC , 
	(
		case when (intFirstCi>0 and intEndCI=0) or (intDuration < intSMSLen and intFirstCi<>0 and intEndCI<>0)
			then intFirstCi 
			else intEndCI end
		) as CI ,
	cast (0 as bigint) as 寻呼总次数 ,
	count(1) as 寻呼失败总次数 ,
	sum(case when intFirstCi=intEndCi then 1 else 0 end) as 寻呼失败前后CI一致次数 ,
	case when 寻呼失败总次数 >0 
		then 1.0*寻呼失败前后CI一致次数/寻呼失败总次数 
		else 0 end 
		as 寻呼失败前后CI一致占比 ,
	cast (0 as bigint) as TCH信道拥塞次数 ,
	cast(0 as float) as 寻呼失败率 ,
	count(distinct vcCalledImsi) as 寻呼失败用户数量 ,
	(
		case when 寻呼失败总次数>0 then 1.0*寻呼失败用户数量/寻呼失败总次数 else 0 end
		) as 寻呼失败用户占比
into #tmpAnalyse_1350284638652
from vwAnalyse_1350284638607 t1
where (( t1.dtSTime >= '2012-03-02 08:00:00.000' and t1.dtSTime < '2012-03-02 09:00:00.000' ))
	and intSessType in (17) and (intFirstCI<>0 or intEndCi<>0) and (intSMSLen<=30*60 or intDuration<=30*60 )
group by LAC , CI;
 
select intFirstLac ,
	intFirstCi ,
	sum(case when biKpiFlag&power(2,30)>0 then 1 else 0 end) as 寻呼响应总次数 , 
	sum(case when biKpiFlag&power(2,22)>0 or biKpiFlag&power(2,25)>0 
		then 1.0 else 0.0 end
		) as TCH信道拥塞次数 
into #tmpAnalyse_1350284638652_u 
from vwAnalyse_1350284638607 t1 
where (( t1.dtSTime >= '2012-03-02 08:00:00.000' and t1.dtSTime < '2012-03-02 09:00:00.000' )) and intFirstCI<>0 
group by intFirstLac , intFirstCi;
 
STEP3：关联两表更新相关的一些需要显示的字段信息，返回分析结果
update #tmpAnalyse_1350284638652 a 
	set a.TCH信道拥塞次数=b.TCH信道拥塞次数, 
	a.寻呼总次数=a.寻呼失败总次数+b.寻呼响应总次数
from #tmpAnalyse_1350284638652_u b 
where a.CI=b.intFirstCI and a.LAC=b.intFirstLac;
 
update #tmpAnalyse_1350284638652 
	set 寻呼失败率= 
		case when 寻呼总次数>0 
		then 1.0*寻呼失败总次数/寻呼总次数 
		else 0 end
 
select * from #tmpAnalyse_1350284638652
 
drop table #tmpAnalyse_1350284638652