var TC= {
	tid				: function() {
		return $("input[name=tid]:first").val() ||  ($("a[href*='&tid=']:first").attr("href")||"").replace(/^.*&tid=([a-z0-9]*)?.*$/,"$1")	
	},
	pdelete		: function(p,e) {
		$.post("/post",{p:p,mode:"delete",confirm:""},e);
	},
	tdelete		: function(t,f,e) {
		$.post("/modcp?tid="+TC.tid(),{f:f, t:t, tid: TC.tid(), mode:"delete",confirm:""},e);
	},
	trash			: function(t,e) {
		$.get("/modcp?mode=trash&t="+t+"&tid="+TC.tid(),e)
	},
	move			: function(t,f,e) {
		$.post("/modcp?tid="+TC.tid(),{tid:TC.tid(),new_forum:"f"+f,mode:"move",t:t,confirm:1},e);
	},
};
