
function tooglecmptype()
{
	if(jQuery("#cmptype").val()=="thedate")
	{
	jQuery("#tooglecmptype_table").show();	
		
	}else{
		
		jQuery("#tooglecmptype_table").hide();
	}
}

function getDayList()
{
			var startday=jQuery("#thedateStart").val();
			if(jQuery("#cmptype").val()!="thedate")
			{
				return [startday];
			}
			
	  var endday=jQuery("#thedateEnd").val();
	var rtn=[startday,endday];

	  
	  if(jQuery("#week_choose").is(':checked'))
	  {
	  	rtn.push(parseDay(new Date(dayToTimestampDay(startday)-1000*3600*24*7)));
	  }
	  
	  if(jQuery("#pre_choose").is(':checked'))
	  {
	  	rtn.push(parseDay(new Date(dayToTimestampDay(startday)-1000*3600*24*1)));
	  }
	  
	  
	  var rrrtn=[];
	  
	  var minday="20140514";
	  
	  for(var i=0;i<rtn.length;i++)
		{
			if(rtn[i]>minday)
			{
				rrrtn.push(rtn[i]);
			}
		}
	  
	return rrrtn;
}

function getParseThedate() {
	return parseDay(new Date());
}

function getDayListRealtime()
{
		var daylist=getDayList();
		var rtn=[];
		var strday=getParseThedate();
		for(var i=0;i<daylist.length;i++)
		{
			if(daylist[i]==strday)
			{
				rtn.push(daylist[i]);
			}
		}
		
		return rtn;
}

function getDayListNonRealtime()
{
		var daylist=getDayList();
		var rtn=[];
		var strday=getParseThedate();
		for(var i=0;i<daylist.length;i++)
		{
			if(daylist[i]!=strday)
			{
				rtn.push(daylist[i]);
			}
		}
		
		return rtn;
}

function fetchPid(daylist,fn,failfn,tablename)
{
	if(daylist.length<=0)
	{
		fn([]);
		return ;
	}
	
	var newq=[];
	newq.push({"thedate":{"operate":6,"value":daylist}});
	if($("#pvtype").val()!="all"&&$("#pvtype").val()!="*")
	{
		if($("#pvtype").val()=="1")
		{
			newq.push({"pvtype":{"operate":1,"value":["1"]}});
		}else{
			newq.push({"pvtype":{"operate":2,"value":["1"]}});
		}
	}
	
	if($("#producttype").val()!="all"&&$("#producttype").val()!="*")
	{
			newq.push({"producttype":{"operate":1,"value":[$("#producttype").val()]}});
	}
	
		newq.push({"p4ptag":{"operate":1,"value":[$("#p4ptag").val()]}});
		newq.push({"searchtag":{"operate":1,"value":[$("#searchtag").val()]}});

	  	var requestparams={};
			requestparams.start=0;
			requestparams.rows=10000;
			requestparams.order="desc";
			requestparams.sort="count(*)";
			requestparams.groupby="pid";
			requestparams.project=tablename;
			requestparams.fl="pid,count(*)";
		  requestparams.q=JSON.stringify(newq);
		 
			$.post("/result.jsp",requestparams,
					function (data, textStatus){	
						
						if(data.code!="1")
						{
								alert("服务器异常，请稍后再试");
								failfn();
								return ;
						}
					  
					  var returnresult=[];
						var listtmp=data.data.docs;
						
											
						for(var i=0;i<listtmp.length;i++)
						{
							var item=listtmp[i];
							if(!item["pid"]||item["pid"].length<3)
							{
								continue;
							}
							returnresult.push(item["pid"]);
						}
						fn(returnresult);
				}, "json");
	
}

function fetchpidlist(fn,failfn)
{
	
				fn([$("#thepid").val()]);


return ;
	if($("#thepid").val()!="*"||($("#pvtype").val()=="all"&&$("#producttype").val()=="all")||($("#pvtype").val()=="*"&&$("#producttype").val()=="*"))
	{
			fn([$("#thepid").val()]);
			return ;
	}
	
	var pidresult={};

 	var callback=function()
  {
    	 if(pidresult["realtime_label"]&&pidresult["hour_label"])
    	 {
    	 	    	var pidobj={};
    	 	    	for(var i=0;i<pidresult["realtime"].length;i++)
    	 	    	{
    	 	    		pidobj[pidresult["realtime"][i]]=1;
    	 	    	}
    	 	    	for(var i=0;i<pidresult["hour"].length;i++)
    	 	    	{
    	 	    		pidobj[pidresult["hour"][i]]=1;
    	 	    	}
    	 	    	
    	 	    	var rtn=[];
    	 	    	for(var pid in pidobj)
    	 	    	{
    	 	    		
    	 	    		rtn.push(pid);
    	 	    	}
						fn(rtn);
    	}
    };
	
	var daylist=getDayListRealtime();
	var daylistNonRealtime=getDayList();
	
			fetchPid(daylist,function(data){
					pidresult["realtime"]=data;
			 	 	pidresult["realtime_label"]=1;
					callback();
				},failfn,"rpt_quanjing_p4p_k2_realtime");
				
			fetchPid(daylistNonRealtime,function(data){
					pidresult["hour"]=data;
					pidresult["hour_label"]=1;
					callback();
				},failfn,"rpt_quanjing_p4p_k2");	
}

function request_date_call(requestparams,fn,skey,daylist,failfn)
{
	
	var gfl=jQuery("#cmptype").val();
	if(gfl!="thedate")
	{
			

			
		 	var requestparamsnew={};
		 	for(var p in requestparams)
		 	{
		 			requestparamsnew[p]=requestparams[p];
		 	}

			var strfq=requestparams.q;
		
			requestparams.order="desc";
			requestparams.sort="sum(p4ppv)";
			requestparams.groupby=gfl;
			requestparams.fl=""+gfl+",sum(p4ppv)";
		  
		
		$.post("/result.jsp",requestparams,
					function (data, textStatus){	
						if(data.code!="1")
						{
								alert("服务器异常，请稍后再试");
								failfn();
								return ;
						}
						var gfllist=[];
						var listtmp=data.data.docs;
						for(var i=0;i<listtmp.length;i++)
						{
							var item=listtmp[i];
							if(!item[gfl]||item[gfl]=="_"||item[gfl]==""||item[gfl].length>30||item[gfl].indexOf("http")>=0||item[gfl].indexOf("/")>=0||item[gfl].indexOf("'")>=0||item[gfl].indexOf("\"")>=0||item[gfl].indexOf("(")>=0||item[gfl].indexOf("%")>=0)
							{
								continue;
							}
							
							gfllist.push(item[gfl]);
						}
						
							if(gfllist.length==0)
						{
								alert("找不到分类");
								failfn();
								return ;
						}
						
						
						var gsize=6;
						var reqcnt=gfllist.length/gsize;
						
						if(reqcnt>2)
						{
							reqcnt=2;
						}
						
						var callbackdata={};
						var callfn=function(data,kkk){
							callbackdata["r_"+kkk]=data;
							for(var i=0;i<reqcnt;i++)
							{
								if(!callbackdata["r_"+i])
								{
									return ;
								}
							}
							
							var merger={};
							for(var p in callbackdata)
							{
									for(var pp in callbackdata[p])
									{
										merger[pp]=callbackdata[p][pp];
									}
							}
							
							fn(merger,skey);

							
						};
						
						
							for(var i=0;i<reqcnt;i++)
							{
										var ttag=[]
										for(var j=(i*gsize);j<gfllist.length&&j<((i+1)*gsize);j++)
										{
											
											var fqnewpush={};
										fqnewpush[gfl]={"operate":1,"value":[gfllist[j]]};
											ttag.push(fqnewpush);
										}
										
										var fq=JSON.parse(strfq);

										fq.push({"subQuery":"true","filter":"OR","list":ttag});

		 							 requestparamsnew.q=JSON.stringify(fq);
									request_date_call_merger(requestparamsnew,callfn,i,daylist);
							}
						
				}, "json");
		  
		

	}else{
		request_date_call_merger(requestparams,fn,skey,daylist);
	}


}


function request_date_call_merger(requestparams,fn,skey,daylist)
{
	
			$.post("/result.jsp",requestparams,
					function (data, textStatus){	
						
						if(data.code!="1")
						{
								alert("服务器异常，请稍后再试");
								return ;
						}
						var returnresult={};
						var listtmp=data.data.docs;
						for(var i=0;i<listtmp.length;i++)
						{
							var item=listtmp[i];
							if(!item["miniute_5"]||item["miniute_5"].length!=4)
							{
								continue;
							}
							
							returnresult[item["thedate"]+"@"+item["miniute_5"]+"@"+item[jQuery("#cmptype").val()]]=item;
					
						}
						fn(returnresult,skey);
				}, "json");
}


function request_data(daylist,pidlist,fn,failfn,tablename)
{
	//if(jQuery("#cmptype").val()!="thedate"&&pidlist.length>0&&pidlist[0]=="*")
	//{
	//	alert("请输入pid");
	//	failfn();
	//	return ;
	//}

	if(daylist.length==0)
	{
		fn({});
		return ;
	}

	
			  var parsethedate=getParseThedate();

	
	var basefq=[];
	basefq.push({"thedate":{"operate":6,"value":daylist}});
	basefq.push({"p4ptag":{"operate":1,"value":[$("#p4ptag").val()]}});
	basefq.push({"searchtag":{"operate":1,"value":[$("#searchtag").val()]}});
	
	var newq=[];
	for(var i=0;i<basefq.length;i++)
	{
		newq.push(basefq[i]);
	}
	
		if($("#pvtype").val()!="all"&&$("#pvtype").val()!="*")
	{
			if($("#pvtype").val()=="1")
		{
			newq.push({"pvtype":{"operate":1,"value":["1"]}});
		}else{
			newq.push({"pvtype":{"operate":2,"value":["1"]}});
		}
	}
	
		if(pidlist.length>0&&pidlist[0]!="*")
{
		
			if(pidlist.length==1)
			{
				newq.push({"pid":{"operate":1,"value":pidlist}});
			}else{
				newq.push({"pid":{"operate":6,"value":pidlist}});
		}
	}
	
	
	var fl="thedate"
	if(jQuery("#cmptype").val()!="thedate")
	{
		fl="thedate,"+jQuery("#cmptype").val()
	}
	  	var requestparams={};
			requestparams.start=0;
			requestparams.rows=10000;
			requestparams.project=tablename;
			requestparams.order="asc";
			requestparams.sort="miniute_5";
			requestparams.groupby=""+fl+",miniute_5";
			requestparams.fl=""+fl+",miniute_5,sum(p4pprice),sum(p4pclick),sum(aclick),sum(apv),sum(p4ppv)";
		  requestparams.q=JSON.stringify(newq);
		  
		
		  
		    var savedata={};
		  var fncall=function(data,skey)
		  {
		  	
		  	savedata[skey]=data;
		  	var needcall=false;
		  	if(savedata["p4ppid"]&&savedata["refpid"])
		  	{
		  		for(var day_min in savedata["refpid"])
		  		{
			  			if(savedata["p4ppid"][day_min]){
			  			savedata["refpid"][day_min]["sum(p4pprice)"]=savedata["p4ppid"][day_min]["sum(p4pprice)"];
			  			savedata["refpid"][day_min]["sum(p4pclick)"]=savedata["p4ppid"][day_min]["sum(p4pclick)"];
			  			savedata["refpid"][day_min]["sum(p4ppv)"]=savedata["p4ppid"][day_min]["sum(p4ppv)"];
			  		}else{
			  			savedata["refpid"][day_min]["sum(p4pprice)"]=0;
		  			savedata["refpid"][day_min]["sum(p4pclick)"]=0;
		  			savedata["refpid"][day_min]["sum(p4ppv)"]=0;
			  			
			  		}
		  		}
		  		
		  		
		  		
		  		for(var day_min in savedata["p4ppid"])
		  		{

			  			if(!savedata["refpid"][day_min]){
			  				savedata["refpid"][day_min]=savedata["p4ppid"][day_min];
			  				savedata["refpid"][day_min]["sum(aclick)"]=0;
		  			  	savedata["refpid"][day_min]["sum(apv)"]=0;
			  			}
		  		}
		  		
		  		
		  		needcall=true;

		  	}
		  	
		  	if(savedata["p4ppid_empty"]&&savedata["refpid"])
		  	{
		  		if($("#pvtype").val()!="all"&&$("#pvtype").val()!="*")
		  		{
		  			for(var day_min in savedata["refpid"])
		  		{
		  			savedata["refpid"][day_min]["sum(p4pprice)"]=0;
		  			savedata["refpid"][day_min]["sum(p4pclick)"]=0;
		  			savedata["refpid"][day_min]["sum(p4ppv)"]=0;
		  		}
		  			
		  		}
		  			
		  			needcall=true;
		  	}
		  	
		  	if(!needcall)
		  	{
		  		return ;
		  	}
		  	
		  	 var returnresult={};
		  			 
		  			 for(var p in savedata["refpid"])
		  			 {
		  			 		var item=	savedata["refpid"][p];
		  			 		var thedatestr=item["thedate"]+"@"+item[jQuery("#cmptype").val()];
		  			 		if(jQuery("#cmptype").val()=="thedate")
		  			 		{
		  			 			thedatestr=item["thedate"];
		  			 			
		  			 		}
		  			 		
		  			 		if(!returnresult[thedatestr])
		  			 		{
		  			 		returnresult[thedatestr]=InitResultResult();
		  			 	}
							
									var ttts5=dayToTimestampDayHourMin(parsethedate,item["miniute_5"]);
									var price=parseFloat(item["sum(p4pprice)"])/100;
									returnresult[thedatestr]["p4pprice"].push([ttts5,parseFloat(parseFloat(price).toFixed(2))]);//parseFloat().toFixed(0)
									returnresult[thedatestr]["p4pclick"].push([ttts5,parseFloat(item["sum(p4pclick)"])]);
									returnresult[thedatestr]["aclick"].push([ttts5,parseFloat(item["sum(aclick)"])]);
									returnresult[thedatestr]["apv"].push([ttts5,parseFloat(item["sum(apv)"])]);
									returnresult[thedatestr]["p4ppv"].push([ttts5,parseFloat(item["sum(p4ppv)"])]);
									
									
									returnresult[thedatestr]["actr"].push([ttts5,makedoubleDiv(item["sum(aclick)"],item["sum(apv)"],100,1).toFixed(2)]);
									returnresult[thedatestr]["empc"].push([ttts5,makedoubleDivPrice(item["sum(p4pprice)"],item["sum(apv)"],1000,100).toFixed(2)]);
									returnresult[thedatestr]["rpm"].push([ttts5,makedoubleDivPrice(item["sum(p4pprice)"],item["sum(aclick)"],1000,100).toFixed(2)]);
									returnresult[thedatestr]["sctr"].push([ttts5,makedoubleDivPrice(item["sum(p4pclick)"],item["sum(aclick)"],100,1).toFixed(2)]);
									returnresult[thedatestr]["sppc"].push([ttts5,makedoubleDivPrice(item["sum(p4pprice)"],item["sum(p4pclick)"],1,100).toFixed(2)]);								
							
		  			 	
		  			}
					
						fn(returnresult);
		  };
		  
		  request_date_call(requestparams,fncall,"refpid",daylist,failfn);

		if($("#p4ppid").val()!="all"&&$("#p4ppid").val()!="*")
		{
			
				basefq.push({"p4ppid":{"operate":6,"value":$("#p4ppid").val().split(",")}});
						  requestparams.q=JSON.stringify(basefq);

		  	request_date_call(requestparams,fncall,"p4ppid",daylist,failfn);
		}else{
				fncall({},"p4ppid_empty");
		}
		 
}

function InitResultResult()
{
	
	
	return {"p4pprice":[],"p4pclick":[],"aclick":[],"apv":[],"p4ppv":[],"actr":[],"empc":[],"rpm":[],"sctr":[],"sppc":[]};
	
	
}


function makedoubleDiv(a,b,atimes,btimes)
{
	var aa=parseFloat(a);
	var bb=parseFloat(b);
	var aatimes=parseFloat(atimes);
	var bbtimes=parseFloat(btimes);
	if(bb>0&&bb>=aa)
	{
					return (aa*aatimes)/(bb*bbtimes);
	}
				
				return 0;
}

function makedoubleDivPrice(a,b,atimes,btimes)
{
	var aa=parseFloat(a);
	var bb=parseFloat(b);
	var aatimes=parseFloat(atimes);
	var bbtimes=parseFloat(btimes);
	if(bb>0)
	{
					return (aa*aatimes)/(bb*bbtimes);
	}
				
				return 0;
}

function timeseries(pppid)
{
	
	if(!pppid||pppid=="*")
	{
		$("#showpidlist").empty();
		$("#showpidlist").hide();
	}

	g_result={};
	g_result_thedate={};
	
	showload();

	fetchpidlist(function(data){		
		var pidlist=data;
		
		
		if(pidlist.length<=0)
		{
			alert("匹配不到PID，请重新查询");
			hideload();
		}
		
		
		if(pidlist.length>8000)
		{
				alert("匹配的PID太多,超过8000了，请进一步以缩小查询范围");
							hideload();

				return ;							
		}
		
				var daylist=getDayList();

	request_data(daylist,pidlist,function(data){
					searchData("hour",data);
	},hideload,"rpt_quanjing_p4p_k2");
				
						var daylistrealtime=getDayListRealtime();

	request_data(daylistrealtime,pidlist,function(data){
					searchData("realtime",data);
					},hideload,"rpt_quanjing_p4p_k2_realtime");
	}
	
	,hideload,pppid);
}