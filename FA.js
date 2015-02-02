/*

TODO don't load everything too late (add an handler ?)

$user('admin').id();
$group(40).pm({'subject': 'hello'});

// check if ok or not, if not fail
.done();
.fail();
.always();


$user('admin').remove();
$user('admin').pm({'subject': 'hello', 'message':'already said all I had to say'});
$user('admin').pm('hello', 'already said all I had to say');
$topic($rid).lock();
$topic($rid).lockToggle(); // ?
$topic($rid).split($post(50, 60, 70), "nouveau nom");

*/

$(function($){
  var _param = function(obj, modifier) { var buildParams = function(prefix, obj, traditional, add) { var name; if (jQuery.isArray(obj)) { jQuery.each(obj, function(i, v) { if (traditional || /\[\]$/.test(prefix)) { add(prefix, v); } else { buildParams(prefix + "[" + (typeof v === "object" ? i : "") + "]", v, traditional, add); } }); } else { if (!traditional && jQuery.type(obj) === "object") { for (name in obj) { buildParams(prefix + "[" + name + "]", obj[name], traditional, add); } } else { add(prefix, obj); } } }; var prefix, s = [], add = function(key, value) { var nvalue; if (modifier) { if ((nvalue = modifier(key, value)) === null) { return; } else if (nvalue !== undefined) value = nvalue } value = jQuery.isFunction(value) ? value(  ) : value == null ? "" : value; s[s.length] = _encodeURIComponent(key) + "=" + _encodeURIComponent(value); }; if (jQuery.isArray(obj) || obj.jquery && !jQuery.isPlainObject(obj)) { jQuery.each(obj, function() { add(this.name, this.value); }); } else { for (prefix in obj) { buildParams(prefix, obj[prefix], undefined, add); } } return s.join("&").replace(/%20/g, "+"); }, _encodeURIComponent = function(str) { if ($page.charset != "utf-8") { return encodeURIComponent(escape(str).replace(/%u[A-F0-9]{4}/g, function(x) { return "&#" + parseInt(x.substr(2), 16) + ";"; })).replace(/%25/g, "%"); } else { return encodeURIComponent(str); } }, _ud = _userdata || {};

  /**
   * $f.get_post_data - get data fields of a message
   * 
   * @post_id: message id
   * @callback: function called with data fields as parameters
   */
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
    $forum : {
      /**
       * $f.reply_topic - post a new reply to a topic
       *
       * @topic_id: topic id
       * @message: message content
       * @callback: function called with sended form page as parameter
       */
      /* TODO ADD OTHER FIELDS */
      post : function() {
        var required = ['subject', 'message'];
        var to_post = _args_to_modifier(arguments, required);
        for(var i=0; i<required.length; i++)
          if(!(required[i] in to_post)) return;
        $.each(this._d, function(_,v){
          $.post("/post", $.extend({'notify':0}, to_post, {'post':1,'mode':'newtopic', f:v}));
        })
      },
    },
    $topic : {

      /**
       * $f.reply_topic - post a new reply to a topic
       *
       * @topic_id: topic id
       * @message: message content
       * @callback: function called with sended form page as parameter
       */
      /* TODO ADD OTHER FIELDS */
      post : function() {
        var required = ['message'];
        var to_post = _args_to_modifier(arguments, required);
        for(var i=0; i<required.length; i++)
          if(!(required[i] in to_post)) return;
        $.each(this._d, function(_,v){
          $.post("/post", $.extend({'notify':0}, to_post, {'post':1,'mode':'reply', t:v}));
        })
      },
      /** $topic: .remove() - detete a topic
       *
       * @callback: function called with sended form page as parameter
       */
      remove: function(callback) {
        $.each(this._d, function(_,v){
          $.post("/modcp?tid=" + $user.tid, {t:v, mode:"delete", confirm:1}, callback);
        })
      },

      /**
       * $f.move_topic - move a topic to another forum
       *
       * @topic_id: id of topic
       * @forum_id: destination forum id or "trash"
       * @callback: function called with sended form page as parameter
       */
      move: function(forum_id, callback) {
        if(forum_id == "trash")
          $.get("/modcp?mode=trash&t=" + this._d[0] + "&tid=" + $user.tid, callback);
        else
          $.post("/modcp?tid=" + $user.tid, {tid:$user.tid, new_forum:"f" + forum_id, mode:"move", t:this._d[0], confirm:1}, callback);
        return this;
      },

      /**
       * $f.move_topic - move a topic to another forum
       *
       * @topic_id: id of topic
       * @forum_id: destination forum id or "trash"
       * @callback: function called with sended form page as parameter
       */
      merge: function(topic_id) {
        if(!topic_id && this._d.length) { topic_id = this._d.splice(-1)[0]; }
        $.each(this._d, function(_,v){
          $.post("/merge", {tid:$user.tid, from_topic: v, to_topic: topic_id, submit:1, f:1, confirm:1});
        });
        return this;
      },
      lock: function() {
        $.each(this._d, function(_,v){
          $.get("/modcp?mode=lock&t="+v+"&tid="+$user.tid)
        });
        return this;
      },
      unlock: function() {
        $.each(this._d, function(_,v){
          $.get("/modcp?mode=unlock&t="+v+"&tid="+$user.tid)
        });
        return this;
      },

      /**
       * $f.split_topic - split a topic
       *
       * @new_title: title of new topic
       * @new_forum_id: forum id of new topic
       * @posts_id: array with post to place in new topic
       * @split_beyond: true if all post following splitted ones must be splitted too
       * @old_topic_id: id of topic in which messages are currently
       * @callback: function called with sended form page as parameter
       */
      split : function(new_title, new_forum_id, posts_ids, split_beyond, callback) {
        if (typeof posts_ids != "object") posts_ids = [posts_ids];
        var data = {subject:new_title, new_forum_id:"f" + new_forum_id, post_id_list:posts_ids, t:this._d[0], mode:"split"};
        data["split_type_"+(split_beyond?"beyond":"all")]= 1;
        $.post("/modcp?tid=" + $user.tid, data, callback);
      }
    },
    $post: {
      /**
       * $f.delete_post - delete a message
       *
       * @post_id: id of message
       * @callback: function called with sended form page as parameter
       */
      remove: function(callback) {
        $.each(this._d, function(_,v){
          $.post("/post", {p:v, mode:"delete", confirm:""}, callback);
        })
      },
      /**
       * $post(post_id).change(new_message) - modify a message
       *
       * @post_id: id of message
       * @new_message: string with new_message
       * @modifier: function which receive each data field and can modify them for a new value (or undefined to remove field)
       */
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
      /**
       * $f.send_pm - send a private message
       *
       * @usernames: array with recipients usernames
       * @subject: subject
       * @message: message content
       * @callback: function called with sended form page as parameter
       */
      /* TODO ADD OTHER FIELDS */
      pm : function(message, callback) {
        $.post("/privmsg", _param({"username":this._d[0], subject:'[Aucun]', message:message, mode:"post", post:1}), callback);
      }
    }
  };

  $.each(m, function(k,v){
    window[k] = function() {
      var args = $.makeArray(arguments);
      if(args.length==1 && $.isArray(args[0])) args = args[0];
      return $.extend(window[k]||{}, v, {_d:args}) };
  });

  window["$page"] = window["$page"] || {};
  window["$user"] = window["$user"] || {};

  /**
   * $page.type - get type of current page
   * 
   * Return: topic, forum, index, category, empty string otherweise 
   */
  $page.type = function() {
    var p = location.pathname;
    if (/^\/t[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "topic";
    if (/^\/f[1-9][0-9]*(p[1-9][0-9]*)?-/.test(p)) return "forum";
    if ($("#i_icon_mini_index").parent().attr("href") == p) return "index";
    if (/^\/c[1-9][0-9]*-/.test(p)) return "category";
    return "";
  }();

  /**
   * $page.id - resource id of current page
   * 
   * Return: id of item showed in current page, 0 otherweise
   */
  $page.id = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tfc]([1-9][0-9]*)(p[1-9][0-9]*)?-/);
    if (!m) m = p.match(/^\/u([1-9][0-9]*)[a-z]*$/);
    if (!m) return 0;
    return+m[1];
  }();

  /**
   * $page.num - page number of current page
   * 
   * Return: page number or zero
   */
  $page.num = function() {
    var p = location.pathname;
    var m = p.match(/^\/[tf][1-9][0-9]*(p[1-9][0-9]*)-/);
    if (!m) return 0;
    return+m[1];
  }();

  /**
   * $page.charset - charset of current page
   *
   * return: forum charset in lowercase (e.g., utf-8, windows-1252, iso-8859-1)
   */
  $page.charset = (document.charset ? document.charset : document.characterSet).toUpperCase();

  /**
   * $user.tid - user temporary identifier
   *
   * Return: tid or empty string
   */
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
