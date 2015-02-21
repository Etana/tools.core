(function($) {
  var _param = function(obj, modifier) { var buildParams = function(prefix, obj, traditional, add) { var name; if (jQuery.isArray(obj)) { jQuery.each(obj, function(i, v) { if (traditional || /\[\]$/.test(prefix)) { add(prefix, v); } else { buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add); } }); } else { if (!traditional && jQuery.type(obj) === "object") { for (name in obj) { buildParams(prefix + "[" + name + "]", obj[name], traditional, add); } } else { add(prefix, obj); } } }; var prefix, s = [], add = function(key, value) { var nvalue; if (modifier) { if ((nvalue = modifier(key, value)) === null) { return; } else if (nvalue !== undefined) value = nvalue } value = jQuery.isFunction(value) ? value() : value == null ? "" : value; s[s.length] = _encodeURIComponent(key) + "=" + _encodeURIComponent(value); }; if (jQuery.isArray(obj) || obj.jquery && !jQuery.isPlainObject(obj)) { jQuery.each(obj, function() { add(this.name, this.value); }); } else { for (prefix in obj) { buildParams(prefix, obj[prefix], undefined, add); } } return s.join("&").replace(/%20/g, "+"); }, _encodeURIComponent = function(str) { if ($page.charset != "utf-8") { return encodeURIComponent(escape(str).replace(/%u[A-F0-9]{4}/g, function(x) { return "&#" + parseInt(x.substr(2), 16) + ";"; })).replace(/%25/g, "%"); } else { return encodeURIComponent(str); } };

  var _get_forum_data = function(forum_id, callback) {
    if (callback) return $.get("/admin/index.forum?part=general&sub=general&mode=edit&tid=" + u.tid + "&fid=" + forum_id, function(p) {
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
      $.get('/modcp?mode=move&t='+v+'&tid='+u.tid, function(c){
        var forum_id = parseInt($('form[method="post"] [name="f"]', c).val());
        if(forum_id>0) d.resolve(window["$forum"](forum_id));
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
      $.post("/modcp?tid=" + u.tid, {
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
      $.post("/modcp?tid=" + u.tid, {
        tid: u.tid,
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
      $.get("/modcp?mode=trash&t=" + v + "&tid=" + u.tid, function(c){ _bridge_post_deferred(c, d)});
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
          tid: u.tid,
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
      $.get("/modcp?mode=lock&t=" + v + "&tid=" + u.tid, function(c){ _bridge_post_deferred(c, d) });
      return d;
    });
    return this;
  };
  /** $topic( topic_ids ).unlock() - unlock topics */
  $topic.prototype.unlock = function() {
    this._p = $.map(this._d, function(v) {
      var d = $.Deferred();
      $.get("/modcp?mode=unlock&t=" + v + "&tid=" + u.tid, function(c){ _bridge_post_deferred(c, d) });
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
      if(callback)
        d.done(callback);
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
        $.post("/modcp?tid=" + u.tid, _param(data), function(c){ _bridge_post_deferred(c, d) });
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
      $.post('/modcp?tid=' + u.tid, _param($.extend(to_post, {
        tid: u.tid,
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
    $.post('/admin/index.forum?part=users_groups&sub=users&mode=ban_control&extended_admin=1&tid=' + u.tid, {
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

  $.each(to_extend, function(k, v) {
    $.each(['always', 'done', 'fail'], function(_, m){
      v.prototype[m] = function(arg) { $.each(this._p, function(_, p) { p[m](arg) }); return this };
    });
    window[k] = function() {
      var args = $.makeArray(arguments);
      if (args.length == 1 && $.isArray(args[0])) args = args[0];
      var ret = new v(args);
      ret._d = args;
      ret._p = [];
      return ret;
    };
  });
  window["$chat"] = window["$chat"]();
  delete window["$chat"]._d;
  delete window["$chat"]._p;

  window["$page"] = window["$page"] || {};
  var u = window["$user"];

  var get_page_type = function() {
    var p = location.pathname;
    if (/^\/t[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "topic";
    if (/^\/f[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "forum";
    if ($("#i_icon_mini_index").parent().attr("href") == p) return "index";
    if (/^\/c[1-9][0-9]*-/.test(p)) return "category";
    return "";
  };

  /** $page.type -  type of current page */
  $page.type = get_page_type(); 
  $(function(){ $page.type = get_page_type(); });

  /** $page.id - resource id of current page */
  $page.id = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tfc]([1-9][0-9]*)(p[1-9][0-9]*)?-/);
    if (!m) m = p.match(/^\/u([1-9][0-9]*)[a-z]*$/);
    if (!m) return 0;
    return +m[1];
  }();

  /** $page.num - page number of current page */
  $page.num = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tf][1-9][0-9]*(p[1-9][0-9]*)-/);
    if (!m) return 0;
    return +m[1];
  }();

  /** $page.charset - charset of current page */
  $page.charset = (document.charset ? document.charset : document.characterSet).toLowerCase();

  var get_tid = function(){ return $("input[name=tid]:first").val() || ($("a[href*='&tid=']:first").attr("href") || "").replace(/^.*&tid=([a-z0-9]*)?.*$/, "$1"); };

  /** u.tid - user temporary identifier */
  u.tid = get_tid(); 
  $(function(){ u.tid = get_tid(); });

  u.id = parseInt(((my_getcookie('fa_'+location.host.replace(/\./g,'_')+'_data')||'').match(/"userid";(?:s:[0-9]+:"|i:)([0-9]+)/)||[0,-1])[1]); // id of user 
  u.guest = (u.id == -1); // is user a guest?

  var update_user_data = function(){
    var _ud = _userdata || {};

    u.login = _ud["username"]; // user username (or Anonymous)
    u.admin = _ud["user_level"] == 1; // is user an admin?
    u.mod = _ud["user_level"] > 0; // is user a moderator?
    u.lang = _ud["user_lang"]; // user langage (fr for french, ...)
    u.avatar = _ud["avatar"]; // user avatar
    u.num_post = _ud["user_posts"]; // user number of post
    u.num_pm = _ud["user_nb_privmsg"]; // user number of private message
    u.num_reputation = _ud["point_reputation"]; // user number of rep points
    u.rank = window["_lang"] ? _lang["rank_title"] : ""; // rank of the user
    $page.title = $('h1').text() || $page.title || document.title.replace(/^.*? - /, '');
  };
  update_user_data();
  $(function(){ update_user_data() });
  
})(jQuery);
