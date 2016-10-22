(function($) {
  if(!window.$fa || window.$fa.charset) return;

  var _get_forum_data = function(forum_id, callback) {
    if (callback) return $.get("/admin/index.forum?part=general&sub=general&mode=edit&tid=" + $fa.tid + "&fid=" + forum_id, function(p) {
      callback($('form[name="edit"]', p).serializeArray());
    });
  };
  var _get_post_data = function(post_id, callback) {
    if (callback) return $.get("/post?p=" + post_id + "&mode=editpost", function(p) {
      callback($('form[name="post"]', p).serializeArray());
    });
  };
  var _args_to_modifier = function(a, defaults) {
    var to_modify = {};
    if (a.length == 0) {
      return false;
    }

    for (var i = 0; i < defaults.length && i < a.length; i++) {
      if ($.isPlainObject(a[i]))
        break;
      to_modify[defaults[i]] = a[i];
    }
    if (a.length > i)
      if ($.isPlainObject(a[i]))
        $.extend(to_modify, a[i]);
    $.each(to_modify, function(k, v) {
      if (!$.isFunction(v)) to_modify[k] = function() {
        return v
      }
    });
    return to_modify;
  };
  var _bridge_post_deferred = function(c, d) {
    var ok = true;
    var m = c.match(/>([^<]*)<br \/><br \/><a href="\/viewtopic\?(?:start=([0-9]+)&amp;)?t=([0-9]+)&amp;topic_name#([0-9]+)">[^<]*<\/a><br \/><br \/><a href="\/f([0-9]+)-([^"]*)">/);
    if (!m) {
      var m = c.match(/>([^<]*)<br \/><br \/><a href="\/t([0-9]+)-([^"]*)">[^<]*<\/a><br [\\\/]><br [\\\/]><a href="\/f([0-9]+)-([^"]*)">/);
      if(!m) {
        var m = c.match(/>([^<]*)<br \/><br \/><a href="\/t([0-9]+)-([^"]*)"(?: class="gen")?>[^<]*<\/a>(?:<br [\\\/]><br [\\\/]><a href="(\/(?:forum)?)" class="gen">|<\/p>)/);
        if(!m) {
          var m = c.match(/>([^<]*)<br \/><br \/><a href="\/f([0-9]+)-([^"]*)">/) || c.match(/>([^<]*)<br \/><br \/><a href="\/privmsg\?folder=inbox">/) || c.match(/>([^<]*)<br \/><br \/><a href="\/u([0-9]+)">/) || c.match(/<\/h3><\/center><p>([^<]*)<\/p><\/div><h2>/)
          if(!m) {
            var ok= false;
            var m = c.match(/>([^<]*)<br \/><br \/><a href="\/viewtopic\?f&amp;t&amp;topic_name=topic">/)|| c.match(/(?: class="row1"><span class="gen">|<div class="main-content"><p class="center">|<p class="center" style="color: red;">|<div class="box-content error"><p>|<p class="center" style="color: red;"><font color="red">)((?:[^<]*(?:<br \/>)?)+)(?:<\/p>|<\/font><\/p>|<\/span>)/) || c.match(/(?:<h1 class="page-title">[^<]*<\/h1><p>|<div class="msg">|<\/h1><\/div><div class="main-content message"><p class="message">| align="center"><span class="gen">)([^<]*)(?:<\/p>|<\/div>|<\/span><\/td>)/) || [0, ""];
          }
        }
      };
    }
    if(!ok)  d.reject({ ok: ok, content: c, message: m[1].replace('<br />', "\n") });
    else {
     var ret = {ok:true, content:c, message:m[1], forum_id:parseInt(m.slice(-2,-1)[0]), forum_seo_name:m.slice(-1)[0], forum_url:'/f'+m.slice(-2).join('-')};
     switch(m.length){
      case 7:
        $.extend(ret, {page:parseInt(m[2]||0),topic_id:parseInt(m[3]),post_id:parseInt(m[4]),post_url: '/t'+m[3]+(m[2]?"p"+m[2]:"")+"-#"+m[4], topic_url: '/t'+m[3]+'-'}); break;
      case 6:
        $.extend(ret, {topic_id:parseInt(m[2]),topic_seo_name:m[3], topic_url: '/t'+m[2]+'-'+m[3]}); break;
      case 5:
        delete ret['forum_id']; delete ret['forum_seo_name']; delete ret['forum_url'];
        $.extend(ret, {topic_id:parseInt(m[2]),topic_seo_name:m[3], topic_url: '/t'+m[2]+'-'+m[3]}); break
      case 3:
        ret = {ok:true, content:c, message:m[1], user_id:parseInt(m[2])} 
      case 2:
        ret = {ok:true, content:c, message:m[1]} 
      }
      d.resolve(ret)
    }
  };

  var _get_forum_id = function(topic_id, forum_id) {
    if(forum_id) {
      var d = $.Deferred();
      d.resolve(window["$forum"](forum_id)); 
      return d;
    }
    else
      return window["$topic"](topic_id).forum()._p[0];
  }

  var _get_topic_id = function(post_id, topic_id) {
    if(topic_id) {
      var d = $.Deferred();
      d.resolve(window["$topic"](topic_id)); 
      return d;
    }
    else
      return window["$post"](post_id).topic()._p[0];
  }

  var $forum = function(){};

  /** $forum( forum_ids ).post( [subject [, message ]] [, object ] ) - post new topics */
  $forum.prototype.post= function() {
    var required = ['subject', 'message'];
    var to_post = _args_to_modifier(arguments, required);
    for (var i = 0; i < required.length; i++)
      if (!(required[i] in to_post)) return;
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      $.post("/post", _param($.extend({
        'notify': 0
      }, to_post, {
        'post': 1,
        'mode': 'newtopic',
        f: v
      })), function(c) {
        _bridge_post_deferred(c, d)
      });
      return d;
    });
    return this;
  };

  var $topic = function(){};

  /** $topic( topic_ids ).forum() - access topics forums ( via first parameter of done callback ) */
  $topic.prototype.forum = function(){
    this._p = $.map(this._d, function(v){
      var d = $.Deferred();
      $.get('/modcp?mode=move&t='+v+'&tid='+$fa.tid, function(c){
        var forum_id = parseInt($('form[method="post"] [name="f"]', c).val());
        if(forum_id>0) d.resolve($forum(forum_id));
        else d.reject();
      })
      return d;
    });
    return this;
  };

  /** $topic( topic_ids ).post( [message ] [, object ] ) - post a reply to topics */
  $topic.prototype.post = function() {
    var required = ['message'];
    var to_post = _args_to_modifier(arguments, required);
    for (var i = 0; i < required.length; i++)
      if (!(required[i] in to_post)) return;
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      $.post("/post", _param($.extend({
        'notify': 0
      }, to_post, {
        'post': 1,
        'mode': 'reply',
        t: v
      })), function(c) {
        _bridge_post_deferred(c, d)
      });
      return d;
    });
    return this;
  };
  /** $topic( topic_ids ).remove() - detete topics */
  $topic.prototype.remove= function() {
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      $.post("/modcp?tid=" + $fa.tid, {
        t: v,
        mode: "delete",
        confirm: 1
      }, function(c){
        _bridge_post_deferred(c, d)
      });
      return d;
    });
    return this;
  };
  /** $topic( topic_ids ).move( forum_id ) - move topics to a forum */
  $topic.prototype.move= function(forum_id) {
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      console.log(v);
      $.post("/modcp?tid=" + $fa.tid, {
        tid: $fa.tid,
        new_forum: "f" + forum_id,
        mode: "move",
        t: v,
        confirm: 1
      }, function(c){ _bridge_post_deferred(c, d)});
      return d;
    });
    return this;
  };
  /** $topic( topic_ids ).trash() - move topics to the trash forum */
  $topic.prototype.trash= function() {
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      $.get("/modcp?mode=trash&t=" + v + "&tid=" + $fa.tid, function(c){ _bridge_post_deferred(c, d)});
      return d;
    });
    return this;
  };
  /** $topic( topic_ids ).merge( [forum_id ] ) - merge topics into one */
  $topic.prototype.merge= function(forum_id) {
    var topic_id = this._d.slice(-1)[0];
    var dd = _get_forum_id(topic_id, forum_id); 
    this._p = $.map(this._d.slice(0,-1), function(v) {
      var d = $.Deferred();
      dd.done(function(f){  
        $.post("/merge", {
          tid: $fa.tid,
          from_topic: v,
          to_topic: topic_id,
          submit: 1,
          f: f._d[0],
          confirm: 1
        }, function(c){ _bridge_post_deferred(c, d) });
      });
      return d;
    });
    return this;
  };
  /** $topic( topic_ids ).lock() - lock topics */
  $topic.prototype.lock= function() {
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      $.get("/modcp?mode=lock&t=" + v + "&tid=" + $fa.tid, function(c){ _bridge_post_deferred(c, d) });
      return d;
    });
    return this;
  };
  /** $topic( topic_ids ).unlock() - unlock topics */
  $topic.prototype.unlock = function() {
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      $.get("/modcp?mode=unlock&t=" + v + "&tid=" + $fa.tid, function(c){ _bridge_post_deferred(c, d) });
      return d;
    });
    return this;
  };

  var $post = function(){};

  /** $post( post_ids ).topic().done(function(t){ }) - access posts topics ( via first parameter of done callback ) */
  $post.prototype.topic = function(){
    this._p = $.map(this._d, function(v){
      var d = $.Deferred();
      $.get('/post?p='+v+'&mode=quote', function(c){
        var topic_id = parseInt($('form[method="post"] [name="t"]', c).val());
        if(topic_id>0) d.resolve(window["$topic"](topic_id));
        else d.reject();
      })
      return d;
    });
    return this;
  };
  /** $post( post_ids ).forum().done(function(f){ }) - access posts forums ( via first parameter of done callback ) */
  $post.prototype.forum = function(){
    this._p = $.map(this._d, function(v){
      var d = $.Deferred();
      $.get('/post?p='+v+'&mode=quote', function(c){
        var topic_id = parseInt($('form[method="post"] [name="t"]', c).val());
        if(topic_id>0) {
          window["$topic"](topic_id).forum().done(function(f){d.resolve(f)}).fail(function(){d.reject()});
        }
        else d.reject();
      })
      return d;
    });
    return this;
  };
  /** $post( post_ids ).remove() - delete messages */
  $post.prototype.remove= function() {
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      $.post("/post", {
        p: v,
        mode: "delete",
        confirm: ""
      }, function(c){ _bridge_post_deferred(c, d) });
      return d;
    });
    return this;
  },
  /** $post( post_ids ).change( [message ] [, object ] ) - modify messages */
  $post.prototype.change= function() {
    var to_modify = _args_to_modifier(arguments, ['message']);
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      _get_post_data(v, function(f) {
        $.post("/post", _param(f, function(key, value) {
          if (key in to_modify) return to_modify[key](value)
        }) + "&post=1", function(c) {
          _bridge_post_deferred(c, d)
        });
      });

      return d;
    })
    return this;
  },
  /** $post( post_ids ).split( new_title [, new_forum_id [, topic_id [, beyond ]]] ) - split posts into a new topic */
  $post.prototype.split = function(new_title, new_forum_id, topic_id, beyond) {
    if(!this._d) return this;
    var d = $.Deferred();
    var post_list = this._d;
    _get_topic_id(this._d[0], topic_id).done(function(topic) {
      _get_forum_id(topic._d[0], new_forum_id).done(function(new_forum){ 
        var data = {
          subject: new_title,
          new_forum_id: "f" + new_forum._d[0],
          post_id_list: post_list,
          t: topic._d[0],
          mode: "split"
        };
        data["split_type_" + (beyond ? "beyond" : "all")] = 1;
        $.post("/modcp?tid=" + $fa.tid, _param(data), function(c){ _bridge_post_deferred(c, d) });
      });
    });
    this._p = [d];
    return this;
  };
  /** $post( post_ids ).split_beyond( new_title [, new_forum_id [, topic_id ]] ) - split posts beyond givens one into a new topic */
  $post.prototype.split_beyond= function(new_title, new_forum_id, topic_id) {
    return this.split(new_title, new_forum_id, topic_id, true);
  };

  var $user = function(){};

  /** $user( usernames ).pm( [subject [, message ]] [, object ] ) - send private messages */
  $user.prototype.pm = function() {
    var required = ['subject', 'message'];
    var to_post = _args_to_modifier(arguments, required);
    for (var i = 0; i < required.length; i++)
      if (!(required[i] in to_post)) return;
    var d = $.Deferred();
    $.post("/privmsg", _param($.extend(to_post, { "username": this._d, mode: "post", post: 1 })), function(c){ _bridge_post_deferred(c,d)});
    this._p = [d];
    return this;
  };
  /** $user( user_ids ).ban( [num_days [, reason ]] [, object ] ) - ban users */
  $user.prototype.ban = function() {
    // nombre de jour et raison
    var to_post = _args_to_modifier(arguments, ['ban_user_date', 'ban_user_reason']);
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      $.post('/modcp?tid=' + $fa.tid, _param($.extend(to_post, {
        tid: $fa.tid,
        confirm: 1,
        mode: 'ban',
        user_id: v
      })), function(c){ _bridge_post_deferred(c,d)})
      return d;
    });
    return this;
  };
  /** $user( user_ids ).unban() - unban users */
  $user.prototype.unban= function() {
    var d = $.Deferred();
    $.post('/admin/index.forum?part=users_groups&sub=users&mode=ban_control&extended_admin=1&tid=' + $fa.tid, {
      users_to_unban: this._d,
      unban_users: 1
    }, function(c){ _bridge_post_deferred(c,d)})
    this._p = [d];
    return this;
  };


  var $chat = function(){};
  
  /** $chat.post( [message ] [, object ] ) - unban users */
  $chat.prototype.post = function() {
    var required = ['message'];
    var to_post = _args_to_modifier(arguments, required);
    for (var i = 0; i < required.length; i++)
      if (!(required[i] in to_post)) return;
    $.post("/chatbox/actions.forum", $.extend(to_post, {
      method: "send",
      archive: 0
    }));
  };

  var to_extend = {'$user':$user, '$post':$post, '$topic':$topic, '$forum':$forum, '$chat': $chat};

  var arg_to_array = function(arg){
    var args = $.makeArray(arg); 
    if (args.length == 1 && $.isArray(args[0])) args = args[0];
    if (args.length == 1 && $.type(args[0])=="object" && "_d" in args[0]) args = args[0]._d;
    return args
  };

  $.each(to_extend, function(k, v) {
    $.each(['always', 'done', 'fail'], function(_, m){
      v.prototype[m] = function(arg) { $.each(this._p, function(_, p) { p[m](arg) }); return this };
    });
    v.prototype['add'] = function() {
      var args = arg_to_array(arguments);
      $.merge(this._d, args);
      this._d = $.grep(this._d, function(v, i){return i==$.inArray(v, this._d)&&v}.bind(this));
      return this;
    };
    v.prototype['not'] = function() {
      var args = arg_to_array(arguments);
      this._d = $.grep(this._d, function(v){return -1==$.inArray(v, args)});
      return this;
    };
    v.prototype['toggle'] = function() {
      var args = arg_to_array(arguments);
      $.each(args, function(_, v){
        var pos = $.inArray(v, this._d);
        if(pos==-1) if(v) this._d.push(v);
        else this._d.splice(pos, pos+1)
      }.bind(this));
      return this
    };
    v.prototype['empty'] = function() {
      this._d = [];
      return this
    };
    window[k] = function() {
      var ret = new v();
      ret._d = [];
      ret.add.apply(ret, arguments);
      ret._p = [];
      return ret;
    };
  });
  window["$chat"] = window["$chat"]();

  var get_page_type = function() {
    var p = location.pathname;
    if (/^\/t[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "topic";
    if (/^\/f[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "forum";
    if ($("#i_icon_mini_index").parent().attr("href") == p) return "index";
    if (/^\/c[1-9][0-9]*-/.test(p)) return "category";
    var qs = p + location.search;
    var m = qs.match(/\/modcp\?mode=([^&]+)/);
    return m ? m[1] : "";
  };

  /** $fa.pagetype -  type of current page */
  $fa.pagetype = get_page_type(); 
  $(function(){ $fa.pagetype = get_page_type(); });

  /** $fa.resid - resource id of current page */
  $fa.resid = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tfc]([1-9][0-9]*)(p[1-9][0-9]*)?-/);
    if (!m) m = p.match(/^\/u([1-9][0-9]*)[a-z]*$/);
    if (!m) return 0;
    return +m[1];
  }();

  /** $fa.pagenum - page number of current page */
  $fa.pagenum = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tf][1-9][0-9]*(p[1-9][0-9]*)-/);
    if (!m) return 0;
    return +m[1].substr(1);
  }();

  /** $page.charset - charset of current page */
  $fa.charset = (document.charset ? document.charset : document.characterSet).toLowerCase();

  var get_tid = function(){ return $("input[name=tid]:first").val() || ($("a[href*='&tid=']:first").attr("href") || "").replace(/^.*&tid=([a-z0-9]*)?.*$/, "$1"); };

  pid = function(p) { if(p===undefined) return pid(location.search); if($.type(p)=="object") return pid($(p).attr('href')); return parseInt((p.match(/p=(\d+)&/)||[0,0])[1]) };
  var tid = function(p) { if(p===undefined) return tid(location.pathname); if($.type(p)=="object") return tid($(p).attr('href')); return parseInt((p.match(/\/t(\d+)(?:p\d+)?-/)||[0,0])[1]) };


  /** $fa.tid - user temporary identifier */
  $fa.tid = get_tid(); 
  $(function(){ $fa.tid = get_tid(); });

  $fa.userid = parseInt(((my_getcookie('fa_'+location.host.replace(/\./g,'_')+'_data')||'').match(/"userid";(?:s:[0-9]+:"|i:)([0-9]+)/)||[0,-1])[1]); // id of user 
  $fa.isguest = ($fa.userid == -1); // is user a guest?

  $fa.post = function(p) {
    if(p===undefined) return $fa.post(location.search)||parseInt($('form[method="post"] input[name="p"]').val())||0;
    if($.type(p)=="object") return $fa.post($(p).attr('href'));
    return parseInt((p.match(/p=(\d+)&/)||[0,0])[1])
  };
  $fa.thread = function(p) {
    if(p===undefined) return $fa.thread(location.pathname);
    if($.type(p)=="object") return $fa.thread($(p).attr('href'));
    return parseInt((p.match(/\/t(\d+)(?:p\d+)?-/)||[0,0])[1]);
  };
  $fa.replace = function(replacements, str) {
    for(var search in replacements){
      str = str.replace(new RegExp('\\{'+search+'\\}','gi'),replacements[search])
    }
  };

  var update_user_data = function(){
    var _ud = _userdata || {};

    $fa.username = _ud["username"]; // user username (or Anonymous)
    $fa.isadmin = _ud["user_level"] == 1; // is user an admin?
    $fa.ismod = _ud["user_level"] > 0; // is user a moderator?
    $fa.lang = _ud["user_lang"]; // user langage (fr for french, ...)
    $fa.avatar = _ud["avatar"]; // user avatar
    $fa.numpost = _ud["user_posts"]; // user number of post
    $fa.numpm = _ud["user_nb_privmsg"]; // user number of private message
    $fa.numrep = _ud["point_reputation"]; // user number of rep points
    $fa.rank = window["_lang"] ? _lang["rank_title"] : ""; // rank of the user
    $fa.pagetitle = $('h1').text() || $fa.pagetitle || document.title.replace(/^.*? - /, '');
  };
  update_user_data();
  $(function(){ update_user_data() });

  var _param=function(b){var p=function buildParams(b,a,c){var d;if(jQuery.isArray(a))jQuery.each(a,function(a,e){/\[\]$/.test(b)?c(b,e):p(b+"["+("object"===typeof e&&null!=e?a:"")+"]",e,c)});else if("object"===jQuery.type(a))for(d in a)p(b+"["+d+"]",a[d],c);else c(b,a)},a,c=[],d=function(a,b){var d=jQuery.isFunction(b)?b():b;c[c.length]=_encode(a)+"="+_encode(null==d?"":d)};for(a in b)p(a,b[a],d);return c.join("&")}, _encode=function(b){return"utf-8"!=$fa.charset?encodeURIComponent(escape(b).replace(/%u[A-F0-9]{4}/g,function(a){return"&#"+parseInt(a.substr(2),16)+";"})).replace(/%25/g,"%"):encodeURIComponent(b)};

})(jQuery);
