var FA;

(function(){
  FA= {
    util:
    {
      ver: 1,
      tid:  function(){
        return tid=$("input[name=tid]:first").val() ||  ($("a[href*='&tid=']:first").attr("href")||"").replace(/^.*&tid=([a-z0-9]*)?.*$/,"$1");
      }
    },
    page:
    {
      info:
      {
        type: function() {
          var p= location.pathname;
          if(/^\/t[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "viewtopic";
          if(/^\/f[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "viewforum"; 
          if($("#i_icon_mini_index").parent().attr("href")==p) return "index";
          if(/^\/c[1-9][0-9]*-/.test(p)) return "viewcategory";
          return "";
        }
      }
    },
    user:
    {
      info:
      {
        rank: function(){
          if(user.info.logged())
          {
            if(user.info.admin()) return 3;
            if(user.info.mod()) return 2;
            return 1;
          }
          return 0;
        },
        logged: function(){
          return $("#logout").length==1;
        },
        admin: function(){
          return $("a[href='/admin/index.forum?part=admin&tid="+util.tid()+"']").length==1;
        },
        mod:  function(){
          return $("a[href^='/modcp']:first").length==1;
        }
      }
    },
    pm:
    {
      do:
      {
        send: function(n,s,m,e){
          $.post("/privmsg",{username:n,subject:s,message:m,mode:"post",post:1});
        }
      }
    },
    post:
    {
      do:
      {
        delete: function(p,e) {
          $.post("/post",{p:p,mode:"delete",confirm:""},e);
        }
      }
    },
    topic:
    {
      do:
      {
        split: function(s,f,p,d,e){
          $.post("/modcp?tid="+util.tid(),{subject:s,new_forum_id:"f"+f,split_type_all:1,post_id_list:p,tid:util.tid(),f:d,mode:"split"},e);
          // t possible instead of f
        },
        split_beyond: function(s,f,p,d,e){
          $.post("/modcp?tid="+util.tid(),{subject:s,new_forum_id:"f"+f,split_type_beyond:1,post_id_list:p,tid:util.tid(),f:d,mode:"split"},e);
          // t possible instead of f
        },
        delete: function(t,f,e) {
          $.post("/modcp?tid="+util.tid(),{f:f, t:t, tid: util.tid(), mode:"delete",confirm:""},e);
        },
        trash: function(t,e) {
          $.get("/modcp?mode=trash&t="+t+"&tid="+util.tid(),e)
        },
        move: function(t,f,e) {
          $.post("/modcp?tid="+util.tid(),{tid:util.tid(),newforum:"f"+f,mode:"move",t:t,confirm:1},e);
        },
        reply: function(t,m,e) {
          $.post("/post",{subject:"",message:m,mode:"reply",t:t,post:1,notify:0},e);
        }
      }
    }
  };
  var post= FA.post, topic= FA.topic, util= FA.util, user=FA.user, pm= FA.pm;
})();
