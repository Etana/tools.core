/*

TODO don't load everything too late (add an handler ?)


TODO check if ok or not, if not fail
.done();
.fail();
.always();

*/

$(function($){
  var _param = function(obj, modifier) { var buildParams = function(prefix, obj, traditional, add) { var name; if (jQuery.isArray(obj)) { jQuery.each(obj, function(i, v) { if (traditional || /\[\]$/.test(prefix)) { add(prefix, v); } else { buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add); } }); } else { if (!traditional && jQuery.type(obj) === "object") { for (name in obj) { buildParams(prefix + "[" + name + "]", obj[name], traditional, add); } } else { add(prefix, obj); } } }; var prefix, s = [], add = function(key, value) { var nvalue; if (modifier) { if ((nvalue = modifier(key, value)) === null) { return; } else if (nvalue !== undefined) value = nvalue } value = jQuery.isFunction(value) ? value(  ) : value == null ? "" : value; s[s.length] = _encodeURIComponent(key) + "=" + _encodeURIComponent(value); }; if (jQuery.isArray(obj) || obj.jquery && !jQuery.isPlainObject(obj)) { jQuery.each(obj, function() { add(this.name, this.value); }); } else { for (prefix in obj) { buildParams(prefix, obj[prefix], undefined, add); } } return s.join("&").replace(/%20/g, "+"); }, _encodeURIComponent = function(str) { if ($page.charset != "utf-8") { return encodeURIComponent(escape(str).replace(/%u[A-F0-9]{4}/g, function(x) { return "&#" + parseInt(x.substr(2), 16) + ";"; })).replace(/%25/g, "%"); } else { return encodeURIComponent(str); } }, _ud = _userdata || {};

  var _get_forum_data = function(forum_id, callback) {
    callback && $.get("/admin/index.forum?part=general&sub=general&mode=edit&tid="+$user.tid+"&fid="+forum_id, function(p) {
      callback($('form[name="edit"]', p).serializeArray());
    });
  };
  var _get_post_data = function(post_id, callback) {
    callback && $.get("/post?p=" + post_id + "&mode=editpost", function(p) {
      callback($('form[name="post"]', p).serializeArray());
    });
  };
  var _args_to_modifier = function(a, defaults) { 
    var to_modify = {};
    if(a.length==0) { return false; }
 
    for(var i=0; i<defaults.length && i<a.length; i++) {
      if($.isPlainObject(a[i]))
        break;
      to_modify[defaults[i]] = a[i];
    }
    if(a.length > i)
      if($.isPlainObject(a[i]))
        $.extend(to_modify, a[i]);
    $.each(to_modify,function(k,v){
      if(!$.isFunction(v)) to_modify[k] = function(){return v}
    });
    return to_modify;
  };

  var m = {
    /* TODO remove forum : /admin/index.forum?part=general&sub=general&mode=edit&fid=c3&extended_admin=0&tid=d4b2551cb9d6ebf0393ffdea678a3a23 {'fid', update:1,move:-2,mode:delete} */
    $forum : {

      /** $forum(forum_id).post(subject, message) - post a new topic */
      post : function() {
        var required = ['subject', 'message'];
        var to_post = _args_to_modifier(arguments, required);
        for(var i=0; i<required.length; i++)
          if(!(required[i] in to_post)) return;
        $.each(this._d, function(_,v){
          $.post("/post", _param($.extend({'notify':0}, to_post, {'post':1,'mode':'newtopic', f:v})));
        })
      },
      /** $forum(forum_id).change(name, desc) - edit forum configuration */
      change : function() {
        var to_modify = _args_to_modifier(arguments, ['name', 'desc']);
        if(to_modify) $.each(this._d, function(_,v){
          if($.type(v)!=="string" || v[0]!="c")
            v = "f"+v;
          _get_forum_data(v, function(f) {
            $.post("/admin/index.forum?part=general&sub=general&mode=edit&fid="+v+"&tid="+$user.tid, _param(f, function(key,value){
              if(key in to_modify)return to_modify[key](value)
            }) + "&update=1");
          });
        })
      }
    },
    $topic : {
      /** $topic(topic_id).post(message) - post a reply to a topic */
      post : function() {
        var required = ['message'];
        var to_post = _args_to_modifier(arguments, required);
        for(var i=0; i<required.length; i++)
          if(!(required[i] in to_post)) return;
        var def = $.Deferred();
        $.each(this._d, function(_,v){
          $.post("/post", _param($.extend({'notify':0}, to_post, {'post':1,'mode':'reply', t:v})), function(c){ 
            //x.indexOf('<a href="/viewtopic?t=')
            // <a href="/viewtopic?t=1&amp;topic_name#20">Cliquez ici pour voir votre message</a><br /><br /><a href="/f4-yeah">Cliquez ici pour retourner au forum</a>
            if($('h1', c).next().find('a[href^="/viewtopic?"]').attr('href')) def.resolve(c);
            else def.reject(c);
          });
        });
        return def;
      },
      /** $topic(topic_id).remove() - detete a topic */
      remove: function(callback) {
        $.each(this._d, function(_,v){
          $.post("/modcp?tid=" + $user.tid, {t:v, mode:"delete", confirm:1});
        })
      },
      /** $topic(topic_id).move(forum_id) - move a topic to a forum */
      move: function(forum_id, callback) {
        $.each(this._d, function(_,v){
          $.post("/modcp?tid=" + $user.tid, {tid:$user.tid, new_forum:"f" + forum_id, mode:"move", t:this._d[0], confirm:1}, callback);
        })
      },
      /** $topic(topic_id).trash(forum_id) - move a topic to the trash forum */
      trash: function(callback) {
        $.each(this._d, function(_,v){
          $.get("/modcp?mode=trash&t=" + v + "&tid=" + $user.tid, callback);
        })
      },
      /** $topic(topic_id).merge(topic_id) - merge a topic onto another one */
      merge: function(topic_id) {
        if(!topic_id && this._d.length) { topic_id = this._d.splice(-1)[0]; }
        $.each(this._d, function(_,v){
          $.post("/merge", {tid:$user.tid, from_topic: v, to_topic: topic_id, submit:1, f:1, confirm:1});
        });
      },
      /** $topic(topic_id).lock() - lock a topic */
      lock: function() {
        $.each(this._d, function(_,v){
          $.get("/modcp?mode=lock&t="+v+"&tid="+$user.tid)
        });
      },
      /** $topic(topic_id).unlock() - unlock a topic */
      unlock: function() {
        $.each(this._d, function(_,v){
          $.get("/modcp?mode=unlock&t="+v+"&tid="+$user.tid)
        });
      },

      /** $topic(topic_id).split(new_title, new_forum_id, posts_ids, split_beyond) - split a topic */
      split : function(new_title, new_forum_id, posts_ids, split_beyondk) {
        if (!$.isArray(posts_ids)) posts_ids = [posts_ids];
        var data = {subject:new_title, new_forum_id:"f" + new_forum_id, post_id_list:posts_ids, t:this._d[0], mode:"split"};
        data["split_type_"+(split_beyond?"beyond":"all")]= 1;
        $.post("/modcp?tid=" + $user.tid, _param(data));
      }
    },
    $post: {
      /** $post(post_id).remove() - delete a message */
      remove: function(callback) {
        $.each(this._d, function(_,v){
          $.post("/post", {p:v, mode:"delete", confirm:""}, callback);
        })
      },
      /** $post(post_id).change(message) - modify a message */
      change : function() {
        var to_modify = _args_to_modifier(arguments, ['message']);
        if(to_modify) $.each(this._d, function(_,v){
          _get_post_data(v, function(f) {
            $.post("/post", _param(f, function(key,value){
              if(key in to_modify)return to_modify[key](value)
            }) + "&post=1");
          });
        })
      }
    },
    $user: {
      /** $user(username).pm(subject, message) - send a private message */
      pm : function(message) {
        var required = ['subject', 'message'];
        var to_post = _args_to_modifier(arguments, required);
        for(var i=0; i<required.length; i++)
          if(!(required[i] in to_post)) return;
        $.post("/privmsg", _param($.extend(to_post, {"username":this._d, mode:"post", post:1})));
      },
      /** $user(user_id).ban(num_days, reason) - ban a user */
      ban : function() {
        // nombre de jour et raison
        var to_post = _args_to_modifier(arguments, ['ban_user_date', 'ban_user_reason']);
        $.each(this._d, function(_,v){
          $.post('/modcp?tid='+$user.tid, _param($.extend(to_post, {tid:$user.tid,confirm:1,mode:'ban', user_id:9})))
        })
      },
      /** $user(user_id).unban() - unban a user */
      unban: function() {
        $.post('/admin/index.forum?part=users_groups&sub=users&mode=ban_control&extended_admin=1&tid='+$user.tid, {users_to_unban:this._d, unban_users:1})
      }
    }
  };
  
  window["$chat"] = window["$chat"] || {};

  $chat.post = function(message){
    var required = ['message'];
    var to_post = _args_to_modifier(arguments, required);
    for(var i=0; i<required.length; i++)
      if(!(required[i] in to_post)) return;
    $.post("/chatbox/actions.forum", $.extend(to_post, {method:"send", archive:0}));
  };

  $.each(m, function(k,v){ window[k] = function() { var args = $.makeArray(arguments); if(args.length==1 && $.isArray(args[0])) args = args[0]; return $.extend(window[k]||{}, v, {_d:args,_t:k}) }; });

  window["$page"] = window["$page"] || {};
  window["$user"] = window["$user"] || {};

  /** $page.type -  type of current page */
  $page.type = function() {
    var p = location.pathname;
    if (/^\/t[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "topic";
    if (/^\/f[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "forum";
    if ($("#i_icon_mini_index").parent().attr("href") == p) return "index";
    if (/^\/c[1-9][0-9]*-/.test(p)) return "category";
    return "";
  }();

  /** $page.id - resource id of current page */
  $page.id = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tfc]([1-9][0-9]*)(p[1-9][0-9]*)?-/);
    if (!m) m = p.match(/^\/u([1-9][0-9]*)[a-z]*$/);
    if (!m) return 0;
    return+m[1];
  }();

  /** $page.num - page number of current page */
  $page.num = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tf][1-9][0-9]*(p[1-9][0-9]*)-/);
    if (!m) return 0;
    return+m[1];
  }();

  /** $page.charset - charset of current page */
  $page.charset = (document.charset ? document.charset : document.characterSet).toUpperCase();

  /** $user.tid - user temporary identifier */
  $user.tid = $("input[name=tid]:first").val() || ($("a[href*='&tid=']:first").attr("href") || "").replace(/^.*&tid=([a-z0-9]*)?.*$/, "$1");

  $user.id    = _ud["user_id"];             // id of user
  $user.name  = _ud["username"];            // user username (or Anonymous)
  $user.guest = !_ud["session_logged_in"];  // is user a guest?
  $user.admin = _ud["user_level"] == 1;     // is user an admin?
  $user.mod   = _ud["user_level"] > 0;      // is user a moderator?
  $user.lang  = _ud["lang"];                // user langage (fr for french, ...)
  $user.avatar    = _ud["avatar"];          // user avatar
  $user.num_post  = _ud["user_posts"];      // user number of post
  $user.num_pm    = _ud["user_nb_privmsg"]; // user number of private message
  $user.num_reputation  = _ud["point_reputation"];  // user number of rep points

});
