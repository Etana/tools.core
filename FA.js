var FA= {
  page:
  {
    type: function() {
      var p= location.pathname;
      if(/^\/t[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "viewtopic";
      if(/^\/f[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "viewforum"; 
      if($("#i_icon_mini_index").parent().attr("href")==p) return "index";
      if(/^\/c[1-9][0-9]*-/.test(p)) return "viewcategory";
      return "";
    }
  },
  user:
  {
    id: function(){
      return parseInt((my_getcookie('fa_'+location.hostname.replace(/\./g,'_')+'_data')||"0").replace(/.*s:6:"userid";(i:([0-9]+)|s:[0-9]+:"([0-9]+)");.*/,'$2$3'))
    },
    sid : function(){
      return my_getcookie('fa_'+location.hostname.replace(/\./g,'_')+'_sid')||""
    },
    tid:  function(){
      return tid=$("input[name=tid]:first").val() ||  ($("a[href*='&tid=']:first").attr("href")||"").replace(/^.*&tid=([a-z0-9]*)?.*$/,"$1");
    },
    aid: function(){
      return (my_getcookie('fa_'+location.hostname.replace(/\./g,'_')+'_data')||'').replace(/.*s:11:"autologinid";s:[0-9]+:"([0-9a-z]*)";.*$/,'$1')
    },
    name: function(){
      return ($('#i_icon_mini_logout').attr('title')||"").replace(/^.*? \[ (.*) \]$/,'$1')
    },
    rank: function(){
      if(user.logged())
      {
        if(user.admin()) return 3;
        if(user.mod()) return 2;
        return 1;
      }
      return 0;
    },
    logged: function(){
      return $("#logout").length==1;
    },
    admin: function(){
      return $("a[href='/admin/index.forum?part=admin&tid="+FA.user.tid()+"']").length==1;
    },
    mod:  function(){
      return $("a[href^='/modcp']:first").length==1;
    }
  },
  pm:
  {
    send: function(n,s,m,e){
      $.post("/privmsg",{username:n,subject:s,message:m,mode:"post",post:1});
    }
  },
  post:
  {
    remove: function(p,e) {
      $.post("/post",{p:p,mode:"delete",confirm:""},e);
    },
    get: function(p,e) {
      $.get('/post?p='+p+'&mode=editpost', function(d){
        var r= d.replace(/^[\s\S]*<textarea id="text_editor_textarea"[^>]*>([\s\S]*?)<\/textarea>.*[\s\S]*$/,'$1');
        if(r==d) e("");
        else e(r)
      })
    }
  },
  topic:
  {
    split: function(s,f,p,d,e){
      typeof p=="object" || p=[p];
      $.post("/modcp?tid="+FA.user.tid(),{subject:s,new_forum_id:"f"+f,split_type_all:1,post_id_list:p,f:d,mode:"split"},e);
      // t possible instead of f
    },
    split_beyond: function(s,f,p,d,e){
      typeof p=="object" || p=[p];
      $.post("/modcp?tid="+FA.user.tid(),{subject:s,new_forum_id:"f"+f,split_type_beyond:1,post_id_list:p,f:d,mode:"split"},e);
      // t possible instead of f
    },
    remove: function(t,e) {
      $.post("/modcp?tid="+FA.user.tid(),{ t:t, mode:"delete",confirm:1},e);
    },
    trash: function(t,e) {
      $.get("/modcp?mode=trash&t="+t+"&tid="+FA.user.tid(),e)
    },
    move: function(t,f,e) {
      $.post("/modcp?tid="+FA.user.tid(),{tid:FA.user.tid(),newforum:"f"+f,mode:"move",t:t,confirm:1},e);
    },
    reply: function(t,m,e) {
      $.post("/post",{subject:"",message:m,mode:"reply",t:t,post:1,notify:0},e);
    }
  }
};
